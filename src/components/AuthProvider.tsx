'use client';

import { useAuth } from "@clerk/nextjs";
import { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isSignedIn } = useAuth();

  return (
    <>
      {isSignedIn ? (
        children
      ) : (
        <div className="w-full">
          {children}
        </div>
      )}
    </>
  );
} 