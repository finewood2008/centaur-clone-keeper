/**
 * Inbox - 非IM询盘中心（独立站、Email、社媒私信）
 * 左侧消息列表 + 右侧对话详情 + AI回复功能
 * 数据源：Local REST API inquiries + messages
 */
import { useState, useRef, useCallback, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Search, Send, Bot, CheckCheck, Zap, RefreshCw, Loader2, ArrowLeft,
  Globe, Mail, Instagram, Facebook, Twitter,
  Clock,
} from "lucide-react";
import EmailRichEditor, { type EmailRichEditorRef } from "@/components/EmailRichEditor";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import ApiKeyBanner from "@/components/ApiKeyBanner";
import { apiFetch } from "@/lib/api-client";
import {
  useInquiries,
  useMessages,
  useSendMessage,
  useUpdateInquiry,
} from "@/hooks/use-inquiries";
import type { Inquiry, Message } from "@/hooks/use-inquiries";
import { useInboxRealtime } from "@/hooks/use-inbox-realtime";

type InquiryChannel = "Email" | "独立站" | "Instagram" | "Facebook" | "Twitter";

const channelConfig: Record<InquiryChannel, { icon: React.ReactNode; color: string; label: string }> = {
  "Email": { icon: <Mail className="w-3 h-3" />, color: "text-blue-400", label: "Email" },
  "独立站": { icon: <Globe className="w-3 h-3" />, color: "text-brand-cyan", label: "独立站" },
  "Instagram": { icon: <Instagram className="w-3 h-3" />, color: "text-pink-400", label: "Instagram" },
  "Facebook": { icon: <Facebook className="w-3 h-3" />, color: "text-blue-500", label: "Facebook" },
  "Twitter": { icon: <Twitter className="w-3 h-3" />, color: "text-sky-400", label: "Twitter" },
};

const channels: (InquiryChannel | "全部")[] = ["全部", "Email", "独立站", "Instagram", "Facebook", "Twitter"];

function formatTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  }
  const diffMs = now.getTime() - d.getTime();
  const day = 86_400_000;
  if (diffMs < 2 * day) return "昨天";
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)}天前`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function getAvatar(inq: Inquiry): string {
  if (inq.avatar) return inq.avatar;
  return inq.name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getChannel(c: string | null | undefined): InquiryChannel {
  const valid: InquiryChannel[] = ["Email", "独立站", "Instagram", "Facebook", "Twitter"];
  return (valid.includes((c ?? "Email") as InquiryChannel) ? c : "Email") as InquiryChannel;
}

export default function Inbox() {
  const isMobile = useIsMobile();
  const { data: inquiries = [], isLoading } = useInquiries();
  const sendMessage = useSendMessage();
  const updateInquiry = useUpdateInquiry();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeChannel, setActiveChannel] = useState<InquiryChannel | "全部">("全部");
  const [messageInput, setMessageInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [aiConfidence, setAiConfidence] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emailEditorRef = useRef<EmailRichEditorRef>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { data: messages = [] } = useMessages(selectedId ?? undefined);

  // 实时订阅：新询盘 / 新消息自动推送
  useInboxRealtime(selectedId);

  const selectedInquiry = useMemo(
    () => inquiries.find((m) => m.id === selectedId) ?? null,
    [inquiries, selectedId]
  );
  const filteredInquiries = useMemo(
    () =>
      activeChannel === "全部"
        ? inquiries
        : inquiries.filter((m) => getChannel(m.channel) === activeChannel),
    [inquiries, activeChannel]
  );

  const channelKey: InquiryChannel | null = selectedInquiry ? getChannel(selectedInquiry.channel) : null;
  const isEmail = channelKey === "Email";
  const isSocial = channelKey === "Instagram" || channelKey === "Facebook" || channelKey === "Twitter";

  const generateAIReply = useCallback(
    async (inquiryId: string) => {
      const inquiry = inquiries.find((m) => m.id === inquiryId);
      if (!inquiry) return;

      const googleApiKey = localStorage.getItem("banrenma_google_api_key");
      if (!googleApiKey) {
        toast({
          title: "需要配置 AI",
          description: "请前往设置 > AI Agent 配置，填入 Google AI API Key",
        });
        return;
      }

      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsGenerating(true);
      setAiReply("");
      setAiConfidence(Math.floor(Math.random() * 10 + 85));

      try {
        // Fetch message history from local API
        const data = await apiFetch<{ messages: any[] }>('/inquiries/' + inquiryId);
        const chatHistory = (data?.messages ?? []).map((m: any) => ({ sender: m.sender, text: m.text }));

        // AI reply generation — placeholder for local mode
        toast({
          title: "AI回复功能",
          description: "AI reply feature coming soon",
        });
        setAiReply("（AI 智能回复功能即将上线，敬请期待）");
        setIsGenerating(false);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("AI reply error:", err);
        toast({ title: "AI回复生成失败", description: err?.message || "请稍后重试", variant: "destructive" });
        setAiReply(null);
        setIsGenerating(false);
      }
    },
    [inquiries]
  );

  const handleSelectInquiry = useCallback(
    (id: string) => {
      setSelectedId(id);
      setMessageInput("");
      setAiReply(null);
      // 标记已读
      const inq = inquiries.find((m) => m.id === id);
      if (inq?.unread) {
        updateInquiry.mutate({ id, unread: false });
      }
      generateAIReply(id);
    },
    [generateAIReply, inquiries, updateInquiry]
  );

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

  const handleSend = useCallback(async () => {
    if (!selectedId) return;
    let text = "";
    let attachmentsCount = 0;

    if (isEmail && emailEditorRef.current) {
      text = emailEditorRef.current.getText().trim();
      if (!text) return;
      attachmentsCount = emailEditorRef.current.getAttachments().length;
    } else {
      text = messageInput.trim();
      if (!text) return;
    }

    try {
      await sendMessage.mutateAsync({
        inquiry_id: selectedId,
        sender: "user",
        text,
      });
      if (isEmail) {
        emailEditorRef.current?.clear();
        toast({
          title: "邮件已发送",
          description: attachmentsCount > 0 ? `包含 ${attachmentsCount} 个附件` : "邮件回复已发送",
        });
      } else {
        setMessageInput("");
        toast({ title: "发送成功", description: "消息已发送" });
      }
    } catch (err: any) {
      toast({ title: "发送失败", description: err?.message || "请稍后重试", variant: "destructive" });
    }
  }, [messageInput, selectedId, isEmail, sendMessage]);

  const chCfg = channelKey ? channelConfig[channelKey] : null;
  const headerTime = formatTime(selectedInquiry?.created_at);

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] -m-3 md:-m-4 lg:-m-6">
      <ApiKeyBanner
        className="px-4 pt-3"
        description="后，询盘 AI 智能回复将自动激活"
      />
      <div className="flex flex-1 min-h-0 gap-0">
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
            {isLoading ? (
              <div className="px-4 py-12 text-center text-xs text-muted-foreground">
                <Loader2 className="w-4 h-4 inline animate-spin mr-2" /> 加载询盘…
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="px-4 py-12 text-center text-xs text-muted-foreground">
                {inquiries.length === 0 ? "暂无询盘数据" : "没有匹配的询盘"}
              </div>
            ) : filteredInquiries.map((inq) => {
              const ch = getChannel(inq.channel);
              const cfg = channelConfig[ch];
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
                    )}>{getAvatar(inq)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-medium truncate">{inq.name}</span>
                        <span className="text-[10px] text-muted-foreground ml-2">{formatTime(inq.created_at)}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mb-0.5">{inq.company ?? ""}</div>
                      {ch === "Email" && inq.subject && (
                        <div className="text-[10px] font-medium text-foreground/80 truncate mb-0.5">{inq.subject}</div>
                      )}
                      <div className="text-[11px] text-muted-foreground truncate">{inq.last_message ?? ""}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn("text-[10px] flex items-center gap-1", cfg.color)}>{cfg.icon} {cfg.label}</span>
                        <span className="text-[10px] text-muted-foreground">AI评分: {inq.ai_score ?? 0}</span>
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
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/15 flex items-center justify-center text-xs md:text-sm font-semibold text-primary shrink-0">{getAvatar(selectedInquiry)}</div>
                <div className="min-w-0">
                  <div className="text-xs md:text-sm font-medium truncate">{selectedInquiry.name} · <span className="text-muted-foreground">{selectedInquiry.company ?? ""}</span></div>
                  <div className={cn("text-[10px] flex items-center gap-1", chCfg.color)}>
                    {chCfg.icon} {chCfg.label} · {headerTime}
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
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 首次联系: {headerTime}</span>
              <span className="pill-badge">
                AI评分: <span className="font-metric font-bold text-primary">{selectedInquiry.ai_score ?? 0}</span>
              </span>
            </div>

            {/* Chat area */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
              {messages.map((msg: Message) => (
                <div key={msg.id} className={cn("flex", msg.sender === "customer" ? "justify-start" : "justify-end")}>
                  <div className={cn("max-w-[85%] md:max-w-[70%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                    msg.sender === "customer" ? "glass-panel text-foreground" : msg.sender === "ai" ? "bg-primary/10 border border-primary/20 text-foreground" : "bg-primary text-primary-foreground"
                  )}>
                    {msg.sender === "ai" && <div className="text-[9px] text-primary mb-1 flex items-center gap-1"><Bot className="w-3 h-3" /> AI草稿</div>}
                    {msg.subject && <div className="text-[10px] font-semibold mb-1 text-foreground/80">主题: {msg.subject}</div>}
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    <div className="text-[9px] text-muted-foreground mt-1 text-right">{formatTime(msg.created_at)}</div>
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
                    <span>收件人: {selectedInquiry.email ?? ""}</span>
                    {selectedInquiry.subject && <span>· 主题: RE: {selectedInquiry.subject}</span>}
                  </div>
                  <EmailRichEditor ref={emailEditorRef} placeholder="撰写邮件回复..." />
                  <div className="flex items-center justify-between">
                    <div className="text-[9px] text-muted-foreground">支持富文本编辑 · 可添加附件</div>
                    <button
                      onClick={handleSend}
                      disabled={sendMessage.isPending}
                      className="text-xs font-medium bg-primary text-primary-foreground px-4 py-1.5 rounded-md flex items-center gap-1 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {sendMessage.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      发送邮件
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
                  <button
                    onClick={handleSend}
                    disabled={sendMessage.isPending}
                    className="h-9 px-3 bg-primary text-primary-foreground rounded-lg flex items-center gap-1 text-xs font-medium hover:opacity-90 transition-opacity shrink-0 disabled:opacity-50"
                  >
                    {sendMessage.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={cn("flex-1 flex items-center justify-center", isMobile && "hidden")}>
            <div className="text-center text-muted-foreground">
              <Mail className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <div className="text-sm">{isLoading ? "加载中…" : "选择一条询盘开始对话"}</div>
              <div className="text-[10px] mt-1">AI助手将自动分析并生成推荐回复</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
