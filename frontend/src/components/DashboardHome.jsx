import {
  TrendingUp,
  FileSpreadsheet,
  BarChart3,
  Brain,
  Upload,
  Activity,
  Clock,
  Zap,
} from "lucide-react";

export const DashboardHome = ({ onNavigate, stats }) => {
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

  // ✅ SAFE BACKEND DATA
  const recentActivity = stats?.recentActivity || [];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome to Your Analytics Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Transform your data into actionable insights with our powerful tools
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
              <Activity className="w-10 h-10 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Files"
          value={stats?.totalFiles || 0}
          icon={FileSpreadsheet}
          color="blue"
        />
        <StatCard
          title="Charts Created"
          value={stats?.chartsCreated || 0}
          icon={BarChart3}
          color="green"
        />
        <StatCard
          title="AI Insights"
          value={stats?.aiInsights || 0}
          icon={Brain}
          color="purple"
        />
        <StatCard
          title="Processing Time"
          value="2.3s"
          icon={Clock}
          color="orange"
        />
      </div>

      {/* Quick Actions */}
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
                <div
                  className={`w-12 h-12 ${action.color} ${action.hoverColor} rounded-lg flex items-center justify-center mb-4 transition-colors`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
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

      {/* Recent Activity & Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Recent Activity
          </h3>

          {recentActivity.length ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {activity.action}{" "}
                      <span className="text-primary">
                        {activity.name || "Item"}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No recent activity
            </p>
          )}
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Tips & Recommendations
          </h3>

          <Tip
            title="💡 Pro Tip"
            text="Use AI Insights to automatically identify trends in your data."
          />
          <Tip
            title="🎯 Best Practice"
            text="Clean your data before uploading for better accuracy."
          />
          <Tip
            title="⚡ Quick Start"
            text="Try 3D visualization for impressive presentations."
          />
        </div>
      </div>
    </div>
  );
};

/* ---------- SMALL REUSABLE COMPONENTS ---------- */

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
      <div className={`w-12 h-12 bg-${color}-500/10 rounded-lg flex items-center justify-center`}>
        <Icon className={`w-6 h-6 text-${color}-500`} />
      </div>
    </div>
  </div>
);

const Tip = ({ title, text }) => (
  <div className="p-4 bg-card/80 rounded-lg border border-border/50 mb-3">
    <h4 className="font-medium text-foreground mb-1">{title}</h4>
    <p className="text-sm text-muted-foreground">{text}</p>
  </div>
);
