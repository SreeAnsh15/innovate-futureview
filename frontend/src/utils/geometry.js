export function clamp(val, min = 0, max = 100) {
  return Math.max(min, Math.min(max, val));
}

export function formatPercent(val) {
  if (val === undefined || val === null) return "0%";
  const num = Number(val);
  return `${num > 0 ? "+" : ""}${num.toFixed(1)}%`;
}

export function formatMeters(val) {
  if (val === undefined || val === null) return "0.0m";
  return `${Number(val).toFixed(1)}m`;
}

export function getStatusColor(status) {
  switch (status) {
    case "good":
      return "#4fe0a4";
    case "bad":
      return "#ff647b";
    case "warning":
      return "#ffc765";
    default:
      return "#50ddff";
  }
}
