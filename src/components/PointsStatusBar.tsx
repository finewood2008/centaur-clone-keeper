/**
 * 顶部实时点数状态指示 — 嵌入顶部栏
 */
import { Link } from "react-router-dom";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";

const total = 15000;
const used = 11550;
const pct = Math.round((used / total) * 100);

function barColor(p: number) {
  if (p < 70) return "bg-brand-green";
  if (p < 90) return "bg-primary";
  if (p <= 100) return "bg-[hsl(25,90%,50%)]";
  return "bg-destructive";
}
function textColor(p: number) {
  if (p < 70) return "text-brand-green";
  if (p < 90) return "text-primary";
  if (p <= 100) return "text-[hsl(25,90%,50%)]";
  return "text-destructive";
}

export default function PointsStatusBar() {
  return (
    <Link
      to="/billing"
      className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-secondary transition-colors group"
    >
      <Coins className={cn("w-3.5 h-3.5", textColor(pct))} />
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
          {(used / 1000).toFixed(1)}K/{(total / 1000).toFixed(1)}K
        </span>
        <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full transition-all", barColor(pct))} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <span className={cn("text-[10px] font-medium", textColor(pct))}>{pct}%</span>
      </div>
    </Link>
  );
}
