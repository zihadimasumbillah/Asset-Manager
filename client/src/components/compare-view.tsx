import { CheckCircle2, X } from "lucide-react";
import { memo } from "react";

import { AnomalyFeed } from "@/components/anomaly-feed";
import { ExpenseBreakdownChart } from "@/components/expense-breakdown-chart";
import { RevenueExpensesChart } from "@/components/revenue-expenses-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FinancialReport } from "@shared/schema";

export interface CompareViewProps {
  reports: [FinancialReport | null, FinancialReport | null];
  onClear: () => void;
}

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export const CompareView = memo(function CompareView({ reports, onClear }: CompareViewProps) {
  const [left, right] = reports;

  if (!left && !right) return null;

  const renderEmptySlot = (_side: "left" | "right") => (
    <Card className="h-full flex items-center justify-center">
      <CardContent className="text-center text-muted-foreground py-12">
        <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Select a report to compare</p>
      </CardContent>
    </Card>
  );

  const renderReport = (report: FinancialReport | null, side: "left" | "right") => {
    if (!report) return renderEmptySlot(side);

    const totalRevenue = report.chartData?.reduce((sum, d) => sum + d.revenue, 0) ?? 0;
    const totalExpenses = report.chartData?.reduce((sum, d) => sum + d.expenses, 0) ?? 0;
    const avgMonthlyRevenue = report.chartData?.length
      ? Math.round(totalRevenue / report.chartData.length)
      : 0;

    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle
              className="text-sm font-medium truncate flex-1"
              title={report.fileName || undefined}
            >
              {report.fileName || "Untitled"}
            </CardTitle>
            <span className="text-xs text-muted-foreground ml-2">
              {report.createdAt && new Date(report.createdAt).toLocaleDateString()}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Health Score</p>
              <p className="text-lg font-bold" data-testid={`compare-score-${side}`}>
                {report.healthScore ?? "--"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Revenue</p>
              <p className="text-sm font-semibold">{formatCurrency(avgMonthlyRevenue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Net Margin</p>
              <p className="text-sm font-semibold">
                {totalRevenue > 0
                  ? `${Math.round(((totalRevenue - totalExpenses) / totalRevenue) * 100)}%`
                  : "N/A"}
              </p>
            </div>
          </div>
          {report.status === "completed" && report.chartData && report.chartData.length > 0 && (
            <RevenueExpensesChart data={report.chartData} />
          )}
          {report.status === "completed" &&
            report.expenseBreakdown &&
            report.expenseBreakdown.length > 0 && (
              <ExpenseBreakdownChart data={report.expenseBreakdown} />
            )}
          {report.anomalies && report.anomalies.length > 0 && (
            <AnomalyFeed anomalies={report.anomalies} />
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            Report Comparison
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            data-testid="button-clear-compare-view"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderReport(left, "left")}
          {renderReport(right, "right")}
        </div>
      </CardContent>
    </Card>
  );
});
