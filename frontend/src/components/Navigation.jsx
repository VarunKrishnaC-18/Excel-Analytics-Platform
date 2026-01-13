import { BarChart3, Upload, History, Settings, Brain, Home } from "lucide-react";

export const Navigation = ({ activeSection, onSectionChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'upload', label: 'Upload Files', icon: Upload },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'history', label: 'File History', icon: History },
    { id: 'ai-tools', label: 'AI Insights', icon: Brain },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="bg-card border-r border-border w-64 min-h-screen shadow-sm">
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-2">Analytics Hub</h2>
          <p className="text-sm text-muted-foreground">Manage your data insights</p>
        </div>
        
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary to-primary-hover text-primary-foreground shadow-lg transform scale-105'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-102'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-primary-foreground rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* User Stats */}
        <div className="mt-8 p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
          <h3 className="font-semibold text-foreground mb-2">Your Progress</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Files Analyzed</span>
              <span className="font-medium text-foreground">12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Charts Created</span>
              <span className="font-medium text-foreground">28</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">AI Insights</span>
              <span className="font-medium text-foreground">5</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};