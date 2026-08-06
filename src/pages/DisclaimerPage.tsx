import { Link } from 'react-router-dom';
import { useSeoMeta } from '@/hooks/useSeoMeta';

export default function DisclaimerPage() {
  useSeoMeta({
    title: 'Disclaimer',
    description: 'Read the MVStream disclaimer regarding content ownership, external links, and limitation of liability.',
    url: '/disclaimer',
  });
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Disclaimer</h1>
      <p className="text-white/60 mb-8">Last updated: August 2, 2026</p>

      <div className="space-y-6 text-white/70 leading-relaxed text-sm">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">General Information</h2>
          <p>
            The information provided by MVStream ("we," "us," or "our") on this website is for general informational purposes only. All information on the site is provided in good faith; however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">External Links</h2>
          <p>
            The site may contain links to external websites that are not provided or maintained by or in any way affiliated with MVStream. Please note that we do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Professional Advice</h2>
          <p>
            The site cannot and does not contain professional advice. The information is provided for general informational and educational purposes only and is not a substitute for professional advice. Accordingly, before taking any actions based upon such information, we encourage you to consult with the appropriate professionals. We do not provide any kind of professional advice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Content Ownership</h2>
          <p>
            All content on this site, including but not limited to text, graphics, logos, images, and software, is the property of MVStream or its content suppliers and is protected by applicable intellectual property laws. We do not host any video content directly on our servers. All video content is served through third-party streaming services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">DMCA Compliance</h2>
          <p>
            MVStream respects the intellectual property rights of others. If you believe that any content on this site infringes upon your copyright, please contact us immediately so we can address the issue. We will promptly investigate and take appropriate action, which may include removing the infringing content.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Limitation of Liability</h2>
          <p>
            Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred as a result of the use of the site or reliance on any information provided on the site. Your use of the site and your reliance on any information on the site is solely at your own risk.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Consent</h2>
          <p>
            By using our website, you hereby consent to our disclaimer and agree to its terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Updates</h2>
          <p>
            We may update this disclaimer from time to time. Any changes will be posted on this page with an updated revision date.
          </p>
        </section>

        <div className="pt-4 border-t border-white/10">
          <p className="text-white/40">
            If you have any questions about this disclaimer, please{' '}
            <Link to="/contact" className="text-brand-primary hover:underline">contact us</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
