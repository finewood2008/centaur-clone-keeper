/**
 * useInquiries — 询盘 + 消息 CRUD hooks
 * 本地 API 版本，替代 Supabase
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export interface Inquiry {
  id: string;
  user_id: string;
  customer_id: string | null;
  name: string;
  company: string | null;
  email: string | null;
  avatar: string | null;
  channel: "Email" | "独立站" | "Instagram" | "Facebook" | "Twitter";
  subject: string | null;
  last_message: string | null;
  priority: "high" | "medium" | "low";
  ai_score: number;
  unread: boolean;
  status: "open" | "replied" | "closed";
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  inquiry_id: string;
  sender: "customer" | "ai" | "user";
  text: string;
  subject: string | null;
  ai_generated: boolean;
  created_at: string;
}

export interface InquiryWithMessages extends Inquiry {
  messages: Message[];
}

export function useInquiries() {
  return useQuery<Inquiry[]>({
    queryKey: ["inquiries"],
    queryFn: () => apiFetch<Inquiry[]>("/inquiries"),
  });
}

export function useInquiry(id: string | undefined) {
  return useQuery<InquiryWithMessages>({
    queryKey: ["inquiry", id],
    queryFn: () => apiFetch<InquiryWithMessages>(`/inquiries/${id}`),
    enabled: !!id,
  });
}

export function useCreateInquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Inquiry>) =>
      apiFetch<Inquiry>("/inquiries", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inquiries"] }),
  });
}

export function useUpdateInquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Inquiry> & { id: string }) =>
      apiFetch<Inquiry>(`/inquiries/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["inquiries"] });
      qc.invalidateQueries({ queryKey: ["inquiry", vars.id] });
    },
  });
}

export function useDeleteInquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/inquiries/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inquiries"] }),
  });
}

export function useMessages(inquiryId: string | undefined) {
  return useQuery<Message[]>({
    queryKey: ["messages", inquiryId],
    queryFn: async () => {
      const data = await apiFetch<InquiryWithMessages>(
        `/inquiries/${inquiryId}`
      );
      return data.messages || [];
    },
    enabled: !!inquiryId,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      inquiryId,
      text,
      sender,
      subject,
      ai_generated,
    }: {
      inquiryId: string;
      text: string;
      sender: "customer" | "ai" | "user";
      subject?: string;
      ai_generated?: boolean;
    }) =>
      apiFetch<Message>(`/inquiries/${inquiryId}/messages`, {
        method: "POST",
        body: JSON.stringify({ text, sender, subject, ai_generated }),
      }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["inquiry", vars.inquiryId] });
      qc.invalidateQueries({ queryKey: ["messages", vars.inquiryId] });
      qc.invalidateQueries({ queryKey: ["inquiries"] });
    },
  });
}
