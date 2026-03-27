/**
 * AssetLibrary - 素材库
 * 文件夹分类、图片/视频上传、标签管理
 */
import { useState, useRef } from "react";
import {
  FolderOpen, Upload, Plus, Image as ImageIcon, Video, X,
  Tag, Download, Trash2, Eye, ChevronRight, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Asset {
  id: string;
  type: "image" | "video";
  filename: string;
  size: string;
  folder: string;
  tags: string[];
  uploadedAt: string;
  thumbnail: string;
}

interface Folder {
  name: string;
  count: number;
}

const mockFolders: Folder[] = [
  { name: "产品图片", count: 23 },
  { name: "工厂视频", count: 5 },
  { name: "团队照片", count: 12 },
  { name: "客户案例", count: 8 },
  { name: "行业资讯", count: 15 },
];

const mockAssets: Asset[] = [
  { id: "1", type: "image", filename: "LED灯A.jpg", size: "500 KB", folder: "产品图片", tags: ["LED", "新品"], uploadedAt: "2026-03-20", thumbnail: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=200&h=200&fit=crop" },
  { id: "2", type: "image", filename: "LED灯B.jpg", size: "450 KB", folder: "产品图片", tags: ["LED", "热销"], uploadedAt: "2026-03-20", thumbnail: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=200&h=200&fit=crop" },
  { id: "3", type: "image", filename: "工厂外景.jpg", size: "1.2 MB", folder: "产品图片", tags: ["工厂"], uploadedAt: "2026-03-19", thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop" },
  { id: "4", type: "video", filename: "生产线参观.mp4", size: "25.6 MB", folder: "工厂视频", tags: ["工厂", "生产线"], uploadedAt: "2026-03-18", thumbnail: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=200&h=200&fit=crop" },
  { id: "5", type: "image", filename: "团队合影.jpg", size: "2.1 MB", folder: "团队照片", tags: ["团队"], uploadedAt: "2026-03-17", thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop" },
  { id: "6", type: "image", filename: "客户来访.jpg", size: "1.8 MB", folder: "客户案例", tags: ["客户", "来访"], uploadedAt: "2026-03-16", thumbnail: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=200&h=200&fit=crop" },
];

export default function AssetLibrary() {
  const [expandedFolder, setExpandedFolder] = useState<string | null>("产品图片");
  const [assets, setAssets] = useState(mockAssets);
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (files: FileList | null) => {
    if (!files) return;
    const count = files.length;
    toast({ title: `正在上传 ${count} 个文件...`, description: "文件将添加到当前文件夹" });
    setTimeout(() => {
      const newAssets: Asset[] = Array.from(files).map((f, i) => ({
        id: `new-${Date.now()}-${i}`,
        type: f.type.startsWith("video/") ? "video" as const : "image" as const,
        filename: f.name,
        size: (f.size / 1024).toFixed(0) + " KB",
        folder: expandedFolder || "产品图片",
        tags: [],
        uploadedAt: new Date().toISOString().slice(0, 10),
        thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop",
      }));
      setAssets((prev) => [...newAssets, ...prev]);
      toast({ title: "上传成功", description: `${count} 个文件已添加` });
    }, 1200);
  };

  const handleDelete = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    setPreviewAsset(null);
    toast({ title: "已删除" });
  };

  const folderAssets = (folder: string) => assets.filter((a) => a.folder === folder);

  return (
    <div
      className={cn("space-y-4", isDragOver && "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-xl")}
      onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleUpload(e.dataTransfer.files); }}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
    >
      {/* Toolbar */}
      <div className="flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-xs font-medium bg-primary text-primary-foreground px-3 py-2 rounded-lg flex items-center gap-1.5 hover:opacity-90 transition-opacity"
        >
          <Upload className="w-3.5 h-3.5" /> 上传文件
        </button>
        <button className="text-xs text-muted-foreground border border-border px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-secondary transition-colors">
          <Plus className="w-3.5 h-3.5" /> 新建文件夹
        </button>
        <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => { handleUpload(e.target.files); e.target.value = ""; }} />
      </div>

      {isDragOver && (
        <div className="border-2 border-dashed border-primary/40 rounded-xl p-8 text-center bg-primary/5">
          <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
          <span className="text-sm text-primary">拖放文件到此处上传</span>
        </div>
      )}

      {/* Folders */}
      <div className="space-y-2">
        {mockFolders.map((folder) => {
          const isExpanded = expandedFolder === folder.name;
          const items = folderAssets(folder.name);
          return (
            <div key={folder.name} className="glass-panel rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedFolder(isExpanded ? null : folder.name)}
                className="w-full flex items-center gap-3 p-3 hover:bg-secondary/30 transition-colors text-left"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                <FolderOpen className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium flex-1">{folder.name}</span>
                <span className="text-[10px] text-muted-foreground">{items.length} 个文件</span>
              </button>

              {isExpanded && items.length > 0 && (
                <div className="border-t border-border p-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {items.map((asset) => (
                      <button
                        key={asset.id}
                        onClick={() => setPreviewAsset(asset)}
                        className="group rounded-lg overflow-hidden border border-border hover:border-primary/30 transition-colors bg-secondary/30 text-left"
                      >
                        <div className="aspect-square relative overflow-hidden">
                          <img src={asset.thumbnail} alt={asset.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          {asset.type === "video" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <Video className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="p-1.5">
                          <div className="text-[10px] font-medium truncate">{asset.filename}</div>
                          <div className="text-[9px] text-muted-foreground">{asset.size}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isExpanded && items.length === 0 && (
                <div className="border-t border-border p-6 text-center text-xs text-muted-foreground">
                  暂无文件，点击上方"上传文件"添加
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Preview dialog */}
      <Dialog open={!!previewAsset} onOpenChange={() => setPreviewAsset(null)}>
        <DialogContent className="sm:max-w-[480px] bg-card border-border">
          {previewAsset && (
            <>
              <DialogHeader>
                <DialogTitle className="text-sm font-medium">{previewAsset.filename}</DialogTitle>
              </DialogHeader>
              <div className="rounded-lg overflow-hidden border border-border">
                <img src={previewAsset.thumbnail} alt={previewAsset.filename} className="w-full aspect-video object-cover" />
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>大小: {previewAsset.size}</span>
                  <span>上传: {previewAsset.uploadedAt}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {previewAsset.tags.map((tag) => (
                    <span key={tag} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <Tag className="w-2.5 h-2.5" /> {tag}
                    </span>
                  ))}
                  {previewAsset.tags.length === 0 && <span className="text-[10px] text-muted-foreground">暂无标签</span>}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 h-8 text-[11px] border border-border rounded-lg flex items-center justify-center gap-1 hover:bg-secondary transition-colors">
                  <Download className="w-3 h-3" /> 下载
                </button>
                <button
                  onClick={() => handleDelete(previewAsset.id)}
                  className="h-8 text-[11px] text-destructive border border-destructive/20 rounded-lg px-3 flex items-center gap-1 hover:bg-destructive/5 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> 删除
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
