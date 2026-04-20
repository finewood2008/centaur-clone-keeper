/**
 * ProductFormDialog - 新建/编辑产品
 * - 基础字段：name / sku / category / price / currency / moq / stock / 工厂信息 / 描述
 * - 主图上传到 product-images bucket
 * - 多图（替换式）上传到 product-images bucket
 * - 规格列表（label / value）保存到 product_specs
 * - 文档上传到 product-docs bucket，记录到 product_docs
 *
 * 注意：编辑模式时使用「全量替换」策略管理 specs / images / docs，
 * 简单可靠，适合中小数据量的产品资料。
 */
import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import {
  Plus, X, Loader2, Upload, FileText, Image as ImageIcon, Trash2,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  useCreateProduct, useUpdateProduct, useProduct,
  useReplaceProductSpecs, useReplaceProductImages, useReplaceProductDocs,
  uploadProductImage, uploadProductDoc,
  type Product,
} from "@/hooks/use-products";

const productSchema = z.object({
  name: z.string().trim().min(1, "请填写产品名").max(150),
  sku: z.string().trim().max(60).optional(),
  category: z.string().trim().max(60).optional(),
  price: z.number().min(0).max(9999999).optional(),
  currency: z.enum(["USD", "CNY", "EUR"]),
  moq: z.string().trim().max(40).optional(),
  stock: z.string().trim().max(40).optional(),
  factory_name: z.string().trim().max(120).optional(),
  factory_rating: z.number().int().min(0).max(5),
  description: z.string().trim().max(2000).optional(),
});

interface SpecRow { id: string; label: string; value: string }
interface DocRow { id: string; name: string; url: string; file_size: string | null }

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  productId?: string | null; // 传则为编辑
}

const MAX_IMG = 5 * 1024 * 1024; // 5MB
const MAX_DOC = 10 * 1024 * 1024; // 10MB

export default function ProductFormDialog({ open, onOpenChange, productId }: Props) {
  const isEdit = !!productId;
  const { data: detail } = useProduct(productId ?? undefined);
  const createMut = useCreateProduct();
  const updateMut = useUpdateProduct();
  const replaceSpecs = useReplaceProductSpecs();
  const replaceImages = useReplaceProductImages();
  const replaceDocs = useReplaceProductDocs();

  const mainImgRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "", sku: "", category: "", price: "" as string,
    currency: "USD" as "USD" | "CNY" | "EUR", moq: "", stock: "",
    factory_name: "", factory_rating: 5, description: "",
    has_bot: false,
    image_url: "" as string | null | "",
  });
  const [factoryCerts, setFactoryCerts] = useState<string[]>([]);
  const [newCert, setNewCert] = useState("");
  const [specs, setSpecs] = useState<SpecRow[]>([]);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const reset = () => {
    setForm({
      name: "", sku: "", category: "", price: "", currency: "USD", moq: "", stock: "",
      factory_name: "", factory_rating: 5, description: "", has_bot: false, image_url: "",
    });
    setFactoryCerts([]); setNewCert(""); setSpecs([]); setGalleryUrls([]); setDocs([]);
    setErrors({});
  };

  // 编辑模式：详情就绪后回填
  useEffect(() => {
    if (!open) return;
    if (!isEdit) { reset(); return; }
    if (!detail) return;
    setForm({
      name: detail.name ?? "",
      sku: detail.sku ?? "",
      category: detail.category ?? "",
      price: detail.price != null ? String(detail.price) : "",
      currency: (detail.currency as "USD" | "CNY" | "EUR") ?? "USD",
      moq: detail.moq ?? "",
      stock: detail.stock ?? "",
      factory_name: detail.factory_name ?? "",
      factory_rating: detail.factory_rating ?? 5,
      description: detail.description ?? "",
      has_bot: !!detail.has_bot,
      image_url: detail.image_url ?? "",
    });
    setFactoryCerts(detail.factory_certs ?? []);
    setSpecs((detail.specs ?? []).map((s) => ({ id: s.id, label: s.label, value: s.value })));
    setGalleryUrls((detail.images ?? []).map((i) => i.url));
    setDocs((detail.docs ?? []).map((d) => ({ id: d.id, name: d.name, url: d.url ?? "", file_size: d.file_size })));
    setErrors({});
  }, [open, isEdit, detail]);

  /* ---- 主图上传 ---- */
  const onMainImgChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("请上传图片文件"); return; }
    if (file.size > MAX_IMG) { toast.error("图片不能超过 5MB"); return; }
    setUploadingMain(true);
    try {
      const url = await uploadProductImage(file);
      setForm((f) => ({ ...f, image_url: url }));
      toast.success("主图已上传");
    } catch (err: any) {
      toast.error(err?.message || "上传失败");
    } finally {
      setUploadingMain(false);
    }
  };

  /* ---- 多图上传 ---- */
  const onGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    if (galleryUrls.length + files.length > 8) { toast.error("最多 8 张图"); return; }
    setUploadingGallery(true);
    try {
      const urls: string[] = [];
      for (const f of files) {
        if (!f.type.startsWith("image/")) continue;
        if (f.size > MAX_IMG) { toast.error(`「${f.name}」超过 5MB，已跳过`); continue; }
        urls.push(await uploadProductImage(f));
      }
      setGalleryUrls((arr) => [...arr, ...urls]);
      if (urls.length > 0) toast.success(`已上传 ${urls.length} 张`);
    } catch (err: any) {
      toast.error(err?.message || "上传失败");
    } finally {
      setUploadingGallery(false);
    }
  };

  /* ---- 文档上传 ---- */
  const onDocChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setUploadingDoc(true);
    try {
      const newDocs: DocRow[] = [];
      for (const f of files) {
        if (f.size > MAX_DOC) { toast.error(`「${f.name}」超过 10MB，已跳过`); continue; }
        const { url, file_size } = await uploadProductDoc(f);
        newDocs.push({ id: `tmp-${Date.now()}-${Math.random()}`, name: f.name, url, file_size });
      }
      setDocs((arr) => [...arr, ...newDocs]);
      if (newDocs.length > 0) toast.success(`已上传 ${newDocs.length} 个文档`);
    } catch (err: any) {
      toast.error(err?.message || "上传失败");
    } finally {
      setUploadingDoc(false);
    }
  };

  /* ---- specs ---- */
  const addSpec = () => setSpecs((s) => [...s, { id: `tmp-${Date.now()}`, label: "", value: "" }]);
  const updateSpec = (id: string, key: "label" | "value", val: string) =>
    setSpecs((s) => s.map((x) => (x.id === id ? { ...x, [key]: val } : x)));
  const removeSpec = (id: string) => setSpecs((s) => s.filter((x) => x.id !== id));

  const addCert = () => {
    const t = newCert.trim();
    if (!t) return;
    if (factoryCerts.includes(t)) { toast.error("已存在"); return; }
    if (factoryCerts.length >= 8) { toast.error("最多 8 个认证"); return; }
    setFactoryCerts((c) => [...c, t.slice(0, 20)]);
    setNewCert("");
  };

  /* ---- 提交 ---- */
  const handleSubmit = async () => {
    const priceNum = form.price === "" ? undefined : Number(form.price);
    const parsed = productSchema.safeParse({
      name: form.name,
      sku: form.sku,
      category: form.category,
      price: priceNum,
      currency: form.currency,
      moq: form.moq,
      stock: form.stock,
      factory_name: form.factory_name,
      factory_rating: form.factory_rating,
      description: form.description,
    });
    if (!parsed.success) {
      const map: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { map[i.path[0] as string] = i.message; });
      setErrors(map);
      return;
    }
    // specs 校验：label 和 value 必须同时填或同时空，过滤掉空行
    const cleanSpecs = specs
      .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
      .filter((s) => s.label && s.value);

    setErrors({});
    setSubmitting(true);
    try {
      const productPayload = {
        name: parsed.data.name,
        sku: parsed.data.sku || null,
        category: parsed.data.category || null,
        price: parsed.data.price ?? null,
        currency: parsed.data.currency,
        moq: parsed.data.moq || null,
        stock: parsed.data.stock || null,
        factory_name: parsed.data.factory_name || null,
        factory_rating: parsed.data.factory_rating,
        factory_certs: factoryCerts,
        description: parsed.data.description || null,
        has_bot: form.has_bot,
        image_url: form.image_url || null,
        status: "active" as const,
      };

      let pid: string;
      if (isEdit && productId) {
        const updated = await updateMut.mutateAsync({ id: productId, ...productPayload });
        pid = updated.id;
      } else {
        const created = await createMut.mutateAsync(productPayload);
        pid = created.id;
      }

      await Promise.all([
        replaceSpecs.mutateAsync({ productId: pid, specs: cleanSpecs }),
        replaceImages.mutateAsync({ productId: pid, images: galleryUrls.map((url) => ({ url })) }),
        replaceDocs.mutateAsync({
          productId: pid,
          docs: docs.map((d) => ({ name: d.name, url: d.url, file_size: d.file_size })),
        }),
      ]);

      toast.success(isEdit ? `产品「${parsed.data.name}」已更新` : `产品「${parsed.data.name}」已创建`);
      reset();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "保存失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !submitting) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Plus className="w-4 h-4 text-primary" />
            {isEdit ? "编辑产品" : "新建产品"}
          </DialogTitle>
          <DialogDescription className="text-[11px]">
            填写基础信息、上传图片，配置规格与文档。所有字段会保存到产品库。
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-4 h-8">
            <TabsTrigger value="basic" className="text-xs">基础</TabsTrigger>
            <TabsTrigger value="images" className="text-xs">图片</TabsTrigger>
            <TabsTrigger value="specs" className="text-xs">规格</TabsTrigger>
            <TabsTrigger value="docs" className="text-xs">文档</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto pr-1 mt-3">
            {/* ---------- 基础信息 ---------- */}
            <TabsContent value="basic" className="space-y-3 mt-0">
              <div>
                <Label className="text-xs">产品名 *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  maxLength={150} className="h-8 text-xs mt-1" placeholder="LED 节能灯泡 9W E27" />
                {errors.name && <p className="text-[10px] text-destructive mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">SKU</Label>
                  <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    maxLength={60} className="h-8 text-xs mt-1 font-mono" placeholder="LED-9W-E27" />
                </div>
                <div>
                  <Label className="text-xs">品类</Label>
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    maxLength={60} className="h-8 text-xs mt-1" placeholder="LED 照明" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">价格</Label>
                  <Input type="number" step="0.01" min="0" value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="h-8 text-xs mt-1" placeholder="1.85" />
                </div>
                <div>
                  <Label className="text-xs">币种</Label>
                  <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v as any })}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="CNY">CNY</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">MOQ</Label>
                  <Input value={form.moq} onChange={(e) => setForm({ ...form, moq: e.target.value })}
                    maxLength={40} className="h-8 text-xs mt-1" placeholder="1000 pcs" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">库存状态</Label>
                  <Input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    maxLength={40} className="h-8 text-xs mt-1" placeholder="充足 / 现货 / 备货中" />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label className="text-xs">工厂评分（0–5）</Label>
                    <Input type="number" min={0} max={5} step={1}
                      value={form.factory_rating}
                      onChange={(e) => setForm({ ...form, factory_rating: Number(e.target.value) })}
                      className="h-8 text-xs mt-1" />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs">工厂名称</Label>
                <Input value={form.factory_name} onChange={(e) => setForm({ ...form, factory_name: e.target.value })}
                  maxLength={120} className="h-8 text-xs mt-1" placeholder="深圳光明照明厂" />
              </div>

              <div>
                <Label className="text-xs">工厂认证</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={newCert} onChange={(e) => setNewCert(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCert(); } }}
                    maxLength={20} className="h-8 text-xs flex-1" placeholder="CE / RoHS / FCC，回车添加" />
                  <Button type="button" size="sm" variant="outline" onClick={addCert}>添加</Button>
                </div>
                {factoryCerts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {factoryCerts.map((c) => (
                      <Badge key={c} variant="secondary" className="text-[10px] gap-1 pr-1">
                        {c}
                        <button type="button" onClick={() => setFactoryCerts((x) => x.filter((y) => y !== c))}
                          className="hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-xs">产品描述</Label>
                <Textarea value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  maxLength={2000} rows={3} className="text-xs mt-1"
                  placeholder="高效节能，使用寿命 25000 小时，适用于家庭与商业照明" />
              </div>

              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <div>
                  <div className="text-xs font-medium">启用 AI 产品助手</div>
                  <div className="text-[10px] text-muted-foreground">客户可在详情页和产品 Bot 实时对话</div>
                </div>
                <Switch checked={form.has_bot} onCheckedChange={(v) => setForm({ ...form, has_bot: v })} />
              </div>
            </TabsContent>

            {/* ---------- 图片 ---------- */}
            <TabsContent value="images" className="space-y-4 mt-0">
              <div>
                <Label className="text-xs">主图（卡片封面）</Label>
                <input ref={mainImgRef} type="file" accept="image/*" className="hidden" onChange={onMainImgChange} />
                <div className="mt-2 flex items-center gap-3">
                  <div className="w-24 h-24 rounded-md border border-border bg-secondary/50 overflow-hidden flex items-center justify-center">
                    {form.image_url ? (
                      <img src={form.image_url} alt="主图" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => mainImgRef.current?.click()} disabled={uploadingMain}>
                      {uploadingMain ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Upload className="w-3 h-3 mr-1" />}
                      {form.image_url ? "替换主图" : "上传主图"}
                    </Button>
                    {form.image_url && (
                      <Button type="button" size="sm" variant="ghost" className="text-destructive"
                        onClick={() => setForm({ ...form, image_url: "" })}>
                        <Trash2 className="w-3 h-3 mr-1" /> 移除
                      </Button>
                    )}
                    <span className="text-[10px] text-muted-foreground">JPG/PNG/WebP，≤ 5MB</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">产品多图（{galleryUrls.length}/8）</Label>
                  <Button type="button" size="sm" variant="outline" onClick={() => galleryRef.current?.click()}
                    disabled={uploadingGallery || galleryUrls.length >= 8}>
                    {uploadingGallery ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Upload className="w-3 h-3 mr-1" />}
                    添加图片
                  </Button>
                  <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={onGalleryChange} />
                </div>
                {galleryUrls.length === 0 ? (
                  <div className="mt-2 border border-dashed border-border rounded-md p-6 text-center text-[11px] text-muted-foreground">
                    暂无图片
                  </div>
                ) : (
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {galleryUrls.map((url, i) => (
                      <div key={url + i} className="relative group aspect-square rounded-md overflow-hidden border border-border">
                        <img src={url} alt={`图${i + 1}`} className="w-full h-full object-cover" />
                        <button type="button"
                          onClick={() => setGalleryUrls((arr) => arr.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive/90 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ---------- 规格 ---------- */}
            <TabsContent value="specs" className="space-y-3 mt-0">
              <div className="flex items-center justify-between">
                <Label className="text-xs">规格参数（{specs.length}）</Label>
                <Button type="button" size="sm" variant="outline" onClick={addSpec}>
                  <Plus className="w-3 h-3 mr-1" /> 添加一行
                </Button>
              </div>
              {specs.length === 0 ? (
                <div className="border border-dashed border-border rounded-md p-6 text-center text-[11px] text-muted-foreground">
                  暂无规格，点击「添加一行」开始
                </div>
              ) : (
                <div className="space-y-2">
                  {specs.map((s) => (
                    <div key={s.id} className="grid grid-cols-[1fr_2fr_auto] gap-2">
                      <Input placeholder="参数名（如：功率）" value={s.label} maxLength={40}
                        onChange={(e) => updateSpec(s.id, "label", e.target.value)} className="h-8 text-xs" />
                      <Input placeholder="参数值（如：9W）" value={s.value} maxLength={120}
                        onChange={(e) => updateSpec(s.id, "value", e.target.value)} className="h-8 text-xs" />
                      <Button type="button" size="sm" variant="ghost" onClick={() => removeSpec(s.id)} className="text-destructive h-8 w-8 p-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-muted-foreground">空行会在保存时自动忽略。</p>
            </TabsContent>

            {/* ---------- 文档 ---------- */}
            <TabsContent value="docs" className="space-y-3 mt-0">
              <div className="flex items-center justify-between">
                <Label className="text-xs">产品文档（{docs.length}）</Label>
                <Button type="button" size="sm" variant="outline" onClick={() => docRef.current?.click()} disabled={uploadingDoc}>
                  {uploadingDoc ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Upload className="w-3 h-3 mr-1" />}
                  上传文档
                </Button>
                <input ref={docRef} type="file" multiple className="hidden" onChange={onDocChange} />
              </div>
              {docs.length === 0 ? (
                <div className="border border-dashed border-border rounded-md p-6 text-center text-[11px] text-muted-foreground">
                  支持 PDF、DOCX、XLSX 等，单个文件 ≤ 10MB
                </div>
              ) : (
                <div className="space-y-1.5">
                  {docs.map((d) => (
                    <div key={d.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-secondary/50 border border-border">
                      <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                      <a href={d.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs flex-1 truncate hover:underline">{d.name}</a>
                      {d.file_size && <span className="text-[10px] text-muted-foreground shrink-0">{d.file_size}</span>}
                      <Button type="button" size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive"
                        onClick={() => setDocs((arr) => arr.filter((x) => x.id !== d.id))}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="border-t border-border pt-3">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={submitting}>取消</Button>
          <Button size="sm" onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
            {submitting ? "保存中..." : isEdit ? "保存修改" : "创建产品"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
