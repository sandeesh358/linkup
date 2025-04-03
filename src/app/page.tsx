import { getPosts } from "@/actions/post.action";
import { getDbUserId } from "@/actions/user.action";
import CreatePost from "@/components/CreatePost";
import PostCard, { Post } from "@/components/PostCard";
import WhoToFollow from "@/components/WhoToFollow";
import UnauthenticatedState from "@/components/UnauthenticatedState";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();
  
  if (!user) {
    return <UnauthenticatedState />;
  }

  const posts = await getPosts();
  const dbUserId = await getDbUserId();
  
  // Cast the posts to match our Post interface
  const typedPosts = posts.map(post => ({
    ...post,
    _count: {
      likes: post.likes.length,
      comments: post.comments.length
    }
  })) as Post[];

  return (
    <>
      {/* Dynamic Background Glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white dark:from-black dark:via-gray-900 dark:to-black">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 dark:opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-transparent to-blue-100/50 dark:from-blue-500/20 dark:via-transparent dark:to-blue-500/20 animate-pulse"></div>
        </div>
        {/* Decorative circles for visual interest */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-100/50 dark:bg-blue-500/20 rounded-full blur-xl"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-100/50 dark:bg-blue-500/20 rounded-full blur-xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div className="lg:col-span-6">
          <div className="space-y-4 px-4 lg:px-0">
            {/* Mobile WhoToFollow - Show inline */}
            <div className="lg:hidden">
              <WhoToFollow />
            </div>

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

        {/* Right Sidebar - Desktop View */}
        <div className="hidden lg:block lg:col-span-4">
          <div className="sticky top-20 space-y-6">
            <CreatePost />
            <WhoToFollow />
          </div>
        </div>
      </div>
    </>
  );
}
