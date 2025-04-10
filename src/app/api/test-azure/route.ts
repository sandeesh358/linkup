import { NextRequest, NextResponse } from "next/server";
import { ComputerVisionClient } from "@azure/cognitiveservices-computervision";
import { ApiKeyCredentials } from "@azure/ms-rest-js";

export async function GET(req: NextRequest) {
  try {
    const azureKey = process.env.AZURE_VISION_KEY;
    const azureEndpoint = process.env.AZURE_VISION_ENDPOINT;

    if (!azureKey || !azureEndpoint) {
      return NextResponse.json({ 
        error: "Azure Vision configuration missing", 
        hasKey: !!azureKey, 
        hasEndpoint: !!azureEndpoint 
      }, { status: 500 });
    }

    // Initialize Azure Computer Vision client
    const computerVisionClient = new ComputerVisionClient(
      new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": azureKey } }),
      azureEndpoint
    );

    // Test with a sample image URL
    const testImageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SNice.svg/1200px-SNice.svg.png";
    
    console.log("Testing Azure Vision API with sample image...");
    
    // Try to analyze the image
    const result = await computerVisionClient.describeImage(testImageUrl, {
      language: "en",
      maxCandidates: 1,
    });

    return NextResponse.json({ 
      success: true, 
      message: "Azure Vision API is working correctly",
      sampleResult: result
    });
  } catch (error) {
    console.error("Azure Vision API Test Error:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("401")) {
        return NextResponse.json({ error: "Azure Vision API authentication failed. Please check your API key." }, { status: 401 });
      } else if (error.message.includes("404")) {
        return NextResponse.json({ error: "Test image URL not found or inaccessible" }, { status: 404 });
      } else if (error.message.includes("429")) {
        return NextResponse.json({ error: "Azure Vision API rate limit exceeded" }, { status: 429 });
      }
    }
    
    return NextResponse.json({ 
      error: "Failed to test Azure Vision API", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 