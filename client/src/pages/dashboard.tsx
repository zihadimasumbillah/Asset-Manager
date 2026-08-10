import { useQuery } from "@tanstack/react-query";
import { Activity, TrendingUp, Shield } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";

import { AiCommentary } from "@/components/ai-commentary";
import { AnomalyFeed } from "@/components/anomaly-feed";
import { ExpenseBreakdownChart } from "@/components/expense-breakdown-chart";
import { FileUpload } from "@/components/file-upload";
import { HealthScoreCard } from "@/components/health-score-card";
import { ProcessingOverlay } from "@/components/processing-overlay";
import { ReportHistory } from "@/components/report-history";
import { RevenueExpensesChart } from "@/components/revenue-expenses-chart";
import type { FinancialReport } from "@shared/schema";

export default function Dashboard() {
  const [activeReportId, setActiveReportId] = useState<string | null>(null);

  const { data: reports, refetch: refetchReports } = useQuery<FinancialReport[]>({
    queryKey: ["/api/reports"],
  });

  const { data: activeReport } = useQuery<FinancialReport>({
    queryKey: [`/api/reports/${activeReportId}`],
    enabled: !!activeReportId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data || data.status === "processing") {
        return 2000;
      }
      return false;
    },
  });

  const isCompleted = activeReport?.status === "completed";
  const isProcessing = !!activeReportId && (!activeReport || activeReport.status === "processing");

  useEffect(() => {
    if (isCompleted) {
      void refetchReports();
    }
  }, [isCompleted, refetchReports]);

  const latestCompleted = useMemo(() => reports?.find((r) => r.status === "completed"), [reports]);

  const displayReport = useMemo(
    () => (activeReport?.status === "completed" ? activeReport : latestCompleted),
    [activeReport, latestCompleted]
  );

  const safeReports = useMemo(() => reports ?? [], [reports]);

  const handleUploadSuccess = useCallback((reportId: string) => {
    setActiveReportId(reportId);
  }, []);

  const handleSelectReport = useCallback((reportId: string) => {
    setActiveReportId(reportId);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight" data-testid="text-app-title">
                FinPulse
              </h1>
              <p className="text-xs text-muted-foreground">Financial Health Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>AI-Powered Analysis</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>Real-Time Monitoring</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-6">
        {isProcessing && <ProcessingOverlay />}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <FileUpload onUploadSuccess={handleUploadSuccess} />
            <HealthScoreCard score={displayReport?.healthScore ?? null} />
            <ReportHistory
              reports={safeReports}
              activeReportId={activeReportId}
              onSelectReport={handleSelectReport}
            />
          </div>

          <div className="lg:col-span-8 space-y-6">
            <RevenueExpensesChart data={displayReport?.chartData ?? null} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ExpenseBreakdownChart data={displayReport?.expenseBreakdown ?? null} />
              <AnomalyFeed anomalies={displayReport?.anomalies ?? null} />
            </div>
            <AiCommentary commentary={displayReport?.aiCommentary ?? null} />
          </div>
        </div>
      </main>
    </div>
  );
}
