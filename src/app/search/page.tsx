'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SearchIcon, UserPlus, Check } from 'lucide-react';
import { searchUsers, toggleFollow, getFollowingStatus, getDbUserId } from '@/actions/user.action';
import Link from 'next/link';
import { useDebounce } from '@/lib/hooks';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  bio: string | null;
  _count: {
    followers: number;
    following: number;
  };
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [followingStatus, setFollowingStatus] = useState<{[key: string]: boolean}>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userId = await getDbUserId();
        setCurrentUserId(userId);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!debouncedQuery.trim()) {
        setUsers([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const searchResults = await searchUsers(debouncedQuery);
        setUsers(searchResults as unknown as User[]);
        
        // Fetch following status for each user
        const statusPromises = searchResults.map(user => 
          getFollowingStatus(user.id).then(status => ({
            userId: user.id,
            status
          }))
        );
        
        const statuses = await Promise.all(statusPromises);
        const newStatuses = statuses.reduce((acc, { userId, status }) => ({
          ...acc,
          [userId]: status
        }), {});
        
        setFollowingStatus(newStatuses);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [debouncedQuery]);

  const handleFollowToggle = async (userId: string) => {
    try {
      const result = await toggleFollow(userId);
      if (result?.success) {
        setFollowingStatus(prev => ({
          ...prev,
          [userId]: !prev[userId]
        }));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-6 px-4">
      <div className="relative mb-8">
        <Input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 py-6 text-lg shadow-sm hover:shadow-md transition-shadow rounded-full"
        />
        <SearchIcon className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
      </div>

      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : debouncedQuery && users.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center my-12"
        >
          <p className="text-gray-500">No users found</p>
        </motion.div>
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {users.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700"
              >
                <Link 
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-3 flex-1 group"
                >
                  <Avatar className="h-12 w-12 ring-2 ring-gray-100 dark:ring-gray-700 group-hover:ring-primary transition-all">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.name?.[0] || user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold group-hover:text-primary transition-colors">
                      {user.name || user.username}
                    </p>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  </div>
                </Link>
                
                {currentUserId !== user.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    className={`transition-all duration-200 ${
                      followingStatus[user.id] 
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                        : 'hover:bg-primary/10'
                    }`}
                    onClick={() => handleFollowToggle(user.id)}
                  >
                    {followingStatus[user.id] ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-1" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
} 