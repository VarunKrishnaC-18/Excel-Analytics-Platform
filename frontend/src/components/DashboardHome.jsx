import {
  FileSpreadsheet,
  BarChart3,
  Brain,
  Upload,
  Activity,
  Clock,
} from "lucide-react";

export const DashboardHome = ({ onNavigate }) => {

  // 🔥 GET DATA FROM LOCAL STORAGE
  const stats = JSON.parse(localStorage.getItem("stats")) || {
    totalFiles: 0,
    chartsCreated: 0,
    aiInsights: 0,
    recentActivity: [],
  };

  const recentActivity = stats.recentActivity || [];

  const quickActions = [
    {
      title: "Upload New File",
      description: "Import Excel or CSV files",
      icon: Upload,
      action: () => onNavigate("upload"),
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
    },
    {
      title: "View Analytics",
      description: "Explore your data visualizations",
      icon: BarChart3,
      action: () => onNavigate("analytics"),
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
    },
    {
      title: "File History",
      description: "Manage uploaded files",
      icon: FileSpreadsheet,
      action: () => onNavigate("history"),
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600",
    },
  ];

  // 🔥 TIME FORMAT
  const getTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diff = Math.floor((now - past) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome to Your Analytics Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Transform your data into actionable insights
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
              <Activity className="w-10 h-10 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Files" value={stats.totalFiles} icon={FileSpreadsheet} color="blue" />
        <StatCard title="Charts Created" value={stats.chartsCreated} icon={BarChart3} color="green" />
        <StatCard title="AI Insights" value={stats.aiInsights} icon={Brain} color="purple" />
        <StatCard title="Processing Time" value="2.3s" icon={Clock} color="orange" />
      </div>

      {/* QUICK ACTIONS */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className="group p-6 rounded-xl border border-border bg-card hover:shadow-xl transition-all duration-300 text-left transform hover:scale-105"
              >
                <div className={`w-12 h-12 ${action.color} ${action.hoverColor} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🔥 RECENT ACTIVITY */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Recent Activity
        </h3>

        {recentActivity.length ? (
          recentActivity.slice(0, 5).map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3">
              <Activity className="w-4 h-4 text-primary" />
              <div>
                {activity.action} <b>{activity.name}</b>
                <div className="text-xs text-muted-foreground">
                  {getTimeAgo(activity.createdAt)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No recent activity</p>
        )}
      </div>

    </div>
  );
};

/* COMPONENT */
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-card border border-border rounded-xl p-6">
    <p>{title}</p>
    <h2 className="text-2xl">{value}</h2>
    <Icon />
  </div>
);