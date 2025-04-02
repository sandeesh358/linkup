"use client";

import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import FollowModal from "./FollowModal";
import { getFollowers, getFollowing, getUserByClerkId } from "@/actions/user.action";
import type { User } from "@/lib/types";
import { CalendarDays, Link as LinkIcon, MapPin, HelpCircle, Mail } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Card } from "./ui/card";

export default function Sidebar() {
  const { user: clerkUser } = useUser();
  const [dbUser, setDbUser] = useState<any>(null);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchDbUser = useCallback(async () => {
    if (clerkUser?.id) {
      const user = await getUserByClerkId(clerkUser.id);
      setDbUser(user);
    }
  }, [clerkUser?.id]);

  useEffect(() => {
    fetchDbUser();

    // Create event listeners for profile and follow updates
    const handleProfileUpdate = () => {
      setRefreshTrigger(prev => prev + 1);
    };

    const handleFollowUpdate = () => {
      fetchDbUser(); // Refetch user data when follow status changes
      if (showFollowers) {
        handleShowFollowers();
      }
      if (showFollowing) {
        handleShowFollowing();
      }
    };

    // Listen for custom events
    window.addEventListener('profile-updated', handleProfileUpdate);
    window.addEventListener('follow-updated', handleFollowUpdate);

    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
      window.removeEventListener('follow-updated', handleFollowUpdate);
    };
  }, [fetchDbUser, showFollowers, showFollowing]);

  const handleShowFollowers = async () => {
    if (!dbUser?.id) return;
    setIsLoadingFollowers(true);
    try {
      const fetchedFollowers = await getFollowers(dbUser.id);
      setFollowers(fetchedFollowers as unknown as User[]);
      setShowFollowers(true);
    } catch (error) {
      console.error("Error fetching followers:", error);
    } finally {
      setIsLoadingFollowers(false);
    }
  };

  const handleShowFollowing = async () => {
    if (!dbUser?.id) return;
    setIsLoadingFollowing(true);
    try {
      const fetchedFollowing = await getFollowing(dbUser.id);
      setFollowing(fetchedFollowing as unknown as User[]);
      setShowFollowing(true);
    } catch (error) {
      console.error("Error fetching following:", error);
    } finally {
      setIsLoadingFollowing(false);
    }
  };

  if (!clerkUser || !dbUser) {
    return (
      <div className="space-y-6 sticky top-[88px] h-[calc(100vh-120px)]">
        <div className="flex flex-col h-[80%]">
          <div className="flex flex-col bg-card rounded-lg shadow-sm animate-pulse">
            <div className="h-24 overflow-hidden">
              <Skeleton className="h-20 w-20 rounded-full mb-4" />
            </div>
          </div>
        </div>

        <Card className="p-4 h-[20%]">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </Card>

        <FollowModal
          isOpen={showFollowers}
          onClose={() => setShowFollowers(false)}
          title="Followers"
          users={followers}
        />

        <FollowModal
          isOpen={showFollowing}
          onClose={() => setShowFollowing(false)}
          title="Following"
          users={following}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 sticky top-[88px] h-[calc(100vh-120px)]">
      <div className="flex flex-col h-[80%]">
        <div className="flex flex-col bg-card rounded-lg shadow-sm overflow-hidden border-0 lg:border">
          {/* Cover Image */}
          <div className="h-24 overflow-hidden">
            {dbUser.coverImage ? (
              <img 
                src={dbUser.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400"></div>
            )}
          </div>
          
          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="relative -mt-12 mb-4">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={dbUser.image || clerkUser.imageUrl} />
                <AvatarFallback>
                  {clerkUser.firstName?.[0]}
                  {clerkUser.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{dbUser.name || clerkUser.fullName}</h2>
              <p className="text-sm text-muted-foreground">@{dbUser.username}</p>
            </div>

            <p className="mt-4 text-sm text-foreground/80 line-clamp-3">
              {dbUser.bio || "No bio yet"}
            </p>

            <div className="flex gap-4 mt-4">
              <Button
                variant="outline"
                className="flex-1 h-auto py-2"
                onClick={handleShowFollowers}
                disabled={isLoadingFollowers}
              >
                <div className="text-center">
                  <div className="font-semibold text-base">{dbUser._count?.followers || 0}</div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-auto py-2"
                onClick={handleShowFollowing}
                disabled={isLoadingFollowing}
              >
                <div className="text-center">
                  <div className="font-semibold text-base">{dbUser._count?.following || 0}</div>
                  <div className="text-xs text-muted-foreground">Following</div>
                </div>
              </Button>
            </div>

            {/* User Details */}
            <div className="mt-6 space-y-3 text-sm">
              {dbUser.location && (
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{dbUser.location}</span>
                </div>
              )}
              {dbUser.website && (
                <div className="flex items-center text-muted-foreground">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  <a 
                    href={dbUser.website.startsWith('http') ? dbUser.website : `https://${dbUser.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    {dbUser.website}
                  </a>
                </div>
              )}
              <div className="flex items-center text-muted-foreground">
                <CalendarDays className="h-4 w-4 mr-2" />
                <span>Joined {new Date(dbUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Help and Contact Section */}
      <Card className="p-4 h-[20%] flex flex-col justify-center border-0 lg:border">
        <div className="flex flex-col gap-2">
          <Button 
            variant="ghost" 
            className="flex items-center gap-3 justify-start h-10 w-full" 
            asChild
          >
            <Link href="/help">
              <HelpCircle className="w-5 h-5" />
              Help & Support
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className="flex items-center gap-3 justify-start h-10 w-full" 
            asChild
          >
            <Link href="/contact">
              <Mail className="w-5 h-5" />
              Contact Us
            </Link>
          </Button>
        </div>
      </Card>

      <FollowModal
        isOpen={showFollowers}
        onClose={() => setShowFollowers(false)}
        title="Followers"
        users={followers}
      />

      <FollowModal
        isOpen={showFollowing}
        onClose={() => setShowFollowing(false)}
        title="Following"
        users={following}
      />
    </div>
  );
}