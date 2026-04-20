/**
 * AIAssistant - 浮动AI助手（接入 Google Gemini 流式 API）
 */
import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { streamGemini, type GeminiMessage } from "@/lib/gemini";
import { getStoredApiKey, getStoredModel } from "@/hooks/use-api-key";

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

const SYSTEM_INSTRUCTION = `你是半人马AI助手，一个专业的跨境电商运营助手。你的能力包括：
1. 分析询盘数据，识别高价值客户
2. 生成专业的外贸开发信和回复
3. 优化产品描述，支持多语言
4. 提供数据分析和运营建议
5. 帮助制定社媒内容策略
请用中文回复，语气专业友好，回复简洁实用。`;

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [history, setHistory] = useState<GeminiMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendToGemini = async (userInput: string) => {
    const apiKey = getStoredApiKey();

    const userMsg: ChatMessage = { id: Date.now(), role: "user", content: userInput, time: "刚刚" };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    if (!apiKey) {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        content: "⚠️ 请先在「设置 → AI Agent 配置」中配置 Google AI API Key，即可使用 AI 助手。",
        time: "刚刚",
      }]);
      setIsTyping(false);
      return;
    }

    const newHistory: GeminiMessage[] = [...history, { role: "user", parts: [{ text: userInput }] }];
    const assistantId = Date.now() + 1;
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "", time: "刚刚" }]);

    try {
      let fullText = "";
      const stream = streamGemini(apiKey, newHistory, {
        model: getStoredModel(),
        systemInstruction: SYSTEM_INSTRUCTION,
      });

      for await (const chunk of stream) {
        fullText += chunk;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: fullText } : m))
        );
      }

      if (fullText) {
        setHistory([...newHistory, { role: "model", parts: [{ text: fullText }] }]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "AI 服务暂时不可用";
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: `❌ ${errorMsg}` } : m))
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userInput = input;
    setInput("");
    await sendToGemini(userInput);
  };

  const handleQuickAction = async (action: string) => {
    if (isTyping) return;
    await sendToGemini(action);
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
            className="fixed bottom-20 right-6 w-80 h-[28rem] bg-card border border-border rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden"
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
                    {msg.content || (msg.role === "assistant" && isTyping ? <span className="text-muted-foreground animate-pulse">…</span> : null)}
                  </div>
                </div>
              ))}
              {isTyping && messages[messages.length - 1]?.role === "user" && (
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
              <button onClick={handleSend} disabled={isTyping} className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-colors disabled:opacity-50">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
