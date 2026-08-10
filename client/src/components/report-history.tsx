import { History, FileSpreadsheet, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FinancialReport } from "@shared/schema";

interface ReportHistoryProps {
  reports: FinancialReport[];
  activeReportId: string | null;
  onSelectReport: (id: string) => void;
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

export function ReportHistory({ reports, activeReportId, onSelectReport }: ReportHistoryProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          Report History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reports.length > 0 ? (
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => onSelectReport(report.id)}
                  className={`w-full text-left rounded-md p-3 transition-colors hover-elevate ${
                    activeReportId === report.id ? "bg-primary/10" : "bg-muted/40"
                  }`}
                  data-testid={`button-report-${report.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileSpreadsheet className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium truncate">
                        {report.fileName || "Untitled Report"}
                      </span>
                    </div>
                    {getStatusBadge(report.status)}
                  </div>
                  {report.createdAt && (
                    <p className="text-xs text-muted-foreground mt-1 ml-6">
                      {new Date(report.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No reports yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
