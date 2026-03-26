/**
 * StatsCards - 顶部4个KPI数据卡片
 * 今日询盘、AI自动化率、平均响应时间、客户满意度
 */
import { MessageSquare, Bot, Clock, Star, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatsData {
  inquiries: number;
  automationRate: number;
  avgResponseTime: number;
  satisfaction: number;
}

interface StatsCardsProps {
  stats: StatsData;
  onCardClick?: (card: "inquiries" | "automation" | "response" | "satisfaction") => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

interface CardDef {
  key: "inquiries" | "automation" | "response" | "satisfaction";
  title: string;
  icon: React.ElementType;
  getValue: (s: StatsData) => string;
  getChange: (s: StatsData) => { text: string; trend: "up" | "down"; label: string };
}

const cards: CardDef[] = [
  {
    key: "inquiries",
    title: "今日询盘",
    icon: MessageSquare,
    getValue: (s) => `${s.inquiries}条`,
    getChange: () => ({ text: "↑ 12%", trend: "up", label: "vs 昨日" }),
  },
  {
    key: "automation",
    title: "AI自动化率",
    icon: Bot,
    getValue: (s) => `${s.automationRate}%`,
    getChange: () => ({ text: "↑ 5%", trend: "up", label: "vs 上周" }),
  },
  {
    key: "response",
    title: "平均响应时间",
    icon: Clock,
    getValue: (s) => `${s.avgResponseTime}秒`,
    getChange: () => ({ text: "↓ 180%", trend: "up", label: "vs 人工" }),
  },
  {
    key: "satisfaction",
    title: "客户满意度",
    icon: Star,
    getValue: (s) => `${s.satisfaction}/5.0`,
    getChange: () => ({ text: "↑ 0.3", trend: "up", label: "vs 上月" }),
  },
];

export default function StatsCards({ stats, onCardClick }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, i) => {
        const Icon = card.icon;
        const value = card.getValue(stats);
        const change = card.getChange(stats);
        return (
          <motion.button
            key={card.key}
            variants={fadeUp}
            onClick={() => onCardClick?.(card.key)}
            className="bg-card border border-border rounded-xl p-4 text-left hover:border-primary/30 transition-colors group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-muted-foreground font-medium">{card.title}</span>
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
            <div className="text-2xl font-display font-bold mb-1">{value}</div>
            <div className="flex items-center gap-1">
              {change.trend === "up" ? (
                <ArrowUpRight className="w-3 h-3 text-brand-green" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-destructive" />
              )}
              <span className={cn("text-[10px] font-medium", change.trend === "up" ? "text-brand-green" : "text-destructive")}>
                {change.text}
              </span>
              <span className="text-[10px] text-muted-foreground">{change.label}</span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
