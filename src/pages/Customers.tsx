/**
 * Customers - 客户管理 (本地化CRM)
 */
import { useState } from "react";
import CustomerDistributionMap from "@/components/customers/CustomerDistributionMap";
import {
  Users, Search, Filter, Star, Globe, Mail, Phone,
  Building2, ArrowUpRight, MoreHorizontal, TrendingUp,
  DollarSign, Clock, MessageSquare, Lock, FolderOpen,
  HardDrive, Download, RefreshCw, FileText, ChevronDown,
  ChevronUp, ChevronRight, Sparkles, AlertTriangle,
  Video, FileJson, Folder, File as FileIcon, ExternalLink,
  Shield, X, Pencil, Save, Plus, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Customer {
  id: number; name: string; company: string; country: string;
  email: string; phone: string; tier: "A" | "B" | "C";
  aiScore: number; totalOrders: number; totalValue: string;
  lastContact: string; channels: string[]; status: "active" | "nurturing" | "cold";
  tags?: string[];
}

const customers: Customer[] = [
  { id: 1, name: "John Smith", company: "TechCorp Ltd.", country: "美国", email: "john@techcorp.com", phone: "+1 555-0123", tier: "A", aiScore: 92, totalOrders: 8, totalValue: "$125,000", lastContact: "今天", channels: ["WhatsApp", "Email"], status: "active", tags: ["LED大客户", "长期合作"] },
  { id: 2, name: "Maria Garcia", company: "EuroTrade GmbH", country: "德国", email: "maria@eurotrade.de", phone: "+49 30-12345", tier: "A", aiScore: 85, totalOrders: 5, totalValue: "$89,000", lastContact: "昨天", channels: ["LinkedIn", "Email"], status: "active", tags: ["欧洲分销", "价格敏感"] },
  { id: 3, name: "Ahmed Hassan", company: "MidEast Import Co.", country: "阿联酋", email: "ahmed@mideast.ae", phone: "+971 50-1234", tier: "B", aiScore: 68, totalOrders: 3, totalValue: "$45,000", lastContact: "3天前", channels: ["WhatsApp"], status: "nurturing", tags: ["中东工程"] },
  { id: 4, name: "Yuki Tanaka", company: "Japan Direct Co.", country: "日本", email: "yuki@japandirect.jp", phone: "+81 3-1234", tier: "B", aiScore: 55, totalOrders: 2, totalValue: "$28,000", lastContact: "1周前", channels: ["Email", "阿里巴巴"], status: "nurturing", tags: ["日本市场"] },
  { id: 5, name: "Roberto Silva", company: "Brazil Imports", country: "巴西", email: "roberto@brazilimports.br", phone: "+55 11-1234", tier: "C", aiScore: 38, totalOrders: 1, totalValue: "$8,500", lastContact: "2周前", channels: ["WhatsApp"], status: "cold", tags: ["新客户"] },
  { id: 6, name: "Sarah Johnson", company: "Pacific Trading Inc.", country: "澳大利亚", email: "sarah@pacific.au", phone: "+61 2-1234", tier: "B", aiScore: 62, totalOrders: 2, totalValue: "$32,000", lastContact: "5天前", channels: ["独立站", "Email"], status: "active", tags: ["太平洋区"] },
];

const tierColors: Record<string, string> = {
  A: "bg-primary/15 text-primary border-primary/30",
  B: "bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30",
  C: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: "活跃", color: "text-brand-green" },
  nurturing: { label: "培育中", color: "text-primary" },
  cold: { label: "沉默", color: "text-muted-foreground" },
};

// Mock communication records
const mockCommunications = [
  { id: 1, type: "email" as const, direction: "outbound" as const, time: "2026-03-27 14:30", summary: "发送LED新品报价单，包含5款新型号的FOB价格和MOQ", subject: "LED Bulb New Models Quotation - Q2 2026", filePath: "email-001.json", hasAttachment: true },
  { id: 2, type: "chat" as const, direction: "inbound" as const, time: "2026-03-26 09:15", summary: "客户询问T8灯管的CE认证状态和交货期", subject: "", filePath: "chat-002.json", hasAttachment: false },
  { id: 3, type: "call" as const, direction: "outbound" as const, time: "2026-03-24 16:00", summary: "电话跟进上周报价，客户表示价格有竞争力，需要与采购团队讨论", subject: "", filePath: "call-003.json", hasAttachment: false },
  { id: 4, type: "email" as const, direction: "inbound" as const, time: "2026-03-22 11:45", summary: "客户回复确认对LED灯泡样品满意，要求正式报价500件起订", subject: "Re: Sample Feedback - LED Bulbs", filePath: "email-004.json", hasAttachment: true },
  { id: 5, type: "meeting" as const, direction: "outbound" as const, time: "2026-03-20 10:00", summary: "视频会议演示新品线，讨论Q2合作计划和专属定价方案", subject: "Q2 Partnership Review Meeting", filePath: "meeting-005.json", hasAttachment: true },
  { id: 6, type: "document" as const, direction: "outbound" as const, time: "2026-03-18 15:30", summary: "发送产品认证文件包：CE、RoHS、UL证书", subject: "", filePath: "doc-006.json", hasAttachment: true },
];

const mockDeals = [
  { id: 1, name: "T8灯管500支订单", value: "$15,000", stage: "报价中", probability: 75 },
  { id: 2, name: "LED灯泡定制包装", value: "$8,500", stage: "样品确认", probability: 60 },
  { id: 3, name: "Q2框架协议", value: "$45,000", stage: "洽谈中", probability: 40 },
];

const mockAiInsights = {
  portrait: "高价值B2B采购决策者，注重产品认证和质量稳定性。采购周期约45天，倾向于长期供应商关系。对价格有一定敏感度但更看重交期和售后服务。",
  nextActions: [
    "建议3天内发送Q2独家优惠方案",
    "安排技术团队与客户工程师进行产品参数对接",
    "准备竞品对比分析报告强化我方优势",
  ],
  risks: [
    "客户近期同时联系了2家竞争对手",
    "上次交货延迟3天可能影响信任度",
  ],
};

const commTypeConfig: Record<string, { icon: typeof Mail; label: string; color: string }> = {
  email: { icon: Mail, label: "邮件", color: "text-brand-cyan" },
  chat: { icon: MessageSquare, label: "即时消息", color: "text-brand-green" },
  call: { icon: Phone, label: "通话", color: "text-primary" },
  meeting: { icon: Video, label: "会议", color: "text-purple-400" },
  document: { icon: FileText, label: "文档", color: "text-muted-foreground" },
};

export default function Customers() {
  const [selectedTier, setSelectedTier] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedComm, setExpandedComm] = useState<number | null>(null);
  const [showFileTree, setShowFileTree] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ email: "", phone: "", tier: "" as "A" | "B" | "C", tags: [] as string[], newTag: "" });
  const [showAddComm, setShowAddComm] = useState(false);
  const [communications, setCommunications] = useState(mockCommunications);
  const [commForm, setCommForm] = useState({ type: "email" as "email" | "chat" | "call" | "meeting" | "document", direction: "outbound" as "inbound" | "outbound", subject: "", summary: "" });
  const [deals, setDeals] = useState(mockDeals);
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [dealForm, setDealForm] = useState({ name: "", value: "", stage: "洽谈中", probability: 50 });

  const filtered = customers.filter((c) => {
    const tierMatch = selectedTier === "all" || c.tier === selectedTier;
    const searchMatch = !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.company.toLowerCase().includes(searchQuery.toLowerCase());
    return tierMatch && searchMatch;
  });

  const openCustomer = (c: Customer) => {
    setSelectedCustomer(c);
    setDrawerOpen(true);
    setExpandedComm(null);
    setShowFileTree(false);
    setIsEditing(false);
  };

  const startEditing = () => {
    if (!selectedCustomer) return;
    setEditForm({
      email: selectedCustomer.email,
      phone: selectedCustomer.phone,
      tier: selectedCustomer.tier,
      tags: [...(selectedCustomer.tags || [])],
      newTag: "",
    });
    setIsEditing(true);
  };

  const saveEditing = () => {
    if (!selectedCustomer) return;
    setSelectedCustomer({
      ...selectedCustomer,
      email: editForm.email,
      phone: editForm.phone,
      tier: editForm.tier,
      tags: editForm.tags,
    });
    setIsEditing(false);
    toast.success("客户信息已更新并保存到本地", {
      description: `已同步到 ~/OPC/customers/${custId}/profile.json`,
    });
  };

  const addTag = () => {
    const tag = editForm.newTag.trim();
    if (tag && !editForm.tags.includes(tag)) {
      setEditForm({ ...editForm, tags: [...editForm.tags, tag], newTag: "" });
    }
  };

  const removeTag = (tag: string) => {
    setEditForm({ ...editForm, tags: editForm.tags.filter((t) => t !== tag) });
  };

  const addCommunication = () => {
    if (!commForm.summary.trim()) {
      toast.error("请填写沟通内容摘要");
      return;
    }
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const newId = Math.max(...communications.map((c) => c.id), 0) + 1;
    const typePrefix = commForm.type === "email" ? "email" : commForm.type === "chat" ? "chat" : commForm.type === "call" ? "call" : commForm.type === "meeting" ? "meeting" : "doc";
    const newComm = {
      id: newId,
      type: commForm.type as "email",
      direction: commForm.direction as "outbound",
      time: timeStr,
      summary: commForm.summary,
      subject: commForm.subject,
      filePath: `${typePrefix}-${String(newId).padStart(3, "0")}.json`,
      hasAttachment: false,
    };
    setCommunications([newComm as typeof communications[0], ...communications]);
    setCommForm({ type: "email", direction: "outbound", subject: "", summary: "" });
    setShowAddComm(false);
    toast.success("沟通记录已添加", {
      description: `已保存到本地 ~/OPC/customers/${custId}/communications/${newComm.filePath}`,
    });
  };

  const custId = selectedCustomer ? `CUST-20240315-${String(selectedCustomer.id).padStart(3, "0")}` : "";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-lg">客户管理</h2>
          <p className="text-xs text-muted-foreground">Customer Agent · 360度客户画像与智能分级</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => toast.success("客户数据已导出到 ~/OPC/exports/customers-2026-03-27.xlsx")}>
            <Download className="w-3.5 h-3.5 mr-1" /> 导出数据
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.success("备份已创建: ~/OPC/backups/customers-20260327.zip")}>
            <HardDrive className="w-3.5 h-3.5 mr-1" /> 备份
          </Button>
        </div>
      </div>

      {/* Data Security Banner */}
      <div className="rounded-xl border border-brand-green/30 bg-brand-green/5 px-4 py-3 flex items-center gap-5 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-medium text-brand-green">
          <Lock className="w-3.5 h-3.5" /> 数据完全本地化
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FolderOpen className="w-3.5 h-3.5" />
          <span>本地存储路径:</span>
          <button onClick={() => toast("正在打开文件管理器...")} className="font-mono text-[11px] text-brand-cyan hover:underline">~/OPC/customers</button>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <RefreshCw className="w-3 h-3 text-brand-green" /> 最后同步: 2分钟前
        </div>
        <Button size="sm" variant="ghost" className="h-6 text-[10px] ml-auto" onClick={() => toast("正在打开本地客户数据文件夹...")}>
          <ExternalLink className="w-3 h-3 mr-1" /> 查看本地文件
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "总客户数", value: "156", sub: "↑ 12 本周新增" },
          { label: "A级客户", value: "23", sub: "高价值客户" },
          { label: "客户总价值", value: "$1.2M", sub: "↑ 15% vs 上月" },
          { label: "平均AI评分", value: "67", sub: "/ 100" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
            <div className="text-xl font-display font-bold">{s.value}</div>
            <div className="text-[10px] text-muted-foreground mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Customer Distribution Map */}
      <CustomerDistributionMap />

      {/* Search & Filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="搜索客户名称、公司..." className="pl-8 h-8 text-xs" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => toast("全文搜索将扫描所有本地沟通记录...")}>
          <FolderOpen className="w-3 h-3 mr-1" /> 在本地文件中搜索
        </Button>
      </div>

      {/* Customer table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          {["all", "A", "B", "C"].map((t) => (
            <button key={t} onClick={() => setSelectedTier(t)}
              className={cn("text-xs px-2 py-1 rounded transition-colors",
                selectedTier === t ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >{t === "all" ? "全部" : `${t}级`}</button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-4 py-2 font-medium">客户</th>
                <th className="text-left px-4 py-2 font-medium">国家</th>
                <th className="text-left px-4 py-2 font-medium">等级</th>
                <th className="text-left px-4 py-2 font-medium">AI评分</th>
                <th className="text-left px-4 py-2 font-medium">累计订单</th>
                <th className="text-left px-4 py-2 font-medium">总价值</th>
                <th className="text-left px-4 py-2 font-medium">状态</th>
                <th className="text-left px-4 py-2 font-medium">最后联系</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => {
                const status = statusLabels[c.status];
                return (
                  <tr key={c.id} className="hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => openCustomer(c)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-semibold shrink-0">
                          {c.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <div className="font-medium">{c.name}</div>
                          <div className="text-[10px] text-muted-foreground">{c.company}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.country}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-bold", tierColors[c.tier])}>{c.tier}</span>
                    </td>
                    <td className={cn("px-4 py-3 font-medium font-mono",
                      c.aiScore >= 80 ? "text-primary" : c.aiScore >= 50 ? "text-brand-cyan" : "text-muted-foreground"
                    )}>{c.aiScore}</td>
                    <td className="px-4 py-3">{c.totalOrders}</td>
                    <td className="px-4 py-3 font-medium">{c.totalValue}</td>
                    <td className={cn("px-4 py-3", status.color)}>{status.label}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.lastContact}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0">
          {selectedCustomer && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <SheetHeader className="p-5 border-b border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">
                      {selectedCustomer.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <SheetTitle className="text-sm">{selectedCustomer.name}</SheetTitle>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3" /> {selectedCustomer.company}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-bold", tierColors[isEditing ? editForm.tier : selectedCustomer.tier])}>{isEditing ? editForm.tier : selectedCustomer.tier}级</span>
                    <Badge variant="outline" className="text-[10px] h-4">AI {selectedCustomer.aiScore}</Badge>
                    {!isEditing ? (
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={startEditing}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                    ) : (
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-brand-green" onClick={saveEditing}>
                          <Save className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setIsEditing(false)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto">
                {/* Basic Info */}
                <div className="p-4 border-b border-border space-y-3">
                  {isEditing ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-medium text-muted-foreground">联系方式</label>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
                            <Input className="h-7 text-xs" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} placeholder="邮箱地址" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                            <Input className="h-7 text-xs" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} placeholder="电话号码" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-medium text-muted-foreground">客户等级</label>
                        <Select value={editForm.tier} onValueChange={(v) => setEditForm({ ...editForm, tier: v as "A" | "B" | "C" })}>
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A级 - 核心客户</SelectItem>
                            <SelectItem value="B">B级 - 重要客户</SelectItem>
                            <SelectItem value="C">C级 - 普通客户</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-medium text-muted-foreground">标签</label>
                        <div className="flex gap-1 flex-wrap">
                          {editForm.tags.map((tag) => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded inline-flex items-center gap-1">
                              {tag}
                              <button onClick={() => removeTag(tag)} className="hover:text-destructive"><Trash2 className="w-2.5 h-2.5" /></button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-1">
                          <Input className="h-7 text-xs flex-1" value={editForm.newTag} onChange={(e) => setEditForm({ ...editForm, newTag: e.target.value })} placeholder="添加新标签..." onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} />
                          <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={addTag}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground"><Globe className="w-3 h-3" /> {selectedCustomer.country}</div>
                        <div className="flex items-center gap-1.5 text-muted-foreground"><DollarSign className="w-3 h-3" /> {selectedCustomer.totalValue} 总价值</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground"><Mail className="w-3 h-3" /> {selectedCustomer.email}</div>
                        <div className="flex items-center gap-1.5 text-muted-foreground"><Phone className="w-3 h-3" /> {selectedCustomer.phone}</div>
                        <div className="flex items-center gap-1.5 text-muted-foreground"><Globe className="w-3 h-3" /> {selectedCustomer.country}</div>
                        <div className="flex items-center gap-1.5 text-muted-foreground"><DollarSign className="w-3 h-3" /> {selectedCustomer.totalValue} 总价值</div>
                      </div>
                      {selectedCustomer.tags && (
                        <div className="flex gap-1 flex-wrap">
                          {selectedCustomer.tags.map((tag) => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded">{tag}</span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Communication Timeline */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary" /> 沟通记录
                    </h4>
                    <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => setShowAddComm(!showAddComm)}>
                      <Plus className="w-3 h-3 mr-0.5" /> 新增记录
                    </Button>
                  </div>

                  {/* Add Communication Form */}
                  {showAddComm && (
                    <div className="mb-4 p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-2">
                      <div className="text-[10px] font-semibold text-primary mb-1">新增沟通记录</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-muted-foreground">类型</label>
                          <Select value={commForm.type} onValueChange={(v) => setCommForm({ ...commForm, type: v as typeof commForm.type })}>
                            <SelectTrigger className="h-7 text-xs mt-0.5"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="email">📧 邮件</SelectItem>
                              <SelectItem value="chat">💬 即时消息</SelectItem>
                              <SelectItem value="call">📞 通话</SelectItem>
                              <SelectItem value="meeting">🤝 会议</SelectItem>
                              <SelectItem value="document">📄 文档</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground">方向</label>
                          <Select value={commForm.direction} onValueChange={(v) => setCommForm({ ...commForm, direction: v as "inbound" | "outbound" })}>
                            <SelectTrigger className="h-7 text-xs mt-0.5"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="outbound">→ 发出</SelectItem>
                              <SelectItem value="inbound">← 收到</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {(commForm.type === "email" || commForm.type === "meeting") && (
                        <div>
                          <label className="text-[10px] text-muted-foreground">主题</label>
                          <Input className="h-7 text-xs mt-0.5" value={commForm.subject} onChange={(e) => setCommForm({ ...commForm, subject: e.target.value })} placeholder="邮件/会议主题..." />
                        </div>
                      )}
                      <div>
                        <label className="text-[10px] text-muted-foreground">内容摘要 *</label>
                        <textarea
                          className="w-full mt-0.5 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[60px] resize-none"
                          value={commForm.summary}
                          onChange={(e) => setCommForm({ ...commForm, summary: e.target.value })}
                          placeholder="记录沟通内容要点..."
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setShowAddComm(false)}>取消</Button>
                        <Button size="sm" className="h-6 text-[10px]" onClick={addCommunication}>
                          <Save className="w-3 h-3 mr-0.5" /> 保存
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="relative pl-6">
                    {/* Timeline line */}
                    <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />
                    <div className="space-y-3">
                      {communications.map((comm) => {
                        const config = commTypeConfig[comm.type];
                        const Icon = config.icon;
                        const isExpanded = expandedComm === comm.id;
                        return (
                          <div key={comm.id} className="relative">
                            {/* Timeline dot */}
                            <div className={cn("absolute -left-6 top-2 w-[18px] h-[18px] rounded-full border-2 border-card flex items-center justify-center", comm.direction === "inbound" ? "bg-brand-green/20" : "bg-brand-cyan/20")}>
                              <Icon className={cn("w-2.5 h-2.5", config.color)} />
                            </div>
                            <div className="bg-secondary/30 rounded-lg p-2.5 cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => setExpandedComm(isExpanded ? null : comm.id)}>
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1.5">
                                  <span className={cn("text-[10px] font-medium", config.color)}>{config.label}</span>
                                  <span className="text-[10px] text-muted-foreground">{comm.direction === "inbound" ? "← 收到" : "→ 发出"}</span>
                                  {comm.hasAttachment && <FileText className="w-2.5 h-2.5 text-muted-foreground" />}
                                </div>
                                <span className="text-[10px] text-muted-foreground">{comm.time}</span>
                              </div>
                              {comm.subject && <div className="text-[11px] font-medium mb-0.5">{comm.subject}</div>}
                              <div className="text-[11px] text-muted-foreground">{comm.summary}</div>
                              {isExpanded && (
                                <div className="mt-2 pt-2 border-t border-border">
                                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                                    <FolderOpen className="w-3 h-3" />
                                    ~/OPC/customers/{custId}/communications/{comm.filePath}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Deals & Orders */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-primary" /> 商机与订单
                    </h4>
                    <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => setShowAddDeal(!showAddDeal)}>
                      <Plus className="w-3 h-3 mr-0.5" /> 新建商机
                    </Button>
                  </div>

                  {showAddDeal && (
                    <div className="mb-3 p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-2">
                      <div className="text-[10px] font-semibold text-primary mb-1">新建商机</div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">商机名称 *</label>
                        <Input className="h-7 text-xs mt-0.5" value={dealForm.name} onChange={(e) => setDealForm({ ...dealForm, name: e.target.value })} placeholder="例如：LED灯泡500件订单" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-muted-foreground">金额</label>
                          <Input className="h-7 text-xs mt-0.5" value={dealForm.value} onChange={(e) => setDealForm({ ...dealForm, value: e.target.value })} placeholder="$10,000" />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground">阶段</label>
                          <Select value={dealForm.stage} onValueChange={(v) => setDealForm({ ...dealForm, stage: v })}>
                            <SelectTrigger className="h-7 text-xs mt-0.5"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="洽谈中">洽谈中</SelectItem>
                              <SelectItem value="报价中">报价中</SelectItem>
                              <SelectItem value="样品确认">样品确认</SelectItem>
                              <SelectItem value="合同签署">合同签署</SelectItem>
                              <SelectItem value="已成交">已成交</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">成功率: {dealForm.probability}%</label>
                        <input type="range" min={0} max={100} step={5} value={dealForm.probability} onChange={(e) => setDealForm({ ...dealForm, probability: Number(e.target.value) })} className="w-full h-1.5 mt-1 accent-primary" />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setShowAddDeal(false)}>取消</Button>
                        <Button size="sm" className="h-6 text-[10px]" onClick={() => {
                          if (!dealForm.name.trim()) { toast.error("请填写商机名称"); return; }
                          const newDeal = { id: Math.max(...deals.map(d => d.id), 0) + 1, name: dealForm.name, value: dealForm.value || "$0", stage: dealForm.stage, probability: dealForm.probability };
                          setDeals([...deals, newDeal]);
                          setDealForm({ name: "", value: "", stage: "洽谈中", probability: 50 });
                          setShowAddDeal(false);
                          toast.success("商机已创建", { description: `已保存到 ~/OPC/customers/${custId}/deals/` });
                        }}>
                          <Save className="w-3 h-3 mr-0.5" /> 保存
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {deals.map((deal) => (
                      <div key={deal.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/20 text-xs">
                        <div className="flex-1">
                          <div className="font-medium">{deal.name}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{deal.stage} · 成功率 {deal.probability}%</div>
                        </div>
                        <span className="font-bold text-primary">{deal.value}</span>
                        <Progress value={deal.probability} className="w-16 h-1" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Insights */}
                <div className="p-4 border-b border-border">
                  <h4 className="text-xs font-semibold mb-3 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-primary" /> AI 洞察
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] text-muted-foreground mb-1">客户画像</div>
                      <div className="text-[11px] leading-relaxed text-muted-foreground bg-secondary/20 rounded-lg p-2.5">{mockAiInsights.portrait}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground mb-1">推荐行动</div>
                      <div className="space-y-1">
                        {mockAiInsights.nextActions.map((a, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-[11px]">
                            <span className="text-brand-green font-bold shrink-0">→</span>
                            <span className="text-muted-foreground">{a}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground mb-1">风险提示</div>
                      <div className="space-y-1">
                        {mockAiInsights.risks.map((r, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-[11px]">
                            <AlertTriangle className="w-3 h-3 text-destructive shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Local File Structure */}
                <div className="p-4">
                  <button className="flex items-center gap-1.5 text-xs font-semibold w-full" onClick={() => setShowFileTree(!showFileTree)}>
                    <Folder className="w-3.5 h-3.5 text-primary" />
                    本地存储结构
                    {showFileTree ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
                  </button>
                  {showFileTree && (
                    <div className="mt-3 bg-secondary/20 rounded-lg p-3 font-mono text-[10px] text-muted-foreground space-y-0.5">
                      <div className="flex items-center gap-1 text-foreground"><Folder className="w-3 h-3 text-primary" /> ~/OPC/customers/</div>
                      <div className="pl-4 flex items-center gap-1 text-foreground"><Folder className="w-3 h-3 text-primary" /> {custId}/</div>
                      <div className="pl-8 flex items-center gap-1"><FileJson className="w-3 h-3" /> profile.json <span className="text-muted-foreground/60">（客户基本信息）</span></div>
                      <div className="pl-8 flex items-center gap-1 text-foreground"><Folder className="w-3 h-3 text-primary" /> communications/</div>
                      <div className="pl-12 flex items-center gap-1"><Mail className="w-3 h-3 text-brand-cyan" /> 2026-03-27-email-001.json</div>
                      <div className="pl-12 flex items-center gap-1"><MessageSquare className="w-3 h-3 text-brand-green" /> 2026-03-26-chat-002.json</div>
                      <div className="pl-12 flex items-center gap-1"><Phone className="w-3 h-3 text-primary" /> 2026-03-24-call-003.json</div>
                      <div className="pl-12 flex items-center gap-1 text-muted-foreground/50">... 更多文件</div>
                      <div className="pl-8 flex items-center gap-1 text-foreground"><Folder className="w-3 h-3 text-primary" /> documents/</div>
                      <div className="pl-8 flex items-center gap-1 text-foreground"><Folder className="w-3 h-3 text-primary" /> orders/</div>
                      <div className="pl-8 flex items-center gap-1"><FileJson className="w-3 h-3" /> ai-insights.json <span className="text-muted-foreground/60">（AI分析结果）</span></div>
                      <div className="mt-2 pt-2 border-t border-border">
                        <Button size="sm" variant="ghost" className="h-5 text-[10px] px-1.5" onClick={() => toast("正在打开 Finder...")}>
                          <ExternalLink className="w-2.5 h-2.5 mr-1" /> 在文件管理器中打开
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="mt-3 text-[10px] text-muted-foreground flex items-center gap-1">
                    <Shield className="w-3 h-3 text-brand-green" />
                    该客户的所有数据已保存在本地电脑，您可以随时查看和备份
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
