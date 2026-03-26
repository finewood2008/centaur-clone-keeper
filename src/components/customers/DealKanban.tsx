/**
 * DealKanban - 商机看板视图，按阶段分列展示，支持拖拽切换阶段
 */
import { useState, useRef, useCallback } from "react";
import {
  DollarSign, GripVertical, User, Building2, TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface KanbanDeal {
  id: string;
  name: string;
  value: string;
  probability: number;
  stage: string;
  customer: string;
  company: string;
  tier: "A" | "B" | "C";
}

const stages = [
  { key: "洽谈中", color: "bg-muted-foreground" },
  { key: "报价中", color: "bg-primary" },
  { key: "样品确认", color: "bg-brand-cyan" },
  { key: "合同签订", color: "bg-chart-4" },
  { key: "已成交", color: "bg-brand-green" },
  { key: "已关闭", color: "bg-destructive" },
];

const tierColors: Record<string, string> = {
  A: "bg-primary/15 text-primary border-primary/30",
  B: "bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30",
  C: "bg-muted text-muted-foreground border-border",
};

// Generate mock deals across customers
const initialDeals: KanbanDeal[] = [
  { id: "d1", name: "T8灯管500支订单", value: "$15,000", probability: 75, stage: "报价中", customer: "John Smith", company: "TechCorp Ltd.", tier: "A" },
  { id: "d2", name: "LED灯泡定制包装", value: "$8,500", probability: 60, stage: "样品确认", customer: "John Smith", company: "TechCorp Ltd.", tier: "A" },
  { id: "d3", name: "Q2框架协议", value: "$45,000", probability: 40, stage: "洽谈中", customer: "John Smith", company: "TechCorp Ltd.", tier: "A" },
  { id: "d4", name: "面板灯200件首单", value: "$2,400", probability: 85, stage: "合同签订", customer: "Maria Garcia", company: "EuroTrade GmbH", tier: "A" },
  { id: "d5", name: "LED灯泡欧洲认证版", value: "$32,000", probability: 55, stage: "报价中", customer: "Maria Garcia", company: "EuroTrade GmbH", tier: "A" },
  { id: "d6", name: "工程用灯管批量", value: "$18,000", probability: 30, stage: "洽谈中", customer: "Ahmed Hassan", company: "MidEast Import Co.", tier: "B" },
  { id: "d7", name: "日本市场定制色温", value: "$12,000", probability: 45, stage: "样品确认", customer: "Yuki Tanaka", company: "Japan Direct Co.", tier: "B" },
  { id: "d8", name: "太阳能板试单", value: "$4,250", probability: 20, stage: "洽谈中", customer: "Roberto Silva", company: "Brazil Imports", tier: "C" },
  { id: "d9", name: "LED筒灯500套", value: "$22,000", probability: 90, stage: "已成交", customer: "Sarah Johnson", company: "Pacific Trading Inc.", tier: "B" },
  { id: "d10", name: "停产型号尾货", value: "$3,200", probability: 0, stage: "已关闭", customer: "Roberto Silva", company: "Brazil Imports", tier: "C" },
];

export default function DealKanban({ onDealClick }: { onDealClick?: (deal: KanbanDeal) => void }) {
  const [deals, setDeals] = useState<KanbanDeal[]>(initialDeals);
  const dragItem = useRef<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [highlightedDealId, setHighlightedDealId] = useState<string | null>(null);

  const handleDragStart = useCallback((dealId: string) => {
    dragItem.current = dealId;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, stage: string) => {
    e.preventDefault();
    setDragOverStage(stage);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverStage(null);
  }, []);

  const handleDrop = useCallback((targetStage: string) => {
    const dealId = dragItem.current;
    if (!dealId) return;
    setDeals((prev) => {
      const deal = prev.find((d) => d.id === dealId);
      if (!deal || deal.stage === targetStage) return prev;
      toast.success(`商机"${deal.name}"已移至 ${targetStage}`);
      return prev.map((d) =>
        d.id === dealId ? { ...d, stage: targetStage } : d
      );
    });
    dragItem.current = null;
    setDragOverStage(null);
  }, []);

  const stageDeals = (stageKey: string) => deals.filter((d) => d.stage === stageKey);

  const totalValue = (stageKey: string) => {
    const sum = stageDeals(stageKey).reduce((acc, d) => {
      const num = parseFloat(d.value.replace(/[$,]/g, ""));
      return acc + (isNaN(num) ? 0 : num);
    }, 0);
    return sum >= 1000 ? `$${(sum / 1000).toFixed(1)}K` : `$${sum}`;
  };

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <div className="flex items-center gap-4 text-xs">
        <span className="text-muted-foreground">
          共 <strong className="text-foreground">{deals.length}</strong> 个商机
        </span>
        <span className="text-muted-foreground">
          总金额 <strong className="text-primary">${deals.reduce((a, d) => a + parseFloat(d.value.replace(/[$,]/g, "") || "0"), 0).toLocaleString()}</strong>
        </span>
        <span className="text-muted-foreground flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-brand-green" />
          加权金额 <strong className="text-brand-green">${Math.round(deals.reduce((a, d) => a + parseFloat(d.value.replace(/[$,]/g, "") || "0") * d.probability / 100, 0)).toLocaleString()}</strong>
        </span>
      </div>

      {/* Kanban columns */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {stages.map((stage) => {
          const items = stageDeals(stage.key);
          return (
            <div
              key={stage.key}
              className={cn(
                "flex-shrink-0 w-56 rounded-xl border transition-colors flex flex-col",
                dragOverStage === stage.key
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              )}
              onDragOver={(e) => handleDragOver(e, stage.key)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(stage.key)}
            >
              {/* Column Header */}
              <div className="px-3 py-2.5 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full", stage.color)} />
                  <span className="text-xs font-semibold">{stage.key}</span>
                  <Badge variant="secondary" className="text-[9px] h-4 px-1.5 ml-auto">{items.length}</Badge>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{totalValue(stage.key)}</div>
              </div>

              {/* Cards */}
              <div className="p-2 space-y-2 flex-1 min-h-[120px]">
                {items.length === 0 && (
                  <div className="flex items-center justify-center h-20 text-[10px] text-muted-foreground border border-dashed border-border rounded-lg">
                    拖拽商机到此处
                  </div>
                )}
                {items.map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={() => handleDragStart(deal.id)}
                    onClick={() => {
                      setHighlightedDealId(deal.id);
                      onDealClick?.(deal);
                    }}
                    className={cn(
                      "border rounded-lg p-2.5 cursor-grab active:cursor-grabbing transition-all hover:shadow-sm group",
                      highlightedDealId === deal.id
                        ? "bg-primary/10 border-primary ring-1 ring-primary/30"
                        : "bg-secondary/40 hover:bg-secondary/70 border-border"
                    )}
                  >
                    <div className="flex items-start gap-1.5">
                      <GripVertical className="w-3 h-3 text-muted-foreground/40 group-hover:text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-medium leading-tight truncate">{deal.name}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-xs font-bold text-primary">{deal.value}</span>
                          <span className={cn("text-[8px] px-1 py-0.5 rounded border font-bold", tierColors[deal.tier])}>{deal.tier}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                          <User className="w-2.5 h-2.5" />
                          <span className="truncate">{deal.customer}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                          <Building2 className="w-2.5 h-2.5" />
                          <span className="truncate">{deal.company}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Progress value={deal.probability} className="flex-1 h-1" />
                          <span className="text-[9px] text-muted-foreground w-7 text-right">{deal.probability}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}