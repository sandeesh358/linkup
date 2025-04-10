import CaptionTester from "@/components/CaptionTester";

export const metadata = {
  title: "Test Caption Generator",
  description: "Test the Azure Vision API caption generator",
};

export default function TestCaptionPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Test Caption Generator</h1>
      <CaptionTester />
    </div>
  );
} 