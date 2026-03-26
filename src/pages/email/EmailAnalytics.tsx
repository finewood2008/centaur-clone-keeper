/**
 * EmailAnalytics - 数据分析
 */
import { useState } from "react";
import { TrendingUp, Mail, Eye, MousePointerClick, Reply, Check, X, Lightbulb, FlaskConical, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell } from "recharts";
import { Progress } from "@/components/ui/progress";

const trendData = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 2, i + 1);
  const sent = Math.floor(30 + Math.random() * 60);
  return {
    date: `${d.getMonth() + 1}/${d.getDate()}`,
    sent,
    openRate: Math.round(35 + Math.random() * 20),
  };
});

const campaigns = [
  { name: "LED Buyers - North America Q1", status: "active", sent: 450, openRate: 44, clicked: 67, replyRate: 5.1 },
  { name: "Solar Panel Follow-up Sequence", status: "active", sent: 120, openRate: 65, clicked: 34, replyRate: 12.5 },
  { name: "Monthly Product Newsletter", status: "completed", sent: 850, openRate: 40, clicked: 89, replyRate: 0.6 },
];

const abTests = [
  {
    id: "1",
    campaign: "LED Buyers - North America Q1",
    status: "completed" as const,
    startDate: "2026-03-15",
    sampleSize: 450,
    variants: [
      { name: "A", subject: "5 Year Warranty LED Bulbs - Factory Direct", sent: 225, opened: 99, openRate: 44.0, clicked: 38, clickRate: 16.9, replied: 14, replyRate: 6.2, isWinner: true },
      { name: "B", subject: "Save 30% on LED Lighting - Limited Offer", sent: 225, opened: 72, openRate: 32.0, clicked: 25, clickRate: 11.1, replied: 9, replyRate: 4.0, isWinner: false },
    ],
    confidence: 95,
  },
  {
    id: "2",
    campaign: "Solar Panel Follow-up Sequence",
    status: "running" as const,
    startDate: "2026-03-22",
    sampleSize: 120,
    variants: [
      { name: "A", subject: "Quick question about your solar needs", sent: 60, opened: 31, openRate: 51.7, clicked: 18, clickRate: 30.0, replied: 9, replyRate: 15.0, isWinner: false },
      { name: "B", subject: "How {{companyName}} can cut energy costs 40%", sent: 60, opened: 38, openRate: 63.3, clicked: 22, clickRate: 36.7, replied: 11, replyRate: 18.3, isWinner: false },
    ],
    confidence: 78,
  },
  {
    id: "3",
    campaign: "Monthly Product Newsletter",
    status: "completed" as const,
    startDate: "2026-03-01",
    sampleSize: 850,
    variants: [
      { name: "A", subject: "March Product Updates & New Arrivals", sent: 425, opened: 153, openRate: 36.0, clicked: 38, clickRate: 8.9, replied: 2, replyRate: 0.5, isWinner: false },
      { name: "B", subject: "3 New Products You Need to See This Month", sent: 425, opened: 187, openRate: 44.0, clicked: 51, clickRate: 12.0, replied: 3, replyRate: 0.7, isWinner: true },
    ],
    confidence: 97,
  },
];

const abStatusConfig: Record<string, { label: string; className: string }> = {
  running: { label: "测试中", className: "bg-primary/15 text-primary" },
  completed: { label: "已完成", className: "bg-brand-green/15 text-brand-green" },
};
const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "进行中", className: "bg-brand-green/15 text-brand-green" },
  completed: { label: "已完成", className: "bg-brand-cyan/15 text-brand-cyan" },
};

interface Optimization {
  id: string; priority: "high" | "medium"; title: string; description: string; expectedImprovement: string;
}

const initialOptimizations: Optimization[] = [
  { id: "1", priority: "high", title: "调整发送时间到上午10-11点", description: "数据显示这个时间段打开率提高18%", expectedImprovement: "打开率+18%" },
  { id: "2", priority: "medium", title: "主题行添加数字和问号", description: "包含数字的主题行打开率高12%", expectedImprovement: "打开率+12%" },
  { id: "3", priority: "high", title: "对257个未打开用户重发", description: "重发可能获得额外70个打开", expectedImprovement: "额外70个打开" },
];

const priorityConfig: Record<string, { label: string; className: string }> = {
  high: { label: "高优先级", className: "bg-brand-green/15 text-brand-green" },
  medium: { label: "中优先级", className: "bg-primary/15 text-primary" },
};

export default function EmailAnalytics() {
  const [optimizations, setOptimizations] = useState(initialOptimizations);

  const handleAdopt = async (id: string) => {
    const opt = optimizations.find((o) => o.id === id);
    toast.loading(`正在应用优化: ${opt?.title}`);
    await new Promise((r) => setTimeout(r, 1500));
    toast.dismiss();
    setOptimizations((prev) => prev.filter((o) => o.id !== id));
    toast.success("优化已应用！");
  };

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "本月已发送", value: "1,420封", sub: "↑ 18% vs上月", icon: Mail },
          { label: "平均打开率", value: "43.4%", sub: "🟢 高于行业21%", icon: Eye },
          { label: "平均点击率", value: "6.8%", sub: "↑ 1.2% vs上月", icon: MousePointerClick },
          { label: "总回复数", value: "43条", sub: "↑ 12条 vs上月", icon: Reply },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Icon className="w-3.5 h-3.5" /> {kpi.label}
              </div>
              <div className="text-xl font-display font-bold">{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground mt-1">{kpi.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trend chart + campaign ranking */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-display font-semibold text-sm mb-3">发送量与打开率趋势（最近30天）</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={4} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} unit="%" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line yAxisId="left" type="monotone" dataKey="sent" name="发送量" stroke="hsl(var(--brand-cyan))" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="openRate" name="打开率%" stroke="hsl(var(--brand-green))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* A/B Test Section */}
          <div className="bg-card border border-border rounded-xl">
            <div className="px-4 py-3 border-b border-border flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-primary" />
              <h3 className="font-display font-semibold text-sm">A/B 测试对比</h3>
            </div>
            <div className="divide-y divide-border">
              {abTests.map((test) => {
                const s = abStatusConfig[test.status];
                const chartData = test.variants.map((v) => ({
                  name: `版本 ${v.name}`,
                  openRate: v.openRate,
                  clickRate: v.clickRate,
                  replyRate: v.replyRate,
                }));
                const winner = test.variants.find((v) => v.isWinner);
                return (
                  <div key={test.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold">{test.campaign}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">开始: {test.startDate} · 样本: {test.sampleSize}封</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded", s.className)}>{s.label}</span>
                        {test.status === "completed" && winner && (
                          <Badge variant="outline" className="text-[10px] h-4 text-primary border-primary/30 flex items-center gap-0.5">
                            <Trophy className="w-2.5 h-2.5" /> 版本{winner.name}胜出
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Variant comparison */}
                    <div className="grid grid-cols-2 gap-3">
                      {test.variants.map((v) => (
                        <div key={v.name} className={cn("rounded-lg p-3 border text-xs space-y-2",
                          v.isWinner ? "border-brand-green/40 bg-brand-green/5" : "border-border bg-secondary/20"
                        )}>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold flex items-center gap-1">
                              版本 {v.name}
                              {v.isWinner && <Trophy className="w-3 h-3 text-brand-green" />}
                            </span>
                            <span className="text-[10px] text-muted-foreground">{v.sent}封</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground italic truncate" title={v.subject}>
                            &ldquo;{v.subject}&rdquo;
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">打开率</span>
                              <span className="font-bold">{v.openRate}%</span>
                            </div>
                            <Progress value={v.openRate} className="h-1" />
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">点击率</span>
                              <span className="font-bold">{v.clickRate}%</span>
                            </div>
                            <Progress value={v.clickRate * 2} className="h-1" />
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">回复率</span>
                              <span className="font-bold">{v.replyRate}%</span>
                            </div>
                            <Progress value={v.replyRate * 5} className="h-1" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Confidence */}
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-muted-foreground">统计置信度:</span>
                      <div className="flex-1 max-w-32">
                        <Progress value={test.confidence} className="h-1" />
                      </div>
                      <span className={cn("font-bold", test.confidence >= 95 ? "text-brand-green" : "text-primary")}>{test.confidence}%</span>
                      {test.confidence >= 95 ? (
                        <span className="text-brand-green">✓ 结果可靠</span>
                      ) : (
                        <span className="text-primary">需要更多数据</span>
                      )}
                    </div>

                    {/* Bar chart comparison */}
                    <ResponsiveContainer width="100%" height={100}>
                      <BarChart data={chartData} barGap={4}>
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} unit="%" />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                        <Bar dataKey="openRate" name="打开率" fill="hsl(var(--brand-cyan))" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="clickRate" name="点击率" fill="hsl(var(--brand-green))" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="replyRate" name="回复率" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="font-display font-semibold text-sm">邮件活动表现排行</h3>
            </div>
            <div className="divide-y divide-border">
              {campaigns.map((c, i) => {
                const s = statusConfig[c.status];
                return (
                  <div key={i} className="p-3 flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</div>
                    <div className="flex-1">
                      <div className="text-xs font-medium">{c.name}</div>
                      <div className="flex gap-3 text-[10px] text-muted-foreground mt-0.5">
                        <span>{c.sent}发送</span>
                        <span>{c.openRate}%打开</span>
                        <span>{c.clicked}点击</span>
                        <span>{c.replyRate}%回复</span>
                      </div>
                    </div>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded", s.className)}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI optimization suggestions */}
        <div className="bg-card border border-border rounded-xl h-fit">
          <div className="px-4 py-3 border-b border-border flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-primary" />
            <h3 className="font-display font-semibold text-sm">AI优化建议</h3>
          </div>
          <div className="divide-y divide-border">
            {optimizations.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">暂无新建议 ✓</div>
            ) : optimizations.map((opt) => {
              const p = priorityConfig[opt.priority];
              return (
                <div key={opt.id} className="p-3 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded", p.className)}>{p.label}</span>
                  </div>
                  <div className="text-xs font-medium">{opt.title}</div>
                  <div className="text-[10px] text-muted-foreground">{opt.description}</div>
                  <div className="text-[10px] text-brand-green">预计: {opt.expectedImprovement}</div>
                  <div className="flex gap-1.5">
                    <Button size="sm" className="h-6 text-[10px] px-2" onClick={() => handleAdopt(opt.id)}>
                      <Check className="w-3 h-3 mr-0.5" /> 采纳
                    </Button>
                    <Button size="sm" variant="outline" className="h-6 text-[10px] px-2"
                      onClick={() => { setOptimizations((prev) => prev.filter((o) => o.id !== opt.id)); toast("已忽略"); }}>
                      <X className="w-3 h-3 mr-0.5" /> 忽略
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
