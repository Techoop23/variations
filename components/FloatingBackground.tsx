"use client";

import FloatingImage from './FloatingImage';

const images = [
  'photo-1661956602116-aa6865609028',
  'photo-1661956602139-ec64991b8b16',
  'photo-1665673271314-d47f26067498',
  'photo-1666091863721-54331a5db52d',
].map((id) => `https://images.unsplash.com/${id}?w=200&h=200&q=80`);

export default function FloatingBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden opacity-20">
      {images.map((src, index) => (
        <FloatingImage
          key={index}
          src={src}
          index={index}
          total={images.length}
        />
      ))}
    </div>
  );
}