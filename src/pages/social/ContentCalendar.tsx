/**
 * ContentCalendar — 内容日历（C位页面）
 * 月历 + 列表双视图，从后端拉真实数据
 */
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays, List, Plus, ChevronLeft, ChevronRight,
  Linkedin, Facebook, Instagram, Edit3, Trash2, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useContentPosts, useDeletePost, type ContentPost, type PostStatus } from "@/hooks/use-content-posts";
import BatchContentGenerator from "@/components/social/BatchContentGenerator";

// ---------- Config ----------

const STATUS_CFG: Record<PostStatus, { label: string; dot: string; badge: string }> = {
  draft:     { label: "草稿",     dot: "bg-gray-400",    badge: "bg-gray-100 text-gray-600" },
  scheduled: { label: "待发布",   dot: "bg-orange-400",  badge: "bg-orange-50 text-orange-600" },
  published: { label: "已发布",   dot: "bg-green-500",   badge: "bg-green-50 text-green-700" },
  failed:    { label: "发布失败", dot: "bg-red-500",     badge: "bg-red-50 text-red-600" },
};

const PLATFORM_ICON: Record<string, React.ReactNode> = {
  linkedin:  <Linkedin className="w-3 h-3" />,
  facebook:  <Facebook className="w-3 h-3" />,
  instagram: <Instagram className="w-3 h-3" />,
};

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

// ---------- Helpers ----------

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}
function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function getMonday(d: Date) {
  const day = d.getDay() || 7;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day + 1);
}

// ---------- Component ----------

export default function ContentCalendar() {
  const navigate = useNavigate();
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [batchOpen, setBatchOpen] = useState(false);

  const { data: posts = [], isLoading } = useContentPosts();
  const deleteMut = useDeletePost();

  // Group posts by date string
  const byDate = useMemo(() => {
    const map: Record<string, ContentPost[]> = {};
    for (const p of posts) {
      const dateStr = (p.scheduled_at || p.created_at || "").slice(0, 10);
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(p);
    }
    return map;
  }, [posts]);

  // Calendar grid cells
  const calendarCells = useMemo(() => {
    const first = startOfMonth(month);
    const totalDays = daysInMonth(month);
    const mondayBefore = getMonday(first);

    const cells: { date: Date; inMonth: boolean }[] = [];
    const d = new Date(mondayBefore);
    // Always show 6 weeks
    for (let i = 0; i < 42; i++) {
      cells.push({
        date: new Date(d),
        inMonth: d.getMonth() === month.getMonth(),
      });
      d.setDate(d.getDate() + 1);
    }
    return cells;
  }, [month]);

  const today = fmt(new Date());

  const prevMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
  const nextMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));

  const handleDelete = (id: string) => {
    if (!confirm("确定删除这篇内容？")) return;
    deleteMut.mutate(id, {
      onSuccess: () => toast({ title: "已删除" }),
    });
  };

  // Sorted list for list view
  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => (b.scheduled_at || b.created_at).localeCompare(a.scheduled_at || a.created_at)),
    [posts]
  );

  return (
    <div className="space-y-4">
      {/* ---- Top Bar ---- */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Month nav */}
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold min-w-[120px] text-center">
            {month.getFullYear()}年{month.getMonth() + 1}月
          </span>
          <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-secondary/60 rounded-md p-0.5">
          <button
            onClick={() => setView("calendar")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-colors",
              view === "calendar" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <CalendarDays className="w-3.5 h-3.5" /> 月历
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-colors",
              view === "list" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="w-3.5 h-3.5" /> 列表
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBatchOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" /> AI排期
          </button>
          <button
            onClick={() => navigate("/social/create")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-secondary transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> 新建
          </button>
        </div>
      </div>

      {/* ---- Loading ---- */}
      {isLoading && (
        <div className="text-xs text-muted-foreground text-center py-8">加载中…</div>
      )}

      {/* ---- Calendar View ---- */}
      {!isLoading && view === "calendar" && (
        <div className="border border-border rounded-lg overflow-hidden">
          {/* Weekday header */}
          <div className="grid grid-cols-7 bg-secondary/40">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-1.5 text-center text-[11px] font-medium text-muted-foreground">
                {d}
              </div>
            ))}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7">
            {calendarCells.map((cell, i) => {
              const dateStr = fmt(cell.date);
              const dayPosts = byDate[dateStr] || [];
              const isToday = dateStr === today;
              return (
                <div
                  key={i}
                  onClick={() => {
                    if (dayPosts.length === 0) navigate(`/social/create?date=${dateStr}`);
                  }}
                  className={cn(
                    "min-h-[90px] border-t border-r border-border p-1 cursor-pointer hover:bg-secondary/30 transition-colors",
                    !cell.inMonth && "bg-secondary/10 opacity-50",
                    i % 7 === 0 && "border-l-0",
                  )}
                >
                  <div className={cn(
                    "text-[11px] font-medium mb-0.5 w-5 h-5 flex items-center justify-center rounded-full",
                    isToday && "bg-primary text-primary-foreground",
                    !isToday && !cell.inMonth && "text-muted-foreground/50",
                    !isToday && cell.inMonth && "text-foreground"
                  )}>
                    {cell.date.getDate()}
                  </div>
                  <div className="space-y-0.5">
                    {dayPosts.slice(0, 3).map((p) => {
                      const cfg = STATUS_CFG[p.status];
                      return (
                        <div
                          key={p.id}
                          onClick={(e) => { e.stopPropagation(); navigate(`/social/create?id=${p.id}`); }}
                          className="flex items-center gap-1 px-1 py-0.5 rounded text-[10px] bg-background/80 border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer truncate"
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot)} />
                          <span className="truncate">{p.title}</span>
                          <span className="ml-auto flex items-center gap-0.5 shrink-0">
                            {p.platforms.slice(0, 2).map((pl) => (
                              <span key={pl} className="text-muted-foreground">{PLATFORM_ICON[pl]}</span>
                            ))}
                          </span>
                        </div>
                      );
                    })}
                    {dayPosts.length > 3 && (
                      <div className="text-[10px] text-muted-foreground pl-1">
                        +{dayPosts.length - 3} 更多
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---- List View ---- */}
      {!isLoading && view === "list" && (
        <div className="border border-border rounded-lg overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[100px_1fr_100px_80px_70px] gap-2 px-3 py-2 bg-secondary/40 text-[11px] font-medium text-muted-foreground">
            <span>日期</span>
            <span>标题</span>
            <span>平台</span>
            <span>状态</span>
            <span>操作</span>
          </div>
          {sortedPosts.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-8">
              暂无内容，点击 "AI排期" 一键生成
            </div>
          )}
          {sortedPosts.map((p) => {
            const cfg = STATUS_CFG[p.status];
            const dateStr = (p.scheduled_at || p.created_at || "").slice(0, 10);
            return (
              <div
                key={p.id}
                className="grid grid-cols-[100px_1fr_100px_80px_70px] gap-2 px-3 py-2 border-t border-border text-xs hover:bg-secondary/20 transition-colors items-center"
              >
                <span className="text-muted-foreground">{dateStr}</span>
                <span
                  className="truncate cursor-pointer hover:text-primary transition-colors"
                  onClick={() => navigate(`/social/create?id=${p.id}`)}
                >
                  {p.title}
                </span>
                <span className="flex items-center gap-1">
                  {p.platforms.map((pl) => (
                    <span key={pl} className="text-muted-foreground">{PLATFORM_ICON[pl]}</span>
                  ))}
                </span>
                <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium w-fit", cfg.badge)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                  {cfg.label}
                </span>
                <span className="flex items-center gap-1">
                  <button
                    onClick={() => navigate(`/social/create?id=${p.id}`)}
                    className="p-1 rounded hover:bg-secondary transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats bar */}
      {!isLoading && posts.length > 0 && (
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
          <span>共 {posts.length} 篇</span>
          <span>· 草稿 {posts.filter(p => p.status === 'draft').length}</span>
          <span>· 待发布 {posts.filter(p => p.status === 'scheduled').length}</span>
          <span>· 已发布 {posts.filter(p => p.status === 'published').length}</span>
        </div>
      )}

      {/* Batch Generator Dialog */}
      <BatchContentGenerator open={batchOpen} onOpenChange={setBatchOpen} />
    </div>
  );
}
