/**
 * useContentPosts — 内容中心 CRUD hooks
 * 基于 React Query + apiFetch (Bearer JWT auth)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';

// ---------- Types ----------

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export interface ContentPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  platforms: string[];
  status: PostStatus;
  scheduled_at: string | null;
  published_at: string | null;
  theme: string | null;
  style: string | null;
  hashtags: string[];
  media_urls: string[];
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePostInput {
  title: string;
  content?: string;
  platforms?: string[];
  status?: PostStatus;
  scheduled_at?: string;
  theme?: string;
  style?: string;
  hashtags?: string[];
  media_urls?: string[];
  ai_generated?: boolean;
}

export interface UpdatePostInput extends Partial<CreatePostInput> {
  id: string;
}

// ---------- Query Keys ----------

const QUERY_KEY = ['content-posts'] as const;

// ---------- Hooks ----------

/** List all content posts, optionally filtered by status */
export function useContentPosts(status?: PostStatus) {
  const qs = status ? `?status=${status}` : '';
  return useQuery<ContentPost[]>({
    queryKey: [...QUERY_KEY, status ?? 'all'],
    queryFn: () => apiFetch<ContentPost[]>(`/content${qs}`),
  });
}

/** Get a single content post by ID */
export function useContentPost(id: string | undefined) {
  return useQuery<ContentPost>({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => apiFetch<ContentPost>(`/content/${id}`),
    enabled: !!id,
  });
}

/** Create a single post */
export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePostInput) =>
      apiFetch<ContentPost>('/content', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

/** Update a post */
export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdatePostInput) =>
      apiFetch<ContentPost>(`/content/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

/** Delete a post */
export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/content/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

/** Batch create multiple posts */
export function useBatchCreatePosts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (posts: CreatePostInput[]) =>
      apiFetch<ContentPost[]>('/content/batch', {
        method: 'POST',
        body: JSON.stringify({ posts }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
