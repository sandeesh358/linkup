import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

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
    
    // Use a more efficient query to get mutual followers directly
    // This query finds users who both follow the current user and are followed by the current user
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
        name: true,
        username: true,
        image: true,
        createdAt: true
      },
      orderBy: [
        { name: 'asc' }
      ],
      take: 20 // Limit to 20 mutual followers for performance
    });

    console.log(`API: Found ${mutualFollowers.length} mutual followers for user ID ${userId}`);
    
    // Add cache headers to improve performance
    return NextResponse.json(mutualFollowers, {
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