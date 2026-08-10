import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileSpreadsheet, X, CheckCircle2 } from "lucide-react";
import { useState, useCallback, memo } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export interface FileUploadProps {
  onUploadSuccess: (reportId: string) => void;
}

export const FileUpload = memo(function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped && (dropped.type === "text/csv" || dropped.name.endsWith(".csv"))) {
        setFile(dropped);
      } else {
        toast({
          title: "Invalid file",
          description: "Please upload a CSV file",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  }, []);

  const handleClearFile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", "demo-user");

      const res = await fetch("/api/upload-ledger", { method: "POST", body: formData });
      if (!res.ok) {
        const err = (await res.json()) as { message?: string };
        throw new Error(err.message || "Upload failed");
      }
      const data = (await res.json()) as { reportId: string };
      toast({
        title: "Upload successful",
        description: "Your file is being processed by our AI engine.",
      });
      onUploadSuccess(data.reportId);
      setFile(null);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Upload failed";
      toast({ title: "Upload failed", description: msg, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  }, [file, onUploadSuccess, toast]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Upload className="w-4 h-4 text-primary" />
          Upload P&L Statement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          data-testid="dropzone-file-upload"
          className={`relative border-2 border-dashed rounded-md p-6 text-center transition-colors cursor-pointer ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("csv-input")?.click()}
        >
          <input
            id="csv-input"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileSelect}
            data-testid="input-file-csv"
          />
          <AnimatePresence mode="wait">
            {file ? (
              <motion.div
                key="file-selected"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-10 h-10 rounded-md bg-chart-2/10 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5 text-chart-2" />
                </div>
                <p
                  className="text-sm font-medium truncate max-w-full"
                  data-testid="text-selected-filename"
                >
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                <button
                  onClick={handleClearFile}
                  className="absolute top-2 right-2 p-1 rounded-sm text-muted-foreground"
                  data-testid="button-clear-file"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="no-file"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Drag & drop a <span className="font-medium text-foreground">.csv</span> file here
                </p>
                <p className="text-xs text-muted-foreground">or click to browse</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {file && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4"
          >
            <Button
              onClick={() => {
                void handleUpload();
              }}
              disabled={isUploading}
              className="w-full"
              data-testid="button-upload-file"
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                  />
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Analyze with AI
                </span>
              )}
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
});
