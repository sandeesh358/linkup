'use client';

import { useAuth } from "@clerk/nextjs";
import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import FloatingCreatePost from "./FloatingCreatePost";
import Link from "next/link";
import { MessageSquare, HelpCircle, LifeBuoy } from "lucide-react";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        {children}
      </div>
    );
  }

  return (
    <div>
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="hidden lg:block lg:col-span-3">
              <Sidebar />
            </div>
            <div className="lg:col-span-9">{children}</div>
          </div>
        </div>
      </main>
      <FloatingCreatePost />
    </div>
  );
} 