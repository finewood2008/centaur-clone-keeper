/**
 * InquiryTrendChart - Premium Area Chart with glow lines
 */
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const trendData = [
  { date: "03/19", total: 8, ai: 5 },
  { date: "03/20", total: 15, ai: 12 },
  { date: "03/21", total: 12, ai: 9 },
  { date: "03/22", total: 22, ai: 18 },
  { date: "03/23", total: 18, ai: 14 },
  { date: "03/24", total: 25, ai: 20 },
  { date: "03/25", total: 31, ai: 26 },
];

export default function InquiryTrendChart() {
  const totalInquiries = trendData.reduce((s, d) => s + d.total, 0);
  const totalAI = trendData.reduce((s, d) => s + d.ai, 0);
  const aiRate = ((totalAI / totalInquiries) * 100).toFixed(1);

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-sm text-foreground">询盘趋势</h3>
          <p className="text-[11px] text-white/35">近7日询盘量与AI处理量</p>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="pill-badge">
            总计 <span className="text-foreground font-semibold">{totalInquiries}</span>
          </span>
          <span className="pill-badge">
            AI处理率 <span className="text-brand-green font-semibold">{aiRate}%</span>
          </span>
        </div>
      </div>
      <div className="flex gap-4 mb-3 text-[10px]">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary glow-orange" /> <span className="text-white/50">总询盘</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-brand-cyan glow-cyan" /> <span className="text-white/50">AI处理</span>
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={trendData}>
          <defs>
            <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(30 90% 55%)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="hsl(30 90% 55%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradAI" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(190 80% 55%)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="hsl(190 80% 55%)" stopOpacity={0} />
            </linearGradient>
            <filter id="glowOrange">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glowCyan">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="4 8" stroke="hsla(0,0%,100%,0.04)" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsla(0,0%,100%,0.3)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "hsla(0,0%,100%,0.3)" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "hsla(225,15%,8%,0.9)",
              backdropFilter: "blur(16px)",
              border: "1px solid hsla(0,0%,100%,0.1)",
              borderRadius: 12,
              fontSize: 11,
              boxShadow: "0 8px 32px hsla(0,0%,0%,0.4)",
            }}
            formatter={(value: number, name: string) => [
              `${value}条`,
              name === "total" ? "总询盘" : "AI处理",
            ]}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="hsl(30 90% 55%)"
            fill="url(#gradTotal)"
            strokeWidth={2.5}
            filter="url(#glowOrange)"
            dot={false}
            activeDot={{ r: 4, fill: "hsl(30 90% 55%)", stroke: "hsl(30 90% 65%)", strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="ai"
            stroke="hsl(190 80% 55%)"
            fill="url(#gradAI)"
            strokeWidth={2.5}
            filter="url(#glowCyan)"
            dot={false}
            activeDot={{ r: 4, fill: "hsl(190 80% 55%)", stroke: "hsl(190 80% 65%)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
