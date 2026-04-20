/**
 * Products - 产品库（OPC核心选品模块）
 * 工厂直连 + AI机器人赋能选品
 * 数据源：Supabase products + product_specs/images/docs
 */
import { useState, useMemo } from "react";
import {
  Package, Search, Plus, Globe,
  BarChart3, Eye, Layers, CheckCircle2, Tag,
  MessageSquare, Bot, Factory, Star, Filter,
  Share2, Trash2, ExternalLink, Copy, Users, Loader2, Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import ProductDetail from "@/components/products/ProductDetail";
import ProductFormDialog from "@/components/products/ProductFormDialog";
import ApiKeyBanner from "@/components/ApiKeyBanner";
import { useProducts } from "@/hooks/use-products";
import type { Product } from "@/hooks/use-products";

const categories = ["全部", "LED照明", "太阳能", "钢管", "钢材", "手机配件", "家居用品", "家居装饰"];

function formatPrice(p: number | null | undefined, currency: string | null | undefined = "USD"): string {
  if (p == null) return "—";
  const sym = currency === "USD" ? "$" : currency ? `${currency} ` : "$";
  return `${sym}${Number(p).toFixed(2)}`;
}

export default function Products() {
  const { data: products = [], isLoading } = useProducts();

  const [activeTab, setActiveTab] = useState<"library" | "my">("library");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [botOnly, setBotOnly] = useState(false);
  const [myProductIds, setMyProductIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareNote, setShareNote] = useState("");
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const openCreate = () => { setEditingProductId(null); setProductFormOpen(true); };
  const openEdit = (id: string) => { setEditingProductId(id); setProductFormOpen(true); };

  // 默认把前 3 个产品作为"我的产品"示例
  const myProducts = useMemo(
    () => products.filter((p) => myProductIds.has(p.id) || (myProductIds.size === 0 && products.indexOf(p) < 3)),
    [products, myProductIds]
  );

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const catMatch = selectedCategory === "全部" || p.category === selectedCategory;
        const searchMatch =
          !searchQuery ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.sku ?? "").toLowerCase().includes(searchQuery.toLowerCase());
        const botMatch = !botOnly || !!p.has_bot;
        return catMatch && searchMatch && botMatch;
      }),
    [products, selectedCategory, searchQuery, botOnly]
  );

  // 真实统计
  const stats = useMemo(() => {
    const total = products.length;
    const withBot = products.filter((p) => p.has_bot).length;
    const totalViews = products.reduce((s, p) => s + (p.views ?? 0), 0);
    const totalInquiries = products.reduce((s, p) => s + (p.inquiries_count ?? 0), 0);
    const conversion = totalViews > 0 ? ((totalInquiries / totalViews) * 100).toFixed(1) : "0.0";
    const categoriesCount = new Set(products.map((p) => p.category).filter(Boolean)).size;
    return {
      total,
      withBot,
      botRate: total > 0 ? Math.round((withBot / total) * 100) : 0,
      totalViews,
      totalInquiries,
      conversion,
      categoriesCount,
    };
  }, [products]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === myProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(myProducts.map((p) => p.id)));
    }
  };

  const removeSelected = () => {
    setMyProductIds((prev) => {
      const next = new Set(prev);
      selectedIds.forEach((id) => next.delete(id));
      // 如果当前展示的是默认 3 条但用户从未交互过，先把剩余的明确加进去再删
      if (prev.size === 0) {
        myProducts.forEach((p) => {
          if (!selectedIds.has(p.id)) next.add(p.id);
        });
      }
      return next;
    });
    toast.success(`已移除 ${selectedIds.size} 个产品`);
    setSelectedIds(new Set());
  };

  const addToMy = (id: string) => {
    setMyProductIds((prev) => {
      const next = new Set(prev);
      // 首次添加时，先把默认显示的前 3 个固化进来
      if (prev.size === 0) {
        products.slice(0, 3).forEach((p) => next.add(p.id));
      }
      next.add(id);
      return next;
    });
  };

  const removeFromMy = (id: string) => {
    setMyProductIds((prev) => {
      const next = new Set(prev);
      if (prev.size === 0) {
        products.slice(0, 3).forEach((p) => next.add(p.id));
      }
      next.delete(id);
      return next;
    });
  };

  const handleShare = () => {
    const shareProducts = myProducts.filter((p) => selectedIds.has(p.id));
    const shareText = shareProducts.map((p) => `${p.name} (${p.sku ?? ""}) - ${formatPrice(p.price, p.currency)}`).join("\n");
    navigator.clipboard.writeText(
      `📦 产品推荐清单\n${shareNote ? `备注: ${shareNote}\n` : ""}\n${shareText}\n\n查看详情: https://opc.com/share/${Date.now().toString(36)}`
    );
    toast.success(`已生成 ${shareProducts.length} 个产品的分享链接并复制到剪贴板`, {
      description: "可直接粘贴发送给客户",
    });
    setShowShareDialog(false);
    setShareNote("");
    setSelectedIds(new Set());
  };

  // Product detail view
  if (selectedProduct) {
    return (
      <ProductDetail
        productId={selectedProduct.id}
        fallbackProduct={selectedProduct}
        allProducts={products}
        onBack={() => setSelectedProduct(null)}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <ApiKeyBanner description="后，产品 AI 机器人将自动激活，可生成多语言描述与智能问答" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="font-display font-semibold text-lg">产品库</h2>
          <p className="text-xs text-muted-foreground">工厂直连 · AI机器人赋能选品</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="text-xs" onClick={openCreate}>
            <Plus className="w-3.5 h-3.5 mr-1" /> 添加产品
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-border">
        <button
          onClick={() => setActiveTab("library")}
          className={cn(
            "px-4 py-2 text-xs font-medium border-b-2 transition-colors -mb-px",
            activeTab === "library"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Globe className="w-3.5 h-3.5 inline mr-1.5" />
          产品库
          <Badge variant="secondary" className="ml-1.5 text-[9px] h-4 px-1.5">{products.length}</Badge>
        </button>
        <button
          onClick={() => setActiveTab("my")}
          className={cn(
            "px-4 py-2 text-xs font-medium border-b-2 transition-colors -mb-px",
            activeTab === "my"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Package className="w-3.5 h-3.5 inline mr-1.5" />
          我的产品
          <Badge variant="secondary" className="ml-1.5 text-[9px] h-4 px-1.5">{myProducts.length}</Badge>
        </button>
      </div>

      {activeTab === "library" ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "产品总数", value: String(stats.total), sub: `${stats.categoriesCount} 个品类`, icon: Package },
              { label: "AI助手覆盖", value: `${stats.botRate}%`, sub: `${stats.withBot}/${stats.total} 产品`, icon: Bot },
              { label: "总浏览量", value: stats.totalViews.toLocaleString(), sub: "累计访问", icon: Eye },
              { label: "询盘转化", value: String(stats.totalInquiries), sub: `转化率 ${stats.conversion}%`, icon: Tag },
            ].map((s) => (
              <div key={s.label} className="glass-panel metric-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <s.icon className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div className="text-xl font-metric font-bold">{s.value}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text" placeholder="搜索产品名称、SKU..."
                className="w-full h-8 search-glass rounded-md pl-8 pr-3 text-xs outline-none placeholder:text-muted-foreground"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1 overflow-x-auto">
              {categories.map((c) => (
                <button key={c} onClick={() => setSelectedCategory(c)}
                  className={cn("text-xs px-2.5 py-1 rounded-md transition-colors",
                    selectedCategory === c ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >{c}</button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <Bot className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">仅AI助手</span>
              <Switch checked={botOnly} onCheckedChange={setBotOnly} className="scale-75" />
            </div>
            <div className="flex gap-1">
              <button onClick={() => setViewMode("grid")} className={cn("w-7 h-7 rounded flex items-center justify-center", viewMode === "grid" ? "bg-secondary text-foreground" : "text-muted-foreground")}>
                <Layers className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setViewMode("table")} className={cn("w-7 h-7 rounded flex items-center justify-center", viewMode === "table" ? "bg-secondary text-foreground" : "text-muted-foreground")}>
                <BarChart3 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Loading / Empty */}
          {isLoading ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto mb-2" />
              <div className="text-xs text-muted-foreground">加载产品库…</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <Package className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <div className="text-xs text-muted-foreground">
                {products.length === 0 ? "暂无产品，点击「添加产品」开始" : "没有匹配的产品"}
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((p) => {
                const isAdded = myProducts.some((mp) => mp.id === p.id);
                return (
                  <div
                    key={p.id}
                    className="glass-panel metric-card rounded-xl overflow-hidden hover:border-primary/30 transition-all cursor-pointer group"
                    onClick={() => setSelectedProduct(p)}
                  >
                    <div className="relative h-36 bg-secondary">
                      {p.image_url && (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      )}
                      {p.has_bot && (
                        <span className="absolute top-2 right-2 text-[9px] bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <MessageSquare className="w-2.5 h-2.5" /> 产品助手
                        </span>
                      )}
                      {isAdded && (
                        <span className="absolute top-2 left-2 text-[9px] bg-brand-green/90 text-white px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> 已选品
                        </span>
                      )}
                      <div className="absolute bottom-2 left-2 flex gap-1">
                        {(p.factory_certs ?? []).slice(0, 3).map((c) => (
                          <span key={c} className="text-[8px] bg-card/80 backdrop-blur-sm px-1.5 py-0.5 rounded font-medium">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-muted-foreground">{p.category ?? ""}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{p.sku ?? ""}</span>
                      </div>
                      <h4 className="text-sm font-medium mb-1.5">{p.name}</h4>
                      <div className="flex items-center justify-between text-[11px] mb-2">
                        <span className="font-bold text-primary text-sm">{formatPrice(p.price, p.currency)}</span>
                        <span className="text-muted-foreground">MOQ: {p.moq ?? "—"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2">
                        <Factory className="w-3 h-3" />
                        <span>{p.factory_name ?? "—"}</span>
                        <span className="flex items-center gap-0.5 ml-auto">
                          <Star className="w-2.5 h-2.5 text-primary fill-primary" /> {(p.factory_rating ?? 0).toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground border-t border-border pt-2">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {(p.views ?? 0).toLocaleString()}</span>
                        <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {p.inquiries_count ?? 0} 询盘</span>
                        {!isAdded ? (
                          <button
                            className="flex items-center gap-1 text-primary ml-auto font-medium hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToMy(p.id);
                              toast.success(`${p.name} 已加入我的产品`);
                            }}
                          >
                            <Plus className="w-3 h-3" /> 选品
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 text-brand-green ml-auto font-medium">
                            <CheckCircle2 className="w-3 h-3" /> 已选
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left px-4 py-2 font-medium">产品</th>
                      <th className="text-left px-4 py-2 font-medium">工厂</th>
                      <th className="text-left px-4 py-2 font-medium">价格</th>
                      <th className="text-left px-4 py-2 font-medium">MOQ</th>
                      <th className="text-left px-4 py-2 font-medium">AI助手</th>
                      <th className="text-left px-4 py-2 font-medium">浏览</th>
                      <th className="text-left px-4 py-2 font-medium">询盘</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((p) => (
                      <tr key={p.id} className="hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => setSelectedProduct(p)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {p.image_url && <img src={p.image_url} alt={p.name} className="w-8 h-8 rounded object-cover" />}
                            <div>
                              <div className="font-medium">{p.name}</div>
                              <div className="text-[10px] text-muted-foreground">{p.category ?? ""} · {p.sku ?? ""}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{p.factory_name ?? "—"}</td>
                        <td className="px-4 py-3 font-medium text-primary">{formatPrice(p.price, p.currency)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{p.moq ?? "—"}</td>
                        <td className="px-4 py-3">
                          {p.has_bot ? (
                            <span className="text-[10px] text-brand-green flex items-center gap-0.5"><Bot className="w-3 h-3" /> 在线</span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">未配置</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{(p.views ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-3">{p.inquiries_count ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        /* ===== MY PRODUCTS TAB ===== */
        <div className="space-y-4">
          {/* My Products Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "已选产品", value: String(myProducts.length), sub: `${new Set(myProducts.map(p => p.category).filter(Boolean)).size} 个品类`, icon: Package },
              { label: "累计分享", value: "36", sub: "↑ 12 本月", icon: Share2 },
              { label: "客户覆盖", value: "18", sub: "活跃客户", icon: Users },
              { label: "AI助手", value: `${myProducts.filter(p => p.has_bot).length}/${myProducts.length}`, sub: "已配置比例", icon: Bot },
            ].map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <s.icon className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div className="text-xl font-display font-bold">{s.value}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Batch Actions Bar */}
          <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedIds.size === myProducts.length && myProducts.length > 0}
                onCheckedChange={toggleSelectAll}
                className="data-[state=checked]:bg-primary"
              />
              <span className="text-xs text-muted-foreground">
                {selectedIds.size > 0 ? `已选 ${selectedIds.size} 个产品` : "全选"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm" variant="outline" className="text-xs gap-1 h-7"
                disabled={selectedIds.size === 0}
                onClick={() => setShowShareDialog(true)}
              >
                <Share2 className="w-3 h-3" /> 批量分享
              </Button>
              <Button
                size="sm" variant="outline" className="text-xs gap-1 h-7"
                disabled={selectedIds.size === 0}
                onClick={() => {
                  const selected = myProducts.filter((p) => selectedIds.has(p.id));
                  const text = selected.map((p) => `${p.name},${p.sku ?? ""},${formatPrice(p.price, p.currency)},${p.moq ?? ""},${p.factory_name ?? ""}`).join("\n");
                  navigator.clipboard.writeText(`产品名称,SKU,价格,MOQ,工厂\n${text}`);
                  toast.success("已复制为CSV格式");
                }}
              >
                <Copy className="w-3 h-3" /> 复制
              </Button>
              <Button
                size="sm" variant="outline" className="text-xs gap-1 h-7 text-destructive hover:text-destructive"
                disabled={selectedIds.size === 0}
                onClick={removeSelected}
              >
                <Trash2 className="w-3 h-3" /> 移除
              </Button>
            </div>
          </div>

          {/* My Product List */}
          {myProducts.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h4 className="text-sm font-medium mb-1">暂无选品</h4>
              <p className="text-xs text-muted-foreground mb-4">前往产品库浏览和选择您想销售的产品</p>
              <Button size="sm" onClick={() => setActiveTab("library")}>
                <Globe className="w-3.5 h-3.5 mr-1" /> 浏览产品库
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {myProducts.map((p) => (
                <div
                  key={p.id}
                  className={cn(
                    "bg-card border rounded-xl p-3 flex items-center gap-3 transition-all hover:border-primary/30",
                    selectedIds.has(p.id) ? "border-primary/50 bg-primary/5" : "border-border"
                  )}
                >
                  <Checkbox
                    checked={selectedIds.has(p.id)}
                    onCheckedChange={() => toggleSelect(p.id)}
                    className="data-[state=checked]:bg-primary flex-shrink-0"
                  />
                  {p.image_url && (
                    <img
                      src={p.image_url} alt={p.name}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                      onClick={() => setSelectedProduct(p)}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className="text-sm font-medium truncate cursor-pointer hover:text-primary transition-colors"
                        onClick={() => setSelectedProduct(p)}
                      >
                        {p.name}
                      </h4>
                      {p.has_bot && (
                        <Badge variant="outline" className="text-[8px] h-4 px-1 gap-0.5 flex-shrink-0">
                          <Bot className="w-2 h-2" /> AI
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                      <span className="font-mono">{p.sku ?? ""}</span>
                      <span>{p.category ?? ""}</span>
                      <span className="flex items-center gap-0.5"><Factory className="w-2.5 h-2.5" /> {p.factory_name ?? "—"}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {(p.factory_certs ?? []).slice(0, 3).map((c) => (
                        <span key={c} className="text-[8px] bg-secondary px-1 py-0.5 rounded">{c}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-primary">{formatPrice(p.price, p.currency)}</div>
                    <div className="text-[10px] text-muted-foreground">MOQ: {p.moq ?? "—"}</div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      size="sm" variant="ghost" className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(`https://opc.com/product/${p.sku ?? p.id}`);
                        toast.success(`${p.name} 链接已复制`);
                      }}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromMy(p.id);
                        setSelectedIds((prev) => { const n = new Set(prev); n.delete(p.id); return n; });
                        toast.success(`已移除 ${p.name}`);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Share Dialog */}
      {showShareDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Share2 className="w-4 h-4 text-primary" /> 批量分享给客户
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                已选择 {selectedIds.size} 个产品，将生成产品推荐清单
              </p>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">分享产品</label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {myProducts.filter((p) => selectedIds.has(p.id)).map((p) => (
                    <div key={p.id} className="flex items-center gap-2 text-xs">
                      {p.image_url && <img src={p.image_url} alt="" className="w-6 h-6 rounded object-cover" />}
                      <span className="flex-1 truncate">{p.name}</span>
                      <span className="text-primary font-medium">{formatPrice(p.price, p.currency)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">备注信息（可选）</label>
                <textarea
                  className="w-full h-16 bg-secondary rounded-lg px-3 py-2 text-xs outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary resize-none"
                  placeholder="给客户的备注，如特别优惠、推荐理由等..."
                  value={shareNote}
                  onChange={(e) => setShareNote(e.target.value)}
                />
              </div>
            </div>
            <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => { setShowShareDialog(false); setShareNote(""); }}>取消</Button>
              <Button size="sm" onClick={handleShare}>
                <Copy className="w-3.5 h-3.5 mr-1" /> 复制分享链接
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
