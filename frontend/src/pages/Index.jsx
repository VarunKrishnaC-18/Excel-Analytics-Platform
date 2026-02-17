import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Navigation } from "../components/Navigation";
import { LandingPage } from "../components/LandingPage";
import { DashboardHome } from "../components/DashboardHome";
import { FileUpload } from "../components/FileUpload";
import { Dashboard } from "../components/Dashboard";
import { UploadHistory } from "../components/UploadHistory";
import { AITools } from "../components/AITools";
import { AuthModal } from "../components/AuthModal";
import { Settings } from "../components/Settings";
import { toast } from "sonner";

const Index = () => {
  // ✅ LOAD PERSISTED STATE
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("analytics_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [activeSection, setActiveSection] = useState("dashboard");
  const [currentData, setCurrentData] = useState(null);

  const [uploadHistory, setUploadHistory] = useState(() => {
    const saved = localStorage.getItem("analytics_history");
    return saved ? JSON.parse(saved) : [];
  });

  const [showAuthModal, setShowAuthModal] = useState(false);

  // ✅ NUMERICAL STATS
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem("analytics_stats");
    return saved ? JSON.parse(saved) : {
      totalFiles: 0,
      chartsCreated: 0,
      aiInsights: 0,
      recentActivity: [],
    };
  });

  // ✅ PERSIST STATE ON CHANGES
  useEffect(() => {
    localStorage.setItem("analytics_user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem("analytics_history", JSON.stringify(uploadHistory));
  }, [uploadHistory]);

  useEffect(() => {
    localStorage.setItem("analytics_stats", JSON.stringify(stats));
  }, [stats]);

  const handleLogin = (credentials) => {
    setUser({
      id: "1",
      name: credentials.name || credentials.email.split("@")[0],
      email: credentials.email,
    });
  };

  const handleRegister = (credentials) => {
    setUser({
      id: "1",
      name: credentials.name,
      email: credentials.email,
    });
    toast.success("Account created successfully! 🚀");
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentData(null);
    setUploadHistory([]);
    setStats({
      totalFiles: 0,
      chartsCreated: 0,
      aiInsights: 0,
      recentActivity: [],
    });
    localStorage.clear();
    setActiveSection("dashboard");
    toast("Settings reset and logged out! 👋");
  };

  // ✅ FILE UPLOAD → UPDATE FILE COUNT
  const handleFileProcessed = (data) => {
    setCurrentData(data);

    setUploadHistory((prev) => [
      {
        id: Date.now().toString(),
        fileName: data.fileName,
        uploadDate: data.uploadDate || new Date().toISOString(),
        rows: data.data.length,
        columns: Object.keys(data.data[0] || {}).length,
        fileSize: data.fileSize || "0",
        data: data, // Keep the full data for viewing later
      },
      ...prev,
    ]);

    setStats((prev) => ({
      ...prev,
      totalFiles: prev.totalFiles + 1,
      recentActivity: [
        {
          action: "Uploaded",
          name: data.fileName,
          createdAt: new Date().toISOString(),
        },
        ...prev.recentActivity,
      ],
    }));

    setActiveSection("analytics");
    toast.success(`File ${data.fileName} processed successfully! ✨`);
  };

  const handleViewFile = (id) => {
    const upload = uploadHistory.find((u) => u.id === id);
    if (upload && upload.data) {
      setCurrentData(upload.data);
      setActiveSection("analytics");
      toast.info(`Viewing ${upload.fileName}`);
    }
  };

  const handleDeleteFile = (id) => {
    setUploadHistory((prev) => prev.filter((u) => u.id !== id));
    toast.error("File removed from history");
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardHome onNavigate={setActiveSection} stats={stats} />;

      case "upload":
        return <FileUpload onFileProcessed={handleFileProcessed} />;

      case "analytics":
        return (
          <Dashboard
            data={currentData}
            onChartCreated={() =>
              setStats((prev) => ({
                ...prev,
                chartsCreated: prev.chartsCreated + 1,
              }))
            }
          />
        );

      case "history":
        return (
          <UploadHistory
            uploads={uploadHistory}
            onViewFile={handleViewFile}
            onDeleteFile={handleDeleteFile}
          />
        );

      case "ai-tools":
        return (
          <AITools
            data={currentData}
            onInsightGenerated={() =>
              setStats((prev) => ({
                ...prev,
                aiInsights: prev.aiInsights + 1,
              }))
            }
          />
        );

      case "settings":
        return (
          <Settings
            user={user}
            onClearData={handleLogout}
            onResetHistory={() => {
              setUploadHistory([]);
              setStats(prev => ({ ...prev, recentActivity: [] }));
              toast.info("History cleared successfully");
            }}
          />
        );

      default:
        return <DashboardHome onNavigate={setActiveSection} stats={stats} />;
    }
  };

  if (!user) {
    return (
      <>
        <LandingPage onGetStarted={() => setShowAuthModal(true)} />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onLogout={handleLogout}
        onSettingsClick={() => setActiveSection("settings")}
      />
      <div className="flex">
        <Navigation
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <main className="flex-1 p-8">{renderContent()}</main>
      </div>
    </div>
  );
};

export default Index;
