"use client";

import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return (
    <div className="w-full">
      <UserProfile 
        appearance={{
          elements: {
            rootBox: "w-full mx-auto",
            card: "shadow-none border-0",
            navbar: "hidden",
            pageScrollBox: "px-0 sm:px-4"
          }
        }}
      />
    </div>
  );
} 