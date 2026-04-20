/**
 * StatsCards - Premium Glassmorphism KPI Cards
 * Hover glow border + Z-axis lift + duotone icon glow
 */
import { MessageSquare, Bot, Clock, Star, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatsData {
  inquiries: number;
  automationRate: number;
  avgResponseTime: number;
  satisfaction: number;
  totalCustomers?: number;
  monthlyInquiries?: number;
  conversionRate?: number;
}

interface StatsCardsProps {
  stats: StatsData;
  onCardClick?: (card: "inquiries" | "automation" | "response" | "satisfaction") => void;
  loading?: boolean;
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

interface CardDef {
  key: "inquiries" | "automation" | "response" | "satisfaction";
  title: string;
  icon: React.ElementType;
  iconColor: string;
  glowColor: string;
  getValue: (s: StatsData) => string;
  getChange: (s: StatsData) => { text: string; trend: "up" | "down"; label: string };
}

const cards: CardDef[] = [
  {
    key: "inquiries",
    title: "今日询盘",
    icon: MessageSquare,
    iconColor: "text-primary",
    glowColor: "hsla(30 90% 55% / 0.15)",
    getValue: (s) => `${s.inquiries}条`,
    getChange: () => ({ text: "↑ 12%", trend: "up", label: "vs 昨日" }),
  },
  {
    key: "automation",
    title: "AI自动化率",
    icon: Bot,
    iconColor: "text-brand-cyan",
    glowColor: "hsla(190 80% 55% / 0.15)",
    getValue: (s) => `${s.automationRate}%`,
    getChange: () => ({ text: "↑ 5%", trend: "up", label: "vs 上周" }),
  },
  {
    key: "response",
    title: "平均响应时间",
    icon: Clock,
    iconColor: "text-brand-green",
    glowColor: "hsla(155 65% 48% / 0.15)",
    getValue: (s) => `${s.avgResponseTime}秒`,
    getChange: () => ({ text: "↓ 180%", trend: "up", label: "vs 人工" }),
  },
  {
    key: "satisfaction",
    title: "客户满意度",
    icon: Star,
    iconColor: "text-yellow-400",
    glowColor: "hsla(45 90% 55% / 0.15)",
    getValue: (s) => `${s.satisfaction}/5.0`,
    getChange: () => ({ text: "↑ 0.3", trend: "up", label: "vs 上月" }),
  },
];

export default function StatsCards({ stats, onCardClick }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = card.getValue(stats);
        const change = card.getChange(stats);
        return (
          <motion.button
            key={card.key}
            variants={fadeUp}
            onClick={() => onCardClick?.(card.key)}
            className="metric-card glass-panel rounded-xl p-4 text-left cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-white/40 font-medium">{card.title}</span>
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                style={{ background: card.glowColor }}
              >
                <Icon className={cn("w-4 h-4", card.iconColor)} />
              </div>
            </div>
            <div className="font-metric text-[28px] font-extrabold leading-tight mb-1 text-foreground tracking-tight">
              {value}
            </div>
            <div className="flex items-center gap-1">
              {change.trend === "up" ? (
                <ArrowUpRight className="w-3 h-3 text-brand-green" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-destructive" />
              )}
              <span className={cn("text-[10px] font-semibold", change.trend === "up" ? "text-brand-green" : "text-destructive")}>
                {change.text}
              </span>
              <span className="text-[10px] text-white/30">{change.label}</span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
