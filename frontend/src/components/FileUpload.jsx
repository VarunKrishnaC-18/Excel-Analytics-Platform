import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, X, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import * as XLSX from 'xlsx';

export const FileUpload = ({ onFileProcessed }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      alert("Please upload a valid Excel or CSV file");
      return;
    }

    setUploadedFile(file);
    setProcessing(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Simulate processing delay for better UX
      setTimeout(() => {
        onFileProcessed({
          fileName: file.name,
          data: jsonData,
          sheets: workbook.SheetNames,
          uploadDate: new Date().toISOString()
        });
        setProcessing(false);
      }, 2000);
    } catch (error) {
      console.error("Error processing file:", error);
      setProcessing(false);
      alert("Error processing file. Please try again.");
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-primary/10 rounded-full px-4 py-2 mb-4">
          <Sparkles className="w-4 h-4 text-primary mr-2" />
          <span className="text-sm font-medium text-primary">Advanced File Processing</span>
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Excel File Upload & Parsing</h2>
        <p className="text-lg text-muted-foreground">
          Upload your Excel (.xlsx, .xls) or CSV files to unlock powerful analytics
        </p>
      </div>

      {/* Upload Area */}
      {!uploadedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
            dragActive
              ? 'border-primary bg-primary/5 scale-105'
              : 'border-border hover:border-primary/50 hover:bg-primary/5'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center animate-pulse">
              <Upload className="w-10 h-10 text-primary" />
            </div>
            <div>
              <p className="text-xl font-semibold text-foreground mb-2">
                Drop your Excel file here
              </p>
              <p className="text-muted-foreground">or click to browse from your computer</p>
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-primary to-primary-hover hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-lg px-8 py-3"
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                processing ? 'bg-primary/10' : 'bg-success/10'
              }`}>
                {processing ? (
                  <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-success" />
                )}
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{uploadedFile.name}</p>
                <p className="text-muted-foreground">
                  {processing ? "Processing your file..." : "Ready for analysis"}
                </p>
                {processing && (
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
                  </div>
                )}
              </div>
            </div>
            {!processing && (
              <Button variant="ghost" size="sm" onClick={removeFile} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-all duration-200 hover-scale">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <FileSpreadsheet className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Multiple Formats</h3>
          <p className="text-sm text-muted-foreground">.xlsx, .xls, .csv files supported</p>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-all duration-200 hover-scale">
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-green-500 font-bold text-xl">∞</span>
          </div>
          <h3 className="font-semibold text-foreground mb-2">No Size Limits</h3>
          <p className="text-sm text-muted-foreground">Process large datasets efficiently</p>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-all duration-200 hover-scale">
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-purple-500 font-bold text-xl">⚡</span>
          </div>
          <h3 className="font-semibold text-foreground mb-2">Lightning Fast</h3>
          <p className="text-sm text-muted-foreground">Instant data parsing & analysis</p>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-6 border border-border">
        <h3 className="font-semibold text-foreground mb-3">💡 Pro Tips for Better Results</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>• Ensure your data has clear column headers</div>
          <div>• Remove empty rows and columns</div>
          <div>• Use consistent date formats</div>
          <div>• Keep numeric data as numbers, not text</div>
        </div>
      </div>
    </div>
  );
};