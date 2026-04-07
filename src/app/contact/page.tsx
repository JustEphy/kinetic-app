'use client';

import { useState, FormEvent } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // In a real implementation, this would send to your backend API
      // For now, we'll simulate an API call
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          category: 'general',
          message: '',
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setErrorMessage(
        'Sorry, we couldn\'t send your message. Please try again or email us directly at support@kinetic.app'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Contact Us</h1>
          <p className="text-lg text-muted-foreground">
            Have a question, suggestion, or need help? We&apos;d love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="border border-border rounded-lg p-6 bg-card">
              <h2 className="text-2xl font-semibold mb-6">Send Us a Message</h2>

              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-primary-container border border-primary rounded-lg">
                  <p className="text-on-surface font-semibold">
                    ✓ Message sent successfully!
                  </p>
                  <p className="text-sm text-on-surface-variant mt-1">
                    We&apos;ve received your message and will get back to you within 24-48 hours.
                  </p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-error-container border border-error rounded-lg">
                  <p className="text-on-surface font-semibold">
                    ✗ Error sending message
                  </p>
                  <p className="text-sm text-on-surface-variant mt-1">
                    {errorMessage}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email <span className="text-error">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="your.email@example.com"
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium mb-2">
                    Category <span className="text-error">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="bug">Report a Bug</option>
                    <option value="feature">Feature Request</option>
                    <option value="account">Account Issue</option>
                    <option value="privacy">Privacy/Data Request</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Subject <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message <span className="text-error">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Please provide as much detail as possible. For technical issues, include your device/browser information."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum 10 characters
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>

                <p className="text-xs text-muted-foreground text-center">
                  By submitting this form, you agree to our{' '}
                  <a href="/legal/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </p>
              </form>
            </div>
          </div>

          {/* Contact Information Sidebar */}
          <div className="space-y-6">
            {/* Direct Email */}
            <div className="border border-border rounded-lg p-6 bg-card">
              <div className="text-4xl mb-3">📧</div>
              <h3 className="font-semibold text-lg mb-2">Email Us</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Prefer email? Send us a message directly:
              </p>
              <a
                href="mailto:support@kinetic.app"
                className="text-primary hover:underline font-medium break-all"
              >
                support@kinetic.app
              </a>
            </div>

            {/* Response Time */}
            <div className="border border-border rounded-lg p-6 bg-card">
              <div className="text-4xl mb-3">⏱️</div>
              <h3 className="font-semibold text-lg mb-2">Response Time</h3>
              <p className="text-sm text-muted-foreground">
                We aim to respond to all inquiries within <strong>24-48 hours</strong> during 
                business days (Monday-Friday).
              </p>
            </div>

            {/* Business Info */}
            <div className="border border-border rounded-lg p-6 bg-card">
              <div className="text-4xl mb-3">🏢</div>
              <h3 className="font-semibold text-lg mb-2">Company Info</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Kinetic By You Inc.</strong></p>
                <p>c/o John Doe</p>
                <p>Detroit, MI 48201</p>
                <p>United States</p>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="border border-border rounded-lg p-6 bg-card">
              <div className="text-4xl mb-3">❓</div>
              <h3 className="font-semibold text-lg mb-2">Quick Answers</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Looking for immediate help? Check our FAQ section first.
              </p>
              <a
                href="/support"
                className="text-primary hover:underline font-medium"
              >
                Visit Support Center →
              </a>
            </div>

            {/* Privacy Notice */}
            <div className="bg-primary-container border border-outline rounded-lg p-4">
              <p className="text-xs text-on-surface-variant">
                <strong>Privacy:</strong> We respect your privacy. Your contact information 
                will only be used to respond to your inquiry and will not be shared with third parties. 
                See our{' '}
                <a href="/legal/privacy" className="underline hover:no-underline">
                  Privacy Policy
                </a>{' '}
                for details.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Help Options */}
        <div className="mt-12 p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <h2 className="text-xl font-semibold mb-3">Other Ways to Get Help</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h3 className="font-semibold mb-1">🐛 Found a Bug?</h3>
              <p className="text-muted-foreground">
                Select &quot;Report a Bug&quot; in the category dropdown and include detailed steps to reproduce the issue.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">💡 Have an Idea?</h3>
              <p className="text-muted-foreground">
                We love hearing feature suggestions! Choose &quot;Feature Request&quot; and tell us what you&apos;d like to see.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">🔒 Privacy Concerns?</h3>
              <p className="text-muted-foreground">
                For data export, deletion, or privacy inquiries, select &quot;Privacy/Data Request&quot; category.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
