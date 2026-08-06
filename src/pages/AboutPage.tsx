// ============================================
// About Page
// ============================================

import { Film } from 'lucide-react';
import { useSeoMeta } from '@/hooks/useSeoMeta';

export default function AboutPage() {
  useSeoMeta({
    title: 'About',
    description: 'Learn about MVStream - a free streaming platform for movies and web series. Browse thousands of titles across multiple genres.',
    url: '/about',
  });
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-2">
        <Film size={28} className="text-brand-primary" />
        <h1 className="text-3xl font-bold text-white">About MVStream</h1>
      </div>
      <p className="text-white/40 text-sm mb-8">Your destination for movies and series</p>

      <div className="space-y-8 text-white/70 leading-relaxed">
        <Section title="What is MVStream?">
          MVStream is a free streaming platform where you can watch movies and web series online.
          We aggregate content from various sources to provide you with a wide selection of entertainment.
        </Section>

        <Section title="Our Mission">
          We aim to make entertainment accessible to everyone. Our platform is designed with a clean,
          modern interface that works seamlessly across all your devices.
        </Section>

        <Section title="Features">
          Browse thousands of movies and web series across multiple genres. Create your profile,
          track your watch history, and discover new content tailored to your preferences.
        </Section>

        <Section title="Disclaimer">
          MVStream does not store any files on our server. All content is provided by
          non-affiliated third parties. All trademarks and copyrights belong to their respective owners.
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
      <p>{children}</p>
    </div>
  );
}
