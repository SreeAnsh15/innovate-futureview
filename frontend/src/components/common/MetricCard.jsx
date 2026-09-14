import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp, TrendingDown } from "lucide-react";

export function MetricCard({
  title,
  current,
  proposed,
  delta,
  deltaPct,
  deltaLabel,
  unit = "",
  status = "neutral",
  description
}) {
  const isPositive = delta > 0;
  const isNeutral = delta === 0;
  const isGood = status === "good" || status === "positive" || status === "improved";
  const isBad = status === "bad" || status === "critical" || status === "warning";

  return (
    <div className={`fvMetricCard ${status}`}>
      {/* Top Header: Title & Delta Badge */}
      <div className="fvMetricTop">
        <span className="fvMetricTitle">{title}</span>
        <div
          className={`fvDeltaBadge ${status}`}
          style={deltaLabel ? { color: "#FBBF24", fontWeight: 800 } : undefined}
        >
          {isNeutral ? (
            <Minus size={11} />
          ) : isPositive ? (
            <ArrowUpRight size={11} />
          ) : (
            <ArrowDownRight size={11} />
          )}
          <span>
            {deltaLabel || (deltaPct !== undefined && deltaPct !== 0
              ? `${deltaPct > 0 ? "+" : ""}${deltaPct}%`
              : `${delta > 0 ? "+" : ""}${delta}${unit}`)}
          </span>
        </div>
      </div>

      {/* Comparison Values: Current vs Proposed */}
      <div className="fvMetricValues">
        <div className="fvValColumn current">
          <span className="fvValLabel">CURRENT</span>
          <span className="fvValNumber">{current}{unit}</span>
        </div>
        <div className="fvValDivider">
          <span className="fvValArrow">→</span>
        </div>
        <div className="fvValColumn proposed">
          <span className="fvValLabel">PROPOSED</span>
          <span className={`fvValNumber bold ${isBad ? "bad" : isGood ? "good" : "highlight"}`}>
            {proposed}{unit}
          </span>
        </div>
      </div>

      {/* Mini Progress Ratio Bar */}
      <div className="fvMetricBarTrack">
        <div
          className={`fvMetricBarFill ${status}`}
          style={{
            width: `${Math.min(100, Math.max(15, (parseFloat(proposed) / (parseFloat(current) || 1)) * 50))}%`
          }}
        />
      </div>

      {description && <div className="fvMetricDesc">{description}</div>}
    </div>
  );
}
