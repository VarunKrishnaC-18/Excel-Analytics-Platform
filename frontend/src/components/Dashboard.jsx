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
  FileText,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  recordActivity,
  recordChartCreated,
  recordInsightGenerated,
} from "../lib/analyticsStats";

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

const CHART_ROW_LIMIT = 200;
const TABLE_PREVIEW_LIMIT = 5;
const TABLE_MODAL_LIMIT = 300;
const CHART_FONT_FAMILY = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const CHART_PIXEL_RATIO = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 2;

const PALETTE = {
  primary: ["#2563EB", "#06B6D4", "#22C55E", "#F59E0B", "#EF4444", "#A855F7", "#EC4899", "#14B8A6"],
  pastel: ["#93C5FD", "#67E8F9", "#86EFAC", "#FCD34D", "#FCA5A5", "#D8B4FE", "#F9A8D4", "#5EEAD4"],
  gradient: (ctx, color) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 420);
    gradient.addColorStop(0, `${color}F2`);
    gradient.addColorStop(0.55, `${color}CC`);
    gradient.addColorStop(1, `${color}22`);
    return gradient;
  },
};

const formatTooltipNumber = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return value.toLocaleString("en", { maximumFractionDigits: 2 });
};

const BASE_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  devicePixelRatio: CHART_PIXEL_RATIO,
  animation: { duration: 900, easing: "easeInOutQuart" },
  layout: {
    padding: { top: 8, right: 8, bottom: 4, left: 8 },
  },
  elements: {
    bar: {
      borderSkipped: false,
      borderRadius: 10,
    },
    line: {
      borderWidth: 3,
      tension: 0.35,
    },
    point: {
      borderWidth: 2,
      hoverBorderWidth: 3,
    },
  },
  plugins: {
    legend: {
      position: "top",
      labels: {
        usePointStyle: true,
        pointStyle: "circle",
        padding: 20,
        font: { size: 12, family: CHART_FONT_FAMILY, weight: "500" },
        color: "#475569",
      },
    },
    tooltip: {
      backgroundColor: "#111827",
      titleColor: "#F9FAFB",
      bodyColor: "#E5E7EB",
      borderColor: "#374151",
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (ctx) => {
          const val = ctx.parsed?.y ?? ctx.parsed;
          return `  ${ctx.dataset.label ?? ctx.label}: ${formatTooltipNumber(val)}`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        color: "#64748B",
        font: { size: 11, family: CHART_FONT_FAMILY },
        maxTicksLimit: 10,
        maxRotation: 35,
      },
      border: { display: false },
    },
    y: {
      grid: { color: "#E2E8F0", lineWidth: 1 },
      ticks: {
        color: "#64748B",
        font: { size: 11, family: CHART_FONT_FAMILY },
        callback: (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v),
      },
      border: { display: false },
    },
  },
};

const PIE_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  devicePixelRatio: CHART_PIXEL_RATIO,
  animation: { duration: 900, easing: "easeInOutQuart" },
  plugins: {
    legend: {
      position: "right",
      labels: {
        usePointStyle: true,
        pointStyle: "circle",
        padding: 16,
        font: { size: 12, family: CHART_FONT_FAMILY, weight: "500" },
        color: "#475569",
      },
    },
    tooltip: {
      ...BASE_OPTIONS.plugins.tooltip,
      callbacks: {
        label: (ctx) => {
          const total = (ctx.dataset.data || []).reduce((sum, item) => sum + Number(item || 0), 0);
          const percentage = total ? ((ctx.parsed / total) * 100).toFixed(1) : "0.0";
          return `  ${ctx.label}: ${formatTooltipNumber(ctx.parsed)} (${percentage}%)`;
        },
      },
    },
  },
};

const analyseColumns = (rows) => {
  if (!rows?.length) return { numeric: [], categorical: [], best: "bar" };
  const cols = Object.keys(rows[0]);
  const numeric = cols.filter((col) => rows.some((row) => typeof row[col] === "number" && !Number.isNaN(row[col])));
  const categorical = cols.filter((col) => !numeric.includes(col));

  let best = "bar";
  if (numeric.length >= 2) best = "scatter";
  else if (categorical.length > 0 && numeric.length === 1) best = "doughnut";
  return { numeric, categorical, best };
};

const computeOutliers = (values) => {
  if (values.length < 4) return [];
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor((sorted.length - 1) * 0.25)];
  const q3 = sorted[Math.floor((sorted.length - 1) * 0.75)];
  const iqr = q3 - q1;
  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;
  return values.filter((value) => value < lower || value > upper);
};

const computeInsights = (rows, column) => {
  if (!rows?.length || !column) return null;
  const values = rows.map((row) => Number(row[column])).filter((num) => !Number.isNaN(num));
  if (!values.length) return null;

  const max = Math.max(...values);
  const min = Math.min(...values);
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;

  const mid = Math.floor(values.length / 2);
  const firstHalf = values.slice(0, mid);
  const secondHalf = values.slice(mid);
  const avg1 = firstHalf.reduce((sum, value) => sum + value, 0) / (firstHalf.length || 1);
  const avg2 = secondHalf.reduce((sum, value) => sum + value, 0) / (secondHalf.length || 1);

  const trend = avg2 > avg1 * 1.05 ? "up" : avg2 < avg1 * 0.95 ? "down" : "flat";
  const outliers = computeOutliers(values);

  return {
    max,
    min,
    avg,
    trend,
    outlierCount: outliers.length,
    outlierSample: outliers.slice(0, 3),
  };
};

const applyFilters = (rows, filterColumn, filterValue, rangeColumn, minValue, maxValue) => {
  if (!rows?.length) return [];

  let filtered = rows;

  if (filterColumn && filterValue.trim()) {
    const query = filterValue.trim().toLowerCase();
    filtered = filtered.filter((row) => String(row[filterColumn] ?? "").toLowerCase().includes(query));
  }

  const minNum = minValue === "" ? null : Number(minValue);
  const maxNum = maxValue === "" ? null : Number(maxValue);

  if (rangeColumn && (minNum != null || maxNum != null)) {
    filtered = filtered.filter((row) => {
      const value = Number(row[rangeColumn]);
      if (Number.isNaN(value)) return false;
      if (minNum != null && value < minNum) return false;
      if (maxNum != null && value > maxNum) return false;
      return true;
    });
  }

  return filtered;
};

export const Dashboard = ({ data, onChartCreated }) => {
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [selectedChart, setSelectedChart] = useState("bar");
  const [showModal, setShowModal] = useState(false);
  const [filterColumn, setFilterColumn] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [rangeColumn, setRangeColumn] = useState("");
  const [rangeMin, setRangeMin] = useState("");
  const [rangeMax, setRangeMax] = useState("");

  const chartRef = useRef(null);
  const chartContainerRef = useRef(null);

  const rows = useMemo(() => data?.data ?? [], [data?.data]);

  const { numeric: numericColumns, categorical: categoricalColumns, best: suggestedChart } = useMemo(
    () => analyseColumns(rows),
    [rows]
  );

  const columns = useMemo(() => (rows.length ? Object.keys(rows[0]) : []), [rows]);

  useEffect(() => {
    if (!rows.length) return;
    if (categoricalColumns.length > 0) setXAxis(categoricalColumns[0]);
    else if (columns.length > 0) setXAxis(columns[0]);

    if (numericColumns.length > 0) {
      setYAxis((prev) => (numericColumns.includes(prev) ? prev : numericColumns[0]));
      setRangeColumn((prev) => (numericColumns.includes(prev) ? prev : numericColumns[0]));
    }
    if (columns.length > 0) {
      setFilterColumn((prev) => (columns.includes(prev) ? prev : columns[0]));
    }
  }, [rows, categoricalColumns, columns, numericColumns]);

  const filteredRows = useMemo(
    () => applyFilters(rows, filterColumn, filterValue, rangeColumn, rangeMin, rangeMax),
    [rows, filterColumn, filterValue, rangeColumn, rangeMin, rangeMax]
  );

  const chartRows = useMemo(() => filteredRows.slice(0, CHART_ROW_LIMIT), [filteredRows]);
  const tableRows = useMemo(() => filteredRows.slice(0, TABLE_MODAL_LIMIT), [filteredRows]);

  const insights = useMemo(() => computeInsights(filteredRows, yAxis), [filteredRows, yAxis]);

  const executiveSummary = useMemo(() => {
    if (!insights) return "";
    const recommendation =
      insights.trend === "up"
        ? "Scale what is working and monitor growth consistency."
        : insights.trend === "down"
          ? "Investigate recent decline and focus on root causes for recovery."
          : "Performance is stable; optimize segments with highest variance.";

    return [
      "Executive Summary",
      `File: ${data?.fileName || "Dataset"}`,
      `Rows analyzed: ${filteredRows.length.toLocaleString()} / ${rows.length.toLocaleString()}`,
      `Columns: ${columns.length} (${numericColumns.length} numeric)`,
      `Primary metric: ${yAxis || "N/A"}`,
      `Trend: ${insights.trend.toUpperCase()}`,
      `Max: ${formatTooltipNumber(insights.max)}`,
      `Min: ${formatTooltipNumber(insights.min)}`,
      `Average: ${formatTooltipNumber(insights.avg)}`,
      `Outliers detected: ${insights.outlierCount}`,
      `Recommendation: ${recommendation}`,
    ].join("\n");
  }, [
    insights,
    data?.fileName,
    filteredRows.length,
    rows.length,
    columns.length,
    numericColumns.length,
    yAxis,
  ]);

  useEffect(() => {
    if (!insights || !yAxis || !data?.fileName) return;
    const insightKey = `${data.fileName}:${yAxis}:${filteredRows.length}:${insights.trend}:${insights.outlierCount}`;
    recordInsightGenerated(insightKey, `${yAxis} insights`);
  }, [insights, yAxis, data?.fileName, filteredRows.length]);

  useEffect(() => {
    if (!rows.length) return;
    if (!filterValue && rangeMin === "" && rangeMax === "") return;
    recordActivity("action", "Filtered", `${filteredRows.length}/${rows.length} rows`);
  }, [filterValue, rangeMin, rangeMax, filteredRows.length, rows.length]);

  const handleChartSwitch = useCallback(
    (type) => {
      setSelectedChart(type);
      recordChartCreated(`${type} chart`);
      if (typeof onChartCreated === "function") onChartCreated();
    },
    [onChartCreated]
  );

  const clearFilters = useCallback(() => {
    setFilterValue("");
    setRangeMin("");
    setRangeMax("");
    recordActivity("action", "Cleared", "filters");
  }, []);

  const buildBarLine = useCallback(() => {
    const labels = chartRows.slice(0, 15).map((row) => String(row[xAxis] ?? "-"));
    const datasets = numericColumns.slice(0, 4).map((column, index) => {
      const color = PALETTE.primary[index % PALETTE.primary.length];
      const canvas = chartContainerRef.current?.querySelector("canvas");
      const ctx = canvas?.getContext("2d");
      const gradient = ctx ? PALETTE.gradient(ctx, color) : `${color}99`;

      return {
        label: column,
        data: chartRows.slice(0, 15).map((row) => Number(row[column]) || 0),
        backgroundColor: selectedChart === "line" ? gradient : gradient,
        borderColor: color,
        borderWidth: selectedChart === "line" ? 3 : 2,
        borderRadius: selectedChart === "bar" ? 10 : 0,
        maxBarThickness: 36,
        pointRadius: selectedChart === "line" ? 4 : 0,
        pointHoverRadius: selectedChart === "line" ? 7 : 0,
        pointBackgroundColor: color,
        pointBorderColor: "#FFFFFF",
        fill: selectedChart === "line",
        tension: 0.4,
        cubicInterpolationMode: "monotone",
      };
    });

    return { labels, datasets };
  }, [chartRows, xAxis, numericColumns, selectedChart]);

  const buildDoughnut = useCallback(() => {
    const grouped = {};
    chartRows.forEach((row) => {
      const key = String(row[xAxis] ?? "-");
      grouped[key] = (grouped[key] || 0) + (Number(row[yAxis]) || 0);
    });

    const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
    const total = sorted.reduce((sum, [, value]) => sum + value, 0);
    const labels = [];
    const values = [];
    let others = 0;

    sorted.forEach(([label, value], index) => {
      const percentage = total ? value / total : 0;
      if (index >= 6 || percentage < 0.05) others += value;
      else {
        labels.push(label);
        values.push(value);
      }
    });

    if (others > 0) {
      labels.push("Others");
      values.push(others);
    }

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: PALETTE.primary.slice(0, labels.length),
          borderColor: "#FFFFFF",
          borderWidth: 2,
          hoverOffset: 12,
        },
      ],
    };
  }, [chartRows, xAxis, yAxis]);

  const buildScatter = useCallback(() => {
    const xNumeric = xAxis && numericColumns.includes(xAxis);
    const yNumericColumns = numericColumns.filter((column) => column !== xAxis).slice(0, 3);

    return {
      datasets: yNumericColumns.map((column, datasetIndex) => {
        const color = PALETTE.primary[datasetIndex % PALETTE.primary.length];
        return {
          label: column,
          data: chartRows.map((row, rowIndex) => ({
            x: xNumeric ? Number(row[xAxis]) || rowIndex : rowIndex,
            y: Number(row[column]) || 0,
          })),
          backgroundColor: chartRows.map((_, rowIndex) => `${PALETTE.primary[rowIndex % PALETTE.primary.length]}EE`),
          borderColor: color,
          borderWidth: 1.5,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBorderColor: "#FFFFFF",
        };
      }),
    };
  }, [chartRows, xAxis, numericColumns]);

  const renderChart = () => {
    if (!filteredRows.length) {
      return (
        <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
          No data matches your current filters.
        </div>
      );
    }

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
                    label: (ctx) => `  ${ctx.dataset.label}: (${formatTooltipNumber(ctx.parsed.x)}, ${formatTooltipNumber(ctx.parsed.y)})`,
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

  const downloadChart = useCallback(
    (format) => {
      const canvas = chartContainerRef.current?.querySelector("canvas");
      if (!canvas) return;
      const image = canvas.toDataURL("image/png");
      if (format === "png") {
        const a = document.createElement("a");
        a.href = image;
        a.download = `${data.fileName ?? "chart"}.png`;
        a.click();
      }
      if (format === "pdf") {
        const pdf = new jsPDF("landscape");
        pdf.addImage(image, "PNG", 10, 10, 270, 150);
        pdf.save(`${data.fileName ?? "chart"}.pdf`);
      }
    },
    [data?.fileName]
  );

  const downloadCSV = useCallback(() => {
    const headers = columns.join(",");
    const rowsCsv = filteredRows
      .map((row) => columns.map((column) => `"${row[column] ?? ""}"`).join(","))
      .join("\n");
    const blob = new Blob([`${headers}\n${rowsCsv}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.fileName ?? "data"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [columns, filteredRows, data?.fileName]);

  const downloadExecutiveSummary = useCallback(() => {
    if (!executiveSummary) return;
    const blob = new Blob([executiveSummary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data?.fileName || "dataset"}-executive-summary.txt`;
    a.click();
    URL.revokeObjectURL(url);
    recordActivity("action", "Exported", "executive summary");
  }, [executiveSummary, data?.fileName]);

  const chartTypes = [
    { id: "bar", label: "Bar Chart", icon: BarChart3 },
    { id: "line", label: "Line Chart", icon: LineChart },
    { id: "doughnut", label: "Pie Chart", icon: PieChart },
    { id: "scatter", label: "Scatter Plot", icon: Activity },
  ];

  const TrendIcon =
    insights?.trend === "up" ? TrendingUp : insights?.trend === "down" ? TrendingDown : Minus;

  const trendColor =
    insights?.trend === "up"
      ? "text-emerald-500"
      : insights?.trend === "down"
        ? "text-red-500"
        : "text-gray-400";

  if (!rows.length) {
    return (
      <div className="text-center py-16 space-y-4">
        <BarChart3 className="w-12 h-12 text-primary mx-auto opacity-40" />
        <h3 className="text-xl font-semibold text-foreground">No Data Available</h3>
        <p className="text-muted-foreground">Upload a file to start analysing</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Analytics Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {data.fileName} · {filteredRows.length.toLocaleString()} filtered rows / {rows.length.toLocaleString()} total rows · {columns.length} columns
          </p>
          {data.cleaningReport && (
            <p className="text-xs text-muted-foreground mt-1">
              Data cleaning: removed {data.cleaningReport.removedNullRows} empty rows and {data.cleaningReport.removedDuplicates} duplicates.
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={downloadExecutiveSummary}>
            <FileText className="w-4 h-4 mr-1" /> Summary
          </Button>
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

      {insights && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Max", value: formatTooltipNumber(insights.max) },
              { label: "Min", value: formatTooltipNumber(insights.min) },
              { label: "Avg", value: formatTooltipNumber(insights.avg) },
              { label: "Outliers", value: insights.outlierCount.toLocaleString() },
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

          <div className="bg-card border border-border rounded-xl px-4 py-3">
            <p className="text-sm text-foreground">
              Insight summary: <span className="font-medium">{yAxis || "selected metric"}</span> is showing a <span className="font-medium uppercase">{insights.trend}</span> trend,
              with {insights.outlierCount} outlier{insights.outlierCount !== 1 ? "s" : ""} detected.
            </p>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
            <p className="text-sm font-medium text-foreground">Executive takeaway</p>
            <p className="text-sm text-muted-foreground mt-1">
              {insights.trend === "up"
                ? "Momentum is positive. Consider scaling high-performing segments and preserving quality controls."
                : insights.trend === "down"
                  ? "Trend is weakening. Prioritize investigating recent changes and corrective actions."
                  : "Trend is stable. Focus on reducing variability and improving top-decile contributors."}
            </p>
          </div>
        </>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {chartTypes.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleChartSwitch(id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200
              ${
                selectedChart === id
                  ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 md:p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Column filter</label>
            <select
              value={filterColumn}
              onChange={(e) => setFilterColumn(e.target.value)}
              className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            >
              {columns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Contains text</label>
            <input
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground"
              placeholder="Type to filter"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Range column</label>
            <select
              value={rangeColumn}
              onChange={(e) => setRangeColumn(e.target.value)}
              className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            >
              {numericColumns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Min value</label>
            <input
              type="number"
              value={rangeMin}
              onChange={(e) => setRangeMin(e.target.value)}
              className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground"
              placeholder="No min"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Max value</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={rangeMax}
                onChange={(e) => setRangeMax(e.target.value)}
                className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                placeholder="No max"
              />
              <Button variant="outline" size="sm" onClick={clearFilters}>Clear</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">X Axis</label>
          <select
            value={xAxis}
            onChange={(e) => setXAxis(e.target.value)}
            className="text-sm bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {columns.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
        </div>
        {selectedChart !== "doughnut" && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Y Axis</label>
            <select
              value={yAxis}
              onChange={(e) => setYAxis(e.target.value)}
              className="text-sm bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {numericColumns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </div>
        )}
        {suggestedChart !== selectedChart && (
          <button
            onClick={() => handleChartSwitch(suggestedChart)}
            className="text-xs text-primary border border-primary/30 rounded-lg px-3 py-2 hover:bg-primary/10 transition-colors"
          >
            Suggested: {suggestedChart} chart
          </button>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <div ref={chartContainerRef} style={{ height: 380 }}>
          {renderChart()}
        </div>
        {filteredRows.length > CHART_ROW_LIMIT && (
          <p className="text-xs text-muted-foreground mt-3">
            Showing first {CHART_ROW_LIMIT.toLocaleString()} rows in charts for performance.
          </p>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-foreground">Data Preview</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Showing first {TABLE_PREVIEW_LIMIT} of {filteredRows.length.toLocaleString()} filtered rows
            </p>
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
                {columns.slice(0, 6).map((column) => (
                  <th
                    key={column}
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRows.slice(0, TABLE_PREVIEW_LIMIT).map((row, index) => (
                <tr key={index} className="hover:bg-muted/20 transition-colors">
                  {columns.slice(0, 6).map((column) => (
                    <td key={column} className="px-4 py-3 text-foreground">
                      {typeof row[column] === "number" ? row[column].toLocaleString() : String(row[column] ?? "-")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-foreground text-lg">{data.fileName}</h3>
                <p className="text-xs text-muted-foreground">
                  {filteredRows.length.toLocaleString()} filtered rows / {rows.length.toLocaleString()} total rows · {columns.length} columns
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={downloadCSV}>
                  <Download className="w-4 h-4 mr-1" /> Download CSV
                </Button>
                <button
                  onClick={() => setShowModal(false)}
                  className="ml-2 text-muted-foreground hover:text-foreground text-xl font-medium px-2"
                >
                  X
                </button>
              </div>
            </div>
            <div className="overflow-auto flex-1">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">#</th>
                    {columns.map((column) => (
                      <th
                        key={column}
                        className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tableRows.map((row, index) => (
                    <tr key={index} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">{index + 1}</td>
                      {columns.map((column) => (
                        <td key={column} className="px-4 py-2.5 text-foreground whitespace-nowrap">
                          {typeof row[column] === "number" ? row[column].toLocaleString() : String(row[column] ?? "-")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredRows.length > TABLE_MODAL_LIMIT && (
              <div className="px-6 py-3 border-t border-border text-xs text-muted-foreground">
                Display limited to {TABLE_MODAL_LIMIT.toLocaleString()} rows for browser performance.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
