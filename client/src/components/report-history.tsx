import {
  History,
  FileSpreadsheet,
  Loader2,
  Search,
  Trash2,
  Download,
  GitCompare,
} from "lucide-react";
import { memo, useState, useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { FinancialReport } from "@shared/schema";

export interface ReportHistoryProps {
  reports: FinancialReport[];
  activeReportId: string | null;
  onSelectReport: (id: string) => void;
  onDeleteReport?: (id: string) => void | Promise<void>;
  onExportReport?: (id: string) => void | Promise<void>;
  compareIds?: string[];
  onToggleCompare?: (id: string) => void;
  onClearCompare?: () => void;
}

function getStatusBadge(status: string) {
  if (status === "completed") return <Badge variant="secondary">Completed</Badge>;
  if (status === "processing")
    return (
      <Badge variant="default">
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        Processing
      </Badge>
    );
  return <Badge variant="destructive">Failed</Badge>;
}

function getHealthScoreBadge(score: number | null) {
  if (score === null) return null;
  if (score >= 80)
    return (
      <Badge variant="secondary" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
        Excellent
      </Badge>
    );
  if (score >= 60)
    return (
      <Badge variant="secondary" className="bg-chart-3/10 text-chart-3 border-chart-3/20">
        Good
      </Badge>
    );
  if (score >= 40)
    return (
      <Badge variant="secondary" className="bg-chart-5/10 text-chart-5 border-chart-5/20">
        Fair
      </Badge>
    );
  return <Badge variant="destructive">Critical</Badge>;
}

export const ReportHistory = memo(function ReportHistory({
  reports,
  activeReportId,
  onSelectReport,
  onDeleteReport,
  onExportReport,
  compareIds = [],
  onToggleCompare,
  onClearCompare,
}: ReportHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const { toast } = useToast();

  const filteredReports = useMemo(() => {
    let result = [...reports];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r) => r.fileName?.toLowerCase().includes(q));
    }

    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }

    const toTime = (value: string | Date | null | undefined) => {
      if (!value) return 0;
      const date = value instanceof Date ? value : new Date(value);
      const time = date.getTime();
      return Number.isFinite(time) ? time : 0;
    };

    result.sort((a, b) => {
      if (sortBy === "newest") {
        return toTime(b.createdAt) - toTime(a.createdAt);
      }
      if (sortBy === "oldest") {
        return toTime(a.createdAt) - toTime(b.createdAt);
      }
      if (sortBy === "health-high") {
        return (b.healthScore ?? -1) - (a.healthScore ?? -1);
      }
      if (sortBy === "health-low") {
        return (a.healthScore ?? 999) - (b.healthScore ?? 999);
      }
      return 0;
    });

    return result;
  }, [reports, searchQuery, statusFilter, sortBy]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!onDeleteReport) return;
    void onDeleteReport(id);
    toast({ title: "Report deleted", description: "The report has been removed." });
  };

  const handleExport = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!onExportReport) return;
    void onExportReport(id);
    toast({ title: "Export started", description: "Your report is being downloaded." });
  };

  const handleToggleCompare = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!onToggleCompare) return;
    if (compareIds.includes(id)) {
      onToggleCompare(id);
    } else if (compareIds.length < 2) {
      onToggleCompare(id);
    } else {
      toast({
        title: "Compare limit",
        description: "You can compare up to 2 reports.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          Report History
          {compareIds.length > 0 && (
            <Badge variant="default" className="ml-auto">
              <GitCompare className="w-3 h-3 mr-1" />
              {compareIds.length}/2
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
              data-testid="input-search-reports"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 flex-1" data-testid="select-status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-9 flex-1" data-testid="select-sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="health-high">Health: High to Low</SelectItem>
                <SelectItem value="health-low">Health: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {compareIds.length === 2 && (
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8"
              onClick={onClearCompare}
              data-testid="button-clear-compare"
            >
              <GitCompare className="w-3 h-3 mr-1" />
              Clear Comparison
            </Button>
          )}
        </div>

        {filteredReports.length > 0 ? (
          <ScrollArea className="h-[320px] pr-2">
            <div className="space-y-2">
              {filteredReports.map((report) => {
                const isCompareSelected = compareIds.includes(report.id);
                const isCompareFull = compareIds.length >= 2 && !isCompareSelected;
                return (
                  <div key={report.id} className="group">
                    <button
                      onClick={() => onSelectReport(report.id)}
                      className={`w-full text-left rounded-md p-3 transition-colors hover-elevate ${
                        activeReportId === report.id ? "bg-primary/10" : "bg-muted/40"
                      } ${isCompareSelected ? "ring-2 ring-primary ring-offset-1" : ""}`}
                      data-testid={`button-report-${report.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <FileSpreadsheet className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-sm font-medium truncate">
                            {report.fileName || "Untitled Report"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {getStatusBadge(report.status)}
                          {report.healthScore !== null && getHealthScoreBadge(report.healthScore)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-1.5 ml-6">
                        <p className="text-xs text-muted-foreground">
                          {report.createdAt &&
                            new Date(report.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                        </p>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {report.status === "completed" && (
                            <>
                              <button
                                onClick={(e) => handleToggleCompare(e, report.id)}
                                disabled={isCompareFull}
                                className={`p-1 rounded hover:bg-muted transition-colors ${isCompareSelected ? "text-primary" : "text-muted-foreground"}`}
                                title={isCompareSelected ? "Remove from compare" : "Add to compare"}
                                data-testid={`button-compare-${report.id}`}
                              >
                                <GitCompare className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleExport(e, report.id)}
                                className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"
                                title="Export report"
                                data-testid={`button-export-${report.id}`}
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={(e) => handleDelete(e, report.id)}
                            className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            title="Delete report"
                            data-testid={`button-delete-${report.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No reports match your filters</p>
            {(searchQuery || statusFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
