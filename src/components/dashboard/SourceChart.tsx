/**
 * SourceChart - 询盘来源分布饼图 (Glassmorphism)
 */
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const sourceData = [
  { name: "WhatsApp", value: 45, color: "#25D366" },
  { name: "Email", value: 30, color: "#EA4335" },
  { name: "LinkedIn", value: 15, color: "#0A66C2" },
  { name: "网站表单", value: 10, color: "#6366F1" },
];

interface SourceChartProps {
  selectedSource: string | null;
  onSourceClick: (source: string | null) => void;
}

export default function SourceChart({ selectedSource, onSourceClick }: SourceChartProps) {
  const total = sourceData.reduce((s, d) => s + d.value, 0);

  const handleClick = (_: unknown, index: number) => {
    const name = sourceData[index].name;
    onSourceClick(selectedSource === name ? null : name);
  };

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="mb-4">
        <h3 className="font-display font-semibold text-sm text-foreground">询盘来源分布</h3>
        <p className="text-[11px] text-white/35">各渠道询盘占比</p>
      </div>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width="50%" height={180}>
          <PieChart>
            <Pie
              data={sourceData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
              onClick={handleClick}
              className="cursor-pointer"
            >
              {sourceData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.color}
                  opacity={selectedSource && selectedSource !== entry.name ? 0.3 : 1}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "hsla(225,15%,8%,0.9)",
                backdropFilter: "blur(16px)",
                border: "1px solid hsla(0,0%,100%,0.1)",
                borderRadius: 12,
                fontSize: 11,
                boxShadow: "0 8px 32px hsla(0,0%,0%,0.4)",
              }}
              formatter={(value: number, name: string) => [`${value}条 (${((value / total) * 100).toFixed(0)}%)`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2.5">
          {sourceData.map((item) => (
            <button
              key={item.name}
              onClick={() => onSourceClick(selectedSource === item.name ? null : item.name)}
              className={`flex items-center gap-2 w-full text-left transition-opacity ${
                selectedSource && selectedSource !== item.name ? "opacity-40" : ""
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: item.color }} />
              <span className="text-xs text-foreground flex-1">{item.name}</span>
              <span className="text-xs font-medium text-foreground">{item.value}</span>
              <span className="text-[10px] text-white/30 w-8 text-right">
                {((item.value / total) * 100).toFixed(0)}%
              </span>
            </button>
          ))}
        </div>
      </div>
      {selectedSource && (
        <div className="mt-3 text-[10px] text-primary flex items-center gap-1">
          <span>已筛选: {selectedSource}</span>
          <button onClick={() => onSourceClick(null)} className="underline hover:no-underline">清除</button>
        </div>
      )}
    </div>
  );
}
