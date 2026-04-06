'use client';

import { useState } from 'react';
import type { Metadata } from 'next';

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'Do I need an account to use Kinetic?',
          a: 'No! You can use our Guest Timer feature without creating an account. However, creating a free account unlocks additional features like workout history, statistics tracking, custom presets, and AI-powered workout generation.',
        },
        {
          q: 'How do I create an account?',
          a: 'Click the "Sign In" button in the navigation bar, then select "Sign Up". You can create an account using your email address and password, or sign in with Google for faster access.',
        },
        {
          q: 'Is Kinetic free to use?',
          a: 'Yes! Kinetic is completely free to use. We do not charge for any features and there are no premium tiers or hidden costs.',
        },
      ],
    },
    {
      category: 'Workouts & Timers',
      questions: [
        {
          q: 'What types of workouts does Kinetic support?',
          a: 'Kinetic supports all interval-based workouts including HIIT, Tabata, EMOM (Every Minute on the Minute), AMRAP (As Many Rounds As Possible), circuit training, endurance workouts, and custom interval sequences with warmup, work, rest, and cooldown phases.',
        },
        {
          q: 'How does the AI workout generator work?',
          a: 'Simply describe your desired workout in natural language (e.g., "30 minute HIIT with 45 second work intervals and 15 second rest"). Our AI powered by Groq will generate a structured interval workout based on your description. You can then customize it further before starting.',
        },
        {
          q: 'Can I create custom workout presets?',
          a: 'Yes! If you have an account, you can create and save unlimited custom workout presets. Configure your intervals exactly how you want them, name your preset, and access it anytime from your library.',
        },
        {
          q: 'Can I edit a workout during my session?',
          a: 'Currently, workouts cannot be edited once started. However, you can pause your workout at any time, and when you finish or exit, you can create a new version with your desired changes.',
        },
      ],
    },
    {
      category: 'Features & Settings',
      questions: [
        {
          q: 'How do I change the theme?',
          a: 'Go to Settings (gear icon in the navigation) and select your preferred theme from the available color schemes. Your theme preference is saved automatically.',
        },
        {
          q: 'Can I turn off sound effects?',
          a: 'Yes! In Settings, you can independently toggle sound effects, haptic feedback, voice guidance, and other audio/visual cues to customize your experience.',
        },
        {
          q: 'What does "Keep Screen On" do?',
          a: 'When enabled, this setting prevents your device screen from auto-locking during workout sessions, so you can always see your timer without having to tap your screen.',
        },
        {
          q: 'How are calories calculated?',
          a: 'Calorie estimates are based on general formulas using workout duration and intensity level. Please note these are approximations and actual calorie burn varies based on individual factors like weight, age, gender, fitness level, and exercise intensity.',
        },
      ],
    },
    {
      category: 'Account & Data',
      questions: [
        {
          q: 'How do I reset my password?',
          a: 'On the Sign In page, click "Forgot Password". Enter your email address and we\'ll send you a password reset link. Follow the link in the email to create a new password.',
        },
        {
          q: 'How do I delete my account?',
          a: 'Go to Settings > Profile, then scroll down to find the "Delete Account" option. This action is permanent and will delete all your data including workout history, presets, and statistics. If you need assistance, contact support@kinetic.app.',
        },
        {
          q: 'Can I export my workout data?',
          a: 'To request a copy of your data, please email support@kinetic.app with "Data Export Request" in the subject line. We\'ll provide your data in a machine-readable format within 30 days.',
        },
        {
          q: 'What happens to my data if I use Guest mode?',
          a: 'Guest data is stored locally in your browser only and never transmitted to our servers. If you clear your browser data or switch devices, your guest workout history will be lost. We recommend creating an account to preserve your data.',
        },
      ],
    },
    {
      category: 'Troubleshooting',
      questions: [
        {
          q: 'The timer is not working correctly',
          a: 'Try these steps: 1) Refresh the page, 2) Clear your browser cache, 3) Make sure you\'re using an updated browser (Chrome, Firefox, Safari, or Edge), 4) Check that JavaScript is enabled. If problems persist, contact support with details about your device and browser.',
        },
        {
          q: 'I\'m not receiving password reset emails',
          a: 'Check your spam/junk folder. If you still don\'t see it, verify you entered the correct email address. Add support@kinetic.app to your contacts and try requesting another reset. If issues continue, contact support directly.',
        },
        {
          q: 'My workout history is not saving',
          a: 'Make sure you\'re logged into your account. Guest mode workouts are stored locally only. If logged in and still experiencing issues, try logging out and back in. If the problem persists, contact support@kinetic.app.',
        },
        {
          q: 'The app is running slowly or freezing',
          a: 'Close other browser tabs and applications to free up memory. Try clearing your browser cache. Make sure your browser is updated to the latest version. If using Guest mode with extensive data, consider creating an account for better performance.',
        },
      ],
    },
    {
      category: 'Privacy & Security',
      questions: [
        {
          q: 'Is my data secure?',
          a: 'Yes. We use industry-standard security measures including HTTPS encryption, password hashing (bcrypt), JWT authentication, and row-level security policies. Your data is stored on secure Supabase servers. See our Privacy Policy for full details.',
        },
        {
          q: 'Do you sell my data?',
          a: 'Absolutely not. We do not sell, rent, or trade your personal information to third parties. We do not use advertising networks or invasive tracking. Your data is used solely to provide and improve the Kinetic service.',
        },
        {
          q: 'What data do you collect?',
          a: 'For account users: email, name, workout data, session history, and preferences. For guest users: data is stored locally only. We do not collect location data, health sensor data, or use advertising trackers. See our Privacy Policy for complete details.',
        },
        {
          q: 'How is the AI workout generator data used?',
          a: 'When you use the AI feature, only your workout prompt text is sent to Groq AI for processing. Your identity and workout history are not shared. The prompt is used solely to generate your workout configuration.',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Support Center</h1>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions and get help with Kinetic
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <a
            href="/contact"
            className="p-6 rounded-lg border border-border hover:border-primary transition-colors bg-card"
          >
            <div className="text-4xl mb-3">📧</div>
            <h3 className="font-semibold text-lg mb-2">Contact Us</h3>
            <p className="text-sm text-muted-foreground">
              Send us a message and we&apos;ll get back to you
            </p>
          </a>

          <a
            href="/legal/privacy"
            className="p-6 rounded-lg border border-border hover:border-primary transition-colors bg-card"
          >
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="font-semibold text-lg mb-2">Privacy Policy</h3>
            <p className="text-sm text-muted-foreground">
              Learn how we protect your data
            </p>
          </a>

          <a
            href="/legal/terms"
            className="p-6 rounded-lg border border-border hover:border-primary transition-colors bg-card"
          >
            <div className="text-4xl mb-3">📄</div>
            <h3 className="font-semibold text-lg mb-2">Terms of Service</h3>
            <p className="text-sm text-muted-foreground">
              Read our terms and conditions
            </p>
          </a>
        </div>

        {/* Emergency Notice */}
        <div className="bg-error-container border-2 border-error rounded-lg p-6 mb-12">
          <h2 className="text-xl font-bold mb-2 text-on-surface">
            ⚠️ Medical Emergency?
          </h2>
          <p className="text-on-surface-variant">
            Kinetic is a fitness timer tool and does NOT provide medical advice. If you experience 
            chest pain, severe shortness of breath, dizziness, or other concerning symptoms, 
            <strong> stop exercising immediately and call emergency services (911 in the US)</strong>.
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>

          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="border border-border rounded-lg p-6 bg-card">
              <h3 className="text-2xl font-semibold mb-4">{category.category}</h3>
              <div className="space-y-3">
                {category.questions.map((faq, faqIndex) => {
                  const globalIndex = categoryIndex * 100 + faqIndex;
                  const isOpen = openFaq === globalIndex;

                  return (
                    <div
                      key={faqIndex}
                      className="border border-border rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFaq(globalIndex)}
                        className="w-full text-left p-4 hover:bg-accent transition-colors flex justify-between items-center"
                      >
                        <span className="font-medium pr-4">{faq.q}</span>
                        <span className="text-2xl flex-shrink-0">
                          {isOpen ? '−' : '+'}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="p-4 pt-0 text-muted-foreground">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still Need Help */}
        <div className="mt-12 p-8 kinetic-gradient rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-3 text-on-primary">Still Need Help?</h2>
          <p className="text-on-primary/90 mb-6">
            Can&apos;t find the answer you&apos;re looking for? We&apos;re here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="mailto:support@kinetic.app"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors"
            >
              Email Us Directly
            </a>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            We typically respond within 24-48 hours
          </p>
        </div>

        {/* Additional Resources */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border border-border rounded-lg bg-card">
            <h3 className="font-semibold text-lg mb-2">System Requirements</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Modern web browser (Chrome, Firefox, Safari, Edge)</li>
              <li>• JavaScript enabled</li>
              <li>• Internet connection (for account sync)</li>
              <li>• Recommended: Desktop, tablet, or smartphone</li>
            </ul>
          </div>

          <div className="p-6 border border-border rounded-lg bg-card">
            <h3 className="font-semibold text-lg mb-2">Response Times</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Email support: 24-48 hours</li>
              <li>• Contact form: 24-48 hours</li>
              <li>• Critical issues: Prioritized</li>
              <li>• Business hours: Monday-Friday, 9 AM - 5 PM EST</li>
            </ul>
          </div>
        </div>

        {/* Legal Links */}
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p className="mb-2">For legal information, please review:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/legal/privacy" className="hover:text-primary underline">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="/legal/terms" className="hover:text-primary underline">
              Terms of Service
            </a>
            <span>•</span>
            <a href="/legal/disclaimer" className="hover:text-primary underline">
              Disclaimer
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
