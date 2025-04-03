import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: {
        clerkId: user.id
      }
    });

    if (!dbUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        members: {
          some: {
            userId: dbUser.id
          }
        }
      },
      include: {
        members: {
          include: {
            user: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("[CONVERSATIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { recipientId } = body;

    if (!recipientId) {
      return new NextResponse("Missing recipient ID", { status: 400 });
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

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { members: { some: { userId: currentDbUser.id } } },
          { members: { some: { userId: recipientId } } }
        ]
      },
      include: {
        members: {
          include: {
            user: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (existingConversation) {
      return NextResponse.json(existingConversation);
    }

    // Create new conversation
    const newConversation = await prisma.conversation.create({
      data: {
        members: {
          create: [
            { userId: currentDbUser.id },
            { userId: recipientId }
          ]
        }
      },
      include: {
        members: {
          include: {
            user: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    return NextResponse.json(newConversation);
  } catch (error) {
    console.error("[CONVERSATIONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 