import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a new Prisma client instance
const prisma = new PrismaClient();

async function main() {
  console.log('Database Explorer');
  console.log('================');
  
  // Count all records
  const userCount = await prisma.user.count();
  const postCount = await prisma.post.count();
  const commentCount = await prisma.comment.count();
  const likeCount = await prisma.like.count();
  const followCount = await prisma.follows.count();
  const notificationCount = await prisma.notification.count();
  const conversationCount = await prisma.conversation.count();
  const memberCount = await prisma.conversationMember.count();
  const messageCount = await prisma.message.count();
  
  console.log(`Users: ${userCount}`);
  console.log(`Posts: ${postCount}`);
  console.log(`Comments: ${commentCount}`);
  console.log(`Likes: ${likeCount}`);
  console.log(`Follows: ${followCount}`);
  console.log(`Notifications: ${notificationCount}`);
  console.log(`Conversations: ${conversationCount}`);
  console.log(`Conversation Members: ${memberCount}`);
  console.log(`Messages: ${messageCount}`);
  
  // User details
  console.log('\nUsers:');
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      clerkId: true,
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
          Message: true
        }
      }
    }
  });
  
  users.forEach(user => {
    console.log(`- ${user.name || user.username} (ID: ${user.id})`);
    console.log(`  Clerk ID: ${user.clerkId}`);
    console.log(`  Stats: ${user._count.posts} posts, ${user._count.followers} followers, ${user._count.following} following, ${user._count.Message} messages`);
  });
  
  // Conversation details
  console.log('\nConversations:');
  const conversations = await prisma.conversation.findMany({
    include: {
      members: {
        include: {
          user: {
            select: {
              name: true,
              username: true
            }
          }
        }
      },
      _count: {
        select: { messages: true }
      }
    }
  });
  
  conversations.forEach(conversation => {
    console.log(`- Conversation ID: ${conversation.id}`);
    console.log(`  Created: ${conversation.createdAt.toLocaleString()}`);
    console.log(`  Updated: ${conversation.updatedAt.toLocaleString()}`);
    console.log(`  Message count: ${conversation._count.messages}`);
    console.log(`  Members:`);
    conversation.members.forEach(member => {
      console.log(`    - ${member.user.name || member.user.username} (Last read: ${member.lastReadAt?.toLocaleString() || 'Never'})`);
    });
  });
}

main()
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 