/**
 * ProductDetail - 产品详情页（60/40分屏：产品信息 + AI产品助手）
 * 数据源：useProductWithDetails（products + product_specs + product_images + product_docs）
 */
import { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowLeft, MessageSquare, Send, Bot, Star, Shield,
  FileText, Download, Package, Factory, CheckCircle2,
  ClipboardList, Share2, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useProductWithDetails } from "@/hooks/use-products";
import type { Product, ProductWithDetails } from "@/hooks/use-products";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  recommendedProducts?: Product[];
}

const quickQuestions = [
  "支持定制吗？",
  "最小起订量能谈吗？",
  "交期多久？",
  "推荐同品类产品",
];

function formatPrice(p: number | null | undefined, currency: string | null | undefined = "USD"): string {
  if (p == null) return "—";
  const sym = currency === "USD" ? "$" : currency ? `${currency} ` : "$";
  return `${sym}${Number(p).toFixed(2)}`;
}

export default function ProductDetail({
  productId,
  fallbackProduct,
  allProducts = [],
  onBack,
  onSelectProduct,
}: {
  productId: string;
  fallbackProduct?: Product;
  allProducts?: Product[];
  onBack: () => void;
  onSelectProduct?: (p: Product) => void;
}) {
  const { data: detail, isLoading } = useProductWithDetails(productId);

  // 用 detail 优先，否则回退到列表里的精简对象（让 UI 不闪烁）
  const product: ProductWithDetails | (Product & { specs: []; images: []; docs: [] }) | null =
    detail ?? (fallbackProduct ? { ...fallbackProduct, specs: [], images: [], docs: [] } : null);

  const factoryName = product?.factory_name ?? "工厂";
  const priceLabel = formatPrice(product?.price, product?.currency);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [added, setAdded] = useState(false);
  const [selectedImg, setSelectedImg] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // 当产品名/工厂载入后初始化欢迎语
  useEffect(() => {
    if (!product) return;
    setMessages([
      {
        role: "assistant",
        content: `您好！我是 **${product.name}** 的专属产品助手，由 **${factoryName}** 提供支持。\n\n关于这款产品的任何问题都可以问我，包括技术参数、价格、定制、交期等，我会尽力为您解答～`,
        timestamp: new Date(),
      },
    ]);
    setSelectedImg(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, factoryName, product?.name]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 同品类推荐
  const relatedProducts = allProducts.filter(
    (p) => p.category && product?.category && p.category === product.category && p.id !== productId
  );

  const isRecommendQuery = (text: string) =>
    /推荐|同品类|同类|类似|相关|其他产品|还有什么/.test(text);

  // 显示用图片（优先关联表，回退到 image_url）
  const galleryImages: string[] = (() => {
    if (detail?.images && detail.images.length > 0) {
      return detail.images.map((i) => i.url);
    }
    if (product?.image_url) return [product.image_url];
    return [];
  })();

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming || !product) return;
      const userMsg: ChatMessage = { role: "user", content: text.trim(), timestamp: new Date() };
      const allMessages = [...messages, userMsg];
      setMessages(allMessages);
      setInput("");
      setIsStreaming(true);

      const botMsg: ChatMessage = { role: "assistant", content: "", timestamp: new Date() };
      setMessages([...allMessages, botMsg]);

      const googleApiKey = localStorage.getItem("banrenma_google_api_key");
      if (!googleApiKey) {
        toast.error("需要配置 AI", {
          description: "请前往设置 > AI Agent 配置，填入 Google AI API Key",
        });
        setIsStreaming(false);
        setMessages(allMessages);
        return;
      }

      try {
        abortRef.current = new AbortController();
        const specsStr = (detail?.specs ?? []).map((s) => `${s.label}: ${s.value}`).join(", ");

        // AI product assistant — placeholder for local mode
        toast.info("AI product assistant coming soon");

        // Simulate a basic response using product info
        const simulatedReply = `关于 **${product.name}** 的问题，以下是基本信息：\n\n` +
          `• 价格: ${priceLabel}\n` +
          `• MOQ: ${product.moq ?? "—"}\n` +
          `• 工厂: ${factoryName}\n` +
          (specsStr ? `• 规格: ${specsStr}\n` : "") +
          `\n完整 AI 产品助手功能即将上线，届时将提供更智能的解答。`;

        // Simulate streaming effect
        let accumulated = "";
        for (const char of simulatedReply) {
          accumulated += char;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], content: accumulated };
            return updated;
          });
          await new Promise((r) => setTimeout(r, 10));
        }
      } catch (err: any) {
        console.error("Product bot error:", err);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: "抱歉，AI助手暂时无法回应，请稍后再试。",
          };
          return updated;
        });
      } finally {
        setIsStreaming(false);
        if (isRecommendQuery(text) && relatedProducts.length > 0) {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === "assistant") {
              updated[updated.length - 1] = { ...last, recommendedProducts: relatedProducts };
            }
            return updated;
          });
        }
      }
    },
    [messages, isStreaming, product, detail, factoryName, priceLabel, relatedProducts]
  );

  if (!product) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
        <span className="text-xs text-muted-foreground">加载产品详情…</span>
      </div>
    );
  }

  return (
    <div className="space-y-0 h-full flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-1 pb-4">
        <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={onBack}>
          <ArrowLeft className="w-3.5 h-3.5" /> 返回产品库
        </Button>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={added ? "secondary" : "default"}
            className="text-xs gap-1"
            disabled={added}
            onClick={() => {
              setAdded(true);
              toast.success("已加入我的产品库！", { description: "您可以在\"我的产品\"中管理和分享给客户" });
            }}
          >
            {added ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
            {added ? "已加入" : "加入我的产品"}
          </Button>
          <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => toast.success("样品申请已提交，工厂将在24小时内确认")}>
            <ClipboardList className="w-3.5 h-3.5" /> 申请样品
          </Button>
          <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => { navigator.clipboard.writeText(`https://opc.com/product/${product.sku ?? product.id}`); toast.success("产品链接已复制"); }}>
            <Share2 className="w-3.5 h-3.5" /> 分享
          </Button>
        </div>
      </div>

      {/* Main 60/40 Split */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left - Product Info (60%) */}
        <div className="w-[58%] overflow-y-auto pr-2 space-y-4">
          {/* Image Gallery */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="h-64 bg-secondary">
              {galleryImages[selectedImg] && (
                <img
                  src={galleryImages[selectedImg]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {galleryImages.length > 1 && (
              <div className="flex gap-1 p-2 border-t border-border">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    className={cn(
                      "w-14 h-14 rounded-md overflow-hidden border-2 transition-colors",
                      selectedImg === i ? "border-primary" : "border-transparent opacity-60 hover:opacity-100",
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Name & Price */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-muted-foreground">{product.category ?? ""} · {product.sku ?? ""}</span>
                <h2 className="text-base font-display font-bold mt-0.5">{product.name}</h2>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary">{priceLabel}</div>
                <div className="text-[10px] text-muted-foreground">MOQ: {product.moq ?? "—"}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn("w-3 h-3", i < (product.factory_rating ?? 0) ? "text-primary fill-primary" : "text-muted")} />
                ))}
                <span className="ml-1">{(product.factory_rating ?? 0).toFixed(1)}</span>
              </span>
              <span>库存: {product.stock ?? "—"}</span>
              <span>{(product.views ?? 0)} 浏览</span>
              <span>{(product.inquiries_count ?? 0)} 询盘</span>
            </div>
          </div>

          {/* Specs */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h4 className="text-xs font-semibold mb-3 flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-primary" /> 规格参数
            </h4>
            {isLoading && !detail ? (
              <div className="text-xs text-muted-foreground py-2 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" /> 加载规格…
              </div>
            ) : (detail?.specs?.length ?? 0) === 0 ? (
              <div className="text-xs text-muted-foreground py-2">暂无规格参数</div>
            ) : (
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                {detail!.specs.map((s) => (
                  <div key={s.id} className="flex justify-between text-xs py-1 border-b border-border/50">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-medium">{s.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Factory Info */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h4 className="text-xs font-semibold mb-3 flex items-center gap-1">
              <Factory className="w-3.5 h-3.5 text-primary" /> 工厂信息
            </h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-sm font-bold">
                {factoryName[0]}
              </div>
              <div>
                <div className="text-sm font-medium">{factoryName}</div>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {(product.factory_certs ?? []).map((c) => (
                    <Badge key={c} variant="outline" className="text-[9px] h-4 gap-0.5">
                      <Shield className="w-2.5 h-2.5 text-brand-green" /> {c}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h4 className="text-xs font-semibold mb-2">产品描述</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Docs */}
          {(detail?.docs?.length ?? 0) > 0 && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h4 className="text-xs font-semibold mb-2 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-primary" /> 技术文档
              </h4>
              <div className="space-y-1.5">
                {detail!.docs.map((d) => (
                  <button
                    key={d.id}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/30 transition-colors text-xs"
                    onClick={() => toast("正在下载 " + d.name)}
                  >
                    <Download className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="flex-1 text-left">{d.name}</span>
                    <span className="text-[10px] text-muted-foreground">{d.file_size ?? ""}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right - AI Product Bot (40%) */}
        <div className="w-[42%] flex flex-col bg-card border border-border rounded-xl overflow-hidden">
          {/* Bot Header */}
          <div className="px-4 py-3 border-b border-border bg-primary/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-xs font-semibold flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-primary" /> 产品助手
                </div>
                <div className="text-[10px] text-muted-foreground">由 {factoryName} 提供支持</div>
              </div>
              <div className="ml-auto">
                <span className="text-[9px] bg-brand-green/15 text-brand-green px-1.5 py-0.5 rounded-full font-medium">在线</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className="space-y-2">
                <div className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-secondary/50 text-foreground rounded-bl-sm",
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <div className="whitespace-pre-wrap">
                        {msg.content.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
                          part.startsWith("**") && part.endsWith("**") ? (
                            <strong key={j}>{part.slice(2, -2)}</strong>
                          ) : (
                            <span key={j}>{part}</span>
                          ),
                        )}
                        {isStreaming && i === messages.length - 1 && !msg.content && (
                          <span className="inline-flex gap-1 items-center text-muted-foreground">
                            <Loader2 className="w-3 h-3 animate-spin" /> 思考中...
                          </span>
                        )}
                      </div>
                    ) : (
                      <span>{msg.content}</span>
                    )}
                    <div className={cn("text-[9px] mt-1", msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground")}>
                      {msg.timestamp.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
                {/* Recommended product cards */}
                {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                  <div className="ml-2 space-y-1.5">
                    <p className="text-[10px] text-muted-foreground font-medium ml-1">📦 同品类推荐：</p>
                    {msg.recommendedProducts.map((rp) => (
                      <button
                        key={rp.id}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg border border-border bg-card hover:bg-secondary/40 transition-colors text-left"
                        onClick={() => onSelectProduct?.(rp)}
                      >
                        {rp.image_url && (
                          <img src={rp.image_url} alt={rp.name} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-medium truncate">{rp.name}</div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="text-primary font-semibold">{formatPrice(rp.price, rp.currency)}</span>
                            <span>MOQ: {rp.moq ?? "—"}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[9px] text-muted-foreground">{rp.factory_name ?? ""}</span>
                            {rp.has_bot && (
                              <Badge variant="outline" className="text-[8px] h-3.5 px-1 gap-0.5">
                                <Bot className="w-2 h-2" /> AI助手
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Star className="w-3 h-3 text-primary fill-primary flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 2 && !isStreaming && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  className="text-[10px] px-2 py-1 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                  onClick={() => sendMessage(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <input
                className="flex-1 h-8 bg-secondary rounded-lg px-3 text-xs outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary"
                placeholder="输入您的问题..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage(input))}
                disabled={isStreaming}
              />
              <Button size="sm" className="h-8 w-8 p-0" onClick={() => sendMessage(input)} disabled={isStreaming || !input.trim()}>
                {isStreaming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
