/**
 * ApiKeyGuard - 未配置 API Key 时的引导组件
 * 包裹需要 AI 功能的区域，未配置时显示引导提示
 */
import { Key } from "lucide-react";
import { Link } from "react-router-dom";
import { useHasApiKey } from "@/hooks/use-api-key";

interface ApiKeyGuardProps {
  children: React.ReactNode;
  fallbackMessage?: string;
}

export default function ApiKeyGuard({ children, fallbackMessage }: ApiKeyGuardProps) {
  const hasKey = useHasApiKey();

  if (!hasKey) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <Key className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-sm font-semibold mb-1">需要配置 AI 密钥</h3>
        <p className="text-xs text-muted-foreground mb-3 max-w-xs">
          {fallbackMessage || "请先在设置中配置 Google AI API Key，即可使用 AI 功能"}
        </p>
        <Link
          to="/settings"
          className="text-xs bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
        >
          前往设置
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
