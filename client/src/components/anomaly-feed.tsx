import { motion } from "framer-motion";
import { AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Anomaly } from "@shared/schema";

interface AnomalyFeedProps {
  anomalies: Anomaly[] | null;
}

function getSeverityVariant(severity: string): "default" | "secondary" | "destructive" {
  if (severity === "High") return "destructive";
  if (severity === "Medium") return "default";
  return "secondary";
}

export function AnomalyFeed({ anomalies }: AnomalyFeedProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-primary" />
            Anomalies Detected
          </CardTitle>
          {anomalies && anomalies.length > 0 && (
            <Badge variant="secondary" data-testid="badge-anomaly-count">
              {anomalies.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {anomalies && anomalies.length > 0 ? (
          <ScrollArea className="h-[280px] pr-2">
            <div className="space-y-3">
              {anomalies.map((anomaly, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="group rounded-md bg-muted/40 p-3"
                  data-testid={`card-anomaly-${index}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <Badge variant={getSeverityVariant(anomaly.severity)} data-testid={`badge-severity-${index}`}>
                      {anomaly.severity}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs font-medium shrink-0">
                      {anomaly.variance > 0 ? (
                        <ArrowUpRight className="w-3 h-3 text-destructive" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-chart-2" />
                      )}
                      <span
                        className={anomaly.variance > 0 ? "text-destructive" : "text-chart-2"}
                        data-testid={`text-variance-${index}`}
                      >
                        {anomaly.variance > 0 ? "+" : ""}
                        {anomaly.variance}%
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed" data-testid={`text-anomaly-desc-${index}`}>
                    {anomaly.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No anomalies detected</p>
              <p className="text-xs mt-1">Upload a report to begin analysis</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
