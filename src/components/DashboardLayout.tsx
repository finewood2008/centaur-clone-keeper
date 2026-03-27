/**
 * DashboardLayout - Premium Dark Glassmorphism
 * 桌面：左侧紧凑导航 + 顶部状态栏 + 主内容区
 * 移动：底部Tab导航 + 简化顶栏
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Inbox, Share2, Megaphone, Mail,
  Users, Package, ChevronLeft, ChevronRight, Bell, Search,
  Settings, Zap, Activity, Cpu, HardDrive, Database,
  Archive, Download, Coins, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import AgentStatusPanel from "./AgentStatusPanel";
import PointsStatusBar from "./PointsStatusBar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
  description?: string;
}

const mainNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "控制台", href: "/", description: "业务监控中心" },
  { icon: Inbox, label: "询盘中心", href: "/inbox", badge: 12, description: "全渠道消息聚合" },
  { icon: Package, label: "产品库", href: "/products", description: "产品目录与AI选品" },
  { icon: Share2, label: "社媒内容", href: "/social", description: "多平台内容生成" },
  { icon: Megaphone, label: "广告投放", href: "/ads", description: "跨平台广告管理" },
  { icon: Mail, label: "邮件营销", href: "/email", description: "AI开发信与自动序列" },
  { icon: Users, label: "客户管理", href: "/customers", description: "360度客户画像" },
];

const dataNavItems: NavItem[] = [
  { icon: Database, label: "数据中心", href: "/data", description: "数据安全与管理" },
  { icon: Archive, label: "备份中心", href: "/data/backup", description: "自动备份与恢复" },
  { icon: Download, label: "数据导出", href: "/data/export", description: "多格式数据导出" },
  { icon: Coins, label: "消费中心", href: "/billing", description: "计费与点数管理" },
];

const mobileTabItems: NavItem[] = [
  { icon: LayoutDashboard, label: "控制台", href: "/" },
  { icon: Inbox, label: "询盘", href: "/inbox", badge: 12 },
  { icon: Package, label: "产品库", href: "/products" },
  { icon: Mail, label: "邮件", href: "/email" },
  { icon: Users, label: "客户", href: "/customers" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [sidebarGlow, setSidebarGlow] = useState({ x: 0, y: 0, visible: false });

  const handleSidebarMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setSidebarGlow({ x: e.clientX - rect.left, y: e.clientY - rect.top, visible: true });
  }, []);

  const handleSidebarMouseLeave = useCallback(() => {
    setSidebarGlow((prev) => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const timeStr = currentTime.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  const dateStr = currentTime.toLocaleDateString("zh-CN", { month: "short", day: "numeric", weekday: "short" });

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-background">
        {/* Mobile top bar */}
        <header className="h-12 border-b border-border/50 flex items-center justify-between px-3 shrink-0 glass-panel">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/90 flex items-center justify-center glow-orange">
              <Zap className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-sm text-foreground">半人马AI（DEMO）</span>
          </div>
          <div className="flex items-center gap-1">
            <PointsStatusBar />
            <button className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-orange glow-orange" />
            </button>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground">
                  <Menu className="w-4 h-4" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-0 glass-panel-strong bg-background/80">
                <SheetTitle className="sr-only">导航菜单</SheetTitle>
                <div className="p-4 border-b border-border/50 brand-glow">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-orange">
                      <Zap className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-display font-semibold text-sm">半人马AI（DEMO）</div>
                      <div className="text-[10px] text-muted-foreground">外贸OPC超级工作台</div>
                    </div>
                  </div>
                </div>
                <nav className="p-3 space-y-1">
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 mb-1">核心模块</div>
                  {mainNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 px-2 py-2.5 rounded-md text-sm transition-all relative",
                          active ? "nav-active-bg text-foreground" : "text-white/50 hover:text-white/80 hover:bg-white/[0.03]"
                        )}
                      >
                        {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r bg-primary nav-glow-indicator" />}
                        <Icon className={cn("w-4 h-4", active ? "text-primary" : "text-white/40")} />
                        <span className="text-xs font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded font-medium">{item.badge}</span>
                        )}
                      </Link>
                    );
                  })}
                  <div className="my-2 border-t border-white/[0.06]" />
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 mb-1">数据中心</div>
                  {dataNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = item.href === "/data" ? location.pathname === "/data" : location.pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 px-2 py-2.5 rounded-md text-sm transition-all relative",
                          active ? "nav-active-bg text-foreground" : "text-white/50 hover:text-white/80 hover:bg-white/[0.03]"
                        )}
                      >
                        {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r bg-primary nav-glow-indicator" />}
                        <Icon className={cn("w-4 h-4", active ? "text-primary" : "text-white/40")} />
                        <span className="text-xs font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                  <div className="my-2 border-t border-white/[0.06]" />
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-2 py-2.5 rounded-md text-sm text-white/50 hover:text-white/80 hover:bg-white/[0.03] transition-all"
                  >
                    <Settings className="w-4 h-4 text-white/40" />
                    <span className="text-xs font-medium">设置</span>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 pb-20">
          {children}
        </main>

        {/* Bottom tab bar */}
        <nav className="fixed bottom-0 left-0 right-0 h-16 glass-panel-strong flex items-center justify-around px-1 z-40 safe-area-pb">
          {mobileTabItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors relative min-w-[48px]",
                  active ? "text-primary" : "text-white/40"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
                {item.badge && (
                  <span className="absolute -top-0.5 right-0 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center glow-orange">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-white/40 min-w-[48px]"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-medium">更多</span>
          </button>
        </nav>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <motion.aside
        ref={sidebarRef}
        onMouseMove={handleSidebarMouseMove}
        onMouseLeave={handleSidebarMouseLeave}
        animate={{ width: collapsed ? 60 : 210 }}
        transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
        className="sidebar-glow-track flex flex-col border-r border-white/[0.06] bg-sidebar shrink-0 overflow-hidden relative"
        style={{
          '--glow-x': `${sidebarGlow.x}px`,
          '--glow-y': `${sidebarGlow.y}px`,
          '--glow-opacity': sidebarGlow.visible ? '1' : '0',
        } as React.CSSProperties}
      >
        {/* Brand with glow */}
        <div className="relative flex items-center gap-2 px-3 h-14 border-b border-white/[0.06] shrink-0">
          <div className="absolute inset-0 brand-glow opacity-60" />
          <div className="relative w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 glow-orange">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden relative">
              <div className="font-display font-semibold text-sm text-foreground whitespace-nowrap">半人马AI（DEMO）</div>
              <div className="text-[10px] text-muted-foreground whitespace-nowrap">外贸OPC超级工作台</div>
            </motion.div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <div className={cn("px-2 mb-1", collapsed && "px-0")}>
            {!collapsed && <div className="text-[9px] font-semibold text-white/30 uppercase tracking-[0.15em] px-2 mb-2">核心模块</div>}
            {mainNavItems.map((item) => (
              <NavLink key={item.href} item={item} active={item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href)} collapsed={collapsed} />
            ))}
          </div>
          <div className="mx-3 my-3 border-t border-white/[0.06]" />
          <div className={cn("px-2", collapsed && "px-0")}>
            {!collapsed && <div className="text-[9px] font-semibold text-white/30 uppercase tracking-[0.15em] px-2 mb-2">数据中心</div>}
            {dataNavItems.map((item) => (
              <NavLink key={item.href} item={item} active={item.href === "/data" ? location.pathname === "/data" : location.pathname.startsWith(item.href)} collapsed={collapsed} />
            ))}
          </div>
        </nav>

        <AgentStatusPanel collapsed={collapsed} />

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-10 flex items-center justify-center border-t border-white/[0.06] text-white/30 hover:text-white/60 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </motion.aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-12 border-b border-white/[0.06] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                type="text"
                placeholder="全局搜索..."
                className="search-glass w-56 h-8 rounded-lg pl-8 pr-3 text-xs text-foreground placeholder:text-white/30 outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PointsStatusBar />
            {/* Agent active pill */}
            <div className="pill-badge">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse-glow" />
              <span className="text-white/60 font-mono">5 Agents</span>
            </div>
            {/* Date pill */}
            <div className="pill-badge">
              <span className="text-white/50 font-mono">{dateStr} {timeStr}</span>
            </div>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/[0.04] transition-all relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-orange glow-orange" />
            </button>
            <Link to="/settings" className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/[0.04] transition-all">
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLink({ item, active, collapsed }: { item: NavItem; active: boolean; collapsed: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.href}
      className={cn(
        "relative flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-all group mb-0.5",
        active
          ? "nav-active-bg text-foreground"
          : "text-white/50 hover:text-white/80 hover:bg-white/[0.03]",
        collapsed && "justify-center px-0 mx-1"
      )}
    >
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-primary rounded-r nav-glow-indicator"
        />
      )}
      <Icon className={cn("w-4 h-4 shrink-0 transition-colors", active ? "text-primary" : "text-white/40 group-hover:text-white/60")} />
      {!collapsed && (
        <>
          <span className="text-xs font-medium truncate">{item.label}</span>
          {item.badge && (
            <span className="ml-auto text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-semibold">
              {item.badge}
            </span>
          )}
        </>
      )}
      {collapsed && item.badge && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center glow-orange">
          {item.badge > 9 ? "9+" : item.badge}
        </span>
      )}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2.5 py-1.5 glass-panel-strong rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
          <div className="text-xs font-medium text-foreground">{item.label}</div>
          {item.description && <div className="text-[10px] text-white/40">{item.description}</div>}
        </div>
      )}
    </Link>
  );
}
