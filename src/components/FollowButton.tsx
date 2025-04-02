"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Loader2Icon, UserPlus, UserMinus } from "lucide-react";
import toast from "react-hot-toast";
import { toggleFollow, checkIfFollowing } from "@/actions/user.action";
import { cn } from "@/lib/utils";

function FollowButton({ 
  userId, 
  className,
  variant = "default",
  size = "sm"
}: { 
  userId: string; 
  className?: string;
  variant?: "default" | "overlay";
  size?: "sm" | "icon";
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const following = await checkIfFollowing(userId);
        setIsFollowing(following);
      } catch (error) {
        console.error("Error checking follow status:", error);
      } finally {
        setIsCheckingStatus(false);
      }
    };
    checkFollowStatus();
  }, [userId]);

  const handleFollow = async () => {
    setIsLoading(true);

    try {
      await toggleFollow(userId);
      setIsFollowing(!isFollowing);
      window.dispatchEvent(new Event('follow-updated'));
      toast.success(isFollowing ? "User unfollowed successfully" : "User followed successfully");
    } catch (error) {
      toast.error(isFollowing ? "Error unfollowing user" : "Error following user");
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "overlay" || size === "icon") {
    return (
      <Button
        size={size}
        variant={isFollowing ? "destructive" : "secondary"}
        onClick={handleFollow}
        disabled={isLoading || isCheckingStatus}
        className={cn(
          "absolute bottom-0 right-0 rounded-full p-1.5 bg-background shadow-md",
          isFollowing ? "hover:bg-destructive/10" : "hover:bg-secondary",
          className
        )}
      >
        {isLoading || isCheckingStatus ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : isFollowing ? (
          <UserMinus className="size-4" />
        ) : (
          <UserPlus className="size-4" />
        )}
      </Button>
    );
  }

  return (
    <Button
      size={size}
      variant={isFollowing ? "destructive" : "secondary"}
      onClick={handleFollow}
      disabled={isLoading || isCheckingStatus}
      className={cn("w-20 rounded-full", className)}
    >
      {isLoading || isCheckingStatus ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : isFollowing ? (
        "Unfollow"
      ) : (
        "Follow"
      )}
    </Button>
  );
}
export default FollowButton;
