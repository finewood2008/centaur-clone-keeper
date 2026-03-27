/**
 * ContentCalendar - 内容日历
 * 完整月历视图 + 列表视图，支持拖拽调整发布时间
 */
import { useState, useCallback, useRef, DragEvent } from "react";
import {
  CalendarDays, List, Plus, Eye, Heart, MessageSquare, Share2,
  Clock, Edit3, Trash2, AlertCircle, ChevronLeft, ChevronRight,
  Linkedin, Facebook, Instagram, GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type PostStatus = "published" | "scheduled" | "draft" | "failed";

interface CalendarPost {
  id: number;
  title: string;
  platforms: string[];
  status: PostStatus;
  date: string;
  time?: string;
  content: string;
  analytics?: { views: number; likes: number; comments: number };
}

const statusConfig: Record<PostStatus, { label: string; emoji: string; className: string; dotClass: string }> = {
  published: { label: "已发布", emoji: "✓", className: "bg-brand-green/15 text-brand-green", dotClass: "bg-brand-green" },
  scheduled: { label: "待发布", emoji: "⏰", className: "bg-brand-orange/15 text-brand-orange", dotClass: "bg-brand-orange" },
  draft: { label: "草稿", emoji: "📝", className: "bg-secondary text-muted-foreground", dotClass: "bg-muted-foreground" },
  failed: { label: "发布失败", emoji: "❌", className: "bg-destructive/15 text-destructive", dotClass: "bg-destructive" },
};

const platformIcons: Record<string, React.ReactNode> = {
  linkedin: <Linkedin className="w-3 h-3" />,
  facebook: <Facebook className="w-3 h-3" />,
  instagram: <Instagram className="w-3 h-3" />,
};

const initialPosts: CalendarPost[] = [
  { id: 1, title: "LED行业趋势分析", platforms: ["linkedin"], status: "published", date: "2026-03-25", time: "10:00", content: "2026年LED照明行业趋势...", analytics: { views: 245, likes: 18, comments: 5 } },
  { id: 2, title: "新品发布预告", platforms: ["linkedin", "facebook"], status: "published", date: "2026-03-25", time: "14:00", content: "新品即将上市...", analytics: { views: 180, likes: 12, comments: 3 } },
  { id: 3, title: "新品发布会直播", platforms: ["linkedin", "facebook"], status: "scheduled", date: "2026-03-26", time: "14:00", content: "诚邀参加我们的新品发布会..." },
  { id: 4, title: "工厂参观视频", platforms: ["instagram"], status: "draft", date: "2026-03-26", content: "带您走进我们的智能工厂..." },
  { id: 5, title: "客户案例分享", platforms: ["linkedin"], status: "scheduled", date: "2026-03-27", time: "09:00", content: "与TechCorp的合作案例..." },
  { id: 6, title: "节能对比测试", platforms: ["facebook", "instagram"], status: "failed", date: "2026-03-24", time: "16:00", content: "LED vs 传统灯泡能耗对比..." },
  { id: 7, title: "团队文化展示", platforms: ["instagram"], status: "published", date: "2026-03-23", time: "11:00", content: "我们的团队日常...", analytics: { views: 320, likes: 45, comments: 8 } },
  { id: 8, title: "行业展会预告", platforms: ["linkedin", "facebook"], status: "scheduled", date: "2026-03-28", time: "08:00", content: "我们将参加2026年广交会..." },
];

// Calendar helpers
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

function formatDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function ContentCalendar() {
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [posts, setPosts] = useState(initialPosts);
  const [expandedDate, setExpandedDate] = useState<string | null>("2026-03-26");
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(2); // March = 2
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const draggedPostRef = useRef<CalendarPost | null>(null);

  const postsByDate: Record<string, CalendarPost[]> = {};
  posts.forEach((p) => {
    if (!postsByDate[p.date]) postsByDate[p.date] = [];
    postsByDate[p.date].push(p);
  });

  const sortedDates = Object.keys(postsByDate).sort((a, b) => b.localeCompare(a));

  const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    return `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`;
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  const goToToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(2);
  };

  // Drag & Drop
  const handleDragStart = useCallback((e: DragEvent, post: CalendarPost) => {
    draggedPostRef.current = post;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(post.id));
  }, []);

  const handleDragOver = useCallback((e: DragEvent, dateStr: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverDate(dateStr);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverDate(null);
  }, []);

  const handleDrop = useCallback((e: DragEvent, targetDate: string) => {
    e.preventDefault();
    setDragOverDate(null);
    const post = draggedPostRef.current;
    if (!post || post.date === targetDate) return;
    if (post.status === "published") {
      toast({ title: "无法移动已发布内容", description: "已发布的内容不能更改日期", variant: "destructive" });
      return;
    }
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, date: targetDate } : p));
    toast({ title: "发布时间已更新", description: `「${post.title}」已移动到 ${formatDate(targetDate)}` });
    draggedPostRef.current = null;
  }, []);

  // Build full month grid
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const prevMonthDays = getDaysInMonth(currentYear, currentMonth === 0 ? 11 : currentMonth - 1);

  const calendarCells: { day: number; dateStr: string; isCurrentMonth: boolean; isToday: boolean }[] = [];

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = currentMonth === 0 ? 11 : currentMonth - 1;
    const y = currentMonth === 0 ? currentYear - 1 : currentYear;
    calendarCells.push({ day: d, dateStr: formatDateStr(y, m, d), isCurrentMonth: false, isToday: false });
  }

  // Current month days
  const today = new Date();
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDateStr(currentYear, currentMonth, d);
    const isToday = currentYear === today.getFullYear() && currentMonth === today.getMonth() && d === today.getDate();
    calendarCells.push({ day: d, dateStr, isCurrentMonth: true, isToday });
  }

  // Next month leading days
  const remaining = 7 - (calendarCells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth === 11 ? 0 : currentMonth + 1;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      calendarCells.push({ day: d, dateStr: formatDateStr(y, m, d), isCurrentMonth: false, isToday: false });
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-secondary rounded-lg p-0.5">
          <button
            onClick={() => setView("calendar")}
            className={cn("text-xs px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors",
              view === "calendar" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            )}
          ><CalendarDays className="w-3 h-3" /> 日历视图</button>
          <button
            onClick={() => setView("list")}
            className={cn("text-xs px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors",
              view === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            )}
          ><List className="w-3 h-3" /> 列表视图</button>
        </div>
        <button className="text-xs font-medium bg-primary text-primary-foreground px-3 py-2 rounded-lg flex items-center gap-1 hover:opacity-90 transition-opacity">
          <Plus className="w-3.5 h-3.5" /> 新建内容
        </button>
      </div>

      {/* Calendar View - Full Month Grid */}
      {view === "calendar" && (
        <div className="space-y-3">
          <div className="glass-panel rounded-xl overflow-hidden">
            {/* Month Header */}
            <div className="flex items-center justify-between p-3 border-b border-border">
              <button onClick={prevMonth} className="p-1 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{currentYear}年{monthNames[currentMonth]}</span>
                <button onClick={goToToday} className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                  今天
                </button>
              </div>
              <button onClick={nextMonth} className="p-1 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-border">
              {["周一", "周二", "周三", "周四", "周五", "周六", "周日"].map((d) => (
                <div key={d} className="text-[10px] text-muted-foreground py-2 text-center font-medium">{d}</div>
              ))}
            </div>

            {/* Day Cells Grid */}
            <div className="grid grid-cols-7">
              {calendarCells.map((cell, idx) => {
                const dayPosts = postsByDate[cell.dateStr] || [];
                const isDragOver = dragOverDate === cell.dateStr;
                return (
                  <div
                    key={idx}
                    className={cn(
                      "min-h-[90px] border-b border-r border-border/50 p-1 transition-colors relative",
                      !cell.isCurrentMonth && "bg-secondary/30",
                      isDragOver && "bg-primary/10 ring-1 ring-inset ring-primary/30",
                      cell.isToday && "bg-primary/5",
                      idx % 7 === 6 && "border-r-0",
                    )}
                    onDragOver={(e) => handleDragOver(e, cell.dateStr)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, cell.dateStr)}
                    onClick={() => {
                      if (dayPosts.length > 0) setExpandedDate(expandedDate === cell.dateStr ? null : cell.dateStr);
                    }}
                  >
                    {/* Day Number */}
                    <div className={cn(
                      "text-[11px] mb-0.5 w-5 h-5 flex items-center justify-center rounded-full",
                      cell.isToday && "bg-primary text-primary-foreground font-bold",
                      !cell.isCurrentMonth && "text-muted-foreground/50",
                      cell.isCurrentMonth && !cell.isToday && "text-foreground",
                    )}>
                      {cell.day}
                    </div>

                    {/* Posts in cell */}
                    <div className="space-y-0.5">
                      {dayPosts.slice(0, 3).map((post) => {
                        const sc = statusConfig[post.status];
                        const isDraggable = post.status !== "published";
                        return (
                          <div
                            key={post.id}
                            draggable={isDraggable}
                            onDragStart={(e) => isDraggable && handleDragStart(e, post)}
                            className={cn(
                              "text-[9px] px-1 py-0.5 rounded truncate flex items-center gap-0.5",
                              sc.className,
                              isDraggable && "cursor-grab active:cursor-grabbing hover:ring-1 hover:ring-primary/20",
                              !isDraggable && "cursor-default",
                            )}
                            onClick={(e) => e.stopPropagation()}
                            title={`${post.title}${isDraggable ? " (拖拽可调整日期)" : " (已发布，不可移动)"}`}
                          >
                            {isDraggable && <GripVertical className="w-2 h-2 flex-shrink-0 opacity-40" />}
                            <span className="truncate">{post.title}</span>
                          </div>
                        );
                      })}
                      {dayPosts.length > 3 && (
                        <div className="text-[9px] text-muted-foreground text-center">+{dayPosts.length - 3}更多</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground px-1">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-green" /> 已发布</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-orange" /> 待发布</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground" /> 草稿</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> 失败</span>
            <span className="ml-auto flex items-center gap-1"><GripVertical className="w-3 h-3" /> 拖拽可调整发布日期</span>
          </div>

          {/* Expanded day detail */}
          {expandedDate && postsByDate[expandedDate] && (
            <div className="glass-panel rounded-xl p-3 space-y-2">
              <h4 className="text-xs font-semibold">{formatDate(expandedDate)}</h4>
              {postsByDate[expandedDate].map((post) => {
                const sc = statusConfig[post.status];
                return (
                  <div key={post.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 group">
                    <span className={cn("text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap", sc.className)}>{sc.emoji} {sc.label}</span>
                    <span className="text-[11px] font-medium flex-1 truncate">{post.title}</span>
                    <div className="flex gap-0.5">{post.platforms.map((p) => <span key={p} className="text-muted-foreground">{platformIcons[p]}</span>)}</div>
                    {post.time && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Clock className="w-3 h-3" />{post.time}</span>}
                    {post.analytics && (
                      <div className="hidden group-hover:flex gap-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{post.analytics.views}</span>
                        <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" />{post.analytics.likes}</span>
                        <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" />{post.analytics.comments}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <div className="space-y-3">
          {sortedDates.map((date) => {
            const dayPosts = postsByDate[date];
            const isExpanded = expandedDate === date;
            return (
              <div key={date} className="bg-card border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedDate(isExpanded ? null : date)}
                  className="w-full flex items-center justify-between p-3 hover:bg-secondary/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    <span className="text-xs font-semibold">{formatDate(date)}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {dayPosts.map((p) => {
                      const sc = statusConfig[p.status];
                      return <span key={p.id} className={cn("text-[9px] px-1.5 py-0.5 rounded", sc.className)}>{sc.emoji}</span>;
                    })}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border divide-y divide-border/50">
                    {dayPosts.map((post) => {
                      const sc = statusConfig[post.status];
                      return (
                        <div key={post.id} className="p-3 hover:bg-secondary/20 transition-colors">
                          <div className="flex items-start justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5", sc.className)}>
                                {sc.emoji} {sc.label}
                              </span>
                              <span className="text-xs font-medium">{post.title}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {post.platforms.map((p) => <span key={p} className="text-muted-foreground">{platformIcons[p]}</span>)}
                              {post.time && (
                                <span className="text-[10px] text-muted-foreground ml-1 flex items-center gap-0.5">
                                  <Clock className="w-3 h-3" /> {post.time}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-[11px] text-muted-foreground mb-2 line-clamp-1">{post.content}</p>

                          {post.analytics && (
                            <div className="flex gap-4 mb-2 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.analytics.views}</span>
                              <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.analytics.likes}</span>
                              <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.analytics.comments}</span>
                            </div>
                          )}

                          <div className="flex gap-2">
                            {post.status === "published" && (
                              <button className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"><Eye className="w-3 h-3" /> 查看详情</button>
                            )}
                            {post.status === "scheduled" && (
                              <>
                                <button className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"><Edit3 className="w-3 h-3" /> 编辑</button>
                                <button onClick={() => toast({ title: "已取消发布" })} className="text-[10px] text-brand-orange hover:text-brand-orange/80 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> 取消发布</button>
                              </>
                            )}
                            {post.status === "draft" && (
                              <>
                                <button className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"><Edit3 className="w-3 h-3" /> 继续编辑</button>
                                <button className="text-[10px] text-destructive hover:text-destructive/80 flex items-center gap-1"><Trash2 className="w-3 h-3" /> 删除</button>
                              </>
                            )}
                            {post.status === "failed" && (
                              <button className="text-[10px] text-primary hover:text-primary/80 flex items-center gap-1"><Share2 className="w-3 h-3" /> 重新发布</button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ChevronDown(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
