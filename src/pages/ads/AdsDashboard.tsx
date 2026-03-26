/**
 * AdsDashboard - 广告投放控制台
 */
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { DollarSign, MessageSquare, Target, Layers, CheckCircle, AlertTriangle, Info, Play, Pause, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const mockCampaigns = [
  { id: "1", name: "LED灯推广-美国市场", status: "active" as const, spend: 120, leads: 8, cpa: 15.0, impressions: 12000, clicks: 240, ctr: 2.0 },
  { id: "2", name: "LED灯推广-欧洲市场", status: "active" as const, spend: 85, leads: 6, cpa: 14.2, impressions: 8500, clicks: 170, ctr: 2.0 },
  { id: "3", name: "LED灯推广-中东市场", status: "learning" as const, spend: 40, leads: 4, cpa: 10.0, impressions: 4000, clicks: 100, ctr: 2.5 },
  { id: "4", name: "LED灯推广-测试A", status: "paused" as const, spend: 0, leads: 0, cpa: 0, impressions: 0, clicks: 0, ctr: 0 },
];

const mockLogs = [
  { time: "15:23", type: "success" as const, message: '增加了"LED灯-美国"预算20%' },
  { time: "14:45", type: "warning" as const, message: '提交审核: 建议暂停"LED灯-测试A"' },
  { time: "13:30", type: "success" as const, message: "优化了受众定向，缩小到高转化地区" },
  { time: "12:15", type: "success" as const, message: "暂停了表现差的广告素材C" },
  { time: "11:00", type: "info" as const, message: "完成每日数据分析" },
];

const statusConfig = {
  active: { label: "运行中", color: "text-brand-green", bg: "bg-brand-green/20", icon: Play },
  learning: { label: "学习期", color: "text-brand-orange", bg: "bg-brand-orange/20", icon: Eye },
  paused: { label: "已暂停", color: "text-destructive", bg: "bg-destructive/20", icon: Pause },
};

const logIcons = {
  success: <CheckCircle className="w-3.5 h-3.5 text-brand-green shrink-0" />,
  warning: <AlertTriangle className="w-3.5 h-3.5 text-brand-orange shrink-0" />,
  info: <Info className="w-3.5 h-3.5 text-primary shrink-0" />,
};

export default function AdsDashboard() {
  const [autoEnabled, setAutoEnabled] = useState(true);

  const handleToggle = (checked: boolean) => {
    setAutoEnabled(checked);
    toast({
      title: checked ? "✅ AI自动投放已开启" : "⚠️ AI自动投放已关闭",
      description: checked ? "AI将自动优化广告表现" : "需要手动管理广告",
    });
  };

  const totalSpend = mockCampaigns.reduce((s, c) => s + c.spend, 0);
  const totalLeads = mockCampaigns.reduce((s, c) => s + c.leads, 0);
  const avgCpa = totalLeads > 0 ? (totalSpend / totalLeads).toFixed(1) : "—";
  const activeCount = mockCampaigns.filter((c) => c.status === "active").length;
  const pausedCount = mockCampaigns.filter((c) => c.status === "paused").length;

  const kpis = [
    { label: "今日花费", value: `$${totalSpend}`, sub: "/ $500预算", icon: DollarSign },
    { label: "获得询盘", value: `${totalLeads}条`, sub: "↑ 25% vs昨日", icon: MessageSquare, trend: "up" as const },
    { label: "单个询盘成本", value: `$${avgCpa}`, sub: "✓ 低于目标", icon: Target },
    { label: "广告系列", value: `${activeCount}个运行中`, sub: `${pausedCount}个已暂停`, icon: Layers },
  ];

  return (
    <div className="space-y-4">
      {/* Auto toggle */}
      <Card className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("w-2 h-2 rounded-full", autoEnabled ? "bg-brand-green animate-pulse" : "bg-muted-foreground")} />
          <div>
            <span className="text-sm font-medium">AI自动投放</span>
            <span className="text-[11px] text-muted-foreground ml-2">
              状态: {autoEnabled ? "运行中" : "已关闭"} | 最后优化: 15分钟前
            </span>
          </div>
        </div>
        <Switch checked={autoEnabled} onCheckedChange={handleToggle} />
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-muted-foreground">{kpi.label}</span>
                <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </div>
              <div className="text-xl font-display font-bold">{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground mt-1">
                {kpi.trend === "up" && <span className="text-brand-green">↑ </span>}
                {kpi.sub}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Campaign Table */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-display font-semibold text-sm">广告系列</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-4 py-2.5 font-medium">系列名称</th>
                <th className="text-left px-4 py-2.5 font-medium">状态</th>
                <th className="text-right px-4 py-2.5 font-medium">花费</th>
                <th className="text-right px-4 py-2.5 font-medium">询盘</th>
                <th className="text-right px-4 py-2.5 font-medium">CPA</th>
                <th className="text-right px-4 py-2.5 font-medium">CTR</th>
                <th className="text-center px-4 py-2.5 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockCampaigns.map((c) => {
                const sc = statusConfig[c.status];
                const StatusIcon = sc.icon;
                return (
                  <tr key={c.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className={cn("text-[10px]", sc.bg, sc.color, "border-0")}>
                        <StatusIcon className="w-3 h-3 mr-1" />{sc.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">${c.spend}</td>
                    <td className="px-4 py-3 text-right">{c.leads}条</td>
                    <td className="px-4 py-3 text-right">{c.cpa > 0 ? `$${c.cpa}` : "—"}</td>
                    <td className="px-4 py-3 text-right">{c.ctr > 0 ? `${c.ctr}%` : "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <Button variant="ghost" size="sm" className="text-[11px] h-6 px-2">查看</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* AI Activity Log */}
      <Card className="p-4">
        <h3 className="font-display font-semibold text-sm mb-3">AI优化动态</h3>
        <ScrollArea className="h-[180px]">
          <div className="space-y-2.5 pr-3">
            {mockLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-2.5">
                {logIcons[log.type]}
                <div className="flex-1 min-w-0">
                  <span className="text-xs">{log.message}</span>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{log.time}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
