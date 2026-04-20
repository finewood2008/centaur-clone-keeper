/**
 * useDashboardStats - 从 customers/inquiries 表实时统计 Dashboard KPI
 * - 客户总数
 * - 本月新询盘数
 * - AI 自动化率（AI 生成消息数 / 总消息数）
 * - 转化率（active 客户 / 客户总数）
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  totalCustomers: number;
  monthlyInquiries: number;
  automationRate: number;
  conversionRate: number;
  unreadInquiries: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [customersRes, monthlyInqRes, unreadInqRes, activeCustRes, msgsRes, aiMsgsRes] = await Promise.all([
        supabase.from("customers").select("*", { count: "exact", head: true }),
        supabase
          .from("inquiries")
          .select("*", { count: "exact", head: true })
          .gte("created_at", startOfMonth.toISOString()),
        supabase
          .from("inquiries")
          .select("*", { count: "exact", head: true })
          .eq("unread", true),
        supabase
          .from("customers")
          .select("*", { count: "exact", head: true })
          .eq("status", "active"),
        supabase.from("messages").select("*", { count: "exact", head: true }),
        supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("ai_generated", true),
      ]);

      const totalCustomers = customersRes.count ?? 0;
      const monthlyInquiries = monthlyInqRes.count ?? 0;
      const unreadInquiries = unreadInqRes.count ?? 0;
      const activeCustomers = activeCustRes.count ?? 0;
      const totalMsgs = msgsRes.count ?? 0;
      const aiMsgs = aiMsgsRes.count ?? 0;

      return {
        totalCustomers,
        monthlyInquiries,
        unreadInquiries,
        automationRate: totalMsgs > 0 ? Math.round((aiMsgs / totalMsgs) * 100) : 0,
        conversionRate: totalCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : 0,
      };
    },
    refetchInterval: 30000,
  });
}
