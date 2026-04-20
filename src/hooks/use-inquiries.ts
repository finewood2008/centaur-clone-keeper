/**
 * useInquiries + useMessages - 询盘 & 消息 CRUD hooks
 * 连接 Supabase inquiries + messages 表
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Inquiry = Tables<"inquiries">;
export type InquiryInsert = TablesInsert<"inquiries">;
export type InquiryUpdate = TablesUpdate<"inquiries">;
export type Message = Tables<"messages">;
export type MessageInsert = TablesInsert<"messages">;

// ============================================================================
// INQUIRIES
// ============================================================================

export function useInquiries() {
  return useQuery({
    queryKey: ["inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as Inquiry[];
    },
  });
}

export function useInquiry(id: string | undefined) {
  return useQuery({
    queryKey: ["inquiries", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Inquiry;
    },
    enabled: !!id,
  });
}

export function useUpdateInquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: InquiryUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("inquiries")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Inquiry;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inquiries"] }),
  });
}

// ============================================================================
// MESSAGES
// ============================================================================

export function useMessages(inquiryId: string | undefined) {
  return useQuery({
    queryKey: ["messages", inquiryId],
    queryFn: async () => {
      if (!inquiryId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("inquiry_id", inquiryId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!inquiryId,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (message: MessageInsert) => {
      const { data, error } = await supabase
        .from("messages")
        .insert(message)
        .select()
        .single();
      if (error) throw error;

      // Also update the inquiry's last_message and unread status
      await supabase
        .from("inquiries")
        .update({
          last_message: message.text.substring(0, 200),
          status: message.sender === "user" ? "replied" : undefined,
        })
        .eq("id", message.inquiry_id);

      return data as Message;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["messages", data.inquiry_id] });
      qc.invalidateQueries({ queryKey: ["inquiries"] });
    },
  });
}
