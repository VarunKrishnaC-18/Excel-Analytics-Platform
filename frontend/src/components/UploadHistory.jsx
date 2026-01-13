import { useState } from "react";
import { FileSpreadsheet, Calendar, Download, Trash2, Eye } from "lucide-react";
import { Button } from "./ui/button";

export const UploadHistory = ({ uploads, onViewFile, onDeleteFile }) => {
  const [sortBy, setSortBy] = useState('date');
  const [filterText, setFilterText] = useState('');

  const filteredUploads = uploads
    .filter(upload =>
      upload.fileName.toLowerCase().includes(filterText.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        case 'name':
          return a.fileName.localeCompare(b.fileName);
        case 'size':
          return parseInt(b.fileSize) - parseInt(a.fileSize);
        default:
          return 0;
      }
    });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Upload History</h2>
        <p className="text-muted-foreground">Manage and track your uploaded files</p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search files..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full p-2 border border-border rounded-md bg-background text-foreground"
          />
        </div>
        <div className="flex space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
          </select>
        </div>
      </div>

      {/* Upload Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-medium text-foreground">Total Files</h3>
          <p className="text-2xl font-bold text-primary">{uploads.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-medium text-foreground">Total Data Rows</h3>
          <p className="text-2xl font-bold text-primary">
            {uploads.reduce((sum, upload) => sum + upload.rows, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-medium text-foreground">Storage Used</h3>
          <p className="text-2xl font-bold text-primary">
            {uploads.reduce((sum, upload) => sum + parseInt(upload.fileSize), 0)} KB
          </p>
        </div>
      </div>

      {/* Files List */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {filteredUploads.length === 0 ? (
          <div className="text-center py-12">
            <FileSpreadsheet className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No Files Found</h3>
            <p className="text-muted-foreground">
              {uploads.length === 0
                ? "Upload your first Excel file to get started"
                : "No files match your search criteria"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-medium text-foreground">File Name</th>
                  <th className="text-left p-4 font-medium text-foreground">Upload Date</th>
                  <th className="text-left p-4 font-medium text-foreground">Rows</th>
                  <th className="text-left p-4 font-medium text-foreground">Columns</th>
                  <th className="text-left p-4 font-medium text-foreground">Size</th>
                  <th className="text-left p-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUploads.map((upload) => (
                  <tr key={upload.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileSpreadsheet className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{upload.fileName}</p>
                          <p className="text-sm text-muted-foreground">Excel File</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{formatDate(upload.uploadDate)}</span>
                      </div>
                    </td>
                    <td className="p-4 text-foreground">{upload.rows.toLocaleString()}</td>
                    <td className="p-4 text-foreground">{upload.columns}</td>
                    <td className="p-4 text-foreground">{upload.fileSize} KB</td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewFile(upload.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteFile(upload.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
