/**
 * AdsApprovals - AI优化审核
 */
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, AlertTriangle, Shield, TrendingUp, Pause, Eye, DollarSign, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
import ApiKeyBanner from "@/components/ApiKeyBanner";

interface Approval {
  id: string;
  type: string;
  target: string;
  reason: string;
  risk: "low" | "medium" | "high";
  confidence: number;
  data: { spend: number; impressions: number; clicks: number; ctr: number; leads: number; cpa: number; targetCpa: number; roas?: number };
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  rejectReason?: string;
}

const initialApprovals: Approval[] = [
  {
    id: "1", type: "暂停广告系列", target: "LED灯推广-测试A",
    reason: "连续3天CPA超过$25（目标$15）", risk: "medium", confidence: 85,
    data: { spend: 450, impressions: 45000, clicks: 900, ctr: 2.0, leads: 18, cpa: 25.0, targetCpa: 15 },
    status: "pending", createdAt: "2024-03-26T14:45:00Z",
  },
  {
    id: "2", type: "增加预算30%", target: "LED灯-场景图",
    reason: "ROAS达到4.2，表现优异", risk: "low", confidence: 92,
    data: { spend: 200, impressions: 20000, clicks: 500, ctr: 2.5, leads: 15, cpa: 13.3, targetCpa: 15, roas: 4.2 },
    status: "pending", createdAt: "2024-03-26T15:00:00Z",
  },
];

const initialHistory: Approval[] = [
  {
    id: "h1", type: "增加预算20%", target: "LED灯-美国", reason: "CPA低于目标，表现稳定",
    risk: "low", confidence: 90, data: { spend: 300, impressions: 30000, clicks: 600, ctr: 2.0, leads: 20, cpa: 15.0, targetCpa: 15 },
    status: "approved", createdAt: "2024-03-26T14:45:00Z", processedAt: "2024-03-26 14:45", processedBy: "张三",
  },
  {
    id: "h2", type: "优化受众定向", target: "全部广告系列", reason: "缩小到高转化地区",
    risk: "low", confidence: 88, data: { spend: 0, impressions: 0, clicks: 0, ctr: 0, leads: 0, cpa: 0, targetCpa: 15 },
    status: "approved", createdAt: "2024-03-26T13:30:00Z", processedAt: "2024-03-26 13:30", processedBy: "AI自动",
  },
  {
    id: "h3", type: "暂停广告系列", target: "LED灯-欧洲", reason: "CPA偏高",
    risk: "medium", confidence: 72, data: { spend: 250, impressions: 25000, clicks: 500, ctr: 2.0, leads: 10, cpa: 25.0, targetCpa: 15 },
    status: "rejected", createdAt: "2024-03-26T12:00:00Z", processedAt: "2024-03-26 12:00", processedBy: "张三", rejectReason: "欧洲市场还在测试期，再观察2天",
  },
];

const riskConfig = {
  low: { label: "低风险", color: "text-brand-green", bg: "bg-brand-green/15", border: "border-brand-green/30", icon: Shield },
  medium: { label: "中风险", color: "text-brand-orange", bg: "bg-brand-orange/15", border: "border-brand-orange/30", icon: AlertTriangle },
  high: { label: "高风险", color: "text-destructive", bg: "bg-destructive/15", border: "border-destructive/30", icon: AlertTriangle },
};

function confidenceColor(c: number) {
  if (c >= 90) return "text-brand-green";
  if (c >= 70) return "text-primary";
  if (c >= 50) return "text-brand-orange";
  return "text-destructive";
}

export default function AdsApprovals() {
  const [pending, setPending] = useState(initialApprovals);
  const [history, setHistory] = useState(initialHistory);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleApprove = () => {
    if (!confirmId) return;
    setProcessing(true);
    toast({ title: "⏳ AI正在执行优化..." });

    setTimeout(() => {
      const item = pending.find((a) => a.id === confirmId);
      if (item) {
        setPending((p) => p.filter((a) => a.id !== confirmId));
        setHistory((h) => [
          { ...item, status: "approved", processedAt: new Date().toLocaleString("zh-CN"), processedBy: "张三" },
          ...h,
        ]);
      }
      setConfirmId(null);
      setProcessing(false);
      toast({ title: "✅ 优化建议已批准并执行" });
    }, 2000);
  };

  const handleReject = () => {
    if (!rejectId) return;
    const item = pending.find((a) => a.id === rejectId);
    if (item) {
      setPending((p) => p.filter((a) => a.id !== rejectId));
      setHistory((h) => [
        { ...item, status: "rejected", processedAt: new Date().toLocaleString("zh-CN"), processedBy: "张三", rejectReason: rejectReason || "未提供原因" },
        ...h,
      ]);
    }
    setRejectId(null);
    setRejectReason("");
    toast({ title: "❌ 优化建议已拒绝" });
  };

  return (
    <div className="space-y-4">
      <ApiKeyBanner description="后，AI 广告优化建议与自动审核将自动激活" />
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="text-xs">
            待审核 {pending.length > 0 && <Badge variant="destructive" className="ml-1.5 text-[10px] h-4 px-1.5">{pending.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs">已处理 ({history.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-3 space-y-3">
          {pending.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground text-sm">暂无待审核建议 🎉</Card>
          ) : (
            pending.map((a) => <PendingCard key={a.id} approval={a} onApprove={() => setConfirmId(a.id)} onReject={() => setRejectId(a.id)} />)
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-3">
          <ScrollArea className="h-[500px]">
            <div className="space-y-2 pr-3">
              {history.map((a) => <HistoryCard key={a.id} approval={a} />)}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Approve Confirm */}
      <Dialog open={!!confirmId} onOpenChange={() => !processing && setConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认批准</DialogTitle>
            <DialogDescription>确认批准此优化建议？AI将立即执行。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmId(null)} disabled={processing}>取消</Button>
            <Button onClick={handleApprove} disabled={processing}>{processing ? "执行中..." : "确认批准"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>拒绝原因</DialogTitle>
            <DialogDescription>请说明拒绝原因（可选）</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="例如：还需要观察2天" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="min-h-[80px]" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>取消</Button>
            <Button variant="destructive" onClick={handleReject}>确认拒绝</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PendingCard({ approval: a, onApprove, onReject }: { approval: Approval; onApprove: () => void; onReject: () => void }) {
  const rc = riskConfig[a.risk];
  const RiskIcon = rc.icon;

  return (
    <Card className={cn("p-4 border", rc.border)}>
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="secondary" className={cn("text-[10px]", rc.bg, rc.color, "border-0")}>
          <RiskIcon className="w-3 h-3 mr-1" />{rc.label}
        </Badge>
        <span className="text-xs text-muted-foreground">需要审核</span>
      </div>

      <h4 className="text-sm font-semibold mb-1">建议：{a.type} "{a.target}"</h4>
      <p className="text-xs text-muted-foreground mb-3">原因：{a.reason}</p>

      {/* Data Grid */}
      <div className="bg-secondary/50 rounded-lg p-3 mb-3">
        <h5 className="text-[11px] font-medium text-muted-foreground mb-2 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />数据详情
        </h5>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div><span className="text-muted-foreground">花费: </span><span className="font-medium">${a.data.spend}</span></div>
          <div><span className="text-muted-foreground">展示: </span><span className="font-medium">{a.data.impressions.toLocaleString()}次</span></div>
          <div><span className="text-muted-foreground">点击: </span><span className="font-medium">{a.data.clicks}次 (CTR {a.data.ctr}%)</span></div>
          <div><span className="text-muted-foreground">询盘: </span><span className="font-medium">{a.data.leads}个</span></div>
          <div><span className="text-muted-foreground">CPA: </span><span className={cn("font-medium", a.data.cpa > a.data.targetCpa ? "text-destructive" : "text-brand-green")}>${a.data.cpa}</span></div>
          <div><span className="text-muted-foreground">目标CPA: </span><span className="font-medium">${a.data.targetCpa}</span></div>
          {a.data.roas && <div><span className="text-muted-foreground">ROAS: </span><span className="font-medium text-brand-green">{a.data.roas}x</span></div>}
        </div>
      </div>

      {/* Confidence */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[11px] text-muted-foreground">AI信心度:</span>
        <Progress value={a.confidence} className="flex-1 h-2" />
        <span className={cn("text-xs font-semibold", confidenceColor(a.confidence))}>{a.confidence}%</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button size="sm" className="text-xs" onClick={onApprove}>
          <CheckCircle className="w-3.5 h-3.5 mr-1" />批准
        </Button>
        <Button variant="outline" size="sm" className="text-xs" onClick={onReject}>
          <XCircle className="w-3.5 h-3.5 mr-1" />拒绝
        </Button>
      </div>
    </Card>
  );
}

function HistoryCard({ approval: a }: { approval: Approval }) {
  const isApproved = a.status === "approved";
  return (
    <Card className="p-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {isApproved ? (
            <CheckCircle className="w-4 h-4 text-brand-green" />
          ) : (
            <XCircle className="w-4 h-4 text-destructive" />
          )}
          <span className="text-xs font-medium">{isApproved ? "已批准" : "已拒绝"}</span>
          <span className="text-[10px] text-muted-foreground">{a.processedAt}</span>
        </div>
        <span className="text-[10px] text-muted-foreground">操作人: {a.processedBy}</span>
      </div>
      <p className="text-xs text-muted-foreground ml-6">{a.type} "{a.target}"</p>
      {a.rejectReason && <p className="text-[11px] text-destructive/80 ml-6 mt-0.5">拒绝原因: {a.rejectReason}</p>}
    </Card>
  );
}
