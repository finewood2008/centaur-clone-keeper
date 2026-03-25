/**
 * AdsCommand - 广告投放集中控制台
 */
import {
  Megaphone, TrendingUp, DollarSign, Eye,
  MousePointerClick, Target, BarChart3, ArrowUpRight,
  ArrowDownRight, Pause, Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const roiData = [
  { date: "W1", spend: 1200, revenue: 3500 },
  { date: "W2", spend: 1500, revenue: 4200 },
  { date: "W3", spend: 1800, revenue: 5800 },
  { date: "W4", spend: 2000, revenue: 6100 },
];

const campaigns = [
  { id: 1, name: "LED Bulbs - US Market", platform: "Google Ads", status: "active", budget: "$500/day", spent: "$3,250", impressions: "45.2K", clicks: "1,820", ctr: "4.03%", conversions: 28, cpa: "$116", roas: "3.2x" },
  { id: 2, name: "Solar Panels - EU", platform: "LinkedIn Ads", status: "active", budget: "$300/day", spent: "$1,890", impressions: "22.1K", clicks: "890", ctr: "4.03%", conversions: 15, cpa: "$126", roas: "2.8x" },
  { id: 3, name: "B2B Brand Awareness", platform: "Facebook Ads", status: "paused", budget: "$200/day", spent: "$1,200", impressions: "68.5K", clicks: "2,100", ctr: "3.07%", conversions: 8, cpa: "$150", roas: "1.9x" },
  { id: 4, name: "Product Retargeting", platform: "Google Ads", status: "active", budget: "$150/day", spent: "$980", impressions: "12.3K", clicks: "620", ctr: "5.04%", conversions: 12, cpa: "$82", roas: "4.1x" },
];

export default function AdsCommand() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-semibold text-lg">广告投放集中控制台</h2>
        <p className="text-xs text-muted-foreground">Ads Command Center · 跨平台广告管理与ROI优化</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "总投放预算", value: "$7,320", sub: "本月已消耗" },
          { label: "总曝光量", value: "148K", sub: "+22%" },
          { label: "转化数", value: "63", sub: "CPA: $116" },
          { label: "平均ROAS", value: "3.0x", sub: "投入产出比" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-xl p-4">
            <div className="text-xs text-muted-foreground mb-1">{kpi.label}</div>
            <div className="text-xl font-display font-bold">{kpi.value}</div>
            <div className="text-[10px] text-muted-foreground mt-1">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* ROI Chart */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-display font-semibold text-sm mb-1">投入产出趋势</h3>
        <p className="text-[10px] text-muted-foreground mb-4">近4周广告花费 vs 带来的收入</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={roiData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 10% 20%)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(230 10% 55%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(230 10% 55%)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "hsl(230 12% 14%)", border: "1px solid hsl(230 10% 23%)", borderRadius: 8, fontSize: 11 }} />
            <Bar dataKey="spend" fill="hsl(230 10% 40%)" radius={[4, 4, 0, 0]} barSize={20} name="花费" />
            <Bar dataKey="revenue" fill="hsl(30 90% 55%)" radius={[4, 4, 0, 0]} barSize={20} name="收入" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Campaign table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-display font-semibold text-sm">广告活动</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-4 py-2 font-medium">活动名称</th>
                <th className="text-left px-4 py-2 font-medium">平台</th>
                <th className="text-left px-4 py-2 font-medium">状态</th>
                <th className="text-left px-4 py-2 font-medium">已消耗</th>
                <th className="text-left px-4 py-2 font-medium">曝光</th>
                <th className="text-left px-4 py-2 font-medium">点击</th>
                <th className="text-left px-4 py-2 font-medium">转化</th>
                <th className="text-left px-4 py-2 font-medium">ROAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.platform}</td>
                  <td className="px-4 py-3">
                    <span className={cn("flex items-center gap-1", c.status === "active" ? "text-brand-green" : "text-muted-foreground")}>
                      {c.status === "active" ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                      {c.status === "active" ? "运行中" : "已暂停"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{c.spent}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.impressions}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.clicks}</td>
                  <td className="px-4 py-3">{c.conversions}</td>
                  <td className={cn("px-4 py-3 font-medium",
                    parseFloat(c.roas) >= 3 ? "text-brand-green" : parseFloat(c.roas) >= 2 ? "text-brand-orange" : "text-destructive"
                  )}>{c.roas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
