import {
  getProfileByUsername,
  getUserLikedPosts,
  getUserPosts,
  isFollowing,
} from "@/actions/profile.action";
import { notFound } from "next/navigation";
import ProfilePageClient from "./ProfilePageClient";

export async function generateMetadata({ params }: { params: { username: string } }) {
  const user = await getProfileByUsername(params.username);
  if (!user) return;

  return {
    title: `${user.name ?? user.username}`,
    description: user.bio || `Check out ${user.username}'s profile.`,
  };
}

// Define a basic User type for type safety
interface ProfileUser {
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
}

async function ProfilePageServer({ params }: { params: { username: string } }) {
  const user = await getProfileByUsername(params.username);

  if (!user) notFound();
  
  // Cast the user with a more specific type
  const typedUser = user as unknown as ProfileUser;

  const [posts, likedPosts, isCurrentUserFollowing] = await Promise.all([
    getUserPosts(typedUser.id),
    getUserLikedPosts(typedUser.id),
    isFollowing(typedUser.id),
  ]);

  return (
    <ProfilePageClient
      user={typedUser}
      posts={posts}
      likedPosts={likedPosts}
      isFollowing={isCurrentUserFollowing}
    />
  );
}
export default ProfilePageServer;
