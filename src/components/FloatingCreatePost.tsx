"use client";

import { Button } from "./ui/button";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

export default function FloatingCreatePost() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();
  const isCreatePostPage = pathname === "/create-post";
  const isDark = theme === "dark";
  
  const handleClick = () => {
    if (isCreatePostPage) {
      router.push("/");
    } else {
      router.push("/create-post");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-0 left-0 right-0 flex justify-center items-center z-50 lg:hidden"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative group"
        >
          {/* Outer glow effect */}
          <motion.div
            className={cn(
              "absolute inset-0 rounded-t-[2rem] blur-xl",
              isDark 
                ? "bg-gradient-to-r from-primary via-primary/80 to-primary"
                : "bg-gradient-to-r from-primary/90 via-primary/80 to-primary/70"
            )}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Inner glow effect */}
          <motion.div
            className={cn(
              "absolute inset-0 rounded-t-[2rem] blur-md",
              isDark
                ? "bg-gradient-to-r from-primary/40 to-primary/20"
                : "bg-gradient-to-r from-primary/30 to-primary/10"
            )}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Button with gradient background */}
          <Button 
            size="icon" 
            className={cn(
              "h-10 w-32 rounded-t-[2rem] relative z-10",
              isDark
                ? "bg-gradient-to-br from-primary via-primary/90 to-primary/80"
                : "bg-gradient-to-br from-primary/90 via-primary/80 to-primary/70",
              "shadow-lg hover:shadow-xl transition-all duration-300",
              "border-2",
              isDark ? "border-white/20" : "border-black/10",
              isDark
                ? "hover:from-primary/90 hover:via-primary/80 hover:to-primary/70"
                : "hover:from-primary/80 hover:via-primary/70 hover:to-primary/60",
              isDark
                ? "active:from-primary/80 active:via-primary/70 active:to-primary/60"
                : "active:from-primary/70 active:via-primary/60 active:to-primary/50",
              "group-hover:scale-105 group-hover:rotate-3",
              "group-active:scale-95 group-active:-rotate-3"
            )}
            onClick={handleClick}
          >
            <motion.div
              key={isCreatePostPage ? "close" : "post"}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "font-medium",
                isDark ? "text-black" : "text-white"
              )}
            >
              {isCreatePostPage ? (
                <X className="h-7 w-7" />
              ) : (
                "Post"
              )}
            </motion.div>
          </Button>

          {/* Floating particles effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className={cn(
                  "absolute w-1 h-1 rounded-full",
                  isDark ? "bg-white/30" : "bg-black/20"
                )}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
                style={{
                  left: `${20 + i * 15}%`,
                  top: "50%",
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 