/**
 * UserMenu - 顶部用户头像 + 退出菜单
 */
import { useNavigate } from "react-router-dom";
import { LogOut, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export default function UserMenu({ compact = false }: { compact?: boolean }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const email = user.email ?? "";
  const fullName = (user.user_metadata as any)?.full_name as string | undefined;
  const initial = (fullName?.[0] || email[0] || "U").toUpperCase();
  const display = fullName || email.split("@")[0];

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("已退出登录");
      navigate("/auth", { replace: true });
    } catch (err: any) {
      toast.error(err?.message || "退出失败");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`${
            compact ? "w-8 h-8" : "w-8 h-8"
          } rounded-full bg-gradient-to-br from-primary/30 to-brand-orange/20 border border-white/[0.08] flex items-center justify-center text-xs font-semibold text-foreground hover:border-primary/40 hover:shadow-[0_0_0_3px_hsl(var(--primary)/0.12)] transition-all`}
          aria-label="用户菜单"
        >
          {initial}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 glass-panel-strong border-white/[0.08]"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none truncate">{display}</p>
            <p className="text-[11px] leading-none text-muted-foreground truncate">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
          <UserIcon className="w-3.5 h-3.5 mr-2" />
          账户设置
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-brand-orange focus:text-brand-orange"
        >
          <LogOut className="w-3.5 h-3.5 mr-2" />
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
