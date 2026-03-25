/**
 * AISales - AI自动化客服与销售
 */
import { useState } from "react";
import {
  Bot, Zap, CheckCircle2, Clock, AlertTriangle,
  ArrowUpRight, MessageSquare, Users, TrendingUp,
  Eye, ThumbsUp, ThumbsDown, RotateCcw, Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const intentData = [
  { name: "询价", value: 42, color: "hsl(30 90% 55%)" },
  { name: "产品咨询", value: 28, color: "hsl(190 70% 50%)" },
  { name: "订单跟进", value: 15, color: "hsl(155 60% 45%)" },
  { name: "投诉", value: 8, color: "hsl(0 70% 50%)" },
  { name: "闲聊", value: 7, color: "hsl(230 10% 55%)" },
];

interface AutoReplyLog {
  id: number; customer: string; company: string; intent: string;
  priority: number; action: "auto_sent" | "pending_review" | "human_escalated";
  confidence: number; time: string; preview: string;
}

const autoReplyLogs: AutoReplyLog[] = [
  { id: 1, customer: "David Lee", company: "Asia Pacific Corp", intent: "询价", priority: 82, action: "pending_review", confidence: 0.91, time: "10:45", preview: "Thank you for your inquiry about our aluminum profiles..." },
  { id: 2, customer: "Emma Wilson", company: "UK Wholesale Ltd", intent: "产品咨询", priority: 45, action: "auto_sent", confidence: 0.95, time: "10:30", preview: "Our LED panel lights come in 3 sizes: 600x600mm, 300x1200mm..." },
  { id: 3, customer: "Hans Mueller", company: "Deutsche Handel", intent: "询价", priority: 88, action: "human_escalated", confidence: 0.72, time: "10:15", preview: "Regarding your request for custom solar panels..." },
  { id: 4, customer: "Lisa Chen", company: "Taiwan Trading", intent: "订单跟进", priority: 65, action: "auto_sent", confidence: 0.88, time: "09:50", preview: "Your order #TW-2026-0312 has been shipped via sea freight..." },
  { id: 5, customer: "Pierre Dupont", company: "France Import", intent: "闲聊", priority: 15, action: "auto_sent", confidence: 0.97, time: "09:30", preview: "Thank you for your message. We appreciate your interest..." },
];

const actionLabels: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  auto_sent: { label: "已自动发送", color: "text-brand-green", icon: CheckCircle2 },
  pending_review: { label: "待人工审核", color: "text-brand-orange", icon: Clock },
  human_escalated: { label: "已转人工", color: "text-destructive", icon: AlertTriangle },
};

const pipelineStages = [
  { name: "新询盘", count: 18, value: "$125K", color: "bg-brand-cyan" },
  { name: "AI跟进中", count: 12, value: "$89K", color: "bg-brand-orange" },
  { name: "报价阶段", count: 8, value: "$67K", color: "bg-yellow-500" },
  { name: "谈判中", count: 5, value: "$45K", color: "bg-brand-green" },
  { name: "已成交", count: 3, value: "$32K", color: "bg-emerald-500" },
];

export default function AISales() {
  const [activeTab, setActiveTab] = useState<"logs" | "pipeline">("logs");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-lg">AI自动化客服与销售</h2>
          <p className="text-xs text-muted-foreground">Intelligent Response Agent · 实时监控AI回复与客户培育</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-brand-green/15 text-brand-green px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse-glow" />
          Agent 运行中
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "今日AI回复", value: "26", sub: "↑ 83.9% 自动化率" },
          { label: "平均响应时间", value: "8s", sub: "比人工快 180x" },
          { label: "客户满意度", value: "4.7", sub: "/ 5.0 评分" },
          { label: "待审核回复", value: "3", sub: "需要您的确认" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-xl p-4">
            <div className="text-xs text-muted-foreground mb-1">{kpi.label}</div>
            <div className="text-xl font-display font-bold">{kpi.value}</div>
            <div className="text-[10px] text-muted-foreground mt-1">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Intent + Strategy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-display font-semibold text-sm mb-4">意图识别分布</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={150}>
              <PieChart>
                <Pie data={intentData} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={2}>
                  {intentData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(230 12% 14%)", border: "1px solid hsl(230 10% 23%)", borderRadius: 8, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5">
              {intentData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  {item.name} ({item.value}%)
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-display font-semibold text-sm mb-1">AI响应策略</h3>
          <p className="text-[10px] text-muted-foreground mb-3">基于优先级评分的三级响应机制</p>
          <div className="space-y-2">
            {[
              { label: "自动回复 (0-30分)", desc: "低价值询盘 · 标准话术自动发送", pct: "42%", color: "border-brand-green/30" },
              { label: "AI生成 + 人工审核 (31-70分)", desc: "中等价值 · 个性化回复待确认", pct: "35%", color: "border-brand-orange/30" },
              { label: "立即通知 + 深度分析 (71-100分)", desc: "高价值客户 · 触发Customer Agent", pct: "23%", color: "border-destructive/30" },
            ].map((s) => (
              <div key={s.label} className={`border ${s.color} rounded-lg p-2.5 bg-secondary/30`}>
                <div className="text-xs font-medium mb-0.5">{s.label}</div>
                <div className="text-[10px] text-muted-foreground">{s.desc}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{s.pct} <span className="text-muted-foreground/60">今日占比</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div className="flex gap-4 mb-4 border-b border-border pb-2">
          <button onClick={() => setActiveTab("logs")} className={cn("text-sm font-medium pb-0.5 transition-colors", activeTab === "logs" ? "text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground")}>
            自动回复日志
          </button>
          <button onClick={() => setActiveTab("pipeline")} className={cn("text-sm font-medium pb-0.5 transition-colors", activeTab === "pipeline" ? "text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground")}>
            销售管道
          </button>
        </div>

        {activeTab === "logs" ? (
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {autoReplyLogs.map((log) => {
              const actionInfo = actionLabels[log.action];
              const ActionIcon = actionInfo.icon;
              return (
                <div key={log.id} className="flex items-center gap-3 p-3 hover:bg-secondary/30 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold shrink-0">
                    {log.customer.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium">{log.customer} · <span className="text-muted-foreground">{log.company}</span></div>
                    <div className="text-[10px] text-muted-foreground truncate">{log.preview}</div>
                  </div>
                  <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">{log.intent}</span>
                  <span className="text-[10px] text-muted-foreground">P:{log.priority}</span>
                  <span className={cn("text-[10px] flex items-center gap-1", actionInfo.color)}>
                    <ActionIcon className="w-3 h-3" /> {actionInfo.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{log.time}</span>
                  {log.action === "pending_review" && (
                    <div className="flex gap-1">
                      <button className="w-6 h-6 rounded bg-brand-green/15 text-brand-green flex items-center justify-center hover:bg-brand-green/25"><ThumbsUp className="w-3 h-3" /></button>
                      <button className="w-6 h-6 rounded bg-destructive/15 text-destructive flex items-center justify-center hover:bg-destructive/25"><ThumbsDown className="w-3 h-3" /></button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex gap-2 overflow-x-auto">
              {pipelineStages.map((stage) => (
                <div key={stage.name} className="flex-1 min-w-[140px] bg-secondary/50 rounded-lg p-3 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                    <span className="text-xs font-medium">{stage.name}</span>
                    <span className="text-[10px] text-muted-foreground">{stage.count}个</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">预估 {stage.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
