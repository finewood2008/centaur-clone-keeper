/**
 * CustomerDistributionMap - 客户全球分布可视化地图
 * Uses a simplified SVG world map with positioned bubbles for each region.
 */
import { useState } from "react";
import { Globe, Users, DollarSign, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegionData {
  id: string;
  name: string;
  flag: string;
  customers: number;
  value: string;
  valueNum: number;
  growth: string;
  topClients: string[];
  // Position on the map (percentage-based)
  x: number;
  y: number;
}

const regions: RegionData[] = [
  { id: "us", name: "北美", flag: "🇺🇸", customers: 42, value: "$380K", valueNum: 380000, growth: "+18%", topClients: ["TechCorp Ltd.", "Pacific Trading"], x: 22, y: 38 },
  { id: "eu", name: "欧洲", flag: "🇪🇺", customers: 35, value: "$295K", valueNum: 295000, growth: "+12%", topClients: ["EuroTrade GmbH", "Nordic Supply"], x: 48, y: 30 },
  { id: "me", name: "中东", flag: "🇦🇪", customers: 18, value: "$128K", valueNum: 128000, growth: "+25%", topClients: ["MidEast Import Co."], x: 56, y: 42 },
  { id: "ea", name: "东亚", flag: "🇯🇵", customers: 28, value: "$210K", valueNum: 210000, growth: "+8%", topClients: ["Japan Direct Co."], x: 78, y: 38 },
  { id: "sa", name: "南美", flag: "🇧🇷", customers: 12, value: "$65K", valueNum: 65000, growth: "+32%", topClients: ["Brazil Imports"], x: 28, y: 68 },
  { id: "af", name: "非洲", flag: "🌍", customers: 8, value: "$42K", valueNum: 42000, growth: "+45%", topClients: ["Lagos Trading Co."], x: 50, y: 58 },
  { id: "oc", name: "大洋洲", flag: "🇦🇺", customers: 13, value: "$80K", valueNum: 80000, growth: "+15%", topClients: ["Pacific Trading Inc."], x: 82, y: 68 },
];

const maxValue = Math.max(...regions.map((r) => r.valueNum));

export default function CustomerDistributionMap() {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const activeRegion = regions.find((r) => r.id === (selectedRegion || hoveredRegion));

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold">客户全球分布</span>
          <span className="text-[10px] text-muted-foreground">156 位客户 · 7 个地区</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Map Area */}
        <div className="flex-1 relative min-h-[260px] p-4">
          {/* Grid background */}
          <div className="absolute inset-4 rounded-lg bg-secondary/20 overflow-hidden">
            {/* Subtle grid lines */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-foreground" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Simplified continent outlines */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.08]" viewBox="0 0 100 80" preserveAspectRatio="none">
              {/* North America */}
              <path d="M12,18 Q18,12 28,15 L32,20 Q30,30 25,35 L18,38 Q14,35 12,28Z" fill="currentColor" className="text-foreground" />
              {/* South America */}
              <path d="M22,45 Q28,42 30,48 L32,55 Q30,65 26,70 L22,68 Q20,58 22,45Z" fill="currentColor" className="text-foreground" />
              {/* Europe */}
              <path d="M42,16 Q48,12 54,15 L56,22 Q54,28 50,30 L44,28 Q42,24 42,16Z" fill="currentColor" className="text-foreground" />
              {/* Africa */}
              <path d="M44,35 Q50,32 54,36 L56,45 Q55,55 50,62 L46,60 Q43,50 44,35Z" fill="currentColor" className="text-foreground" />
              {/* Asia */}
              <path d="M56,14 Q65,10 80,16 L84,25 Q82,35 75,38 L65,36 Q58,30 56,14Z" fill="currentColor" className="text-foreground" />
              {/* Oceania */}
              <path d="M75,55 Q82,52 88,56 L86,62 Q82,66 76,64Z" fill="currentColor" className="text-foreground" />
            </svg>

            {/* Connection lines between regions */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              {regions.map((r1, i) =>
                regions.slice(i + 1).map((r2) => (
                  <line
                    key={`${r1.id}-${r2.id}`}
                    x1={`${r1.x}%`} y1={`${r1.y}%`}
                    x2={`${r2.x}%`} y2={`${r2.y}%`}
                    stroke="hsl(var(--primary))"
                    strokeWidth="0.5"
                    opacity={hoveredRegion === r1.id || hoveredRegion === r2.id ? 0.25 : 0.04}
                    className="transition-opacity duration-300"
                  />
                ))
              )}
            </svg>

            {/* Region bubbles */}
            {regions.map((region) => {
              const size = 16 + (region.valueNum / maxValue) * 28;
              const isActive = hoveredRegion === region.id || selectedRegion === region.id;
              return (
                <button
                  key={region.id}
                  className={cn(
                    "absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-all duration-300 group cursor-pointer",
                    isActive
                      ? "ring-2 ring-primary/50 scale-125 z-20"
                      : "hover:scale-110 z-10"
                  )}
                  style={{
                    left: `${region.x}%`,
                    top: `${region.y}%`,
                    width: size,
                    height: size,
                  }}
                  onMouseEnter={() => setHoveredRegion(region.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => setSelectedRegion(selectedRegion === region.id ? null : region.id)}
                >
                  {/* Pulse ring */}
                  <span className={cn(
                    "absolute inset-0 rounded-full bg-primary/20 animate-ping",
                    isActive ? "opacity-60" : "opacity-0"
                  )} style={{ animationDuration: "2s" }} />
                  {/* Bubble */}
                  <span className={cn(
                    "absolute inset-0 rounded-full transition-colors duration-300",
                    isActive ? "bg-primary/40 border border-primary/60" : "bg-primary/20 border border-primary/30"
                  )} />
                  {/* Label */}
                  <span className="relative text-[9px] font-bold text-primary-foreground mix-blend-normal">
                    {region.flag}
                  </span>
                  {/* Tooltip */}
                  <div className={cn(
                    "absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg transition-all duration-200 pointer-events-none z-30",
                    isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
                  )}>
                    <div className="text-[10px] font-semibold">{region.flag} {region.name}</div>
                    <div className="text-[10px] text-muted-foreground">{region.customers} 客户 · {region.value}</div>
                    <div className="text-[10px] text-brand-green font-medium">{region.growth}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Side Panel - Region Stats */}
        <div className="lg:w-56 border-t lg:border-t-0 lg:border-l border-border p-3 space-y-2">
          <div className="text-[10px] text-muted-foreground font-medium mb-2">
            {activeRegion ? `${activeRegion.flag} ${activeRegion.name}` : "按地区分布"}
          </div>

          {activeRegion ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-secondary/30 rounded-lg p-2">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5">
                    <Users className="w-2.5 h-2.5" /> 客户数
                  </div>
                  <div className="text-sm font-bold">{activeRegion.customers}</div>
                </div>
                <div className="bg-secondary/30 rounded-lg p-2">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5">
                    <DollarSign className="w-2.5 h-2.5" /> 总价值
                  </div>
                  <div className="text-sm font-bold text-primary">{activeRegion.value}</div>
                </div>
              </div>
              <div className="bg-secondary/30 rounded-lg p-2">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5">
                  <TrendingUp className="w-2.5 h-2.5" /> 增长率
                </div>
                <div className="text-sm font-bold text-brand-green">{activeRegion.growth}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground mb-1">主要客户</div>
                {activeRegion.topClients.map((c) => (
                  <div key={c} className="text-[11px] font-medium py-0.5">{c}</div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              {regions
                .sort((a, b) => b.valueNum - a.valueNum)
                .map((r) => (
                  <button
                    key={r.id}
                    className="w-full flex items-center gap-2 p-1.5 rounded-md hover:bg-secondary/30 transition-colors text-left"
                    onMouseEnter={() => setHoveredRegion(r.id)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    onClick={() => setSelectedRegion(r.id)}
                  >
                    <span className="text-sm">{r.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-medium truncate">{r.name}</div>
                      <div className="text-[10px] text-muted-foreground">{r.customers} 客户</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-bold text-primary">{r.value}</div>
                      <div className="text-[10px] text-brand-green">{r.growth}</div>
                    </div>
                    {/* Mini bar */}
                    <div className="w-10 h-1 bg-secondary rounded-full overflow-hidden shrink-0">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(r.valueNum / maxValue) * 100}%` }} />
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
