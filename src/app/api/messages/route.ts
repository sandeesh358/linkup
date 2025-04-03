import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { recipientId, content } = body;

    if (!recipientId || !content) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get the current user's database ID
    const currentDbUser = await prisma.user.findUnique({
      where: {
        clerkId: user.id
      }
    });

    if (!currentDbUser) {
      return new NextResponse("Current user not found in database", { status: 404 });
    }

    // Get or create conversation using database IDs
    const conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { members: { some: { userId: currentDbUser.id } } },
          { members: { some: { userId: recipientId } } }
        ]
      }
    });

    let conversationId = conversation?.id;

    if (!conversationId) {
      const newConversation = await prisma.conversation.create({
        data: {
          members: {
            create: [
              { userId: currentDbUser.id },
              { userId: recipientId }
            ]
          }
        }
      });
      conversationId = newConversation.id;
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: currentDbUser.id,
        conversationId
      },
      include: {
        sender: true
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("[MESSAGES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return new NextResponse("Missing conversation ID", { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId
      },
      include: {
        sender: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("[MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 