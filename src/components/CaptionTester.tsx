"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Loader2Icon, RefreshCwIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function CaptionTester() {
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const testAzureConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/test-azure");
      const data = await response.json();
      setTestResult(data);
      
      if (data.success) {
        toast.success("Azure Vision API is working correctly!");
      } else {
        toast.error(data.error || "Failed to test Azure Vision API");
      }
    } catch (error) {
      console.error("Error testing Azure Vision API:", error);
      toast.error("Error testing Azure Vision API");
    } finally {
      setIsLoading(false);
    }
  };

  const generateCaption = async () => {
    if (!imageUrl) {
      toast.error("Please enter an image URL");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/generateCaption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });

      const data = await response.json();
      
      if (data.caption) {
        setCaption(data.caption);
        toast.success("Caption generated successfully!");
      } else {
        toast.error(data.error || "Failed to generate caption");
      }
    } catch (error) {
      console.error("Error generating caption:", error);
      toast.error("Error generating caption");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold">Caption Generator Tester</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Test Azure Configuration</h3>
          <Button 
            onClick={testAzureConfig} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <RefreshCwIcon className="mr-2 h-4 w-4" />
                Test Azure Vision API
              </>
            )}
          </Button>
          
          {testResult && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <pre className="text-xs overflow-auto max-h-40">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Generate Caption</h3>
          <Input
            placeholder="Enter image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={isLoading}
          />
          <Button 
            onClick={generateCaption} 
            disabled={isLoading || !imageUrl}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Caption"
            )}
          </Button>
        </div>
        
        {caption && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Generated Caption</h3>
            <Textarea
              value={caption}
              readOnly
              className="min-h-[100px]"
            />
          </div>
        )}
      </div>
    </div>
  );
} 