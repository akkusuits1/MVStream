// ============================================
// Privacy Policy Page
// ============================================

import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-2">
        <Shield size={28} className="text-brand-primary" />
        <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
      </div>
      <p className="text-white/40 text-sm mb-8">Last updated: January 1, 2024</p>

      <div className="space-y-8 text-white/70 leading-relaxed">
        <Section title="1. Information We Collect">
          We collect information you provide directly, such as your account details (name, email),
          and usage data including pages visited, search queries, and content interactions.
        </Section>

        <Section title="2. How We Use Your Information">
          We use the information to provide and improve our services, personalize your experience,
          communicate with you, and ensure the security of our platform.
        </Section>

        <Section title="3. Cookies and Tracking">
          We use cookies and similar technologies to maintain your session, remember your preferences,
          and analyze usage patterns. You can control cookies through your browser settings.
        </Section>

        <Section title="4. Data Sharing">
          We do not sell your personal information to third parties. We may share data with service
          providers who assist in operating our platform, subject to confidentiality obligations.
        </Section>

        <Section title="5. Data Security">
          We implement industry-standard security measures to protect your personal information.
          However, no method of transmission over the Internet is 100% secure.
        </Section>

        <Section title="6. Your Rights">
          You have the right to access, correct, or delete your personal data. You can manage your
          information through your account settings or by contacting us.
        </Section>

        <Section title="7. Children's Privacy">
          Our services are not intended for users under 13. We do not knowingly collect personal
          information from children under 13.
        </Section>

        <Section title="8. Changes to This Policy">
          We may update this policy from time to time. We will notify you of any changes by posting
          the new policy on this page with an updated effective date.
        </Section>

        <Section title="9. Contact Us">
          If you have any questions about this Privacy Policy, please contact us through our
          help center.
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
