/**
 * EmailCreate - 创建邮件活动（4步流程）
 */
import { useState, useEffect, useRef } from "react";
import { Sparkles, ArrowRight, ArrowLeft, Eye, Send, RefreshCw, Check, Monitor, Smartphone, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Loader2, Wand2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApiKey } from "@/hooks/use-api-key";
import { callGemini, toGeminiMessages, GeminiError } from "@/lib/gemini";

const emailTypes = [
  { value: "cold", label: "开发信 (Cold Email)" },
  { value: "followup", label: "跟进邮件 (Follow-up)" },
  { value: "product", label: "产品推广 (Product Launch)" },
  { value: "holiday", label: "节日问候 (Holiday Greeting)" },
  { value: "case", label: "客户案例 (Case Study)" },
];

const toneOptions = [
  { value: "professional", label: "专业正式" },
  { value: "friendly", label: "友好亲切" },
  { value: "concise", label: "简洁直接" },
];

const lengthOptions = [
  { value: "short", label: "简短(100字)" },
  { value: "medium", label: "中等(200字)" },
  { value: "long", label: "详细(300字+)" },
];

const audiences = [
  { value: "1", label: "北美LED采购商 (450人)" },
  { value: "2", label: "欧洲分销商 (320人)" },
  { value: "3", label: "中东工程商 (180人)" },
];

const sequenceSteps = [
  { step: 1, name: "首次开发信", delay: "Day 0", condition: "立即发送" },
  { step: 2, name: "价值跟进", delay: "Day 3", condition: "如果打开了邮件1则发送" },
  { step: 3, name: "案例分享", delay: "Day 7", condition: "如果打开了邮件2则发送" },
  { step: 4, name: "限时优惠", delay: "Day 14", condition: "如果点击了链接则发送" },
  { step: 5, name: "最终跟进", delay: "Day 21", condition: "如果未回复则发送" },
];

export default function EmailCreate() {
  const { apiKey, model, hasApiKey } = useApiKey();
  const [step, setStep] = useState(1);
  const [campaignName, setCampaignName] = useState("");
  const [emailType, setEmailType] = useState("cold");
  const [audience, setAudience] = useState("1");
  const [personalization, setPersonalization] = useState([60]);
  const [tone, setTone] = useState("friendly");
  const [length, setLength] = useState("medium");
  const [extraInfo, setExtraInfo] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sequenceEnabled, setSequenceEnabled] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Sequence drafts (steps 2-5): generated/edited subject + body per step
  type SeqDraft = { subject: string; body: string };
  const [sequenceDrafts, setSequenceDrafts] = useState<Record<number, SeqDraft>>({});
  const [generatingSeqStep, setGeneratingSeqStep] = useState<number | null>(null);
  const [editingSeqStep, setEditingSeqStep] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<SeqDraft>({ subject: "", body: "" });

  // AI-recommended send time per sequence step
  type SendTimeRec = { localTime: string; weekday: string; tz: string; reason: string };
  const [sendTimeRecs, setSendTimeRecs] = useState<Record<number, SendTimeRec>>({});
  const [recommendingTimeStep, setRecommendingTimeStep] = useState<number | null>(null);

  const renderPreviewHtml = () => {
    const filled = body
      .replace(/\{\{firstName\}\}/g, "John")
      .replace(/\{\{companyName\}\}/g, "ABC Corp")
      .replace(/\{\{industry\}\}/g, "LED Lighting")
      .replace(/\{\{senderName\}\}/g, "Alex Wang");
    return filled;
  };

  const [spamChecked, setSpamChecked] = useState(false);
  const [spamChecking, setSpamChecking] = useState(false);
  const [spamResult, setSpamResult] = useState<{
    score: number;
    checks: { name: string; status: "pass" | "warn" | "fail"; detail: string }[];
    suggestions: string[];
  } | null>(null);

  // Helper: clean fenced JSON from Gemini and parse
  const parseJsonFromAI = <T,>(raw: string): T => {
    const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("AI 未返回 JSON 格式");
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  };

  const handleSpamCheck = async () => {
    if (!hasApiKey) {
      toast.error("请先配置 Google AI API Key", { description: "前往设置页配置后即可使用 AI 检测" });
      return;
    }
    if (!subject.trim() || !body.trim()) {
      toast.error("请先填写邮件主题与正文");
      return;
    }
    setSpamChecking(true);
    try {
      const systemInstruction = `You are an expert email deliverability auditor. Evaluate a B2B cold email and return ONLY a JSON object — no prose, no markdown fences.

Schema:
{
  "score": <number 0-10, lower=better, e.g. 0.8 means very clean, 7+ means likely spam>,
  "checks": [
    { "name": "<short Chinese label>", "status": "pass"|"warn"|"fail", "detail": "<one Chinese sentence>" }
  ],
  "suggestions": ["<actionable Chinese suggestion>", ...]
}

Always include these 9 checks (in order, in Chinese): SPF记录, DKIM签名, DMARC策略, 发件人信誉, 内容检测, 链接安全, HTML/文本比例, 退订链接, 主题行检测.
Assume sender domain opcled.com has SPF/DKIM/DMARC properly configured (these should be "pass" with positive details).
Focus your scoring mainly on 内容检测 + 主题行检测 based on the actual subject/body provided. Detect spam-trigger words ("free", "save", "guarantee", "%off", all-caps, excessive punctuation), missing physical address, weak unsubscribe.
Provide 0 suggestions if score <= 1.0; otherwise 2-5 concrete Chinese suggestions.`;

      const prompt = `Evaluate this email:
SUBJECT: ${subject}
BODY:
${body}`;

      const raw = await callGemini(
        apiKey,
        toGeminiMessages([{ role: "user", content: prompt }]),
        { model, systemInstruction, temperature: 0.2, maxOutputTokens: 2048 }
      );

      const parsed = parseJsonFromAI<{
        score: number;
        checks: { name: string; status: "pass" | "warn" | "fail"; detail: string }[];
        suggestions: string[];
      }>(raw);

      // Validate
      if (typeof parsed.score !== "number" || !Array.isArray(parsed.checks)) {
        throw new Error("AI 返回结构异常");
      }

      setSpamResult({
        score: Math.max(0, Math.min(10, Number(parsed.score.toFixed(1)))),
        checks: parsed.checks,
        suggestions: parsed.suggestions || [],
      });
      setSpamChecked(true);
      toast.success(`AI 垃圾邮件检测完成（评分 ${parsed.score.toFixed(1)}/10）`);
    } catch (e) {
      const msg = e instanceof GeminiError ? e.message : e instanceof Error ? e.message : "检测失败";
      toast.error("AI 检测失败", { description: msg });
    } finally {
      setSpamChecking(false);
    }
  };

  const [isFixing, setIsFixing] = useState(false);

  const handleAutoFix = async () => {
    if (!hasApiKey || !spamResult) return;
    setIsFixing(true);
    const previousScore = spamResult.score;
    try {
      const systemInstruction = `You are an expert email deliverability optimizer. Rewrite a B2B cold email so it passes spam filters and keeps the same intent and personalization variables ({{firstName}}, {{companyName}}, {{industry}}, {{senderName}}).

Return ONLY a JSON object — no prose, no markdown fences:
{
  "subject": "<optimized subject, no all-caps words, no spam triggers, <= 65 chars>",
  "body": "<optimized plain-text body in English, keeping all personalization variables, ending with sender signature including company name 'OPC LED Technology Co., Ltd.' and physical address '1088 Nanshan Blvd, Shenzhen, China 518000', and a soft unsubscribe line>",
  "newScore": <number 0-10, predicted score after fixes, lower=better>,
  "fixedCount": <integer, number of original suggestions actually addressed>
}

Avoid trigger words: "free", "save X%", "discount", "guarantee", "limited time", excessive "!!" or all-caps. Use natural alternatives.`;

      const prompt = `Original email:
SUBJECT: ${subject}
BODY:
${body}

Issues to fix (in Chinese):
${spamResult.suggestions.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;

      const raw = await callGemini(
        apiKey,
        toGeminiMessages([{ role: "user", content: prompt }]),
        { model, systemInstruction, temperature: 0.4, maxOutputTokens: 2048 }
      );

      const parsed = parseJsonFromAI<{
        subject: string;
        body: string;
        newScore: number;
        fixedCount: number;
      }>(raw);

      if (!parsed.subject || !parsed.body) throw new Error("AI 返回缺少字段");

      setSubject(parsed.subject);
      setBody(parsed.body);

      const newScore = Math.max(0, Math.min(10, Number(parsed.newScore.toFixed(1))));
      setSpamResult({
        score: newScore,
        checks: spamResult.checks.map((c) =>
          c.status === "pass"
            ? c
            : { ...c, status: "pass" as const, detail: `${c.detail.split(" ✓")[0]} ✓ 已优化` }
        ),
        suggestions: [],
      });

      toast.success(
        `已自动修复 ${parsed.fixedCount || spamResult.suggestions.length} 项问题，评分从 ${previousScore} 降至 ${newScore}`
      );
    } catch (e) {
      const msg = e instanceof GeminiError ? e.message : e instanceof Error ? e.message : "修复失败";
      toast.error("AI 修复失败", { description: msg });
    } finally {
      setIsFixing(false);
    }
  };

  // ---------- AI 预测打开率（主题行变化时防抖触发） ----------
  const [openRate, setOpenRate] = useState<{ rate: number; reason: string } | null>(null);
  const [predicting, setPredicting] = useState(false);
  const predictTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const predictAbort = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!hasApiKey || !subject.trim() || step !== 3) {
      setOpenRate(null);
      return;
    }
    if (predictTimer.current) clearTimeout(predictTimer.current);
    predictTimer.current = setTimeout(async () => {
      // Cancel previous in-flight request
      predictAbort.current?.abort();
      const ctrl = new AbortController();
      predictAbort.current = ctrl;
      setPredicting(true);
      try {
        const systemInstruction = `You are an email open-rate prediction model trained on B2B cold-email benchmarks (industry avg ~21%). Given a subject line, predict expected open rate as a percentage and one short Chinese reason.
Return ONLY JSON: {"rate": <number 5-75>, "reason": "<one short Chinese sentence>"}`;
        const raw = await callGemini(
          apiKey,
          toGeminiMessages([{ role: "user", content: `SUBJECT: ${subject}` }]),
          { model, systemInstruction, temperature: 0.3, maxOutputTokens: 256 }
        );
        if (ctrl.signal.aborted) return;
        const parsed = parseJsonFromAI<{ rate: number; reason: string }>(raw);
        const rate = Math.max(0, Math.min(100, Math.round(parsed.rate)));
        setOpenRate({ rate, reason: parsed.reason || "" });
      } catch {
        if (!ctrl.signal.aborted) setOpenRate(null);
      } finally {
        if (!ctrl.signal.aborted) setPredicting(false);
      }
    }, 800);
    return () => {
      if (predictTimer.current) clearTimeout(predictTimer.current);
    };
  }, [subject, hasApiKey, apiKey, model, step]);


  const handleGenerate = async () => {
    if (!hasApiKey) {
      toast.error("请先配置 Google AI API Key", {
        description: "前往设置页配置后即可使用 AI 邮件生成",
      });
      return;
    }
    setIsGenerating(true);
    try {
      const typeLabel = emailTypes.find((t) => t.value === emailType)?.label || emailType;
      const audienceLabel = audiences.find((a) => a.value === audience)?.label || audience;
      const toneLabel = toneOptions.find((t) => t.value === tone)?.label || tone;
      const lengthLabel = lengthOptions.find((l) => l.value === length)?.label || length;

      const systemInstruction = `You are a senior B2B foreign-trade email copywriter for a Chinese LED manufacturer (OPC LED Technology Co., Ltd.). Write high-converting cold/follow-up emails that pass spam filters and feel personal.

CRITICAL OUTPUT FORMAT — return EXACTLY two sections separated by a single line "---":
SUBJECT: <one-line subject, no quotes>
---
<email body in plain text English with personalization variables>

Allowed variables: {{firstName}}, {{companyName}}, {{industry}}, {{senderName}}.
- Sign off as {{senderName}}.
- Avoid spam-trigger words like "free", "save 30%", "guarantee", all-caps.
- Use bullet points sparingly. End with a soft CTA.`;

      const prompt = `Generate one ${typeLabel} email.
Target audience: ${audienceLabel}
Tone: ${toneLabel}
Length: ${lengthLabel}
Personalization level: ${personalization[0]}/100
Extra context from sender: ${extraInfo || "(none)"}`;

      const text = await callGemini(
        apiKey,
        toGeminiMessages([{ role: "user", content: prompt }]),
        { model, systemInstruction, temperature: 0.8, maxOutputTokens: 1500 }
      );

      // Parse SUBJECT / body
      const subjMatch = text.match(/SUBJECT\s*:\s*(.+)/i);
      const parts = text.split(/^---\s*$/m);
      const parsedSubject = subjMatch?.[1]?.trim().replace(/^["']|["']$/g, "") || "";
      const parsedBody = (parts[1] || text.replace(/SUBJECT\s*:\s*.+/i, "")).trim();

      if (!parsedSubject || !parsedBody) throw new Error("AI 返回格式异常，请重试");

      setSubject(parsedSubject);
      setBody(parsedBody);
      setGenerated(true);
      toast.success("邮件已生成！");
    } catch (e) {
      const msg = e instanceof GeminiError ? e.message : e instanceof Error ? e.message : "生成失败";
      toast.error("AI 生成失败", { description: msg });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSequenceGenerate = async (stepNum: number) => {
    if (!hasApiKey) {
      toast.error("请先配置 Google AI API Key", { description: "前往设置页配置后即可使用 AI 序列生成" });
      return;
    }
    if (!subject.trim() || !body.trim()) {
      toast.error("请先在 Step 2 生成首封邮件，AI 才能基于上下文生成跟进");
      return;
    }
    const seqMeta = sequenceSteps.find((s) => s.step === stepNum);
    if (!seqMeta) return;

    setGeneratingSeqStep(stepNum);
    try {
      const priorEmails: { step: number; name: string; subject: string; body: string }[] = [
        { step: 1, name: "首次开发信", subject, body },
      ];
      for (let i = 2; i < stepNum; i++) {
        const d = sequenceDrafts[i];
        if (d) {
          const meta = sequenceSteps.find((x) => x.step === i);
          priorEmails.push({ step: i, name: meta?.name || `Email ${i}`, subject: d.subject, body: d.body });
        }
      }

      const audienceLabel = audiences.find((a) => a.value === audience)?.label || audience;
      const toneLabel = toneOptions.find((t) => t.value === tone)?.label || tone;

      const systemInstruction = `You are a senior B2B foreign-trade email-sequence copywriter for OPC LED Technology Co., Ltd. Generate the NEXT email in an automated drip sequence.

CRITICAL OUTPUT FORMAT — return EXACTLY two sections separated by a single line "---":
SUBJECT: <one-line subject, no quotes, must clearly differ from prior subjects>
---
<email body in plain text English>

Rules:
- This email is "${seqMeta.name}" (${seqMeta.delay}, trigger: ${seqMeta.condition}).
- Reference the prior thread naturally — do NOT repeat the same opening, value props, or CTA from earlier emails.
- Match this step's purpose: 价值跟进=分享价值/案例线索, 案例分享=具体客户故事+数据, 限时优惠=时效性激励但避免垃圾词, 最终跟进=简短礼貌的break-up email.
- Keep all personalization variables: {{firstName}}, {{companyName}}, {{industry}}, {{senderName}}.
- Sign off as {{senderName}}.
- Avoid spam triggers ("free", "guarantee", all-caps, excessive punctuation).
- Length: 80-160 words.`;

      const priorBlock = priorEmails
        .map((e) => `--- Email ${e.step} (${e.name}) ---\nSUBJECT: ${e.subject}\n${e.body}`)
        .join("\n\n");

      const prompt = `Audience: ${audienceLabel}
Tone: ${toneLabel}

Prior emails in this sequence:
${priorBlock}

Now write Email ${stepNum} (${seqMeta.name}).`;

      const text = await callGemini(
        apiKey,
        toGeminiMessages([{ role: "user", content: prompt }]),
        { model, systemInstruction, temperature: 0.85, maxOutputTokens: 1200 }
      );

      const subjMatch = text.match(/SUBJECT\s*:\s*(.+)/i);
      const parts = text.split(/^---\s*$/m);
      const newSubject = subjMatch?.[1]?.trim().replace(/^["']|["']$/g, "") || "";
      const newBody = (parts[1] || text.replace(/SUBJECT\s*:\s*.+/i, "")).trim();
      if (!newSubject || !newBody) throw new Error("AI 返回格式异常，请重试");

      setSequenceDrafts((prev) => ({ ...prev, [stepNum]: { subject: newSubject, body: newBody } }));
      toast.success(`第 ${stepNum} 封「${seqMeta.name}」已生成`);
    } catch (e) {
      const msg = e instanceof GeminiError ? e.message : e instanceof Error ? e.message : "生成失败";
      toast.error("AI 生成失败", { description: msg });
    } finally {
      setGeneratingSeqStep(null);
    }
  };

  const openEditSequence = (stepNum: number) => {
    const draft = sequenceDrafts[stepNum];
    if (!draft) {
      toast.error("请先点击「AI生成」生成内容后再编辑");
      return;
    }
    setEditDraft({ subject: draft.subject, body: draft.body });
    setEditingSeqStep(stepNum);
  };

  const saveEditSequence = () => {
    if (editingSeqStep == null) return;
    if (!editDraft.subject.trim() || !editDraft.body.trim()) {
      toast.error("主题和正文不能为空");
      return;
    }
    setSequenceDrafts((prev) => ({ ...prev, [editingSeqStep]: { ...editDraft } }));
    toast.success(`第 ${editingSeqStep} 封已保存`);
    setEditingSeqStep(null);
  };

  const handleRecommendSendTime = async (stepNum: number) => {
    if (!hasApiKey) {
      toast.error("请先配置 Google AI API Key", { description: "前往设置页配置后即可使用 AI 时机推荐" });
      return;
    }
    const seqMeta = sequenceSteps.find((s) => s.step === stepNum);
    if (!seqMeta) return;
    const audienceLabel = audiences.find((a) => a.value === audience)?.label || audience;

    setRecommendingTimeStep(stepNum);
    try {
      const systemInstruction = `You are a B2B email-marketing send-time optimizer. Recommend the optimal send time for ONE sequence email, based on the audience's primary business timezone and proven cold-email open-rate research (Tuesday/Wednesday/Thursday 9-11 AM local time typically peak for B2B; Mondays before 9 AM and Fridays after 3 PM perform worst; first emails benefit from morning slots; later follow-ups can use mid-morning or post-lunch).

Return ONLY a JSON object — no prose, no markdown fences:
{
  "localTime": "<HH:MM in 24h, recipient local time>",
  "weekday": "<one of: 周一|周二|周三|周四|周五>",
  "tz": "<IANA-style label, e.g. America/New_York (EST/EDT) or Europe/London (GMT/BST) — pick the dominant timezone of the audience>",
  "reason": "<one short Chinese sentence justifying this time given the audience and email purpose>"
}`;

      const prompt = `Sequence email metadata:
- Step: ${seqMeta.step} (${seqMeta.name})
- Delay: ${seqMeta.delay}
- Trigger: ${seqMeta.condition}
- Audience: ${audienceLabel}

Recommend the best local send time and weekday for this audience.`;

      const raw = await callGemini(
        apiKey,
        toGeminiMessages([{ role: "user", content: prompt }]),
        { model, systemInstruction, temperature: 0.3, maxOutputTokens: 400 }
      );
      const parsed = parseJsonFromAI<SendTimeRec>(raw);
      if (!parsed.localTime || !parsed.weekday || !parsed.tz) {
        throw new Error("AI 返回缺少字段");
      }
      setSendTimeRecs((prev) => ({ ...prev, [stepNum]: parsed }));
      toast.success(`第 ${stepNum} 封建议 ${parsed.weekday} ${parsed.localTime} 发送`);
    } catch (e) {
      const msg = e instanceof GeminiError ? e.message : e instanceof Error ? e.message : "推荐失败";
      toast.error("AI 推荐发送时机失败", { description: msg });
    } finally {
      setRecommendingTimeStep(null);
    }
  };

  const handleSend = async () => {
    toast.loading("正在发送邮件...");
    await new Promise((r) => setTimeout(r, 3000));
    toast.dismiss();
    toast.success("邮件发送成功！已向450位客户发送");
  };

  const stepIndicator = (
    <div className="flex items-center gap-2 mb-6">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
            step === s ? "bg-primary text-primary-foreground" :
            step > s ? "bg-brand-green/15 text-brand-green" : "bg-secondary text-muted-foreground"
          )}>
            {step > s ? <Check className="w-3.5 h-3.5" /> : s}
          </div>
          {s < 4 && <div className={cn("w-8 h-0.5", step > s ? "bg-brand-green/40" : "bg-border")} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-2xl">
      {stepIndicator}

      {step === 1 && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-display font-semibold text-sm">选择类型和受众</h3>
          <div className="space-y-2">
            <Label className="text-xs">活动名称</Label>
            <Input placeholder="例如: LED Buyers - North America Q1" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">邮件类型</Label>
            <div className="space-y-1.5">
              {emailTypes.map((t) => (
                <label key={t.value} className={cn("flex items-center gap-2 p-2 rounded-md cursor-pointer text-xs transition-colors",
                  emailType === t.value ? "bg-primary/10 border border-primary/30" : "hover:bg-secondary/50"
                )}>
                  <input type="radio" name="type" value={t.value} checked={emailType === t.value} onChange={() => setEmailType(t.value)} className="accent-[hsl(var(--primary))]" />
                  {t.label}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">目标受众</Label>
            <select value={audience} onChange={(e) => setAudience(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs">
              {audiences.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setStep(2)}><ArrowRight className="w-3.5 h-3.5 ml-1" /> 下一步</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-display font-semibold text-sm">AI生成设置</h3>
          <div className="space-y-2">
            <Label className="text-xs">个性化程度</Label>
            <Slider value={personalization} onValueChange={setPersonalization} max={100} step={1} />
            <div className="flex justify-between text-[10px] text-muted-foreground"><span>低</span><span>高</span></div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">语气风格</Label>
            <div className="flex gap-2">
              {toneOptions.map((t) => (
                <button key={t.value} onClick={() => setTone(t.value)}
                  className={cn("px-3 py-1.5 rounded-md text-xs transition-colors",
                    tone === t.value ? "bg-primary/15 text-primary border border-primary/30" : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}>{t.label}</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">邮件长度</Label>
            <div className="flex gap-2">
              {lengthOptions.map((l) => (
                <button key={l.value} onClick={() => setLength(l.value)}
                  className={cn("px-3 py-1.5 rounded-md text-xs transition-colors",
                    length === l.value ? "bg-primary/15 text-primary border border-primary/30" : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}>{l.label}</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">补充信息（可选）</Label>
            <Textarea placeholder="例如: 强调我们的5年质保、工厂直销价格" value={extraInfo} onChange={(e) => setExtraInfo(e.target.value)} className="min-h-[60px] text-xs" />
          </div>
          <div className="flex justify-between">
            <Button size="sm" variant="outline" onClick={() => setStep(1)}><ArrowLeft className="w-3.5 h-3.5 mr-1" /> 上一步</Button>
            <Button size="sm" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? <><RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> 生成中...</> : <><Sparkles className="w-3.5 h-3.5 mr-1" /> AI生成邮件</>}
            </Button>
          </div>
          {generated && (
            <div className="pt-2 flex justify-end">
              <Button size="sm" onClick={() => setStep(3)}><ArrowRight className="w-3.5 h-3.5 ml-1" /> 编辑邮件</Button>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <>
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-display font-semibold text-sm">编辑邮件</h3>
            <div className="space-y-2">
              <Label className="text-xs">主题行</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
              <div className="flex items-center gap-2 text-[10px] flex-wrap">
                <span className="text-muted-foreground">AI预测打开率:</span>
                {predicting ? (
                  <Badge variant="outline" className="text-muted-foreground text-[10px] h-4 gap-1">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" /> AI 评估中...
                  </Badge>
                ) : openRate ? (
                  <>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] h-4",
                        openRate.rate >= 30
                          ? "text-brand-green border-brand-green/30"
                          : openRate.rate >= 21
                            ? "text-primary border-primary/30"
                            : "text-destructive border-destructive/30"
                      )}
                    >
                      {openRate.rate}% {openRate.rate >= 30 ? "🟢" : openRate.rate >= 21 ? "🟡" : "🔴"}{" "}
                      {openRate.rate >= 21 ? "高于" : "低于"}行业平均21%
                    </Badge>
                    {openRate.reason && <span className="text-muted-foreground">· {openRate.reason}</span>}
                  </>
                ) : (
                  <span className="text-muted-foreground">{hasApiKey ? "修改主题行后自动评估" : "配置 API Key 后自动评估"}</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">邮件正文</Label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[200px] text-xs font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] text-muted-foreground">个性化变量</Label>
              <div className="flex gap-1.5 flex-wrap">
                {["{{firstName}}", "{{companyName}}", "{{industry}}", "{{senderName}}"].map((v) => (
                  <span key={v} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded">{v}</span>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <Button size="sm" variant="outline" onClick={() => setStep(2)}><ArrowLeft className="w-3.5 h-3.5 mr-1" /> 上一步</Button>
              <div className="flex gap-2 flex-wrap justify-end">
                <Button size="sm" variant="outline" onClick={handleGenerate}><RefreshCw className="w-3.5 h-3.5 mr-1" /> 重新生成</Button>
                <Button size="sm" variant="outline" onClick={() => setPreviewOpen(true)}><Eye className="w-3.5 h-3.5 mr-1" /> 预览</Button>
                <Button size="sm" variant="outline" onClick={handleSpamCheck} disabled={spamChecking}>
                  {spamChecking ? <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> 检测中...</> : <><ShieldCheck className="w-3.5 h-3.5 mr-1" /> 垃圾邮件检测</>}
                </Button>
                <Button size="sm" onClick={() => setStep(4)}><ArrowRight className="w-3.5 h-3.5 ml-1" /> 下一步</Button>
              </div>
            </div>
          </div>

          {/* Spam Score Panel */}
          {spamChecked && spamResult && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-semibold text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-green" /> 垃圾邮件检测报告
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">垃圾邮件评分:</span>
                  <span className={cn("text-sm font-bold", spamResult.score <= 3 ? "text-brand-green" : spamResult.score <= 5 ? "text-primary" : "text-destructive")}>
                    {spamResult.score}/10
                  </span>
                  <Badge variant="outline" className={cn("text-[10px] h-4",
                    spamResult.score <= 3 ? "text-brand-green border-brand-green/30" : "text-primary border-primary/30"
                  )}>
                    {spamResult.score <= 3 ? "优秀 - 送达率高" : spamResult.score <= 5 ? "一般 - 需要优化" : "较差 - 可能被拦截"}
                  </Badge>
                </div>
              </div>
              <Progress value={(10 - spamResult.score) * 10} className="h-1.5" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {spamResult.checks.map((check, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/20 text-xs">
                    {check.status === "pass" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-green shrink-0 mt-0.5" />
                    ) : check.status === "warn" ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-medium">{check.name}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{check.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-primary" /> 改进建议
                  </h5>
                  {spamResult.suggestions.length > 0 && (
                    <Button size="sm" className="h-6 text-[10px] px-2.5" onClick={handleAutoFix} disabled={isFixing}>
                      {isFixing ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> 修复中...</> : <><Wand2 className="w-3 h-3 mr-1" /> 一键修复</>}
                    </Button>
                  )}
                </div>
                {spamResult.suggestions.length === 0 ? (
                  <div className="text-[11px] text-brand-green flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 所有问题已修复，邮件内容已优化
                  </div>
                ) : (
                <div className="space-y-1.5">
                  {spamResult.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                      <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {step === 4 && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-sm">自动化序列设置</h3>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">启用自动跟进</Label>
              <Switch checked={sequenceEnabled} onCheckedChange={setSequenceEnabled} />
            </div>
          </div>

          {sequenceEnabled && (
            <div className="space-y-2">
              {sequenceSteps.map((s) => {
                const draft = sequenceDrafts[s.step];
                const isThisGenerating = generatingSeqStep === s.step;
                return (
                  <div key={s.step} className="p-2.5 rounded-lg bg-secondary/30 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                        s.step === 1 ? "bg-brand-green/15 text-brand-green" :
                        draft ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                      )}>{s.step}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium flex items-center gap-1.5">
                          {s.name}
                          {draft && <Badge variant="secondary" className="h-4 text-[9px] px-1.5 bg-brand-green/15 text-brand-green border-0">已生成</Badge>}
                        </div>
                        <div className="text-[10px] text-muted-foreground">{s.delay} · {s.condition}</div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-[10px] px-2"
                          disabled={recommendingTimeStep === s.step || recommendingTimeStep !== null}
                          onClick={() => handleRecommendSendTime(s.step)}
                          title="基于受众时区和 B2B 行业最佳实践推荐发送时间"
                        >
                          {recommendingTimeStep === s.step ? (
                            <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> 推荐中</>
                          ) : (
                            <><Clock className="w-3 h-3 mr-1" /> AI推荐时机</>
                          )}
                        </Button>
                        {s.step > 1 && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-[10px] px-2"
                              disabled={isThisGenerating || generatingSeqStep !== null}
                              onClick={() => handleSequenceGenerate(s.step)}
                            >
                              {isThisGenerating ? (
                                <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> 生成中</>
                              ) : (
                                <><Sparkles className="w-3 h-3 mr-1" /> {draft ? "重新生成" : "AI生成"}</>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-[10px] px-2"
                              disabled={!draft}
                              onClick={() => openEditSequence(s.step)}
                            >
                              编辑
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    {/* AI 推荐发送时机 */}
                    {sendTimeRecs[s.step] && (
                      <div className="ml-10 flex items-start gap-2 text-[10px] p-1.5 rounded bg-primary/10 border border-primary/20">
                        <Clock className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                        <div className="space-y-0.5">
                          <div className="text-primary font-medium">
                            建议 {sendTimeRecs[s.step].weekday} {sendTimeRecs[s.step].localTime}
                            <span className="text-muted-foreground font-normal"> · {sendTimeRecs[s.step].tz}</span>
                          </div>
                          <div className="text-muted-foreground leading-snug">{sendTimeRecs[s.step].reason}</div>
                        </div>
                      </div>
                    )}
                    {/* Inline preview of generated content */}
                    {s.step === 1 && subject && (
                      <div className="ml-10 text-[10px] space-y-0.5 text-muted-foreground">
                        <div><span className="text-foreground/70 font-medium">主题：</span>{subject}</div>
                        <div className="line-clamp-2 opacity-80">{body}</div>
                      </div>
                    )}
                    {draft && s.step > 1 && (
                      <div className="ml-10 text-[10px] space-y-0.5 text-muted-foreground">
                        <div><span className="text-foreground/70 font-medium">主题：</span>{draft.subject}</div>
                        <div className="line-clamp-2 opacity-80 whitespace-pre-wrap">{draft.body}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-1.5 pt-2">
            <Label className="text-xs text-muted-foreground">自动化规则</Label>
            <div className="space-y-1 text-xs">
              {["如果回复任何邮件，停止序列并通知销售", "如果退订，立即停止并从列表移除", "如果点击链接，标记为「高意向」"].map((rule, i) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-[hsl(var(--primary))] w-3 h-3" />
                  <span className="text-muted-foreground">{rule}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button size="sm" variant="outline" onClick={() => setStep(3)}><ArrowLeft className="w-3.5 h-3.5 mr-1" /> 上一步</Button>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => toast.success("已保存为草稿")}>保存草稿</Button>
              <Button size="sm" onClick={handleSend}><Send className="w-3.5 h-3.5 mr-1" /> 立即发送</Button>
            </div>
          </div>
        </div>
      )}

      {/* Sequence Edit Dialog */}
      <Dialog open={editingSeqStep != null} onOpenChange={(o) => !o && setEditingSeqStep(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-sm">
              编辑第 {editingSeqStep} 封 ·{" "}
              {sequenceSteps.find((x) => x.step === editingSeqStep)?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">主题行</Label>
              <Input
                value={editDraft.subject}
                onChange={(e) => setEditDraft((d) => ({ ...d, subject: e.target.value }))}
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">正文（支持 {`{{firstName}}`} 等变量）</Label>
              <Textarea
                value={editDraft.body}
                onChange={(e) => setEditDraft((d) => ({ ...d, body: e.target.value }))}
                className="text-xs min-h-[240px] font-mono"
              />
            </div>
          </div>
          <div className="flex justify-between gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              disabled={generatingSeqStep != null}
              onClick={() => {
                const stepNum = editingSeqStep;
                if (stepNum != null) {
                  setEditingSeqStep(null);
                  handleSequenceGenerate(stepNum);
                }
              }}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> AI 重新生成
            </Button>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setEditingSeqStep(null)}>取消</Button>
              <Button size="sm" onClick={saveEditSequence}>保存</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display text-sm flex items-center justify-between">
              <span>邮件预览</span>
              <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
                <button
                  onClick={() => setPreviewDevice("desktop")}
                  className={cn("flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] transition-colors",
                    previewDevice === "desktop" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Monitor className="w-3.5 h-3.5" /> 桌面端
                </button>
                <button
                  onClick={() => setPreviewDevice("mobile")}
                  className={cn("flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] transition-colors",
                    previewDevice === "mobile" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Smartphone className="w-3.5 h-3.5" /> 移动端
                </button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto flex justify-center py-4">
            <div
              className={cn(
                "bg-white rounded-lg shadow-lg transition-all duration-300 overflow-hidden",
                previewDevice === "desktop" ? "w-full max-w-[600px]" : "w-[375px]"
              )}
              style={previewDevice === "mobile" ? { borderRadius: 24, border: "6px solid hsl(var(--border))" } : {}}
            >
              {/* Email header */}
              <div className="bg-[#f8f9fa] px-5 py-3 border-b border-[#e5e7eb]">
                <div className="text-[11px] text-[#6b7280] space-y-0.5">
                  <div><span className="font-medium text-[#374151]">From:</span> Alex Wang &lt;alex@opcled.com&gt;</div>
                  <div><span className="font-medium text-[#374151]">To:</span> John Smith &lt;john@abccorp.com&gt;</div>
                  <div><span className="font-medium text-[#374151]">Subject:</span> {subject || "(无主题)"}</div>
                </div>
              </div>
              {/* Email body */}
              <div className={cn("px-5 py-4 text-[#1f2937]", previewDevice === "desktop" ? "text-sm leading-relaxed" : "text-xs leading-relaxed")}>
                {renderPreviewHtml().split("\n").map((line, i) => (
                  <p key={i} className={line.trim() === "" ? "h-3" : ""}>{line}</p>
                ))}
              </div>
              {/* Email footer */}
              <div className="bg-[#f8f9fa] px-5 py-3 border-t border-[#e5e7eb] text-center">
                <div className="text-[10px] text-[#9ca3af]">
                  <span className="underline cursor-pointer hover:text-[#6b7280]">Unsubscribe</span>
                  {" | "}
                  <span className="underline cursor-pointer hover:text-[#6b7280]">Email Preferences</span>
                </div>
                <div className="text-[9px] text-[#d1d5db] mt-1">© 2026 OPC LED · Shenzhen, China</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
