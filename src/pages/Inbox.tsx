/**
 * Inbox - 非IM询盘中心（独立站、Email、社媒私信）
 * 左侧消息列表 + 右侧对话详情 + AI回复功能
 */
import { useState, useRef, useCallback } from "react";
import {
  Search, Send, Bot, CheckCheck, Zap, RefreshCw, Loader2,
  Globe, Mail, Instagram, Facebook, Twitter, Reply, Forward,
  Paperclip, Clock, User,
} from "lucide-react";
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
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeChannel, setActiveChannel] = useState<InquiryChannel | "全部">("全部");
  const [messageInput, setMessageInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [aiConfidence, setAiConfidence] = useState(0);
  const [conversations, setConversations] = useState<Record<number, ChatMessage[]>>(mockConversations);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedInquiry = inquiries.find((m) => m.id === selectedId);
  const filteredInquiries = activeChannel === "全部" ? inquiries : inquiries.filter((m) => m.channel === activeChannel);
  const currentChat = selectedId ? (conversations[selectedId] || []) : [];

  const generateAIReply = useCallback(async (inquiryId: number) => {
    const inquiry = inquiries.find((m) => m.id === inquiryId);
    if (!inquiry) return;
    setIsGenerating(true);
    setAiReply(null);
    try {
      const chatHistory = (conversations[inquiryId] || []).map((m) => ({ sender: m.sender, text: m.text }));
      const { data, error } = await supabase.functions.invoke("generate-reply", {
        body: { customerName: inquiry.name, company: inquiry.company, channel: inquiry.channel, messages: chatHistory, aiScore: inquiry.aiScore },
      });
      if (error) throw error;
      setAiReply(data.reply);
      setAiConfidence(data.confidence || 90);
    } catch (err: any) {
      console.error("AI reply error:", err);
      toast({ title: "AI回复生成失败", description: err?.message || "请稍后重试", variant: "destructive" });
    } finally {
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
    if (aiReply) { setMessageInput(aiReply); setAiReply(null); setTimeout(() => textareaRef.current?.focus(), 50); }
  }, [aiReply]);

  const handleSend = useCallback(() => {
    if (!messageInput.trim() || !selectedId) return;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    setConversations((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), { id: Date.now(), sender: "user", time: timeStr, text: messageInput.trim() }],
    }));
    setMessageInput("");
    toast({ title: "发送成功", description: selectedInquiry?.channel === "Email" ? "邮件已发送" : "消息已发送" });
  }, [messageInput, selectedId, selectedInquiry]);

  const chCfg = selectedInquiry ? channelConfig[selectedInquiry.channel] : null;
  const isEmail = selectedInquiry?.channel === "Email";
  const isSocial = selectedInquiry?.channel === "Instagram" || selectedInquiry?.channel === "Facebook" || selectedInquiry?.channel === "Twitter";
  const isWebsite = selectedInquiry?.channel === "独立站";

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-0 -m-4 lg:-m-6">
      {/* Left: Inquiry list */}
      <div className="w-80 lg:w-96 border-r border-border flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-base">询盘中心</h2>
            <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">
              {inquiries.filter((m) => m.unread).length} 未读
            </span>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input type="text" placeholder="搜索客户、公司..." className="w-full h-8 bg-secondary rounded-md pl-8 pr-3 text-xs outline-none placeholder:text-muted-foreground" />
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
                  selectedId === inq.id ? "bg-secondary" : "hover:bg-secondary/50",
                  inq.unread && "bg-secondary/30"
                )}
              >
                {selectedId === inq.id && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />}
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
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-semibold text-primary">{selectedInquiry.avatar}</div>
              <div>
                <div className="text-sm font-medium">{selectedInquiry.name} · <span className="text-muted-foreground">{selectedInquiry.company}</span></div>
                <div className={cn("text-[10px] flex items-center gap-1", chCfg.color)}>
                  {chCfg.icon} {chCfg.label} · 最后活跃: {selectedInquiry.time}
                </div>
              </div>
            </div>
            <button className="text-xs bg-secondary text-foreground px-3 py-1.5 rounded-md hover:bg-secondary/80 transition-colors flex items-center gap-1.5">
              <Bot className="w-3 h-3" /> AI分析
            </button>
          </div>

          {/* Meta bar */}
          <div className="text-[10px] px-4 py-2 border-b border-border bg-secondary/30 flex items-center gap-4 text-muted-foreground">
            {selectedInquiry.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {selectedInquiry.email}</span>}
            {!selectedInquiry.email && <span className="flex items-center gap-1"><User className="w-3 h-3" /> 社媒私信</span>}
            <span className="ml-auto">AI评分: <span className="text-primary font-medium">{selectedInquiry.aiScore}/100</span></span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {currentChat.map((msg) => {
              // Email style
              if (isEmail) {
                const isIncoming = msg.sender === "customer";
                return (
                  <div key={msg.id} className={cn(
                    "rounded-lg border overflow-hidden",
                    isIncoming ? "border-border bg-secondary/30" : "border-brand-cyan/20 bg-brand-cyan/5"
                  )}>
                    {/* Email header */}
                    <div className="px-4 py-2.5 border-b border-border/50 bg-secondary/50">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold",
                            isIncoming ? "bg-secondary text-muted-foreground" : "bg-brand-cyan/20 text-brand-cyan"
                          )}>{isIncoming ? selectedInquiry.avatar : "我"}</div>
                          <span className="text-xs font-medium">{isIncoming ? selectedInquiry.name : "我"}</span>
                          {!isIncoming && msg.aiGenerated && (
                            <span className="text-[9px] bg-brand-cyan/15 text-brand-cyan px-1.5 py-0.5 rounded">AI自动回复</span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                      </div>
                      {msg.subject && <div className="text-[11px] font-medium text-foreground/80">{msg.subject}</div>}
                      {isIncoming && selectedInquiry.email && (
                        <div className="text-[10px] text-muted-foreground mt-0.5">From: {selectedInquiry.email}</div>
                      )}
                    </div>
                    {/* Email body */}
                    <div className="px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap text-foreground/90">{msg.text}</div>
                    {/* Email actions */}
                    {isIncoming && (
                      <div className="px-4 py-2 border-t border-border/50 flex gap-3">
                        <button className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"><Reply className="w-3 h-3" /> 回复</button>
                        <button className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"><Forward className="w-3 h-3" /> 转发</button>
                      </div>
                    )}
                  </div>
                );
              }

              // Social DM style
              if (isSocial) {
                const isIncoming = msg.sender === "customer";
                return (
                  <div key={msg.id} className={cn("flex", isIncoming ? "justify-start" : "justify-end")}>
                    <div className="max-w-[75%]">
                      {!isIncoming && msg.aiGenerated && (
                        <div className="flex items-center gap-1 mb-1 justify-end">
                          <Bot className="w-3 h-3 text-brand-cyan" /><span className="text-[10px] text-brand-cyan">AI自动回复</span>
                        </div>
                      )}
                      <div className={cn("rounded-2xl px-3.5 py-2 text-xs leading-relaxed",
                        isIncoming
                          ? "bg-secondary text-foreground rounded-bl-sm"
                          : "bg-gradient-to-r from-primary/80 to-primary text-primary-foreground rounded-br-sm"
                      )}>{msg.text}</div>
                      <div className={cn("text-[10px] text-muted-foreground mt-1 flex items-center gap-1", !isIncoming && "justify-end")}>
                        {msg.time}
                        {!isIncoming && <CheckCheck className="w-3 h-3 text-brand-cyan" />}
                      </div>
                    </div>
                  </div>
                );
              }

              // Website inquiry style (form-like)
              if (isWebsite) {
                const isIncoming = msg.sender === "customer";
                if (isIncoming) {
                  return (
                    <div key={msg.id} className="rounded-lg border border-border bg-secondary/20 overflow-hidden">
                      <div className="px-4 py-2 border-b border-border/50 bg-secondary/40 flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-brand-cyan" />
                        <span className="text-[11px] font-medium">独立站询盘</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">{msg.time}</span>
                      </div>
                      <div className="px-4 py-3 space-y-2">
                        <div className="flex gap-2 text-[11px]">
                          <span className="text-muted-foreground w-12 shrink-0">客户:</span>
                          <span className="text-foreground">{selectedInquiry.name} ({selectedInquiry.company})</span>
                        </div>
                        {selectedInquiry.email && (
                          <div className="flex gap-2 text-[11px]">
                            <span className="text-muted-foreground w-12 shrink-0">邮箱:</span>
                            <span className="text-foreground">{selectedInquiry.email}</span>
                          </div>
                        )}
                        <div className="flex gap-2 text-[11px]">
                          <span className="text-muted-foreground w-12 shrink-0">内容:</span>
                          <span className="text-foreground leading-relaxed">{msg.text}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[70%]">
                      {msg.aiGenerated && (
                        <div className="flex items-center gap-1 mb-1 justify-end">
                          <Bot className="w-3 h-3 text-brand-cyan" /><span className="text-[10px] text-brand-cyan">AI自动回复</span>
                        </div>
                      )}
                      <div className="rounded-lg px-3 py-2 text-xs leading-relaxed bg-primary/10 text-foreground border border-primary/20 whitespace-pre-wrap">{msg.text}</div>
                      <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 justify-end">
                        {msg.time} <CheckCheck className="w-3 h-3 text-brand-cyan" />
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })}

            {/* AI Generating */}
            {isGenerating && (
              <div className="border border-primary/20 rounded-lg p-4 bg-primary/5 animate-pulse">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  <span className="text-xs font-medium text-primary">AI正在分析{isEmail ? "邮件" : "询盘"}并生成回复建议...</span>
                </div>
                <div className="mt-2 space-y-2">
                  <div className="h-3 bg-primary/10 rounded w-full" />
                  <div className="h-3 bg-primary/10 rounded w-4/5" />
                  <div className="h-3 bg-primary/10 rounded w-3/5" />
                </div>
              </div>
            )}

            {/* AI Reply */}
            {!isGenerating && aiReply && (
              <div className="border border-primary/20 rounded-lg p-3 bg-primary/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-medium text-primary">AI建议回复</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => generateAIReply(selectedId!)}
                      className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" /> 重新生成
                    </button>
                    <button onClick={handleAdoptReply}
                      className="text-[10px] bg-primary text-primary-foreground px-2 py-1 rounded hover:opacity-90 font-medium">采用此回复</button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-muted-foreground">置信度</span>
                  <Progress value={aiConfidence} className="h-1.5 flex-1" />
                  <span className="text-[10px] font-medium text-primary">{aiConfidence}%</span>
                </div>
                <div className="text-[11px] text-muted-foreground whitespace-pre-wrap leading-relaxed">{aiReply}</div>
              </div>
            )}
          </div>

          {/* Compose area */}
          <div className="p-4 border-t border-border">
            {isEmail && (
              <div className="flex items-center gap-3 mb-2 text-[10px] text-muted-foreground">
                <span>收件人: {selectedInquiry.email}</span>
                <button className="flex items-center gap-1 hover:text-foreground"><Paperclip className="w-3 h-3" /> 附件</button>
              </div>
            )}
            <div className="flex gap-2">
              <textarea
                ref={textareaRef}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={isEmail ? "撰写邮件回复..." : isSocial ? "回复私信..." : "输入回复内容..."}
                className="flex-1 bg-secondary rounded-lg px-3 py-2 text-xs outline-none placeholder:text-muted-foreground resize-none min-h-[60px]"
                rows={isEmail ? 4 : 2}
              />
              <button onClick={handleSend} disabled={!messageInput.trim()}
                className="self-end w-9 h-9 bg-primary text-primary-foreground rounded-lg flex items-center justify-center hover:opacity-90 shrink-0 disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">选择一条询盘查看详情</div>
      )}
    </div>
  );
}
