/**
 * 计费设置 - 套餐信息、提醒、上限、Agent控制
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Settings, ArrowLeft, Bell, Bot, Shield, CreditCard, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const agents = [
  { id: 1, name: "客户服务 Agent", enabled: true, dailyLimit: 5000, monthUsed: 3570 },
  { id: 2, name: "邮件处理 Agent", enabled: true, dailyLimit: 3000, monthUsed: 2660 },
  { id: 3, name: "产品推荐 Agent", enabled: true, dailyLimit: 5000, monthUsed: 4740 },
  { id: 4, name: "订单跟进 Agent", enabled: true, dailyLimit: 2000, monthUsed: 460 },
  { id: 5, name: "数据分析 Agent", enabled: false, dailyLimit: 1000, monthUsed: 120 },
];

export default function BillingSettings() {
  const [alerts, setAlerts] = useState({ pct80: true, pct100: true, low: true });
  const [notifyMethods, setNotifyMethods] = useState({ site: true, email: true, wechat: false });
  const [limitEnabled, setLimitEnabled] = useState({ daily: true, monthly: true });
  const [dailyLimit, setDailyLimit] = useState([5000]);
  const [monthlyLimit, setMonthlyLimit] = useState([20000]);
  const [limitAction, setLimitAction] = useState<"pause_all" | "pause_auto" | "continue">("pause_auto");
  const [agentList, setAgentList] = useState(agents);

  const toggleAgent = (id: number) => {
    setAgentList(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/billing"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" /> 计费设置
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">消费提醒、上限控制、Agent 计费管理</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Current plan */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" /> 当前套餐
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div>
                <div className="text-sm font-medium text-foreground">专业版</div>
                <div className="text-xs text-muted-foreground">¥1,299/月 · 15,000 点数/月</div>
              </div>
              <Badge className="bg-primary/15 text-primary border-0">当前</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-md bg-secondary/30">
                <div className="text-muted-foreground">到期时间</div>
                <div className="font-medium text-foreground mt-0.5">2026-12-31</div>
              </div>
              <div className="p-2 rounded-md bg-secondary/30">
                <div className="text-muted-foreground">Agent 配额</div>
                <div className="font-medium text-foreground mt-0.5">10 个</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="text-xs flex-1">升级套餐</Button>
              <Button variant="outline" size="sm" className="text-xs flex-1">续费</Button>
              <Button variant="outline" size="sm" className="text-xs flex-1">充值点数</Button>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" /> 点数提醒
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            {[
              { key: "pct80" as const, label: "套餐点数使用达到 80% 时提醒" },
              { key: "pct100" as const, label: "套餐点数使用达到 100% 时提醒" },
              { key: "low" as const, label: "剩余点数不足 1,000 时提醒" },
            ].map(a => (
              <div key={a.key} className="flex items-center justify-between">
                <span className="text-xs text-foreground">{a.label}</span>
                <Switch checked={alerts[a.key]} onCheckedChange={v => setAlerts(p => ({ ...p, [a.key]: v }))} />
              </div>
            ))}
            <div className="pt-2 border-t border-border">
              <div className="text-[11px] text-muted-foreground mb-2">提醒方式</div>
              <div className="flex gap-4">
                {[
                  { key: "site" as const, label: "站内通知" },
                  { key: "email" as const, label: "邮件" },
                  { key: "wechat" as const, label: "企业微信" },
                ].map(m => (
                  <label key={m.key} className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                    <Switch checked={notifyMethods[m.key]} onCheckedChange={v => setNotifyMethods(p => ({ ...p, [m.key]: v }))} />
                    {m.label}
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Limits */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> 消费上限设置
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3 p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">每日点数上限</span>
                <Switch checked={limitEnabled.daily} onCheckedChange={v => setLimitEnabled(p => ({ ...p, daily: v }))} />
              </div>
              {limitEnabled.daily && (
                <div className="space-y-2">
                  <Slider value={dailyLimit} onValueChange={setDailyLimit} min={500} max={10000} step={500} />
                  <div className="text-xs text-muted-foreground text-center">{dailyLimit[0].toLocaleString()} 点数/天</div>
                </div>
              )}
            </div>
            <div className="space-y-3 p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">每月点数上限</span>
                <Switch checked={limitEnabled.monthly} onCheckedChange={v => setLimitEnabled(p => ({ ...p, monthly: v }))} />
              </div>
              {limitEnabled.monthly && (
                <div className="space-y-2">
                  <Slider value={monthlyLimit} onValueChange={setMonthlyLimit} min={5000} max={50000} step={1000} />
                  <div className="text-xs text-muted-foreground text-center">{monthlyLimit[0].toLocaleString()} 点数/月</div>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-secondary/30 space-y-2">
            <div className="text-xs font-medium text-foreground mb-2">达到上限后</div>
            {[
              { v: "pause_all" as const, l: "暂停所有 Agent" },
              { v: "pause_auto" as const, l: "仅暂停自动任务 (Heartbeat)，保留手动操作" },
              { v: "continue" as const, l: "继续运行并发送提醒" },
            ].map(o => (
              <label key={o.v} className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                <input type="radio" name="limitAction" checked={limitAction === o.v} onChange={() => setLimitAction(o.v)} className="accent-[hsl(var(--primary))]" />
                {o.l}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Agent controls */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary" /> Agent 点数控制
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 font-medium">Agent 名称</th>
                  <th className="text-center py-2 font-medium">状态</th>
                  <th className="text-right py-2 font-medium">每日上限</th>
                  <th className="text-right py-2 font-medium">本月消耗</th>
                </tr>
              </thead>
              <tbody>
                {agentList.map(a => (
                  <tr key={a.id} className="border-b border-border/50">
                    <td className="py-2.5 text-foreground font-medium">{a.name}</td>
                    <td className="py-2.5 text-center">
                      <Switch checked={a.enabled} onCheckedChange={() => toggleAgent(a.id)} />
                    </td>
                    <td className="py-2.5 text-right text-foreground">{a.dailyLimit.toLocaleString()}</td>
                    <td className="py-2.5 text-right text-foreground">{a.monthUsed.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <Button size="sm" className="text-xs" onClick={() => toast.success("设置已保存")}>
              <Zap className="w-3.5 h-3.5 mr-1" /> 保存设置
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
