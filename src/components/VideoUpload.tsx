"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoUploadProps {
  onChange: (url: string) => void;
  value: string;
  className?: string;
}

function VideoUpload({ onChange, value, className }: VideoUploadProps) {
  if (value) {
    return (
      <div className={cn("relative w-full", className)}>
        <video 
          src={value} 
          controls
          className="w-full rounded-lg"
        />
        <button
          onClick={() => onChange("")}
          className="absolute top-2 right-2 p-1 bg-red-500 rounded-full shadow-sm text-white"
          type="button"
          aria-label="Remove video"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    );
  }
  return (
    <div className={className}>
      <UploadDropzone
        endpoint="postVideo"
        onClientUploadComplete={(res) => {
          onChange(res?.[0].url);
        }}
        onUploadError={(error: Error) => {
          console.log(error);
        }}
      />
    </div>
  );
}

export default VideoUpload; 