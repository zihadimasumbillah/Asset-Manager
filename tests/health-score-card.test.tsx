/**
 * @vitest-environment jsdom
 *
 * Unit tests for the HealthScoreCard React component.
 * Uses @testing-library/react for DOM assertions.
 */

// [FIX-T2] Explicit imports — never rely on globals: true as an implicit dependency
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { HealthScoreCard } from "@/components/health-score-card";

// Silence framer-motion animation warnings in jsdom — motion components are not
// testable in a jsdom environment and are irrelevant to the component's logic.
vi.mock("framer-motion", () => ({
  motion: {
    circle: ({ children, ...props }: React.SVGProps<SVGCircleElement>) => (
      <circle {...props}>{children}</circle>
    ),
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span {...props}>{children}</span>
    ),
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("HealthScoreCard", () => {
  it("renders the placeholder when score is null", () => {
    render(<HealthScoreCard score={null} />);
    expect(screen.getByText("Upload a report to see your score")).toBeInTheDocument();
    expect(screen.queryByTestId("text-health-score")).not.toBeInTheDocument();
  });

  it("renders the score when provided", () => {
    render(<HealthScoreCard score={82} />);
    expect(screen.getByTestId("text-health-score")).toHaveTextContent("82");
  });

  it("shows 'Excellent' label for score >= 80", () => {
    render(<HealthScoreCard score={80} />);
    expect(screen.getByTestId("text-health-label")).toHaveTextContent("Excellent");
  });

  it("shows 'Good' label for score in [60, 79]", () => {
    render(<HealthScoreCard score={65} />);
    expect(screen.getByTestId("text-health-label")).toHaveTextContent("Good");
  });

  it("shows 'Fair' label for score in [40, 59]", () => {
    render(<HealthScoreCard score={50} />);
    expect(screen.getByTestId("text-health-label")).toHaveTextContent("Fair");
  });

  it("shows 'Needs Attention' label for score < 40", () => {
    render(<HealthScoreCard score={30} />);
    expect(screen.getByTestId("text-health-label")).toHaveTextContent("Needs Attention");
  });

  it("renders the card title 'Financial Health Score'", () => {
    render(<HealthScoreCard score={75} />);
    expect(screen.getByText("Financial Health Score")).toBeInTheDocument();
  });

  // Boundary value tests for score thresholds
  it("shows 'Excellent' at exactly score 80 (boundary)", () => {
    render(<HealthScoreCard score={80} />);
    expect(screen.getByTestId("text-health-label")).toHaveTextContent("Excellent");
  });

  it("shows 'Good' at exactly score 60 (boundary)", () => {
    render(<HealthScoreCard score={60} />);
    expect(screen.getByTestId("text-health-label")).toHaveTextContent("Good");
  });

  it("shows 'Fair' at exactly score 40 (boundary)", () => {
    render(<HealthScoreCard score={40} />);
    expect(screen.getByTestId("text-health-label")).toHaveTextContent("Fair");
  });

  it("shows 'Needs Attention' at score 39 (below Fair threshold)", () => {
    render(<HealthScoreCard score={39} />);
    expect(screen.getByTestId("text-health-label")).toHaveTextContent("Needs Attention");
  });
});
