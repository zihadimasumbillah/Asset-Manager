import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, TrendingUp, Shield } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";

import { AiCommentary } from "@/components/ai-commentary";
import { AnomalyFeed } from "@/components/anomaly-feed";
import { CompareView } from "@/components/compare-view";
import { ExpenseBreakdownChart } from "@/components/expense-breakdown-chart";
import { FileUpload } from "@/components/file-upload";
import { HealthScoreCard } from "@/components/health-score-card";
import { ProcessingOverlay } from "@/components/processing-overlay";
import { ReportHistory } from "@/components/report-history";
import { RevenueExpensesChart } from "@/components/revenue-expenses-chart";
import { StatsCards } from "@/components/stats-cards";
import type { FinancialReport } from "@shared/schema";

export default function Dashboard() {
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: reports, refetch: refetchReports } = useQuery<FinancialReport[]>({
    queryKey: ["/api/reports"],
  });

  const { data: stats } = useQuery<{
    totalReports: number;
    completedReports: number;
    processingReports: number;
    failedReports: number;
    avgHealthScore: number | null;
    totalAnomalies: number;
    highSeverityAnomalies: number;
  }>({
    queryKey: ["/api/stats"],
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
      void queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    }
  }, [isCompleted, refetchReports, queryClient]);

  const latestCompleted = useMemo(() => reports?.find((r) => r.status === "completed"), [reports]);

  const displayReport = useMemo(
    () => (activeReport?.status === "completed" ? activeReport : latestCompleted),
    [activeReport, latestCompleted]
  );

  const safeReports = useMemo(() => reports ?? [], [reports]);

  const handleUploadSuccess = useCallback((reportId: string) => {
    setActiveReportId(reportId);
  }, []);

  const handleDeleteReport = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({ message: "Delete failed" }))) as {
          message?: string;
        };
        throw new Error(err.message || "Delete failed");
      }
      if (activeReportId === id) {
        setActiveReportId(null);
      }
      setCompareIds((prev) => prev.filter((cid) => cid !== id));
      await queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    [activeReportId, queryClient]
  );

  const handleExportReport = useCallback(async (id: string) => {
    const res = await fetch(`/api/reports/export/${id}`);
    if (!res.ok) {
      const err = (await res.json().catch(() => ({ message: "Export failed" }))) as {
        message?: string;
      };
      throw new Error(err.message || "Export failed");
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report_${id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, []);

  const handleToggleCompare = useCallback((id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((cid) => cid !== id);
      }
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  }, []);

  const handleClearCompare = useCallback(() => {
    setCompareIds([]);
  }, []);

  const compareReports = useMemo((): [FinancialReport | null, FinancialReport | null] => {
    if (compareIds.length !== 2) return [null, null];
    return [
      safeReports.find((r) => r.id === compareIds[0]) ?? null,
      safeReports.find((r) => r.id === compareIds[1]) ?? null,
    ];
  }, [compareIds, safeReports]);

  const handleCompareSelect = useCallback((id: string) => {
    setActiveReportId(id);
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev;
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <header className="border-b border-border/60 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight" data-testid="text-app-title">
                FinPulse
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                Financial Health Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
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

      <main className="max-w-[1440px] mx-auto px-6 py-8">
        {isProcessing && <ProcessingOverlay />}

        <div className="mb-8">
          <StatsCards stats={stats} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <FileUpload onUploadSuccess={handleUploadSuccess} />
            <HealthScoreCard score={displayReport?.healthScore ?? null} />
            <ReportHistory
              reports={safeReports}
              activeReportId={activeReportId}
              onSelectReport={handleCompareSelect}
              onDeleteReport={handleDeleteReport}
              onExportReport={handleExportReport}
              compareIds={compareIds}
              onToggleCompare={handleToggleCompare}
              onClearCompare={handleClearCompare}
            />
          </div>

          <div className="lg:col-span-8 space-y-6">
            {compareIds.length === 2 && (
              <CompareView reports={compareReports} onClear={handleClearCompare} />
            )}
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
