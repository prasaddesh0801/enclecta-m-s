"use client";

import { useState } from "react";
import { UploadCloud, File, Trash, Loader2, Download } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FileUpload({ 
  clientId, 
  taskId, 
  existingFiles = [] 
}: { 
  clientId?: string, 
  taskId?: string,
  existingFiles?: any[]
}) {
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    if (clientId) formData.append("clientId", clientId);
    if (taskId) formData.append("taskId", taskId);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
      // reset input
      e.target.value = '';
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/5">
      <h2 className="text-lg font-medium text-foreground mb-4">Files & Documents</h2>
      
      <div className="space-y-3 mb-6">
        {existingFiles.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No files attached yet.</p>
        ) : (
          existingFiles.map(file => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                  <File className="w-4 h-4 text-primary" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-foreground truncate">{file.fileName}</p>
                  <p className="text-xs text-muted-foreground">{file.fileSize ? formatSize(file.fileSize) : 'Unknown size'}</p>
                </div>
              </div>
              <a 
                href={file.url} 
                download
                target="_blank"
                rel="noreferrer"
                className="p-2 text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          ))
        )}
      </div>

      <div className="relative">
        <input 
          type="file" 
          onChange={handleFileChange} 
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
        />
        <div className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-colors
          ${isUploading ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-primary/50 hover:bg-white/5'}`}>
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
          ) : (
            <UploadCloud className="w-6 h-6 text-muted-foreground mb-2" />
          )}
          <p className="text-sm font-medium text-foreground">
            {isUploading ? 'Uploading...' : 'Click or drag file to upload'}
          </p>
        </div>
      </div>
    </div>
  );
}
