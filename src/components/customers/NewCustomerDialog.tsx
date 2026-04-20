/**
 * NewCustomerDialog - 新建客户弹窗
 * 字段：姓名、公司、国家、邮箱、电话、等级、AI评分、标签
 * 使用 zod 做客户端校验，保存到 Supabase customers 表
 */
import { useState } from "react";
import { z } from "zod";
import { Plus, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCreateCustomer } from "@/hooks/use-customers";

const customerSchema = z.object({
  name: z.string().trim().min(1, "请填写姓名").max(100, "姓名不超过 100 字符"),
  company: z.string().trim().max(150, "公司名不超过 150 字符").optional(),
  country: z.string().trim().max(80, "国家名不超过 80 字符").optional(),
  email: z.union([z.literal(""), z.string().trim().email("邮箱格式不正确").max(255)]).optional(),
  phone: z.string().trim().max(40, "电话不超过 40 字符").optional(),
  tier: z.enum(["A", "B", "C"]),
  aiScore: z.number().int().min(0).max(100),
  tags: z.array(z.string().max(30)).max(10, "标签最多 10 个"),
});

interface NewCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NewCustomerDialog({ open, onOpenChange }: NewCustomerDialogProps) {
  const createCustomer = useCreateCustomer();
  const [form, setForm] = useState({
    name: "",
    company: "",
    country: "",
    email: "",
    phone: "",
    tier: "C" as "A" | "B" | "C",
    aiScore: 50,
    tags: [] as string[],
    newTag: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setForm({ name: "", company: "", country: "", email: "", phone: "", tier: "C", aiScore: 50, tags: [], newTag: "" });
    setErrors({});
  };

  const addTag = () => {
    const t = form.newTag.trim();
    if (!t) return;
    if (form.tags.includes(t)) { toast.error("标签已存在"); return; }
    if (form.tags.length >= 10) { toast.error("最多 10 个标签"); return; }
    setForm({ ...form, tags: [...form.tags, t.slice(0, 30)], newTag: "" });
  };

  const removeTag = (t: string) => setForm({ ...form, tags: form.tags.filter((x) => x !== t) });

  const handleSubmit = async () => {
    const parsed = customerSchema.safeParse({
      name: form.name, company: form.company, country: form.country,
      email: form.email, phone: form.phone, tier: form.tier,
      aiScore: form.aiScore, tags: form.tags,
    });
    if (!parsed.success) {
      const map: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { map[i.path[0] as string] = i.message; });
      setErrors(map);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await createCustomer.mutateAsync({
        name: parsed.data.name,
        company: parsed.data.company || null,
        country: parsed.data.country || null,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        tier: parsed.data.tier,
        ai_score: parsed.data.aiScore,
        tags: parsed.data.tags,
        status: "nurturing",
      });
      toast.success(`客户「${parsed.data.name}」已创建`);
      reset();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "创建失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Plus className="w-4 h-4 text-primary" /> 新建客户
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div>
            <Label className="text-xs">姓名 *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} className="h-8 text-xs mt-1" placeholder="John Smith" />
            {errors.name && <p className="text-[10px] text-destructive mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">公司</Label>
              <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} maxLength={150} className="h-8 text-xs mt-1" placeholder="TechCorp Ltd." />
              {errors.company && <p className="text-[10px] text-destructive mt-1">{errors.company}</p>}
            </div>
            <div>
              <Label className="text-xs">国家</Label>
              <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} maxLength={80} className="h-8 text-xs mt-1" placeholder="美国" />
              {errors.country && <p className="text-[10px] text-destructive mt-1">{errors.country}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">邮箱</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} className="h-8 text-xs mt-1" placeholder="john@example.com" />
              {errors.email && <p className="text-[10px] text-destructive mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label className="text-xs">电话</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={40} className="h-8 text-xs mt-1" placeholder="+1 555-0123" />
              {errors.phone && <p className="text-[10px] text-destructive mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">客户等级</Label>
              <Select value={form.tier} onValueChange={(v) => setForm({ ...form, tier: v as "A" | "B" | "C" })}>
                <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A 级 - 高价值</SelectItem>
                  <SelectItem value="B">B 级 - 潜力</SelectItem>
                  <SelectItem value="C">C 级 - 新客</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center justify-between mt-0.5">
                <Label className="text-xs">AI 评分</Label>
                <span className="text-[10px] text-muted-foreground">{form.aiScore} / 100</span>
              </div>
              <Slider value={[form.aiScore]} onValueChange={(v) => setForm({ ...form, aiScore: v[0] })} max={100} step={1} className="mt-3" />
            </div>
          </div>

          <div>
            <Label className="text-xs">标签</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={form.newTag}
                onChange={(e) => setForm({ ...form, newTag: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                maxLength={30}
                className="h-8 text-xs flex-1"
                placeholder="输入标签后回车"
              />
              <Button type="button" size="sm" variant="outline" onClick={addTag}>添加</Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="text-[10px] gap-1 pr-1">
                    {t}
                    <button type="button" onClick={() => removeTag(t)} className="hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            {errors.tags && <p className="text-[10px] text-destructive mt-1">{errors.tags}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={submitting}>取消</Button>
          <Button size="sm" onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
            {submitting ? "保存中..." : "创建客户"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
