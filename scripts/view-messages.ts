import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a new Prisma client instance
const prisma = new PrismaClient();

async function main() {
  console.log('Message Viewer');
  console.log('=============');
  
  // Get all messages
  const messages = await prisma.message.findMany({
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          username: true
        }
      },
      conversation: {
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
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  console.log(`Found ${messages.length} messages\n`);
  
  if (messages.length === 0) {
    console.log('No messages found in the database');
    return;
  }
  
  // Display each message
  messages.forEach((message, index) => {
    const sender = message.sender.name || message.sender.username;
    const conversationMembers = message.conversation.members.map(m => 
      m.user.name || m.user.username
    ).join(' and ');
    
    console.log(`Message #${index + 1}`);
    console.log(`ID: ${message.id}`);
    console.log(`From: ${sender}`);
    console.log(`Content: ${message.content}`);
    console.log(`Sent at: ${message.createdAt.toLocaleString()}`);
    console.log(`In conversation: ${message.conversationId} (between ${conversationMembers})`);
    
    // Show read status
    console.log('Read status:');
    message.conversation.members.forEach(member => {
      const username = member.user.name || member.user.username;
      const readStatus = member.lastReadAt && member.lastReadAt >= message.createdAt
        ? `Read at ${member.lastReadAt.toLocaleString()}`
        : 'Not read yet';
      console.log(`  - ${username}: ${readStatus}`);
    });
    
    console.log('-------------------');
  });
  
  // Show conversation summary
  console.log('\nConversation Summary:');
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
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });
  
  conversations.forEach(conversation => {
    const members = conversation.members.map(m => m.user.name || m.user.username).join(' and ');
    console.log(`- Conversation ID: ${conversation.id}`);
    console.log(`  Between: ${members}`);
    console.log(`  Messages: ${conversation._count.messages}`);
    console.log(`  Last activity: ${conversation.updatedAt.toLocaleString()}`);
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