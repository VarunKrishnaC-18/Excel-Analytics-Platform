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

  // 🔥 LOCAL STORAGE INIT (SAFE)
  useEffect(() => {
    const existing = JSON.parse(localStorage.getItem("stats")) || {
      totalFiles: 0,
      chartsCreated: 0,
      aiInsights: 0,
      recentActivity: [],
    };

    localStorage.setItem("stats", JSON.stringify(existing));
  }, []);

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

  useEffect(() => {
    if (columns.length > 0 && !xAxis) setXAxis(columns[0]);
    if (numericColumns.length > 0 && !yAxis) setYAxis(numericColumns[0]);
  }, [columns, numericColumns, xAxis, yAxis]);

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="text-center py-16">
        <BarChart3 className="w-12 h-12 text-primary mx-auto" />
        <h3>No Data Available</h3>
      </div>
    );
  }

  // 🔥 COLORS (FIXED)
  const colors = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#A855F7", "#06B6D4"];

  const generateChartData = () => {
    return {
      labels: data.data.slice(0, 10).map(r => r[xAxis]),
      datasets: numericColumns.slice(0, 3).map((col, i) => ({
        label: col,
        data: data.data.slice(0, 10).map(r => r[col] || 0),
        backgroundColor: colors[i] + "99",
        borderColor: colors[i],
        borderWidth: 2,
      })),
    };
  };

  const chartData = generateChartData();

  const chartTypes = [
    { id: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { id: 'line', label: 'Line Chart', icon: LineChart },
    { id: 'doughnut', label: 'Pie Chart', icon: PieChart },
    { id: 'scatter', label: 'Scatter Plot', icon: Activity },
  ];

  // 🔥 TRACK CHART CREATION
  useEffect(() => {
    const stats = JSON.parse(localStorage.getItem("stats"));
    stats.chartsCreated += 1;

    stats.recentActivity.unshift({
      type: "chart",
      action: "Generated",
      name: selectedChart,
      createdAt: new Date(),
    });

    localStorage.setItem("stats", JSON.stringify(stats));
  }, [selectedChart]);

  const renderChart = () => {
    switch (selectedChart) {

      case 'doughnut': {
        const grouped = {};

        data.data.forEach(row => {
          const key = String(row[xAxis]);
          const value = Number(row[yAxis]) || 0;
          grouped[key] = (grouped[key] || 0) + value;
        });

        const sorted = Object.entries(grouped).slice(0, 6);

        return (
          <Doughnut
            ref={chartRef}
            data={{
              labels: sorted.map(i => i[0]),
              datasets: [{
                data: sorted.map(i => i[1]),
                backgroundColor: colors,
                borderColor: "#fff",
                borderWidth: 2,
                hoverOffset: 15,
              }]
            }}
          />
        );
      }

      case 'scatter': {
        return (
          <Scatter
            ref={chartRef}
            data={{
              datasets: numericColumns.slice(0, 3).map((col, i) => ({
                label: col,
                data: data.data.slice(0, 50).map(r => ({
                  x: Number(r[xAxis]),
                  y: Number(r[col]),
                })),
                backgroundColor: colors[i],
                pointRadius: 5,
              })),
            }}
          />
        );
      }

      case 'line':
        return <Line ref={chartRef} data={chartData} />;
      default:
        return <Bar ref={chartRef} data={chartData} />;
    }
  };

  // 🔥 VIEW ALL FIX
  const handleViewAll = () => {
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
      <body>
      <h2>${data.fileName}</h2>
      <table border="1">
      <tr>${columns.map(c => `<th>${c}</th>`).join("")}</tr>
      ${data.data.map(row => `
        <tr>${columns.map(c => `<td>${row[c]}</td>`).join("")}</tr>
      `).join("")}
      </table>
      </body>
      </html>
    `);
  };

  const downloadChart = (format) => {
    const canvas = chartContainerRef.current?.querySelector("canvas");
    if (!canvas) return;

    const image = canvas.toDataURL("image/png");

    if (format === "png") {
      const win = window.open();
      win.document.write(`<img src="${image}" style="width:100%" />`);
    }

    if (format === "pdf") {
      const pdf = new jsPDF("landscape");
      pdf.addImage(image, "PNG", 10, 10, 270, 150);
      pdf.save(`${data.fileName}.pdf`);
    }
  };

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
        <div className="flex gap-2">
          <Button onClick={() => downloadChart("png")}>PNG</Button>
          <Button onClick={() => downloadChart("pdf")}>PDF</Button>
        </div>
      </div>

      {/* CHART TYPE */}
      <div className="grid grid-cols-4 gap-4">
        {chartTypes.map(t => (
          <button key={t.id} onClick={() => setSelectedChart(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* CHART */}
      <div ref={chartContainerRef} className="h-96">
        {renderChart()}
      </div>

      {/* DATA PREVIEW */}
      <div>
        <Button onClick={handleViewAll}>
          <Eye className="w-4 h-4 mr-2" />
          View All
        </Button>

        <table>
          <thead>
            <tr>{columns.slice(0, 4).map(c => <th key={c}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {data.data.slice(0, 5).map((r, i) => (
              <tr key={i}>
                {columns.slice(0, 4).map(c => <td key={c}>{r[c]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};