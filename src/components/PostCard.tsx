"use client";

import { createComment, deletePost, getPosts, toggleLike, deleteComment } from "@/actions/post.action";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { DeleteAlertDialog } from "./DeleteAlertDialog";
import { Button } from "./ui/button";
import { HeartIcon, LogInIcon, MessageCircleIcon, SendIcon, PlayIcon, PauseIcon, Volume2Icon, VolumeXIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { useVideo } from "@/context/VideoContext";

export interface Author {
  id: string;
  name: string | null;
  image: string | null;
  username: string;
  coverImage: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  following: { followingId: string }[];
  followers: { followerId: string }[];
}

export interface Like {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    name: string | null;
    image: string | null;
  };
  createdAt: Date;
}

export interface Post {
  id: string;
  content: string | null;
  image: string | null;
  video: string | null;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author: Author;
  comments: Comment[];
  likes: Like[];
  _count: {
    likes: number;
    comments: number;
  };
}

function PostCard({ post, dbUserId }: { post: Post; dbUserId: string | null }) {
  const { user } = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const { currentlyPlayingId, setCurrentlyPlayingId, isMuted, setIsMuted } = useVideo();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasLiked, setHasLiked] = useState(post.likes.some((like) => like.userId === dbUserId));
  const [optimisticLikes, setOptmisticLikes] = useState(post._count?.likes || post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [optimisticComments, setOptimisticComments] = useState<Comment[]>(post.comments);
  const [optimisticCommentCount, setOptimisticCommentCount] = useState(post._count.comments);
  const [isDeletingComment, setIsDeletingComment] = useState<string | null>(null);

  // Handle video playback
  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setCurrentlyPlayingId(null);
      setIsPlaying(false);
      setIsManuallyPaused(true);
    } else {
      // Pause any other playing video first
      if (currentlyPlayingId) {
        const otherVideo = document.querySelector(`video[data-post-id="${currentlyPlayingId}"]`) as HTMLVideoElement;
        if (otherVideo) {
          otherVideo.pause();
        }
      }
      videoRef.current.play().catch((error) => {
        console.error("Error playing video:", error);
        setIsPlaying(false);
        setCurrentlyPlayingId(null);
      });
      setCurrentlyPlayingId(post.id);
      setIsPlaying(true);
      setIsManuallyPaused(false);
    }
  };

  // Handle mute/unmute
  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent video play/pause when clicking mute button
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Handle video end
  const handleVideoEnd = () => {
    setIsPlaying(false);
    setCurrentlyPlayingId(null);
    setIsManuallyPaused(false);
  };

  // Handle video visibility
  useEffect(() => {
    if (!videoRef.current || !videoContainerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Video is visible
            if (!isManuallyPaused && !currentlyPlayingId) {
              // If no video is playing and this video wasn't manually paused, play it
              videoRef.current?.play().catch(() => {
                setIsPlaying(false);
                setCurrentlyPlayingId(null);
              });
              setCurrentlyPlayingId(post.id);
              setIsPlaying(true);
            }
          } else if (isPlaying) {
            // Video is not visible, pause it
            videoRef.current?.pause();
            setIsPlaying(false);
            if (currentlyPlayingId === post.id) {
              setCurrentlyPlayingId(null);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: "-64px 0px 0px 0px",
        threshold: 0.7,
      }
    );

    observer.observe(videoContainerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isPlaying, currentlyPlayingId, post.id, setCurrentlyPlayingId, isManuallyPaused]);

  // Sync mute state with video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleLike = async () => {
    if (isLiking) return;
    try {
      setIsLiking(true);
      setHasLiked((prev: boolean) => !prev);
      setOptmisticLikes((prev: number) => prev + (hasLiked ? -1 : 1));
      await toggleLike(post.id);
    } catch (error) {
      setOptmisticLikes(post.likes.length);
      setHasLiked(post.likes.some((like) => like.userId === dbUserId));
      setIsLiking(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isCommenting) return;
    try {
      setIsCommenting(true);
      
      // Create optimistic comment
      const optimisticComment: Comment = {
        id: Date.now().toString(), // Temporary ID
        content: newComment,
        author: {
          id: dbUserId!,
          username: user?.username || "",
          name: user?.fullName || null,
          image: user?.imageUrl || null,
        },
        createdAt: new Date(),
      };

      // Update state optimistically
      setOptimisticComments(prev => [...prev, optimisticComment]);
      setOptimisticCommentCount(prev => prev + 1);
      setNewComment("");

      const result = await createComment(post.id, newComment);
      if (result?.success) {
        toast.success("Comment posted successfully");
        
        // Replace optimistic comment with real one
        if (result.comment) {
          // Map the server response to our Comment interface
          const mappedComment: Comment = {
            id: result.comment.id,
            content: result.comment.content,
            author: {
              id: dbUserId!,
              username: user?.username || "",
              name: user?.fullName || null,
              image: user?.imageUrl || null,
            },
            createdAt: result.comment.createdAt,
          };
          
          setOptimisticComments(prev => 
            prev.map(comment => 
              comment.id === optimisticComment.id 
                ? mappedComment
                : comment
            )
          );
        }
      }
    } catch (error) {
      // Revert optimistic updates on error
      setOptimisticComments(post.comments);
      setOptimisticCommentCount(post._count.comments);
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

  const handleCommentClick = () => {
    setShowComments(!showComments);
  };

  const formatCommentDate = (dateString: string | Date) => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      if (isNaN(date.getTime())) {
        return 'some time ago';
      }
      return formatDistanceToNow(date) + ' ago';
    } catch (error) {
      return 'some time ago';
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (isDeletingComment) return;
    try {
      setIsDeletingComment(commentId);
      const result = await deleteComment(commentId);
      if (result.success) {
        // Update state optimistically
        setOptimisticComments(prev => prev.filter(comment => comment.id !== commentId));
        setOptimisticCommentCount(prev => prev - 1);
        toast.success("Comment deleted successfully");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error("Failed to delete comment");
    } finally {
      setIsDeletingComment(null);
    }
  };

  return (
    <Card className="overflow-hidden max-w-2xl mx-auto">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex space-x-3 sm:space-x-4">
            <Link href={`/profile/${post.author.username}`}>
              <Avatar className="size-8 sm:w-10 sm:h-10">
                <AvatarImage src={post.author.image ?? "/avatar.png"} />
              </Avatar>
            </Link>

            {/* POST HEADER & TEXT CONTENT */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 truncate">
                  <Link
                    href={`/profile/${post.author.username}`}
                    className="font-semibold truncate"
                  >
                    {post.author.name}
                  </Link>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Link href={`/profile/${post.author.username}`}>@{post.author.username}</Link>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                  </div>
                </div>
                {/* Check if current user is the post author */}
                {dbUserId === post.author.id && (
                  <DeleteAlertDialog isDeleting={isDeleting} onDelete={handleDeletePost} />
                )}
              </div>
              <p className="mt-2 text-sm text-foreground break-words">{post.content}</p>
            </div>
          </div>

          {/* POST IMAGE */}
          {post.image && (
            <div className="rounded-lg overflow-hidden max-h-[600px]">
              <img 
                src={post.image} 
                alt="Post content" 
                className="w-full h-auto object-contain max-h-[600px]" 
              />
            </div>
          )}

          {/* POST VIDEO */}
          {post.video && (
            <div 
              ref={videoContainerRef}
              className="relative rounded-lg overflow-hidden max-h-[600px] bg-black"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={handlePlayPause}
            >
              <video
                ref={videoRef}
                data-post-id={post.id}
                src={post.video}
                className="w-full h-full object-contain"
                loop
                playsInline
                onEnded={handleVideoEnd}
                muted={isMuted}
              />
              
              {/* Video Controls Overlay */}
              <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${(isHovered || !isPlaying) ? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute inset-0 bg-black/30" />
                
                {/* Play/Pause Button */}
                <div className="relative z-10">
                  <button 
                    className="p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayPause();
                    }}
                  >
                    {isPlaying ? (
                      <PauseIcon className="w-8 h-8 text-white" />
                    ) : (
                      <PlayIcon className="w-8 h-8 text-white" />
                    )}
                  </button>
                </div>
                
                {/* Mute Button */}
                <button
                  className="absolute bottom-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                  onClick={handleMuteToggle}
                >
                  {isMuted ? (
                    <VolumeXIcon className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2Icon className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* LIKE & COMMENT BUTTONS */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 sm:size-9"
                onClick={handleLike}
                disabled={isLiking}
              >
                <HeartIcon
                  className={`size-4 sm:size-5 ${
                    hasLiked ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </Button>
              <span className="text-sm text-muted-foreground">{optimisticLikes}</span>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 sm:size-9"
                onClick={handleCommentClick}
              >
                <MessageCircleIcon className="size-4 sm:size-5" />
              </Button>
              <span className="text-sm text-muted-foreground">{optimisticCommentCount}</span>
            </div>
          </div>

          {/* COMMENTS SECTION */}
          {showComments && (
            <div className="space-y-4 pt-4">
              {user ? (
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 min-h-[80px]"
                  />
                  <Button
                    size="icon"
                    className="self-end"
                    onClick={handleAddComment}
                    disabled={isCommenting || !newComment.trim()}
                  >
                    <SendIcon className="size-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center py-4">
                  <SignInButton mode="modal">
                    <Button variant="outline" className="gap-2">
                      <LogInIcon className="size-4" />
                      Sign in to comment
                    </Button>
                  </SignInButton>
                </div>
              )}
              <div className="space-y-4">
                {optimisticComments.map((comment) => (
                  <div key={comment.id} className="flex space-x-2">
                    <Avatar className="size-8">
                      <AvatarImage src={comment.author.image ?? "/avatar.png"} />
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/profile/${comment.author.username}`}
                            className="font-medium"
                          >
                            {comment.author.name}
                          </Link>
                          <span className="text-sm text-muted-foreground">
                            {formatCommentDate(comment.createdAt)}
                          </span>
                        </div>
                        {/* Show delete button if user is comment author or post author */}
                        {(dbUserId === comment.author.id || dbUserId === post.author.id) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 hover:text-red-500"
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={isDeletingComment === comment.id}
                          >
                            {isDeletingComment === comment.id ? (
                              <Loader2Icon className="size-4 animate-spin" />
                            ) : (
                              <Trash2Icon className="size-4" />
                            )}
                          </Button>
                        )}
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
export default PostCard;