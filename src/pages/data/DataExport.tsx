/**
 * DataExport - 数据导出中心
 */
import { useState } from "react";
import {
  Download, FileText, Users, Mail, ShoppingCart, CheckCircle2,
  Clock, FolderOpen, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const dataOptions = [
  { key: "customers", icon: Users, label: "客户数据", desc: "客户资料、联系方式、标签等", count: "156 条", size: "45.2 MB" },
  { key: "emails", icon: Mail, label: "邮件数据", desc: "邮件内容、附件、发送记录", count: "2,340 封", size: "128.5 MB" },
  { key: "documents", icon: FileText, label: "文档资料", desc: "产品文档、合同、证书等", count: "892 个", size: "2.1 GB" },
  { key: "orders", icon: ShoppingCart, label: "订单数据", desc: "订单记录、发票、物流信息", count: "456 笔", size: "32.8 MB" },
];

const exportHistory = [
  { id: 1, time: "2026-03-27 09:15", data: "客户数据", format: "Excel", size: "12.3 MB", path: "~/OPC/exports/customers-20260327.xlsx" },
  { id: 2, time: "2026-03-25 16:30", data: "邮件数据", format: "CSV", size: "45.8 MB", path: "~/OPC/exports/emails-20260325.csv" },
  { id: 3, time: "2026-03-23 11:00", data: "全部数据", format: "JSON", size: "2.3 GB", path: "~/OPC/exports/full-20260323.json" },
  { id: 4, time: "2026-03-20 14:20", data: "订单数据", format: "Excel", size: "8.9 MB", path: "~/OPC/exports/orders-20260320.xlsx" },
];

export default function DataExport() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [format, setFormat] = useState("excel");
  const [isExporting, setIsExporting] = useState(false);

  const toggleData = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleExport = () => {
    if (selected.size === 0) { toast.error("请至少选择一项数据"); return; }
    setIsExporting(true);
    const labels = dataOptions.filter((d) => selected.has(d.key)).map((d) => d.label).join("、");
    setTimeout(() => {
      setIsExporting(false);
      toast.success(`${labels} 已导出`, { description: `保存到 ~/OPC/exports/` });
      setSelected(new Set());
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display font-semibold text-lg">数据导出中心</h2>
        <p className="text-xs text-muted-foreground">自由导出 · 多格式支持 · 数据完全属于您</p>
      </div>

      {/* Data Ownership Banner */}
      <div className="rounded-xl glass-panel border-primary/20 bg-primary/5 px-4 py-3 flex items-center gap-3 glow-orange">
        <Shield className="w-5 h-5 text-primary flex-shrink-0" />
        <div className="text-xs text-muted-foreground">
          <strong className="text-foreground">导出的数据完全属于您</strong> — 您可以随时导出所有业务数据，不受任何限制。
        </div>
      </div>

      {/* Data Selection */}
      <div className="glass-panel rounded-xl p-4">
        <h4 className="text-xs font-semibold mb-3">选择导出数据</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {dataOptions.map((d) => (
            <button
              key={d.key}
              onClick={() => toggleData(d.key)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                selected.has(d.key) ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              )}
            >
              <Checkbox checked={selected.has(d.key)} className="data-[state=checked]:bg-primary" />
              <d.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium">{d.label}</div>
                <div className="text-[10px] text-muted-foreground">{d.desc}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-[10px] font-metric font-medium">{d.count}</div>
                <div className="text-[9px] text-muted-foreground">{d.size}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Format Selection */}
      <div className="glass-panel rounded-xl p-4">
        <h4 className="text-xs font-semibold mb-3">选择导出格式</h4>
        <div className="flex gap-2">
          {[
            { key: "excel", label: "Excel (.xlsx)", desc: "适合查看和编辑" },
            { key: "csv", label: "CSV (.csv)", desc: "通用格式，兼容性好" },
            { key: "json", label: "JSON (.json)", desc: "适合开发和数据迁移" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFormat(f.key)}
              className={cn(
                "flex-1 p-3 rounded-lg border transition-all text-center",
                format === f.key ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              )}
            >
              <div className="text-xs font-medium">{f.label}</div>
              <div className="text-[10px] text-muted-foreground">{f.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Export Button */}
      <div className="flex items-center gap-2">
        <Button className="text-xs gap-1" onClick={handleExport} disabled={isExporting || selected.size === 0}>
          <Download className="w-3.5 h-3.5" />
          {isExporting ? "导出中..." : `导出 ${selected.size} 项数据`}
        </Button>
        <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => toast("正在打开导出文件夹...")}>
          <FolderOpen className="w-3.5 h-3.5" /> 查看导出文件
        </Button>
      </div>

      {/* Export History */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h4 className="text-xs font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-primary" /> 导出历史
          </h4>
        </div>
        <div className="hidden md:block">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-4 py-2 font-medium">时间</th>
                <th className="text-left px-4 py-2 font-medium">数据</th>
                <th className="text-left px-4 py-2 font-medium">格式</th>
                <th className="text-left px-4 py-2 font-medium">大小</th>
                <th className="text-left px-4 py-2 font-medium">路径</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {exportHistory.map((h) => (
                <tr key={h.id} className="hover:bg-accent/20">
                  <td className="px-4 py-2.5 font-mono text-muted-foreground">{h.time}</td>
                  <td className="px-4 py-2.5">{h.data}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant="secondary" className="text-[9px]">{h.format}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{h.size}</td>
                  <td className="px-4 py-2.5">
                    <button className="text-[10px] font-mono text-brand-cyan hover:underline" onClick={() => toast(`正在打开 ${h.path}`)}>
                      {h.path}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="md:hidden divide-y divide-border">
          {exportHistory.map((h) => (
            <div key={h.id} className="p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{h.data}</span>
                <Badge variant="secondary" className="text-[9px]">{h.format}</Badge>
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="font-mono">{h.time}</span>
                <span>{h.size}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
