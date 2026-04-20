/**
 * ProductDetail - 产品详情页（60/40分屏：产品信息 + AI产品助手）
 */
import { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowLeft, MessageSquare, Send, Bot, Star, Shield,
  FileText, Download, Package, Factory, Clock, CheckCircle2,
  ClipboardList, Share2, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ProductInfo {
  id: number;
  name: string;
  category: string;
  sku: string;
  price: string;
  moq: string;
  stock: string;
  image: string;
  hasBot: boolean;
  views: number;
  inquiries: number;
  factory: string;
  factoryRating: number;
  factoryCerts: string[];
  specs: { label: string; value: string }[];
  description: string;
  docs: { name: string; size: string }[];
  images: string[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  recommendedProducts?: ProductInfo[];
}

const quickQuestions = [
  "支持定制吗？",
  "最小起订量能谈吗？",
  "交期多久？",
  "推荐同品类产品",
];

export default function ProductDetail({
  product,
  allProducts = [],
  onBack,
  onSelectProduct,
}: {
  product: ProductInfo;
  allProducts?: ProductInfo[];
  onBack: () => void;
  onSelectProduct?: (p: ProductInfo) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `您好！我是 **${product.name}** 的专属产品助手，由 **${product.factory}** 提供支持。\n\n关于这款产品的任何问题都可以问我，包括技术参数、价格、定制、交期等，我会尽力为您解答～`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [added, setAdded] = useState(false);
  const [selectedImg, setSelectedImg] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Get related products (same category, different id)
  const relatedProducts = allProducts.filter(
    (p) => p.category === product.category && p.id !== product.id
  );

  const isRecommendQuery = (text: string) =>
    /推荐|同品类|同类|类似|相关|其他产品|还有什么/.test(text);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;
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
        const { data, error } = await supabase.functions.invoke("product-bot", {
          headers: { "x-google-api-key": googleApiKey },
          body: {
            productName: product.name,
            productSku: product.sku,
            productPrice: product.price,
            productMoq: product.moq,
            factoryName: product.factory,
            specs: product.specs.map((s) => `${s.label}: ${s.value}`).join(", "),
            relatedProducts: relatedProducts.map((p) => ({
              name: p.name, sku: p.sku, price: p.price, moq: p.moq, factory: p.factory,
            })),
            messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
          },
        });

        if (error) throw error;

        // Handle SSE stream from response
        if (data instanceof ReadableStream) {
          const reader = data.getReader();
          const decoder = new TextDecoder();
          let accumulated = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const jsonStr = line.slice(6).trim();
                if (jsonStr === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(jsonStr);
                  const delta =
                    parsed.candidates?.[0]?.content?.parts?.[0]?.text ||
                    parsed.choices?.[0]?.delta?.content;
                  if (delta) {
                    accumulated += delta;
                    setMessages((prev) => {
                      const updated = [...prev];
                      updated[updated.length - 1] = { ...updated[updated.length - 1], content: accumulated };
                      return updated;
                    });
                  }
                } catch {}
              }
            }
          }
        } else if (typeof data === "string") {
          // Non-stream text
          const lines = data.split("\n");
          let accumulated = "";
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") continue;
              try {
                const parsed = JSON.parse(jsonStr);
                const delta =
                  parsed.candidates?.[0]?.content?.parts?.[0]?.text ||
                  parsed.choices?.[0]?.delta?.content;
                if (delta) accumulated += delta;
              } catch {}
            }
          }
          if (accumulated) {
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { ...updated[updated.length - 1], content: accumulated };
              return updated;
            });
          } else {
            // Fallback: treat entire data as content
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { ...updated[updated.length - 1], content: typeof data === "object" ? JSON.stringify(data) : String(data) };
              return updated;
            });
          }
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
        // Attach related products if the query was about recommendations
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
    [messages, isStreaming, product],
  );

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
          <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => { navigator.clipboard.writeText(`https://opc.com/product/${product.sku}`); toast.success("产品链接已复制"); }}>
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
              <img
                src={product.images[selectedImg]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-1 p-2 border-t border-border">
                {product.images.map((img, i) => (
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
                <span className="text-[10px] text-muted-foreground">{product.category} · {product.sku}</span>
                <h2 className="text-base font-display font-bold mt-0.5">{product.name}</h2>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary">{product.price}</div>
                <div className="text-[10px] text-muted-foreground">MOQ: {product.moq}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn("w-3 h-3", i < product.factoryRating ? "text-primary fill-primary" : "text-muted")} />
                ))}
                <span className="ml-1">{product.factoryRating}.0</span>
              </span>
              <span>库存: {product.stock}</span>
              <span>{product.views} 浏览</span>
              <span>{product.inquiries} 询盘</span>
            </div>
          </div>

          {/* Specs */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h4 className="text-xs font-semibold mb-3 flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-primary" /> 规格参数
            </h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
              {product.specs.map((s) => (
                <div key={s.label} className="flex justify-between text-xs py-1 border-b border-border/50">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Factory Info */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h4 className="text-xs font-semibold mb-3 flex items-center gap-1">
              <Factory className="w-3.5 h-3.5 text-primary" /> 工厂信息
            </h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-sm font-bold">
                {product.factory[0]}
              </div>
              <div>
                <div className="text-sm font-medium">{product.factory}</div>
                <div className="flex gap-1 mt-1">
                  {product.factoryCerts.map((c) => (
                    <Badge key={c} variant="outline" className="text-[9px] h-4 gap-0.5">
                      <Shield className="w-2.5 h-2.5 text-brand-green" /> {c}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h4 className="text-xs font-semibold mb-2">产品描述</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          {/* Docs */}
          {product.docs.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h4 className="text-xs font-semibold mb-2 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-primary" /> 技术文档
              </h4>
              <div className="space-y-1.5">
                {product.docs.map((d) => (
                  <button
                    key={d.name}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/30 transition-colors text-xs"
                    onClick={() => toast("正在下载 " + d.name)}
                  >
                    <Download className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="flex-1 text-left">{d.name}</span>
                    <span className="text-[10px] text-muted-foreground">{d.size}</span>
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
                <div className="text-[10px] text-muted-foreground">由 {product.factory} 提供支持</div>
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
                        <img src={rp.image} alt={rp.name} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-medium truncate">{rp.name}</div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="text-primary font-semibold">{rp.price}</span>
                            <span>MOQ: {rp.moq}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[9px] text-muted-foreground">{rp.factory}</span>
                            {rp.hasBot && (
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
