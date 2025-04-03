'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Search, Loader2, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from "@/components/ui/badge";

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

interface MessageButtonProps {
  userId: string;
  clerkId: string;
  username: string;
  name: string | null;
}

const MessageButton = ({ userId, clerkId, username, name }: MessageButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    console.log('MessageButton clicked with:', { userId, clerkId, username, name });
    
    if (!userId) {
      console.error('Missing database ID:', { userId });
      toast.error('Cannot start chat with this user');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create or get conversation using the database ID
      console.log('Creating conversation with recipientId:', userId);
      const conversationResponse = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: userId })
      });

      if (!conversationResponse.ok) {
        const errorData = await conversationResponse.json().catch(() => ({}));
        console.error('Conversation creation error:', errorData);
        if (errorData.message === "Recipient not found in database") {
          toast.error('User not found. Please try again later.');
        } else {
          toast.error(errorData.message || 'Failed to start conversation');
        }
        setIsLoading(false);
        return;
      }

      const conversationData = await conversationResponse.json();
      console.log('Conversation created:', conversationData);

      // If everything is successful, navigate to chat using the database ID
      console.log('Navigating to chat with database ID:', userId);
      router.push(`/chat/${userId}`);
      
    } catch (err) {
      console.error('Error starting chat:', err);
      toast.error('Failed to start chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full flex items-center gap-2 transition-colors"
      aria-label={`Chat with ${name || username}`}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm font-medium">Loading...</span>
        </>
      ) : (
        <>
          <MessageCircle size={16} />
          <span className="text-sm font-medium">Message</span>
        </>
      )}
    </button>
  );
}

export default function MutualFollowersList() {
  const [mutualFollowers, setMutualFollowers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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

  const filteredFollowers = mutualFollowers.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Mutual Followers</span>
          <span className="bg-secondary text-secondary-foreground px-2.5 py-0.5 rounded-full text-xs font-medium">
            {mutualFollowers.length}
          </span>
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search mutual followers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-3 w-[100px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredFollowers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <div className="mb-4 p-3 rounded-full bg-muted">
                <Users className="h-6 w-6" />
              </div>
              <p className="text-center">
                {searchQuery
                  ? 'No mutual followers found'
                  : 'No mutual followers yet'}
              </p>
            </div>
          ) : (
          <div className="space-y-4">
            {filteredFollowers.map((user) => (
              <div key={user.id} className="flex items-center justify-between py-2">
                <Link
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-3 hover:underline flex-1 min-w-0"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback>
                      {user.name?.[0] || user.username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{user.name || user.username}</p>
                    {user.latestMessage && (
                      <div className="mt-1">
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {user.latestMessage.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(user.latestMessage.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  {user.unreadCount > 0 && (
                    <Badge variant="default" className="bg-primary">
                      {user.unreadCount}
                    </Badge>
                  )}
                  <MessageButton
                    userId={user.id}
                    clerkId={user.clerkId}
                    username={user.username}
                    name={user.name}
                  />
                </div>
              </div>
            ))}
          </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 