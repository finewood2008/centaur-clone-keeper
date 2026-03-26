/**
 * 套餐对比与升级页面
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Check, X, Crown, Zap, Star,
  Bot, HardDrive, Coins, Headphones, Sparkles,
} from "lucide-react";
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

export default function BillingPlans() {
  const [yearly, setYearly] = useState(false);

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
                      onClick={() => toast.success(`已申请升级至${plan.name}，客服将尽快联系您`)}
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
    </div>
  );
}
