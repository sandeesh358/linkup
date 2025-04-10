import { NextRequest, NextResponse } from "next/server";
import { ComputerVisionClient } from "@azure/cognitiveservices-computervision";
import { ApiKeyCredentials } from "@azure/ms-rest-js";

// Enhanced emoji mapping for more detailed image descriptions
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
  "holiday": "🎉",
  
  // Additional detailed categories
  "business": "💼",
  "work": "💼",
  "office": "🏢",
  "meeting": "👥",
  "presentation": "📊",
  "technology": "💻",
  "innovation": "💡",
  "research": "🔬",
  "science": "🔬",
  "medical": "🏥",
  "health": "❤️",
  "fitness": "💪",
  "yoga": "🧘",
  "meditation": "🧘‍♂️",
  "wildlife": "🦁",
  "landscape": "🏞️",
  "architecture": "🏛️",
  "concert": "🎪",
  "festival": "🎪",
  "wedding": "💒",
  "graduation": "🎓",
  "school": "🏫",
  "university": "🎓",
  "football": "⚽",
  "basketball": "🏀",
  "tennis": "🎾",
  "golf": "⛳",
  "swimming": "🏊",
  "running": "🏃",
  "cycling": "🚴",
  "adventure": "🗺️",
  "hiking": "🥾",
  "camping": "⛺",
  "sunset": "🌅",
  "sunrise": "🌄",
  "street": "🏙️",
  "restaurant": "🍽️",
  "cooking": "👨‍🍳",
  "baking": "🥖",
  "wine": "🍷",
  "cocktail": "🍸",
  "fashion": "👗",
  "style": "💅",
  "beauty": "💄",
  "makeup": "💄",
  "jewelry": "💍",
  "accessories": "👜",
  "interior": "🏠",
  "decor": "🏠",
  "furniture": "🪑",
  "plants": "🌱",
  "pets": "🐾",
  "dogs": "🐕",
  "cats": "🐱",
  "birds": "🐦",
  "animals": "🐘",
  "children": "👶",
  "friends": "👥",
  "group": "👥",
  "team": "👥",
  "community": "🤝",
  "social": "🤝",
  "charity": "🤝",
  "volunteer": "🤝",
  "environment": "🌍",
  "climate": "🌡️",
  "sustainability": "♻️",
  "recycling": "♻️",
  "green": "🌿",
  "eco": "🌱",
  "weather": "🌤️",
  "storm": "⛈️",
  "sunny": "☀️",
  "hot": "🔥"
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
type ImageContext = 'nature' | 'urban' | 'people' | 'food' | 'art' | 'sports' | 'travel' | 'technology' | 'default';

// Enhanced caption templates for historical figures
const captionTemplates: Record<CaptionTheme, string[]> = {
  social_reformer: [
    "Honoring the visionary legacy of {name}! {emoji1} A beacon of {description} {emoji2} {emoji3}",
    "In the footsteps of greatness - {name}! {emoji1} {description} {emoji2} {emoji3}",
    "Remembering the revolutionary spirit of {name}! {emoji1} {description} {emoji2} {emoji3}"
  ],
  educator: [
    "Celebrating the enlightened vision of {name}! {emoji1} {description} {emoji2} {emoji3}",
    "Drawing inspiration from {name}! {emoji1} {description} {emoji2} {emoji3}",
    "Paying tribute to {name}! {emoji1} {description} {emoji2} {emoji3}"
  ]
};

type TextType = 'quote' | 'announcement' | 'celebration';

// Add text-related templates
const textTemplates: Record<TextType, string[]> = {
  quote: [
    "{emoji1} {text} {emoji2}",
    "{emoji1} {text} {emoji2}",
    "{emoji1} {text} {emoji2}"
  ],
  announcement: [
    "{emoji1} {text} {emoji2}",
    "{emoji1} {text} {emoji2}",
    "{emoji1} {text} {emoji2}"
  ],
  celebration: [
    "{emoji1} {text} {emoji2}",
    "{emoji1} {text} {emoji2}",
    "{emoji1} {text} {emoji2}"
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

// Enhanced caption templates for different contexts
const imageCaptionTemplates: Record<ImageContext, string[]> = {
  nature: [
    "Capturing the breathtaking beauty of {description} {emoji1} {emoji2}",
    "Nature's masterpiece: {description} {emoji1} {emoji2}",
    "In awe of {description} {emoji1} {emoji2}",
    "Mother Nature at her finest: {description} {emoji1} {emoji2}",
    "A moment of serenity with {description} {emoji1} {emoji2}",
    "The natural world never ceases to amaze: {description} {emoji1} {emoji2}"
  ],
  urban: [
    "City vibes: {description} {emoji1} {emoji2}",
    "Urban exploration: {description} {emoji1} {emoji2}",
    "City life captured: {description} {emoji1} {emoji2}",
    "Metropolitan moments: {description} {emoji1} {emoji2}",
    "The heartbeat of the city: {description} {emoji1} {emoji2}",
    "Urban landscape showcasing {description} {emoji1} {emoji2}"
  ],
  people: [
    "Capturing precious moments: {description} {emoji1} {emoji2}",
    "Life's beautiful moments: {description} {emoji1} {emoji2}",
    "Memories in the making: {description} {emoji1} {emoji2}",
    "Special moments: {description} {emoji1} {emoji2}",
    "The human connection: {description} {emoji1} {emoji2}",
    "Stories told through {description} {emoji1} {emoji2}"
  ],
  food: [
    "Culinary delights: {description} {emoji1} {emoji2}",
    "Foodie moments: {description} {emoji1} {emoji2}",
    "Taste of perfection: {description} {emoji1} {emoji2}",
    "Delicious discoveries: {description} {emoji1} {emoji2}",
    "A feast for the eyes: {description} {emoji1} {emoji2}",
    "Gastronomic excellence: {description} {emoji1} {emoji2}"
  ],
  art: [
    "Artistic vision: {description} {emoji1} {emoji2}",
    "Creative expression: {description} {emoji1} {emoji2}",
    "Art in focus: {description} {emoji1} {emoji2}",
    "Visual storytelling: {description} {emoji1} {emoji2}",
    "A masterpiece revealing {description} {emoji1} {emoji2}",
    "The artist's perspective: {description} {emoji1} {emoji2}"
  ],
  sports: [
    "Action captured: {description} {emoji1} {emoji2}",
    "Sports moments: {description} {emoji1} {emoji2}",
    "Game on: {description} {emoji1} {emoji2}",
    "Athletic excellence: {description} {emoji1} {emoji2}",
    "The thrill of competition: {description} {emoji1} {emoji2}",
    "Championship moments: {description} {emoji1} {emoji2}"
  ],
  travel: [
    "Adventure awaits: {description} {emoji1} {emoji2}",
    "Wanderlust moments: {description} {emoji1} {emoji2}",
    "Exploring: {description} {emoji1} {emoji2}",
    "Travel tales: {description} {emoji1} {emoji2}",
    "Journey to discovery: {description} {emoji1} {emoji2}",
    "Destination unknown: {description} {emoji1} {emoji2}"
  ],
  technology: [
    "Tech innovation: {description} {emoji1} {emoji2}",
    "Digital world: {description} {emoji1} {emoji2}",
    "Future is now: {description} {emoji1} {emoji2}",
    "Tech spotlight: {description} {emoji1} {emoji2}",
    "Cutting-edge technology: {description} {emoji1} {emoji2}",
    "Innovation at its finest: {description} {emoji1} {emoji2}"
  ],
  default: [
    "Capturing the moment: {description} {emoji1} {emoji2}",
    "Picture perfect: {description} {emoji1} {emoji2}",
    "In focus: {description} {emoji1} {emoji2}",
    "Frame worthy: {description} {emoji1} {emoji2}",
    "A snapshot of {description} {emoji1} {emoji2}",
    "Through the lens: {description} {emoji1} {emoji2}"
  ]
};

// Function to detect image context
function detectImageContext(caption: string): ImageContext {
  const lowerCaption = caption.toLowerCase();
  
  if (lowerCaption.match(/\b(nature|outdoor|landscape|mountain|beach|ocean|forest|garden|park)\b/)) {
    return 'nature';
  }
  if (lowerCaption.match(/\b(city|street|building|urban|architecture|downtown|metropolitan)\b/)) {
    return 'urban';
  }
  if (lowerCaption.match(/\b(person|people|man|woman|child|family|group|crowd)\b/)) {
    return 'people';
  }
  if (lowerCaption.match(/\b(food|meal|restaurant|cuisine|dish|cooking|baking)\b/)) {
    return 'food';
  }
  if (lowerCaption.match(/\b(art|painting|sculpture|design|creative|artistic)\b/)) {
    return 'art';
  }
  if (lowerCaption.match(/\b(sport|game|athlete|player|team|competition|match)\b/)) {
    return 'sports';
  }
  if (lowerCaption.match(/\b(travel|adventure|explore|journey|destination|trip)\b/)) {
    return 'travel';
  }
  if (lowerCaption.match(/\b(technology|tech|digital|computer|device|innovation)\b/)) {
    return 'technology';
  }
  
  return 'default';
}

// Enhanced function to create engaging caption
function createEngagingCaption(baseCaption: string, figure: any): string {
  // If it's a historical figure, use the historical caption logic
  if (figure) {
    return createHistoricalCaption(baseCaption, figure);
  }

  // Detect image context
  const context = detectImageContext(baseCaption);
  
  // Get relevant templates
  const templates = imageCaptionTemplates[context];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
  // Get relevant emojis
    const emojis: string[] = [];
  const lowerCaption = baseCaption.toLowerCase();
    
  // Add context-specific emojis
    for (const [keyword, emoji] of Object.entries(emojiMap)) {
    if (lowerCaption.includes(keyword)) {
        emojis.push(emoji);
      }
    }
    
    // Add default context emojis if none were found
    if (emojis.length === 0) {
    switch (context) {
      case 'nature':
        emojis.push('🌿', '🌳');
        break;
      case 'urban':
        emojis.push('🏙️', '🌆');
        break;
      case 'people':
        emojis.push('👥', '✨');
        break;
      case 'food':
        emojis.push('🍽️', '✨');
        break;
      case 'art':
        emojis.push('🎨', '✨');
        break;
      case 'sports':
        emojis.push('⚽', '🏆');
        break;
      case 'travel':
        emojis.push('✈️', '🗺️');
        break;
      case 'technology':
        emojis.push('💻', '💡');
        break;
      default:
        emojis.push('📸', '✨');
    }
    }
    
    // Limit to max 2 most relevant emojis
    const uniqueEmojis = Array.from(new Set(emojis)).slice(0, 2);
    
  // Enhance the caption with more details
  let enhancedCaption = baseCaption;
  
  // Add descriptive adjectives based on context
  if (context === 'nature' && !lowerCaption.includes('beautiful') && !lowerCaption.includes('stunning')) {
    enhancedCaption = `the beautiful ${enhancedCaption}`;
  } else if (context === 'food' && !lowerCaption.includes('delicious') && !lowerCaption.includes('tasty')) {
    enhancedCaption = `the delicious ${enhancedCaption}`;
  } else if (context === 'people' && !lowerCaption.includes('happy') && !lowerCaption.includes('smiling')) {
    enhancedCaption = `the happy ${enhancedCaption}`;
  } else if (context === 'urban' && !lowerCaption.includes('busy') && !lowerCaption.includes('vibrant')) {
    enhancedCaption = `the vibrant ${enhancedCaption}`;
  }
  
  // Fill template
  return template
    .replace('{description}', enhancedCaption)
    .replace('{emoji1}', uniqueEmojis[0] || '✨')
    .replace('{emoji2}', uniqueEmojis[1] || '📸');
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
  
  // Get unique emojis and ensure we have exactly 3
  const uniqueEmojis = Array.from(new Set(contextEmojis));
  const finalEmojis = uniqueEmojis.slice(0, 3);
  while (finalEmojis.length < 3) {
    finalEmojis.push(themeEmojis.education[finalEmojis.length]);
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

  return caption;
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

    // Generate caption using Azure Computer Vision with increased maxCandidates
    const result = await computerVisionClient.describeImage(imageUrl, {
      language: "en",
      maxCandidates: 5, // Increased from 3 to 5 for better caption selection
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

    // Get additional details from other captions to enhance the description
    let enhancedDescription = bestCaption.text;
    
    // If we have multiple captions, combine details from them
    if (result.captions.length > 1) {
      // Sort captions by confidence
      const sortedCaptions = [...result.captions].sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
      
      // Get unique details from other captions
      const uniqueDetails = new Set<string>();
      
      // Skip the best caption as we already have it
      for (let i = 1; i < Math.min(3, sortedCaptions.length); i++) {
        const caption = sortedCaptions[i];
        if (caption.text && caption.confidence && caption.confidence > 0.5) {
          // Extract nouns and adjectives that might add detail
          const words = caption.text.split(' ');
          for (const word of words) {
            // Skip common words and words already in the best caption
            if (word.length > 4 && 
                !enhancedDescription.toLowerCase().includes(word.toLowerCase()) &&
                !['the', 'and', 'with', 'that', 'this', 'from', 'have', 'what', 'some', 'there'].includes(word.toLowerCase())) {
              uniqueDetails.add(word);
            }
          }
        }
      }
      
      // Add unique details to the description if we found any
      if (uniqueDetails.size > 0) {
        const detailsArray = Array.from(uniqueDetails).slice(0, 3);
        enhancedDescription += `, featuring ${detailsArray.join(', ')}`;
      }
    }

    // Check if the image is of a historical figure
    const historicalFigure = identifyHistoricalFigure(enhancedDescription);
    
    // Create engaging caption with enhanced context awareness
    const finalCaption = createEngagingCaption(enhancedDescription, historicalFigure);
    console.log("Final caption:", finalCaption);

    return NextResponse.json({ caption: finalCaption });
  } catch (error) {
    console.error("Azure Vision API Error:", error);
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
