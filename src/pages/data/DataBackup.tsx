/**
 * DataBackup - 数据备份中心
 */
import { useState } from "react";
import {
  Archive, HardDrive, Clock, CheckCircle2, Download,
  RefreshCw, FolderOpen, Settings, Database, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const dataStatus = [
  { label: "客户数据", count: "156 条", size: "45.2 MB", updated: "2分钟前" },
  { label: "邮件数据", count: "2,340 封", size: "128.5 MB", updated: "15分钟前" },
  { label: "文档资料", count: "892 个", size: "2.1 GB", updated: "1小时前" },
  { label: "订单数据", count: "456 笔", size: "32.8 MB", updated: "30分钟前" },
];

const backupHistory = [
  { id: 1, time: "2026-03-26 22:00", type: "自动全量备份", size: "4.2 GB", status: "success", path: "~/OPC/backups/full-20260326.zip" },
  { id: 2, time: "2026-03-26 14:30", type: "自动增量备份", size: "173.7 MB", status: "success", path: "~/OPC/backups/incr-20260326-1430.zip" },
  { id: 3, time: "2026-03-25 22:00", type: "自动全量备份", size: "4.1 GB", status: "success", path: "~/OPC/backups/full-20260325.zip" },
  { id: 4, time: "2026-03-24 22:00", type: "自动全量备份", size: "4.0 GB", status: "success", path: "~/OPC/backups/full-20260324.zip" },
  { id: 5, time: "2026-03-23 22:00", type: "自动全量备份", size: "3.9 GB", status: "success", path: "~/OPC/backups/full-20260323.zip" },
  { id: 6, time: "2026-03-22 16:00", type: "手动备份", size: "4.0 GB", status: "success", path: "~/OPC/backups/manual-20260322.zip" },
];

export default function DataBackup() {
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFreq, setBackupFreq] = useState("daily");
  const [isBackingUp, setIsBackingUp] = useState(false);

  const startBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      toast.success("备份已完成！", { description: "保存到 ~/OPC/backups/manual-20260327.zip (4.3 GB)" });
    }, 3000);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display font-semibold text-lg">数据备份中心</h2>
        <p className="text-xs text-muted-foreground">自动备份 · 增量同步 · 一键恢复</p>
      </div>

      {/* Backup Status Banner */}
      <div className="rounded-xl border border-brand-green/30 bg-brand-green/5 px-4 py-3 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-brand-green flex-shrink-0" />
        <div className="flex-1">
          <div className="text-xs font-medium">数据已备份且安全</div>
          <div className="text-[10px] text-muted-foreground">最近备份: 今天 22:00 · 全量备份 4.2 GB · ~/OPC/backups/</div>
        </div>
        <Badge className="bg-brand-green/20 text-brand-green border-brand-green/30 text-[9px]">12 份备份</Badge>
      </div>

      {/* Current Data Status */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h4 className="text-xs font-semibold mb-3 flex items-center gap-1">
          <Database className="w-3.5 h-3.5 text-primary" /> 当前数据状态
        </h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {dataStatus.map((d) => (
            <div key={d.label} className="bg-secondary/30 rounded-lg p-3">
              <div className="text-[10px] text-muted-foreground">{d.label}</div>
              <div className="text-sm font-bold mt-0.5">{d.count}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[9px] text-muted-foreground">{d.size}</span>
                <span className="text-[9px] text-brand-green flex items-center gap-0.5">
                  <RefreshCw className="w-2 h-2" /> {d.updated}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auto Backup Settings */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h4 className="text-xs font-semibold mb-3 flex items-center gap-1">
          <Settings className="w-3.5 h-3.5 text-primary" /> 自动备份设置
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium">自动备份</div>
              <div className="text-[10px] text-muted-foreground">定期自动备份所有数据到本地</div>
            </div>
            <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
          </div>
          {autoBackup && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-secondary/20 rounded-lg">
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">备份频率</label>
                <Select value={backupFreq} onValueChange={setBackupFreq}>
                  <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly" className="text-xs">每小时</SelectItem>
                    <SelectItem value="daily" className="text-xs">每天</SelectItem>
                    <SelectItem value="weekly" className="text-xs">每周</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">备份路径</label>
                <div className="h-7 bg-secondary rounded-md px-2 flex items-center text-[10px] font-mono text-muted-foreground">
                  ~/OPC/backups/
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" className="text-xs gap-1" onClick={startBackup} disabled={isBackingUp}>
          {isBackingUp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
          {isBackingUp ? "备份中..." : "立即备份"}
        </Button>
        <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => toast("正在打开备份文件夹...")}>
          <FolderOpen className="w-3.5 h-3.5" /> 查看备份文件
        </Button>
        <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => toast("恢复向导即将上线")}>
          <RefreshCw className="w-3.5 h-3.5" /> 恢复数据
        </Button>
      </div>

      {isBackingUp && (
        <div className="bg-card border border-primary/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin" />
            <span className="text-xs font-medium">正在备份...</span>
          </div>
          <Progress value={65} className="h-1.5" />
          <div className="text-[10px] text-muted-foreground mt-1">正在压缩邮件数据... (2.8 GB / 4.3 GB)</div>
        </div>
      )}

      {/* Backup History */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h4 className="text-xs font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-primary" /> 备份历史
          </h4>
        </div>
        {/* Desktop table */}
        <div className="hidden md:block">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-4 py-2 font-medium">时间</th>
                <th className="text-left px-4 py-2 font-medium">类型</th>
                <th className="text-left px-4 py-2 font-medium">大小</th>
                <th className="text-left px-4 py-2 font-medium">状态</th>
                <th className="text-left px-4 py-2 font-medium">路径</th>
                <th className="text-left px-4 py-2 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {backupHistory.map((b) => (
                <tr key={b.id} className="hover:bg-secondary/20">
                  <td className="px-4 py-2.5 font-mono text-muted-foreground">{b.time}</td>
                  <td className="px-4 py-2.5">{b.type}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{b.size}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-brand-green flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> 成功</span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[10px] text-muted-foreground">{b.path}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-6 text-[10px] px-1.5" onClick={() => toast(`正在从 ${b.path} 恢复...`)}>恢复</Button>
                      <Button size="sm" variant="ghost" className="h-6 text-[10px] px-1.5" onClick={() => toast(`正在打开 ${b.path}`)}>查看</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile card list */}
        <div className="md:hidden divide-y divide-border">
          {backupHistory.map((b) => (
            <div key={b.id} className="p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{b.type}</span>
                <span className="text-brand-green text-[10px] flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> 成功</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="font-mono">{b.time}</span>
                <span>{b.size}</span>
              </div>
              <div className="flex gap-1.5">
                <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => toast(`正在从 ${b.path} 恢复...`)}>恢复</Button>
                <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => toast(`正在打开 ${b.path}`)}>查看</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}