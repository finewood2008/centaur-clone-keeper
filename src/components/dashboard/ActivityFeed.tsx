/**
 * ActivityFeed - 最近活动流表格 (Glassmorphism)
 */
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MessageSquare, Mail, ExternalLink } from "lucide-react";

type ActivityStatus = "auto_replied" | "pending_review" | "transferred";

interface Activity {
  id: number;
  customer: { name: string; avatar: string };
  type: string;
  source: string;
  status: ActivityStatus;
  time: string;
}

const statusConfig: Record<ActivityStatus, { label: string; emoji: string; className: string }> = {
  auto_replied: { label: "AI自动回复", emoji: "✓", className: "bg-brand-green/15 text-brand-green" },
  pending_review: { label: "等待审核", emoji: "⏳", className: "bg-brand-orange/15 text-brand-orange" },
  transferred: { label: "已转人工", emoji: "👤", className: "bg-blue-500/15 text-blue-400" },
};

const typeColors: Record<string, string> = {
  "询价": "bg-blue-500/15 text-blue-400",
  "产品咨询": "bg-brand-green/15 text-brand-green",
  "订单跟进": "bg-brand-orange/15 text-brand-orange",
  "投诉": "bg-destructive/15 text-destructive",
  "闲聊": "bg-purple-500/15 text-purple-400",
};

const sourceIcons: Record<string, React.ReactNode> = {
  WhatsApp: <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />,
  Email: <Mail className="w-3.5 h-3.5 text-[#EA4335]" />,
  LinkedIn: <span className="text-[10px] font-bold text-[#0A66C2]">in</span>,
  "网站表单": <ExternalLink className="w-3.5 h-3.5 text-[#6366F1]" />,
};

export const mockActivities: Activity[] = [
  { id: 1, customer: { name: "David Lee", avatar: "DL" }, type: "询价", source: "WhatsApp", status: "pending_review", time: "2分钟前" },
  { id: 2, customer: { name: "Anna Schmidt", avatar: "AS" }, type: "产品咨询", source: "Email", status: "auto_replied", time: "8分钟前" },
  { id: 3, customer: { name: "Carlos Ruiz", avatar: "CR" }, type: "订单跟进", source: "WhatsApp", status: "auto_replied", time: "15分钟前" },
  { id: 4, customer: { name: "James Wilson", avatar: "JW" }, type: "询价", source: "LinkedIn", status: "transferred", time: "32分钟前" },
  { id: 5, customer: { name: "Sophie Martin", avatar: "SM" }, type: "产品咨询", source: "网站表单", status: "auto_replied", time: "1小时前" },
  { id: 6, customer: { name: "Mohammed Ali", avatar: "MA" }, type: "投诉", source: "Email", status: "transferred", time: "1小时前" },
  { id: 7, customer: { name: "Lisa Zhang", avatar: "LZ" }, type: "询价", source: "WhatsApp", status: "auto_replied", time: "2小时前" },
  { id: 8, customer: { name: "Tom Brown", avatar: "TB" }, type: "闲聊", source: "LinkedIn", status: "auto_replied", time: "3小时前" },
];

interface ActivityFeedProps {
  activities: Activity[];
  selectedSource: string | null;
}

export default function ActivityFeed({ activities, selectedSource }: ActivityFeedProps) {
  const filtered = selectedSource
    ? activities.filter((a) => a.source === selectedSource)
    : activities;

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-sm text-foreground">最近活动流</h3>
          <p className="text-[11px] text-white/35">
            实时询盘处理动态
            {selectedSource && <span className="text-primary ml-1">· 筛选: {selectedSource}</span>}
          </p>
        </div>
        <Link to="/inbox" className="text-[11px] text-primary hover:underline">查看全部</Link>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[1fr_80px_80px_110px_80px_60px] gap-2 px-2 py-1.5 text-[10px] text-white/25 uppercase tracking-wider font-medium border-b border-white/[0.06]">
        <span>客户</span>
        <span>类型</span>
        <span>来源</span>
        <span>处理方式</span>
        <span>时间</span>
        <span>操作</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/[0.04]">
        {filtered.map((activity) => {
          const status = statusConfig[activity.status];
          return (
            <div
              key={activity.id}
              className={cn(
                "grid grid-cols-[1fr_80px_80px_110px_80px_60px] gap-2 px-2 py-2.5 items-center hover:bg-white/[0.02] transition-colors rounded-md",
                activity.status === "pending_review" && "bg-brand-orange/[0.03]"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] font-semibold shrink-0 text-white/60">
                  {activity.customer.avatar}
                </div>
                <span className="text-xs font-medium truncate">{activity.customer.name}</span>
              </div>
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded-md w-fit font-medium", typeColors[activity.type] || "bg-white/[0.06] text-white/50")}>
                {activity.type}
              </span>
              <div className="flex items-center gap-1.5">
                {sourceIcons[activity.source]}
                <span className="text-[10px] text-white/40">{activity.source}</span>
              </div>
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded-md w-fit font-medium flex items-center gap-1", status.className)}>
                {status.emoji} {status.label}
              </span>
              <span className="text-[10px] text-white/35">{activity.time}</span>
              <Link to="/inbox" className="text-[10px] text-primary hover:underline">详情</Link>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-8 text-center text-xs text-white/30">暂无匹配的活动记录</div>
      )}
    </div>
  );
}
