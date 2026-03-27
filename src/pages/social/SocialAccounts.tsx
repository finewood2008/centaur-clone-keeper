/**
 * SocialAccounts - 社媒账号管理
 * 显示各平台连接状态，支持mock OAuth连接/断开
 */
import { useState } from "react";
import { Linkedin, Facebook, Instagram, Twitter, Check, AlertTriangle, Link2, Unlink, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface SocialAccount {
  platform: string;
  key: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  connected: boolean;
  username?: string;
  lastSync?: string;
  expired?: boolean;
}

const initialAccounts: SocialAccount[] = [
  { platform: "LinkedIn", key: "linkedin", icon: Linkedin, color: "text-[#0A66C2]", bgColor: "bg-[#0A66C2]/10", connected: true, username: "john@company.com", lastSync: "2分钟前" },
  { platform: "Facebook", key: "facebook", icon: Facebook, color: "text-[#1877F2]", bgColor: "bg-[#1877F2]/10", connected: false },
  { platform: "Instagram", key: "instagram", icon: Instagram, color: "text-[#E4405F]", bgColor: "bg-[#E4405F]/10", connected: true, username: "@company_official", lastSync: "1小时前" },
  { platform: "Twitter / X", key: "twitter", icon: Twitter, color: "text-[#1DA1F2]", bgColor: "bg-[#1DA1F2]/10", connected: false },
];

export default function SocialAccounts() {
  const [accounts, setAccounts] = useState(initialAccounts);

  const handleConnect = (key: string) => {
    // Mock OAuth flow
    toast({ title: "正在连接...", description: "正在打开授权窗口" });
    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((a) =>
          a.key === key
            ? { ...a, connected: true, username: `user_${key}@demo.com`, lastSync: "刚刚", expired: false }
            : a
        )
      );
      toast({ title: "连接成功", description: `${key} 账号已成功连接` });
    }, 1500);
  };

  const handleDisconnect = (key: string) => {
    setAccounts((prev) =>
      prev.map((a) =>
        a.key === key
          ? { ...a, connected: false, username: undefined, lastSync: undefined, expired: false }
          : a
      )
    );
    toast({ title: "已断开连接", description: `${key} 账号已断开` });
  };

  const handleReauth = (key: string) => {
    toast({ title: "正在重新授权...", description: "正在刷新令牌" });
    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((a) => (a.key === key ? { ...a, lastSync: "刚刚", expired: false } : a))
      );
      toast({ title: "授权已更新" });
    }, 1200);
  };

  return (
    <div className="space-y-3">
      {accounts.map((account) => {
        const Icon = account.icon;
        return (
          <div key={account.key} className="glass-panel metric-card rounded-xl p-4">
            <div className="flex items-center gap-4">
              {/* Platform icon */}
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", account.bgColor)}>
                <Icon className={cn("w-6 h-6", account.color)} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold">{account.platform}</span>
                  {account.connected && !account.expired && (
                    <span className="text-[10px] bg-brand-green/15 text-brand-green px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-medium">
                      <Check className="w-3 h-3" /> 已连接
                    </span>
                  )}
                  {account.expired && (
                    <span className="text-[10px] bg-brand-orange/15 text-brand-orange px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-medium">
                      <AlertTriangle className="w-3 h-3" /> 授权过期
                    </span>
                  )}
                  {!account.connected && (
                    <span className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-full font-medium">
                      未连接
                    </span>
                  )}
                </div>
                {account.connected && (
                  <div className="text-[11px] text-muted-foreground space-x-3">
                    {account.username && <span>用户名: {account.username}</span>}
                    {account.lastSync && <span>最后同步: {account.lastSync}</span>}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                {account.connected ? (
                  <>
                    <button
                      onClick={() => handleReauth(account.key)}
                      className="text-[11px] text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 flex items-center gap-1 hover:bg-secondary transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" /> 重新授权
                    </button>
                    <button
                      onClick={() => handleDisconnect(account.key)}
                      className="text-[11px] text-destructive hover:text-destructive/80 border border-destructive/20 rounded-lg px-3 py-1.5 flex items-center gap-1 hover:bg-destructive/5 transition-colors"
                    >
                      <Unlink className="w-3 h-3" /> 断开连接
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(account.key)}
                    className="text-[11px] font-medium bg-primary text-primary-foreground rounded-lg px-4 py-1.5 flex items-center gap-1 hover:opacity-90 transition-opacity"
                  >
                    <Link2 className="w-3 h-3" /> 立即连接
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
