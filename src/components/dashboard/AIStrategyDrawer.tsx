/**
 * AIStrategyDrawer - AI策略配置抽屉面板
 */
import { useState } from "react";
import { Bot, Zap, Clock, MessageSquare, Globe, Mail, Shield, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface AIStrategyDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ChannelStrategy {
  key: string;
  label: string;
  icon: React.ElementType;
  enabled: boolean;
  autoReply: boolean;
  confidence: number;
}

export default function AIStrategyDrawer({ open, onOpenChange }: AIStrategyDrawerProps) {
  const [strategies, setStrategies] = useState<ChannelStrategy[]>([
    { key: "whatsapp", label: "WhatsApp", icon: MessageSquare, enabled: true, autoReply: true, confidence: 85 },
    { key: "email", label: "Email", icon: Mail, enabled: true, autoReply: true, confidence: 80 },
    { key: "linkedin", label: "LinkedIn", icon: Globe, enabled: true, autoReply: false, confidence: 75 },
    { key: "website", label: "网站表单", icon: Globe, enabled: true, autoReply: true, confidence: 90 },
  ]);

  const [globalSettings, setGlobalSettings] = useState({
    autoReplyEnabled: true,
    humanReviewThreshold: 70,
    maxDailyAutoReplies: 200,
    replyLanguageAuto: true,
    escalationEnabled: true,
  });

  const updateStrategy = (key: string, field: Partial<ChannelStrategy>) => {
    setStrategies((prev) =>
      prev.map((s) => (s.key === key ? { ...s, ...field } : s))
    );
  };

  const handleSave = () => {
    toast({ title: "策略已保存", description: "AI自动化策略配置已更新" });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[420px] sm:max-w-[420px] bg-card border-border overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border">
          <SheetTitle className="font-display text-base flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            AI策略配置
          </SheetTitle>
          <p className="text-[11px] text-muted-foreground">配置各渠道的AI自动回复策略和阈值</p>
        </SheetHeader>

        <div className="space-y-6 py-5">
          {/* Global Toggle */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">全局设置</h4>

            <div className="rounded-lg border border-border p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium">AI自动回复</span>
                </div>
                <Switch
                  checked={globalSettings.autoReplyEnabled}
                  onCheckedChange={(v) => setGlobalSettings((p) => ({ ...p, autoReplyEnabled: v }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-brand-orange" />
                  <span className="text-xs font-medium">低置信度转人工</span>
                </div>
                <Switch
                  checked={globalSettings.escalationEnabled}
                  onCheckedChange={(v) => setGlobalSettings((p) => ({ ...p, escalationEnabled: v }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-brand-cyan" />
                  <span className="text-xs font-medium">自动识别语言回复</span>
                </div>
                <Switch
                  checked={globalSettings.replyLanguageAuto}
                  onCheckedChange={(v) => setGlobalSettings((p) => ({ ...p, replyLanguageAuto: v }))}
                />
              </div>
            </div>

            {/* Human review threshold */}
            <div className="rounded-lg border border-border p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">人工审核阈值</span>
                <span className="text-xs font-mono text-primary">{globalSettings.humanReviewThreshold}%</span>
              </div>
              <Slider
                value={[globalSettings.humanReviewThreshold]}
                min={50}
                max={95}
                step={5}
                onValueChange={([v]) => setGlobalSettings((p) => ({ ...p, humanReviewThreshold: v }))}
                className="w-full"
              />
              <p className="text-[10px] text-muted-foreground">
                置信度低于此阈值的回复将转交人工审核
              </p>
            </div>

            {/* Daily limit */}
            <div className="rounded-lg border border-border p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">每日自动回复上限</span>
                <span className="text-xs font-mono text-primary">{globalSettings.maxDailyAutoReplies}</span>
              </div>
              <Slider
                value={[globalSettings.maxDailyAutoReplies]}
                min={50}
                max={500}
                step={10}
                onValueChange={([v]) => setGlobalSettings((p) => ({ ...p, maxDailyAutoReplies: v }))}
                className="w-full"
              />
              <p className="text-[10px] text-muted-foreground">
                超出上限后所有新询盘将等待人工处理
              </p>
            </div>
          </div>

          {/* Per-Channel Strategies */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">渠道策略</h4>
            {strategies.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.key}
                  className={cn(
                    "rounded-lg border p-3 space-y-3 transition-colors",
                    s.enabled ? "border-border" : "border-border/50 opacity-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">{s.label}</span>
                    </div>
                    <Switch
                      checked={s.enabled}
                      onCheckedChange={(v) => updateStrategy(s.key, { enabled: v })}
                    />
                  </div>

                  {s.enabled && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">自动回复</span>
                        <Switch
                          checked={s.autoReply}
                          onCheckedChange={(v) => updateStrategy(s.key, { autoReply: v })}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">最低置信度</span>
                          <span className="text-[11px] font-mono text-primary">{s.confidence}%</span>
                        </div>
                        <Slider
                          value={[s.confidence]}
                          min={50}
                          max={99}
                          step={5}
                          onValueChange={([v]) => updateStrategy(s.key, { confidence: v })}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border pt-4 pb-2 flex gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 h-9 text-xs font-medium border border-border rounded-lg hover:bg-secondary transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 h-9 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            保存策略
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
