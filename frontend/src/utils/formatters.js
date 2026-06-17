/**
 * Shared formatters — extend your existing file with these exports.
 * Safe to merge into whatever you already have.
 */

/** "2024-05-20T14:33:00Z" → "May 20, 2024" */
export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      year:  "numeric",
      month: "short",
      day:   "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
};

/** "2024-05-20T14:33:00Z" → "2 hours ago" */
export const timeAgo = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);
    if (mins  < 1)  return "just now";
    if (mins  < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days  < 7)  return `${days}d ago`;
    return formatDate(dateStr);
  } catch {
    return dateStr;
  }
};

/** Truncate long strings */
export const truncate = (str = "", max = 120) =>
  str.length > max ? str.slice(0, max).trimEnd() + "…" : str;

/** Confidence/score → colour */
export const predictionColor = (prediction) => {
  switch ((prediction || "").toUpperCase()) {
    case "REAL": return "#10b981";
    case "FAKE": return "#ef4444";
    default:     return "#f59e0b";
  }
};

export const scoreColor = (score) => {
  if (score >= 75) return "#10b981";
  if (score >= 45) return "#f59e0b";
  return "#ef4444";
};

export const sentimentEmoji = (sentiment) => {
  switch ((sentiment || "").toLowerCase()) {
    case "positive": return "😊";
    case "negative": return "😠";
    default:         return "😐";
  }
};

export const biasLabel = (bias) => {
  const b = (bias || "").toLowerCase();
  if (b.includes("left"))   return { label: bias, color: "#3b82f6" };
  if (b.includes("right"))  return { label: bias, color: "#ef4444" };
  return                           { label: bias, color: "#8b5cf6" };
};