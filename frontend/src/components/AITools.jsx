import { useState } from "react";
import { Brain, Sparkles, TrendingUp, FileText, Loader } from "lucide-react";
import { Button } from "./ui/button";
import { recordInsightGenerated } from "../lib/analyticsStats";

export const AITools = ({ data, onInsightGenerated }) => {
  const [selectedTool, setSelectedTool] = useState("summary");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");

  const aiTools = [
    {
      id: "summary",
      name: "Data Summary",
      description: "Generate intelligent insights and summary from your data",
      icon: FileText,
      color: "text-primary",
    },
    {
      id: "trends",
      name: "Trend Analysis",
      description: "Identify patterns and trends in your dataset",
      icon: TrendingUp,
      color: "text-success",
    },
    {
      id: "insights",
      name: "Smart Insights",
      description: "Get AI-powered recommendations and insights",
      icon: Sparkles,
      color: "text-warning",
    },
    {
      id: "custom",
      name: "Custom Analysis",
      description: "Ask specific questions about your data",
      icon: Brain,
      color: "text-destructive",
    },
  ];

  const generateAnalysis = async () => {
    if (!data || !data.data) {
      alert("Please upload data first");
      return;
    }

    setLoading(true);
    setResult("");

    setTimeout(() => {
      let mockResult = "";

      switch (selectedTool) {
        case "summary":
          mockResult = `## Data Summary Report

**Dataset Overview:**
- Total Records: ${data.data.length}
- Columns: ${Object.keys(data.data[0] || {}).length}
- File: ${data.fileName}

**Key Findings:**
- Structured dataset with ${data.data.length} rows
- Data quality is good with minimal missing values
- Suitable for statistical analysis`;
          break;

        case "trends":
          mockResult = `## Trend Analysis

**Patterns Found:**
- Positive trend in key metrics
- Seasonal variations detected
- Strong correlation between variables

**Recommendations:**
- Focus on growth areas
- Monitor trends continuously`;
          break;

        case "insights":
          mockResult = `## Smart Insights

**AI Recommendations:**
- Optimize high-performing segments
- Investigate anomalies
- Improve decision-making using data

**Impact:**
- Efficiency improvement possible
- Better ROI expected`;
          break;

        case "custom":
          mockResult = `## Custom Analysis

**Query:** ${customPrompt || "General analysis"}

**Result:**
- Based on your query, patterns were identified
- Confidence level: High
- Suggested improvements available`;
          break;

        default:
          mockResult = "No analysis available";
          break;
      }

      setResult(mockResult);
      const insightKey = `${data.fileName || "dataset"}:${selectedTool}:${Date.now()}`;
      recordInsightGenerated(insightKey, `${selectedTool} analysis`);
      if (typeof onInsightGenerated === "function") onInsightGenerated();
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          AI Tools & Analytics
        </h2>
        <p className="text-muted-foreground">
          Get intelligent insights from your data using AI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {aiTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className={`text-left p-4 rounded-lg border transition-all ${
                selectedTool === tool.id
                  ? "bg-primary text-primary-foreground border-primary shadow-lg"
                  : "bg-card border-border hover:border-primary/50 hover:shadow-md"
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Icon
                  className={`w-5 h-5 ${
                    selectedTool === tool.id
                      ? "text-primary-foreground"
                      : tool.color
                  }`}
                />
                <h3 className="font-medium">{tool.name}</h3>
              </div>
              <p
                className={`text-sm ${
                  selectedTool === tool.id
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground"
                }`}
              >
                {tool.description}
              </p>
            </button>
          );
        })}
      </div>

      {selectedTool === "custom" && (
        <div className="bg-card border border-border rounded-lg p-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Ask a question about your data:
          </label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g., What patterns exist in my dataset?"
            className="w-full p-3 border border-border rounded-md bg-background text-foreground resize-none"
            rows={3}
          />
        </div>
      )}

      <div className="flex justify-center">
        <Button
          onClick={generateAnalysis}
          disabled={loading || !data}
          className="px-8 py-3"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5 mr-2" />
              Generate AI Analysis
            </>
          )}
        </Button>
      </div>

      {result && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-medium">AI Results</h3>
          </div>

          <div className="whitespace-pre-wrap text-foreground">
            {result}
          </div>
        </div>
      )}
    </div>
  );
};