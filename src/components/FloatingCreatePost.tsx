"use client";

import { Button } from "./ui/button";
import { usePathname, useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export default function FloatingCreatePost() {
  const pathname = usePathname();
  const router = useRouter();
  const isCreatePostPage = pathname === "/create-post";
  
  const handleClick = () => {
    if (isCreatePostPage) {
      router.push("/");
    } else {
      router.push("/create-post");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 lg:hidden">
      <Button 
        size="icon" 
        className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:translate-y-0.5 hover:scale-105 active:scale-95"
        onClick={handleClick}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
} 