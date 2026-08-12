import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { memo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface StatsCardsProps {
  stats:
    | {
        totalReports: number;
        completedReports: number;
        processingReports: number;
        failedReports: number;
        avgHealthScore: number | null;
        totalAnomalies: number;
        highSeverityAnomalies: number;
      }
    | null
    | undefined;
}

function StatItem({
  icon: Icon,
  label,
  value,
  subtext,
  colorClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
  colorClass?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${colorClass || "bg-muted"}`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-sm font-semibold truncate">{value}</p>
        {subtext && <p className="text-xs text-muted-foreground truncate">{subtext}</p>}
      </div>
    </div>
  );
}

export const StatsCards = memo(function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Dashboard Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatItem
            icon={FileText}
            label="Total Reports"
            value={stats.totalReports}
            colorClass="bg-primary/10 text-primary"
          />
          <StatItem
            icon={CheckCircle2}
            label="Completed"
            value={stats.completedReports}
            subtext={
              stats.avgHealthScore !== null ? `Avg score: ${stats.avgHealthScore}` : undefined
            }
            colorClass="bg-chart-2/10 text-chart-2"
          />
          <StatItem
            icon={Clock}
            label="Processing"
            value={stats.processingReports}
            colorClass="bg-chart-3/10 text-chart-3"
          />
          <StatItem
            icon={AlertCircle}
            label="Failed"
            value={stats.failedReports}
            colorClass="bg-destructive/10 text-destructive"
          />
          <StatItem
            icon={AlertTriangle}
            label="Anomalies"
            value={stats.totalAnomalies}
            subtext={`${stats.highSeverityAnomalies} high severity`}
            colorClass="bg-chart-5/10 text-chart-5"
          />
          <StatItem
            icon={TrendingUp}
            label="Avg Health"
            value={stats.avgHealthScore !== null ? `${stats.avgHealthScore}/100` : "--"}
            colorClass="bg-chart-4/10 text-chart-4"
          />
        </div>
      </CardContent>
    </Card>
  );
});
