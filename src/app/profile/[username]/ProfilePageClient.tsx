"use client";

import { getProfileByUsername, getUserPosts, updateProfile } from "@/actions/profile.action";
import { toggleFollow } from "@/actions/user.action";
import PostCard, { Post } from "@/components/PostCard";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SignInButton, useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import {
  CalendarIcon,
  EditIcon,
  FileTextIcon,
  HeartIcon,
  LinkIcon,
  MapPinIcon,
  UsersIcon,
  UserIcon,
  ImageIcon,
} from "lucide-react";
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import FollowModal from "@/components/FollowModal";
import { getFollowers, getFollowing } from "@/actions/user.action";
import ImageUpload from "@/components/ImageUpload";

// Update the type definition to match our Prisma schema
type User = {
  id: string;
  name: string | null;
  username: string;
  bio: string | null;
  image: string | null;
  coverImage: string | null;
  location: string | null;
  website: string | null;
  createdAt: Date;
  _count: {
    followers: number;
    following: number;
    posts: number;
  };
};

type Posts = Awaited<ReturnType<typeof getUserPosts>>;

interface ProfilePageClientProps {
  user: NonNullable<User>;
  posts: Posts;
  likedPosts: Posts;
  isFollowing: boolean;
}

function ProfilePageClient({
  isFollowing: initialIsFollowing,
  likedPosts,
  posts,
  user,
}: ProfilePageClientProps) {
  const { user: currentUser } = useUser();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  const [editForm, setEditForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    image: user.image || "",
    coverImage: user.coverImage || "",
  });

  const handleEditSubmit = async () => {
    const formData = new FormData();
    Object.entries(editForm).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const result = await updateProfile(formData);
    if (result.success) {
      setShowEditDialog(false);
      toast.success("Profile updated successfully");
      
      // Dispatch custom event to notify sidebar about profile update
      const profileUpdatedEvent = new Event('profile-updated');
      window.dispatchEvent(profileUpdatedEvent);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return;

    try {
      setIsUpdatingFollow(true);
      await toggleFollow(user.id);
      setIsFollowing(!isFollowing);
    } catch (error) {
      toast.error("Failed to update follow status");
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  const handleShowFollowers = async () => {
    setIsLoadingFollowers(true);
    try {
      const fetchedFollowers = await getFollowers(user.id);
      setFollowers(fetchedFollowers);
      setShowFollowers(true);
    } catch (error) {
      console.error("Error fetching followers:", error);
      toast.error("Failed to load followers");
    } finally {
      setIsLoadingFollowers(false);
    }
  };

  const handleShowFollowing = async () => {
    setIsLoadingFollowing(true);
    try {
      const fetchedFollowing = await getFollowing(user.id);
      setFollowing(fetchedFollowing);
      setShowFollowing(true);
    } catch (error) {
      console.error("Error fetching following:", error);
      toast.error("Failed to load following");
    } finally {
      setIsLoadingFollowing(false);
    }
  };

  const scrollToPosts = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isOwnProfile =
    currentUser?.username === user.username ||
    currentUser?.emailAddresses[0].emailAddress.split("@")[0] === user.username;

  const formattedDate = format(new Date(user.createdAt), "MMMM yyyy");

  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-1 gap-6">
        <div className="w-full max-w-lg mx-auto">
          <Card className="bg-card overflow-hidden">
            {/* Cover Image - Takes up 1/3 of the card height */}
            <div className="relative h-40 overflow-hidden">
              {user.coverImage ? (
                <img 
                  src={user.coverImage} 
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-600 to-blue-400"></div>
              )}
            </div>
            
            <CardContent className="relative pt-16">
              {/* Avatar positioned to overlap the cover and content */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                <Avatar className="w-24 h-24 border-4 border-background">
                  <AvatarImage src={user.image || undefined} alt={user.name || user.username} />
                  <AvatarFallback>
                    {user.name 
                      ? user.name.charAt(0).toUpperCase() 
                      : user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex flex-col items-center text-center pt-4">
                <h1 className="text-2xl font-bold">{user.name ?? user.username}</h1>
                <p className="text-muted-foreground">@{user.username}</p>
                <p className="mt-2 text-sm">{user.bio}</p>

                {/* PROFILE STATS */}
                <div className="w-full mt-6">
                  <div className="flex justify-between mb-4">
                    <Button 
                      variant="ghost" 
                      className="flex-1 flex flex-col items-center gap-1 h-auto py-2"
                      onClick={handleShowFollowing}
                      disabled={isLoadingFollowing}
                    >
                      <div className="font-semibold">{user._count.following.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <UserIcon className="h-3 w-3" />
                        Following
                      </div>
                    </Button>
                    <Separator orientation="vertical" />
                    <Button 
                      variant="ghost" 
                      className="flex-1 flex flex-col items-center gap-1 h-auto py-2"
                      onClick={handleShowFollowers}
                      disabled={isLoadingFollowers}
                    >
                      <div className="font-semibold">{user._count.followers.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <UsersIcon className="h-3 w-3" />
                        Followers
                      </div>
                    </Button>
                    <Separator orientation="vertical" />
                    <Button 
                      variant="ghost" 
                      className="flex-1 flex flex-col items-center gap-1 h-auto py-2"
                      onClick={scrollToPosts}
                    >
                      <div className="font-semibold">{user._count.posts.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <FileTextIcon className="h-3 w-3" />
                        Posts
                      </div>
                    </Button>
                  </div>
                </div>

                {/* "FOLLOW & EDIT PROFILE" BUTTONS */}
                {!currentUser ? (
                  <SignInButton mode="modal">
                    <Button className="w-full mt-4">Follow</Button>
                  </SignInButton>
                ) : isOwnProfile ? (
                  <Button className="w-full mt-4" onClick={() => setShowEditDialog(true)}>
                    <EditIcon className="size-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    className="w-full mt-4"
                    onClick={handleFollow}
                    disabled={isUpdatingFollow}
                    variant={isFollowing ? "outline" : "default"}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                )}

                {/* LOCATION & WEBSITE */}
                <div className="w-full mt-6 space-y-2 text-sm">
                  {user.location && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPinIcon className="size-4 mr-2" />
                      {user.location}
                    </div>
                  )}
                  {user.website && (
                    <div className="flex items-center text-muted-foreground">
                      <LinkIcon className="size-4 mr-2" />
                      <a
                        href={
                          user.website.startsWith("http") ? user.website : `https://${user.website}`
                        }
                        className="hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {user.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center text-muted-foreground">
                    <CalendarIcon className="size-4 mr-2" />
                    Joined {formattedDate}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="posts" className="w-full" ref={tabsRef}>
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger
              value="posts"
              className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
               data-[state=active]:bg-transparent px-6 font-semibold"
            >
              <FileTextIcon className="size-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="likes"
              className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
               data-[state=active]:bg-transparent px-6 font-semibold"
            >
              <HeartIcon className="size-4" />
              Likes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <div className="space-y-6">
              {posts.length > 0 ? (
                posts.map((post) => <PostCard key={post.id} post={post as unknown as Post} dbUserId={user.id} />)
              ) : (
                <div className="text-center py-8 text-muted-foreground">No posts yet</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="likes" className="mt-6">
            <div className="space-y-6">
              {likedPosts.length > 0 ? (
                likedPosts.map((post) => <PostCard key={post.id} post={post as unknown as Post} dbUserId={user.id} />)
              ) : (
                <div className="text-center py-8 text-muted-foreground">No liked posts to show</div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 text-center block">Cover Image</Label>
                  <ImageUpload
                    endpoint="profileImage"
                    value={editForm.coverImage}
                    onChange={(url) => setEditForm({ ...editForm, coverImage: url })}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 1200×400px
                  </p>
                </div>
                
                <div className="flex flex-col items-center">
                  <Label className="mb-2 text-center">Profile Picture</Label>
                  <ImageUpload
                    endpoint="profileImage"
                    value={editForm.image}
                    onChange={(url) => setEditForm({ ...editForm, image: url })}
                    isProfileImage
                    className="mx-auto"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="resize-none"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleEditSubmit}>Save changes</Button>
            </div>
          </DialogContent>
        </Dialog>

        <FollowModal
          isOpen={showFollowers}
          onClose={() => setShowFollowers(false)}
          title="Followers"
          users={followers}
        />

        <FollowModal
          isOpen={showFollowing}
          onClose={() => setShowFollowing(false)}
          title="Following"
          users={following}
        />
      </div>
    </div>
  );
}
export default ProfilePageClient;
