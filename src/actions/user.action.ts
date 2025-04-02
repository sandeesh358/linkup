"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function syncUser() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) return;

    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (existingUser) return existingUser;

    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        name: `${user.firstName || ""} ${user.lastName || ""}`,
        username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      },
    });

    return dbUser;
  } catch (error) {
    console.log("Error in syncUser", error);
  }
}

export async function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({
    where: {
      clerkId,
    },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });
}

export async function getDbUserId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await getUserByClerkId(clerkId);

  if (!user) throw new Error("User not found");

  return user.id;
}
export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      image: true,
      coverImage: true,
      username: true
    } as any
  });
}
export async function getRandomUsers() {
  try {
    const userId = await getDbUserId();

    if (!userId) return [];

    // get 3 random users exclude ourselves & users that we already follow
    const randomUsers = await prisma.user.findMany({
      where: {
        AND: [
          { NOT: { id: userId } },
          {
            NOT: {
              followers: {
                some: {
                  followerId: userId,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        coverImage: true,
        _count: {
          select: {
            followers: true,
          },
        },
      } as any,
      take: 3,
    });

    return randomUsers;
  } catch (error) {
    console.log("Error fetching random users", error);
    return [];
  }
}

export async function toggleFollow(targetUserId: string) {
  try {
    const userId = await getDbUserId();

    if (!userId) return;

    if (userId === targetUserId) throw new Error("You cannot follow yourself");

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      // unfollow
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });
    } else {
      // follow
      await prisma.$transaction([
        prisma.follows.create({
          data: {
            followerId: userId,
            followingId: targetUserId,
          },
        }),

        prisma.notification.create({
          data: {
            type: "FOLLOW",
            userId: targetUserId, // user being followed
            creatorId: userId, // user following
          },
        }),
      ]);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.log("Error in toggleFollow", error);
    return { success: false, error: "Error toggling follow" };
  }
}

export async function getFollowers(userId: string) {
  try {
    const followers = await prisma.follows.findMany({
      where: {
        followingId: userId,
      },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            coverImage: true,
          } as any,
        },
      },
    });

    return followers.map((follow) => follow.follower);
  } catch (error) {
    console.log("Error fetching followers", error);
    return [];
  }
}

export async function getFollowing(userId: string) {
  try {
    const following = await prisma.follows.findMany({
      where: {
        followerId: userId,
      },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            coverImage: true,
          } as any,
        },
      },
    });

    return following.map((follow) => follow.following);
  } catch (error) {
    console.log("Error fetching following", error);
    return [];
  }
}

export async function searchUsers(query: string) {
  try {
    if (!query || query.trim() === '') {
      return [];
    }

    const currentUserId = await getDbUserId();
    
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                name: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                username: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                email: {
                  contains: query,
                  mode: 'insensitive'
                }
              }
            ]
          },
          // Don't include the current user in search results
          currentUserId ? { NOT: { id: currentUserId } } : {}
        ]
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
        _count: {
          select: {
            followers: true,
            following: true
          }
        }
      },
      orderBy: [
        {
          name: 'asc'
        },
        {
          username: 'asc'
        }
      ],
      take: 20
    });

    return users;
  } catch (error) {
    console.error("Error in searchUsers:", error);
    throw error;
  }
}

export async function getFollowingStatus(userId: string) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) return false;

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: currentUserId },
      include: {
        following: true
      }
    });

    if (!currentUser) return false;

    return currentUser.following.some(follow => follow.followingId === userId);
  } catch (error) {
    console.error("Error in getFollowingStatus:", error);
    return false;
  }
}

export async function checkIfFollowing(targetUserId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return false;

    const follow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    return !!follow; // Convert to boolean
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
}

// Client-side function to get cached user ID and reduce authentication requests
export const getCachedUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    // Try to get the cached user ID
    const cachedUserId = localStorage.getItem('sipna_user_id');
    
    if (!cachedUserId) return null;
    
    // Check if the cache is still valid (less than 24 hours old)
    const cacheTimestamp = localStorage.getItem('sipna_user_id_timestamp');
    
    if (!cacheTimestamp) {
      // Timestamp missing, clear the invalid cache
      localStorage.removeItem('sipna_user_id');
      return null;
    }
    
    try {
      const timestamp = parseInt(cacheTimestamp, 10);
      const expirationTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      const now = Date.now();
      
      if (isNaN(timestamp) || now - timestamp > expirationTime) {
        // Cache is invalid or expired, clear it
        localStorage.removeItem('sipna_user_id');
        localStorage.removeItem('sipna_user_id_timestamp');
        return null;
      }
      
      return cachedUserId;
    } catch (parseError) {
      console.error('Error parsing cache timestamp:', parseError);
      // If timestamp parsing fails, clear the invalid cache
      localStorage.removeItem('sipna_user_id');
      localStorage.removeItem('sipna_user_id_timestamp');
      return null;
    }
  } catch (error) {
    console.error('Error accessing localStorage for user ID:', error);
    return null;
  }
};

// Client-side function to cache user ID
export const cacheUserId = (userId: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('sipna_user_id', userId);
    localStorage.setItem('sipna_user_id_timestamp', Date.now().toString());
    console.log('User ID cached successfully:', userId);
  } catch (error) {
    console.error('Error caching user ID:', error);
  }
};

// Client-side function to clear user cache
export const clearUserCache = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('sipna_user_id');
    localStorage.removeItem('sipna_user_id_timestamp');
    console.log('User cache cleared successfully');
  } catch (error) {
    console.error('Error clearing user cache:', error);
  }
};
