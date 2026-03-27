/**
 * Inbox - 非IM询盘中心（独立站、Email、社媒私信）
 * 左侧消息列表 + 右侧对话详情 + AI回复功能
 */
import { useState, useRef, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Search, Send, Bot, CheckCheck, Zap, RefreshCw, Loader2, ArrowLeft,
  Globe, Mail, Instagram, Facebook, Twitter, Reply, Forward,
  Paperclip, Clock, User,
} from "lucide-react";
import EmailRichEditor, { type EmailRichEditorRef } from "@/components/EmailRichEditor";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type InquiryChannel = "Email" | "独立站" | "Instagram" | "Facebook" | "Twitter";

interface Inquiry {
  id: number; name: string; company: string; avatar: string;
  channel: InquiryChannel; lastMessage: string; subject?: string;
  time: string; unread: boolean; priority: "high" | "medium" | "low";
  aiScore: number; email?: string;
}

interface ChatMessage {
  id: number; sender: "customer" | "ai" | "user"; time: string; text: string;
  aiGenerated?: boolean; subject?: string;
}

const channelConfig: Record<InquiryChannel, { icon: React.ReactNode; color: string; label: string }> = {
  "Email": { icon: <Mail className="w-3 h-3" />, color: "text-blue-400", label: "Email" },
  "独立站": { icon: <Globe className="w-3 h-3" />, color: "text-brand-cyan", label: "独立站" },
  "Instagram": { icon: <Instagram className="w-3 h-3" />, color: "text-pink-400", label: "Instagram" },
  "Facebook": { icon: <Facebook className="w-3 h-3" />, color: "text-blue-500", label: "Facebook" },
  "Twitter": { icon: <Twitter className="w-3 h-3" />, color: "text-sky-400", label: "Twitter" },
};

const inquiries: Inquiry[] = [
  { id: 1, name: "John Smith", company: "TechCorp Ltd.", avatar: "JS", channel: "Email", subject: "Request for Quotation - LED Bulbs 5000 Units", lastMessage: "Hi, I need a quote for 5000 units of LED bulbs. Can you send me the FOB price?", time: "10:32", unread: true, priority: "high", aiScore: 85, email: "john.smith@techcorp.com" },
  { id: 2, name: "Maria Garcia", company: "EuroTrade GmbH", avatar: "MG", channel: "独立站", lastMessage: "We are interested in your solar panel products. Could you provide the specifications and MOQ?", time: "09:45", unread: true, priority: "high", aiScore: 78, email: "maria@eurotrade.de" },
  { id: 3, name: "Ahmed Hassan", company: "MidEast Import Co.", avatar: "AH", channel: "Email", subject: "RE: Steel Pipe Samples Follow-up", lastMessage: "Following up on our previous conversation about steel pipes. When can we expect the samples?", time: "09:12", unread: false, priority: "medium", aiScore: 62, email: "ahmed@mideastimport.com" },
  { id: 4, name: "Sarah Johnson", company: "Pacific Trading Inc.", avatar: "SJ", channel: "独立站", lastMessage: "I submitted an inquiry on your website for phone cases. Looking forward to your reply.", time: "08:30", unread: true, priority: "medium", aiScore: 55, email: "sarah.j@pacifictrading.com" },
  { id: 5, name: "Lucas Müller", company: "Berlin Home Decor", avatar: "LM", channel: "Instagram", lastMessage: "Hey! Love your ceramic vases. Do you ship to Germany? What's the minimum order?", time: "昨天", unread: false, priority: "medium", aiScore: 48, email: "" },
  { id: 6, name: "Roberto Silva", company: "Brazil Imports", avatar: "RS", channel: "Facebook", lastMessage: "Olá! Estou interessado em seus produtos de iluminação LED. Vocês exportam para o Brasil?", time: "昨天", unread: false, priority: "medium", aiScore: 58, email: "" },
  { id: 7, name: "Emma Wilson", company: "UK Gadgets", avatar: "EW", channel: "Twitter", lastMessage: "DM: Saw your smart home products. Can you send pricing for bulk orders to UK?", time: "昨天", unread: true, priority: "low", aiScore: 40, email: "" },
];

const channels: (InquiryChannel | "全部")[] = ["全部", "Email", "独立站", "Instagram", "Facebook", "Twitter"];

const mockConversations: Record<number, ChatMessage[]> = {
  1: [
    { id: 1, sender: "customer", time: "10:30", text: "Hi,\n\nI'm John from TechCorp Ltd. We are looking for reliable LED bulb suppliers for our retail chain.\n\nCould you please provide:\n1. FOB pricing for 5,000 units\n2. Available wattage options\n3. Certification details\n4. Lead time\n\nLooking forward to your prompt reply.\n\nBest regards,\nJohn Smith\nProcurement Manager\nTechCorp Ltd.", subject: "Request for Quotation - LED Bulbs 5000 Units" },
  ],
  2: [
    { id: 1, sender: "customer", time: "09:45", text: "We are interested in your solar panel products. Could you provide the specifications and MOQ?" },
  ],
  3: [
    { id: 1, sender: "customer", time: "09:00", text: "Dear Sales Team,\n\nI'd like to follow up on our previous conversation about steel pipes.\n\nWe discussed sample shipment last week, but I haven't received any tracking information yet.\n\nCould you please update me on the status?\n\nRegards,\nAhmed Hassan\nMidEast Import Co.", subject: "Steel Pipe Inquiry" },
    { id: 2, sender: "ai", time: "09:01", text: "Dear Ahmed,\n\nThank you for following up. I'll check the sample status for you right away and get back to you with tracking information.\n\nBest regards", aiGenerated: true, subject: "RE: Steel Pipe Inquiry" },
    { id: 3, sender: "customer", time: "09:12", text: "Hi again,\n\nFollowing up on our previous conversation about steel pipes. When can we expect the samples?\n\nWe have a project deadline coming up next month and need to finalize supplier selection.\n\nBest,\nAhmed", subject: "RE: Steel Pipe Samples Follow-up" },
  ],
  4: [
    { id: 1, sender: "customer", time: "08:30", text: "I submitted an inquiry on your website for phone cases. Looking forward to your reply." },
  ],
  5: [
    { id: 1, sender: "customer", time: "14:00", text: "Hey! Love your ceramic vases. Do you ship to Germany? What's the minimum order? 😍" },
  ],
  6: [
    { id: 1, sender: "customer", time: "16:20", text: "Olá! Estou interessado em seus produtos de iluminação LED. Vocês exportam para o Brasil? Qual o pedido mínimo?" },
  ],
  7: [
    { id: 1, sender: "customer", time: "11:00", text: "Saw your smart home products. Can you send pricing for bulk orders to UK? We run an e-commerce store." },
  ],
};

export default function Inbox() {
  const isMobile = useIsMobile();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeChannel, setActiveChannel] = useState<InquiryChannel | "全部">("全部");
  const [messageInput, setMessageInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [aiConfidence, setAiConfidence] = useState(0);
  const [conversations, setConversations] = useState<Record<number, ChatMessage[]>>(mockConversations);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emailEditorRef = useRef<EmailRichEditorRef>(null);

  const selectedInquiry = inquiries.find((m) => m.id === selectedId);
  const filteredInquiries = activeChannel === "全部" ? inquiries : inquiries.filter((m) => m.channel === activeChannel);
  const currentChat = selectedId ? (conversations[selectedId] || []) : [];
  const isEmail = selectedInquiry?.channel === "Email";
  const isSocial = selectedInquiry?.channel === "Instagram" || selectedInquiry?.channel === "Facebook" || selectedInquiry?.channel === "Twitter";
  const isWebsite = selectedInquiry?.channel === "独立站";

  const abortRef = useRef<AbortController | null>(null);

  const generateAIReply = useCallback(async (inquiryId: number) => {
    const inquiry = inquiries.find((m) => m.id === inquiryId);
    if (!inquiry) return;

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsGenerating(true);
    setAiReply("");
    setAiConfidence(Math.floor(Math.random() * 10 + 85));

    try {
      const chatHistory = (conversations[inquiryId] || []).map((m) => ({ sender: m.sender, text: m.text }));
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-reply`;

      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          customerName: inquiry.name,
          company: inquiry.company,
          channel: inquiry.channel,
          messages: chatHistory,
          aiScore: inquiry.aiScore,
        }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `请求失败 (${resp.status})`);
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullText += content;
              setAiReply(fullText);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      setIsGenerating(false);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error("AI reply error:", err);
      toast({ title: "AI回复生成失败", description: err?.message || "请稍后重试", variant: "destructive" });
      setAiReply(null);
      setIsGenerating(false);
    }
  }, [conversations]);

  const handleSelectInquiry = useCallback((id: number) => {
    setSelectedId(id);
    setMessageInput("");
    setAiReply(null);
    generateAIReply(id);
  }, [generateAIReply]);

  const handleAdoptReply = useCallback(() => {
    if (!aiReply) return;
    if (isEmail && emailEditorRef.current) {
      emailEditorRef.current.setContent(aiReply.replace(/\n/g, "<br>"));
      setAiReply(null);
      setTimeout(() => emailEditorRef.current?.focus(), 50);
    } else {
      setMessageInput(aiReply);
      setAiReply(null);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [aiReply, isEmail]);

  const handleSend = useCallback(() => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    if (isEmail && emailEditorRef.current) {
      const text = emailEditorRef.current.getText().trim();
      if (!text || !selectedId) return;
      const attachments = emailEditorRef.current.getAttachments();
      setConversations((prev) => ({
        ...prev,
        [selectedId]: [...(prev[selectedId] || []), { id: Date.now(), sender: "user", time: timeStr, text }],
      }));
      emailEditorRef.current.clear();
      toast({
        title: "邮件已发送",
        description: attachments.length > 0 ? `包含 ${attachments.length} 个附件` : "邮件回复已发送",
      });
    } else {
      if (!messageInput.trim() || !selectedId) return;
      setConversations((prev) => ({
        ...prev,
        [selectedId]: [...(prev[selectedId] || []), { id: Date.now(), sender: "user", time: timeStr, text: messageInput.trim() }],
      }));
      setMessageInput("");
      toast({ title: "发送成功", description: "消息已发送" });
    }
  }, [messageInput, selectedId, isEmail]);

  const chCfg = selectedInquiry ? channelConfig[selectedInquiry.channel] : null;

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-0 -m-3 md:-m-4 lg:-m-6">
      {/* Left: Inquiry list */}
      <div className={cn(
        "border-r border-border flex flex-col shrink-0",
        isMobile ? (selectedId ? "hidden" : "w-full") : "w-80 lg:w-96"
      )}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-base">询盘中心</h2>
            <span className="pill-badge text-primary">
              {inquiries.filter((m) => m.unread).length} 未读
            </span>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input type="text" placeholder="搜索客户、公司..." className="w-full h-8 search-glass rounded-md pl-8 pr-3 text-xs outline-none placeholder:text-muted-foreground" />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {channels.map((ch) => (
              <button key={ch} onClick={() => setActiveChannel(ch)}
                className={cn("text-xs px-2.5 py-1 rounded-md whitespace-nowrap transition-colors flex items-center gap-1",
                  activeChannel === ch ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {ch !== "全部" && <span className={channelConfig[ch].color}>{channelConfig[ch].icon}</span>}
                {ch === "全部" ? "全部" : channelConfig[ch].label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredInquiries.map((inq) => {
            const cfg = channelConfig[inq.channel];
            return (
              <button key={inq.id} onClick={() => handleSelectInquiry(inq.id)}
                className={cn("w-full text-left px-4 py-3 border-b border-border transition-colors relative",
                  selectedId === inq.id ? "bg-primary/5" : "hover:bg-secondary/50",
                  inq.unread && "bg-secondary/30"
                )}
              >
                {selectedId === inq.id && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary nav-glow-indicator" />}
                <div className="flex gap-3">
                  <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
                    inq.priority === "high" ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                  )}>{inq.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium truncate">{inq.name}</span>
                      <span className="text-[10px] text-muted-foreground ml-2">{inq.time}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mb-0.5">{inq.company}</div>
                    {inq.channel === "Email" && inq.subject && (
                      <div className="text-[10px] font-medium text-foreground/80 truncate mb-0.5">{inq.subject}</div>
                    )}
                    <div className="text-[11px] text-muted-foreground truncate">{inq.lastMessage}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn("text-[10px] flex items-center gap-1", cfg.color)}>{cfg.icon} {cfg.label}</span>
                      <span className="text-[10px] text-muted-foreground">AI评分: {inq.aiScore}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Detail */}
      {selectedInquiry && chCfg ? (
        <div className={cn("flex-1 flex flex-col", isMobile && !selectedId && "hidden")}>
          {/* Header */}
          <div className="p-3 md:p-4 border-b border-border flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              {isMobile && (
                <button onClick={() => setSelectedId(null)} className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0">
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/15 flex items-center justify-center text-xs md:text-sm font-semibold text-primary shrink-0">{selectedInquiry.avatar}</div>
              <div className="min-w-0">
                <div className="text-xs md:text-sm font-medium truncate">{selectedInquiry.name} · <span className="text-muted-foreground">{selectedInquiry.company}</span></div>
                <div className={cn("text-[10px] flex items-center gap-1", chCfg.color)}>
                  {chCfg.icon} {chCfg.label} · {selectedInquiry.time}
                </div>
              </div>
            </div>
            <button className="text-xs glass-panel text-foreground px-2 md:px-3 py-1.5 rounded-md hover:bg-accent transition-colors flex items-center gap-1 shrink-0">
              <Bot className="w-3 h-3" /> <span className="hidden sm:inline">AI分析</span>
            </button>
          </div>

          {/* Meta bar */}
          <div className="text-[10px] px-4 py-2 border-b border-border glass-panel flex items-center gap-4 text-muted-foreground">
            {selectedInquiry.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {selectedInquiry.email}</span>}
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 首次联系: {selectedInquiry.time}</span>
            <span className="pill-badge">
              AI评分: <span className="font-metric font-bold text-primary">{selectedInquiry.aiScore}</span>
            </span>
          </div>

          {/* Chat area */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
            {currentChat.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.sender === "customer" ? "justify-start" : "justify-end")}>
                <div className={cn("max-w-[85%] md:max-w-[70%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                  msg.sender === "customer" ? "glass-panel text-foreground" : msg.sender === "ai" ? "bg-primary/10 border border-primary/20 text-foreground" : "bg-primary text-primary-foreground"
                )}>
                  {msg.sender === "ai" && <div className="text-[9px] text-primary mb-1 flex items-center gap-1"><Bot className="w-3 h-3" /> AI草稿</div>}
                  {msg.subject && <div className="text-[10px] font-semibold mb-1 text-foreground/80">主题: {msg.subject}</div>}
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  <div className="text-[9px] text-muted-foreground mt-1 text-right">{msg.time}</div>
                </div>
              </div>
            ))}

            {/* AI suggestion */}
            {(isGenerating || aiReply) && (
              <div className="glass-panel rounded-xl p-3 glow-orange">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] font-medium text-primary flex items-center gap-1">
                    <Zap className="w-3 h-3" /> AI推荐回复
                    {!isGenerating && <span className="text-muted-foreground ml-1">可信度 {aiConfidence}%</span>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => generateAIReply(selectedId!)} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                      <RefreshCw className="w-3 h-3" /> 换一个
                    </button>
                  </div>
                </div>
                {isGenerating && !aiReply ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> AI正在分析对话并生成回复...
                  </div>
                ) : (
                  <>
                    <div className="text-xs leading-relaxed whitespace-pre-wrap mb-2 text-foreground/90">{aiReply}</div>
                    {isGenerating && <Loader2 className="w-3 h-3 animate-spin text-primary inline" />}
                    {!isGenerating && (
                      <button onClick={handleAdoptReply}
                        className="text-[10px] font-medium bg-primary text-primary-foreground px-3 py-1 rounded-md flex items-center gap-1 hover:opacity-90 transition-opacity">
                        <CheckCheck className="w-3 h-3" /> 采纳回复
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="border-t border-border p-3 md:p-4">
            {isEmail ? (
              <div className="space-y-2">
                <div className="text-[10px] text-muted-foreground flex items-center gap-2 mb-1">
                  <span>收件人: {selectedInquiry.email}</span>
                  {selectedInquiry.subject && <span>· 主题: RE: {selectedInquiry.subject}</span>}
                </div>
                <EmailRichEditor ref={emailEditorRef} placeholder="撰写邮件回复..." />
                <div className="flex items-center justify-between">
                  <div className="text-[9px] text-muted-foreground">支持富文本编辑 · 可添加附件</div>
                  <button onClick={handleSend} className="text-xs font-medium bg-primary text-primary-foreground px-4 py-1.5 rounded-md flex items-center gap-1 hover:opacity-90 transition-opacity">
                    <Send className="w-3 h-3" /> 发送邮件
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 items-end">
                <textarea
                  ref={textareaRef}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={isSocial ? "回复私信..." : "回复消息..."}
                  className="flex-1 bg-secondary rounded-lg px-3 py-2 text-xs outline-none resize-none min-h-[36px] max-h-24 placeholder:text-muted-foreground"
                  rows={1}
                />
                <button onClick={handleSend} className="h-9 px-3 bg-primary text-primary-foreground rounded-lg flex items-center gap-1 text-xs font-medium hover:opacity-90 transition-opacity shrink-0">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={cn("flex-1 flex items-center justify-center", isMobile && "hidden")}>
          <div className="text-center text-muted-foreground">
            <Mail className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <div className="text-sm">选择一条询盘开始对话</div>
            <div className="text-[10px] mt-1">AI助手将自动分析并生成推荐回复</div>
          </div>
        </div>
      )}
    </div>
  );
}
