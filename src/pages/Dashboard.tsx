/**
 * Dashboard - OPC超级工作台控制台
 * 统一业务监控中心：KPI卡片 + 来源/意图饼图 + 活动流
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import StatsCards from "@/components/dashboard/StatsCards";
import SourceChart from "@/components/dashboard/SourceChart";
import IntentChart from "@/components/dashboard/IntentChart";
import ActivityFeed, { mockActivities } from "@/components/dashboard/ActivityFeed";
import AIStrategyDrawer from "@/components/dashboard/AIStrategyDrawer";
import ResponseTimeDialog from "@/components/dashboard/ResponseTimeDialog";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0, 0, 0.2, 1] as const } },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    inquiries: 26,
    automationRate: 84,
    avgResponseTime: 8,
    satisfaction: 4.7,
  });
  const [activities, setActivities] = useState(mockActivities);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [strategyDrawerOpen, setStrategyDrawerOpen] = useState(false);

  // Simulate real-time refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        inquiries: prev.inquiries + Math.floor(Math.random() * 3),
        automationRate: Math.min(99, prev.automationRate + (Math.random() > 0.5 ? 1 : 0)),
      }));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Simulate new inquiry notification
  useEffect(() => {
    const names = ["David Lee", "Emma Brown", "Carlos Ruiz", "Yuki Tanaka"];
    const sources = ["WhatsApp", "Email", "LinkedIn"];
    const timer = setTimeout(() => {
      const name = names[Math.floor(Math.random() * names.length)];
      const source = sources[Math.floor(Math.random() * sources.length)];
      toast({
        title: "🔔 新询盘到达",
        description: `新询盘来自 ${name} (${source})`,
      });
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  const handleCardClick = useCallback((card: string) => {
    switch (card) {
      case "inquiries":
        navigate("/inbox");
        break;
      case "automation":
        setStrategyDrawerOpen(true);
        break;
      case "response":
      case "satisfaction":
        toast({ title: "功能开发中", description: "详细数据面板即将上线" });
        break;
    }
  }, [navigate]);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">
      {/* Hero */}
      <motion.div variants={fadeUp} className="relative rounded-xl overflow-hidden bg-gradient-to-r from-card via-card to-secondary border border-border p-5">
        <div className="relative z-10">
          <h1 className="font-display text-xl font-bold mb-1">OPC 超级工作台</h1>
          <p className="text-xs text-muted-foreground">
            AI Agent 7×24小时运转 · 今日已自动处理{" "}
            <span className="text-primary font-semibold">{stats.inquiries}</span> 条询盘，
            自动化率{" "}
            <span className="text-brand-green font-semibold">{stats.automationRate}%</span>
          </p>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 bg-gradient-to-l from-primary to-transparent" />
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={fadeUp}>
        <StatsCards stats={stats} onCardClick={handleCardClick} />
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SourceChart selectedSource={selectedSource} onSourceClick={setSelectedSource} />
        <IntentChart />
      </motion.div>

      {/* Activity Feed */}
      <motion.div variants={fadeUp}>
        <ActivityFeed activities={activities} selectedSource={selectedSource} />
      </motion.div>
      <AIStrategyDrawer open={strategyDrawerOpen} onOpenChange={setStrategyDrawerOpen} />
    </motion.div>
  );
}
