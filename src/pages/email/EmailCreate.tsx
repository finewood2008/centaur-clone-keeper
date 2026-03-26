/**
 * EmailCreate - 创建邮件活动（4步流程）
 */
import { useState } from "react";
import { Sparkles, ArrowRight, ArrowLeft, Eye, Send, RefreshCw, Check, Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleGenerate}><RefreshCw className="w-3.5 h-3.5 mr-1" /> 重新生成</Button>
              <Button size="sm" variant="outline" onClick={() => toast("预览功能即将上线")}><Eye className="w-3.5 h-3.5 mr-1" /> 预览</Button>
              <Button size="sm" onClick={() => setStep(4)}><ArrowRight className="w-3.5 h-3.5 ml-1" /> 下一步</Button>
            </div>
          </div>
        </div>
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
    </div>
  );
}
