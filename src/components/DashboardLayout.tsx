/**
 * DashboardLayout - 战略沙盘新工业主义美学
 * 左侧紧凑导航 + 顶部状态栏 + 主内容区
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Inbox, Share2, Megaphone, Mail,
  Users, Package, ChevronLeft, ChevronRight, Bell, Search,
  Settings, Zap, Activity, Cpu, HardDrive, Database,
  Archive, Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
  { icon: Share2, label: "社媒内容", href: "/social", description: "多平台内容生成" },
  { icon: Megaphone, label: "广告投放", href: "/ads", description: "跨平台广告管理" },
  { icon: Mail, label: "邮件营销", href: "/email", description: "AI开发信与自动序列" },
];

const dataNavItems: NavItem[] = [
  { icon: Users, label: "客户管理", href: "/customers", description: "360度客户画像" },
  { icon: Package, label: "产品库", href: "/products", description: "产品目录与AI优化" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = currentTime.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  const dateStr = currentTime.toLocaleDateString("zh-CN", { month: "short", day: "numeric", weekday: "short" });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 60 : 200 }}
        transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
        className="flex flex-col border-r border-sidebar-border bg-sidebar shrink-0 overflow-hidden"
      >
        {/* Brand */}
        <div className="flex items-center gap-2 px-3 h-14 border-b border-sidebar-border shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
              <div className="font-display font-semibold text-sm text-foreground whitespace-nowrap">半人马AI</div>
              <div className="text-[10px] text-muted-foreground whitespace-nowrap">外贸OPC超级工作台</div>
            </motion.div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 overflow-y-auto">
          <div className={cn("px-3 mb-1", collapsed && "px-0")}>
            {!collapsed && <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 mb-1">核心模块</div>}
            {mainNavItems.map((item) => (
              <NavLink key={item.href} item={item} active={item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href)} collapsed={collapsed} />
            ))}
          </div>
          <div className="mx-3 my-2 border-t border-sidebar-border" />
          <div className={cn("px-3", collapsed && "px-0")}>
            {!collapsed && <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 mb-1">数据中心</div>}
            {dataNavItems.map((item) => (
              <NavLink key={item.href} item={item} active={location.pathname.startsWith(item.href)} collapsed={collapsed} />
            ))}
          </div>
        </nav>

        {/* System status */}
        {!collapsed && (
          <div className="p-3 border-t border-sidebar-border">
            <div className="bg-sidebar-accent rounded-md p-2.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Activity className="w-3 h-3 text-brand-green" />
                <span className="text-[10px] font-medium text-foreground">系统状态</span>
              </div>
              <div className="space-y-1">
                <StatusRow icon={Cpu} label="AI Agent" value="运行中" ok />
                <StatusRow icon={HardDrive} label="系统负载" value="23%" ok />
              </div>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-10 flex items-center justify-center border-t border-sidebar-border text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </motion.aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-12 border-b border-border flex items-center justify-between px-4 shrink-0 bg-background">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="全局搜索..."
                className="w-56 h-8 bg-secondary rounded-md pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse-glow" />
              <span>5 Agents Active</span>
            </div>
            <div className="text-[11px] text-muted-foreground font-mono">{dateStr} {timeStr}</div>
            <button className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-orange" />
            </button>
            <button className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page content */}
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
        "relative flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors group mb-0.5",
        active
          ? "bg-sidebar-accent text-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground",
        collapsed && "justify-center px-0 mx-1"
      )}
    >
      {active && (
        <motion.div layoutId="nav-indicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-r" />
      )}
      <Icon className={cn("w-4 h-4 shrink-0", active && "text-primary")} />
      {!collapsed && (
        <>
          <span className="text-xs font-medium truncate">{item.label}</span>
          {item.badge && (
            <span className="ml-auto text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded font-medium">
              {item.badge}
            </span>
          )}
        </>
      )}
      {collapsed && item.badge && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
          {item.badge > 9 ? "9+" : item.badge}
        </span>
      )}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-popover border border-border rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
          <div className="text-xs font-medium">{item.label}</div>
          {item.description && <div className="text-[10px] text-muted-foreground">{item.description}</div>}
        </div>
      )}
    </Link>
  );
}

function StatusRow({ icon: Icon, label, value, ok }: { icon: React.ElementType; label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <Icon className="w-3 h-3 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
      <span className={cn("text-[10px] font-medium", ok ? "text-brand-green" : "text-destructive")}>{value}</span>
    </div>
  );
}
