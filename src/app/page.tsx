import { getPosts } from "@/actions/post.action";
import { getDbUserId } from "@/actions/user.action";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import WhoToFollow from "@/components/WhoToFollow";
import { currentUser } from "@clerk/nextjs/server";
import { Post } from "@/components/PostCard";

export default async function Home() {
  const user = await currentUser();
  const posts = await getPosts();
  const dbUserId = await getDbUserId();
  const typedPosts = posts as unknown as Post[];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:col-span-6">
        {/* Mobile WhoToFollow - Show at top */}
        <div className="lg:hidden fixed top-16 left-0 right-0 z-50">
          <div className="bg-background/95 backdrop-blur-md border-b border-border/40 px-4 py-2 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]">
            <WhoToFollow />
          </div>
        </div>

        <div className="space-y-4 mt-4 px-4 lg:px-0 pt-20 lg:pt-0">
          {typedPosts.length > 0 ? (
            <div className="space-y-4">
              {typedPosts.map((post) => (
                <PostCard key={post.id} post={post} dbUserId={dbUserId} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No posts to show yet. Be the first to post!</p>
            </div>
          )}
        </div>
      </div>

      <div className="hidden lg:block lg:col-span-4 space-y-6">
        <div className="sticky top-20 space-y-6">
          <div className="space-y-6">
            <WhoToFollow />
            {user && (
              <div className="mt-6">
                <CreatePost />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
