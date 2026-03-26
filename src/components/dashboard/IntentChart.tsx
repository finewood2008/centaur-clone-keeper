/**
 * IntentChart - AI意图识别分布饼图
 */
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const intentData = [
  { name: "询价", value: 42, color: "#3B82F6" },
  { name: "产品咨询", value: 28, color: "#10B981" },
  { name: "订单跟进", value: 15, color: "#F59E0B" },
  { name: "投诉", value: 8, color: "#EF4444" },
  { name: "闲聊", value: 7, color: "#8B5CF6" },
];

export default function IntentChart() {
  const total = intentData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="mb-4">
        <h3 className="font-display font-semibold text-sm">AI意图识别分布</h3>
        <p className="text-[11px] text-muted-foreground">客户询盘意图分类</p>
      </div>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width="50%" height={180}>
          <PieChart>
            <Pie
              data={intentData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
            >
              {intentData.map((entry, index) => (
                <Cell key={index} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "hsl(230 12% 14%)",
                border: "1px solid hsl(230 10% 23%)",
                borderRadius: 8,
                fontSize: 11,
              }}
              formatter={(value: number, name: string) => [`${value}条 (${((value / total) * 100).toFixed(0)}%)`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2.5">
          {intentData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: item.color }} />
              <span className="text-xs text-foreground flex-1">{item.name}</span>
              <span className="text-xs font-medium text-foreground">{item.value}</span>
              <span className="text-[10px] text-muted-foreground w-8 text-right">
                {((item.value / total) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
