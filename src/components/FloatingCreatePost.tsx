"use client";

import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FloatingCreatePost() {
  const pathname = usePathname();
  const isCreatePostPage = pathname === "/create-post";
  
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 lg:hidden">
      <Link href={isCreatePostPage ? "/" : "/create-post"}>
        <Button 
          size="lg" 
          className="relative rounded-t-full rounded-b-none bg-gradient-to-b from-primary via-primary/95 to-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_25px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-1 active:translate-y-0.5 hover:scale-105 active:scale-95 before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/20 before:to-transparent before:rounded-t-full before:rounded-b-none before:opacity-50 hover:before:opacity-70"
        >
          <span>{isCreatePostPage ? "Home" : "Post"}</span>
        </Button>
      </Link>
    </div>
  );
} 