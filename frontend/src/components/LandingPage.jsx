import { useState } from "react";
import { 
  Upload, 
  BarChart3, 
  Brain, 
  Zap, 
  CheckCircle, 
  Star,
  ArrowRight,
  Play,
  Users,
  TrendingUp,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "./ui/button";

export const LandingPage = ({ onGetStarted }) => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Upload,
      title: "Easy File Upload",
      description: "Drag & drop Excel files for instant processing with advanced parsing capabilities",
      color: "text-blue-500"
    },
    {
      icon: BarChart3,
      title: "Interactive Charts",
      description: "Generate beautiful 2D and 3D visualizations with customizable chart types",
      color: "text-green-500"
    },
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Get intelligent summaries and recommendations powered by advanced AI",
      color: "text-purple-500"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process large datasets instantly with our optimized analytics engine",
      color: "text-yellow-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Data Analyst",
      company: "TechCorp",
      content: "This platform transformed how we analyze our Excel data. The AI insights are incredible!",
      rating: 5
    },
    {
      name: "Mike Chen", 
      role: "Business Manager",
      company: "StartupXYZ",
      content: "Easy to use and powerful visualizations. Cut our reporting time by 80%.",
      rating: 5
    },
    {
      name: "Emma Davis",
      role: "Financial Analyst", 
      company: "FinanceInc",
      content: "The 3D charts and automated insights give us perspectives we never had before.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="inline-flex items-center bg-primary/10 rounded-full px-4 py-2 mb-6">
              <Star className="w-4 h-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">New: AI-Powered Analytics</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Transform Your{" "}
              <span className="bg-gradient-to-r from-primary via-primary-hover to-accent bg-clip-text text-transparent">
                Excel Data
              </span>{" "}
              Into Insights
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Upload, analyze, and visualize your Excel files with AI-powered insights. 
              Create stunning charts and get intelligent recommendations in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-primary to-primary-hover hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-lg px-8 py-6"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-6 border-2 hover:bg-primary/5"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">50K+</div>
                <div className="text-muted-foreground">Files Processed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
                <div className="text-muted-foreground">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">2.5s</div>
                <div className="text-muted-foreground">Average Processing</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Features for Data Analysis
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to transform your Excel data into actionable insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className={`relative p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                    activeFeature === index ? 'ring-2 ring-primary shadow-lg' : ''
                  }`}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Visual Demo Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                See Your Data Come to Life
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Transform spreadsheets into interactive dashboards with beautiful charts, 
                real-time analytics, and AI-generated insights that reveal hidden patterns.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-foreground">Multiple chart types (Bar, Line, Pie, 3D)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-foreground">Real-time data processing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-foreground">Export charts as PNG/PDF</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-foreground">AI-powered trend analysis</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8 backdrop-blur-sm">
                <div className="bg-card rounded-lg p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Sales Analytics</h3>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-primary/20 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full w-3/4"></div>
                    </div>
                    <div className="h-4 bg-accent/20 rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full w-1/2"></div>
                    </div>
                    <div className="h-4 bg-success/20 rounded-full overflow-hidden">
                      <div className="h-full bg-success rounded-full w-5/6"></div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between text-sm text-muted-foreground">
                    <span>Q1: $2.4M</span>
                    <span>Q2: $1.8M</span>
                    <span>Q3: $3.1M</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by Data Professionals
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our users say about their experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-card rounded-xl p-6 shadow-lg border border-border">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-foreground mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-primary to-primary-hover">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Transform Your Data?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Join thousands of professionals who trust Excel Analytics Pro for their data insights
          </p>
          <Button 
            size="lg"
            variant="secondary"
            onClick={onGetStarted}
            className="text-lg px-8 py-6 bg-white text-primary hover:bg-gray-100 transform hover:scale-105 transition-all duration-200"
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};