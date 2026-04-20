/**
 * AdsLayout - 广告投放子导航布局
 */
import { NavLink, Outlet } from "react-router-dom";
import { Users, BarChart3, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import ApiKeyBanner from "@/components/ApiKeyBanner";

const subNav = [
  { label: "账户管理", href: "/ads/accounts", icon: Users },
  { label: "投放控制台", href: "/ads/dashboard", icon: BarChart3 },
  { label: "AI优化审核", href: "/ads/approvals", icon: ShieldCheck },
];

export default function AdsLayout() {
  return (
    <div className="space-y-4">
      <ApiKeyBanner description="后，AI 广告优化建议与自动审核将自动激活" />
      <div>
        <h2 className="font-display font-semibold text-lg">广告投放</h2>
        <p className="text-xs text-muted-foreground">AI自动优化 · 人工审核协作</p>
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
