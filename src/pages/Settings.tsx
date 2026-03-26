/**
 * Settings - 系统设置页面，包含账户、系统、AI配置、数据隐私、集成、团队、帮助、高级设置
 */
import { useState } from "react";
import {
  User, Settings as SettingsIcon, Bot, Shield, Link2, Users, HelpCircle, Wrench,
  Globe, Palette, Bell, HardDrive, ChevronRight, Check, Trash2, RotateCcw, LogOut,
  Mail, MessageSquare, Database, Key, AlertTriangle, BookOpen, Video, MessageCircle,
  Bug, FlaskConical, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const sections = [
  { key: "account", label: "账户信息", icon: User },
  { key: "system", label: "系统设置", icon: SettingsIcon },
  { key: "ai", label: "AI Agent 配置", icon: Bot },
  { key: "privacy", label: "数据与隐私", icon: Shield },
  { key: "integrations", label: "集成与连接", icon: Link2 },
  { key: "team", label: "团队与权限", icon: Users },
  { key: "help", label: "帮助与支持", icon: HelpCircle },
  { key: "advanced", label: "高级设置", icon: Wrench },
] as const;

type SectionKey = (typeof sections)[number]["key"];

export default function Settings() {
  const [active, setActive] = useState<SectionKey>("account");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">设置</h1>
        <p className="text-xs text-muted-foreground">管理您的账户、系统和 AI Agent 配置</p>
      </div>

      <div className="flex gap-4">
        {/* Left nav */}
        <div className="w-48 shrink-0 space-y-0.5">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-colors text-left",
                active === s.key
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <s.icon className="w-3.5 h-3.5" />
              {s.label}
            </button>
          ))}
          <div className="my-2 border-t border-border" />
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-destructive hover:bg-destructive/10 transition-colors text-left">
            <LogOut className="w-3.5 h-3.5" />
            退出登录
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {active === "account" && <AccountSection />}
          {active === "system" && <SystemSection />}
          {active === "ai" && <AISection />}
          {active === "privacy" && <PrivacySection />}
          {active === "integrations" && <IntegrationsSection />}
          {active === "team" && <TeamSection />}
          {active === "help" && <HelpSection />}
          {active === "advanced" && <AdvancedSection />}
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div>
        <div className="text-xs font-medium">{label}</div>
        {desc && <div className="text-[10px] text-muted-foreground">{desc}</div>}
      </div>
      {children}
    </div>
  );
}

/* === Account === */
function AccountSection() {
  return (
    <>
      <SectionCard title="账户信息" icon={User}>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">嘉</div>
            <div>
              <div className="font-semibold text-sm">嘉木</div>
              <div className="text-muted-foreground">jiamu@example.com</div>
            </div>
          </div>
          <SettingRow label="公司" desc="半人马AI"><span className="text-xs text-muted-foreground">编辑</span></SettingRow>
          <SettingRow label="手机" desc="+86 138****1234"><span className="text-xs text-muted-foreground">修改</span></SettingRow>
        </div>
      </SectionCard>
      <SectionCard title="套餐信息" icon={SettingsIcon}>
        <div className="space-y-2">
          <SettingRow label="当前套餐"><Badge className="text-[10px]">专业版</Badge></SettingRow>
          <SettingRow label="到期时间"><span className="text-xs">2026-12-31</span></SettingRow>
          <SettingRow label="Agent 配额"><span className="text-xs">7 / 10 个</span></SettingRow>
          <SettingRow label="存储空间">
            <div className="flex items-center gap-2">
              <Progress value={5.3} max={100} className="w-20 h-1.5" />
              <span className="text-[10px] text-muted-foreground">5.3 / 100 GB</span>
            </div>
          </SettingRow>
        </div>
        <button className="mt-3 text-xs text-primary hover:underline">升级套餐 →</button>
      </SectionCard>
    </>
  );
}

/* === System === */
function SystemSection() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({ desktop: true, sound: true, email: true, wechat: false });

  return (
    <>
      <SectionCard title="语言与区域" icon={Globe}>
        <div className="space-y-2">
          <SettingRow label="界面语言">
            <Select defaultValue="zh"><SelectTrigger className="w-32 h-7 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="zh">简体中文</SelectItem><SelectItem value="en">English</SelectItem></SelectContent></Select>
          </SettingRow>
          <SettingRow label="时区">
            <Select defaultValue="shanghai"><SelectTrigger className="w-40 h-7 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="shanghai">Asia/Shanghai</SelectItem><SelectItem value="tokyo">Asia/Tokyo</SelectItem><SelectItem value="utc">UTC</SelectItem></SelectContent></Select>
          </SettingRow>
          <SettingRow label="日期格式">
            <Select defaultValue="ymd"><SelectTrigger className="w-32 h-7 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ymd">YYYY-MM-DD</SelectItem><SelectItem value="dmy">DD/MM/YYYY</SelectItem><SelectItem value="mdy">MM/DD/YYYY</SelectItem></SelectContent></Select>
          </SettingRow>
        </div>
      </SectionCard>
      <SectionCard title="外观设置" icon={Palette}>
        <div className="space-y-2">
          <SettingRow label="主题">
            <div className="flex gap-1.5">
              {[{ k: "dark" as const, l: "深色" }, { k: "light" as const, l: "浅色" }, { k: "auto" as const, l: "跟随系统" }].map((t) => (
                <button key={t.k} onClick={() => setTheme(t.k)} className={cn("text-[10px] px-2 py-1 rounded border transition-colors", theme === t.k ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground")}>{t.l}</button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label="紧凑模式"><Switch /></SettingRow>
        </div>
      </SectionCard>
      <SectionCard title="通知设置" icon={Bell}>
        <div className="space-y-2">
          <SettingRow label="桌面通知"><Switch checked={notifications.desktop} onCheckedChange={(v) => setNotifications({ ...notifications, desktop: v })} /></SettingRow>
          <SettingRow label="声音提示"><Switch checked={notifications.sound} onCheckedChange={(v) => setNotifications({ ...notifications, sound: v })} /></SettingRow>
          <SettingRow label="邮件通知"><Switch checked={notifications.email} onCheckedChange={(v) => setNotifications({ ...notifications, email: v })} /></SettingRow>
          <SettingRow label="微信通知"><Switch checked={notifications.wechat} onCheckedChange={(v) => setNotifications({ ...notifications, wechat: v })} /></SettingRow>
        </div>
      </SectionCard>
      <SectionCard title="数据设置" icon={HardDrive}>
        <div className="space-y-2">
          <SettingRow label="本地存储路径"><span className="text-[10px] font-mono text-muted-foreground">~/OPC/</span></SettingRow>
          <SettingRow label="自动备份"><span className="text-xs">每天 23:00</span></SettingRow>
          <SettingRow label="备份保留"><span className="text-xs">7 天</span></SettingRow>
          <SettingRow label="数据加密"><Switch defaultChecked /></SettingRow>
        </div>
      </SectionCard>
    </>
  );
}

/* === AI Config === */
function AISection() {
  const [speed, setSpeed] = useState("balanced");
  const [creativity, setCreativity] = useState([50]);
  const [expertise, setExpertise] = useState([70]);

  return (
    <>
      <SectionCard title="默认 AI 模型" icon={Bot}>
        <div className="space-y-2">
          <SettingRow label="主模型">
            <Select defaultValue="gpt4"><SelectTrigger className="w-36 h-7 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="gpt4">GPT-4</SelectItem><SelectItem value="gpt5">GPT-5</SelectItem><SelectItem value="gemini">Gemini 2.5 Pro</SelectItem></SelectContent></Select>
          </SettingRow>
          <SettingRow label="备用模型">
            <Select defaultValue="claude"><SelectTrigger className="w-36 h-7 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="claude">Claude 3</SelectItem><SelectItem value="gemini-flash">Gemini Flash</SelectItem></SelectContent></Select>
          </SettingRow>
          <SettingRow label="本地模型"><Switch /></SettingRow>
        </div>
      </SectionCard>
      <SectionCard title="Agent 行为设置" icon={SettingsIcon}>
        <div className="space-y-4">
          <div>
            <Label className="text-xs">响应速度</Label>
            <div className="flex gap-1.5 mt-1.5">
              {[{ k: "fast", l: "快速" }, { k: "balanced", l: "平衡" }, { k: "precise", l: "精准" }].map((s) => (
                <button key={s.k} onClick={() => setSpeed(s.k)} className={cn("flex-1 text-[10px] py-1.5 rounded border transition-colors", speed === s.k ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}>{s.l}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1.5"><Label className="text-xs">创造性</Label><span className="text-[10px] text-muted-foreground">{creativity[0]}%</span></div>
            <Slider value={creativity} onValueChange={setCreativity} max={100} step={5} />
          </div>
          <div>
            <div className="flex justify-between mb-1.5"><Label className="text-xs">专业程度</Label><span className="text-[10px] text-muted-foreground">{expertise[0]}%</span></div>
            <Slider value={expertise} onValueChange={setExpertise} max={100} step={5} />
          </div>
        </div>
      </SectionCard>
      <SectionCard title="安全设置" icon={Shield}>
        <div className="space-y-2">
          <SettingRow label="敏感信息过滤"><Checkbox defaultChecked /></SettingRow>
          <SettingRow label="内容审核"><Checkbox defaultChecked /></SettingRow>
          <SettingRow label="操作确认(删除/发送)"><Checkbox defaultChecked /></SettingRow>
        </div>
      </SectionCard>
      <SectionCard title="使用限制" icon={Bot}>
        <div className="space-y-2">
          <SettingRow label="每日调用上限"><span className="text-xs font-medium">1,000 次</span></SettingRow>
          <SettingRow label="单次Token上限"><span className="text-xs font-medium">4,000</span></SettingRow>
          <SettingRow label="并发Agent数"><span className="text-xs font-medium">10 个</span></SettingRow>
        </div>
      </SectionCard>
    </>
  );
}

/* === Privacy === */
function PrivacySection() {
  return (
    <>
      <SectionCard title="数据安全" icon={Shield}>
        <div className="space-y-2">
          <SettingRow label="数据存储"><Badge variant="secondary" className="text-[10px]">100% 本地</Badge></SettingRow>
          <SettingRow label="加密状态"><span className="text-xs text-brand-green">✅ 已启用</span></SettingRow>
          <SettingRow label="备份状态"><span className="text-xs text-brand-green">✅ 正常</span></SettingRow>
        </div>
      </SectionCard>
      <SectionCard title="数据使用情况" icon={Database}>
        <div className="space-y-2">
          {[
            { label: "客户数据", size: "1.2 GB" },
            { label: "邮件数据", size: "2.3 GB" },
            { label: "文档数据", size: "1.8 GB" },
          ].map((d) => (
            <SettingRow key={d.label} label={d.label}><span className="text-xs">{d.size}</span></SettingRow>
          ))}
          <div className="pt-2">
            <div className="flex justify-between text-[10px] mb-1"><span className="text-muted-foreground">总计</span><span>5.3 GB / 100 GB</span></div>
            <Progress value={5.3} className="h-1.5" />
          </div>
        </div>
      </SectionCard>
      <SectionCard title="数据管理" icon={HardDrive}>
        <div className="flex flex-wrap gap-2">
          {["📤 导出所有数据", "💾 立即备份", "🔄 恢复数据", "🗑️ 清理缓存"].map((a) => (
            <button key={a} onClick={() => toast.info("操作已触发")} className="text-[11px] px-3 py-1.5 rounded-md border border-border hover:bg-secondary transition-colors">{a}</button>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="隐私设置" icon={Shield}>
        <div className="space-y-2">
          <SettingRow label="匿名化使用统计"><Checkbox defaultChecked /></SettingRow>
          <SettingRow label="参与产品改进计划"><Checkbox /></SettingRow>
          <SettingRow label="敏感数据本地加密"><Checkbox defaultChecked /></SettingRow>
        </div>
      </SectionCard>
    </>
  );
}

/* === Integrations === */
function IntegrationsSection() {
  const integrations = [
    { group: "邮箱集成", icon: Mail, items: [{ name: "Gmail", connected: true }, { name: "Outlook", connected: false }] },
    { group: "即时通讯", icon: MessageSquare, items: [{ name: "企业微信", connected: true }, { name: "钉钉", connected: false }, { name: "Slack", connected: false }] },
    { group: "数据源", icon: Database, items: [{ name: "CRM系统", connected: false }, { name: "ERP系统", connected: false }, { name: "电商平台", connected: false }] },
    { group: "API 密钥", icon: Key, items: [{ name: "OpenAI", connected: true }, { name: "Anthropic", connected: true }] },
  ];

  return (
    <>
      {integrations.map((g) => (
        <SectionCard key={g.group} title={g.group} icon={g.icon}>
          <div className="space-y-2">
            {g.items.map((item) => (
              <SettingRow key={item.name} label={item.name}>
                {item.connected ? (
                  <Badge variant="secondary" className="text-[10px] bg-brand-green/10 text-brand-green">✅ 已连接</Badge>
                ) : (
                  <button className="text-[10px] px-2 py-1 rounded border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">连接</button>
                )}
              </SettingRow>
            ))}
          </div>
        </SectionCard>
      ))}
    </>
  );
}

/* === Team === */
function TeamSection() {
  const members = [
    { name: "嘉木", role: "管理员" },
    { name: "张三", role: "成员" },
    { name: "李四", role: "成员" },
  ];

  return (
    <>
      <SectionCard title="团队成员" icon={Users}>
        <div className="text-[10px] text-muted-foreground mb-2">3 / 10 人</div>
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.name} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{m.name[0]}</div>
                <span className="text-xs">{m.name}</span>
              </div>
              <Badge variant="secondary" className="text-[9px]">{m.role}</Badge>
            </div>
          ))}
        </div>
        <button className="mt-3 text-xs text-primary hover:underline">+ 邀请成员</button>
      </SectionCard>
      <SectionCard title="权限管理" icon={Shield}>
        <div className="space-y-2">
          {["数据访问权限", "Agent 配置权限", "导出数据权限"].map((p) => (
            <SettingRow key={p} label={p}><ChevronRight className="w-3 h-3 text-muted-foreground" /></SettingRow>
          ))}
        </div>
      </SectionCard>
    </>
  );
}

/* === Help === */
function HelpSection() {
  return (
    <>
      <SectionCard title="使用指南" icon={BookOpen}>
        <div className="space-y-2">
          {["快速入门教程", "功能说明文档", "视频教程", "常见问题 FAQ"].map((item) => (
            <button key={item} className="w-full flex items-center justify-between py-1.5 text-xs text-muted-foreground hover:text-foreground border-b border-border last:border-0 transition-colors">
              {item}
              <ExternalLink className="w-3 h-3" />
            </button>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="联系我们" icon={MessageCircle}>
        <div className="space-y-2">
          {["在线客服", "提交工单", "反馈建议", "加入社区"].map((item) => (
            <button key={item} className="w-full flex items-center justify-between py-1.5 text-xs text-muted-foreground hover:text-foreground border-b border-border last:border-0 transition-colors">
              {item}
              <ChevronRight className="w-3 h-3" />
            </button>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="关于" icon={HelpCircle}>
        <div className="space-y-2">
          <SettingRow label="版本"><span className="text-xs font-mono">v1.2.3</span></SettingRow>
          <SettingRow label="更新日志"><ChevronRight className="w-3 h-3 text-muted-foreground" /></SettingRow>
        </div>
      </SectionCard>
    </>
  );
}

/* === Advanced === */
function AdvancedSection() {
  return (
    <>
      <SectionCard title="开发者选项" icon={Bug}>
        <div className="space-y-2">
          <SettingRow label="启用调试模式"><Checkbox defaultChecked /></SettingRow>
          <SettingRow label="显示API日志"><Checkbox defaultChecked /></SettingRow>
          <SettingRow label="性能分析工具"><Checkbox /></SettingRow>
        </div>
      </SectionCard>
      <SectionCard title="实验性功能" icon={FlaskConical}>
        <div className="space-y-2">
          <SettingRow label="新版产品推荐算法"><Checkbox defaultChecked /></SettingRow>
          <SettingRow label="多语言自动翻译"><Checkbox /></SettingRow>
          <SettingRow label="语音交互"><Checkbox /></SettingRow>
        </div>
      </SectionCard>
      <SectionCard title="危险操作" icon={AlertTriangle}>
        <div className="space-y-2 pt-1">
          {[
            { label: "🗑️ 清空所有数据", danger: true },
            { label: "🔄 重置为出厂设置", danger: true },
            { label: "❌ 注销账户", danger: true },
          ].map((a) => (
            <button key={a.label} onClick={() => toast.error("该操作需要二次确认")} className="w-full text-left text-xs px-3 py-2 rounded-md border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors">{a.label}</button>
          ))}
        </div>
      </SectionCard>
    </>
  );
}
