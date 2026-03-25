/**
 * Dashboard - 控制台首页
 * 战略沙盘风格：KPI卡片、趋势图、最新询盘、Agent状态
 */
import {
  Inbox, Bot, Share2, Megaphone, Mail, Users,
  TrendingUp, ArrowUpRight, ArrowDownRight, Globe,
  Clock, Zap, MessageSquare, DollarSign,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { motion } from "framer-motion";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0, 0, 0.2, 1] as const } },
};

const inquiryTrend = [
  { date: "03/19", count: 8, ai: 5 },
  { date: "03/20", count: 15, ai: 12 },
  { date: "03/21", count: 12, ai: 9 },
  { date: "03/22", count: 22, ai: 18 },
  { date: "03/23", count: 18, ai: 14 },
  { date: "03/24", count: 25, ai: 20 },
  { date: "03/25", count: 31, ai: 26 },
];

const channelData = [
  { channel: "独立站", count: 45 },
  { channel: "WhatsApp", count: 32 },
  { channel: "LinkedIn", count: 28 },
  { channel: "邮件", count: 22 },
  { channel: "阿里巴巴", count: 15 },
];

const recentInquiries = [
  { id: 1, name: "John Smith", company: "TechCorp Ltd.", product: "LED Bulbs", qty: "5,000 pcs", channel: "WhatsApp", priority: "high" as const, time: "10分钟前" },
  { id: 2, name: "Maria Garcia", company: "EuroTrade GmbH", product: "Solar Panels", qty: "200 units", channel: "LinkedIn", priority: "high" as const, time: "25分钟前" },
  { id: 3, name: "Ahmed Hassan", company: "MidEast Import", product: "Steel Pipes", qty: "50 tons", channel: "邮件", priority: "medium" as const, time: "1小时前" },
  { id: 4, name: "Sarah Johnson", company: "Pacific Trading", product: "Phone Cases", qty: "10,000 pcs", channel: "独立站", priority: "medium" as const, time: "2小时前" },
  { id: 5, name: "Yuki Tanaka", company: "Japan Direct", product: "Tea Sets", qty: "500 sets", channel: "阿里巴巴", priority: "low" as const, time: "3小时前" },
];

const agentStatus = [
  { name: "全渠道聚合", status: "active", tasks: 12, icon: Inbox },
  { name: "智能响应", status: "active", tasks: 8, icon: Bot },
  { name: "社媒运营", status: "active", tasks: 5, icon: Share2 },
  { name: "广告投放", status: "idle", tasks: 0, icon: Megaphone },
  { name: "邮件营销", status: "active", tasks: 3, icon: Mail },
];

const priorityColors: Record<string, string> = {
  high: "bg-brand-orange/15 text-brand-orange",
  medium: "bg-brand-cyan/15 text-brand-cyan",
  low: "bg-muted text-muted-foreground",
};
const priorityLabels: Record<string, string> = { high: "高", medium: "中", low: "低" };

export default function Dashboard() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* Hero banner */}
      <motion.div variants={fadeUp} className="relative rounded-xl overflow-hidden bg-gradient-to-r from-card via-card to-secondary border border-border p-6">
        <div className="relative z-10">
          <h1 className="font-display text-2xl font-bold mb-2">欢迎回来，超级个人</h1>
          <p className="text-sm text-muted-foreground mb-4">
            您的AI Agent正在7×24小时运转。今日已自动处理 <span className="text-brand-orange font-semibold">26</span> 条询盘，
            AI回复率 <span className="text-brand-green font-semibold">83.9%</span>。
          </p>
          <div className="flex gap-2">
            <Link to="/inbox" className="text-xs font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity">
              查看询盘中心
            </Link>
            <Link to="/ai-sales" className="text-xs font-medium bg-secondary text-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors border border-border">
              AI销售面板
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 bg-gradient-to-l from-brand-orange to-transparent" />
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard title="今日询盘" value="31" change="+24%" trend="up" icon={MessageSquare} subtitle="vs 昨日25条" />
        <KPICard title="AI处理量" value="26" change="83.9%" trend="up" icon={Bot} subtitle="自动回复率" />
        <KPICard title="活跃客户" value="156" change="+12" trend="up" icon={Users} subtitle="本周新增" />
        <KPICard title="预估成交" value="$48.5K" change="+15%" trend="up" icon={DollarSign} subtitle="vs 上月同期" />
      </motion.div>

      {/* Charts row */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Inquiry trend */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="mb-4">
            <h3 className="font-display font-semibold text-sm">询盘趋势</h3>
            <p className="text-[11px] text-muted-foreground">近7日询盘量与AI处理量</p>
          </div>
          <div className="flex gap-4 mb-3 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-orange" /> 总询盘</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-cyan" /> AI处理</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={inquiryTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 10% 20%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(230 10% 55%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(230 10% 55%)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(230 12% 14%)", border: "1px solid hsl(230 10% 23%)", borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="count" stroke="hsl(30 90% 55%)" fill="hsl(30 90% 55% / 0.15)" strokeWidth={2} />
              <Area type="monotone" dataKey="ai" stroke="hsl(190 70% 50%)" fill="hsl(190 70% 50% / 0.1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Channel distribution */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="mb-4">
            <h3 className="font-display font-semibold text-sm">渠道分布</h3>
            <p className="text-[11px] text-muted-foreground">各渠道询盘占比</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={channelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 10% 20%)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(230 10% 55%)" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="channel" type="category" tick={{ fontSize: 11, fill: "hsl(230 10% 80%)" }} axisLine={false} tickLine={false} width={60} />
              <Tooltip contentStyle={{ background: "hsl(230 12% 14%)", border: "1px solid hsl(230 10% 23%)", borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="count" fill="hsl(30 90% 55%)" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Bottom row */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent inquiries */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-sm">最新询盘</h3>
              <p className="text-[11px] text-muted-foreground">实时更新的全渠道询盘</p>
            </div>
            <Link to="/inbox" className="text-[11px] text-brand-orange hover:underline">查看全部</Link>
          </div>
          <div className="space-y-1">
            {recentInquiries.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold shrink-0">
                  {item.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{item.name} · <span className="text-muted-foreground">{item.company}</span></div>
                  <div className="text-[10px] text-muted-foreground">{item.product} · {item.qty}</div>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${priorityColors[item.priority]}`}>{priorityLabels[item.priority]}</span>
                <span className="text-[10px] text-muted-foreground hidden sm:block">{item.channel}</span>
                <span className="text-[10px] text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Agent status */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="mb-4">
            <h3 className="font-display font-semibold text-sm">AI Agent 状态</h3>
            <p className="text-[11px] text-muted-foreground">实时运行状态监控</p>
          </div>
          <div className="space-y-2">
            {agentStatus.map((agent) => {
              const Icon = agent.icon;
              return (
                <div key={agent.name} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                  <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium">{agent.name}</div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${agent.status === "active" ? "bg-brand-green" : "bg-muted-foreground"}`} />
                      {agent.status === "active" ? `处理中 · ${agent.tasks}个任务` : "空闲"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function KPICard({ title, value, change, trend, icon: Icon, subtitle }: {
  title: string; value: string; change: string; trend: "up" | "down"; icon: React.ElementType; subtitle: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{title}</span>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="text-xl font-display font-bold">{value}</div>
      <div className="flex items-center gap-1 mt-1">
        {trend === "up" ? (
          <ArrowUpRight className="w-3 h-3 text-brand-green" />
        ) : (
          <ArrowDownRight className="w-3 h-3 text-destructive" />
        )}
        <span className={`text-[10px] font-medium ${trend === "up" ? "text-brand-green" : "text-destructive"}`}>{change}</span>
        <span className="text-[10px] text-muted-foreground">{subtitle}</span>
      </div>
    </div>
  );
}
