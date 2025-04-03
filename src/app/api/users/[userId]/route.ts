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

    // Try to find user by database ID first
    let dbUser = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        name: true,
        image: true,
        username: true,
      }
    });

    // If not found by database ID, try to find by Clerk ID
    if (!dbUser) {
      dbUser = await prisma.user.findUnique({
        where: {
          clerkId: userId
        },
        select: {
          id: true,
          name: true,
          image: true,
          username: true,
        }
      });
    }

    if (!dbUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(dbUser);
  } catch (error) {
    console.error("[USER_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 