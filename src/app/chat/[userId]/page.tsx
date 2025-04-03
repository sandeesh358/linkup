import ChatInterface from "@/components/ChatInterface";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

interface ChatPageProps {
  params: {
    userId: string;
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const currentUserData = await currentUser();
  if (!currentUserData) {
    return null;
  }

  // Get the recipient's details from the database
  const recipient = await prisma.user.findUnique({
    where: {
      id: params.userId
    },
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
    }
  });

  if (!recipient) {
    return null;
  }

  return (
    <div className="fixed inset-0 pt-16 lg:pl-[250px]">
      <div className="h-full w-full max-w-4xl mx-auto px-4 py-4">
        <ChatInterface
          recipientId={recipient.id}
          recipientUsername={recipient.username}
          recipientName={recipient.name}
          recipientImage={recipient.image}
        />
      </div>
    </div>
  );
} 