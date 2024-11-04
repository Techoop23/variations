"use client";

import { useState, useRef, useEffect } from 'react';
import { Camera, FlipHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert } from '@/components/ui/alert';

interface CameraCaptureProps {
  onCapture: (blob: Blob, url: string) => void;
  onError: (error: string) => void;
}

export default function CameraCapture({ onCapture, onError }: CameraCaptureProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setShowCamera(false);
    }
  };

  const getMobileInstructions = () => {
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      return "On iOS:\n1. Open Settings\n2. Scroll down to Safari\n3. Tap Camera\n4. Select 'Allow'";
    }
    if (/Android/i.test(navigator.userAgent)) {
      return "On Android:\n1. Open Settings\n2. Tap Privacy\n3. Tap Permission manager\n4. Tap Camera\n5. Find this website and allow camera access";
    }
    return "Please enable camera access in your device settings.";
  };

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        stopCamera();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1024 },
          height: { ideal: 1024 },
          aspectRatio: 1,
        }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
        setShowPermissionDialog(false);
      }
    } catch (err) {
      console.error('Camera error:', err);
      if ((err as Error).name === 'NotAllowedError' || (err as Error).name === 'PermissionDeniedError') {
        setShowPermissionDialog(true);
      } else if ((err as Error).name === 'NotFoundError') {
        onError('No camera found. Please ensure your device has a working camera.');
      } else if ((err as Error).name === 'NotReadableError') {
        onError('Camera is in use by another application. Please close other apps using the camera.');
      } else {
        onError('Error accessing camera. Please check your device settings.');
      }
    }
  };

  const switchCamera = async () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    await startCamera();
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d')!;

      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(
        videoRef.current,
        0, 0, canvas.width, canvas.height
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            onCapture(blob, URL.createObjectURL(blob));
            stopCamera();
          }
        },
        'image/png',
        1
      );
    } catch (err) {
      onError('Error capturing photo. Please try again.');
    }
  };

  return (
    <>
      <Button
        onClick={startCamera}
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        <Camera className="mr-2 h-4 w-4" />
        Take Photo
      </Button>

      {showCamera && (
        <div className="relative mx-auto max-w-2xl">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full aspect-square rounded-lg bg-gray-800"
            style={{
              transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
            }}
          />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
            {isMobile && (
              <Button
                onClick={switchCamera}
                className="bg-emerald-600/80 hover:bg-emerald-700"
              >
                <FlipHorizontal className="h-4 w-4" />
              </Button>
            )}
            <Button
              onClick={capturePhoto}
              className="bg-emerald-600/80 hover:bg-emerald-700"
            >
              Capture
            </Button>
          </div>
        </div>
      )}

      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent className="bg-gray-900 border-emerald-500/20">
          <DialogHeader>
            <DialogTitle className="text-emerald-400">Camera Permission Required</DialogTitle>
            <DialogDescription className="text-gray-400 whitespace-pre-line">
              {getMobileInstructions()}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4">
            <Button
              onClick={() => setShowPermissionDialog(false)}
              variant="outline"
              className="border-emerald-500/20 hover:bg-emerald-950"
            >
              Cancel
            </Button>
            <Button
              onClick={startCamera}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Try Again
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}