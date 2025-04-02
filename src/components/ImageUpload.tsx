"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <div className={cn("relative", isProfileImage ? "w-24 h-24" : "w-40 h-40", className)}>
        <img 
          src={value} 
          alt="Upload" 
          className={cn(
            "object-cover", 
            isProfileImage ? "w-24 h-24 rounded-full" : "w-40 h-40 rounded-md"
          )} 
        />
        <button
          onClick={() => onChange("")}
          className={cn(
            "absolute p-1 bg-red-500 rounded-full shadow-sm text-white",
            isProfileImage ? "top-0 right-0" : "top-2 right-2"
          )}
          type="button"
          aria-label="Remove image"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
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
