import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a new Prisma client instance
const prisma = new PrismaClient();

async function main() {
  console.log('Adding test message');
  
  // Get the first conversation
  const conversation = await prisma.conversation.findFirst({
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  if (!conversation) {
    console.log('No conversations found');
    return;
  }
  
  console.log(`Found conversation ID: ${conversation.id}`);
  console.log(`Between: ${conversation.members.map(m => m.user.name || m.user.username).join(' and ')}`);
  
  // Use the first member as the sender
  const sender = conversation.members[0].user;
  console.log(`Using sender: ${sender.name || sender.username} (ID: ${sender.id})`);
  
  // Create a test message
  const message = await prisma.message.create({
    data: {
      content: 'Hello! This is a test message.',
      conversationId: conversation.id,
      senderId: sender.id
    }
  });
  
  console.log(`Message created with ID: ${message.id}`);
  
  // Update conversation updatedAt and lastReadAt
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() }
  });
  
  await prisma.conversationMember.update({
    where: {
      userId_conversationId: {
        userId: sender.id,
        conversationId: conversation.id
      }
    },
    data: {
      lastReadAt: new Date()
    }
  });
  
  console.log('Updated conversation and member records');
}

main()
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 