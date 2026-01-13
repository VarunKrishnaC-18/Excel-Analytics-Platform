import { useState } from "react";
import { Brain, Sparkles, TrendingUp, FileText, Loader } from "lucide-react";
import { Button } from "./ui/button";

export const AITools = ({ data }) => {
  const [selectedTool, setSelectedTool] = useState('summary');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');

  const aiTools = [
    {
      id: 'summary',
      name: 'Data Summary',
      description: 'Generate intelligent insights and summary from your data',
      icon: FileText,
      color: 'text-primary'
    },
    {
      id: 'trends',
      name: 'Trend Analysis',
      description: 'Identify patterns and trends in your dataset',
      icon: TrendingUp,
      color: 'text-success'
    },
    {
      id: 'insights',
      name: 'Smart Insights',
      description: 'Get AI-powered recommendations and insights',
      icon: Sparkles,
      color: 'text-warning'
    },
    {
      id: 'custom',
      name: 'Custom Analysis',
      description: 'Ask specific questions about your data',
      icon: Brain,
      color: 'text-destructive'
    }
  ];

  const generateAnalysis = async () => {
    if (!data || !data.data) {
      alert('Please upload data first');
      return;
    }

    setLoading(true);
    setResult('');

    setTimeout(() => {
      let mockResult = '';

      switch (selectedTool) {
        case 'summary':
          mockResult = `## Data Summary Report

**Dataset Overview:**
- Total Records: ${data.data.length}
- Columns: ${Object.keys(data.data[0] || {}).length}
- File: ${data.fileName}

**Key Findings:**
- The dataset contains ${data.data.length} rows of structured data
- Numeric columns show varied distributions
- Data quality appears good with minimal missing values
- Recommended for further statistical analysis

**Quick Stats:**
- Average numeric values range from moderate to high
- Data distribution appears balanced
- No significant outliers detected in initial scan`;
          break;

        case 'trends':
          mockResult = `## Trend Analysis

**Identified Patterns:**
- Upward trend detected in primary metrics
- Seasonal variations present in time-based data
- Strong correlation between key variables
- Growth rate: Positive trajectory observed

**Recommendations:**
- Focus on high-performing segments
- Monitor emerging trends in data
- Consider seasonal adjustments
- Implement predictive modeling`;
          break;

        case 'insights':
          mockResult = `## Smart Insights

**AI-Powered Recommendations:**
- Optimize performance in top 20% of records
- Investigate anomalies in data distribution
- Consider data segmentation strategies
- Implement real-time monitoring

**Business Impact:**
- Potential for 15-25% efficiency improvement
- Risk mitigation opportunities identified
- Data-driven decision making enhanced
- ROI optimization possible`;
          break;

        case 'custom':
          mockResult = `## Custom Analysis Results

**Query:** ${customPrompt || 'General analysis'}

**AI Response:**
Based on your specific question, here are the key findings:
- Custom analysis reveals interesting patterns
- Data supports your hypothesis with 85% confidence
- Recommended next steps include deeper dive analysis
- Consider implementing suggested optimizations

**Supporting Evidence:**
- Statistical significance: High
- Data reliability: Excellent
- Confidence level: 85%`;
          break;
      }

      setResult(mockResult);
      setLoading(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">AI Tools & Analytics</h2>
        <p className="text-muted-foreground">Get intelligent insights from your data using AI</p>
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
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                  : 'bg-card border-border hover:border-primary/50 hover:shadow-md'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Icon className={`w-5 h-5 ${selectedTool === tool.id ? 'text-primary-foreground' : tool.color}`} />
                <h3 className="font-medium">{tool.name}</h3>
              </div>
              <p className={`text-sm ${
                selectedTool === tool.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
              }`}>
                {tool.description}
              </p>
            </button>
          );
        })}
      </div>

      {selectedTool === 'custom' && (
        <div className="bg-card border border-border rounded-lg p-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Ask a specific question about your data:
          </label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g., What are the main factors driving the highest values in my dataset?"
            className="w-full p-3 border border-border rounded-md bg-background text-foreground resize-none"
            rows={3}
          />
        </div>
      )}

      <div className="flex justify-center">
        <Button
          onClick={generateAnalysis}
          disabled={loading || !data}
          className="bg-gradient-to-r from-primary to-primary-hover px-8 py-3"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              Analyzing Data...
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
            <h3 className="text-lg font-medium text-foreground">AI Analysis Results</h3>
          </div>
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-foreground leading-relaxed">
              {result}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              ⚡ Generated using Gemini AI • Results are AI-generated insights based on your data
            </p>
          </div>
        </div>
      )}

      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Brain className="w-5 h-5 text-warning mt-0.5" />
          <div>
            <h4 className="font-medium text-foreground">AI Integration</h4>
            <p className="text-sm text-muted-foreground mt-1">
              This demo shows sample AI responses. In production, this would integrate with Google's Gemini API 
              to provide real AI-powered analysis of your data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
