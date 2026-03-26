/**
 * AIAssistant - 浮动AI助手
 */
import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  time: string;
}

const initialMessages: ChatMessage[] = [
  {
    id: 1, role: "assistant",
    content: "您好！我是半人马AI助手。我可以帮您分析询盘、生成回复、优化产品描述，或回答外贸业务问题。有什么需要帮助的吗？",
    time: "刚刚",
  },
];

const quickActions = ["帮我分析最新询盘", "生成一封开发信", "优化产品描述", "查看今日数据摘要"];

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("询盘") || lower.includes("分析")) {
    return "今日共收到31条询盘，其中高优先级5条。最值得关注的是来自TechCorp的John Smith，询问LED灯泡5000个的FOB报价，建议优先跟进。AI已自动回复了26条，还有3条待您审核。";
  }
  if (lower.includes("开发信") || lower.includes("邮件")) {
    return "我可以帮您生成针对性的开发信。请告诉我：\n1. 目标客户所在行业\n2. 主推产品\n3. 目标市场\n\n我会根据这些信息生成高转化率的开发信模板。";
  }
  if (lower.includes("产品") || lower.includes("描述")) {
    return "产品库中有8个产品尚未AI优化。建议优先处理Steel Pipe DN100，该产品询盘量增长较快但描述较简单。我可以帮您生成多语言SEO优化描述。";
  }
  if (lower.includes("数据") || lower.includes("摘要")) {
    return "今日数据摘要：\n• 询盘：31条（↑24%）\n• AI处理率：83.9%\n• 活跃客户：156个\n• 预估成交额：$48.5K\n• 最活跃渠道：独立站（45条）\n• 待处理：3条待审核回复";
  }
  return "感谢您的提问！我正在分析您的问题，请稍等。您也可以尝试问我关于询盘分析、开发信生成、产品优化等方面的问题。";
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: Date.now(), role: "user", content: input, time: "刚刚" };
    setMessages((prev) => [...prev, userMsg]);
    const q = input;
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "assistant", content: getAIResponse(q), time: "刚刚" }]);
      setIsTyping(false);
    }, 1200);
  };

  const handleQuickAction = (action: string) => {
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", content: action, time: "刚刚" }]);
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "assistant", content: getAIResponse(action), time: "刚刚" }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-20 right-6 w-12 h-12 rounded-full bg-brand-orange text-primary-foreground shadow-lg shadow-brand-orange/25 flex items-center justify-center hover:opacity-90 transition-colors z-50"
          >
            <Bot className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-80 h-[28rem] bg-card border border-border rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-orange/15 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                </div>
                <div>
                  <div className="text-xs font-semibold">半人马AI助手</div>
                  <div className="text-[10px] text-brand-green flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-green" /> 在线
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setIsOpen(false)} className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setIsOpen(false)} className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap",
                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-lg px-3 py-2 text-xs text-muted-foreground">
                    <span className="animate-pulse">正在思考...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick actions */}
            {messages.length <= 2 && (
              <div className="px-3 pb-2">
                <div className="flex flex-wrap gap-1">
                  {quickActions.map((action) => (
                    <button key={action} onClick={() => handleQuickAction(action)}
                      className="text-[10px] bg-secondary text-muted-foreground px-2 py-1 rounded-md hover:text-foreground hover:bg-secondary/80 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="flex items-center gap-2 p-3 border-t border-border">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="输入您的问题..."
                className="flex-1 bg-secondary rounded-md px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button onClick={handleSend} className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-colors">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
