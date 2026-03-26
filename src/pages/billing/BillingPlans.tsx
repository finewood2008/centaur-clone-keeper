/**
 * 套餐对比与升级页面
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Check, X, Crown, Zap, Star,
  Bot, HardDrive, Coins, Headphones, Sparkles,
  CreditCard, QrCode, Shield, Clock, Tag, Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const plans = [
  {
    id: "basic",
    name: "基础版",
    icon: Zap,
    monthlyPrice: 499,
    yearlyPrice: 399,
    color: "hsl(var(--chart-2))",
    agents: 3,
    storage: "10GB",
    points: "5,000",
    support: "邮件支持",
    features: {
      multiAgent: true,
      emailMarketing: true,
      socialMedia: false,
      adManagement: false,
      dataExport: true,
      apiAccess: false,
      customModel: false,
      teamCollab: false,
      prioritySupport: false,
      dedicatedManager: false,
      sla: false,
      whiteLabel: false,
    },
  },
  {
    id: "pro",
    name: "专业版",
    icon: Star,
    monthlyPrice: 1299,
    yearlyPrice: 1039,
    color: "hsl(var(--primary))",
    current: true,
    popular: true,
    agents: 10,
    storage: "100GB",
    points: "15,000",
    support: "优先支持",
    features: {
      multiAgent: true,
      emailMarketing: true,
      socialMedia: true,
      adManagement: true,
      dataExport: true,
      apiAccess: true,
      customModel: false,
      teamCollab: true,
      prioritySupport: true,
      dedicatedManager: false,
      sla: false,
      whiteLabel: false,
    },
  },
  {
    id: "flagship",
    name: "旗舰版",
    icon: Crown,
    monthlyPrice: 2999,
    yearlyPrice: 2399,
    color: "hsl(var(--chart-4))",
    agents: -1, // unlimited
    storage: "500GB",
    points: "40,000",
    support: "专属客服",
    features: {
      multiAgent: true,
      emailMarketing: true,
      socialMedia: true,
      adManagement: true,
      dataExport: true,
      apiAccess: true,
      customModel: true,
      teamCollab: true,
      prioritySupport: true,
      dedicatedManager: true,
      sla: true,
      whiteLabel: true,
    },
  },
];

const featureLabels: Record<string, { label: string; category: string }> = {
  multiAgent: { label: "多 Agent 协作", category: "核心功能" },
  emailMarketing: { label: "邮件营销", category: "核心功能" },
  socialMedia: { label: "社媒内容管理", category: "核心功能" },
  adManagement: { label: "广告投放管理", category: "核心功能" },
  dataExport: { label: "数据导出", category: "数据服务" },
  apiAccess: { label: "API 接口调用", category: "数据服务" },
  customModel: { label: "自定义 AI 模型", category: "高级功能" },
  teamCollab: { label: "团队协作", category: "高级功能" },
  prioritySupport: { label: "优先技术支持", category: "服务保障" },
  dedicatedManager: { label: "专属客户经理", category: "服务保障" },
  sla: { label: "SLA 服务协议", category: "服务保障" },
  whiteLabel: { label: "白标定制", category: "服务保障" },
};

const categories = ["核心功能", "数据服务", "高级功能", "服务保障"];

/* ─── Coupon data ─── */
const validCoupons: Record<string, { label: string; type: "percent" | "fixed"; value: number }> = {
  "VIP20": { label: "VIP专属优惠", type: "percent", value: 20 },
  "NEW100": { label: "新用户立减", type: "fixed", value: 100 },
  "YEAR500": { label: "年付专享", type: "fixed", value: 500 },
  "SAVE10": { label: "限时折扣", type: "percent", value: 10 },
};

/* ─── Payment Dialog ─── */
function PaymentDialog({ plan, yearly, onClose }: { plan: typeof plans[0]; yearly: boolean; onClose: () => void }) {
  const [payMethod, setPayMethod] = useState<"wechat" | "alipay">("wechat");
  const [step, setStep] = useState<"select" | "qr" | "success">("select");
  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; label: string; discount: number } | null>(null);

  const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
  const baseTotal = yearly ? price * 12 : price;
  const discount = appliedCoupon?.discount ?? 0;
  const totalPrice = Math.max(0, baseTotal - discount);
  const Icon = plan.icon;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    setCouponStatus("checking");
    // Simulate async check
    setTimeout(() => {
      const coupon = validCoupons[couponCode.trim().toUpperCase()];
      if (coupon) {
        const discountAmount = coupon.type === "percent" ? Math.round(baseTotal * coupon.value / 100) : coupon.value;
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

  const handlePay = () => {
    setStep("qr");
    setTimeout(() => setStep("success"), 3000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-md bg-card border border-border rounded-xl shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {step === "success" ? (
          <div className="p-8 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
              <div className="w-16 h-16 rounded-full bg-brand-green/15 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-brand-green" />
              </div>
            </motion.div>
            <h3 className="text-lg font-display font-bold text-foreground">支付成功</h3>
            <p className="text-sm text-muted-foreground mt-2">已成功升级至 <span className="text-foreground font-medium">{plan.name}</span></p>
            <p className="text-xs text-muted-foreground mt-1">新套餐功能已即时生效</p>
            <Button size="sm" className="mt-6 text-xs" onClick={onClose}>完成</Button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-5 pb-3 border-b border-border">
              <h3 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                {step === "qr" ? "扫码支付" : "确认订单"}
              </h3>
            </div>

            {step === "select" ? (
              <>
                {/* Order summary */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: plan.color + "18" }}>
                      <Icon className="w-5 h-5" style={{ color: plan.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">{plan.name}</div>
                      <div className="text-xs text-muted-foreground">{yearly ? "年付" : "月付"} · {plan.agents === -1 ? "无限" : plan.agents} Agent · {plan.storage} 存储</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-display font-bold text-foreground">¥{price}</div>
                      <div className="text-[10px] text-muted-foreground">/月</div>
                    </div>
                  </div>

                  {yearly && (
                    <div className="flex items-center justify-between p-2.5 rounded-md bg-brand-green/8 text-xs">
                      <span className="text-brand-green flex items-center gap-1"><Sparkles className="w-3 h-3" /> 年付优惠</span>
                      <span className="text-brand-green font-medium">省 ¥{((plan.monthlyPrice - plan.yearlyPrice) * 12).toLocaleString()}/年</span>
                    </div>
                  )}

                  {/* Coupon */}
                  <div>
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
                    {couponStatus === "invalid" && (
                      <p className="text-[10px] text-destructive mt-1">优惠码无效，请检查后重试</p>
                    )}
                    {couponStatus === "idle" && !appliedCoupon && (
                      <p className="text-[10px] text-muted-foreground mt-1">试试: VIP20, NEW100, YEAR500</p>
                    )}
                  </div>

                  {/* Price breakdown */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">套餐单价</span><span className="text-foreground">¥{price}/月</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">购买时长</span><span className="text-foreground">{yearly ? "12 个月" : "1 个月"}</span></div>
                    {appliedCoupon && (
                      <div className="flex justify-between"><span className="text-brand-green flex items-center gap-1"><Tag className="w-3 h-3" /> 优惠券减免</span><span className="text-brand-green font-medium">-¥{appliedCoupon.discount.toLocaleString()}</span></div>
                    )}
                    <div className="border-t border-border pt-1.5 flex justify-between font-medium">
                      <span className="text-foreground">应付金额</span>
                      <div className="text-right">
                        {appliedCoupon && <span className="text-xs text-muted-foreground line-through mr-1.5">¥{baseTotal.toLocaleString()}</span>}
                        <span className="text-primary text-base font-display">¥{totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment method */}
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">选择支付方式</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPayMethod("wechat")}
                        className={cn(
                          "flex items-center gap-2.5 p-3 rounded-lg border transition-all",
                          payMethod === "wechat"
                            ? "border-brand-green bg-brand-green/5 ring-1 ring-brand-green/30"
                            : "border-border hover:border-muted-foreground/30"
                        )}
                      >
                        <div className="w-8 h-8 rounded-md bg-brand-green/15 flex items-center justify-center text-brand-green text-sm font-bold">微</div>
                        <div className="text-left">
                          <div className="text-xs font-medium text-foreground">微信支付</div>
                          <div className="text-[10px] text-muted-foreground">推荐</div>
                        </div>
                        {payMethod === "wechat" && <Check className="w-4 h-4 text-brand-green ml-auto" />}
                      </button>
                      <button
                        onClick={() => setPayMethod("alipay")}
                        className={cn(
                          "flex items-center gap-2.5 p-3 rounded-lg border transition-all",
                          payMethod === "alipay"
                            ? "border-[hsl(210,90%,55%)] bg-[hsl(210,90%,55%)]/5 ring-1 ring-[hsl(210,90%,55%)]/30"
                            : "border-border hover:border-muted-foreground/30"
                        )}
                      >
                        <div className="w-8 h-8 rounded-md bg-[hsl(210,90%,55%)]/15 flex items-center justify-center text-[hsl(210,90%,55%)] text-sm font-bold">支</div>
                        <div className="text-left">
                          <div className="text-xs font-medium text-foreground">支付宝</div>
                          <div className="text-[10px] text-muted-foreground">扫码支付</div>
                        </div>
                        {payMethod === "alipay" && <Check className="w-4 h-4 text-[hsl(210,90%,55%)] ml-auto" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Shield className="w-3 h-3" /> 支付由第三方安全通道加密处理，您的资金安全有保障
                  </div>
                </div>

                <div className="p-5 pt-0 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={onClose}>取消</Button>
                  <Button size="sm" className="flex-1 text-xs" onClick={handlePay}>
                    确认支付 ¥{totalPrice.toLocaleString()}
                  </Button>
                </div>
              </>
            ) : (
              /* QR code step */
              <div className="p-5 text-center space-y-4">
                <div className="text-xs text-muted-foreground">
                  请使用 <span className="font-medium text-foreground">{payMethod === "wechat" ? "微信" : "支付宝"}</span> 扫描下方二维码完成支付
                </div>
                <div className="w-48 h-48 mx-auto rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center bg-secondary/30">
                  <QrCode className="w-20 h-20 text-muted-foreground/40" />
                  <span className="text-[10px] text-muted-foreground mt-2">模拟二维码</span>
                </div>
                <div className="text-lg font-display font-bold text-primary">¥{totalPrice.toLocaleString()}</div>
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 animate-spin" style={{ animationDuration: "3s" }} /> 等待支付中...
                </div>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setStep("select")}>
                  返回选择
                </Button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function BillingPlans() {
  const [yearly, setYearly] = useState(false);
  const [payingPlan, setPayingPlan] = useState<typeof plans[0] | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/billing">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" /> 套餐对比与升级
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">选择最适合您业务的方案</p>
        </div>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3">
        <span className={cn("text-sm", !yearly ? "text-foreground font-medium" : "text-muted-foreground")}>月付</span>
        <Switch checked={yearly} onCheckedChange={setYearly} />
        <span className={cn("text-sm", yearly ? "text-foreground font-medium" : "text-muted-foreground")}>年付</span>
        {yearly && (
          <Badge className="bg-brand-green/15 text-brand-green border-0 text-[10px]">
            <Sparkles className="w-3 h-3 mr-1" /> 省 20%
          </Badge>
        )}
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan, idx) => {
          const Icon = plan.icon;
          const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={cn(
                "relative bg-card border-border overflow-hidden h-full",
                plan.popular && "border-primary ring-1 ring-primary/20"
              )}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-medium px-3 py-0.5 rounded-bl-lg">
                    最受欢迎
                  </div>
                )}
                {plan.current && (
                  <div className="absolute top-0 left-0 bg-brand-green text-white text-[10px] font-medium px-3 py-0.5 rounded-br-lg">
                    当前套餐
                  </div>
                )}
                <CardContent className="p-5 flex flex-col h-full">
                  {/* Plan header */}
                  <div className="text-center mb-5 pt-2">
                    <div
                      className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center mb-3"
                      style={{ background: plan.color + "18" }}
                    >
                      <Icon className="w-6 h-6" style={{ color: plan.color }} />
                    </div>
                    <h3 className="font-display font-bold text-lg text-foreground">{plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-display font-bold text-foreground">¥{price}</span>
                      <span className="text-sm text-muted-foreground">/月</span>
                    </div>
                    {yearly && (
                      <div className="text-xs text-muted-foreground mt-1 line-through">
                        ¥{plan.monthlyPrice}/月
                      </div>
                    )}
                  </div>

                  {/* Key specs */}
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {[
                      { icon: Bot, label: "Agent", value: plan.agents === -1 ? "无限" : `${plan.agents} 个` },
                      { icon: HardDrive, label: "存储", value: plan.storage },
                      { icon: Coins, label: "点数/月", value: plan.points },
                      { icon: Headphones, label: "支持", value: plan.support },
                    ].map(spec => (
                      <div key={spec.label} className="p-2 rounded-md bg-secondary/40 text-center">
                        <spec.icon className="w-3.5 h-3.5 mx-auto text-muted-foreground mb-0.5" />
                        <div className="text-[10px] text-muted-foreground">{spec.label}</div>
                        <div className="text-xs font-medium text-foreground">{spec.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Feature checklist */}
                  <div className="flex-1 space-y-1.5 mb-5">
                    {Object.entries(plan.features).map(([key, enabled]) => (
                      <div key={key} className="flex items-center gap-2 text-xs">
                        {enabled ? (
                          <Check className="w-3.5 h-3.5 text-brand-green shrink-0" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                        )}
                        <span className={enabled ? "text-foreground" : "text-muted-foreground/50"}>
                          {featureLabels[key]?.label ?? key}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  {plan.current ? (
                    <Button variant="outline" size="sm" className="w-full text-xs" disabled>
                      当前套餐
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className={cn("w-full text-xs", plan.popular && "bg-primary hover:bg-primary/90")}
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => setPayingPlan(plan)}
                    >
                      {plan.monthlyPrice > 1299 ? "升级套餐" : "切换套餐"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed comparison table */}
      <Card className="bg-card border-border overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-display font-bold text-foreground">📋 功能详细对比</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-3 font-medium text-muted-foreground w-[40%]">功能</th>
                  {plans.map(p => (
                    <th key={p.id} className="text-center p-3 font-medium text-foreground">
                      {p.name}
                      {p.current && <Badge className="ml-1 bg-brand-green/15 text-brand-green border-0 text-[9px] px-1">当前</Badge>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Spec rows */}
                {[
                  { label: "Agent 数量", values: ["3 个", "10 个", "无限制"] },
                  { label: "存储空间", values: ["10GB", "100GB", "500GB"] },
                  { label: "每月点数", values: ["5,000", "15,000", "40,000"] },
                  { label: "技术支持", values: ["邮件", "优先支持", "专属客服"] },
                ].map(row => (
                  <tr key={row.label} className="border-b border-border/50">
                    <td className="p-3 text-foreground font-medium">{row.label}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className="p-3 text-center text-foreground">{v}</td>
                    ))}
                  </tr>
                ))}

                {/* Feature rows by category */}
                {categories.map(cat => (
                  <>
                    <tr key={cat} className="bg-secondary/20">
                      <td colSpan={4} className="p-2 px-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{cat}</td>
                    </tr>
                    {Object.entries(featureLabels)
                      .filter(([, v]) => v.category === cat)
                      .map(([key, v]) => (
                        <tr key={key} className="border-b border-border/30">
                          <td className="p-3 text-foreground">{v.label}</td>
                          {plans.map(p => (
                            <td key={p.id} className="p-3 text-center">
                              {p.features[key as keyof typeof p.features] ? (
                                <Check className="w-4 h-4 text-brand-green mx-auto" />
                              ) : (
                                <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="bg-card border-border">
        <CardContent className="p-5 space-y-4">
          <h3 className="text-sm font-display font-bold text-foreground">❓ 常见问题</h3>
          {[
            { q: "升级套餐后原有数据会丢失吗？", a: "不会，升级套餐时所有数据完整保留，新功能即时生效。" },
            { q: "点数用完后可以单独充值吗？", a: "可以，点数用完后可以按需充值，多买多送，详见消费中心充值页面。" },
            { q: "支持降级吗？", a: "支持，降级将在当前账单周期结束后生效，已支付费用按剩余天数折算退还。" },
            { q: "年付可以随时取消吗？", a: "年付承诺期内可申请退款，按已使用月份的月付价格计算后退还差额。" },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-lg bg-secondary/30">
              <div className="text-xs font-medium text-foreground">{item.q}</div>
              <div className="text-xs text-muted-foreground mt-1">{item.a}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Payment dialog */}
      <AnimatePresence>
        {payingPlan && <PaymentDialog plan={payingPlan} yearly={yearly} onClose={() => setPayingPlan(null)} />}
      </AnimatePresence>
    </div>
  );
}
