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

// Type definitions for context mappings
type SceneCategory = {
  [key: string]: string[];
};

type ContextMapping = {
  [key: string]: string[];
};

// Enhanced scene classification mapping
const sceneCategories: SceneCategory = {
  indoor: ["living room", "kitchen", "bedroom", "office", "restaurant", "cafe", "gym"],
  outdoor: ["beach", "mountain", "forest", "park", "street", "city", "garden"],
  urban: ["cityscape", "street", "building", "downtown", "market", "subway"],
  nature: ["landscape", "wildlife", "ocean", "sunset", "sunrise", "waterfall"],
  social: ["party", "gathering", "event", "concert", "wedding", "celebration"],
  sports: ["game", "match", "competition", "training", "fitness", "exercise"],
  travel: ["vacation", "adventure", "exploration", "tourist", "landmark"],
  food: ["meal", "cuisine", "restaurant", "cooking", "baking", "recipe"],
  art: ["painting", "sculpture", "exhibition", "gallery", "design", "creative"],
  technology: ["gadget", "device", "innovation", "digital", "computer", "tech"]
};

// Enhanced time of day mapping
const timeContext: ContextMapping = {
  morning: ["dawn", "sunrise", "early", "fresh", "new day"],
  day: ["bright", "sunny", "clear", "lively", "active"],
  evening: ["sunset", "dusk", "golden hour", "twilight", "magic hour"],
  night: ["nighttime", "dark", "moonlit", "starry", "nocturnal"]
};

// Enhanced weather mapping
const weatherContext: ContextMapping = {
  sunny: ["bright", "clear", "sunny", "radiant", "shining"],
  cloudy: ["overcast", "cloudy", "gloomy", "dull", "gray"],
  rainy: ["wet", "rainy", "drizzly", "pouring", "stormy"],
  snowy: ["snowy", "frosty", "wintry", "icy", "cold"],
  foggy: ["misty", "foggy", "hazy", "murky", "obscured"]
};

// Enhanced season mapping
const seasonContext: ContextMapping = {
  spring: ["blooming", "fresh", "renewal", "growth", "awakening"],
  summer: ["hot", "sunny", "vibrant", "lively", "outdoor"],
  autumn: ["fall", "colorful", "crisp", "harvest", "transition"],
  winter: ["cold", "snowy", "frosty", "cozy", "festive"]
};

// Enhanced caption templates for different contexts
const imageCaptionTemplates: Record<ImageContext, string[]> = {
  nature: [
    "Lost in the beauty of {description} ✨",
    "Nature's masterpiece: {description} 🌿",
    "A moment of peace with {description} 🌸",
    "The magic of {description} captured in a frame 📸",
    "Where the soul meets {description} 💫",
    "Nature's poetry: {description} 🌺"
  ],
  urban: [
    "City vibes: {description} 🏙️",
    "Urban stories: {description} 🌆",
    "The rhythm of the city: {description} 🎵",
    "Where dreams meet reality: {description} ✨",
    "City lights, endless nights: {description} 🌃",
    "Urban adventures: {description} 🚶‍♂️"
  ],
  people: [
    "Precious moments: {description} 💖",
    "Memories in the making: {description} 📸",
    "Life's beautiful chapters: {description} 📖",
    "The art of being human: {description} 🎨",
    "Stories untold: {description} ✨",
    "Capturing emotions: {description} 💫"
  ],
  food: [
    "Culinary magic: {description} 🍽️",
    "Taste of happiness: {description} 😋",
    "Foodie adventures: {description} 🍜",
    "Where flavors meet memories: {description} 🍲",
    "A feast for the senses: {description} 🍛",
    "Cooking up memories: {description} 👨‍🍳"
  ],
  art: [
    "Creative soul: {description} 🎨",
    "Art speaks where words fail: {description} ✨",
    "The beauty of expression: {description} 💫",
    "Where imagination meets reality: {description} 🌟",
    "Artistic journey: {description} 🖌️",
    "Colors of emotion: {description} 🎭"
  ],
  sports: [
    "Game on: {description} ⚽",
    "Chasing dreams: {description} 🏃‍♂️",
    "The thrill of victory: {description} 🏆",
    "Where passion meets performance: {description} 💪",
    "Sportsmanship in action: {description} 🤝",
    "The spirit of competition: {description} 🎯"
  ],
  travel: [
    "Wanderlust: {description} ✈️",
    "Exploring the unknown: {description} 🌍",
    "Journey of a lifetime: {description} 🗺️",
    "Where adventure begins: {description} 🏔️",
    "Travel tales: {description} 📸",
    "Discovering new horizons: {description} 🌅"
  ],
  technology: [
    "Future is now: {description} 💻",
    "Innovation in focus: {description} 💡",
    "Tech dreams: {description} 🚀",
    "Digital wonders: {description} 🌐",
    "The power of technology: {description} ⚡",
    "Where ideas meet reality: {description} 💫"
  ],
  default: [
    "Capturing moments: {description} 📸",
    "Life through my lens: {description} ✨",
    "A story in every frame: {description} 🎥",
    "Where memories live: {description} 💫",
    "The art of seeing: {description} 👁️",
    "Moments that matter: {description} ⭐"
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

// Enhanced function to analyze image context
function analyzeImageContext(caption: string, objects: any[], faces: any[]): {
  scene: string;
  mood: string;
  time: string;
  weather: string;
  season: string;
  dominantColors: string[];
  emotions: string[];
} {
  const lowerCaption = caption.toLowerCase();
  let context = {
    scene: 'general',
    mood: 'neutral',
    time: 'day',
    weather: 'clear',
    season: 'summer',
    dominantColors: [] as string[],
    emotions: [] as string[]
  };

  // Scene detection
  for (const [category, keywords] of Object.entries(sceneCategories)) {
    if (keywords.some((keyword: string) => lowerCaption.includes(keyword))) {
      context.scene = category;
      break;
    }
  }

  // Emotion detection from faces
  if (faces && faces.length > 0) {
    const faceEmotions = faces.map(face => face.emotion || 'neutral');
    context.emotions = Array.from(new Set(faceEmotions));
  }

  // Time of day detection
  for (const [time, keywords] of Object.entries(timeContext)) {
    if (keywords.some((keyword: string) => lowerCaption.includes(keyword))) {
      context.time = time;
      break;
    }
  }

  // Weather detection
  for (const [weather, keywords] of Object.entries(weatherContext)) {
    if (keywords.some((keyword: string) => lowerCaption.includes(keyword))) {
      context.weather = weather;
      break;
    }
  }

  // Season detection
  for (const [season, keywords] of Object.entries(seasonContext)) {
    if (keywords.some((keyword: string) => lowerCaption.includes(keyword))) {
      context.season = season;
      break;
    }
  }

  // Color analysis
  if (objects && objects.length > 0) {
    const colorKeywords = objects
      .filter(obj => obj.color)
      .map(obj => obj.color.toLowerCase());
    context.dominantColors = Array.from(new Set(colorKeywords));
  }

  return context;
}

// Enhanced function to create engaging caption
function createEngagingCaption(baseCaption: string, context: {
  scene: string;
  mood: string;
  time: string;
  weather: string;
  season: string;
  dominantColors: string[];
  emotions: string[];
}, figure: any): string {
  // If it's a historical figure, use the historical caption logic
  if (figure) {
    return createHistoricalCaption(baseCaption, figure);
  }

  const lowerCaption = baseCaption.toLowerCase();

  // Get relevant templates based on context
  const templates = imageCaptionTemplates[context.scene as ImageContext] || imageCaptionTemplates.default;
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // Get relevant emojis based on context
  const emojis: string[] = [];
  
  // Add scene-specific emojis
  switch (context.scene) {
    case 'nature':
      emojis.push('🌿', '🌳', '🌸', '🌺', '🌊');
      break;
    case 'urban':
      emojis.push('🏙️', '🌆', '🏢', '🚶‍♂️', '🌃');
      break;
    case 'social':
      emojis.push('👥', '🎉', '✨', '💫', '🌟');
      break;
    case 'sports':
      emojis.push('⚽', '🏆', '💪', '🏃‍♂️', '🎯');
      break;
    case 'travel':
      emojis.push('✈️', '🗺️', '🌍', '🏔️', '🌅');
      break;
    case 'food':
      emojis.push('🍽️', '✨', '😋', '🍜', '🍲');
      break;
    case 'art':
      emojis.push('🎨', '✨', '💫', '🎭', '🖌️');
      break;
    case 'technology':
      emojis.push('💻', '💡', '🚀', '⚡', '🌐');
      break;
    default:
      emojis.push('📸', '✨', '💫', '🌟', '⭐');
  }

  // Add emotion-specific emojis
  if (context.emotions.length > 0) {
    const emotion = context.emotions[0];
    switch (emotion) {
      case 'happy':
        emojis.push('😊', '😄', '😃', '😁', '😆');
        break;
      case 'sad':
        emojis.push('😢', '💔', '😔', '😞', '😭');
        break;
      case 'surprised':
        emojis.push('😮', '😲', '😳', '🤯', '😱');
        break;
      case 'angry':
        emojis.push('😠', '💢', '😡', '🤬', '👿');
        break;
      case 'fearful':
        emojis.push('😨', '😱', '😰', '😥', '😓');
        break;
      case 'disgusted':
        emojis.push('🤢', '🤮', '😷', '🤧', '🤒');
        break;
      case 'neutral':
        emojis.push('😐', '🙂', '😶', '😑', '😌');
        break;
    }
  }

  // Add time-specific emojis
  switch (context.time) {
    case 'morning':
      emojis.push('🌅', '☀️', '🌄', '🌞', '🌤️');
      break;
    case 'day':
      emojis.push('☀️', '🌤️', '🌞', '🌅', '🌄');
      break;
    case 'evening':
      emojis.push('🌆', '🌅', '🌇', '🌃', '🌉');
      break;
    case 'night':
      emojis.push('🌙', '✨', '🌃', '🌠', '🌌');
      break;
  }

  // Add weather-specific emojis
  switch (context.weather) {
    case 'sunny':
      emojis.push('☀️', '🌤️', '🌞', '🌅', '🌄');
      break;
    case 'cloudy':
      emojis.push('☁️', '⛅', '🌥️', '🌦️', '🌤️');
      break;
    case 'rainy':
      emojis.push('🌧️', '☔', '⛈️', '🌦️', '🌂');
      break;
    case 'snowy':
      emojis.push('❄️', '⛄', '🌨️', '☃️', '🏂');
      break;
    case 'foggy':
      emojis.push('🌫️', '☁️', '🌁', '🌫️', '🌫️');
      break;
  }

  // Add season-specific emojis
  switch (context.season) {
    case 'spring':
      emojis.push('🌸', '🌱', '🌷', '🌺', '🌼');
      break;
    case 'summer':
      emojis.push('☀️', '🌊', '🏖️', '🌞', '🍉');
      break;
    case 'autumn':
      emojis.push('🍂', '🍁', '🌾', '🍃', '🍁');
      break;
    case 'winter':
      emojis.push('❄️', '⛄', '☃️', '🌨️', '🎿');
      break;
  }

  // Get unique emojis and limit to 3
  const uniqueEmojis = Array.from(new Set(emojis)).slice(0, 3);

  // Enhance the caption with context
  let enhancedCaption = baseCaption;
  
  // Add time context if not already present
  if (!lowerCaption.includes(context.time)) {
    enhancedCaption = `${context.time} ${enhancedCaption}`;
  }
  
  // Add weather context if not already present
  if (!lowerCaption.includes(context.weather)) {
    enhancedCaption = `${context.weather} ${enhancedCaption}`;
  }
  
  // Add season context if not already present
  if (!lowerCaption.includes(context.season)) {
    enhancedCaption = `${context.season} ${enhancedCaption}`;
  }

  // Fill template
  return template
    .replace('{description}', enhancedCaption)
    .replace('{emoji1}', uniqueEmojis[0] || '✨')
    .replace('{emoji2}', uniqueEmojis[1] || '📸')
    .replace('{emoji3}', uniqueEmojis[2] || '💫');
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

    const azureKey = process.env.AZURE_VISION_KEY;
    const azureEndpoint = process.env.AZURE_VISION_ENDPOINT;

    if (!azureKey || !azureEndpoint) {
      return NextResponse.json({ error: "Azure Vision configuration missing" }, { status: 500 });
    }

    // Initialize Azure Computer Vision client
    const computerVisionClient = new ComputerVisionClient(
      new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": azureKey } }),
      azureEndpoint
    );

    // Enhanced image analysis with only supported features
    const [result, objects, faces] = await Promise.all([
      computerVisionClient.describeImage(imageUrl, {
        language: "en",
        maxCandidates: 5,
      }),
      computerVisionClient.analyzeImage(imageUrl, {
        visualFeatures: ["Objects", "Color", "Description", "Tags"],
      }),
      computerVisionClient.analyzeImage(imageUrl, {
        visualFeatures: ["Faces"],
      }),
    ]);

    if (!result.captions || result.captions.length === 0) {
      return NextResponse.json({ error: "No caption generated" }, { status: 500 });
    }

    // Get the best caption
    const bestCaption = result.captions.reduce((prev, current) => {
      return (prev.confidence || 0) > (current.confidence || 0) ? prev : current;
    });

    // Ensure bestCaption.text exists
    if (!bestCaption.text) {
      return NextResponse.json({ error: "Invalid caption text" }, { status: 500 });
    }

    // Analyze image context
    const context = analyzeImageContext(
      bestCaption.text,
      objects.objects || [],
      faces.faces || []
    );

    // Check if the image is of a historical figure
    const historicalFigure = identifyHistoricalFigure(bestCaption.text);
    
    // Create engaging caption with enhanced context awareness
    const finalCaption = createEngagingCaption(bestCaption.text, context, historicalFigure);

    return NextResponse.json({ 
      caption: finalCaption,
      context: {
        scene: context.scene,
        mood: context.mood,
        time: context.time,
        weather: context.weather,
        season: context.season,
        dominantColors: context.dominantColors,
        emotions: context.emotions
      }
    });
  } catch (error) {
    console.error("Azure Vision API Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
