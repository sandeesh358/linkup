// src/components/FirstMutualFollower.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface User {
  id: string;
  username: string;
  name: string | null;
  image: string | null;
  coverImage?: string | null;
}

export default function FirstMutualFollower({ id }: { id: string }) {
  const [mutualFollowers, setMutualFollowers] = useState<User[]>([]);

  useEffect(() => {
    const fetchMutualFollowers = async () => {
      try {
        console.log('Fetching mutual followers for user:', id);

        const response = await fetch(`/api/users/${id}/follow`);
        const data = await response.json();

        const mutualFollowers = findMutualFollowers(data.followers, data.following);

        if (mutualFollowers.length > 0) {
          setMutualFollowers(mutualFollowers.map((follow) => follow.following));
        }
      } catch (error) {
        console.error('Error fetching mutual followers:', error);
      }
    };

    fetchMutualFollowers();
  }, [id]);

  if (mutualFollowers.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <p>No mutual followers found.</p>
        <p className="text-sm text-gray-500">
          You can only message users who follow you back.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-gray-20 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Mutual Followers</h3>
      <div className="space-y-4">
        {mutualFollowers.map((user) => (
          <Link
            key={user.id}
            href={`/chat/${user.id}`}
            className="flex items-center p-2 hover:bg-gray-100 rounded-lg cursor-pointer border border-gray-10"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.image || '/avatar.png'} alt={user.username} />
              <AvatarFallback>
                {user.name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="font-medium text-gray-500">{user.name || user.username}</p>
              <p className="text-sm text-gray-500">@{user.username}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const findMutualFollowers = (followers: any[], following: any[]) => {
  const followerIds = followers.map((follow) => follow.followerId);
  return following.filter((follow) => followerIds.includes(follow.followingId));
};