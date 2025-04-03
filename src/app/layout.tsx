import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { cn } from "@/lib/utils";
import { VideoProvider } from "@/context/VideoContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "LinkUp",
  description: "A modern social media application powered by Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={cn("min-h-screen bg-background font-sans antialiased", geistSans.variable, geistMono.variable)}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* Global Glow Effect */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white dark:from-black dark:via-gray-900 dark:to-black">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 dark:opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-transparent to-blue-100/50 dark:from-blue-500/20 dark:via-transparent dark:to-blue-500/20 animate-pulse"></div>
              </div>
              {/* Decorative circles for visual interest */}
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-100/50 dark:bg-blue-500/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-100/50 dark:bg-blue-500/20 rounded-full blur-xl"></div>
            </div>

            <div className="relative min-h-screen">
              <Navbar />
              <VideoProvider>
                <AuthenticatedLayout>{children}</AuthenticatedLayout>
              </VideoProvider>
              <Toaster />
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
