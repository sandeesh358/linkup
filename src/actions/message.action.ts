import prisma from "@/lib/prisma";

interface SendMessageParams {
  conversationId: string;
  senderId: string;
  content: string;
}

export const sendMessage = async ({ conversationId, senderId, content }: SendMessageParams) => {
  try {
    // Verify conversation exists and user is a member
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { members: true }
    });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (!conversation.members.some(m => m.userId === senderId)) {
      throw new Error("Not authorized to send message in this conversation");
    }

    // Create and return the message
    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        conversationId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            coverImage: true
          } as any
        }
      }
    });

    return message;
  } catch (error) {
    console.error("Error in sendMessage:", error);
    throw error;
  }
};

export const getMessages = async (conversationId: string, userId: string) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { members: true }
    });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (!conversation.members.some(m => m.userId === userId)) {
      throw new Error("Not authorized to view this conversation");
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            coverImage: true
          } as any
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return messages;
  } catch (error) {
    console.error("Error in getMessages:", error);
    throw error;
  }
};