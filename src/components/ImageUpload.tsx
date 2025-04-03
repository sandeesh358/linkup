"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AmbientBorder } from "./ui/ambient-border";

interface ImageUploadProps {
  onChange: (url: string) => void;
  value: string;
  endpoint: "postImage" | "profileImage";
  className?: string;
  isProfileImage?: boolean;
}

function ImageUpload({ endpoint, onChange, value, className, isProfileImage = false }: ImageUploadProps) {
  if (value) {
    return (
      <AmbientBorder 
        className={cn(
          isProfileImage ? "w-24 h-24" : "w-full",
          className
        )}
        intensity={0.6}
      >
        <div className="relative">
          <img 
            src={value} 
            alt="Upload" 
            className={cn(
              "object-cover", 
              isProfileImage ? "w-24 h-24 rounded-full" : "w-full h-auto aspect-video"
            )}
            crossOrigin="anonymous"
          />
          <button
            onClick={() => onChange("")}
            className={cn(
              "absolute p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors z-10",
              isProfileImage ? "top-0 right-0" : "top-2 right-2"
            )}
            type="button"
            aria-label="Remove image"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      </AmbientBorder>
    );
  }

  return (
    <div className={className}>
      <UploadDropzone
        endpoint={endpoint}
        onClientUploadComplete={(res) => {
          onChange(res?.[0].url);
        }}
        onUploadError={(error: Error) => {
          console.log(error);
        }}
        className={cn(
          isProfileImage ? "ut-label:text-sm ut-allowed-content:text-xs" : ""
        )}
      />
    </div>
  );
}

export default ImageUpload;
