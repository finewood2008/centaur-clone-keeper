/**
 * 消费中心主页 - 本月消费概览 + Agent消费明细 + 趋势图 + 消费记录
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coins, TrendingUp, CreditCard, Settings, ChevronRight,
  Bot, FileText, ArrowUpRight, Download, Gift, Check, Sparkles,
  Tag, X, Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { Link } from "react-router-dom";

/* ─── mock data ─── */
const planInfo = { name: "专业版", price: 1299, totalPoints: 15000, usedPoints: 11550, expiry: "2026-12-31" };
const usagePercent = Math.round((planInfo.usedPoints / planInfo.totalPoints) * 100);

const agentConsumption = [
  { name: "客户服务 Agent", points: 3570, pct: 31, calls: 485, color: "hsl(var(--chart-1))" },
  { name: "邮件处理 Agent", points: 2660, pct: 23, calls: 356, color: "hsl(var(--chart-2))" },
  { name: "产品推荐 Agent", points: 4740, pct: 41, calls: 627, color: "hsl(var(--chart-4))" },
  { name: "订单跟进 Agent", points: 460, pct: 4, calls: 62, color: "hsl(var(--chart-3))" },
  { name: "数据分析 Agent", points: 120, pct: 1, calls: 10, color: "hsl(var(--chart-5))" },
];

const trendData = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}日`,
  points: Math.floor(200 + Math.random() * 500),
}));

const recentRecords = [
  { time: "2026-03-27 01:35", agent: "客户服务Agent", op: "处理客户咨询", points: 15, trigger: "heartbeat" },
  { time: "2026-03-27 01:30", agent: "邮件处理Agent", op: "发送跟进邮件", points: 12, trigger: "manual" },
  { time: "2026-03-27 01:25", agent: "产品推荐Agent", op: "生成推荐列表", points: 23, trigger: "heartbeat" },
  { time: "2026-03-27 01:20", agent: "订单跟进Agent", op: "更新订单状态", points: 8, trigger: "manual" },
  { time: "2026-03-27 01:15", agent: "客户服务Agent", op: "处理客户咨询", points: 15, trigger: "heartbeat" },
  { time: "2026-03-27 01:10", agent: "数据分析Agent", op: "生成日报", points: 78, trigger: "scheduled" },
  { time: "2026-03-27 01:05", agent: "邮件处理Agent", op: "自动归类邮件", points: 10, trigger: "heartbeat" },
  { time: "2026-03-27 00:55", agent: "产品推荐Agent", op: "更新推荐模型", points: 45, trigger: "scheduled" },
];

const triggerLabel: Record<string, string> = { heartbeat: "自动", manual: "手动", scheduled: "定时" };
const triggerColor: Record<string, string> = { heartbeat: "bg-brand-cyan/15 text-brand-cyan", manual: "bg-primary/15 text-primary", scheduled: "bg-brand-green/15 text-brand-green" };

function getUsageColor(pct: number) {
  if (pct < 70) return "text-brand-green";
  if (pct < 90) return "text-primary";
  if (pct <= 100) return "text-[hsl(25,90%,50%)]";
  return "text-destructive";
}

/* ─── Agent Detail Dialog ─── */
function AgentDetail({ agent, onClose }: { agent: typeof agentConsumption[0]; onClose: () => void }) {
  const dailyData = Array.from({ length: 7 }, (_, i) => ({
    day: `${21 + i}日`,
    calls: Math.floor(20 + Math.random() * 80),
    points: Math.floor(100 + Math.random() * 600),
  }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-2xl mx-4 bg-card border border-border rounded-xl p-4 md:p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: agent.color + "22" }}>
              <Bot className="w-5 h-5" style={{ color: agent.color }} />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">{agent.name}</h3>
              <p className="text-xs text-muted-foreground">消费详情</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>关闭</Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[{ l: "总调用", v: `${agent.calls} 次` }, { l: "点数消耗", v: `${agent.points.toLocaleString()}` }, { l: "平均每次", v: `${Math.round(agent.points / agent.calls)} 点` }].map(s => (
            <Card key={s.l} className="bg-secondary/50 border-border">
              <CardContent className="p-3 text-center">
                <div className="text-xs text-muted-foreground">{s.l}</div>
                <div className="text-lg font-display font-bold text-foreground mt-1">{s.v}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="h-48 mb-4">
          <ResponsiveContainer>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="points" fill={agent.color} radius={[4, 4, 0, 0]} name="点数" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Coupon data ─── */
const validCoupons: Record<string, { label: string; type: "percent" | "fixed"; value: number }> = {
  "CHARGE10": { label: "充值立减", type: "percent", value: 10 },
  "NEW50": { label: "新用户优惠", type: "fixed", value: 50 },
  "VIP20": { label: "VIP专属优惠", type: "percent", value: 20 },
};

/* ─── Recharge Dialog ─── */
const rechargeTiers = [
  { id: 1, price: 100, points: 1000, bonus: 0 },
  { id: 2, price: 500, points: 5500, bonus: 500 },
  { id: 3, price: 1000, points: 12000, bonus: 2000, popular: true },
  { id: 4, price: 2000, points: 26000, bonus: 6000 },
  { id: 5, price: 5000, points: 70000, bonus: 20000 },
];

function RechargeDialog({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState(3);
  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; label: string; discount: number } | null>(null);

  const tier = rechargeTiers.find(t => t.id === selected)!;
  const discount = appliedCoupon?.discount ?? 0;
  const finalPrice = Math.max(0, tier.price - discount);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    setCouponStatus("checking");
    setTimeout(() => {
      const coupon = validCoupons[couponCode.trim().toUpperCase()];
      if (coupon) {
        const discountAmount = coupon.type === "percent" ? Math.round(tier.price * coupon.value / 100) : coupon.value;
        setAppliedCoupon({ code: couponCode.trim().toUpperCase(), label: coupon.label, discount: discountAmount });
        setCouponStatus("valid");
      } else {
        setAppliedCoupon(null);
        setCouponStatus("invalid");
      }
    }, 800);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponStatus("idle");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-lg bg-card border border-border rounded-xl shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 pb-3 border-b border-border">
          <h3 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" /> 充值点数
          </h3>
          <p className="text-xs text-muted-foreground mt-1">选择充值档位，多买多送</p>
        </div>

        {/* Tiers */}
        <div className="p-5 space-y-2">
          {rechargeTiers.map(t => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`w-full flex items-center justify-between p-3.5 rounded-lg border transition-all text-left ${
                selected === t.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border hover:border-muted-foreground/30 hover:bg-secondary/30"
              }`}
            >
              <div className="flex items-center gap-3">
                {selected === t.id ? (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"><Check className="w-3 h-3 text-primary-foreground" /></div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">¥{t.price.toLocaleString()}</span>
                    {t.popular && <Badge className="bg-primary/15 text-primary border-0 text-[10px] px-1.5">最受欢迎</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {t.points.toLocaleString()} 点数
                    {t.bonus > 0 && <span className="text-brand-green ml-1">（含赠送 {t.bonus.toLocaleString()}）</span>}
                  </div>
                </div>
              </div>
              {t.bonus > 0 && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-green/10">
                  <Gift className="w-3 h-3 text-brand-green" />
                  <span className="text-[10px] font-medium text-brand-green">送{t.bonus.toLocaleString()}</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Coupon */}
        <div className="mx-5 mt-0">
          <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1"><Tag className="w-3 h-3" /> 优惠券</div>
          {appliedCoupon ? (
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-brand-green/30 bg-brand-green/5">
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-brand-green" />
                <div>
                  <div className="text-xs font-medium text-foreground">{appliedCoupon.code}</div>
                  <div className="text-[10px] text-brand-green">{appliedCoupon.label} · 已优惠 ¥{appliedCoupon.discount.toLocaleString()}</div>
                </div>
              </div>
              <button onClick={handleRemoveCoupon} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="输入优惠码"
                value={couponCode}
                onChange={e => { setCouponCode(e.target.value); if (couponStatus !== "idle") setCouponStatus("idle"); }}
                onKeyDown={e => e.key === "Enter" && handleApplyCoupon()}
                className="h-8 text-xs flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                className="text-xs shrink-0"
                onClick={handleApplyCoupon}
                disabled={!couponCode.trim() || couponStatus === "checking"}
              >
                {couponStatus === "checking" ? <Loader2 className="w-3 h-3 animate-spin" /> : "使用"}
              </Button>
            </div>
          )}
          {couponStatus === "invalid" && <p className="text-[10px] text-destructive mt-1">优惠码无效，请检查后重试</p>}
          {couponStatus === "idle" && !appliedCoupon && <p className="text-[10px] text-muted-foreground mt-1">试试: CHARGE10, NEW50, VIP20</p>}
        </div>

        {/* Summary */}
        <div className="mx-5 mt-3 p-3 rounded-lg bg-secondary/50 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">支付金额</span>
            <span className="font-medium text-foreground">¥{tier.price.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">获得点数</span>
            <span className="font-medium text-foreground">{(tier.points - tier.bonus).toLocaleString()}</span>
          </div>
          {tier.bonus > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1"><Sparkles className="w-3 h-3 text-brand-green" /> 赠送点数</span>
              <span className="font-medium text-brand-green">+{tier.bonus.toLocaleString()}</span>
            </div>
          )}
          {appliedCoupon && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-brand-green flex items-center gap-1"><Tag className="w-3 h-3" /> 优惠券减免</span>
              <span className="font-medium text-brand-green">-¥{appliedCoupon.discount.toLocaleString()}</span>
            </div>
          )}
          <div className="border-t border-border pt-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">总计到账</span>
            <span className="font-display font-bold text-primary text-sm">{tier.points.toLocaleString()} 点数</span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 pt-4 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={onClose}>取消</Button>
          <Button size="sm" className="flex-1 text-xs gap-1" onClick={onClose}>
            <CreditCard className="w-3.5 h-3.5" /> 立即支付 ¥{finalPrice.toLocaleString()}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Page ─── */
export default function BillingCenter() {
  const [selectedAgent, setSelectedAgent] = useState<typeof agentConsumption[0] | null>(null);
  const [showRecharge, setShowRecharge] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" /> 消费中心
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">透明计费 · 实时监控 · 灵活控制</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/billing/settings"><Button variant="outline" size="sm" className="text-xs gap-1"><Settings className="w-3.5 h-3.5" /> 设置</Button></Link>
          <Link to="/billing/invoice"><Button variant="outline" size="sm" className="text-xs gap-1"><FileText className="w-3.5 h-3.5" /> 账单</Button></Link>
          <Button size="sm" className="text-xs gap-1" onClick={() => setShowRecharge(true)}><CreditCard className="w-3.5 h-3.5" /> 充值</Button>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Plan card */}
        <Card className="lg:col-span-2 glass-panel border-border">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-xs text-muted-foreground">本月消费</div>
                <div className="text-2xl font-display font-bold text-foreground mt-1">¥{planInfo.price.toLocaleString()}.00</div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  订阅费 ¥{planInfo.price} ({planInfo.name}) · 额外充值 ¥0.00
                </div>
              </div>
              <Badge variant="outline" className="border-primary/30 text-primary text-xs">{planInfo.name}</Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">套餐点数</span>
                <span className={`font-medium ${getUsageColor(usagePercent)}`}>
                  {planInfo.usedPoints.toLocaleString()} / {planInfo.totalPoints.toLocaleString()} ({usagePercent}%)
                </span>
              </div>
              <Progress value={usagePercent} className="h-2" />
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>剩余 {(planInfo.totalPoints - planInfo.usedPoints).toLocaleString()} 点数</span>
                <span>预计消耗 13,500 点数 · 点数充足</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card className="glass-panel border-border">
          <CardContent className="p-5 flex flex-col gap-3">
            <div className="text-xs font-medium text-muted-foreground">快速操作</div>
            {[
              { icon: ArrowUpRight, label: "升级套餐", desc: "解锁更多Agent与点数", to: "/billing/plans" },
              { icon: CreditCard, label: "充值点数", desc: "¥100 起充, 多买多送" },
              { icon: FileText, label: "账单详情", desc: "查看完整费用明细", to: "/billing/invoice" },
              { icon: Settings, label: "计费设置", desc: "消费提醒与上限控制", to: "/billing/settings" },
            ].map(a => (
              <Link key={a.label} to={a.to || "#"} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors group">
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                  <a.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground">{a.label}</div>
                  <div className="text-[10px] text-muted-foreground">{a.desc}</div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Agent breakdown + Trend chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Agent table */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" /> Agent 消费明细
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2">
              {agentConsumption.map(a => (
                <button
                  key={a.name}
                  onClick={() => setSelectedAgent(a)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: a.color + "18" }}>
                    <Bot className="w-4 h-4" style={{ color: a.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground">{a.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${a.pct}%`, background: a.color }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-7 text-right">{a.pct}%</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-medium text-foreground">{a.points.toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground">{a.calls} 次调用</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border flex justify-between text-xs">
              <span className="text-muted-foreground">总计</span>
              <span className="font-medium text-foreground">{agentConsumption.reduce((s, a) => s + a.points, 0).toLocaleString()} 点数</span>
            </div>
          </CardContent>
        </Card>

        {/* Trend chart */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> 消费趋势 (近30天)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} interval={4} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="points" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="点数" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent records */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-display">📋 消费记录</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs gap-1"><Download className="w-3 h-3" /> 导出账单</Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 font-medium">时间</th>
                  <th className="text-left py-2 font-medium">Agent</th>
                  <th className="text-left py-2 font-medium">操作</th>
                  <th className="text-left py-2 font-medium">触发</th>
                  <th className="text-right py-2 font-medium">点数消耗</th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.map((r, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-2.5 text-muted-foreground font-mono">{r.time}</td>
                    <td className="py-2.5 text-foreground font-medium">{r.agent}</td>
                    <td className="py-2.5 text-foreground">{r.op}</td>
                    <td className="py-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${triggerColor[r.trigger]}`}>
                        {triggerLabel[r.trigger]}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-medium text-foreground">{r.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-center">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">加载更多</Button>
          </div>
        </CardContent>
      </Card>

      {/* Overlays */}
      {selectedAgent && <AgentDetail agent={selectedAgent} onClose={() => setSelectedAgent(null)} />}
      <AnimatePresence>
        {showRecharge && <RechargeDialog onClose={() => setShowRecharge(false)} />}
      </AnimatePresence>
    </div>
  );
}
