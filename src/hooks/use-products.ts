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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
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
