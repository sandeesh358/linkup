import MutualFollowersList from "@/components/MutualFollowersList";

export default function MessagePage() {
  return (
    <div className="container mx-auto py-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        <MutualFollowersList />
      </div>
    </div>
  );
} 