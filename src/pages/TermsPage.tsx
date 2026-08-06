import { Link } from 'react-router-dom';
import { useSeoMeta } from '@/hooks/useSeoMeta';

export default function TermsPage() {
  useSeoMeta({
    title: 'Terms & Conditions',
    description: 'Read the MVStream terms and conditions governing your use of our free streaming platform.',
    url: '/terms',
  });
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Terms & Conditions</h1>
      <p className="text-white/60 mb-8">Last updated: August 2, 2026</p>

      <div className="space-y-6 text-white/70 leading-relaxed text-sm">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing and using MVStream (the "Service"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">2. Use of the Service</h2>
          <p>
            You agree to use the Service only for lawful purposes and in accordance with these Terms. You are responsible for your use of the Service and for any consequences arising from such use.
          </p>
          <p className="mt-2">You agree not to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
            <li>Use the Service for any illegal purpose</li>
            <li>Attempt to gain unauthorized access to any portion of the Service</li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>Use automated systems to access the Service without permission</li>
            <li>Redistribute or resell content from the Service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">3. Intellectual Property</h2>
          <p>
            All content on the Service, including but not limited to text, graphics, logos, images, audio, video, and software, is the property of MVStream or its licensors and is protected by copyright, trademark, and other intellectual property laws.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">4. User Accounts</h2>
          <p>
            When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of these Terms. You are responsible for safeguarding your account credentials and for all activities that occur under your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">5. Content</h2>
          <p>
            The Service provides access to content from various third-party sources. MVStream does not host, upload, or store any video content on its own servers. All video content is served through third-party streaming providers. We do not guarantee the accuracy, completeness, or quality of any content available through the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">6. Privacy</h2>
          <p>
            Your use of the Service is also governed by our{' '}
            <Link to="/privacy" className="text-brand-primary hover:underline">Privacy Policy</Link>.
            By using the Service, you consent to the collection and use of information as described in the Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, MVStream shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">8. Disclaimer of Warranties</h2>
          <p>
            The Service is provided "as is" and "as available" without warranties of any kind, whether express or implied. We do not warrant that the Service will be uninterrupted, timely, secure, or error-free.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">9. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of the Service after changes are posted constitutes your acceptance of the modified Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">10. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">11. Contact</h2>
          <p>
            If you have any questions about these Terms, please{' '}
            <Link to="/contact" className="text-brand-primary hover:underline">contact us</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
