import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';

// ---------- Types ----------

export interface Product {
  id: string;
  user_id: string;
  name: string;
  category: string;
  sku: string;
  price: number;
  currency: string;
  moq: number;
  stock: number;
  image_url: string;
  has_bot: boolean;
  views: number;
  inquiries_count: number;
  factory_name: string;
  factory_rating: number;
  factory_certs: string[];
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ProductSpec {
  id: string;
  product_id: string;
  label: string;
  value: string;
  sort_order: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  sort_order: number;
}

export interface ProductDoc {
  id: string;
  product_id: string;
  name: string;
  file_size: number;
  url: string;
  sort_order: number;
}

export interface ProductWithRelations extends Product {
  specs: ProductSpec[];
  images: ProductImage[];
  docs: ProductDoc[];
}

export type CreateProductInput = Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type UpdateProductInput = Partial<CreateProductInput>;

// ---------- Queries ----------

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => apiFetch<Product[]>('/products'),
  });
}

export function useProduct(id: string | undefined) {
  return useQuery<ProductWithRelations>({
    queryKey: ['product', id],
    queryFn: () => apiFetch<ProductWithRelations>(`/products/${id}`),
    enabled: !!id,
  });
}

// ---------- Product CRUD Mutations ----------

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, CreateProductInput>({
    mutationFn: (data) =>
      apiFetch<Product>('/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, { id: string; data: UpdateProductInput }>({
    mutationFn: ({ id, data }) =>
      apiFetch<Product>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation<{ deleted: true }, Error, string>({
    mutationFn: (id) =>
      apiFetch<{ deleted: true }>(`/products/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// ---------- Product Relations Mutations ----------

export function useReplaceProductSpecs() {
  const queryClient = useQueryClient();

  return useMutation<ProductSpec[], Error, { id: string; specs: { label: string; value: string; sort_order: number }[] }>({
    mutationFn: ({ id, specs }) =>
      apiFetch<ProductSpec[]>(`/products/${id}/specs`, {
        method: 'PUT',
        body: JSON.stringify({ specs }),
      }),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
    },
  });
}

export function useReplaceProductImages() {
  const queryClient = useQueryClient();

  return useMutation<ProductImage[], Error, { id: string; images: { url: string; sort_order: number }[] }>({
    mutationFn: ({ id, images }) =>
      apiFetch<ProductImage[]>(`/products/${id}/images`, {
        method: 'PUT',
        body: JSON.stringify({ images }),
      }),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
    },
  });
}

export function useReplaceProductDocs() {
  const queryClient = useQueryClient();

  return useMutation<ProductDoc[], Error, { id: string; docs: { name: string; file_size: number; url: string; sort_order: number }[] }>({
    mutationFn: ({ id, docs }) =>
      apiFetch<ProductDoc[]>(`/products/${id}/docs`, {
        method: 'PUT',
        body: JSON.stringify({ docs }),
      }),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
    },
  });
}

// ---------- File Upload Stubs ----------

export function uploadProductImage(_productId: string, _file: File): Promise<ProductImage> {
  throw new Error('File upload not yet supported in local mode');
}

export function uploadProductDoc(_productId: string, _file: File): Promise<ProductDoc> {
  throw new Error('File upload not yet supported in local mode');
}
