/**
 * EmailCreate - 创建邮件活动（4步流程）
 */
import { useState } from "react";
import { Sparkles, ArrowRight, ArrowLeft, Eye, Send, RefreshCw, Check, Monitor, Smartphone, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Loader2, Wand2 } from "lucide-react";
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

  const handleSpamCheck = async () => {
    setSpamChecking(true);
    await new Promise((r) => setTimeout(r, 1800));
    setSpamResult({
      score: 2.1,
      checks: [
        { name: "SPF记录", status: "pass", detail: "opcled.com 已配置SPF记录，授权发送服务器" },
        { name: "DKIM签名", status: "pass", detail: "DKIM签名有效，密钥长度2048位" },
        { name: "DMARC策略", status: "pass", detail: "DMARC策略设置为quarantine，对齐SPF/DKIM" },
        { name: "发件人信誉", status: "pass", detail: "域名信誉良好，近30天退信率<1%" },
        { name: "内容检测", status: "warn", detail: "检测到可能触发垃圾邮件过滤的短语" },
        { name: "链接安全", status: "pass", detail: "所有链接均使用HTTPS，无黑名单域名" },
        { name: "HTML/文本比例", status: "pass", detail: "纯文本邮件，比例良好" },
        { name: "退订链接", status: "pass", detail: "包含退订链接，符合CAN-SPAM要求" },
        { name: "主题行检测", status: "warn", detail: "主题行包含大写字母，部分邮箱可能标记" },
      ],
      suggestions: [
        "避免在正文中使用\"save\"、\"discount\"等促销敏感词，改用更自然的表述",
        "主题行建议避免全大写单词，改为首字母大写以降低垃圾邮件评分",
        "建议添加发件人物理地址以完全符合CAN-SPAM法规",
        "考虑使用个性化变量替代通用问候语，提升送达率",
      ],
    });
    setSpamChecked(true);
    setSpamChecking(false);
    toast.success("垃圾邮件检测完成");
  };

  const [isFixing, setIsFixing] = useState(false);

  const handleAutoFix = async () => {
    setIsFixing(true);
    toast.loading("AI正在优化邮件内容...");
    await new Promise((r) => setTimeout(r, 2000));
    toast.dismiss();

    // Fix subject: convert full-uppercase words to title case
    setSubject("5 Year Warranty Led Bulbs - Factory Direct Pricing");

    // Fix body: replace promotional trigger words and add address
    setBody((prev) =>
      prev
        .replace(/save 30-40%/gi, "reduce costs by 30-40%")
        .replace(/Hi \{\{firstName\}\}/g, "Hello {{firstName}}")
        .replace(
          /Best regards,\n\{\{senderName\}\}/g,
          "Best regards,\n{{senderName}}\nOPC LED Technology Co., Ltd.\n1088 Nanshan Blvd, Shenzhen, China 518000"
        )
    );

    // Update spam result to reflect fixes
    setSpamResult({
      score: 0.8,
      checks: [
        { name: "SPF记录", status: "pass", detail: "opcled.com 已配置SPF记录，授权发送服务器" },
        { name: "DKIM签名", status: "pass", detail: "DKIM签名有效，密钥长度2048位" },
        { name: "DMARC策略", status: "pass", detail: "DMARC策略设置为quarantine，对齐SPF/DKIM" },
        { name: "发件人信誉", status: "pass", detail: "域名信誉良好，近30天退信率<1%" },
        { name: "内容检测", status: "pass", detail: "未检测到垃圾邮件触发词 ✓ 已优化" },
        { name: "链接安全", status: "pass", detail: "所有链接均使用HTTPS，无黑名单域名" },
        { name: "HTML/文本比例", status: "pass", detail: "纯文本邮件，比例良好" },
        { name: "退订链接", status: "pass", detail: "包含退订链接，符合CAN-SPAM要求" },
        { name: "主题行检测", status: "pass", detail: "主题行格式规范 ✓ 已优化" },
      ],
      suggestions: [],
    });

    setIsFixing(false);
    toast.success("已自动修复4项问题，垃圾邮件评分从 2.1 降至 0.8");
  };


  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));
    setSubject("5 Year Warranty LED Bulbs - Factory Direct Pricing");
    setBody(`Hi {{firstName}},

I noticed your company {{companyName}} specializes in {{industry}}. We're a leading LED manufacturer offering 5-year warranty and factory-direct pricing.

Our clients typically save 30-40% on lighting costs. Would you be interested in a quick call to discuss how we can help?

Key advantages:
• 5-year warranty on all products
• Factory-direct pricing (no middlemen)
• MOQ as low as 100 pieces
• Free samples available

Looking forward to hearing from you.

Best regards,
{{senderName}}`);
    setGenerated(true);
    setIsGenerating(false);
    toast.success("邮件已生成！");
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
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-muted-foreground">AI预测打开率:</span>
                <Badge variant="outline" className="text-brand-green border-brand-green/30 text-[10px] h-4">38% 🟢 高于行业平均21%</Badge>
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
              {sequenceSteps.map((s) => (
                <div key={s.step} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30">
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    s.step === 1 ? "bg-brand-green/15 text-brand-green" : "bg-secondary text-muted-foreground"
                  )}>{s.step}</div>
                  <div className="flex-1">
                    <div className="text-xs font-medium">{s.name}</div>
                    <div className="text-[10px] text-muted-foreground">{s.delay} · {s.condition}</div>
                  </div>
                  {s.step > 1 && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => toast("AI生成功能即将上线")}>AI生成</Button>
                      <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => toast("手动编辑功能即将上线")}>编辑</Button>
                    </div>
                  )}
                </div>
              ))}
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
