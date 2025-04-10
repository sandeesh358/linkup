import { NextRequest, NextResponse } from "next/server";
import { getPosts } from "@/actions/post.action";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get("cursor") || undefined;
    const limit = parseInt(searchParams.get("limit") || "10");

    const { posts, nextCursor } = await getPosts(cursor, limit);

    return NextResponse.json({
      posts,
      nextCursor
    });
  } catch (error) {
    console.error("Error in posts API:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
} 