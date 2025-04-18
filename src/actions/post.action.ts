"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export async function createPost(content: string, image: string, video: string) {
  try {
    const userId = await getDbUserId();

    if (!userId) return;

    const postData: any = {
      content,
      image,
      authorId: userId,
    };

    if (video) {
      postData.video = video;
    }

    const post = await prisma.post.create({
      data: postData,
    });

    revalidatePath("/"); // purge the cache for the home page
    return { success: true, post };
  } catch (error) {
    console.error("Failed to create post:", error);
    return { success: false, error: "Failed to create post" };
  }
}

export async function getPosts(cursor?: string, limit: number = 10) {
  try {
    const dbUserId = await getDbUserId();
    if (!dbUserId) throw new Error("User not found");

    // Get mutual followers
    const mutualFollowers = await prisma.user.findMany({
      where: {
        followers: {
          some: {
            followerId: dbUserId
          }
        },
        following: {
          some: {
            followingId: dbUserId
          }
        }
      },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        followers: {
          select: {
            followerId: true
          }
        },
        following: {
          select: {
            followingId: true
          }
        }
      }
    });

    // Get user's own posts
    const ownPosts = await prisma.post.findMany({
      where: {
        authorId: dbUserId
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            followers: {
              select: {
                followerId: true
              }
            },
            following: {
              select: {
                followingId: true
              }
            }
          }
        },
        comments: {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                id: true,
                username: true,
                name: true,
                image: true
              }
            }
          }
        },
        likes: {
          select: {
            userId: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      ...(cursor && {
        cursor: {
          id: cursor
        },
        skip: 1
      })
    });

    // Get posts from mutual followers
    const mutualPosts = await prisma.post.findMany({
      where: {
        authorId: {
          in: mutualFollowers.map(user => user.id)
        }
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            followers: {
              select: {
                followerId: true
              }
            },
            following: {
              select: {
                followingId: true
              }
            }
          }
        },
        comments: {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                id: true,
                username: true,
                name: true,
                image: true
              }
            }
          }
        },
        likes: {
          select: {
            userId: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      ...(cursor && {
        cursor: {
          id: cursor
        },
        skip: 1
      })
    });

    // Get random posts from other users
    const randomPosts = await prisma.post.findMany({
      where: {
        authorId: {
          notIn: [...mutualFollowers.map(user => user.id), dbUserId]
        }
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            followers: {
              select: {
                followerId: true
              }
            },
            following: {
              select: {
                followingId: true
              }
            }
          }
        },
        comments: {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                id: true,
                username: true,
                name: true,
                image: true
              }
            }
          }
        },
        likes: {
          select: {
            userId: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      ...(cursor && {
        cursor: {
          id: cursor
        },
        skip: 1
      })
    });

    // Combine and shuffle posts
    const allPosts = [...ownPosts, ...mutualPosts, ...randomPosts];
    const shuffledPosts = allPosts.sort(() => Math.random() - 0.5);

    return {
      posts: shuffledPosts,
      nextCursor: shuffledPosts.length > 0 ? shuffledPosts[shuffledPosts.length - 1].id : null
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return {
      posts: [],
      nextCursor: null
    };
  }
}

export async function toggleLike(postId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    // check if like exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");

    if (existingLike) {
      // unlike
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
    } else {
      // like and create notification (only if liking someone else's post)
      await prisma.$transaction([
        prisma.like.create({
          data: {
            userId,
            postId,
          },
        }),
        ...(post.authorId !== userId
          ? [
              prisma.notification.create({
                data: {
                  type: "LIKE",
                  userId: post.authorId, // recipient (post author)
                  creatorId: userId, // person who liked
                  postId,
                },
              }),
            ]
          : []),
      ]);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle like:", error);
    return { success: false, error: "Failed to toggle like" };
  }
}

export async function createComment(postId: string, content: string) {
  try {
    const userId = await getDbUserId();

    if (!userId) return;
    if (!content) throw new Error("Content is required");

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");

    // Create comment and notification in a transaction
    const [comment] = await prisma.$transaction(async (tx) => {
      // Create comment first
      const newComment = await tx.comment.create({
        data: {
          content,
          authorId: userId,
          postId,
        },
      });

      // Create notification if commenting on someone else's post
      if (post.authorId !== userId) {
        await tx.notification.create({
          data: {
            type: "COMMENT",
            userId: post.authorId,
            creatorId: userId,
            postId,
            commentId: newComment.id,
          },
        });
      }

      return [newComment];
    });

    revalidatePath(`/`);
    return { success: true, comment };
  } catch (error) {
    console.error("Failed to create comment:", error);
    return { success: false, error: "Failed to create comment" };
  }
}

export async function deleteComment(commentId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("User not found");

    // Get the comment and check permissions
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        authorId: true,
        post: {
          select: {
            authorId: true,
          },
        },
      },
    });

    if (!comment) throw new Error("Comment not found");

    // Check if user is either the comment author or post author
    if (userId !== comment.authorId && userId !== comment.post.authorId) {
      throw new Error("Unauthorized - no delete permission");
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id: commentId },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete comment:", error);
    return { success: false, error: "Failed to delete comment" };
  }
}

async function deleteFileFromUploadThing(url: string) {
  try {
    // Extract the file key from the URL
    const fileKey = url.split('/').pop();
    if (!fileKey) return;

    // Delete the file from UploadThing
    await fetch(`https://api.uploadthing.com/api/deleteFile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.UPLOADTHING_TOKEN}`,
      },
      body: JSON.stringify({
        fileKeys: [fileKey],
      }),
    });
  } catch (error) {
    console.error('Error deleting file from UploadThing:', error);
  }
}

export async function deletePost(postId: string) {
  try {
    const userId = await getDbUserId();

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { 
        authorId: true,
        image: true,
        video: true 
      },
    });

    if (!post) throw new Error("Post not found");
    if (post.authorId !== userId) throw new Error("Unauthorized - no delete permission");

    // Delete associated files from UploadThing
    if (post.image) {
      await deleteFileFromUploadThing(post.image);
    }
    if (post.video) {
      await deleteFileFromUploadThing(post.video);
    }

    // Delete the post from the database
    await prisma.post.delete({
      where: { id: postId },
    });

    revalidatePath("/"); // purge the cache
    return { success: true };
  } catch (error) {
    console.error("Failed to delete post:", error);
    return { success: false, error: "Failed to delete post" };
  }
}



