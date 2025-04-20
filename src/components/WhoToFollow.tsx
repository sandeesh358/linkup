"use client";

import { getRandomUsers } from "@/actions/user.action";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import FollowButton from "./FollowButton";
import { User } from "@/lib/types";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

function WhoToFollow() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getRandomUsers();
        setUsers(fetchedUsers as unknown as User[]);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (isLoading) {
    return (
      <Card className="hidden lg:block border bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-900/30">
        <CardContent className="p-6">
          <div className="space-y-2">
            <h3 className="text-base font-semibold mb-4 text-blue-600 dark:text-blue-400">Suggested for you</h3>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-2 items-center justify-between p-2 rounded-lg">
                <div className="flex items-center gap-1">
                  <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                  <div className="space-y-1">
                    <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-8 w-20 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) return null;

  return (
    <>
      {/* Desktop View - Show 3 suggestions */}
      <Card className="hidden lg:block border bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-900/30">
        <CardContent className="p-6">
          <div className="space-y-2">
            <h3 className="text-base font-semibold mb-4 text-blue-600 dark:text-blue-400">Suggested for you</h3>
            {users.slice(0, 3).map((user, index) => (
              <motion.div
                key={user.id as string}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-2 items-center justify-between p-2 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-950/50 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <Link href={`/profile/${user.username}`}>
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20 dark:ring-primary/40">
                      <AvatarImage src={user.image ?? "/avatar.png"} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {user.name?.[0] || user.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="text-xs">
                    <Link href={`/profile/${user.username}`} className="font-medium cursor-pointer text-blue-600 dark:text-blue-400">
                      {user.name}
                    </Link>
                    <p className="text-muted-foreground">@{user.username}</p>
                  </div>
                </div>
                <FollowButton userId={user.id as string} />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Mobile View - Instagram Style */}
      <div className="lg:hidden relative">
        {/* Glassmorphism Blur Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 
                        dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5 backdrop-blur-xl rounded-xl"></div>

        {/* Content Container */}
        <Card className="relative z-10 overflow-hidden shadow-lg bg-white/30 dark:bg-black/30 
                         backdrop-blur-md rounded-xl border border-white/20 dark:border-black/20">
          <CardContent className="py-2 px-4">
            <div className="grid grid-cols-4 gap-3 w-full">
              {users.slice(0, 4).map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center justify-center"
                >
                  <div className="relative flex justify-center">
                    <Link href={`/profile/${user.username}`}>
                      <Avatar className="h-[45px] w-[45px] border-[1.5px] border-background ring-2 ring-primary/20 dark:ring-primary/40">
                        <AvatarImage src={user.image ?? "/avatar.png"} className="object-cover" />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          {user.name?.[0] || user.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <FollowButton 
                      userId={user.id} 
                      variant="overlay"
                      size="icon"
                      className="!absolute !bottom-0 !right-0 transform translate-x-0.5 translate-y-0.5 
                                 scale-[0.7] !h-5 !w-5"
                    />
                  </div>
                  <div className="w-full text-center mt-1">
                    <Link href={`/profile/${user.username}`} 
                          className="text-[10px] font-medium block truncate leading-tight px-1 text-blue-600 dark:text-blue-400">
                      {user.name}
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default WhoToFollow;

