import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this exists in .env.local
});

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use GPT-4 Vision model
      messages: [
        {
          role: "system",
          content: "You are an AI that generates captions for images.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Generate a short caption for this image:" },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      max_tokens: 50,
    });

    return NextResponse.json({ caption: response.choices[0]?.message?.content || "No caption generated." });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return NextResponse.json({ error: "Failed to generate caption" }, { status: 500 });
  }
}
