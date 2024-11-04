import ImageVariationTool from '@/components/ImageVariationTool';
import FloatingBackground from '@/components/FloatingBackground';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-emerald-400">
      <FloatingBackground />
      <ImageVariationTool />
    </main>
  );
}