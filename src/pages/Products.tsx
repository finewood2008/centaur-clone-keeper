/**
 * Products - 产品库管理
 */
import { useState } from "react";
import {
  Package, Search, Plus, Sparkles, Globe, DollarSign,
  BarChart3, Eye, Edit3, MoreHorizontal, Tag, Layers, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Product {
  id: number; name: string; category: string; sku: string;
  price: string; moq: string; stock: string; image: string;
  languages: number; aiOptimized: boolean; views: number; inquiries: number;
}

const products: Product[] = [
  { id: 1, name: "LED Bulb A60 9W", category: "LED照明", sku: "LED-A60-9W", price: "$1.85", moq: "1,000 pcs", stock: "50,000", image: "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=100&h=100&fit=crop", languages: 5, aiOptimized: true, views: 2340, inquiries: 45 },
  { id: 2, name: "Solar Panel 400W Mono", category: "太阳能", sku: "SP-400W-M", price: "$85.00", moq: "50 units", stock: "2,000", image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=100&h=100&fit=crop", languages: 4, aiOptimized: true, views: 1890, inquiries: 32 },
  { id: 3, name: "Steel Pipe DN100", category: "钢材", sku: "STP-DN100", price: "$12.50/m", moq: "10 tons", stock: "500 tons", image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=100&h=100&fit=crop", languages: 3, aiOptimized: false, views: 980, inquiries: 18 },
  { id: 4, name: "Phone Case TPU Clear", category: "手机配件", sku: "PC-TPU-CLR", price: "$0.35", moq: "5,000 pcs", stock: "200,000", image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=100&h=100&fit=crop", languages: 6, aiOptimized: true, views: 3200, inquiries: 67 },
  { id: 5, name: "Ceramic Tea Set 6pcs", category: "家居用品", sku: "CTS-6PCS", price: "$8.50/set", moq: "200 sets", stock: "5,000", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=100&h=100&fit=crop", languages: 4, aiOptimized: true, views: 1560, inquiries: 28 },
  { id: 6, name: "LED Panel Light 600x600", category: "LED照明", sku: "LED-PL-600", price: "$12.00", moq: "200 pcs", stock: "10,000", image: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=100&h=100&fit=crop", languages: 5, aiOptimized: true, views: 1780, inquiries: 35 },
];

export default function Products() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-lg">产品库</h2>
          <p className="text-xs text-muted-foreground">Product Agent · 产品目录管理与AI内容优化</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => toast("AI产品描述生成功能即将上线")}
            className="flex items-center gap-1.5 text-xs font-medium bg-secondary text-foreground px-3 py-1.5 rounded-md hover:bg-secondary/80 transition-colors">
            <Sparkles className="w-3 h-3" /> AI优化描述
          </button>
          <button onClick={() => toast("添加产品功能即将上线")}
            className="flex items-center gap-1.5 text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> 添加产品
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "产品总数", value: "48", sub: "6个品类" },
          { label: "AI优化率", value: "83%", sub: "40/48 已优化" },
          { label: "总浏览量", value: "11.7K", sub: "↑ 28% 本月" },
          { label: "询盘转化", value: "225", sub: "转化率 1.9%" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
            <div className="text-xl font-display font-bold">{s.value}</div>
            <div className="text-[10px] text-muted-foreground mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input type="text" placeholder="搜索产品..." className="w-full max-w-sm h-8 bg-secondary rounded-md pl-8 pr-3 text-xs outline-none placeholder:text-muted-foreground" />
        </div>
        <button onClick={() => setViewMode("grid")}
          className={cn("w-8 h-8 rounded flex items-center justify-center transition-colors", viewMode === "grid" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground")}>
          <Layers className="w-4 h-4" />
        </button>
        <button onClick={() => setViewMode("table")}
          className={cn("w-8 h-8 rounded flex items-center justify-center transition-colors", viewMode === "table" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground")}>
          <BarChart3 className="w-4 h-4" />
        </button>
      </div>

      {/* Product grid or table */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors group">
              <div className="relative h-32 bg-secondary">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                {p.aiOptimized && (
                  <span className="absolute top-2 right-2 text-[9px] bg-primary/90 text-primary-foreground px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> AI优化
                  </span>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-muted-foreground">{p.category}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{p.sku}</span>
                </div>
                <h4 className="text-sm font-medium mb-2">{p.name}</h4>
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="font-semibold text-primary">{p.price}</span>
                  <span className="text-muted-foreground">MOQ: {p.moq}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {p.languages}种语言</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {p.views}</span>
                  <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {p.inquiries}询盘</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left px-4 py-2 font-medium">产品</th>
                  <th className="text-left px-4 py-2 font-medium">SKU</th>
                  <th className="text-left px-4 py-2 font-medium">品类</th>
                  <th className="text-left px-4 py-2 font-medium">价格</th>
                  <th className="text-left px-4 py-2 font-medium">MOQ</th>
                  <th className="text-left px-4 py-2 font-medium">语言</th>
                  <th className="text-left px-4 py-2 font-medium">浏览</th>
                  <th className="text-left px-4 py-2 font-medium">询盘</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover" />
                        <div>
                          <span className="font-medium">{p.name}</span>
                          {p.aiOptimized && <CheckCircle2 className="w-3 h-3 text-primary inline ml-1" />}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{p.sku}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                    <td className="px-4 py-3 font-medium">{p.price}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.moq}</td>
                    <td className="px-4 py-3">{p.languages}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.views.toLocaleString()}</td>
                    <td className="px-4 py-3">{p.inquiries}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
