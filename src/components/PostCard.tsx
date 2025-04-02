"use client";

import { createComment, deletePost, getPosts, toggleLike } from "@/actions/post.action";
import { getUserByClerkId } from "@/actions/user.action";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { DeleteAlertDialog } from "./DeleteAlertDialog";
import { Button } from "./ui/button";
import { HeartIcon, LogInIcon, MessageCircleIcon, SendIcon } from "lucide-react";
import { Textarea } from "./ui/textarea";

// Define proper types for the components
export interface Author {
  id: string;
  name: string | null;
  image: string | null;
  username: string;
  coverImage: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  followers: { followerId: string }[];
  following: { followingId: string }[];
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  createdAt: Date;
  author: {
    id: string;
    username: string;
    name: string | null;
    image: string | null;
  };
}

export interface Like {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
}

export interface Post {
  id: string;
  content: string | null;
  image: string | null;
  video: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: Author;
  comments: Comment[];
  likes: Like[];
}

function PostCard({ post, dbUserId }: { post: Post; dbUserId: string | null }) {
  const { user } = useUser();
  const [currentDbUser, setCurrentDbUser] = useState<any>(null);
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasLiked, setHasLiked] = useState(post.likes.some((like) => like.userId === dbUserId));
  const [optimisticLikes, setOptmisticLikes] = useState(post.likes.length);
  const [showComments, setShowComments] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchCurrentDbUser = async () => {
      if (user?.id) {
        try {
          const dbUser = await getUserByClerkId(user.id);
          setCurrentDbUser(dbUser);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    
    fetchCurrentDbUser();
    
    // Listen for profile updates
    const handleProfileUpdate = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    
    window.addEventListener('profile-updated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [user?.id, refreshTrigger]);

  const handleLike = async () => {
    if (isLiking) return;
    try {
      setIsLiking(true);
      setHasLiked((prev) => !prev);
      setOptmisticLikes((prev) => prev + (hasLiked ? -1 : 1));
      await toggleLike(post.id);
    } catch (error) {
      setOptmisticLikes(post.likes.length);
      setHasLiked(post.likes.some((like) => like.userId === dbUserId));
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isCommenting) return;
    try {
      setIsCommenting(true);
      const result = await createComment(post.id, newComment);
      if (result?.success) {
        toast.success("Comment posted successfully");
        setNewComment("");
      }
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeletePost = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      const result = await deletePost(post.id);
      if (result.success) toast.success("Post deleted successfully");
      else throw new Error(result.error);
    } catch (error) {
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Post Author Avatar & Details */}
          <div className="flex space-x-3 sm:space-x-4">
            <Link href={`/profile/${post.author?.username || ""}`}>
              <Avatar className="size-8 sm:w-10 sm:h-10">
                <AvatarImage src={post.author?.image || "/avatar.png"} alt={post.author?.name || "User"} />
                <AvatarFallback>{post.author?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 truncate">
                  <Link href={`/profile/${post.author?.username || ""}`} className="font-semibold truncate">
                    {post.author?.name || "Unknown"}
                  </Link>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Link href={`/profile/${post.author?.username || ""}`}>@{post.author?.username || "unknown"}</Link>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                  </div>
                </div>
              </div>

              <p className="mt-2 text-base text-foreground break-words leading-relaxed">{post.content}</p>
            </div>
          </div>

          {/* Post Image or Video */}
          {post.image && (
            <div className="rounded-lg overflow-hidden">
              <img src={post.image} alt="Post content" className="w-full h-auto object-cover" />
            </div>
          )}
          {post.video && (
            <div className="rounded-lg overflow-hidden">
              <video 
                src={post.video} 
                controls 
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Like & Comment Buttons */}
          <div className="flex items-center pt-2 space-x-4">
            {user ? (
              <Button variant="ghost" size="sm" className={`text-muted-foreground gap-2 ${hasLiked ? "text-red-500 hover:text-red-600" : "hover:text-red-500"}`} onClick={handleLike}>
                <HeartIcon className="size-5" fill={hasLiked ? "currentColor" : "none"} />
                <span>{optimisticLikes}</span>
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="text-muted-foreground gap-2">
                  <HeartIcon className="size-5" />
                  <span>{optimisticLikes}</span>
                </Button>
              </SignInButton>
            )}

            <Button variant="ghost" size="sm" className="text-muted-foreground gap-2 hover:text-blue-500" onClick={() => setShowComments((prev) => !prev)}>
              <MessageCircleIcon className={`size-5 ${showComments ? "fill-blue-500 text-blue-500" : ""}`} />
              <span>{post.comments.length}</span>
            </Button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="space-y-4 pt-4 border-t">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="size-8 flex-shrink-0">
                    <AvatarImage src={comment.author?.image || "/avatar.png"} alt={comment.author?.username || "User"} />
                    <AvatarFallback>{comment.author?.username?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm break-words">{comment.content}</p>
                  </div>
                </div>
              ))}

              {user && (
                <div className="flex space-x-3">
                  <Avatar className="size-8 flex-shrink-0">
                    <AvatarImage src={currentDbUser?.image || user.imageUrl} alt={currentDbUser?.name || user.fullName || "User"} />
                    <AvatarFallback>
                      {currentDbUser?.name?.[0] || user.fullName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <Textarea placeholder="Write a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="min-h-[80px] resize-none" />
                  <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim() || isCommenting}>
                    {isCommenting ? "Posting..." : <><SendIcon className="size-4" /> Comment</>}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default PostCard;
