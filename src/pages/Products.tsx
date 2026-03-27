/**
 * Products - 产品库（OPC核心选品模块）
 * 工厂直连 + AI机器人赋能选品
 */
import { useState } from "react";
import {
  Package, Search, Plus, Globe, DollarSign,
  BarChart3, Eye, Layers, CheckCircle2, Tag,
  MessageSquare, Bot, Factory, Star, Shield, Filter,
  Share2, Trash2, ExternalLink, Copy, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import ProductDetail from "@/components/products/ProductDetail";

interface Product {
  id: number; name: string; category: string; sku: string;
  price: string; moq: string; stock: string; image: string;
  hasBot: boolean; views: number; inquiries: number;
  factory: string; factoryRating: number; factoryCerts: string[];
  specs: { label: string; value: string }[];
  description: string;
  docs: { name: string; size: string }[];
  images: string[];
}

const products: Product[] = [
  {
    id: 1, name: "LED Bulb A60 9W", category: "LED照明", sku: "LED-A60-9W",
    price: "$1.85", moq: "1,000 pcs", stock: "50,000",
    image: "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=400&h=300&fit=crop",
    hasBot: true, views: 2340, inquiries: 45,
    factory: "明辉照明科技", factoryRating: 5, factoryCerts: ["ISO9001", "CE", "RoHS", "UL"],
    specs: [
      { label: "功率", value: "9W" }, { label: "色温", value: "2700K-6500K" },
      { label: "光通量", value: "810lm" }, { label: "显色指数", value: "Ra>80" },
      { label: "寿命", value: "25,000小时" }, { label: "调光", value: "支持PWM" },
      { label: "输入电压", value: "AC100-240V" }, { label: "灯头", value: "E27/E26/B22" },
    ],
    description: "高品质LED灯泡，采用进口芯片，高光效低能耗。铝基板散热设计，寿命长达25000小时。支持2700K暖白至6500K冷白全色温范围，适用于家庭、商业、酒店照明。通过CE、RoHS、UL等国际认证，可根据客户需求定制外观、包装和标签。",
    docs: [{ name: "产品规格书.pdf", size: "2.3MB" }, { name: "CE认证.pdf", size: "890KB" }, { name: "测试报告.pdf", size: "1.5MB" }],
    images: [
      "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1493723843671-1d655e66ac1c?w=600&h=400&fit=crop",
    ],
  },
  {
    id: 2, name: "Solar Panel 400W Mono", category: "太阳能", sku: "SP-400W-M",
    price: "$85.00", moq: "50 units", stock: "2,000",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop",
    hasBot: true, views: 1890, inquiries: 32,
    factory: "旭日新能源", factoryRating: 5, factoryCerts: ["TÜV", "IEC", "CE"],
    specs: [
      { label: "功率", value: "400W" }, { label: "电池类型", value: "单晶硅" },
      { label: "效率", value: "21.3%" }, { label: "尺寸", value: "1755×1038×35mm" },
      { label: "重量", value: "20.5kg" }, { label: "质保", value: "25年" },
    ],
    description: "高效单晶硅太阳能电池板，采用PERC技术，转换效率高达21.3%。半片电池设计减少热斑效应，提升系统可靠性。适用于分布式电站、屋顶光伏系统、工商业用电等场景。",
    docs: [{ name: "产品数据手册.pdf", size: "3.1MB" }, { name: "IEC认证.pdf", size: "1.2MB" }],
    images: [
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&h=400&fit=crop",
    ],
  },
  {
    id: 3, name: "Steel Pipe DN100", category: "钢材", sku: "STP-DN100",
    price: "$12.50/m", moq: "10 tons", stock: "500 tons",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop",
    hasBot: false, views: 980, inquiries: 18,
    factory: "鑫达钢铁", factoryRating: 4, factoryCerts: ["ISO9001", "API"],
    specs: [
      { label: "规格", value: "DN100" }, { label: "壁厚", value: "4.5mm" },
      { label: "材质", value: "Q235B" }, { label: "长度", value: "6m/12m" },
    ],
    description: "优质碳钢无缝钢管，表面热镀锌处理，耐腐蚀性能优异。适用于给排水、天然气输送、建筑结构等领域。",
    docs: [{ name: "材质报告.pdf", size: "780KB" }],
    images: ["https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop"],
  },
  {
    id: 4, name: "Phone Case TPU Clear", category: "手机配件", sku: "PC-TPU-CLR",
    price: "$0.35", moq: "5,000 pcs", stock: "200,000",
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=300&fit=crop",
    hasBot: true, views: 3200, inquiries: 67,
    factory: "智联科技配件", factoryRating: 4, factoryCerts: ["SGS", "REACH"],
    specs: [
      { label: "材质", value: "TPU" }, { label: "硬度", value: "85A" },
      { label: "厚度", value: "1.2mm" }, { label: "兼容", value: "iPhone/Samsung/Xiaomi" },
    ],
    description: "高透明TPU手机保护壳，防黄变处理，手感柔软防滑。精准开孔，完美贴合各品牌主流机型。支持定制logo印刷、颜色和包装。",
    docs: [{ name: "SGS检测报告.pdf", size: "1.1MB" }],
    images: [
      "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=600&h=400&fit=crop",
    ],
  },
  {
    id: 5, name: "Ceramic Tea Set 6pcs", category: "家居用品", sku: "CTS-6PCS",
    price: "$8.50/set", moq: "200 sets", stock: "5,000",
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop",
    hasBot: true, views: 1560, inquiries: 28,
    factory: "景瓷艺陶", factoryRating: 5, factoryCerts: ["FDA", "SGS", "LFGB"],
    specs: [
      { label: "材质", value: "高温陶瓷" }, { label: "套装", value: "1壶+4杯+1托盘" },
      { label: "容量", value: "壶800ml/杯150ml" }, { label: "工艺", value: "手绘釉下彩" },
    ],
    description: "景德镇传统手工制作茶具套装，高温1300°C烧制，釉面光滑细腻。手绘釉下彩图案，每一件都是独特艺术品。适合作为商务礼品、家居装饰或出口。",
    docs: [{ name: "FDA检测报告.pdf", size: "920KB" }],
    images: [
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1530968033775-2c92f0898d7c?w=600&h=400&fit=crop",
    ],
  },
  {
    id: 6, name: "LED Panel Light 600x600", category: "LED照明", sku: "LED-PL-600",
    price: "$12.00", moq: "200 pcs", stock: "10,000",
    image: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400&h=300&fit=crop",
    hasBot: true, views: 1780, inquiries: 35,
    factory: "明辉照明科技", factoryRating: 5, factoryCerts: ["CE", "RoHS", "DLC"],
    specs: [
      { label: "功率", value: "40W" }, { label: "色温", value: "4000K/6000K" },
      { label: "光通量", value: "4000lm" }, { label: "尺寸", value: "600×600×10mm" },
      { label: "驱动", value: "恒流隔离" }, { label: "寿命", value: "50,000小时" },
    ],
    description: "超薄LED面板灯，厚度仅10mm，适用于办公室、医院、学校等集成吊顶安装。采用导光板技术，发光均匀无频闪，通过CE、DLC认证。",
    docs: [{ name: "IES光学报告.pdf", size: "2.8MB" }, { name: "CE证书.pdf", size: "750KB" }],
    images: ["https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600&h=400&fit=crop"],
  },
];

const categories = ["全部", "LED照明", "太阳能", "钢材", "手机配件", "家居用品"];

export default function Products() {
  const [activeTab, setActiveTab] = useState<"library" | "my">("library");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [botOnly, setBotOnly] = useState(false);
  const [myProducts, setMyProducts] = useState<Product[]>([
    products[0], products[1], products[4],
  ]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareNote, setShareNote] = useState("");

  const filtered = products.filter((p) => {
    const catMatch = selectedCategory === "全部" || p.category === selectedCategory;
    const searchMatch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const botMatch = !botOnly || p.hasBot;
    return catMatch && searchMatch && botMatch;
  });

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
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
    setMyProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    toast.success(`已移除 ${selectedIds.size} 个产品`);
    setSelectedIds(new Set());
  };

  const handleShare = () => {
    const shareProducts = myProducts.filter((p) => selectedIds.has(p.id));
    const shareText = shareProducts.map((p) => `${p.name} (${p.sku}) - ${p.price}`).join("\n");
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
        product={selectedProduct}
        allProducts={products}
        onBack={() => setSelectedProduct(null)}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="font-display font-semibold text-lg">产品库</h2>
          <p className="text-xs text-muted-foreground">工厂直连 · AI机器人赋能选品</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-xs" onClick={() => toast("添加产品功能即将上线")}>
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
              { label: "产品总数", value: "48", sub: "6个品类", icon: Package },
              { label: "AI助手覆盖", value: "83%", sub: "40/48 产品", icon: Bot },
              { label: "总浏览量", value: "11.7K", sub: "↑ 28% 本月", icon: Eye },
              { label: "询盘转化", value: "225", sub: "转化率 1.9%", icon: Tag },
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

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text" placeholder="搜索产品名称、SKU..."
                className="w-full h-8 bg-secondary rounded-md pl-8 pr-3 text-xs outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary"
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

          {/* Product Grid */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((p) => {
                const isAdded = myProducts.some((mp) => mp.id === p.id);
                return (
                  <div
                    key={p.id}
                    className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all cursor-pointer group"
                    onClick={() => setSelectedProduct(p)}
                  >
                    <div className="relative h-36 bg-secondary">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      {p.hasBot && (
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
                        {p.factoryCerts.slice(0, 3).map((c) => (
                          <span key={c} className="text-[8px] bg-card/80 backdrop-blur-sm px-1.5 py-0.5 rounded font-medium">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-muted-foreground">{p.category}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{p.sku}</span>
                      </div>
                      <h4 className="text-sm font-medium mb-1.5">{p.name}</h4>
                      <div className="flex items-center justify-between text-[11px] mb-2">
                        <span className="font-bold text-primary text-sm">{p.price}</span>
                        <span className="text-muted-foreground">MOQ: {p.moq}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2">
                        <Factory className="w-3 h-3" />
                        <span>{p.factory}</span>
                        <span className="flex items-center gap-0.5 ml-auto">
                          <Star className="w-2.5 h-2.5 text-primary fill-primary" /> {p.factoryRating}.0
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground border-t border-border pt-2">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {p.views.toLocaleString()}</span>
                        <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {p.inquiries} 询盘</span>
                        {!isAdded ? (
                          <button
                            className="flex items-center gap-1 text-primary ml-auto font-medium hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMyProducts((prev) => [...prev, p]);
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
                            <img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover" />
                            <div>
                              <div className="font-medium">{p.name}</div>
                              <div className="text-[10px] text-muted-foreground">{p.category} · {p.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{p.factory}</td>
                        <td className="px-4 py-3 font-medium text-primary">{p.price}</td>
                        <td className="px-4 py-3 text-muted-foreground">{p.moq}</td>
                        <td className="px-4 py-3">
                          {p.hasBot ? (
                            <span className="text-[10px] text-brand-green flex items-center gap-0.5"><Bot className="w-3 h-3" /> 在线</span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">未配置</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{p.views.toLocaleString()}</td>
                        <td className="px-4 py-3">{p.inquiries}</td>
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
              { label: "已选产品", value: String(myProducts.length), sub: `${new Set(myProducts.map(p => p.category)).size} 个品类`, icon: Package },
              { label: "累计分享", value: "36", sub: "↑ 12 本月", icon: Share2 },
              { label: "客户覆盖", value: "18", sub: "活跃客户", icon: Users },
              { label: "AI助手", value: `${myProducts.filter(p => p.hasBot).length}/${myProducts.length}`, sub: "已配置比例", icon: Bot },
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
                  const text = selected.map((p) => `${p.name},${p.sku},${p.price},${p.moq},${p.factory}`).join("\n");
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
                  <img
                    src={p.image} alt={p.name}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                    onClick={() => setSelectedProduct(p)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className="text-sm font-medium truncate cursor-pointer hover:text-primary transition-colors"
                        onClick={() => setSelectedProduct(p)}
                      >
                        {p.name}
                      </h4>
                      {p.hasBot && (
                        <Badge variant="outline" className="text-[8px] h-4 px-1 gap-0.5 flex-shrink-0">
                          <Bot className="w-2 h-2" /> AI
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                      <span className="font-mono">{p.sku}</span>
                      <span>{p.category}</span>
                      <span className="flex items-center gap-0.5"><Factory className="w-2.5 h-2.5" /> {p.factory}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {p.factoryCerts.slice(0, 3).map((c) => (
                        <span key={c} className="text-[8px] bg-secondary px-1 py-0.5 rounded">{c}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-primary">{p.price}</div>
                    <div className="text-[10px] text-muted-foreground">MOQ: {p.moq}</div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      size="sm" variant="ghost" className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(`https://opc.com/product/${p.sku}`);
                        toast.success(`${p.name} 链接已复制`);
                      }}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMyProducts((prev) => prev.filter((mp) => mp.id !== p.id));
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
                      <img src={p.image} alt="" className="w-6 h-6 rounded object-cover" />
                      <span className="flex-1 truncate">{p.name}</span>
                      <span className="text-primary font-medium">{p.price}</span>
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
