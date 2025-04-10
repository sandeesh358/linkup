"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Post } from "./PostCard";
import PostCard from "./PostCard";
import { getDbUserId } from "@/actions/user.action";
import { Loader2 } from "lucide-react";

interface InfiniteScrollPostsProps {
  initialPosts: Post[];
  initialCursor: string | null;
}

export default function InfiniteScrollPosts({ initialPosts, initialCursor }: InfiniteScrollPostsProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [dbUserId, setDbUserId] = useState<string | null>(null);
  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    const fetchDbUserId = async () => {
      const id = await getDbUserId();
      setDbUserId(id);
    };
    fetchDbUserId();
  }, []);

  useEffect(() => {
    const loadMorePosts = async () => {
      if (!cursor || isLoading) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/posts?cursor=${cursor}`);
        const data = await response.json();
        
        if (data.posts.length > 0) {
          setPosts((prev) => [...prev, ...data.posts]);
          setCursor(data.nextCursor);
        }
      } catch (error) {
        console.error("Error loading more posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (inView) {
      loadMorePosts();
    }
  }, [inView, cursor, isLoading]);

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} dbUserId={dbUserId} />
      ))}
      
      {/* Loading indicator */}
      <div ref={ref} className="flex justify-center py-4">
        {isLoading && (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        )}
      </div>
    </div>
  );
} 