"use client";

import { useEffect, useRef } from 'react';

const images = [
  'photo-1661956602116-aa6865609028',
  'photo-1661956602139-ec64991b8b16',
  'photo-1665673271314-d47f26067498',
  'photo-1666091863721-54331a5db52d',
].map((id) => `https://images.unsplash.com/${id}?w=200&h=200&q=80`);

export default function FloatingImages() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = container.children;
    const animateElement = (element: Element) => {
      const x = Math.random() * 100 - 50;
      const y = Math.random() * 100 - 50;
      const duration = 15 + Math.random() * 10;
      const scale = 0.8 + Math.random() * 0.4;
      const rotation = Math.random() * 360;

      (element as HTMLElement).style.transition = `transform ${duration}s ease-in-out`;
      (element as HTMLElement).style.transform = 
        `translate(${x}vh, ${y}vh) rotate(${rotation}deg) scale(${scale})`;
    };

    Array.from(elements).forEach((element) => {
      animateElement(element);
      setInterval(() => animateElement(element), 15000);
    });
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 -z-10 overflow-hidden opacity-20"
    >
      {images.map((src, index) => (
        <img
          key={index}
          src={src}
          alt=""
          className="absolute w-32 h-32 object-cover rounded-lg"
          style={{
            left: `${25 * (index % 4)}%`,
            top: `${25 * Math.floor(index / 4)}%`,
          }}
        />
      ))}
    </div>
  );
}