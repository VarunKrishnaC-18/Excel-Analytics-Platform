const STATS_KEY = "stats";

const defaultStats = {
  totalFiles: 0,
  chartsCreated: 0,
  aiInsights: 0,
  recentActivity: [],
  lastChartType: null,
  lastInsightKey: null,
};

export const getStats = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STATS_KEY) || "null");
    return { ...defaultStats, ...(parsed || {}) };
  } catch {
    return { ...defaultStats };
  }
};

export const saveStats = (stats) => {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
};

const dedupeRecentActivity = (recentActivity, entry, windowMs = 2000) => {
  const last = recentActivity[0];
  const now = Date.now();
  const isDuplicate =
    last &&
    last.type === entry.type &&
    last.action === entry.action &&
    last.name === entry.name &&
    now - new Date(last.createdAt).getTime() < windowMs;

  if (isDuplicate) return recentActivity;

  const next = [entry, ...recentActivity];
  if (next.length > 50) next.length = 50;
  return next;
};

export const recordActivity = (type, action, name, windowMs = 2000) => {
  const stats = getStats();
  stats.recentActivity = dedupeRecentActivity(
    stats.recentActivity,
    { type, action, name, createdAt: new Date().toISOString() },
    windowMs
  );
  saveStats(stats);
  return stats;
};

export const recordFileUpload = (fileName) => {
  const stats = getStats();
  const previousLength = stats.recentActivity.length;
  stats.totalFiles += 1;
  stats.recentActivity = dedupeRecentActivity(
    stats.recentActivity,
    { type: "upload", action: "Uploaded", name: fileName, createdAt: new Date().toISOString() },
    5000
  );
  if (stats.recentActivity.length === previousLength) {
    stats.totalFiles = Math.max(0, stats.totalFiles - 1);
  }
  saveStats(stats);
  return stats;
};

export const recordChartCreated = (chartTypeLabel) => {
  const stats = getStats();
  if (stats.lastChartType !== chartTypeLabel) {
    stats.chartsCreated += 1;
    stats.lastChartType = chartTypeLabel;
  }
  stats.recentActivity = dedupeRecentActivity(
    stats.recentActivity,
    { type: "chart", action: "Generated", name: chartTypeLabel, createdAt: new Date().toISOString() },
    2000
  );
  saveStats(stats);
  return stats;
};

export const recordInsightGenerated = (insightKey, name = "Dataset insights") => {
  const stats = getStats();
  if (stats.lastInsightKey !== insightKey) {
    stats.aiInsights += 1;
    stats.lastInsightKey = insightKey;
  }
  stats.recentActivity = dedupeRecentActivity(
    stats.recentActivity,
    { type: "ai", action: "Analyzed", name, createdAt: new Date().toISOString() },
    3000
  );
  saveStats(stats);
  return stats;
};
