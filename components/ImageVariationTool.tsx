"use client";

import { useState, useRef } from 'react';
import { Upload, Wand2, RefreshCw, AlertCircle, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { processImage } from '@/lib/image-processing';
import { openai, isValidApiKey } from '@/lib/openai';
import CameraCapture from './CameraCapture';

const TARGET_SIZE = 1024;

export default function ImageVariationTool() {
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedImageBlob, setSelectedImageBlob] = useState<Blob | null>(null);
  const [variations, setVariations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const processedImageBlob = await processImage(reader.result as string, TARGET_SIZE);
          setSelectedImageBlob(processedImageBlob);
          setSelectedImageUrl(URL.createObjectURL(processedImageBlob));
          setError(null);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setError('Error processing image. Please try again.');
      }
    }
  };

  const handleCameraCapture = (blob: Blob, url: string) => {
    setSelectedImageBlob(blob);
    setSelectedImageUrl(url);
    setError(null);
  };

  const generateVariations = async () => {
    if (!selectedImageBlob) return;

    if (!isValidApiKey()) {
      setError(
        'Please configure your OpenAI API key. Add it to your environment variables as NEXT_PUBLIC_OPENAI_API_KEY.'
      );
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const imageFile = new File([selectedImageBlob], "image.png", { type: "image/png" });
      
      const result = await openai.images.createVariation({
        image: imageFile,
        n: 4,
        size: "1024x1024",
      });

      if (!result.data || result.data.length === 0) {
        throw new Error('No variations were generated. Please try again.');
      }

      setVariations(result.data.map(img => img.url || '').filter(Boolean));
    } catch (error: any) {
      console.error('OpenAI API Error:', error);
      
      if (error.status === 401) {
        setError('Invalid API key. Please check your OpenAI API key configuration.');
      } else if (error.status === 429) {
        setError('Rate limit exceeded. Please try again later.');
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Error generating variations. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
          AI Image Variations Generator
        </h1>
        
        <Card className="p-6 bg-gray-900 border-emerald-500/20">
          <div className="space-y-6">
            {!isValidApiKey() && (
              <Alert className="bg-yellow-900/20 border-yellow-500/20 text-yellow-400">
                <KeyRound className="h-4 w-4" />
                <span>OpenAI API key not configured. Add your API key to use this tool.</span>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-500/20">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
              <CameraCapture 
                onCapture={handleCameraCapture}
                onError={setError}
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            {selectedImageUrl && (
              <div className="space-y-4">
                <div className="relative w-full aspect-square max-w-2xl mx-auto overflow-hidden rounded-lg">
                  <img
                    src={selectedImageUrl}
                    alt="Selected"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex gap-4 items-center justify-center">
                  <Button
                    onClick={generateVariations}
                    disabled={loading || !isValidApiKey()}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {loading ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Generate Variations
                  </Button>
                </div>
              </div>
            )}

            {variations.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-8">
                {variations.map((variation, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform duration-200 cursor-pointer"
                  >
                    <img
                      src={variation}
                      alt={`Variation ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}