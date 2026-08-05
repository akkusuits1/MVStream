import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare, Send, ExternalLink } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Contact Us</h1>
      <p className="text-white/60 mb-8">Have questions, suggestions, or need support? We'd love to hear from you.</p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Get in Touch</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail size={20} className="text-brand-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-white/80 text-sm font-medium">Email</p>
                  <p className="text-white/50 text-sm">contact@mvstream.example.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageSquare size={20} className="text-brand-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-white/80 text-sm font-medium">Response Time</p>
                  <p className="text-white/50 text-sm">We typically respond within 24-48 hours</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/privacy" className="flex items-center gap-2 text-white/60 hover:text-brand-primary text-sm transition-colors">
                <ExternalLink size={14} /> Privacy Policy
              </Link>
              <Link to="/terms" className="flex items-center gap-2 text-white/60 hover:text-brand-primary text-sm transition-colors">
                <ExternalLink size={14} /> Terms & Conditions
              </Link>
              <Link to="/disclaimer" className="flex items-center gap-2 text-white/60 hover:text-brand-primary text-sm transition-colors">
                <ExternalLink size={14} /> Disclaimer
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Send a Message</h2>
          {submitted ? (
            <div className="text-center py-8">
              <Send size={40} className="mx-auto text-brand-primary mb-3" />
              <p className="text-white font-medium mb-2">Message Sent!</p>
              <p className="text-white/50 text-sm mb-4">Thank you for reaching out. We'll get back to you soon.</p>
              <button
                onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}
                className="text-brand-primary hover:underline text-sm"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-brand-primary/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-brand-primary/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-brand-primary/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1">Message</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-brand-primary/50 transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-hover text-white rounded-lg font-medium transition-colors"
              >
                <Send size={16} /> Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
