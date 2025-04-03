import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { userId } = params;

    // Get current user's database ID
    const currentDbUser = await prisma.user.findUnique({
      where: {
        clerkId: user.id
      }
    });

    if (!currentDbUser) {
      return new NextResponse("Current user not found in database", { status: 404 });
    }

    // Find conversation between current user and recipient using database IDs
    const conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { members: { some: { userId: currentDbUser.id } } },
          { members: { some: { userId: userId } } }
        ]
      }
    });

    if (!conversation) {
      return NextResponse.json([]);
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversation.id
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
    console.error("[MESSAGES_USER_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 