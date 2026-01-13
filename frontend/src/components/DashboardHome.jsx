import { 
  TrendingUp, 
  FileSpreadsheet, 
  BarChart3, 
  Brain,
  Upload,
  Activity,
  Users,
  Clock,
  Zap
} from "lucide-react";
import { Button } from "./ui/button";

export const DashboardHome = ({ onNavigate, stats }) => {
  const quickActions = [
    {
      title: "Upload New File",
      description: "Import Excel or CSV files",
      icon: Upload,
      action: () => onNavigate('upload'),
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600"
    },
    {
      title: "View Analytics", 
      description: "Explore your data visualizations",
      icon: BarChart3,
      action: () => onNavigate('analytics'),
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600"
    },
    {
      title: "AI Insights",
      description: "Get intelligent recommendations", 
      icon: Brain,
      action: () => onNavigate('ai-tools'),
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600"
    },
    {
      title: "File History",
      description: "Manage uploaded files",
      icon: FileSpreadsheet,
      action: () => onNavigate('history'),
      color: "bg-orange-500", 
      hoverColor: "hover:bg-orange-600"
    }
  ];

  const recentActivity = [
    { action: "Uploaded", file: "Sales_Q4_2024.xlsx", time: "2 hours ago", type: "upload" },
    { action: "Generated", file: "Revenue Chart", time: "3 hours ago", type: "chart" },
    { action: "AI Analysis", file: "Market_Data.csv", time: "5 hours ago", type: "ai" },
    { action: "Exported", file: "Performance Dashboard", time: "1 day ago", type: "export" }
  ];

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
        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Files</p>
              <p className="text-2xl font-bold text-foreground">{stats?.totalFiles || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-500">+12% from last month</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Charts Created</p>
              <p className="text-2xl font-bold text-foreground">{stats?.chartsCreated || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-500">+8% from last week</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">AI Insights</p>
              <p className="text-2xl font-bold text-foreground">{stats?.aiInsights || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Zap className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="text-sm text-yellow-500">5 new insights</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Processing Time</p>
              <p className="text-2xl font-bold text-foreground">2.3s</p>
            </div>
            <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-500">15% faster</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className={`group p-6 rounded-xl border border-border bg-card hover:shadow-xl transition-all duration-300 text-left transform hover:scale-105`}
              >
                <div className={`w-12 h-12 ${action.color} ${action.hoverColor} rounded-lg flex items-center justify-center mb-4 transition-colors`}>
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
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'upload' ? 'bg-blue-500/10' :
                  activity.type === 'chart' ? 'bg-green-500/10' :
                  activity.type === 'ai' ? 'bg-purple-500/10' : 'bg-orange-500/10'
                }`}>
                  {activity.type === 'upload' && <Upload className="w-4 h-4 text-blue-500" />}
                  {activity.type === 'chart' && <BarChart3 className="w-4 h-4 text-green-500" />}
                  {activity.type === 'ai' && <Brain className="w-4 h-4 text-purple-500" />}
                  {activity.type === 'export' && <FileSpreadsheet className="w-4 h-4 text-orange-500" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {activity.action} <span className="text-primary">{activity.file}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips & Recommendations */}
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Tips & Recommendations</h3>
          <div className="space-y-4">
            <div className="p-4 bg-card/80 rounded-lg border border-border/50">
              <h4 className="font-medium text-foreground mb-1">💡 Pro Tip</h4>
              <p className="text-sm text-muted-foreground">
                Use AI Insights to automatically identify trends in your data and get actionable recommendations.
              </p>
            </div>
            <div className="p-4 bg-card/80 rounded-lg border border-border/50">
              <h4 className="font-medium text-foreground mb-1">🎯 Best Practice</h4>
              <p className="text-sm text-muted-foreground">
                Clean your data before uploading for better chart accuracy and AI analysis results.
              </p>
            </div>
            <div className="p-4 bg-card/80 rounded-lg border border-border/50">
              <h4 className="font-medium text-foreground mb-1">⚡ Quick Start</h4>
              <p className="text-sm text-muted-foreground">
                Try the 3D visualization feature for impressive presentations of your data insights.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};