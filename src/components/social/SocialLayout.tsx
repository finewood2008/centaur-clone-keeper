/**
 * SocialLayout - 社媒中心子导航布局
 */
import { NavLink, Outlet } from "react-router-dom";
import { Users, FolderOpen, PenTool, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import ApiKeyBanner from "@/components/ApiKeyBanner";

const subNav = [
  { label: "账号管理", href: "/social/accounts", icon: Users },
  { label: "素材库", href: "/social/assets", icon: FolderOpen },
  { label: "内容创作", href: "/social/create", icon: PenTool },
  { label: "内容日历", href: "/social/calendar", icon: CalendarDays },
];

export default function SocialLayout() {
  return (
    <div className="space-y-4">
      <ApiKeyBanner description="后，AI 文案生成、多平台改写等功能将自动激活" />
      <div>
        <h2 className="font-display font-semibold text-lg">社媒中心</h2>
        <p className="text-xs text-muted-foreground">AI辅助创作 · 多平台自动发布</p>
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
