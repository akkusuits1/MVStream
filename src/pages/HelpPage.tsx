// ============================================
// Help Page — FAQ & Support
// ============================================

import { HelpCircle } from 'lucide-react';

const faqItems = [
  {
    q: 'How do I search for content?',
    a: 'Use the search icon in the header or navigate to the Search page. You can search by title or genre.',
  },
  {
    q: 'How do I play a movie or series?',
    a: 'Click on any movie or series card to view its details, then click the Play button to start watching.',
  },
  {
    q: 'Can I create an account?',
    a: 'Yes! You can sign in using Google authentication from the profile menu in the header.',
  },
  {
    q: 'How do I report a broken link?',
    a: 'On any content details page, look for the Report button to submit a broken link report.',
  },
  {
    q: 'Is MVStream free?',
    a: 'Yes, MVStream is completely free to use. No subscription required.',
  },
  {
    q: 'What devices are supported?',
    a: 'MVStream works on all modern browsers across desktop, tablet, and mobile devices.',
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-2">
        <HelpCircle size={28} className="text-brand-primary" />
        <h1 className="text-3xl font-bold text-white">Help Center</h1>
      </div>
      <p className="text-white/40 text-sm mb-8">Frequently asked questions and support</p>

      <div className="space-y-6">
        {faqItems.map((item) => (
          <div key={item.q} className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-2">{item.q}</h3>
            <p className="text-white/60 text-sm leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <p className="text-white/40 text-sm">
          Still need help?{' '}
          <a href="mailto:support@mvstream.com" className="text-brand-primary hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
