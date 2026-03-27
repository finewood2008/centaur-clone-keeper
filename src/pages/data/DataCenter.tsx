/**
 * DataCenter - 数据中心首页
 * 数据本地化 + 数据安全 + 数据主权
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Lock, Shield, HardDrive, Users, Mail, FileText, ShoppingCart,
  Download, Search, Settings, FolderOpen, ExternalLink, Clock,
  CheckCircle2, Database, RefreshCw, Archive, BarChart3,
  ChevronRight, Zap, Eye, Server,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const securityFeatures = [
  { icon: HardDrive, label: "本地存储", desc: "数据存储在您的电脑" },
  { icon: Lock, label: "端到端加密", desc: "AES-256加密保护" },
  { icon: Shield, label: "零云端泄露", desc: "不经过第三方服务器" },
  { icon: Eye, label: "完全可控", desc: "随时导出和删除" },
];

const dataModules = [
  { icon: Users, label: "客户管理", href: "/customers", count: "156", size: "45.2 MB", path: "~/OPC/customers/", color: "text-primary" },
  { icon: Mail, label: "邮件数据", href: "/email", count: "2,340", size: "128.5 MB", path: "~/OPC/emails/", color: "text-brand-orange" },
  { icon: FileText, label: "文档资料", href: "#", count: "892", size: "2.1 GB", path: "~/OPC/documents/", color: "text-brand-cyan" },
  { icon: ShoppingCart, label: "订单数据", href: "#", count: "456", size: "32.8 MB", path: "~/OPC/orders/", color: "text-brand-green" },
  { icon: Archive, label: "备份中心", href: "/data/backup", count: "12", size: "4.8 GB", path: "~/OPC/backups/", color: "text-purple-400" },
  { icon: Download, label: "数据导出", href: "/data/export", count: "28", size: "890 MB", path: "~/OPC/exports/", color: "text-chart-4" },
];

const recentLogs = [
  { time: "今天 14:30", action: "自动备份完成", detail: "客户数据 + 邮件数据，共 173.7MB", status: "success" },
  { time: "今天 09:15", action: "数据导出", detail: "导出客户列表 Excel 文件", status: "success" },
  { time: "昨天 22:00", action: "自动备份完成", detail: "全量备份，共 4.2GB", status: "success" },
  { time: "昨天 15:45", action: "数据同步", detail: "邮件数据同步完成，新增 23 封", status: "success" },
  { time: "3月24日", action: "安全扫描", detail: "未发现异常访问记录", status: "success" },
];

export default function DataCenter() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="font-display font-semibold text-lg">数据中心</h2>
        <p className="text-xs text-muted-foreground">数据本地化 · 完全可控 · 安全保障</p>
      </div>

      {/* Security Banner */}
      <div className="rounded-xl border border-brand-green/30 bg-gradient-to-r from-brand-green/10 via-brand-green/5 to-transparent p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-brand-green/20 flex items-center justify-center shrink-0">
              <Lock className="w-4.5 h-4.5 text-brand-green" />
            </div>
            <div>
              <div className="text-sm font-semibold flex items-center gap-1.5">
                🔒 数据安全保障
                <Badge className="bg-brand-green/20 text-brand-green border-brand-green/30 text-[9px]">评分 98/100</Badge>
              </div>
              <div className="text-[10px] text-muted-foreground">所有数据存储在您的本地电脑，完全由您掌控</div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {securityFeatures.map((f) => (
              <div key={f.label} className="flex items-center gap-1.5 text-[10px]">
                <f.icon className="w-3 h-3 text-brand-green" />
                <span className="text-muted-foreground">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Users, label: "客户数据", count: "156 位客户", size: "45.2 MB", path: "~/OPC/customers/" },
          { icon: Mail, label: "邮件数据", count: "2,340 封邮件", size: "128.5 MB", path: "~/OPC/emails/" },
          { icon: FileText, label: "文档资料", count: "892 个文件", size: "2.1 GB", path: "~/OPC/documents/" },
          { icon: ShoppingCart, label: "订单数据", count: "456 笔订单", size: "32.8 MB", path: "~/OPC/orders/" },
        ].map((d) => (
          <div key={d.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <d.icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground font-mono">{d.size}</span>
            </div>
            <div className="text-lg font-display font-bold">{d.count.split(" ")[0]}</div>
            <div className="text-[10px] text-muted-foreground">{d.count.split(" ").slice(1).join(" ")}</div>
            <button
              className="mt-2 flex items-center gap-1 text-[9px] text-brand-cyan hover:underline font-mono"
              onClick={() => toast(`正在打开 ${d.path}`)}
            >
              <FolderOpen className="w-2.5 h-2.5" /> {d.path}
            </button>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        {[
          { icon: Archive, label: "立即备份", action: () => toast.success("备份已开始，预计3分钟完成...") },
          { icon: Download, label: "导出数据", href: "/data/export" },
          { icon: Search, label: "搜索数据", action: () => toast("全局数据搜索即将上线") },
          { icon: Settings, label: "数据设置", action: () => toast("数据设置即将上线") },
        ].map((a) => (
          a.href ? (
            <Link key={a.label} to={a.href}>
              <Button size="sm" variant="outline" className="text-xs h-8 gap-1">
                <a.icon className="w-3.5 h-3.5" /> {a.label}
              </Button>
            </Link>
          ) : (
            <Button key={a.label} size="sm" variant="outline" className="text-xs h-8 gap-1" onClick={a.action}>
              <a.icon className="w-3.5 h-3.5" /> {a.label}
            </Button>
          )
        ))}
      </div>

      {/* Data Module Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {dataModules.map((m) => (
          <Link key={m.label} to={m.href} className="block">
            <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all group">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                  <m.icon className={cn("w-4 h-4", m.color)} />
                </div>
                <div>
                  <div className="text-xs font-semibold">{m.label}</div>
                  <div className="text-[10px] text-muted-foreground">{m.count} 条记录 · {m.size}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-muted-foreground font-mono">{m.path}</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Security Log */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-primary" /> 数据安全日志
          </h4>
          <button className="text-[10px] text-primary hover:underline">查看完整日志</button>
        </div>
        <div className="space-y-2.5">
          {recentLogs.map((log, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="flex flex-col items-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-green flex-shrink-0" />
                {i < recentLogs.length - 1 && <div className="w-px h-full bg-border mt-0.5" />}
              </div>
              <div className="flex-1 pb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{log.action}</span>
                  <span className="text-[9px] text-muted-foreground">{log.time}</span>
                </div>
                <div className="text-[10px] text-muted-foreground">{log.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}