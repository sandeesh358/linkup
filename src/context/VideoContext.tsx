"use client";

import { createContext, useContext, useState } from "react";

interface VideoContextType {
  currentlyPlayingId: string | null;
  setCurrentlyPlayingId: (id: string | null) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export function VideoProvider({ children }: { children: React.ReactNode }) {
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  return (
    <VideoContext.Provider value={{ currentlyPlayingId, setCurrentlyPlayingId, isMuted, setIsMuted }}>
      {children}
    </VideoContext.Provider>
  );
}

export function useVideo() {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error("useVideo must be used within a VideoProvider");
  }
  return context;
} 