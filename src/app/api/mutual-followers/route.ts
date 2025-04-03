import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

interface Message {
  id: string;
  content: string;
  createdAt: Date;
  senderId: string;
}

interface Conversation {
  messages: Message[];
  members: {
    userId: string;
    lastReadAt: Date | null;
  }[];
}

interface ConversationMember {
  conversation: Conversation;
}

interface UserWithMessages {
  id: string;
  clerkId: string;
  name: string | null;
  username: string;
  image: string | null;
  createdAt: Date;
  ConversationMember: ConversationMember[];
}

export async function GET() {
  try {
    const session = await auth();
    const clerkId = session.userId;
    
    if (!clerkId) {
      console.log('API: Mutual followers - Unauthorized (no clerk ID)');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the user's DB ID from clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true }
    });

    if (!user) {
      console.log(`API: Mutual followers - User not found in database for clerk ID ${clerkId}`);
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    const userId = user.id;
    console.log(`API: Fetching mutual followers for user ID ${userId}`);
    
    // Get mutual followers with their latest messages and unread counts
    const mutualFollowers = await prisma.user.findMany({
      where: {
        // Users who follow the current user
        followers: {
          some: {
            followerId: userId
          }
        },
        // Users who are followed by the current user
        following: {
          some: {
            followingId: userId
          }
        },
        // Exclude the current user
        NOT: { id: userId }
      },
      select: {
        id: true,
        clerkId: true,
        name: true,
        username: true,
        image: true,
        createdAt: true,
        // Get the latest message and unread count in any conversation with this user
        ConversationMember: {
          where: {
            conversation: {
              members: {
                some: {
                  userId: userId
                }
              }
            }
          },
          select: {
            conversation: {
              select: {
                messages: {
                  orderBy: {
                    createdAt: 'desc'
                  },
                  take: 1
                },
                members: {
                  where: {
                    userId: userId
                  },
                  select: {
                    lastReadAt: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { ConversationMember: { _count: 'desc' } }
      ],
      take: 20 // Limit to 20 mutual followers for performance
    });

    // Process the results to get the latest message and unread count for each user
    const processedFollowers = (mutualFollowers as unknown as UserWithMessages[]).map(follower => {
      // Get all messages and last read times from all conversations
      const conversations = follower.ConversationMember.map(cm => ({
        messages: cm.conversation.messages,
        lastReadAt: cm.conversation.members[0]?.lastReadAt
      }));

      // Find the latest message
      const allMessages = conversations.flatMap(c => c.messages);
      const latestMessage = allMessages.length > 0
        ? allMessages.reduce((latest: Message, current: Message) => 
            new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
          )
        : null;

      // Calculate total unread messages
      const unreadCount = conversations.reduce((total, conv) => {
        if (!conv.lastReadAt) return total + conv.messages.length;
        return total + conv.messages.filter(msg => 
          new Date(msg.createdAt) > new Date(conv.lastReadAt!)
        ).length;
      }, 0);

      return {
        id: follower.id,
        clerkId: follower.clerkId,
        name: follower.name,
        username: follower.username,
        image: follower.image,
        createdAt: follower.createdAt,
        latestMessage: latestMessage ? {
          content: latestMessage.content,
          createdAt: latestMessage.createdAt,
          senderId: latestMessage.senderId
        } : null,
        unreadCount
      };
    });

    // Sort by latest message timestamp
    processedFollowers.sort((a, b) => {
      if (!a.latestMessage && !b.latestMessage) return 0;
      if (!a.latestMessage) return 1;
      if (!b.latestMessage) return -1;
      return new Date(b.latestMessage.createdAt).getTime() - new Date(a.latestMessage.createdAt).getTime();
    });

    console.log(`API: Found ${processedFollowers.length} mutual followers for user ID ${userId}`);
    
    // Add cache headers to improve performance
    return NextResponse.json(processedFollowers, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      }
    });
  } catch (error) {
    console.error('Error fetching mutual followers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mutual followers' },
      { status: 500 }
    );
  }
}