import { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
  Filler,
} from "chart.js";
import {
  Download,
  Eye,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
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
  Legend,
  Filler
);

// ── Professional color palette (Power BI / Tableau style) ──────────
const PALETTE = {
  primary:   ["#2563EB","#7C3AED","#059669","#D97706","#DC2626","#0891B2","#9333EA","#16A34A"],
  pastel:    ["#93C5FD","#C4B5FD","#6EE7B7","#FCD34D","#FCA5A5","#67E8F9","#D8B4FE","#86EFAC"],
  gradient:  (ctx, color) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0,   color + "CC");
    gradient.addColorStop(1,   color + "22");
    return gradient;
  },
};

// ── Shared chart options base ─────────────────────────────────────
const BASE_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 700, easing: "easeInOutQuart" },
  plugins: {
    legend: {
      position: "top",
      labels: {
        usePointStyle: true,
        pointStyle: "circle",
        padding: 20,
        font: { size: 12, family: "'Inter', sans-serif" },
        color: "#6B7280",
      },
    },
    tooltip: {
      backgroundColor: "#1F2937",
      titleColor: "#F9FAFB",
      bodyColor: "#D1D5DB",
      borderColor: "#374151",
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (ctx) => {
          const val = ctx.parsed?.y ?? ctx.parsed;
          const num = typeof val === "number"
            ? val >= 1000
              ? val.toLocaleString("en", { maximumFractionDigits: 1 })
              : val.toFixed(2)
            : val;
          return `  ${ctx.dataset.label ?? ctx.label}: ${num}`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        color: "#9CA3AF",
        font: { size: 11 },
        maxTicksLimit: 10,
        maxRotation: 35,
      },
      border: { display: false },
    },
    y: {
      grid: { color: "#F3F4F6", lineWidth: 1 },
      ticks: {
        color: "#9CA3AF",
        font: { size: 11 },
        callback: (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v,
      },
      border: { display: false },
    },
  },
};

const PIE_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 700, easing: "easeInOutQuart" },
  plugins: {
    legend: {
      position: "right",
      labels: {
        usePointStyle: true,
        pointStyle: "circle",
        padding: 16,
        font: { size: 12 },
        color: "#6B7280",
      },
    },
    tooltip: {
      ...BASE_OPTIONS.plugins.tooltip,
      callbacks: {
        label: (ctx) => {
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
          const pct   = ((ctx.parsed / total) * 100).toFixed(1);
          return `  ${ctx.label}: ${ctx.parsed.toLocaleString()} (${pct}%)`;
        },
      },
    },
  },
};

// ── Utility: track activity in localStorage ───────────────────────
const trackActivity = (type, action, name) => {
  const stats = JSON.parse(localStorage.getItem("stats")) || {
    totalFiles: 0, chartsCreated: 0, aiInsights: 0, recentActivity: [],
    lastChartType: null,
  };
  if (type === "chart") {
    // only count distinct chart type switches, not every render
    if (stats.lastChartType !== name) {
      stats.chartsCreated += 1;
      stats.lastChartType  = name;
    }
  }
  // deduplicate: skip if same action within last 2 seconds
  const last = stats.recentActivity[0];
  const now  = Date.now();
  if (!(last && last.name === name && last.action === action && now - new Date(last.createdAt).getTime() < 2000)) {
    stats.recentActivity.unshift({ type, action, name, createdAt: new Date().toISOString() });
    if (stats.recentActivity.length > 50) stats.recentActivity.length = 50;
  }
  localStorage.setItem("stats", JSON.stringify(stats));
};

// ── Smart column analyser ─────────────────────────────────────────
const analyseColumns = (data) => {
  if (!data?.length) return { numeric: [], categorical: [], best: "bar" };
  const cols    = Object.keys(data[0]);
  const numeric = cols.filter(col => data.some(r => typeof r[col] === "number" && !isNaN(r[col])));
  const categ   = cols.filter(col => !numeric.includes(col));
  let best = "bar";
  if (numeric.length >= 2) best = "scatter";
  else if (categ.length > 0 && numeric.length === 1) best = numeric.length === 1 ? "doughnut" : "bar";
  return { numeric, categorical: categ, best };
};

// ── Basic insights ─────────────────────────────────────────────────
const computeInsights = (data, col) => {
  if (!data?.length || !col) return null;
  const vals = data.map(r => Number(r[col])).filter(n => !isNaN(n));
  if (!vals.length) return null;
  const max  = Math.max(...vals);
  const min  = Math.min(...vals);
  const avg  = vals.reduce((a, b) => a + b, 0) / vals.length;
  const mid  = Math.floor(vals.length / 2);
  const half1 = vals.slice(0, mid);
  const half2 = vals.slice(mid);
  const avg1  = half1.reduce((a, b) => a + b, 0) / (half1.length || 1);
  const avg2  = half2.reduce((a, b) => a + b, 0) / (half2.length || 1);
  const trend = avg2 > avg1 * 1.05 ? "up" : avg2 < avg1 * 0.95 ? "down" : "flat";
  return { max, min, avg, trend };
};

// ─────────────────────────────────────────────────────────────────
export const Dashboard = ({ data }) => {
  const [xAxis,         setXAxis]         = useState("");
  const [yAxis,         setYAxis]         = useState("");
  const [selectedChart, setSelectedChart] = useState("bar");
  const [showModal,     setShowModal]     = useState(false);
  const chartRef          = useRef(null);
  const chartContainerRef = useRef(null);

  // ── Column analysis (memoised) ────────────────────────────────
  const { numeric: numericColumns, categorical: categoricalColumns, best: suggestedChart } =
    useMemo(() => analyseColumns(data?.data), [data?.data]);

  const columns = useMemo(
    () => (data?.data?.length ? Object.keys(data.data[0]) : []),
    [data?.data]
  );

  // ── Auto-set axes on data load ────────────────────────────────
  useEffect(() => {
    if (!data?.data?.length) return;
    if (categoricalColumns.length > 0) setXAxis(categoricalColumns[0]);
    else if (columns.length > 0)        setXAxis(columns[0]);
    if (numericColumns.length > 0)      setYAxis(numericColumns[0]);
  }, [data?.data]);                     // eslint-disable-line

  // ── Chart type switch tracking ────────────────────────────────
  const handleChartSwitch = useCallback((type) => {
    setSelectedChart(type);
    trackActivity("chart", "Generated", type + " chart");
  }, []);

  // ── Insights ──────────────────────────────────────────────────
  const insights = useMemo(() => computeInsights(data?.data, yAxis), [data?.data, yAxis]);

  // ── Guard ─────────────────────────────────────────────────────
  if (!data?.data?.length) {
    return (
      <div className="text-center py-16 space-y-4">
        <BarChart3 className="w-12 h-12 text-primary mx-auto opacity-40" />
        <h3 className="text-xl font-semibold text-foreground">No Data Available</h3>
        <p className="text-muted-foreground">Upload a file to start analysing</p>
      </div>
    );
  }

  // ── Chart data builders ───────────────────────────────────────
  const buildBarLine = useCallback(() => {
    const labels = data.data.slice(0, 15).map(r => String(r[xAxis] ?? "—"));
    const datasets = numericColumns.slice(0, 4).map((col, i) => {
      const color = PALETTE.primary[i % PALETTE.primary.length];
      const canvas = chartContainerRef.current?.querySelector("canvas");
      const ctx    = canvas?.getContext("2d");
      const fill   = selectedChart === "line" && ctx ? PALETTE.gradient(ctx, color) : color + "CC";
      return {
        label:           col,
        data:            data.data.slice(0, 15).map(r => Number(r[col]) || 0),
        backgroundColor: fill,
        borderColor:     color,
        borderWidth:     selectedChart === "line" ? 2.5 : 1.5,
        borderRadius:    selectedChart === "bar"  ? 6 : 0,
        pointRadius:     selectedChart === "line" ? 4 : 0,
        pointHoverRadius:selectedChart === "line" ? 7 : 0,
        pointBackgroundColor: color,
        fill:            selectedChart === "line",
        tension:         0.4,
        hoverBackgroundColor: PALETTE.primary[i % PALETTE.primary.length],
      };
    });
    return { labels, datasets };
  }, [data.data, xAxis, numericColumns, selectedChart]);

  const buildDoughnut = useCallback(() => {
    const grouped = {};
    data.data.forEach(row => {
      const key = String(row[xAxis] ?? "—");
      grouped[key] = (grouped[key] || 0) + (Number(row[yAxis]) || 0);
    });
    const sorted  = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
    const top5    = sorted.slice(0, 5);
    const others  = sorted.slice(5).reduce((s, [, v]) => s + v, 0);
    const labels  = top5.map(([k]) => k);
    const values  = top5.map(([, v]) => v);
    if (others > 0) { labels.push("Others"); values.push(others); }
    return {
      labels,
      datasets: [{
        data:            values,
        backgroundColor: PALETTE.primary.slice(0, labels.length),
        borderColor:     "#fff",
        borderWidth:     3,
        hoverOffset:     12,
        hoverBorderWidth: 2,
      }],
    };
  }, [data.data, xAxis, yAxis]);

  const buildScatter = useCallback(() => ({
    datasets: numericColumns.slice(0, 4).map((col, i) => {
      const color = PALETTE.primary[i % PALETTE.primary.length];
      return {
        label:           col,
        data:            data.data.slice(0, 100).map(r => ({
          x: Number(r[xAxis])  || 0,
          y: Number(r[col])    || 0,
        })),
        backgroundColor: color + "BB",
        borderColor:     color,
        borderWidth:     1.5,
        pointRadius:     5,
        pointHoverRadius:8,
      };
    }),
  }), [data.data, xAxis, numericColumns]);

  // ── Render chart ──────────────────────────────────────────────
  const renderChart = () => {
    switch (selectedChart) {
      case "doughnut":
        return <Doughnut ref={chartRef} data={buildDoughnut()} options={PIE_OPTIONS} />;
      case "scatter":
        return (
          <Scatter
            ref={chartRef}
            data={buildScatter()}
            options={{
              ...BASE_OPTIONS,
              plugins: {
                ...BASE_OPTIONS.plugins,
                tooltip: {
                  ...BASE_OPTIONS.plugins.tooltip,
                  callbacks: {
                    label: (ctx) =>
                      `  ${ctx.dataset.label}: (${ctx.parsed.x.toFixed(2)}, ${ctx.parsed.y.toFixed(2)})`,
                  },
                },
              },
            }}
          />
        );
      case "line":
        return (
          <Line
            ref={chartRef}
            data={buildBarLine()}
            options={{ ...BASE_OPTIONS, plugins: { ...BASE_OPTIONS.plugins, title: { display: false } } }}
          />
        );
      default:
        return (
          <Bar
            ref={chartRef}
            data={buildBarLine()}
            options={{ ...BASE_OPTIONS, plugins: { ...BASE_OPTIONS.plugins, title: { display: false } } }}
          />
        );
    }
  };

  // ── Download handlers ─────────────────────────────────────────
  const downloadChart = useCallback((format) => {
    const canvas = chartContainerRef.current?.querySelector("canvas");
    if (!canvas) return;
    const image = canvas.toDataURL("image/png");
    if (format === "png") {
      const a = document.createElement("a");
      a.href     = image;
      a.download = `${data.fileName ?? "chart"}.png`;
      a.click();
    }
    if (format === "pdf") {
      const pdf = new jsPDF("landscape");
      pdf.addImage(image, "PNG", 10, 10, 270, 150);
      pdf.save(`${data.fileName ?? "chart"}.pdf`);
    }
  }, [data.fileName]);

  // ── Download CSV ──────────────────────────────────────────────
  const downloadCSV = useCallback(() => {
    const headers = columns.join(",");
    const rows    = data.data.map(r => columns.map(c => `"${r[c] ?? ""}"`).join(",")).join("\n");
    const blob    = new Blob([headers + "\n" + rows], { type: "text/csv" });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement("a");
    a.href        = url;
    a.download    = `${data.fileName ?? "data"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [columns, data.data, data.fileName]);

  const chartTypes = [
    { id: "bar",      label: "Bar Chart",    icon: BarChart3  },
    { id: "line",     label: "Line Chart",   icon: LineChart  },
    { id: "doughnut", label: "Pie Chart",    icon: PieChart   },
    { id: "scatter",  label: "Scatter Plot", icon: Activity   },
  ];

  const TrendIcon = insights?.trend === "up"   ? TrendingUp
                  : insights?.trend === "down" ? TrendingDown
                  : Minus;
  const trendColor = insights?.trend === "up"   ? "text-emerald-500"
                   : insights?.trend === "down" ? "text-red-500"
                   : "text-gray-400";

  return (
    <div className="space-y-8">

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Analytics Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {data.fileName} · {data.data.length.toLocaleString()} rows · {columns.length} columns
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => downloadChart("png")}>
            <Download className="w-4 h-4 mr-1" /> PNG
          </Button>
          <Button variant="outline" size="sm" onClick={() => downloadChart("pdf")}>
            <Download className="w-4 h-4 mr-1" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={downloadCSV}>
            <Download className="w-4 h-4 mr-1" /> CSV
          </Button>
        </div>
      </div>

      {/* ── INSIGHT STRIP ──────────────────────────────────────── */}
      {insights && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Max",   value: insights.max.toLocaleString("en", { maximumFractionDigits: 2 }) },
            { label: "Min",   value: insights.min.toLocaleString("en", { maximumFractionDigits: 2 }) },
            { label: "Avg",   value: insights.avg.toLocaleString("en", { maximumFractionDigits: 2 }) },
            { label: "Trend", value: insights.trend.toUpperCase(), icon: <TrendIcon className={`w-4 h-4 ${trendColor}`} /> },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
                <p className="text-lg font-semibold text-foreground mt-0.5">{value}</p>
              </div>
              {icon && <div>{icon}</div>}
            </div>
          ))}
        </div>
      )}

      {/* ── CHART TYPE SELECTOR ────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {chartTypes.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleChartSwitch(id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200
              ${selectedChart === id
                ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── AXIS PICKERS ───────────────────────────────────────── */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">X Axis</label>
          <select
            value={xAxis}
            onChange={e => setXAxis(e.target.value)}
            className="text-sm bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {columns.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {selectedChart !== "doughnut" && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Y Axis</label>
            <select
              value={yAxis}
              onChange={e => setYAxis(e.target.value)}
              className="text-sm bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {numericColumns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}
        {suggestedChart !== selectedChart && (
          <button
            onClick={() => handleChartSwitch(suggestedChart)}
            className="text-xs text-primary border border-primary/30 rounded-lg px-3 py-2 hover:bg-primary/10 transition-colors"
          >
            ✦ Suggested: {suggestedChart} chart
          </button>
        )}
      </div>

      {/* ── CHART ──────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div ref={chartContainerRef} style={{ height: 380 }}>
          {renderChart()}
        </div>
      </div>

      {/* ── DATA PREVIEW TABLE ─────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-foreground">Data Preview</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Showing first 5 of {data.data.length.toLocaleString()} rows</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowModal(true)}>
            <Eye className="w-4 h-4 mr-2" />
            View All
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                {columns.slice(0, 6).map(c => (
                  <th key={c} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.data.slice(0, 5).map((row, i) => (
                <tr key={i} className="hover:bg-muted/20 transition-colors">
                  {columns.slice(0, 6).map(c => (
                    <td key={c} className="px-4 py-3 text-foreground">
                      {typeof row[c] === "number" ? row[c].toLocaleString() : String(row[c] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── VIEW ALL MODAL ──────────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-foreground text-lg">{data.fileName}</h3>
                <p className="text-xs text-muted-foreground">{data.data.length.toLocaleString()} rows · {columns.length} columns</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={downloadCSV}>
                  <Download className="w-4 h-4 mr-1" /> Download CSV
                </Button>
                <button
                  onClick={() => setShowModal(false)}
                  className="ml-2 text-muted-foreground hover:text-foreground text-xl font-medium px-2"
                >
                  ✕
                </button>
              </div>
            </div>
            {/* Modal body */}
            <div className="overflow-auto flex-1">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">#</th>
                    {columns.map(c => (
                      <th key={c} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.data.map((row, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">{i + 1}</td>
                      {columns.map(c => (
                        <td key={c} className="px-4 py-2.5 text-foreground whitespace-nowrap">
                          {typeof row[c] === "number" ? row[c].toLocaleString() : String(row[c] ?? "—")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
