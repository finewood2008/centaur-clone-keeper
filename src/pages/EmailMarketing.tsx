/**
 * EmailMarketing - AI EDM邮件营销
 */
import { useState } from "react";
import {
  Mail, Sparkles, Send, Clock, CheckCircle2, Eye,
  MousePointerClick, Reply, AlertCircle, Plus, MoreHorizontal,
  Users, TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ApiKeyBanner from "@/components/ApiKeyBanner";

interface EmailCampaign {
  id: number; name: string; status: "active" | "completed" | "draft";
  type: "cold_outreach" | "follow_up" | "newsletter";
  sent: number; opened: number; clicked: number; replied: number;
  bounced: number; lastSent: string;
}

const campaigns: EmailCampaign[] = [
  { id: 1, name: "LED Buyers - North America Q1", status: "active", type: "cold_outreach", sent: 450, opened: 198, clicked: 67, replied: 23, bounced: 12, lastSent: "2026-03-25" },
  { id: 2, name: "Solar Panel Follow-up Sequence", status: "active", type: "follow_up", sent: 120, opened: 78, clicked: 34, replied: 15, bounced: 3, lastSent: "2026-03-24" },
  { id: 3, name: "Monthly Product Newsletter", status: "completed", type: "newsletter", sent: 850, opened: 340, clicked: 89, replied: 5, bounced: 22, lastSent: "2026-03-20" },
  { id: 4, name: "EU Market - Steel Products", status: "draft", type: "cold_outreach", sent: 0, opened: 0, clicked: 0, replied: 0, bounced: 0, lastSent: "" },
];

const typeLabels: Record<string, string> = { cold_outreach: "AI开发信", follow_up: "自动跟进", newsletter: "产品通讯" };
const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: "发送中", color: "bg-brand-green/15 text-brand-green" },
  completed: { label: "已完成", color: "bg-brand-cyan/15 text-brand-cyan" },
  draft: { label: "草稿", color: "bg-muted text-muted-foreground" },
};

const emailSequence = [
  { step: 1, name: "首次开发信", delay: "Day 0", status: "sent", openRate: "44%" },
  { step: 2, name: "价值跟进", delay: "Day 3", status: "sent", openRate: "38%" },
  { step: 3, name: "案例分享", delay: "Day 7", status: "scheduled", openRate: "-" },
  { step: 4, name: "限时优惠", delay: "Day 14", status: "pending", openRate: "-" },
  { step: 5, name: "最终跟进", delay: "Day 21", status: "pending", openRate: "-" },
];

export default function EmailMarketing() {
  return (
    <div className="space-y-6">
      <ApiKeyBanner description="后，AI 开发信生成与自动化跟进序列将自动激活" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="font-display font-semibold text-lg">AI EDM邮件营销</h2>
          <p className="text-xs text-muted-foreground">AI Email Marketing · 智能开发信与自动化跟进序列</p>
        </div>
        <button onClick={() => toast("AI邮件生成功能即将上线", { description: "Feature coming soon" })}
          className="flex items-center gap-1.5 text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity self-start">
          <Sparkles className="w-4 h-4" /> AI生成开发信
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "已发送", value: "1,420", sub: "本月累计" },
          { label: "打开率", value: "43.4%", sub: "行业平均 21%" },
          { label: "回复率", value: "6.8%", sub: "43封回复" },
          { label: "退信率", value: "2.6%", sub: "低于行业水平" },
        ].map((kpi) => (
          <div key={kpi.label} className="glass-panel metric-card rounded-xl p-4">
            <div className="text-xs text-muted-foreground mb-1">{kpi.label}</div>
            <div className="text-xl font-metric font-bold">{kpi.value}</div>
            <div className="text-[10px] text-muted-foreground mt-1">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Campaign list */}
      <div className="glass-panel rounded-xl">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-display font-semibold text-sm">邮件活动</h3>
        </div>
        <div className="divide-y divide-border">
          {campaigns.map((c) => {
            const status = statusLabels[c.status];
            const openRate = c.sent > 0 ? ((c.opened / c.sent) * 100).toFixed(1) : "0";
            const replyRate = c.sent > 0 ? ((c.replied / c.sent) * 100).toFixed(1) : "0";
            return (
              <div key={c.id} className="p-4 hover:bg-accent/30 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{c.name}</span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded", status.color)}>{status.label}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{typeLabels[c.type]}</span>
                </div>
                {c.sent > 0 && (
                  <div className="flex gap-3 md:gap-4 mt-2 text-[10px] text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><Send className="w-3 h-3" /> {c.sent} 发送</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {openRate}% 打开</span>
                    <span className="flex items-center gap-1"><MousePointerClick className="w-3 h-3" /> {c.clicked} 点击</span>
                    <span className="flex items-center gap-1"><Reply className="w-3 h-3" /> {replyRate}% 回复</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Auto sequence */}
      <div className="glass-panel rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold text-sm">自动化跟进序列</h3>
            <p className="text-[10px] text-muted-foreground">LED Buyers - North America</p>
          </div>
        </div>
        <div className="space-y-2">
          {emailSequence.map((step, idx) => (
            <div key={step.step} className="flex items-center gap-3">
              <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                step.status === "sent" ? "bg-brand-green/15 text-brand-green" : step.status === "scheduled" ? "bg-brand-cyan/15 text-brand-cyan" : "bg-secondary text-muted-foreground"
              )}>{step.step}</div>
              <div className="flex-1">
                <div className="text-xs font-medium">{step.name}</div>
                <div className="text-[10px] text-muted-foreground">{step.delay}</div>
              </div>
              <span className={cn("text-[10px]",
                step.status === "sent" ? "text-brand-green" : step.status === "scheduled" ? "text-brand-cyan" : "text-muted-foreground"
              )}>{step.status === "sent" ? "已发送" : step.status === "scheduled" ? "待发送" : "排队中"}</span>
              {step.openRate !== "-" && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Eye className="w-3 h-3" /> 打开 {step.openRate}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
