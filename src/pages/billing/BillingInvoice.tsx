/**
 * 账单详情页 - 费用明细、支付方式、历史账单
 */
import { Link } from "react-router-dom";
import { FileText, ArrowLeft, Download, CreditCard, Calendar, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const invoiceItems = [
  { category: "订阅费用", desc: "专业版套餐 (¥1,299/月)", sub: "含 15,000 点数", amount: 1299 },
  { category: "额外充值点数", desc: "充值 5,500 点数", sub: "¥500 = 5,500点数 (送500)", amount: 500 },
  { category: "附加服务", desc: "额外存储空间 (50GB)", sub: "", amount: 50 },
];

const subtotal = invoiceItems.reduce((s, i) => s + i.amount, 0);
const discount = -154.9;
const total = subtotal + discount;

const historyBills = [
  { month: "2026年2月", amount: 1299, status: "已支付", date: "2026-03-01" },
  { month: "2026年1月", amount: 1549, status: "已支付", date: "2026-02-01" },
  { month: "2025年12月", amount: 1299, status: "已支付", date: "2026-01-01" },
];

export default function BillingInvoice() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/billing"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> 账单详情
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">2026年3月</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Invoice detail */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" /> 费用明细
              </CardTitle>
              <Badge variant="outline" className="text-xs border-primary/30 text-primary">未结算</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-[11px] text-muted-foreground mb-3">账单周期: 2026-03-01 至 2026-03-31</div>

            <div className="space-y-3">
              {invoiceItems.map((item, i) => (
                <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-secondary/30">
                  <div>
                    <div className="text-xs text-muted-foreground">{i + 1}. {item.category}</div>
                    <div className="text-sm font-medium text-foreground mt-0.5">{item.desc}</div>
                    {item.sub && <div className="text-[11px] text-muted-foreground mt-0.5">{item.sub}</div>}
                  </div>
                  <div className="text-sm font-medium text-foreground shrink-0">¥{item.amount.toFixed(2)}</div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">小计</span><span className="text-foreground">¥{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">优惠折扣 (年付9折)</span><span className="text-brand-green">{discount.toFixed(2)}</span></div>
              <Separator />
              <div className="flex justify-between text-sm font-medium"><span className="text-foreground">应付金额</span><span className="text-primary text-lg font-display">¥{total.toFixed(2)}</span></div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button size="sm" className="text-xs gap-1"><Download className="w-3 h-3" /> 下载发票</Button>
              <Button variant="outline" size="sm" className="text-xs">更改支付方式</Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment & dates */}
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 space-y-3">
              <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> 支付方式</div>
              <div className="p-3 rounded-lg bg-secondary/30 flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-brand-green/15 flex items-center justify-center text-brand-green text-sm font-bold">微</div>
                <div>
                  <div className="text-xs font-medium text-foreground">微信支付</div>
                  <div className="text-[11px] text-muted-foreground">尾号 1234</div>
                </div>
              </div>
              <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 pt-2"><Calendar className="w-3.5 h-3.5" /> 扣费日期</div>
              <div className="text-sm font-medium text-foreground">2026-04-01 (自动扣费)</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-display">历史账单</CardTitle></CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              {historyBills.map((b, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer">
                  <div>
                    <div className="text-xs font-medium text-foreground">{b.month}</div>
                    <div className="text-[10px] text-muted-foreground">{b.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-foreground">¥{b.amount.toFixed(2)}</div>
                    <Badge variant="outline" className="text-[10px] border-brand-green/30 text-brand-green">{b.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
