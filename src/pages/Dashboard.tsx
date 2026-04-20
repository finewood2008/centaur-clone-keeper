/**
 * Dashboard - OPC超级工作台控制台
 * Premium Dark Glassmorphism redesign
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import ApiKeyBanner from "@/components/ApiKeyBanner";
import StatsCards from "@/components/dashboard/StatsCards";
import SourceChart from "@/components/dashboard/SourceChart";
import IntentChart from "@/components/dashboard/IntentChart";
import ActivityFeed, { mockActivities } from "@/components/dashboard/ActivityFeed";
import AIStrategyDrawer from "@/components/dashboard/AIStrategyDrawer";
import ResponseTimeDialog from "@/components/dashboard/ResponseTimeDialog";
import SatisfactionDialog from "@/components/dashboard/SatisfactionDialog";
import InquiryTrendChart from "@/components/dashboard/InquiryTrendChart";
import InquiryDialog from "@/components/dashboard/InquiryDialog";

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
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [satisfactionDialogOpen, setSatisfactionDialogOpen] = useState(false);
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);

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
        setInquiryDialogOpen(true);
        break;
      case "automation":
        setStrategyDrawerOpen(true);
        break;
      case "response":
        setResponseDialogOpen(true);
        break;
      case "satisfaction":
        setSatisfactionDialogOpen(true);
        break;
    }
  }, [navigate]);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">
      <ApiKeyBanner />

      {/* Hero Banner with grid background */}
      <motion.div variants={fadeUp} className="relative rounded-2xl overflow-hidden glass-panel p-6 hero-grid-bg">
        <div className="relative z-10">
          <h1 className="font-display text-xl md:text-2xl font-bold mb-1.5 text-metallic">
            OPC 超级工作台
          </h1>
          <p className="text-xs text-white/50">
            AI Agent 7×24小时运转 · 今日已自动处理{" "}
            <span className="text-primary font-bold text-sm">{stats.inquiries}</span> 条询盘，
            自动化率{" "}
            <span className="text-brand-cyan font-bold text-sm">{stats.automationRate}%</span>
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={fadeUp}>
        <StatsCards stats={stats} onCardClick={handleCardClick} />
      </motion.div>

      {/* Trend Chart */}
      <motion.div variants={fadeUp}>
        <InquiryTrendChart />
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
      <ResponseTimeDialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen} />
      <SatisfactionDialog open={satisfactionDialogOpen} onOpenChange={setSatisfactionDialogOpen} />
      <InquiryDialog open={inquiryDialogOpen} onOpenChange={setInquiryDialogOpen} totalInquiries={stats.inquiries} />
    </motion.div>
  );
}
