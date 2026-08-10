import { motion } from "framer-motion";
import { HeartPulse } from "lucide-react";
import { memo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface HealthScoreCardProps {
  score: number | null;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-chart-2";
  if (score >= 60) return "text-chart-3";
  return "text-destructive";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Attention";
}

function getScoreRingColor(score: number): string {
  if (score >= 80) return "hsl(var(--chart-2))";
  if (score >= 60) return "hsl(var(--chart-3))";
  return "hsl(var(--destructive))";
}

export const HealthScoreCard = memo(function HealthScoreCard({ score }: HealthScoreCardProps) {
  const circumference = 2 * Math.PI * 54;
  const offset = score !== null ? circumference - (score / 100) * circumference : circumference;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-primary" />
          Financial Health Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        {score !== null ? (
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke={getScoreRingColor(score)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className={`text-3xl font-bold ${getScoreColor(score)}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  data-testid="text-health-score"
                >
                  {score}
                </motion.span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
            </div>
            <span
              className={`text-sm font-medium ${getScoreColor(score)}`}
              data-testid="text-health-label"
            >
              {getScoreLabel(score)}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4 text-muted-foreground">
            <div className="w-32 h-32 rounded-full border-8 border-muted flex items-center justify-center">
              <span className="text-2xl font-bold">--</span>
            </div>
            <span className="text-sm">Upload a report to see your score</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
