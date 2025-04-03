"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { XIcon, PauseIcon, PlayIcon, Volume2Icon, VolumeXIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { AmbientBorder } from "./ui/ambient-border";

interface VideoUploadProps {
  onChange: (url: string) => void;
  value: string;
  className?: string;
}

function VideoUpload({ onChange, value, className }: VideoUploadProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const controlsTimeout = useRef<NodeJS.Timeout>();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
          if (!entry.isIntersecting && !video.paused) {
            video.pause();
            setIsPlaying(false);
          } else if (entry.isIntersecting && isPlaying) {
            video.play().catch(() => {
              // Handle autoplay restrictions
              setIsPlaying(false);
            });
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [isPlaying]);

  const handlePlayPause = useCallback(() => {
    if (!videoRef.current || !isVisible) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {
        // Handle autoplay restrictions
        setIsPlaying(false);
      });
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, isVisible]);

  const handleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && !isDragging) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  }, [isDragging]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * videoRef.current.duration;
      setProgress(pos * 100);
    }
  }, []);

  const handleVideoEnd = useCallback(() => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    setShowControls(true);
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!isDragging) {
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    }
  }, [isDragging]);

  const handleVideoClick = useCallback((e: React.MouseEvent) => {
    // Prevent click when dragging progress bar
    if (!isDragging) {
      handlePlayPause();
    }
  }, [handlePlayPause, isDragging]);

  useEffect(() => {
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, []);

  if (value) {
    return (
      <AmbientBorder 
        className="w-full" 
        intensity={0.6}
      >
        <div 
          className={cn("relative w-full group cursor-pointer", className)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Video Element */}
          <video 
            ref={videoRef}
            src={value} 
            className="w-full aspect-video object-cover"
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnd}
            onClick={handleVideoClick}
            playsInline
            loop
            crossOrigin="anonymous"
            preload="metadata"
          />
          
          {/* Video Controls Overlay */}
          <div 
            className={cn(
              "absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/30",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              showControls ? "opacity-100" : "opacity-0"
            )}
          >
            {/* Center Play/Pause Button */}
            <div 
              className={cn(
                "absolute inset-0 flex items-center justify-center",
                "opacity-0 transition-opacity duration-200",
                (!isPlaying || !isVisible) ? "opacity-100" : ""
              )}
            >
              <div className="bg-black/50 rounded-full p-4">
                <PlayIcon className="h-8 w-8 text-white" />
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0">
              {/* Progress Bar */}
              <div 
                ref={progressRef}
                className="relative h-1 bg-white/30 cursor-pointer"
                onClick={handleProgressClick}
              >
                <div 
                  className="absolute left-0 top-0 h-full bg-white transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between px-4 py-3">
                <button
                  onClick={handlePlayPause}
                  className="text-white hover:text-white/80 transition-colors"
                  disabled={!isVisible}
                >
                  {isPlaying ? (
                    <PauseIcon className="h-5 w-5" />
                  ) : (
                    <PlayIcon className="h-5 w-5" />
                  )}
                </button>

                <button
                  onClick={handleMute}
                  className="text-white hover:text-white/80 transition-colors"
                >
                  {isMuted ? (
                    <VolumeXIcon className="h-5 w-5" />
                  ) : (
                    <Volume2Icon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Remove Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors z-10"
            type="button"
            aria-label="Remove video"
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