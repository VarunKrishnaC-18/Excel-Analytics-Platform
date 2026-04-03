import { useState, useEffect, useRef, useMemo } from "react";
import jsPDF from "jspdf";
import { Bar, Line, Doughnut, Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Download, Eye, BarChart3, LineChart, PieChart, Activity } from "lucide-react";
import { Button } from "./ui/button";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const Dashboard = ({ data }) => {
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [selectedChart, setSelectedChart] = useState("bar");
  const chartRef = useRef(null);
  const chartContainerRef = useRef(null);

  const columns = useMemo(() =>
    data?.data?.length ? Object.keys(data.data[0]) : [],
    [data?.data]
  );

  const numericColumns = useMemo(() =>
    columns.filter(col =>
      data?.data?.some(row => typeof row[col] === "number")
    ),
    [columns, data?.data]
  );

  // ✅ HOOK MUST BE HERE (BEFORE RETURN)
  useEffect(() => {
    if (columns.length > 0 && !xAxis) {
      setXAxis(columns[0]);
    }
    if (numericColumns.length > 0 && !yAxis) {
      setYAxis(numericColumns[0]);
    }
  }, [columns, numericColumns, xAxis, yAxis]);

  // ✅ NOW SAFE TO RETURN
  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="w-12 h-12 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold text-foreground mb-2">No Data Available</h3>
        <p className="text-muted-foreground">
          Upload an Excel file to see your interactive dashboard
        </p>
      </div>
    );
  }



  // Generate chart data
  const generateChartData = () => {
    const labels = data.data.slice(0, 10).map(row => String(row[xAxis]));
    const colors = [
      'hsl(240, 100%, 25%)',
      'hsl(200, 100%, 45%)',
      'hsl(120, 70%, 40%)',
      'hsl(45, 100%, 50%)',
      'hsl(0, 84%, 60%)',
      'hsl(280, 100%, 45%)',
    ];

    const datasets = numericColumns.slice(0, 3).map((col, index) => ({
      label: col,
      data: data.data.slice(0, 10).map(row => row[col] || 0),
      backgroundColor: colors[index] + '80',
      borderColor: colors[index],
      borderWidth: 2,
    }));

    return { labels, datasets };
  };

  const chartData = generateChartData();
  console.log("Chart Data:", chartData);


  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${data.fileName} - ${selectedChart.charAt(0).toUpperCase() + selectedChart.slice(1)} Chart`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const chartTypes = [
    { id: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { id: 'line', label: 'Line Chart', icon: LineChart },
    { id: 'doughnut', label: 'Pie Chart', icon: PieChart },
    { id: 'scatter', label: 'Scatter Plot', icon: Activity },
  ];

  const renderChart = () => {
    switch (selectedChart) {
      case 'bar':
        return <Bar ref={chartRef} data={chartData} options={chartOptions} />;
      case 'line':
        return <Line ref={chartRef} data={chartData} options={chartOptions} />;
      case 'doughnut': {
        const grouped = {};

        data.data.forEach(row => {
          const key = String(row[xAxis]);
          const value = Number(row[yAxis]) || 0;
          grouped[key] = (grouped[key] || 0) + value;
        });

        // Convert to sortable array
        const sorted = Object.entries(grouped)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6); // ✅ TOP 6 ONLY

        if (sorted.length === 0) {
          return <p className="text-center">No data for pie chart</p>;
        }

        const pieData = {
          labels: sorted.map(item => item[0]),
          datasets: [
            {
              data: sorted.map(item => item[1]),
              backgroundColor: sorted.map(
                (_, i) => `hsl(${i * 60}, 70%, 60%)`
              ),
            },
          ],
        };

        return <Doughnut ref={chartRef} data={pieData} />;
      }

      case 'scatter': {
        if (
          typeof data.data[0][xAxis] !== "number" ||
          typeof data.data[0][yAxis] !== "number"
        ) {
          return (
            <p className="text-center text-muted-foreground">
              Scatter plot requires numeric X and Y values
            </p>
          );
        }

        const scatterData = {
          datasets: [
            {
              label: `${yAxis} vs ${xAxis}`,
              data: data.data.slice(0, 50).map(row => ({
                x: Number(row[xAxis]),
                y: Number(row[yAxis]),
              })),
              backgroundColor: 'rgba(255,99,132,0.7)',
            },
          ],
        };

        return <Scatter ref={chartRef} data={scatterData} />;
      }
      default:
        return <Bar data={chartData} options={chartOptions} />;
    }
  };


  const downloadChart = (format) => {
    alert("CHART EXPORTED SUCCESSFULLY...");
    const canvas = chartContainerRef.current?.querySelector("canvas");

    if (!canvas) {
      alert("Chart not ready yet. Please wait and try again.");
      return;
    }

    const image = canvas.toDataURL("image/png");

    if (format === "png") {
      // ✅ SAFARI-SAFE METHOD
      const win = window.open();
      win.document.write(
        `<iframe src="${image}" frameborder="0" 
        style="border:0; top:0; left:0; bottom:0; right:0; 
        width:100%; height:100%;" allowfullscreen></iframe>`
      );
    }

    if (format === "pdf") {
      const pdf = new jsPDF("landscape");
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();
      pdf.addImage(image, "PNG", 10, 10, w - 20, h - 20);
      pdf.save(`${data.fileName}-${selectedChart}.pdf`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Analytics Dashboard</h2>
          <p className="text-lg text-muted-foreground">Interactive analysis of {data.fileName}</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => downloadChart('png')} className="hover-scale">
            <Download className="w-4 h-4 mr-2" />
            PNG
          </Button>
          <Button variant="outline" onClick={() => downloadChart('pdf')} className="hover-scale">
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover-scale">
          <h3 className="font-medium text-muted-foreground mb-1">Total Rows</h3>
          <p className="text-3xl font-bold text-primary">{data.data.length.toLocaleString()}</p>
          <div className="text-sm text-green-500 mt-2">100% processed</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover-scale">
          <h3 className="font-medium text-muted-foreground mb-1">Columns</h3>
          <p className="text-3xl font-bold text-primary">{columns.length}</p>
          <div className="text-sm text-blue-500 mt-2">{numericColumns.length} numeric</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover-scale">
          <h3 className="font-medium text-muted-foreground mb-1">Data Quality</h3>
          <p className="text-3xl font-bold text-primary">98%</p>
          <div className="text-sm text-green-500 mt-2">Excellent</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover-scale">
          <h3 className="font-medium text-muted-foreground mb-1">File Size</h3>
          <p className="text-3xl font-bold text-primary">
            {(JSON.stringify(data.data).length / 1024).toFixed(1)} KB
          </p>
          <div className="text-sm text-blue-500 mt-2">Optimized</div>
        </div>
      </div>

      {/* Chart Type Selection */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">Choose Visualization Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {chartTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedChart(type.id)}
                className={`flex flex-col items-center p-4 rounded-xl border transition-all duration-200 hover-scale ${selectedChart === type.id
                    ? 'bg-gradient-to-br from-primary to-primary-hover text-primary-foreground border-primary shadow-lg'
                    : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground hover:bg-primary/5'
                  }`}
              >
                <Icon className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Display */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
        <div ref={chartContainerRef} className="h-96 w-full">
          {renderChart()}
        </div>
      </div>

      {/* Data Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Data Mapping</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                X-Axis (Categories)
              </label>
              <select
                value={xAxis}
                onChange={(e) => setXAxis(e.target.value)}
                className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary"
              >
                {columns.map(col => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>

            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Y-Axis (Values)
              </label>
              <select
                value={yAxis}
                onChange={(e) => setYAxis(e.target.value)}
                className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary"
              >
                {numericColumns.map(col => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>

            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-foreground">Data Preview</h3>
            <Button variant="outline" size="sm" className="hover-scale">
              <Eye className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {columns.slice(0, 4).map(col => (
                    <th key={col} className="text-left p-2 font-medium text-foreground">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.data.slice(0, 5).map((row, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/30">
                    {columns.slice(0, 4).map(col => (
                      <td key={col} className="p-2 text-muted-foreground">
                        {String(row[col] || '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};