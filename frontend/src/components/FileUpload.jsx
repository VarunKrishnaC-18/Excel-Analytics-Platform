import { useState, useRef, useCallback } from "react";
import { Upload, FileSpreadsheet, X, CheckCircle, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import * as XLSX from "xlsx";

// ── localStorage helpers (same key as Dashboard / DashboardHome) ──
const getStats = () =>
  JSON.parse(localStorage.getItem("stats")) || {
    totalFiles:     0,
    chartsCreated:  0,
    aiInsights:     0,
    recentActivity: [],
    lastChartType:  null,
  };

const recordFileUpload = (fileName) => {
  const stats = getStats();

  // Prevent duplicate count if same file uploaded within 5 seconds
  const last = stats.recentActivity[0];
  const now  = Date.now();
  const isDup = last &&
    last.type   === "upload" &&
    last.name   === fileName &&
    now - new Date(last.createdAt).getTime() < 5000;

  if (!isDup) {
    stats.totalFiles += 1;
    stats.recentActivity.unshift({
      type:      "upload",
      action:    "Uploaded",
      name:      fileName,
      createdAt: new Date().toISOString(),
    });
    if (stats.recentActivity.length > 50) stats.recentActivity.length = 50;
    localStorage.setItem("stats", JSON.stringify(stats));
  }
};

// ─────────────────────────────────────────────────────────────────
export const FileUpload = ({ onFileProcessed }) => {
  const [dragActive,    setDragActive]    = useState(false);
  const [uploadedFile,  setUploadedFile]  = useState(null);
  const [processing,    setProcessing]    = useState(false);
  const [error,         setError]         = useState(null);
  const [progress,      setProgress]      = useState(0);
  const fileInputRef = useRef(null);

  // ── Drag handlers ──────────────────────────────────────────────
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, []); // eslint-disable-line

  const handleFileInput = useCallback((e) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  }, []); // eslint-disable-line

  // ── Core file processor ────────────────────────────────────────
  const handleFile = async (file) => {
    setError(null);

    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError("Please upload a valid Excel (.xlsx, .xls) or CSV file.");
      return;
    }

    const MAX_MB = 50;
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${MAX_MB} MB.`);
      return;
    }

    setUploadedFile(file);
    setProcessing(true);
    setProgress(10);

    try {
      const buffer  = await file.arrayBuffer();
      setProgress(40);

      const workbook  = XLSX.read(buffer, { cellDates: true });
      setProgress(70);

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData  = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (!jsonData.length) {
        throw new Error("The file appears to be empty or has no readable rows.");
      }

      const fileSize = (file.size / 1024).toFixed(1);
      setProgress(90);

      // Record in localStorage BEFORE calling onFileProcessed
      recordFileUpload(file.name);

      // Simulate brief visual pause so progress bar reaches 100 %
      setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          onFileProcessed({
            fileName:   file.name,
            data:       jsonData,
            sheets:     workbook.SheetNames,
            uploadDate: new Date().toISOString(),
            fileSize,
          });
          setProcessing(false);
        }, 300);
      }, 600);

      // Non-blocking backend sync (fire-and-forget)
      fetch("http://localhost:5001/api/files/upload", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          rows:     jsonData.length,
          columns:  Object.keys(jsonData[0] || {}).length,
          fileSize,
        }),
      }).catch(() => {});

    } catch (err) {
      console.error("Error processing file:", err);
      setError(err.message || "Error processing file. Please try again.");
      setProcessing(false);
      setProgress(0);
      setUploadedFile(null);
    }
  };

  const removeFile = useCallback(() => {
    setUploadedFile(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  return (
    <div className="space-y-8">

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div className="text-center">
        <div className="inline-flex items-center bg-primary/10 rounded-full px-4 py-2 mb-4">
          <Sparkles className="w-4 h-4 text-primary mr-2" />
          <span className="text-sm font-medium text-primary">Advanced File Processing</span>
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Excel File Upload &amp; Parsing
        </h2>
        <p className="text-lg text-muted-foreground">
          Upload your Excel (.xlsx, .xls) or CSV files to unlock powerful analytics
        </p>
      </div>

      {/* ── ERROR BANNER ───────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Upload failed</p>
            <p className="mt-0.5 text-red-500/80">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600 text-lg">✕</button>
        </div>
      )}

      {/* ── DROP ZONE / FILE STATUS ─────────────────────────────── */}
      {!uploadedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer
            ${dragActive
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border hover:border-primary/50 hover:bg-primary/5"
            }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="space-y-6 pointer-events-none">
            <div className={`mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center
              ${dragActive ? "animate-bounce" : "animate-pulse"}`}>
              <Upload className="w-10 h-10 text-primary" />
            </div>
            <div>
              <p className="text-xl font-semibold text-foreground mb-2">
                {dragActive ? "Release to upload" : "Drop your Excel file here"}
              </p>
              <p className="text-muted-foreground">or click to browse from your computer</p>
              <p className="text-xs text-muted-foreground mt-2">Supports .xlsx · .xls · .csv — up to 50 MB</p>
            </div>
            <Button
              className="bg-gradient-to-r from-primary to-primary-hover hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-lg px-8 py-3 pointer-events-auto"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            >
              Choose File
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Icon */}
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0
                ${processing ? "bg-primary/10" : "bg-emerald-500/10"}`}>
                {processing ? (
                  <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                )}
              </div>
              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold text-foreground truncate">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {processing
                    ? `Processing… ${progress}%`
                    : `Ready for analysis · ${(uploadedFile.size / 1024).toFixed(1)} KB`}
                </p>
                {/* Progress bar */}
                <div className="w-full bg-muted rounded-full h-1.5 mt-3">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
            {/* Remove button */}
            {!processing && (
              <button
                onClick={removeFile}
                className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── FEATURE CARDS ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon:  <FileSpreadsheet className="w-6 h-6 text-blue-500" />,
            bg:    "bg-blue-500/10",
            title: "Multiple Formats",
            desc:  ".xlsx, .xls, .csv files supported",
          },
          {
            icon:  <span className="text-green-500 font-bold text-xl leading-none">∞</span>,
            bg:    "bg-green-500/10",
            title: "No Size Limits",
            desc:  "Process large datasets efficiently",
          },
          {
            icon:  <span className="text-purple-500 font-bold text-xl leading-none">⚡</span>,
            bg:    "bg-purple-500/10",
            title: "Lightning Fast",
            desc:  "Instant data parsing & analysis",
          },
        ].map(({ icon, bg, title, desc }) => (
          <div
            key={title}
            className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          >
            <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mx-auto mb-4`}>
              {icon}
            </div>
            <h3 className="font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>

      {/* ── PRO TIPS ───────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-6 border border-border">
        <h3 className="font-semibold text-foreground mb-3">💡 Pro Tips for Better Results</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
          {[
            "Ensure your data has clear column headers",
            "Remove empty rows and columns",
            "Use consistent date formats",
            "Keep numeric data as numbers, not text",
          ].map(tip => (
            <div key={tip} className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              {tip}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
