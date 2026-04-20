/**
 * ApiKeyBanner - 顶部引导 Banner
 * 未配置 Google AI API Key 时显示，跳转设置页
 */
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { hasStoredApiKey } from "@/hooks/use-api-key";

interface ApiKeyBannerProps {
  /** 自定义说明文字（覆盖默认描述） */
  description?: string;
  /** 额外的 className，控制外层间距 */
  className?: string;
}

export default function ApiKeyBanner({ description, className = "" }: ApiKeyBannerProps) {
  if (hasStoredApiKey()) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Link
        to="/settings"
        className="block px-4 py-3 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs">
            <span className="font-medium">💡 配置 Google AI API Key</span>
            <span className="text-muted-foreground ml-1">
              {description || "后，AI 助手、智能回复、产品机器人等功能将自动激活"}
            </span>
            <span className="text-primary ml-1">→ 前往设置</span>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
