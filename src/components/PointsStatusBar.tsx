/**
 * 顶部实时点数状态指示 — Premium Pill + Neon progress
 */
import { Link } from "react-router-dom";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";

const total = 15000;
const used = 11550;
const pct = Math.round((used / total) * 100);

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
      className="pill-badge hover:bg-white/[0.08] transition-all group"
    >
      <Coins className={cn("w-3.5 h-3.5", textColor(pct))} />
      <span className="text-white/50 whitespace-nowrap font-mono">
        {(used / 1000).toFixed(1)}K/{(total / 1000).toFixed(1)}K
      </span>
      <div className="w-16 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full neon-progress-bar transition-all"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className={cn("text-[10px] font-semibold", textColor(pct))}>{pct}%</span>
    </Link>
  );
}
