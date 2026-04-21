/**
 * SocialLayout → 内容中心
 * 3 tabs: 内容日历(C位) → 内容创作 → 素材库
 */
import { NavLink, Outlet } from "react-router-dom";
import { CalendarDays, PenTool, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import ApiKeyBanner from "@/components/ApiKeyBanner";

const subNav = [
  { label: "内容日历", href: "/social/calendar", icon: CalendarDays },
  { label: "内容创作", href: "/social/create", icon: PenTool },
  { label: "素材库", href: "/social/assets", icon: FolderOpen },
];

export default function SocialLayout() {
  return (
    <div className="space-y-4">
      <ApiKeyBanner description="后，AI 内容生成、批量排期等功能将自动激活" />
      <div>
        <h2 className="font-display font-semibold text-lg">内容中心</h2>
        <p className="text-xs text-muted-foreground">AI预生成 · 按日历发布 · 多平台分发</p>
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
