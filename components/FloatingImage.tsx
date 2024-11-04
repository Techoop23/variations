"use client";

import { useEffect, useRef } from 'react';

interface FloatingImageProps {
  src: string;
  index: number;
  total: number;
}

export default function FloatingImage({ src, index, total }: FloatingImageProps) {
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const element = imageRef.current;
    if (!element) return;

    const animate = () => {
      const x = Math.random() * 100 - 50;
      const y = Math.random() * 100 - 50;
      const duration = 15 + Math.random() * 10;
      const scale = 0.8 + Math.random() * 0.4;
      const rotation = Math.random() * 360;

      element.style.transition = `transform ${duration}s ease-in-out`;
      element.style.transform = 
        `translate(${x}vh, ${y}vh) rotate(${rotation}deg) scale(${scale})`;
    };

    animate();
    const interval = setInterval(animate, 15000);

    return () => clearInterval(interval);
  }, []);

  const gridPosition = {
    left: `${25 * (index % 4)}%`,
    top: `${25 * Math.floor(index / 4)}%`,
  };

  return (
    <img
      ref={imageRef}
      src={src}
      alt=""
      className="absolute w-32 h-32 object-cover rounded-lg"
      style={gridPosition}
    />
  );
}