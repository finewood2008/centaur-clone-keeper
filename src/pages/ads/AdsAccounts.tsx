/**
 * AdsAccounts - 广告账户管理
 */
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, AlertTriangle, Link2Off, RefreshCw } from "lucide-react";

interface AdAccount {
  id: string;
  platform: string;
  description: string;
  connected: boolean;
  username?: string;
  lastSync?: string;
  icon: string;
}

const initialAccounts: AdAccount[] = [
  { id: "meta", platform: "Meta广告", description: "Facebook / Instagram广告投放", connected: true, username: "company@email.com", lastSync: "5分钟前", icon: "📘" },
  { id: "google", platform: "Google广告", description: "连接后可投放Google搜索和展示广告", connected: false, icon: "🔍" },
  { id: "linkedin", platform: "LinkedIn广告", description: "面向B2B专业人士的精准广告投放", connected: false, icon: "💼" },
  { id: "tiktok", platform: "TikTok广告", description: "短视频广告投放，触达年轻消费者", connected: false, icon: "🎵" },
];

export default function AdsAccounts() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [disconnectId, setDisconnectId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = (id: string) => {
    setConnecting(id);
    toast({ title: "🔗 模拟OAuth授权中...", description: "正在连接广告账户" });
    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, connected: true, username: "ads_user@company.com", lastSync: "刚刚" } : a
        )
      );
      setConnecting(null);
      toast({ title: "✅ 连接成功", description: "广告账户已成功连接" });
    }, 2000);
  };

  const handleDisconnect = () => {
    if (!disconnectId) return;
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === disconnectId ? { ...a, connected: false, username: undefined, lastSync: undefined } : a
      )
    );
    setDisconnectId(null);
    toast({ title: "已断开连接", description: "广告账户已断开" });
  };

  const handleReauth = (id: string) => {
    toast({ title: "🔄 重新授权中...", description: "正在刷新授权令牌" });
    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, lastSync: "刚刚" } : a))
      );
      toast({ title: "✅ 授权已刷新" });
    }, 1500);
  };

  return (
    <div className="space-y-3">
      {accounts.map((account) => (
        <Card key={account.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{account.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{account.platform}</span>
                  {account.connected ? (
                    <Badge variant="default" className="text-[10px] bg-brand-green/20 text-brand-green border-brand-green/30">
                      <CheckCircle className="w-3 h-3 mr-1" />已连接
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">未连接</Badge>
                  )}
                </div>
                {account.connected ? (
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    账户: {account.username} · 最后同步: {account.lastSync}
                  </div>
                ) : (
                  <div className="text-[11px] text-muted-foreground mt-0.5">{account.description}</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {account.connected ? (
                <>
                  <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => handleReauth(account.id)}>
                    <RefreshCw className="w-3 h-3 mr-1" />重新授权
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs h-7 text-destructive hover:text-destructive" onClick={() => setDisconnectId(account.id)}>
                    <Link2Off className="w-3 h-3 mr-1" />断开连接
                  </Button>
                </>
              ) : (
                <Button size="sm" className="text-xs h-7" onClick={() => handleConnect(account.id)} disabled={connecting === account.id}>
                  {connecting === account.id ? "连接中..." : "立即连接"}
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}

      <Dialog open={!!disconnectId} onOpenChange={() => setDisconnectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认断开连接</DialogTitle>
            <DialogDescription>断开后将无法投放该平台广告，已有广告将被暂停。确认继续？</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisconnectId(null)}>取消</Button>
            <Button variant="destructive" onClick={handleDisconnect}>确认断开</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
