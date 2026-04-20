/**
 * useProducts - 产品数据 CRUD hook
 * 连接 Supabase products + product_specs + product_images + product_docs
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Product = Tables<"products">;
export type ProductSpec = Tables<"product_specs">;
export type ProductImage = Tables<"product_images">;
export type ProductDoc = Tables<"product_docs">;
export type ProductInsert = TablesInsert<"products">;
export type ProductUpdate = TablesUpdate<"products">;

export interface ProductWithDetails extends Product {
  specs: ProductSpec[];
  images: ProductImage[];
  docs: ProductDoc[];
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useProductWithDetails(id: string | undefined) {
  return useQuery({
    queryKey: ["products", id, "details"],
    queryFn: async () => {
      if (!id) return null;

      const [productRes, specsRes, imagesRes, docsRes] = await Promise.all([
        supabase.from("products").select("*").eq("id", id).single(),
        supabase.from("product_specs").select("*").eq("product_id", id).order("sort_order"),
        supabase.from("product_images").select("*").eq("product_id", id).order("sort_order"),
        supabase.from("product_docs").select("*").eq("product_id", id).order("sort_order"),
      ]);

      if (productRes.error) throw productRes.error;

      return {
        ...productRes.data,
        specs: specsRes.data ?? [],
        images: imagesRes.data ?? [],
        docs: docsRes.data ?? [],
      } as ProductWithDetails;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: Omit<ProductInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("未登录");
      const { data, error } = await supabase
        .from("products")
        .insert({ ...product, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as Product;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: ProductUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Product;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["products", vars.id, "details"] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

/* ----------------------- specs ----------------------- */

export interface SpecInput { label: string; value: string }

/** 全量替换某产品的规格列表（先删后插，简单可靠） */
export function useReplaceProductSpecs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, specs }: { productId: string; specs: SpecInput[] }) => {
      const del = await supabase.from("product_specs").delete().eq("product_id", productId);
      if (del.error) throw del.error;
      if (specs.length > 0) {
        const rows = specs.map((s, i) => ({
          product_id: productId,
          label: s.label,
          value: s.value,
          sort_order: i,
        }));
        const ins = await supabase.from("product_specs").insert(rows);
        if (ins.error) throw ins.error;
      }
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ["products", vars.productId, "details"] }),
  });
}

/* ----------------------- images ----------------------- */

export interface ImageInput { url: string }

export function useReplaceProductImages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, images }: { productId: string; images: ImageInput[] }) => {
      const del = await supabase.from("product_images").delete().eq("product_id", productId);
      if (del.error) throw del.error;
      if (images.length > 0) {
        const rows = images.map((im, i) => ({
          product_id: productId,
          url: im.url,
          sort_order: i,
        }));
        const ins = await supabase.from("product_images").insert(rows);
        if (ins.error) throw ins.error;
      }
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ["products", vars.productId, "details"] }),
  });
}

/* ----------------------- docs ----------------------- */

export interface DocInput { name: string; url: string; file_size?: string | null }

export function useReplaceProductDocs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, docs }: { productId: string; docs: DocInput[] }) => {
      const del = await supabase.from("product_docs").delete().eq("product_id", productId);
      if (del.error) throw del.error;
      if (docs.length > 0) {
        const rows = docs.map((d, i) => ({
          product_id: productId,
          name: d.name,
          url: d.url,
          file_size: d.file_size ?? null,
          sort_order: i,
        }));
        const ins = await supabase.from("product_docs").insert(rows);
        if (ins.error) throw ins.error;
      }
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ["products", vars.productId, "details"] }),
  });
}

/* ----------------------- storage helpers ----------------------- */

function fmtFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** 上传产品图片到 Storage，返回公开 URL */
export async function uploadProductImage(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("未登录");
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

/** 上传产品文档到 Storage，返回 { url, file_size } */
export async function uploadProductDoc(file: File): Promise<{ url: string; file_size: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("未登录");
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${user.id}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from("product-docs").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("product-docs").getPublicUrl(path);
  return { url: data.publicUrl, file_size: fmtFileSize(file.size) };
}
