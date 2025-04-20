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
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 sticky top-[88px] h-[calc(100vh-120px)]"
      >
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
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-[88px] h-[calc(100vh-120px)]"
    >
      <motion.div 
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 rounded-lg shadow-lg overflow-hidden border-0 lg:border backdrop-blur-sm h-full"
      >
        {/* Cover Image */}
        <div className="h-28 overflow-hidden relative group">
          {dbUser.coverImage ? (
            <motion.img 
              src={dbUser.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:from-blue-600 dark:via-purple-600 dark:to-pink-600"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent dark:from-black/40"></div>
        </div>
        
        {/* Profile Info */}
        <div className="px-5 pb-5 bg-gradient-to-b from-transparent to-white/50 dark:to-gray-900/50 flex-1">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative -mt-14 mb-3"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Avatar className="h-20 w-20 border-4 border-white dark:border-gray-900 ring-2 ring-primary/20 dark:ring-primary/40 transition-all duration-300 shadow-lg">
                <AvatarImage src={dbUser.image || clerkUser.imageUrl} />
                <AvatarFallback className="bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900">
                  {clerkUser.firstName?.[0]}
                  {clerkUser.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-1"
          >
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              {dbUser.name || clerkUser.fullName}
            </h2>
            <p className="text-sm text-muted-foreground">@{dbUser.username}</p>
          </motion.div>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-3 text-sm text-foreground/80 line-clamp-2"
          >
            {dbUser.bio || "No bio yet"}
          </motion.p>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex gap-3 mt-3"
          >
            <Button
              variant="outline"
              className="flex-1 h-auto py-2 bg-white/50 dark:bg-gray-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-blue-200 dark:border-blue-800"
              onClick={handleShowFollowers}
              disabled={isLoadingFollowers}
            >
              <div className="text-center">
                <div className="font-semibold text-base text-blue-600 dark:text-blue-400">{dbUser._count?.followers || 0}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-auto py-2 bg-white/50 dark:bg-gray-900/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors border-purple-200 dark:border-purple-800"
              onClick={handleShowFollowing}
              disabled={isLoadingFollowing}
            >
              <div className="text-center">
                <div className="font-semibold text-base text-purple-600 dark:text-purple-400">{dbUser._count?.following || 0}</div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
            </Button>
          </motion.div>

          {/* User Details */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 space-y-2 text-sm"
          >
            {dbUser.location && (
              <div className="flex items-center text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <MapPin className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
                <span>{dbUser.location}</span>
              </div>
            )}
            {dbUser.website && (
              <div className="flex items-center text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                <LinkIcon className="h-4 w-4 mr-2 text-purple-500 dark:text-purple-400" />
                <a 
                  href={dbUser.website.startsWith('http') ? dbUser.website : `https://${dbUser.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors truncate"
                >
                  {dbUser.website}
                </a>
              </div>
            )}
            <div className="flex items-center text-muted-foreground hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
              <CalendarDays className="h-4 w-4 mr-2 text-pink-500 dark:text-pink-400" />
              <span>Joined {new Date(dbUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
          </motion.div>

          {/* Help and Contact Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="flex flex-col gap-2">
              <Button 
                variant="ghost" 
                className="flex items-center gap-3 justify-start h-10 w-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors bg-white/50 dark:bg-gray-900/50 text-sm text-blue-600 dark:text-blue-400" 
                asChild
              >
                <Link href="/help">
                  <HelpCircle className="w-5 h-5" />
                  Help & Support
                </Link>
              </Button>
              <Button 
                variant="ghost" 
                className="flex items-center gap-3 justify-start h-10 w-full hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors bg-white/50 dark:bg-gray-900/50 text-sm text-purple-600 dark:text-purple-400" 
                asChild
              >
                <Link href="/contact">
                  <Mail className="w-5 h-5" />
                  Contact Us
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>

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
    </motion.div>
  );
}