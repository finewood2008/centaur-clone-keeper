/**
 * useInboxRealtime - 订阅 inquiries / messages 表的实时变更
 * 收到 INSERT/UPDATE 后失效对应的 React Query 缓存，触发自动刷新
 */
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useInboxRealtime(currentInquiryId?: string | null) {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("inbox-realtime")
      // 询盘表：新询盘 / 已读状态 / 最新消息变化
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inquiries" },
        () => {
          qc.invalidateQueries({ queryKey: ["inquiries"] });
        }
      )
      // 消息表：所有新消息 → 失效该询盘的消息列表 + 询盘列表（更新 last_message）
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const inquiryId = (payload.new as { inquiry_id?: string })?.inquiry_id;
          if (inquiryId) {
            qc.invalidateQueries({ queryKey: ["messages", inquiryId] });
          }
          qc.invalidateQueries({ queryKey: ["inquiries"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc, currentInquiryId]);
}
