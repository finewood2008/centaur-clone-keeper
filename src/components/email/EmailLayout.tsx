/**
 * EmailLayout - AI邮件营销子导航布局
 */
import { NavLink, Outlet } from "react-router-dom";
import { Users, PenLine, FolderOpen, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import ApiKeyBanner from "@/components/ApiKeyBanner";

const subNav = [
  { label: "客户列表", href: "/email/lists", icon: Users },
  { label: "创建活动", href: "/email/create", icon: PenLine },
  { label: "活动管理", href: "/email/campaigns", icon: FolderOpen },
  { label: "数据分析", href: "/email/analytics", icon: BarChart3 },
];

export default function EmailLayout() {
  return (
    <div className="space-y-4">
      <ApiKeyBanner description="后，AI 开发信生成与自动化跟进序列将自动激活" />
      <div>
        <h2 className="font-display font-semibold text-lg">AI邮件营销</h2>
        <p className="text-xs text-muted-foreground">智能开发信 · 自动化序列 · 效果追踪</p>
      </div>
      <div className="flex gap-1 border-b border-border pb-0 overflow-x-auto">
        {subNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-md transition-colors border-b-2 -mb-px whitespace-nowrap shrink-0",
                  isActive
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </NavLink>
          );
        })}
      </div>
      <Outlet />
    </div>
  );
}
