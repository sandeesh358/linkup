import { NextRequest, NextResponse } from "next/server";
import { ComputerVisionClient } from "@azure/cognitiveservices-computervision";
import { ApiKeyCredentials } from "@azure/ms-rest-js";

// Emoji mapping for common image descriptions
const emojiMap: { [key: string]: string } = {
  // People and faces
  "person": "👤",
  "people": "👥",
  "man": "👨",
  "woman": "👩",
  "child": "👶",
  "baby": "👶",
  "family": "👨‍👩‍👧‍👦",
  "smile": "😊",
  "laugh": "😄",
  "happy": "😊",
  "sad": "😢",
  
  // Nature and weather
  "sun": "☀️",
  "sky": "🌤️",
  "cloud": "☁️",
  "rain": "🌧️",
  "snow": "❄️",
  "mountain": "⛰️",
  "beach": "🏖️",
  "ocean": "🌊",
  "sea": "🌊",
  "tree": "🌳",
  "flower": "🌸",
  "garden": "🌺",
  
  // Animals
  "dog": "🐕",
  "cat": "🐱",
  "bird": "🐦",
  "fish": "🐠",
  "animal": "🐾",
  "pet": "🐾",
  
  // Food and drink
  "food": "🍽️",
  "meal": "🍽️",
  "breakfast": "🍳",
  "lunch": "🥪",
  "dinner": "🍽️",
  "coffee": "☕",
  "tea": "🍵",
  "water": "💧",
  "fruit": "🍎",
  "pizza": "🍕",
  "burger": "🍔",
  
  // Activities
  "sport": "⚽",
  "game": "🎮",
  "play": "🎮",
  "music": "🎵",
  "dance": "💃",
  "travel": "✈️",
  "vacation": "🏖️",
  "party": "🎉",
  "celebration": "🎉",
  
  // Time and weather
  "morning": "🌅",
  "evening": "🌆",
  "night": "🌙",
  "summer": "☀️",
  "winter": "❄️",
  "spring": "🌸",
  "autumn": "🍂",
  "fall": "🍂",
  
  // Objects
  "car": "🚗",
  "phone": "📱",
  "computer": "💻",
  "camera": "📸",
  "book": "📚",
  "gift": "🎁",
  "heart": "❤️",
  "love": "❤️",
  
  // Places
  "home": "🏠",
  "house": "🏠",
  "building": "🏢",
  "city": "🌆",
  "country": "🌍",
  "world": "🌍",
  
  // Emotions
  "beautiful": "✨",
  "amazing": "🌟",
  "wonderful": "✨",
  "perfect": "💫",
  "great": "👍",
  "awesome": "🔥",
  "cool": "😎",
  "fun": "😄",
  
  // Miscellaneous
  "new": "🆕",
  "best": "🏆",
  "first": "🥇",
  "winner": "🏆",
  "success": "✅",
  "congratulations": "🎉",
  "birthday": "🎂",
  "christmas": "🎄",
  "holiday": "🎉"
};

// Historical figures and their descriptions
const historicalFigures = {
  "jyotirao phule": {
    title: "Mahatma Jyotirao Phule",
    descriptions: [
      "champion of education and social justice",
      "great social reformer and educator",
      "pioneer of women's education",
      "revolutionary leader for equality"
    ],
    hashtags: ["Education", "SocialJustice", "Equality", "Reform", "Inspiration"],
    emojis: ["🌟", "📚", "⚖️", "✨", "🔥"]
  },
  "savitribai phule": {
    title: "Savitribai Phule",
    descriptions: [
      "first female teacher of India",
      "pioneer of women's education",
      "social reformer and poet",
      "champion of women's rights"
    ],
    hashtags: ["WomenEmpowerment", "Education", "Equality", "Inspiration"],
    emojis: ["📚", "💫", "✨", "🌸", "💪"]
  },
  // Add more historical figures as needed
};

type CaptionTheme = 'social_reformer' | 'educator';

// Enhanced caption templates for historical figures
const captionTemplates: Record<CaptionTheme, string[]> = {
  social_reformer: [
    "Honoring the visionary legacy of {name}! {emoji1} A beacon of {description} whose light continues to guide us. {emoji2} Let's carry forward the torch of progress! {emoji3}",
    "In the footsteps of greatness - {name}! {emoji1} {description} {emoji2} Their vision still illuminates our path forward! {emoji3}",
    "Remembering the revolutionary spirit of {name}! {emoji1} {description} {emoji2} Their dreams are our inspiration! {emoji3}"
  ],
  educator: [
    "Celebrating the enlightened vision of {name}! {emoji1} {description} {emoji2} Knowledge is the path to liberation! {emoji3}",
    "Drawing inspiration from {name}! {emoji1} {description} {emoji2} Education is the most powerful weapon for change! {emoji3}",
    "Paying tribute to {name}! {emoji1} {description} {emoji2} Their educational legacy lives on in every student's dream! {emoji3}"
  ]
};

type TextType = 'quote' | 'announcement' | 'celebration';

// Add text-related templates
const textTemplates: Record<TextType, string[]> = {
  quote: [
    "✨ Wisdom that resonates: '{text}' {emoji1} A powerful reminder that inspires change! {emoji2}",
    "💭 Words that move mountains: '{text}' {emoji1} Let these thoughts guide our journey! {emoji2}",
    "📝 Timeless wisdom: '{text}' {emoji1} Words that continue to inspire generations! {emoji2}"
  ],
  announcement: [
    "🎯 Important Update: '{text}' {emoji1} Mark your calendars and be part of this moment! {emoji2}",
    "📢 Attention: '{text}' {emoji1} Don't miss this significant announcement! {emoji2}",
    "🌟 Exciting News: '{text}' {emoji1} Join us in this remarkable journey! {emoji2}"
  ],
  celebration: [
    "🎉 Celebrating a special moment: '{text}' {emoji1} Join us in this joyous occasion! {emoji2}",
    "✨ Making history: '{text}' {emoji1} A milestone worth celebrating! {emoji2}",
    "🌟 Marking this moment: '{text}' {emoji1} Together in celebration! {emoji2}"
  ]
};

// Add text-specific emoji sets
const textThemeEmojis = {
  quote: ["💭", "✨", "💫", "🌟", "📝"],
  wisdom: ["🎯", "💡", "✨", "📚", "💭"],
  announcement: ["📢", "🎯", "✨", "📝", "💫"],
  celebration: ["🎉", "🌟", "✨", "🎊", "🎯"],
  date: ["📅", "⏰", "🗓️", "⌚", "📆"],
  location: ["📍", "🗺️", "🌍", "🏢", "🎯"]
};

// Function to check if caption is about a historical figure
function identifyHistoricalFigure(caption: string): any {
  const lowerCaption = caption.toLowerCase();
  for (const [key, value] of Object.entries(historicalFigures)) {
    if (lowerCaption.includes(key)) {
      return value;
    }
  }
  return null;
}

// Function to analyze text content
function analyzeTextContent(text: string): {
  type: TextType;
  context: string[];
  emojis: string[];
} {
  const lowerText = text.toLowerCase();
  let type: TextType = 'quote';
  const context: string[] = [];
  const emojis: string[] = [];

  // Detect text type
  if (lowerText.includes('save the date') || 
      lowerText.includes('announcing') || 
      lowerText.includes('attention') ||
      lowerText.includes('update')) {
    type = 'announcement';
    emojis.push(...textThemeEmojis.announcement.slice(0, 2));
  } else if (lowerText.includes('celebrating') || 
             lowerText.includes('congratulations') || 
             lowerText.includes('happy') ||
             lowerText.includes('welcome')) {
    type = 'celebration';
    emojis.push(...textThemeEmojis.celebration.slice(0, 2));
  } else {
    type = 'quote';
    emojis.push(...textThemeEmojis.quote.slice(0, 2));
  }

  // Add context-specific emojis
  if (lowerText.match(/\d{1,2}[:/-]\d{1,2}([:/-]\d{2,4})?/)) {
    context.push('date');
    emojis.push(textThemeEmojis.date[0]);
  }
  if (lowerText.includes('at') && lowerText.match(/\d{1,2}:\d{2}/)) {
    context.push('time');
    emojis.push(textThemeEmojis.date[1]);
  }
  if (lowerText.includes('venue:') || lowerText.includes('location:')) {
    context.push('location');
    emojis.push(textThemeEmojis.location[0]);
  }

  return { type, context, emojis };
}

// Function to create engaging social media caption
function createEngagingCaption(baseCaption: string, figure: any): string {
  // If it's a historical figure, use the historical caption logic
  if (figure) {
    return createHistoricalCaption(baseCaption, figure);
  }

  // Check if the caption contains significant text content
  const textAnalysis = analyzeTextContent(baseCaption);
  if (textAnalysis.type) {
    const templates = textTemplates[textAnalysis.type];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Get unique emojis
    const uniqueEmojis = Array.from(new Set(textAnalysis.emojis)).slice(0, 3);
    while (uniqueEmojis.length < 2) {
      uniqueEmojis.push(textThemeEmojis.wisdom[uniqueEmojis.length]);
    }

    // Create hashtags based on context
    const contextHashtags = textAnalysis.context.map(ctx => `#${ctx.charAt(0).toUpperCase() + ctx.slice(1)}`);
    const typeHashtag = `#${textAnalysis.type.charAt(0).toUpperCase() + textAnalysis.type.slice(1)}`;
    const defaultHashtags = ['#Inspiration', '#Motivation'];
    const finalHashtags = Array.from(new Set([...contextHashtags, typeHashtag, ...defaultHashtags])).slice(0, 5);

    return template
      .replace('{text}', baseCaption)
      .replace('{emoji1}', uniqueEmojis[0])
      .replace('{emoji2}', uniqueEmojis[1])
      + '\n\n'
      + finalHashtags.join(' ');
  }

  // For other images, use the default emoji enhancement
  return enhanceCaptionWithEmojis(baseCaption);
}

// Function to add emojis to caption
function enhanceCaptionWithEmojis(caption: string): string {
  try {
    let enhancedCaption = caption.toLowerCase();
    
    // Add relevant emojis based on keywords
    const emojis: string[] = [];
    
    // Check for keywords in the caption
    for (const [keyword, emoji] of Object.entries(emojiMap)) {
      if (enhancedCaption.includes(keyword)) {
        emojis.push(emoji);
      }
    }
    
    // Add default context emojis if none were found
    if (emojis.length === 0) {
      // Add camera emoji for image context
      emojis.push("📸");
    }
    
    // Limit to max 3 most relevant emojis
    const uniqueEmojis = Array.from(new Set(emojis)).slice(0, 3);
    
    // Add emojis to the caption
    return `${uniqueEmojis.join(" ")} ${caption}`;
  } catch (error) {
    console.error("Error enhancing caption with emojis:", error);
    // Return original caption if emoji enhancement fails
    return caption;
  }
}

// Historical caption creation function
function createHistoricalCaption(baseCaption: string, figure: any): string {
  const themeEmojis = {
    education: ["📚", "✏️", "🎓", "🌱", "💡"],
    social_justice: ["⚖️", "✊", "🌟", "🔥", "💪"],
    reform: ["💫", "🔄", "✨", "🌅", "🎯"],
    leadership: ["🎯", "👥", "🌅", "⭐", "🌟"],
    inspiration: ["💡", "🌟", "✨", "💫", "⚡"]
  };

  const randomDescription = figure.descriptions[Math.floor(Math.random() * figure.descriptions.length)];
  const descriptionLower = randomDescription.toLowerCase();
  
  // Select theme based on description
  let primaryTheme: CaptionTheme = 'social_reformer';
  if (descriptionLower.includes('education') || descriptionLower.includes('teacher')) {
    primaryTheme = 'educator';
  }

  // Select relevant emojis based on context
  const contextEmojis = [];
  
  // Education context
  if (descriptionLower.includes("education") || descriptionLower.includes("teacher")) {
    contextEmojis.push(...themeEmojis.education.slice(0, 2));
  }
  
  // Social justice context
  if (descriptionLower.includes("justice") || descriptionLower.includes("equality")) {
    contextEmojis.push(...themeEmojis.social_justice.slice(0, 2));
  }
  
  // Reform context
  if (descriptionLower.includes("reform") || descriptionLower.includes("revolutionary")) {
    contextEmojis.push(...themeEmojis.reform.slice(0, 2));
  }
  
  // Leadership context
  if (descriptionLower.includes("leader") || descriptionLower.includes("pioneer")) {
    contextEmojis.push(...themeEmojis.leadership.slice(0, 2));
  }
  
  // Always add one inspiration emoji
  contextEmojis.push(themeEmojis.inspiration[0]);
  
  // Get unique emojis and ensure we have exactly 3
  const uniqueEmojis = Array.from(new Set(contextEmojis));
  const finalEmojis = uniqueEmojis.slice(0, 3);
  while (finalEmojis.length < 3) {
    finalEmojis.push(themeEmojis.inspiration[finalEmojis.length]);
  }

  // Select and fill template
  const templates = captionTemplates[primaryTheme];
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  const caption = template
    .replace('{name}', figure.title)
    .replace('{description}', randomDescription)
    .replace('{emoji1}', finalEmojis[0])
    .replace('{emoji2}', finalEmojis[1])
    .replace('{emoji3}', finalEmojis[2]);

  // Add relevant hashtags
  const relevantHashtags = figure.hashtags
    .filter((tag: string) => 
      randomDescription.toLowerCase().includes(tag.toLowerCase()) || 
      tag === "Inspiration" ||
      tag === "Legacy"
    )
    .slice(0, 4)
    .map((tag: string) => `#${tag}`);

  // Add some general hashtags
  const generalHashtags = ['#Legacy', '#Inspiration', '#History'];
  const finalHashtags = Array.from(new Set([...relevantHashtags, ...generalHashtags])).slice(0, 5);

  return `${caption}\n\n${finalHashtags.join(" ")}`;
}

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    console.log("Processing image URL:", imageUrl);

    const azureKey = process.env.AZURE_VISION_KEY;
    const azureEndpoint = process.env.AZURE_VISION_ENDPOINT;

    if (!azureKey || !azureEndpoint) {
      console.error("Azure Vision configuration missing:", { 
        hasKey: !!azureKey, 
        hasEndpoint: !!azureEndpoint 
      });
      return NextResponse.json({ error: "Azure Vision configuration missing" }, { status: 500 });
    }

    // Initialize Azure Computer Vision client
    const computerVisionClient = new ComputerVisionClient(
      new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": azureKey } }),
      azureEndpoint
    );

    console.log("Calling Azure Vision API...");

    // Generate caption using Azure Computer Vision
    const result = await computerVisionClient.describeImage(imageUrl, {
      language: "en",
      maxCandidates: 3,
    });

    console.log("Azure Vision API response:", JSON.stringify(result, null, 2));

    if (!result.captions || result.captions.length === 0) {
      console.error("No captions returned from Azure Vision API");
      return NextResponse.json({ error: "No caption generated" }, { status: 500 });
    }

    // Get the caption with highest confidence
    const bestCaption = result.captions.reduce((prev, current) => {
      const prevConfidence = prev.confidence || 0;
      const currentConfidence = current.confidence || 0;
      return prevConfidence > currentConfidence ? prev : current;
    });

    if (!bestCaption.text) {
      console.error("Invalid caption text in best caption");
      return NextResponse.json({ error: "Invalid caption text" }, { status: 500 });
    }

    // Check if the image is of a historical figure
    const historicalFigure = identifyHistoricalFigure(bestCaption.text);
    
    // Create engaging caption
    const finalCaption = createEngagingCaption(bestCaption.text, historicalFigure);
    console.log("Final caption:", finalCaption);

    return NextResponse.json({ caption: finalCaption });
  } catch (error) {
    console.error("Azure Vision API Error:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("401")) {
        return NextResponse.json({ error: "Azure Vision API authentication failed. Please check your API key." }, { status: 401 });
      } else if (error.message.includes("404")) {
        return NextResponse.json({ error: "Image URL not found or inaccessible" }, { status: 404 });
      } else if (error.message.includes("429")) {
        return NextResponse.json({ error: "Azure Vision API rate limit exceeded" }, { status: 429 });
      }
    }
    
    return NextResponse.json({ error: "Failed to generate caption" }, { status: 500 });
  }
}
