'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Users, MessageCircle, Clock, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface User {
  id: string;
  clerkId: string;
  username: string;
  name: string | null;
  image: string | null;
  createdAt?: string;
  latestMessage?: {
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
  unreadCount: number;
}

export default function MutualFollowersList() {
  const [mutualFollowers, setMutualFollowers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchMutualFollowers = async () => {
      try {
        const response = await fetch('/api/mutual-followers');
        if (!response.ok) throw new Error('Failed to fetch mutual followers');
        const data = await response.json();
        setMutualFollowers(data);
      } catch (error) {
        console.error('Error fetching mutual followers:', error);
        toast.error('Failed to load mutual followers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMutualFollowers();
  }, []);

  const handleUserClick = async (user: User) => {
    try {
      // Create or get conversation using the database ID
      const conversationResponse = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: user.id })
      });

      if (!conversationResponse.ok) {
        const errorData = await conversationResponse.json().catch(() => ({}));
        console.error('Conversation creation error:', errorData);
        if (errorData.message === "Recipient not found in database") {
          toast.error('User not found. Please try again later.');
        } else {
          toast.error(errorData.message || 'Failed to start conversation');
        }
        return;
      }

      // Navigate to chat
      router.push(`/chat/${user.id}`);
    } catch (err) {
      console.error('Error starting chat:', err);
      toast.error('Failed to start chat. Please try again.');
    }
  };

  const filteredFollowers = mutualFollowers.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-3xl mx-auto h-[calc(100vh-180px)] flex flex-col">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-background to-background/80 backdrop-blur-xl rounded-2xl shadow-xl border border-border/40 overflow-hidden flex flex-col h-full"
      >
        <div className="p-4 border-b border-border/40 sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
              >
                Messages
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xs text-muted-foreground mt-0.5"
              >
                Chat with your mutual followers
              </motion.p>
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-2"
            >
              <div className="px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span className="font-medium text-sm text-primary">{mutualFollowers.length}</span>
                <span className="text-muted-foreground text-xs">mutual</span>
              </div>
            </motion.div>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search mutual followers..."
              className="pl-8 h-8 bg-background/50 border-border/50 rounded-lg focus-visible:ring-primary/30 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          </motion.div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2">
            <AnimatePresence mode="wait">
          {isLoading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 animate-pulse"
                    >
                      <Skeleton className="h-14 w-14 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-[180px]" />
                        <Skeleton className="h-4 w-[250px]" />
                  </div>
                      <Skeleton className="h-10 w-[80px] rounded-full" />
                    </motion.div>
              ))}
                </motion.div>
          ) : filteredFollowers.length === 0 ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center h-[300px] text-muted-foreground"
                >
                  <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 260, 
                      damping: 20,
                      delay: 0.2
                    }}
                    className="mb-6 p-5 rounded-full bg-primary/5 border border-primary/10"
                  >
                    <Users className="h-10 w-10 text-primary" />
                  </motion.div>
                  <motion.h3 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-lg font-semibold mb-1.5 text-foreground"
                  >
                {searchQuery
                  ? 'No mutual followers found'
                  : 'No mutual followers yet'}
                  </motion.h3>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-center max-w-sm text-xs text-muted-foreground"
                  >
                    {searchQuery
                      ? 'Try searching with a different term'
                      : 'Start following people to see your mutual followers here'}
                  </motion.p>
                </motion.div>
              ) : (
                <motion.div 
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-1.5"
                >
                  {filteredFollowers.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                      onClick={() => handleUserClick(user)}
                      className="group flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-all duration-300 cursor-pointer border border-transparent hover:border-primary/10 hover:shadow-md"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative">
                          <Avatar className="h-10 w-10 ring-1 ring-background shadow-sm">
                    <AvatarImage src={user.image || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                      {user.name?.[0] || user.username[0]}
                    </AvatarFallback>
                  </Avatar>
                    {user.latestMessage && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ 
                                type: "spring", 
                                stiffness: 260, 
                                damping: 20 
                              }}
                              className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow-md"
                            >
                              <div className="h-2.5 w-2.5 rounded-full bg-background" />
                            </motion.div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm truncate">
                              {user.name || user.username}
                            </p>
                            {user.unreadCount > 0 && (
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ 
                                  type: "spring", 
                                  stiffness: 260, 
                                  damping: 20 
                                }}
                                className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground font-medium"
                              >
                                {user.unreadCount}
                              </motion.div>
                            )}
                          </div>
                          {user.latestMessage ? (
                            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground/70">
                              <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                          {user.latestMessage.content}
                        </p>
                              <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground/70">
                                <Clock className="h-2 w-2" />
                                <span>
                          {formatDistanceToNow(new Date(user.latestMessage.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground/70">
                              <MessageCircle className="h-2.5 w-2.5" />
                              <span>No messages yet</span>
                      </div>
                    )}
                  </div>
                </div>
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 0, x: -10 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <ChevronRight className="h-3.5 w-3.5 text-primary" />
              </div>
                      </motion.div>
                    </motion.div>
            ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </motion.div>
    </div>
  );
} 