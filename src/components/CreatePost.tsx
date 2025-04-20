"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { ImageIcon, Loader2Icon, SendIcon, XIcon, VideoIcon } from "lucide-react";
import { Button } from "./ui/button";
import { createPost } from "@/actions/post.action";
import { getUserByClerkId } from "@/actions/user.action";
import toast from "react-hot-toast";
import ImageUpload from "./ImageUpload";
import VideoUpload from "./VideoUpload";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

function CreatePost() {
  const { user } = useUser();
  const pathname = usePathname();
  const isCreatePostPage = pathname === "/create-post";
  const [dbUser, setDbUser] = useState<any>(null);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const fetchDbUser = async () => {
      if (user?.id) {
        try {
          const userData = await getUserByClerkId(user.id);
          setDbUser(userData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    
    fetchDbUser();
    
    const handleProfileUpdate = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    
    window.addEventListener('profile-updated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [user?.id, refreshTrigger]);

  const generateCaption = async () => {
    if (!imageUrl) return;

    try {
      const res = await fetch("/api/generateCaption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });

      const data = await res.json();
      if (data.caption) {
        setContent(data.caption);
        toast.success("Caption generated!");
      } else {
        toast.error("Failed to generate caption.");
      }
    } catch (error) {
      console.error("Caption generation error:", error);
      toast.error("Error generating caption.");
    }
  };

  useEffect(() => {
    if (imageUrl) {
      generateCaption();
    }
  }, [imageUrl]);

  const handleSubmit = async () => {
    if (!content.trim() && !imageUrl && !videoUrl) return;

    setIsPosting(true);
    try {
      const result = await createPost(content, imageUrl, videoUrl);
      if (result?.success) {
        setContent("");
        setImageUrl("");
        setVideoUrl("");
        setShowImageUpload(false);
        setShowVideoUpload(false);
        toast.success("Post created successfully");
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error("Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className={cn(
        isCreatePostPage 
          ? 'fixed top-16 bottom-0 left-0 right-0 z-40 lg:relative lg:z-auto bg-background lg:bg-transparent' 
          : ''
      )}
    >
      <Card 
        className={cn(
          isCreatePostPage 
            ? 'min-h-full rounded-none border-0 lg:min-h-0 lg:rounded-xl lg:border lg:shadow-lg' 
            : 'mb-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200',
          'bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-900/30'
        )}
      >
        <CardContent className={cn(
          isCreatePostPage 
            ? 'h-full flex flex-col p-4 lg:p-6 pb-20' 
            : 'pt-6'
        )}>
          <div className="space-y-4 flex-1">
            <div className="flex space-x-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className={cn(
                  isFocused ? 'scale-110' : '',
                  'transition-transform duration-200'
                )}
              >
                <Avatar className="w-10 h-10 ring-2 ring-primary/20 dark:ring-primary/40">
                  <AvatarImage src={dbUser?.image || user?.imageUrl || "/avatar.png"} alt={dbUser?.name || user?.fullName || "User"} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                    {dbUser?.name?.[0] || user?.fullName?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex-1"
              >
                <Textarea
                  placeholder="What's on your mind?"
                  className={cn(
                    'min-h-[100px] resize-none border-none focus-visible:ring-0 p-0 text-base lg:text-lg',
                    isCreatePostPage 
                      ? 'h-[calc(100vh-250px)] lg:h-[300px]' 
                      : '',
                    isFocused
                      ? 'placeholder:text-primary/40'
                      : 'placeholder:text-muted-foreground/50',
                    (showImageUpload || showVideoUpload) && isCreatePostPage
                      ? 'h-[calc(100vh-400px)]'
                      : '',
                    'bg-transparent'
                  )}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  disabled={isPosting}
                />
              </motion.div>
            </div>

            <AnimatePresence>
              {(showImageUpload || imageUrl) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "border rounded-xl p-4 overflow-hidden",
                    isCreatePostPage ? 'mb-4' : '',
                    'bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/50 dark:to-purple-950/50'
                  )}
                >
                  <ImageUpload
                    endpoint="postImage"
                    value={imageUrl}
                    onChange={(url) => {
                      setImageUrl(url);
                      if (!url) setShowImageUpload(false);
                    }}
                  />
                </motion.div>
              )}

              {(showVideoUpload || videoUrl) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "border rounded-xl p-4 overflow-hidden",
                    isCreatePostPage ? 'mb-4' : '',
                    'bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/50 dark:to-purple-950/50'
                  )}
                >
                  <VideoUpload
                    value={videoUrl}
                    onChange={(url) => {
                      setVideoUrl(url);
                      if (!url) setShowVideoUpload(false);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={cn(
              "flex items-center justify-between",
              isCreatePostPage 
                ? 'fixed bottom-4 left-0 right-0 bg-background border-t p-4 mx-4 rounded-t-xl shadow-lg lg:relative lg:border-t lg:pt-4 lg:mt-4 lg:bg-transparent lg:mx-0 lg:shadow-none' 
                : 'border-t pt-4'
            )}
          >
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={showImageUpload ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "text-muted-foreground transition-all duration-200",
                  showImageUpload 
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20' 
                    : 'hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10'
                )}
                onClick={() => {
                  setShowImageUpload(!showImageUpload);
                  if (!showImageUpload) setShowVideoUpload(false);
                }}
                disabled={isPosting}
              >
                {showImageUpload ? (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="flex items-center"
                  >
                    <XIcon className="size-4 mr-2" />
                    Cancel
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="flex items-center"
                  >
                    <ImageIcon className="size-4 mr-2" />
                    Photo
                  </motion.div>
                )}
              </Button>

              <Button
                type="button"
                variant={showVideoUpload ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "text-muted-foreground transition-all duration-200",
                  showVideoUpload 
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-300 hover:bg-purple-500/20' 
                    : 'hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-500/10'
                )}
                onClick={() => {
                  setShowVideoUpload(!showVideoUpload);
                  if (!showVideoUpload) setShowImageUpload(false);
                }}
                disabled={isPosting}
              >
                {showVideoUpload ? (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="flex items-center"
                  >
                    <XIcon className="size-4 mr-2" />
                    Cancel
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="flex items-center"
                  >
                    <VideoIcon className="size-4 mr-2" />
                    Video
                  </motion.div>
                )}
              </Button>
            </div>

            <Button
              type="button"
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 dark:from-blue-400 dark:to-purple-400 dark:hover:from-blue-500 dark:hover:to-purple-500"
              onClick={handleSubmit}
              disabled={isPosting || (!content.trim() && !imageUrl && !videoUrl)}
            >
              {isPosting ? (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="flex items-center"
                >
                  <Loader2Icon className="size-4 mr-2 animate-spin" />
                  Posting
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="flex items-center"
                >
                  <SendIcon className="size-4 mr-2" />
                  Post
                </motion.div>
              )}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default CreatePost;