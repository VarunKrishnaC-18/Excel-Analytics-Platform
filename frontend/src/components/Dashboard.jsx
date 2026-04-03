// ONLY CHANGED PARTS MARKED WITH 🔥

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
    return <div>No Data</div>;
  }

  const generateChartData = () => {
    const labels = data.data.slice(0, 10).map(row => String(row[xAxis]));

    const colors = [
      "#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#A855F7", "#06B6D4"
    ];

    const datasets = numericColumns.slice(0, 3).map((col, index) => ({
      label: col,
      data: data.data.slice(0, 10).map(row => row[col] || 0),
      backgroundColor: colors[index] + "99",
      borderColor: colors[index],
      borderWidth: 2,
    }));

    return { labels, datasets };
  };

  const chartData = generateChartData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: `${data.fileName} - ${selectedChart} Chart`,
      },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const renderChart = () => {
    switch (selectedChart) {

      case 'doughnut': {
        const grouped = {};

        data.data.forEach(row => {
          const key = String(row[xAxis]);
          const value = Number(row[yAxis]) || 0;
          grouped[key] = (grouped[key] || 0) + value;
        });

        const sorted = Object.entries(grouped)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6);

        const colors = [
          "#6366F1",
          "#22C55E",
          "#F59E0B",
          "#EF4444",
          "#A855F7",
          "#06B6D4"
        ];

        const pieData = {
          labels: sorted.map(i => i[0]),
          datasets: [{
            data: sorted.map(i => i[1]),
            backgroundColor: colors,
            borderColor: "#fff",
            borderWidth: 3,
            hoverOffset: 20, // 🔥 smooth hover
          }],
        };

        return <Doughnut data={pieData} />;
      }

      case 'scatter': {
        const colors = [
          "#6366F1", "#22C55E", "#F59E0B",
          "#EF4444", "#A855F7"
        ];

        const scatterData = {
          datasets: numericColumns.slice(0, 3).map((col, index) => ({
            label: col,
            data: data.data.slice(0, 50).map(row => ({
              x: Number(row[xAxis]),
              y: Number(row[col]),
            })),
            backgroundColor: colors[index],
            pointRadius: 5, // 🔥 better visibility
          })),
        };

        return <Scatter data={scatterData} />;
      }

      case 'bar':
        return <Bar data={chartData} options={chartOptions} />;
      case 'line':
        return <Line data={chartData} options={chartOptions} />;

      default:
        return <Bar data={chartData} options={chartOptions} />;
    }
  };

  // 🔥 VIEW ALL FIX
  const handleViewAll = () => {
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head><title>Full Data</title></head>
        <body>
          <h2>${data.fileName}</h2>
          <table border="1" cellpadding="5">
            <tr>
              ${columns.map(col => `<th>${col}</th>`).join("")}
            </tr>
            ${data.data.map(row => `
              <tr>
                ${columns.map(col => `<td>${row[col]}</td>`).join("")}
              </tr>
            `).join("")}
          </table>
        </body>
      </html>
    `);
  };

  return (
    <div>

      <div className="h-96">{renderChart()}</div>

      {/* DATA PREVIEW */}
      <div className="bg-card border p-6 mt-6">
        <div className="flex justify-between mb-4">
          <h3>Data Preview</h3>

          {/* 🔥 BUTTON FIXED */}
          <Button onClick={handleViewAll}>
            <Eye className="w-4 h-4 mr-2" />
            View All
          </Button>
        </div>

        <table>
          <thead>
            <tr>
              {columns.slice(0, 4).map(col => <th key={col}>{col}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.data.slice(0, 5).map((row, i) => (
              <tr key={i}>
                {columns.slice(0, 4).map(col => <td key={col}>{row[col]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};