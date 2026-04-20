/**
 * useDashboardStats — 仪表盘统计数据
 * 一次 API 调用获取全部聚合数据
 */
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export interface DashboardData {
  customers: { total: number; active: number; tierA: number };
  products: { total: number; active: number; totalViews: number };
  inquiries: { total: number; open: number; unread: number; highPriority: number };
  revenue: { total: number; orders: number };
  recentInquiries: Array<{
    id: string;
    name: string;
    company: string;
    channel: string;
    subject: string;
    last_message: string;
    priority: string;
    ai_score: number;
    unread: boolean;
    status: string;
    created_at: string;
  }>;
  topCustomers: Array<{
    id: string;
    name: string;
    company: string;
    country: string;
    tier: string;
    ai_score: number;
    total_orders: number;
    total_value: number;
    status: string;
  }>;
  channelDistribution: Array<{ channel: string; count: number }>;
}

export function useDashboardStats() {
  const query = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => apiFetch<DashboardData>("/dashboard"),
    refetchInterval: 30000,
  });

  const data = query.data;

  return {
    ...query,
    // Convenience accessors matching old hook interface
    totalCustomers: data?.customers.total ?? 0,
    activeCustomers: data?.customers.active ?? 0,
    monthlyInquiries: data?.inquiries.total ?? 0,
    unreadMessages: data?.inquiries.unread ?? 0,
    automationRate: 0,
    conversionRate: 0,
  };
}
