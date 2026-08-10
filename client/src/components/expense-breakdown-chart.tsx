import { PieChart as PieChartIcon } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExpenseBreakdown } from "@shared/schema";

interface ExpenseBreakdownChartProps {
  data: ExpenseBreakdown[] | null;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--primary))",
];

interface CustomTooltipItem {
  payload: ExpenseBreakdown;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: CustomTooltipItem[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.[0]?.payload) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-md bg-popover border border-popover-border p-3 shadow-md text-sm">
      <p className="font-medium">{item.category}</p>
      <div className="flex items-center justify-between gap-4 mt-1">
        <span className="text-muted-foreground">Amount</span>
        <span className="font-medium">${item.amount.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">Share</span>
        <span className="font-medium">{item.percentage}%</span>
      </div>
    </div>
  );
}

export function ExpenseBreakdownChart({ data }: ExpenseBreakdownChartProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <PieChartIcon className="w-4 h-4 text-primary" />
          Expense Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <div data-testid="chart-expense-breakdown">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="amount"
                    nameKey="category"
                    strokeWidth={2}
                    stroke="hsl(var(--card))"
                  >
                    {data.map((_entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
              {data.map((item, index) => (
                <div key={item.category} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-muted-foreground truncate">{item.category}</span>
                  <span className="font-medium ml-auto">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <PieChartIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No data available</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
