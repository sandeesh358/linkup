import prisma from "@/lib/prisma";

export const getOrCreateConversation = async (userId: string, recipientId: string) => {
  // Check mutual following
  const [isFollowing, isFollowedBy] = await Promise.all([
    prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: recipientId
        }
      }
    }),
    prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: recipientId,
          followingId: userId
        }
      }
    })
  ]);

  if (!isFollowing || !isFollowedBy) {
    throw new Error("You can only message mutual followers");
  }

  // Create a consistent ID by sorting user IDs
  const [firstId, secondId] = [userId, recipientId].sort();
  const consistentId = `${firstId}_${secondId}`;

  // Find or create conversation
  return await prisma.conversation.upsert({
    where: {
      id: consistentId
    },
    create: {
      id: consistentId,
      members: {
        createMany: {
          data: [
            { userId },
            { userId: recipientId }
          ]
        }
      }
    },
    update: {},
    include: {
      members: {
        where: { userId: { not: userId } },
        include: { user: true }
      }
    }
  });
};

export const getConversationWithParticipants = async (conversationId: string, userId: string) => {
    return await prisma.conversation.findUnique({
      where: {
        id: conversationId,
        members: {
          some: { userId }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      }
    });
  };

// Get all conversations for a user with the latest message and other participant info
export const getUserConversations = async (userId: string) => {
  try {
    const response = await fetch(`/api/conversations/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user conversations');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getUserConversations action:', error);
    throw error;
  }
};