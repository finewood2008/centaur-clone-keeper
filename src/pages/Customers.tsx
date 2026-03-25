/**
 * Customers - 客户管理
 */
import { useState } from "react";
import {
  Users, Search, Filter, Star, Globe, Mail, Phone,
  Building2, ArrowUpRight, MoreHorizontal, TrendingUp,
  DollarSign, Clock, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Customer {
  id: number; name: string; company: string; country: string;
  email: string; phone: string; tier: "A" | "B" | "C";
  aiScore: number; totalOrders: number; totalValue: string;
  lastContact: string; channels: string[]; status: "active" | "nurturing" | "cold";
}

const customers: Customer[] = [
  { id: 1, name: "John Smith", company: "TechCorp Ltd.", country: "美国", email: "john@techcorp.com", phone: "+1 555-0123", tier: "A", aiScore: 92, totalOrders: 8, totalValue: "$125,000", lastContact: "今天", channels: ["WhatsApp", "Email"], status: "active" },
  { id: 2, name: "Maria Garcia", company: "EuroTrade GmbH", country: "德国", email: "maria@eurotrade.de", phone: "+49 30-12345", tier: "A", aiScore: 85, totalOrders: 5, totalValue: "$89,000", lastContact: "昨天", channels: ["LinkedIn", "Email"], status: "active" },
  { id: 3, name: "Ahmed Hassan", company: "MidEast Import Co.", country: "阿联酋", email: "ahmed@mideast.ae", phone: "+971 50-1234", tier: "B", aiScore: 68, totalOrders: 3, totalValue: "$45,000", lastContact: "3天前", channels: ["WhatsApp"], status: "nurturing" },
  { id: 4, name: "Yuki Tanaka", company: "Japan Direct Co.", country: "日本", email: "yuki@japandirect.jp", phone: "+81 3-1234", tier: "B", aiScore: 55, totalOrders: 2, totalValue: "$28,000", lastContact: "1周前", channels: ["Email", "阿里巴巴"], status: "nurturing" },
  { id: 5, name: "Roberto Silva", company: "Brazil Imports", country: "巴西", email: "roberto@brazilimports.br", phone: "+55 11-1234", tier: "C", aiScore: 38, totalOrders: 1, totalValue: "$8,500", lastContact: "2周前", channels: ["WhatsApp"], status: "cold" },
  { id: 6, name: "Sarah Johnson", company: "Pacific Trading Inc.", country: "澳大利亚", email: "sarah@pacific.au", phone: "+61 2-1234", tier: "B", aiScore: 62, totalOrders: 2, totalValue: "$32,000", lastContact: "5天前", channels: ["独立站", "Email"], status: "active" },
];

const tierColors: Record<string, string> = {
  A: "bg-primary/15 text-primary border-primary/30",
  B: "bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30",
  C: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: "活跃", color: "text-brand-green" },
  nurturing: { label: "培育中", color: "text-brand-orange" },
  cold: { label: "沉默", color: "text-muted-foreground" },
};

export default function Customers() {
  const [selectedTier, setSelectedTier] = useState("all");
  const filtered = selectedTier === "all" ? customers : customers.filter((c) => c.tier === selectedTier);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-semibold text-lg">客户管理</h2>
        <p className="text-xs text-muted-foreground">Customer Agent · 360度客户画像与智能分级</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "总客户数", value: "156", sub: "↑ 12 本周新增" },
          { label: "A级客户", value: "23", sub: "高价值客户" },
          { label: "客户总价值", value: "$1.2M", sub: "↑ 15% vs 上月" },
          { label: "平均AI评分", value: "67", sub: "/ 100" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
            <div className="text-xl font-display font-bold">{s.value}</div>
            <div className="text-[10px] text-muted-foreground mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Customer table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          {["all", "A", "B", "C"].map((t) => (
            <button key={t} onClick={() => setSelectedTier(t)}
              className={cn("text-xs px-2 py-1 rounded transition-colors",
                selectedTier === t ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >{t === "all" ? "全部" : `${t}级`}</button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-4 py-2 font-medium">客户</th>
                <th className="text-left px-4 py-2 font-medium">国家</th>
                <th className="text-left px-4 py-2 font-medium">等级</th>
                <th className="text-left px-4 py-2 font-medium">AI评分</th>
                <th className="text-left px-4 py-2 font-medium">累计订单</th>
                <th className="text-left px-4 py-2 font-medium">总价值</th>
                <th className="text-left px-4 py-2 font-medium">状态</th>
                <th className="text-left px-4 py-2 font-medium">最后联系</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => {
                const status = statusLabels[c.status];
                return (
                  <tr key={c.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-semibold shrink-0">
                          {c.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <div className="font-medium">{c.name}</div>
                          <div className="text-[10px] text-muted-foreground">{c.company}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.country}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-bold", tierColors[c.tier])}>{c.tier}</span>
                    </td>
                    <td className={cn("px-4 py-3 font-medium font-mono",
                      c.aiScore >= 80 ? "text-primary" : c.aiScore >= 50 ? "text-brand-cyan" : "text-muted-foreground"
                    )}>{c.aiScore}</td>
                    <td className="px-4 py-3">{c.totalOrders}</td>
                    <td className="px-4 py-3 font-medium">{c.totalValue}</td>
                    <td className={cn("px-4 py-3", status.color)}>{status.label}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.lastContact}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
