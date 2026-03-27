/**
 * ContentCreate - 内容创作（4步流程）
 * Step 1: 选择素材 → Step 2: AI生成文案 → Step 3: 多平台预览 → Step 4: 发布设置
 */
import { useState, useCallback } from "react";
import {
  Image as ImageIcon, Plus, Sparkles, Check, ChevronRight, ChevronLeft,
  Linkedin, Facebook, Instagram, Eye, Heart, MessageSquare, Share2,
  CalendarDays, Clock, Send, Loader2, RefreshCw, Save, Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const sampleImages = [
  { id: "1", src: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=300&h=300&fit=crop", name: "LED灯A" },
  { id: "2", src: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=300&h=300&fit=crop", name: "LED灯B" },
  { id: "3", src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=300&fit=crop", name: "工厂外景" },
  { id: "4", src: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=300&h=300&fit=crop", name: "生产线" },
  { id: "5", src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&h=300&fit=crop", name: "团队" },
  { id: "6", src: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=300&h=300&fit=crop", name: "客户来访" },
];

const themes = ["新品发布", "行业洞察", "客户案例", "公司动态", "节日营销", "自定义"];
const styles = ["专业严谨", "轻松活泼", "故事化叙述"];

const mockCaptions: Record<string, string> = {
  "新品发布": "🎉 新品上市！\n\n我们很高兴向大家介绍最新推出的LED智能灯系列！\n\n✨ 亮点：\n• 节能高达60%，环保更省钱\n• 智能调光，满足不同场景需求\n• 寿命长达50,000小时\n• 通过CE/UL/RoHS国际认证\n\n无论是商业空间还是家庭照明，我们都能提供完美解决方案。\n\n📩 立即联系我们获取报价！\n\n#LED #智能照明 #节能环保 #B2B",
  "行业洞察": "📊 2026年LED照明行业趋势分析\n\n根据最新市场数据，全球LED照明市场预计将在2026年达到1,500亿美元规模。\n\n🔑 关键趋势：\n1. 智能照明系统需求激增\n2. 可持续发展推动绿色照明\n3. 物联网(IoT)集成成为标配\n\n作为行业领先的供应商，我们持续投资研发，确保为客户提供最前沿的产品。\n\n💡 想了解更多？欢迎私信交流！\n\n#LEDLighting #IndustryTrends #B2BTrade",
  default: "🌟 感谢您的关注！\n\n我们致力于为全球客户提供优质的照明解决方案。期待与您的合作！\n\n📩 联系我们了解更多详情。\n\n#QualityFirst #GlobalTrade",
};

export default function ContentCreate() {
  const [step, setStep] = useState(1);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [theme, setTheme] = useState("");
  const [style, setStyle] = useState("");
  const [notes, setNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [caption, setCaption] = useState("");
  const [platformCaptions, setPlatformCaptions] = useState<Record<string, string>>({});
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["linkedin"]);
  const [publishMode, setPublishMode] = useState<"now" | "scheduled">("now");

  const toggleImage = (id: string) => {
    setSelectedImages((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 9 ? [...prev, id] : prev
    );
  };

  const generateCaption = useCallback(() => {
    setIsGenerating(true);
    setTimeout(() => {
      const text = mockCaptions[theme] || mockCaptions.default;
      setCaption(text);
      setPlatformCaptions({ linkedin: text, facebook: text, instagram: text });
      setIsGenerating(false);
    }, 1500);
  }, [theme]);

  const handlePublish = () => {
    toast({
      title: publishMode === "now" ? "发布成功！" : "已设定定时发布",
      description: `内容将发布到 ${selectedPlatforms.join(", ")}`,
    });
    // Reset
    setStep(1);
    setSelectedImages([]);
    setCaption("");
    setTheme("");
    setStyle("");
  };

  const stepTitles = ["选择素材", "AI生成文案", "多平台预览", "发布设置"];

  return (
    <div className="space-y-4">
      {/* Stepper */}
      <div className="flex items-center gap-2">
        {stepTitles.map((title, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => i + 1 < step && setStep(i + 1)}
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors",
                step === i + 1 ? "bg-primary text-primary-foreground" :
                step > i + 1 ? "bg-brand-green/15 text-brand-green cursor-pointer" :
                "bg-secondary text-muted-foreground"
              )}
            >
              {step > i + 1 ? <Check className="w-3 h-3" /> : <span>{i + 1}</span>}
              {title}
            </button>
            {i < stepTitles.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Step 1: Select media */}
      {step === 1 && (
        <div className="glass-panel rounded-xl p-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-1">从素材库选择图片/视频</h3>
            <p className="text-[11px] text-muted-foreground">最多选择9张，已选 {selectedImages.length}/9</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {sampleImages.map((img) => {
              const isSelected = selectedImages.includes(img.id);
              return (
                <button
                  key={img.id}
                  onClick={() => toggleImage(img.id)}
                  className={cn(
                    "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                    isSelected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/30"
                  )}
                >
                  <img src={img.src} alt={img.name} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 py-1">
                    <span className="text-[9px] text-white">{img.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={selectedImages.length === 0}
              className="text-xs font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-1 hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              下一步 <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: AI caption */}
      {step === 2 && (
        <div className="glass-panel rounded-xl p-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-3">内容主题</h3>
            <div className="flex flex-wrap gap-2">
              {themes.map((t) => (
                <button key={t} onClick={() => setTheme(t)}
                  className={cn("text-xs px-3 py-1.5 rounded-lg border transition-colors",
                    theme === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                  )}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">文案风格</h3>
            <div className="flex flex-wrap gap-2">
              {styles.map((s) => (
                <button key={s} onClick={() => setStyle(s)}
                  className={cn("text-xs px-3 py-1.5 rounded-lg border transition-colors",
                    style === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                  )}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2">补充说明（可选）</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例如：强调产品节能特性，目标市场是欧洲..."
              className="w-full bg-secondary rounded-lg px-3 py-2 text-xs outline-none placeholder:text-muted-foreground resize-none h-16"
            />
          </div>
          <button
            onClick={generateCaption}
            disabled={!theme || !style || isGenerating}
            className="text-xs font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {isGenerating ? "AI生成中..." : "AI生成文案"}
          </button>

          {caption && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">AI生成的文案（可编辑）</h3>
              <textarea
                value={caption}
                onChange={(e) => {
                  setCaption(e.target.value);
                  setPlatformCaptions((p) => ({ ...p, linkedin: e.target.value, facebook: e.target.value, instagram: e.target.value }));
                }}
                className="w-full bg-secondary rounded-lg px-3 py-3 text-xs outline-none resize-none min-h-[200px] leading-relaxed"
              />
              <div className="flex gap-2">
                <button onClick={generateCaption} className="text-xs text-muted-foreground border border-border px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-secondary transition-colors">
                  <RefreshCw className="w-3 h-3" /> 重新生成
                </button>
                <button className="text-xs text-muted-foreground border border-border px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-secondary transition-colors">
                  <Save className="w-3 h-3" /> 保存草稿
                </button>
                <div className="flex-1" />
                <button onClick={() => setStep(1)} className="text-xs text-muted-foreground px-3 py-1.5 rounded-lg hover:bg-secondary transition-colors flex items-center gap-1">
                  <ChevronLeft className="w-3 h-3" /> 上一步
                </button>
                <button onClick={() => setStep(3)} className="text-xs font-medium bg-primary text-primary-foreground px-4 py-1.5 rounded-lg flex items-center gap-1 hover:opacity-90 transition-opacity">
                  下一步 <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Platform preview */}
      {step === 3 && (
        <div className="glass-panel rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold">多平台预览</h3>
          <Tabs defaultValue="linkedin">
            <TabsList className="bg-secondary">
              <TabsTrigger value="linkedin" className="text-xs gap-1"><Linkedin className="w-3 h-3" /> LinkedIn</TabsTrigger>
              <TabsTrigger value="facebook" className="text-xs gap-1"><Facebook className="w-3 h-3" /> Facebook</TabsTrigger>
              <TabsTrigger value="instagram" className="text-xs gap-1"><Instagram className="w-3 h-3" /> Instagram</TabsTrigger>
            </TabsList>

            {["linkedin", "facebook", "instagram"].map((platform) => (
              <TabsContent key={platform} value={platform} className="space-y-3">
                {/* Mock preview card */}
                <div className="border border-border rounded-xl overflow-hidden max-w-md">
                  <div className="p-3 flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold">OPC</div>
                    <div>
                      <div className="text-xs font-semibold">OPC Company</div>
                      <div className="text-[10px] text-muted-foreground">刚刚 · 🌐</div>
                    </div>
                  </div>
                  <div className="px-3 pb-2 text-xs whitespace-pre-wrap leading-relaxed">
                    {(platformCaptions[platform] || caption).slice(0, 200)}
                    {(platformCaptions[platform] || caption).length > 200 && "..."}
                  </div>
                  {selectedImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-0.5">
                      {selectedImages.slice(0, 4).map((id) => {
                        const img = sampleImages.find((i) => i.id === id);
                        return img ? <img key={id} src={img.src} alt="" className="w-full aspect-square object-cover" /> : null;
                      })}
                    </div>
                  )}
                  <div className="p-3 flex gap-6 border-t border-border text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> 点赞</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> 评论</span>
                    <span className="flex items-center gap-1"><Share2 className="w-3.5 h-3.5" /> 分享</span>
                  </div>
                </div>

                {/* Per-platform caption edit */}
                <div>
                  <div className="text-[11px] text-muted-foreground mb-1">针对 {platform} 的文案（可单独编辑）</div>
                  <textarea
                    value={platformCaptions[platform] || ""}
                    onChange={(e) => setPlatformCaptions((p) => ({ ...p, [platform]: e.target.value }))}
                    className="w-full bg-secondary rounded-lg px-3 py-2 text-xs outline-none resize-none min-h-[100px] leading-relaxed"
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex gap-2 justify-end">
            <button onClick={() => setStep(2)} className="text-xs text-muted-foreground px-3 py-1.5 rounded-lg hover:bg-secondary transition-colors flex items-center gap-1">
              <ChevronLeft className="w-3 h-3" /> 上一步
            </button>
            <button onClick={() => setStep(4)} className="text-xs font-medium bg-primary text-primary-foreground px-4 py-1.5 rounded-lg flex items-center gap-1 hover:opacity-90 transition-opacity">
              下一步 <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Publish settings */}
      {step === 4 && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold">发布设置</h3>

          {/* Platform selection */}
          <div>
            <div className="text-[11px] text-muted-foreground mb-2">选择发布平台</div>
            <div className="flex gap-2">
              {[
                { key: "linkedin", label: "LinkedIn", icon: Linkedin },
                { key: "facebook", label: "Facebook", icon: Facebook },
                { key: "instagram", label: "Instagram", icon: Instagram },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setSelectedPlatforms((p) => p.includes(key) ? p.filter((x) => x !== key) : [...p, key])}
                  className={cn(
                    "text-xs px-3 py-2 rounded-lg border flex items-center gap-1.5 transition-colors",
                    selectedPlatforms.includes(key)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  )}
                >
                  {selectedPlatforms.includes(key) && <Check className="w-3 h-3" />}
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Publish time */}
          <div>
            <div className="text-[11px] text-muted-foreground mb-2">发布时间</div>
            <div className="flex gap-3">
              <button
                onClick={() => setPublishMode("now")}
                className={cn("text-xs px-3 py-2 rounded-lg border flex items-center gap-1.5 transition-colors",
                  publishMode === "now" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                )}
              ><Send className="w-3 h-3" /> 立即发布</button>
              <button
                onClick={() => setPublishMode("scheduled")}
                className={cn("text-xs px-3 py-2 rounded-lg border flex items-center gap-1.5 transition-colors",
                  publishMode === "scheduled" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                )}
              ><CalendarDays className="w-3 h-3" /> 定时发布</button>
            </div>
            {publishMode === "scheduled" && (
              <div className="flex gap-2 mt-2">
                <input type="date" className="text-xs bg-secondary rounded-lg px-3 py-2 border border-border outline-none" />
                <input type="time" className="text-xs bg-secondary rounded-lg px-3 py-2 border border-border outline-none" />
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <div className="text-[11px] text-muted-foreground mb-2">话题标签</div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {["#LED", "#智能照明", "#B2B", "#外贸"].map((tag) => (
                <span key={tag} className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md flex items-center gap-0.5">
                  <Hash className="w-2.5 h-2.5" /> {tag.slice(1)}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => setStep(3)} className="text-xs text-muted-foreground px-3 py-1.5 rounded-lg hover:bg-secondary transition-colors flex items-center gap-1">
              <ChevronLeft className="w-3 h-3" /> 上一步
            </button>
            <button className="text-xs text-muted-foreground border border-border px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-secondary transition-colors">
              <Save className="w-3 h-3" /> 保存草稿
            </button>
            <button
              onClick={handlePublish}
              disabled={selectedPlatforms.length === 0}
              className="text-xs font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Send className="w-3.5 h-3.5" /> 确认发布
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
