/**
 * BatchContentGenerator — AI批量内容排期
 * 对话框：配置 → AI生成 → 预览 → 保存
 */
import { useState, useCallback } from "react";
import {
  Sparkles, Loader2, Trash2, CalendarDays, Check,
  Linkedin, Facebook, Instagram,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useApiKey } from "@/hooks/use-api-key";
import { streamGemini, toGeminiMessages } from "@/lib/gemini";
import { useBatchCreatePosts, type CreatePostInput } from "@/hooks/use-content-posts";

// ---------- Config ----------

const THEMES = ["行业洞察", "新品发布", "客户案例", "公司动态", "节日营销"];
const STYLES = ["专业严谨", "轻松活泼", "故事化叙述"];
const FREQUENCIES = [
  { label: "每天1篇", value: 1 },
  { label: "每天2篇", value: 2 },
  { label: "隔天1篇", value: 0.5 },
];
const PLATFORMS = [
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "facebook", label: "Facebook", icon: Facebook },
  { id: "instagram", label: "Instagram", icon: Instagram },
];
const PERIODS = [
  { label: "本周剩余", value: "this_week" },
  { label: "下一周", value: "next_week" },
  { label: "未来两周", value: "two_weeks" },
];

interface GeneratedPost extends CreatePostInput {
  _key: string; // temp UI key
}

// ---------- Component ----------

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BatchContentGenerator({ open, onOpenChange }: Props) {
  const { apiKey, model, hasApiKey } = useApiKey();
  const batchCreate = useBatchCreatePosts();

  // Step 1 config
  const [period, setPeriod] = useState("next_week");
  const [frequency, setFrequency] = useState(1);
  const [themes, setThemes] = useState<string[]>(["行业洞察", "新品发布"]);
  const [style, setStyle] = useState("专业严谨");
  const [platforms, setPlatforms] = useState<string[]>(["linkedin"]);

  // Step 2 preview
  const [step, setStep] = useState<1 | 2>(1);
  const [generated, setGenerated] = useState<GeneratedPost[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleTheme = (t: string) =>
    setThemes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  const togglePlatform = (p: string) =>
    setPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);

  // Compute target dates
  const getDateRange = useCallback(() => {
    const now = new Date();
    const dayOfWeek = now.getDay() || 7; // 1=Mon, 7=Sun
    let start: Date, end: Date;

    if (period === "this_week") {
      start = new Date(now);
      start.setDate(start.getDate() + 1);
      end = new Date(now);
      end.setDate(now.getDate() + (7 - dayOfWeek));
    } else if (period === "next_week") {
      start = new Date(now);
      start.setDate(now.getDate() + (8 - dayOfWeek));
      end = new Date(start);
      end.setDate(start.getDate() + 6);
    } else {
      start = new Date(now);
      start.setDate(now.getDate() + (8 - dayOfWeek));
      end = new Date(start);
      end.setDate(start.getDate() + 13);
    }
    return { start, end };
  }, [period]);

  const fmtDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  // Generate content via Gemini
  const handleGenerate = async () => {
    if (!hasApiKey) {
      toast({ title: "请先在设置中配置 Google API Key", variant: "destructive" });
      return;
    }
    if (themes.length === 0) {
      toast({ title: "请至少选择一个内容主题", variant: "destructive" });
      return;
    }
    if (platforms.length === 0) {
      toast({ title: "请至少选择一个发布平台", variant: "destructive" });
      return;
    }

    setGenerating(true);

    const { start, end } = getDateRange();
    const dates: string[] = [];
    const d = new Date(start);
    let dayCount = 0;
    while (d <= end) {
      if (frequency >= 1) {
        for (let i = 0; i < frequency; i++) dates.push(fmtDate(d));
      } else {
        if (dayCount % 2 === 0) dates.push(fmtDate(d));
      }
      d.setDate(d.getDate() + 1);
      dayCount++;
    }

    const systemPrompt = `你是一个跨境电商B2B内容营销专家。为一家中国外贸公司生成社交媒体内容排期。
公司经营产品：LED照明、太阳能板、钢管、陶瓷家居、手机配件等。
目标市场：全球B2B买家（欧美、中东、东南亚）。

请严格输出 JSON 数组，不要包含任何其他文字。每个元素格式：
{
  "title": "标题（15字以内）",
  "content": "完整的社媒帖子内容（100-250字，包含emoji、hashtag）",
  "theme": "主题类别"
}

写作风格：${style}
语言：英文（面向海外买家）`;

    const userMsg = `请为以下日期各生成1篇社媒内容：
日期：${dates.join(", ")}
主题范围（随机分配）：${themes.join("、")}
共需要 ${dates.length} 篇。

直接输出JSON数组，不要markdown代码块。`;

    try {
      let fullText = "";
      await streamGemini({
        apiKey: apiKey!,
        model: model || "gemini-2.5-flash",
        messages: toGeminiMessages([
          { role: "user", content: userMsg },
        ]),
        systemInstruction: systemPrompt,
        onChunk: (chunk) => { fullText += chunk; },
      });

      // Parse JSON from response
      const jsonMatch = fullText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("AI 未返回有效的 JSON 数组");

      const items: { title: string; content: string; theme: string }[] = JSON.parse(jsonMatch[0]);

      const posts: GeneratedPost[] = items.map((item, idx) => ({
        _key: `gen-${Date.now()}-${idx}`,
        title: item.title,
        content: item.content,
        theme: item.theme,
        style,
        platforms,
        status: "scheduled" as const,
        scheduled_at: `${dates[idx] || dates[dates.length - 1]}T10:00:00`,
        ai_generated: true,
      }));

      setGenerated(posts);
      setStep(2);
    } catch (err: any) {
      console.error("AI generation error:", err);
      toast({
        title: "生成失败",
        description: err.message || "请检查 API Key 和网络连接",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  // Save all generated posts
  const handleSave = async () => {
    if (generated.length === 0) return;
    setSaving(true);
    try {
      const inputs: CreatePostInput[] = generated.map(({ _key, ...rest }) => rest);
      await batchCreate.mutateAsync(inputs);
      toast({ title: `成功保存 ${inputs.length} 篇内容到日历` });
      setStep(1);
      setGenerated([]);
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "保存失败", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const removePost = (key: string) =>
    setGenerated((prev) => prev.filter((p) => p._key !== key));

  const handleClose = (open: boolean) => {
    if (!open) {
      setStep(1);
      setGenerated([]);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI 内容排期
          </DialogTitle>
          <DialogDescription>
            {step === 1 ? "配置生成参数，AI 将批量生成内容并排入日历" : `已生成 ${generated.length} 篇，确认后保存`}
          </DialogDescription>
        </DialogHeader>

        {/* ======== Step 1: Config ======== */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            {/* Period */}
            <div>
              <label className="text-xs font-medium mb-1.5 block">生成周期</label>
              <div className="flex gap-2">
                {PERIODS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPeriod(p.value)}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded-md border transition-colors",
                      period === p.value
                        ? "border-primary bg-primary/5 text-primary font-medium"
                        : "border-border hover:bg-secondary"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="text-xs font-medium mb-1.5 block">发布频率</label>
              <div className="flex gap-2">
                {FREQUENCIES.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFrequency(f.value)}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded-md border transition-colors",
                      frequency === f.value
                        ? "border-primary bg-primary/5 text-primary font-medium"
                        : "border-border hover:bg-secondary"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Themes */}
            <div>
              <label className="text-xs font-medium mb-1.5 block">内容主题</label>
              <div className="flex flex-wrap gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleTheme(t)}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md border transition-colors",
                      themes.includes(t)
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:bg-secondary text-muted-foreground"
                    )}
                  >
                    {themes.includes(t) && <Check className="w-3 h-3" />}
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div>
              <label className="text-xs font-medium mb-1.5 block">写作风格</label>
              <div className="flex gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded-md border transition-colors",
                      style === s
                        ? "border-primary bg-primary/5 text-primary font-medium"
                        : "border-border hover:bg-secondary"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Platforms */}
            <div>
              <label className="text-xs font-medium mb-1.5 block">目标平台</label>
              <div className="flex gap-2">
                {PLATFORMS.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border transition-colors",
                        platforms.includes(p.id)
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:bg-secondary text-muted-foreground"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ======== Step 2: Preview ======== */}
        {step === 2 && (
          <div className="space-y-2 py-2 max-h-[50vh] overflow-y-auto">
            {generated.map((p) => (
              <div key={p._key} className="border border-border rounded-lg p-3 space-y-1.5 relative group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">
                      {(p.scheduled_at || "").slice(0, 10)}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded text-muted-foreground">
                      {p.theme}
                    </span>
                  </div>
                  <button
                    onClick={() => removePost(p._key)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-xs font-medium">{p.title}</div>
                <div className="text-[11px] text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                  {p.content}
                </div>
                <div className="flex items-center gap-1">
                  {(p.platforms || []).map((pl) => {
                    const cfg = PLATFORMS.find((x) => x.id === pl);
                    if (!cfg) return null;
                    const Icon = cfg.icon;
                    return <Icon key={pl} className="w-3 h-3 text-muted-foreground" />;
                  })}
                </div>
              </div>
            ))}
            {generated.length === 0 && (
              <div className="text-xs text-muted-foreground text-center py-4">
                所有内容已被移除，请返回重新生成
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 2 && (
            <button
              onClick={() => { setStep(1); setGenerated([]); }}
              className="px-3 py-1.5 text-xs rounded-md border border-border hover:bg-secondary transition-colors mr-auto"
            >
              返回修改
            </button>
          )}
          {step === 1 ? (
            <button
              onClick={handleGenerate}
              disabled={generating || !hasApiKey}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-md transition-colors",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                (generating || !hasApiKey) && "opacity-50 cursor-not-allowed"
              )}
            >
              {generating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> 生成中…
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> 生成排期
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving || generated.length === 0}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-md transition-colors",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                (saving || generated.length === 0) && "opacity-50 cursor-not-allowed"
              )}
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> 保存中…
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" /> 确认并保存 ({generated.length}篇)
                </>
              )}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
