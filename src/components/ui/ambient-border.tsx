"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AmbientBorderProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  className2?: string;
}

export function AmbientBorder({
  children,
  className,
  intensity = 20.0,
  className2,
}: AmbientBorderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [glowColor, setGlowColor] = useState("rgba(59, 130, 246, 0.5)");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateGlowColor = (element: HTMLVideoElement | HTMLImageElement) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = 50;
      canvas.height = 50;

      try {
        context.drawImage(element, 0, 0, 50, 50);
        const { data } = context.getImageData(0, 0, 50, 50);
        
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (brightness > 100) { // Only sample bright pixels
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
        }

        if (count > 0) {
          r = Math.min(255, Math.round((r / count) * 1.5));
          g = Math.min(255, Math.round((g / count) * 1.5));
          b = Math.min(255, Math.round((b / count) * 1.5));
          setGlowColor(`rgba(${r}, ${g}, ${b}, ${intensity})`);
        }
      } catch (error) {
        console.error("Error sampling color:", error);
      }
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLVideoElement || node instanceof HTMLImageElement) {
            updateGlowColor(node);
          }
        });
      });
    });

    observer.observe(container, { childList: true, subtree: true });

    const mediaElement = container.querySelector('video, img');
    if (mediaElement instanceof HTMLVideoElement || mediaElement instanceof HTMLImageElement) {
      updateGlowColor(mediaElement);
    }

    return () => observer.disconnect();
  }, [intensity]);

  return (
    <div ref={containerRef} className={cn("relative group", className)}>
      {/* Main glow effect */}
      <div
        className="absolute inset-0 -m-[50px] rounded-[40px] opacity-75 blur-[50px] group-hover:opacity-100 transition-all duration-500"
        style={{
          background: glowColor,
          transform: 'translateZ(0)',
        }}
      />
      
      {/* Glass panel - outer */}
      <div className="absolute inset-0 -m-6 rounded-3xl bg-white/[0.08] backdrop-blur-xl border border-white/[0.15] shadow-[0_8px_32px_rgba(0,0,0,0.37)] group-hover:-m-8 transition-all duration-500" />
      
      {/* Glass panel - inner */}
      <div className="absolute inset-0 -m-3 rounded-2xl bg-white/[0.08] backdrop-blur-lg border border-white/[0.15] shadow-[inset_0_0_16px_rgba(255,255,255,0.15)] group-hover:-m-4 transition-all duration-500" />
      
      {/* Content container */}
      <div className={cn(
        "relative rounded-xl overflow-hidden",
        "bg-black/5 backdrop-blur-md border border-white/[0.15]",
        "shadow-[0_8px_32px_rgba(0,0,0,0.37)]",
        className2
      )}>
        {children}
      </div>
    </div>
  );
} 