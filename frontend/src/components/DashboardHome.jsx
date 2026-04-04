import { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  BarChart3,
  Brain,
  Upload,
  Activity,
  Clock,
  TrendingUp,
} from "lucide-react";

// ── localStorage helpers ───────────────────────────────────────────
const getStats = () =>
  JSON.parse(localStorage.getItem("stats")) || {
    totalFiles:     0,
    chartsCreated:  0,
    aiInsights:     0,
    recentActivity: [],
    lastChartType:  null,
  };

// ── Relative time formatter ────────────────────────────────────────
const getTimeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 10)    return "Just now";
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ── Activity icon map ──────────────────────────────────────────────
const ActivityIcon = ({ type }) => {
  const map = {
    upload: { icon: Upload,        bg: "bg-blue-500/10",   color: "text-blue-500"   },
    chart:  { icon: BarChart3,     bg: "bg-green-500/10",  color: "text-green-500"  },
    ai:     { icon: Brain,         bg: "bg-purple-500/10", color: "text-purple-500" },
  };
  const { icon: Icon, bg, color } = map[type] || map.chart;
  return (
    <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
export const DashboardHome = ({ onNavigate }) => {
  const [stats, setStats] = useState(getStats);

  // ── Refresh stats every 3 seconds so recent activity stays live
  useEffect(() => {
    const id = setInterval(() => setStats(getStats()), 3000);
    return () => clearInterval(id);
  }, []);

  const recentActivity = stats.recentActivity ?? [];

  const quickActions = [
    {
      title:       "Upload New File",
      description: "Import Excel or CSV files",
      icon:        Upload,
      action:      () => onNavigate("upload"),
      color:       "bg-blue-500",
      hoverColor:  "hover:bg-blue-600",
    },
    {
      title:       "View Analytics",
      description: "Explore your data visualizations",
      icon:        BarChart3,
      action:      () => onNavigate("analytics"),
      color:       "bg-green-500",
      hoverColor:  "hover:bg-green-600",
    },
    {
      title:       "File History",
      description: "Manage uploaded files",
      icon:        FileSpreadsheet,
      action:      () => onNavigate("history"),
      color:       "bg-orange-500",
      hoverColor:  "hover:bg-orange-600",
    },
  ];

  return (
    <div className="space-y-8">

      {/* ── HERO BANNER ────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome to Your Analytics Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Transform your data into actionable insights
            </p>
            {stats.totalFiles > 0 && (
              <p className="text-sm text-primary mt-2 font-medium">
                ✦ {stats.totalFiles} file{stats.totalFiles !== 1 ? "s" : ""} processed · {stats.chartsCreated} chart{stats.chartsCreated !== 1 ? "s" : ""} generated
              </p>
            )}
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
              <Activity className="w-10 h-10 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Files"
          value={stats.totalFiles}
          icon={FileSpreadsheet}
          color="blue"
          sub={stats.totalFiles === 0 ? "Upload your first file" : "Files uploaded"}
        />
        <StatCard
          title="Charts Created"
          value={stats.chartsCreated}
          icon={BarChart3}
          color="green"
          sub={stats.chartsCreated === 0 ? "No charts yet" : "Visualizations"}
        />
        <StatCard
          title="AI Insights"
          value={stats.aiInsights}
          icon={Brain}
          color="purple"
          sub="Auto-detected"
        />
        <StatCard
          title="Avg Processing"
          value="1.8s"
          icon={Clock}
          color="orange"
          sub="Per file"
        />
      </div>

      {/* ── QUICK ACTIONS ──────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className="group p-6 rounded-xl border border-border bg-card hover:shadow-xl transition-all duration-300 text-left transform hover:scale-105 hover:border-primary/30"
              >
                <div className={`w-12 h-12 ${action.color} ${action.hoverColor} rounded-lg flex items-center justify-center mb-4 transition-colors duration-200`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RECENT ACTIVITY ────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
          {recentActivity.length > 0 && (
            <span className="text-xs text-muted-foreground bg-muted/50 rounded-full px-2 py-1">
              {recentActivity.length} event{recentActivity.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="divide-y divide-border">
          {recentActivity.length ? (
            recentActivity.slice(0, 5).map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 px-6 py-4 hover:bg-muted/20 transition-colors"
              >
                <ActivityIcon type={activity.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="text-muted-foreground">{activity.action} </span>
                    <span className="font-medium">{activity.name}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {getTimeAgo(activity.createdAt)}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground bg-muted/50 rounded-full px-2 py-1 capitalize">
                  {activity.type}
                </span>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No activity yet</p>
              <p className="text-xs text-muted-foreground">Upload a file to get started</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

// ── StatCard component ────────────────────────────────────────────
const COLOR_MAP = {
  blue:   { bg: "bg-blue-500/10",   text: "text-blue-500",   ring: "ring-blue-500/20"   },
  green:  { bg: "bg-green-500/10",  text: "text-green-500",  ring: "ring-green-500/20"  },
  purple: { bg: "bg-purple-500/10", text: "text-purple-500", ring: "ring-purple-500/20" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-500", ring: "ring-orange-500/20" },
};

const StatCard = ({ title, value, icon: Icon, color, sub }) => {
  const { bg, text } = COLOR_MAP[color] || COLOR_MAP.blue;
  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${text}`} />
        </div>
      </div>
      <h2 className={`text-3xl font-bold ${text} mb-1`}>{value}</h2>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
};
