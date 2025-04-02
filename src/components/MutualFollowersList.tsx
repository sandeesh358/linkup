'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  name: string | null;
  image: string | null;
  createdAt?: string;
}

interface MessageButtonProps {
  userId: string;
  username: string;
  name: string | null;
}

const MessageButton = ({ userId, username, name }: MessageButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = async (e: React.MouseEvent) => {
    if (!userId) {
      e.preventDefault();
      toast.error('Cannot start chat with this user');
      return;
    }
    
    // Validate the user ID format first
    if (!/^[a-zA-Z0-9_-]+$/.test(userId)) {
      e.preventDefault();
      toast.error('Invalid user ID format');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Pre-fetch user data to verify user exists
      const response = await fetch(`/api/users/${userId}`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store' // Make sure we're getting fresh data
      });
      
      if (!response.ok) {
        e.preventDefault();
        
        if (response.status === 404) {
          toast.error('User not found. Cannot start chat.');
        } else {
          const errorData = await response.json().catch(() => ({}));
          toast.error(errorData.message || 'Cannot start chat at this time');
        }
        
        setIsLoading(false);
        return;
      }
      
      // Pre-fetch conversation to ensure it exists or will be created
      try {
        const conversationResponse = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipientId: userId })
        });
        
        if (!conversationResponse.ok) {
          const errorData = await conversationResponse.json().catch(() => ({}));
          console.warn('Conversation creation warning:', errorData);
          // Continue with navigation anyway - we'll handle errors on the chat page
        }
      } catch (convError) {
        console.warn('Failed to prefetch conversation:', convError);
        // Continue with navigation - we'll handle this error on the chat page
      }
      
      // Allow navigation to proceed
    } catch (err) {
      console.error('Error checking user data:', err);
      // Don't block navigation if it's just a fetch error
      // But show a warning
      toast.error('Connection issue - chat may not load properly');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Link
      href={`/chat/${userId}`}
      className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full flex items-center gap-2 transition-colors"
      onClick={handleClick}
      aria-label={`Chat with ${name || username}`}
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
    </Link>
  );
}

export default function MutualFollowersList() {
  const [mutualFollowers, setMutualFollowers] = useState<User[]>([]);
  const [filteredFollowers, setFilteredFollowers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMutualFollowers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Use our optimized API endpoint
        const response = await fetch('/api/mutual-followers', {
          // Include cache settings for better performance
          cache: 'no-cache',
          next: { revalidate: 60 } // Revalidate every 60 seconds
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch mutual followers');
        }
        
        const data = await response.json();
        setMutualFollowers(data);
        setFilteredFollowers(data);
      } catch (error) {
        console.error('Error fetching mutual followers:', error);
        setError('Unable to load mutual followers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMutualFollowers();
  }, []);

  // Filter followers based on search input
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFollowers(mutualFollowers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = mutualFollowers.filter(user => {
      const name = user.name?.toLowerCase() || '';
      const username = user.username.toLowerCase();
      return name.includes(query) || username.includes(query);
    });
    
    setFilteredFollowers(filtered);
  }, [searchQuery, mutualFollowers]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Mutual Followers</span>
            <Skeleton className="h-4 w-8" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mutual Followers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="text-sm text-blue-500 hover:underline mt-2"
            >
              Try again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (mutualFollowers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mutual Followers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            <p>No mutual followers found</p>
            <p className="text-sm mt-1">
              Follow others so they can follow you back
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Mutual Followers</span>
          <span className="bg-secondary text-secondary-foreground px-2.5 py-0.5 rounded-full text-xs font-medium">
            {mutualFollowers.length}
          </span>
        </CardTitle>
        <div className="relative mt-3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input 
            type="search"
            placeholder="Search followers..." 
            className="pl-10 text-sm"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredFollowers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No results found for "{searchQuery}"</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="text-sm text-blue-500 hover:underline mt-2"
              >
                Clear search
              </button>
            </div>
          ) : (
            filteredFollowers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group border border-gray-100 dark:border-gray-800 hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-sm"
              >
                <Avatar className="h-12 w-12 border border-gray-200 dark:border-gray-700">
                  <AvatarImage src={user.image || '/avatar.png'} alt={user.username} />
                  <AvatarFallback>
                    {user.name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <p className="font-medium text-base truncate group-hover:text-primary transition-colors">
                      {user.name || user.username}
                    </p>
                    {/* Online indicator would go here */}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    @{user.username}
                  </p>
                  {user.createdAt && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <MessageButton userId={user.id} username={user.username} name={user.name} />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
} 