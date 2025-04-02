import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CreatePost from "@/components/CreatePost";

export default async function CreatePostPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="max-w-2xl mx-auto lg:py-6">
      <h1 className="text-2xl font-bold mb-6 px-4 lg:px-0 hidden lg:block">Create Post</h1>
      <CreatePost />
    </div>
  );
} 