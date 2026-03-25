/**
 * SocialContent - AI社媒内容生成器
 */
import { useState } from "react";
import {
  Sparkles, Calendar, Image, Globe, Clock, CheckCircle2,
  Eye, Heart, MessageSquare, Share2, Plus, MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ContentPost {
  id: number; platform: string; status: "published" | "scheduled" | "draft";
  title: string; preview: string; date: string;
  engagement: { views: number; likes: number; comments: number; shares: number };
  aiGenerated: boolean;
}

const posts: ContentPost[] = [
  { id: 1, platform: "LinkedIn", status: "published", title: "5 Key Trends in LED Lighting for 2026", preview: "The LED lighting industry is evolving rapidly. Here are the top 5 trends that B2B buyers should watch...", date: "2026-03-25 09:00", engagement: { views: 1250, likes: 87, comments: 12, shares: 23 }, aiGenerated: true },
  { id: 2, platform: "Facebook", status: "published", title: "New Product Launch: Solar Panel Series X", preview: "Excited to announce our latest solar panel series with 22% efficiency improvement...", date: "2026-03-24 14:00", engagement: { views: 890, likes: 56, comments: 8, shares: 15 }, aiGenerated: true },
  { id: 3, platform: "Instagram", status: "scheduled", title: "Behind the Scenes: Our Factory Tour", preview: "Take a look inside our state-of-the-art manufacturing facility...", date: "2026-03-26 10:00", engagement: { views: 0, likes: 0, comments: 0, shares: 0 }, aiGenerated: false },
  { id: 4, platform: "Twitter", status: "draft", title: "Industry Report: Global Trade Q1 2026", preview: "Our latest analysis shows a 15% increase in cross-border B2B transactions...", date: "", engagement: { views: 0, likes: 0, comments: 0, shares: 0 }, aiGenerated: true },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  published: { label: "已发布", color: "bg-brand-green/15 text-brand-green" },
  scheduled: { label: "已排期", color: "bg-brand-cyan/15 text-brand-cyan" },
  draft: { label: "草稿", color: "bg-muted text-muted-foreground" },
};

export default function SocialContent() {
  const [activeFilter, setActiveFilter] = useState("all");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-lg">AI社媒内容生成器</h2>
          <p className="text-xs text-muted-foreground">Social Content Engine · 多平台内容创作与自动化发布</p>
        </div>
        <button onClick={() => toast("AI内容生成功能即将上线", { description: "Feature coming soon" })}
          className="flex items-center gap-1.5 text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity">
          <Sparkles className="w-4 h-4" /> AI生成内容
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "本月发布", value: "24", sub: "↑ 60% vs 上月" },
          { label: "总曝光量", value: "12.5K", sub: "跨4个平台" },
          { label: "互动率", value: "4.8%", sub: "行业平均 2.1%" },
          { label: "AI生成占比", value: "75%", sub: "18/24 篇" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
            <div className="text-xl font-display font-bold">{s.value}</div>
            <div className="text-[10px] text-muted-foreground mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter + Content list */}
      <div className="bg-card border border-border rounded-xl">
        <div className="flex gap-1 p-3 border-b border-border">
          {["all", "published", "scheduled", "draft"].map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={cn("text-xs px-2.5 py-1 rounded-md transition-colors",
                activeFilter === f ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >{f === "all" ? "全部" : statusConfig[f]?.label}</button>
          ))}
        </div>

        <div className="divide-y divide-border">
          {posts.filter((p) => activeFilter === "all" || p.status === activeFilter).map((post) => {
            const status = statusConfig[post.status];
            return (
              <div key={post.id} className="p-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium">{post.title}</h4>
                    {post.aiGenerated && (
                      <span className="text-[9px] bg-primary/15 text-primary px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" /> AI
                      </span>
                    )}
                  </div>
                  <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="w-4 h-4" /></button>
                </div>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{post.preview}</p>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className={cn("px-1.5 py-0.5 rounded", status.color)}>{status.label}</span>
                  <span className="text-muted-foreground">{post.platform}</span>
                  {post.date && <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {post.date}</span>}
                </div>
                {post.status === "published" && (
                  <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.engagement.views}</span>
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.engagement.likes}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.engagement.comments}</span>
                    <span className="flex items-center gap-1"><Share2 className="w-3 h-3" /> {post.engagement.shares}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
