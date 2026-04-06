import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Kinetic',
  description: 'Privacy Policy for Kinetic - Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: April 6, 2026</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <p className="text-lg">
              Kinetic By You Inc. (&quot;Kinetic,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting 
              your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
              you use our fitness interval timer application and related services (collectively, the &quot;Service&quot;).
            </p>
            <p className="font-semibold mt-4">
              Please read this Privacy Policy carefully. By using the Service, you agree to the collection and use of 
              information in accordance with this policy.
            </p>
          </section>

          {/* Quick Summary */}
          <section className="bg-primary-container p-6 rounded-lg border border-outline">
            <h2 className="text-2xl font-bold mb-4 text-on-surface">Quick Summary</h2>
            <ul className="space-y-2 list-disc list-inside text-on-surface-variant">
              <li>We collect account info (email, name), workout data, and usage statistics</li>
              <li>Guest mode available - use core features without an account</li>
              <li>We use Supabase for data storage and Groq AI for workout generation</li>
              <li>We do NOT sell your data or use invasive tracking/advertising</li>
              <li>You can request data export or deletion at any time</li>
              <li>EU, California, and Canadian privacy rights are fully supported</li>
            </ul>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-3xl font-bold mb-4">1. Information We Collect</h2>
            
            <h3 className="text-2xl font-semibold mt-6 mb-3">1.1 Information You Provide</h3>
            <p><strong>Account Registration:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Email address (required)</li>
              <li>Password (hashed and securely stored)</li>
              <li>Name/display name</li>
              <li>Profile information (bio, fitness goals, preferred workout types)</li>
              <li>Avatar/profile picture (optional)</li>
            </ul>

            <p className="mt-4"><strong>OAuth Authentication:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Google account information (name, email, profile picture) if you choose to sign in with Google</li>
            </ul>

            <p className="mt-4"><strong>Workout Data:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Custom workout configurations (intervals, durations, names, descriptions)</li>
              <li>Workout presets you create or save</li>
              <li>Workout session history (start times, completion times, durations)</li>
              <li>AI-generated workout requests (natural language prompts you enter)</li>
              <li>Performance metrics (estimated calories burned, intensity levels)</li>
            </ul>

            <p className="mt-4"><strong>User Preferences:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Theme selection</li>
              <li>Sound, haptic feedback, and voice guidance preferences</li>
              <li>Screen lock settings</li>
              <li>Unit preferences (metric/imperial)</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-6 mb-3">1.2 Information Collected Automatically</h3>
            <p><strong>Usage Data:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Device type and operating system</li>
              <li>Browser type and version</li>
              <li>IP address (stored by our hosting provider, Supabase)</li>
              <li>Session duration and interaction patterns</li>
              <li>Error logs and crash reports (for debugging)</li>
            </ul>

            <p className="mt-4"><strong>Cookies and Local Storage:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Authentication tokens (JWT, session cookies)</li>
              <li>Theme and preference settings</li>
              <li>Guest user data (if using the Service without an account)</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-6 mb-3">1.3 Information We Do NOT Collect</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Payment information (the Service is free)</li>
              <li>Location data (GPS, geolocation)</li>
              <li>Health sensor data (heart rate, blood pressure, etc.)</li>
              <li>Third-party advertising identifiers</li>
              <li>Social media activity beyond OAuth login</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-3xl font-bold mb-4">2. How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">2.1 Core Service Functionality</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>To create and maintain your account</li>
              <li>To authenticate your identity and manage sessions</li>
              <li>To store and retrieve your workout data and preferences</li>
              <li>To generate AI-powered workout recommendations via Groq AI</li>
              <li>To calculate and display your performance statistics</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">2.2 Service Improvement</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>To analyze usage patterns and improve user experience</li>
              <li>To diagnose and fix technical issues</li>
              <li>To develop new features and enhancements</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">2.3 Communication</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>To send password reset emails</li>
              <li>To respond to your support requests</li>
              <li>To send important Service updates (with your consent)</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">2.4 Legal Compliance</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>To comply with legal obligations</li>
              <li>To enforce our Terms of Service</li>
              <li>To protect our rights and the rights of other users</li>
            </ul>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-3xl font-bold mb-4">3. Third-Party Services We Use</h2>
            
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold mb-2">3.1 Supabase (Database & Authentication)</h3>
                <p><strong>Purpose:</strong> Backend infrastructure, data storage, and user authentication</p>
                <p><strong>Data Shared:</strong> All user account data, workout data, and session information</p>
                <p><strong>Privacy Policy:</strong> <a href="https://supabase.com/privacy" className="text-primary hover:text-primary-dim transition-colors underline" target="_blank" rel="noopener noreferrer">https://supabase.com/privacy</a></p>
                <p><strong>Location:</strong> United States (AWS infrastructure)</p>
              </div>

              <div className="border-l-4 border-secondary pl-4">
                <h3 className="text-xl font-semibold mb-2">3.2 Groq AI</h3>
                <p><strong>Purpose:</strong> Natural language processing for AI workout generation</p>
                <p><strong>Data Shared:</strong> Only your workout prompt text (e.g., &quot;30 min HIIT workout&quot;)</p>
                <p><strong>Data NOT Shared:</strong> Your identity, account information, or workout history</p>
                <p><strong>Privacy Policy:</strong> <a href="https://groq.com/privacy-policy/" className="text-primary hover:text-primary-dim transition-colors underline" target="_blank" rel="noopener noreferrer">https://groq.com/privacy-policy/</a></p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-xl font-semibold mb-2">3.3 Google OAuth (Optional)</h3>
                <p><strong>Purpose:</strong> Alternative login method</p>
                <p><strong>Data Shared:</strong> Email, name, and profile picture (if you choose Google Sign-In)</p>
                <p><strong>Privacy Policy:</strong> <a href="https://policies.google.com/privacy" className="text-primary hover:text-primary-dim transition-colors underline" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a></p>
              </div>
            </div>

            <p className="mt-4 font-semibold">
              We do NOT use Google Analytics, Facebook Pixel, or any advertising/tracking networks.
            </p>
          </section>

          {/* Data Storage and Security */}
          <section>
            <h2 className="text-3xl font-bold mb-4">4. Data Storage and Security</h2>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">4.1 Where We Store Data</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Authenticated Users:</strong> Your data is stored on Supabase servers (AWS US-based)</li>
              <li><strong>Guest Users:</strong> Data is stored locally in your browser (localStorage) and never transmitted to our servers</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">4.2 Security Measures</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Encryption in Transit:</strong> All data transmitted via HTTPS/TLS</li>
              <li><strong>Password Security:</strong> Passwords are hashed using bcrypt (never stored in plaintext)</li>
              <li><strong>Row-Level Security:</strong> Database policies ensure users can only access their own data</li>
              <li><strong>JWT Authentication:</strong> Secure, token-based sessions with automatic expiration (30 days)</li>
              <li><strong>httpOnly Cookies:</strong> Session tokens protected from client-side JavaScript access</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">4.3 Data Retention</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Account Data:</strong> Retained until you delete your account</li>
              <li><strong>Workout Sessions:</strong> Last 100 sessions kept (older sessions automatically removed)</li>
              <li><strong>Recent Activity:</strong> Last 50 activities stored</li>
              <li><strong>Authentication Tokens:</strong> Expire after 30 days of inactivity</li>
              <li><strong>Guest Data:</strong> Remains in your browser until manually cleared</li>
              <li><strong>Deleted Accounts:</strong> All associated data permanently deleted within 30 days</li>
            </ul>
          </section>

          {/* Cookies Policy */}
          <section>
            <h2 className="text-3xl font-bold mb-4">5. Cookies and Tracking Technologies</h2>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">5.1 Types of Cookies We Use</h3>
            
            <div className="space-y-3">
              <div>
                <p><strong>Essential Cookies (Required):</strong></p>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li><code className="bg-surface-container-highest px-2 py-1 rounded text-sm text-on-surface">sb-*-auth-token</code> - User authentication session</li>
                  <li><code className="bg-surface-container-highest px-2 py-1 rounded text-sm text-on-surface">sb-*-refresh-token</code> - Session refresh capability</li>
                  <li>These cookies are necessary for the Service to function and cannot be disabled</li>
                </ul>
              </div>

              <div>
                <p><strong>Functional Cookies (Optional):</strong></p>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li><code className="bg-surface-container-highest px-2 py-1 rounded text-sm text-on-surface">kinetic-theme</code> - Remembers your theme preference</li>
                  <li>These enhance your experience but are not strictly necessary</li>
                </ul>
              </div>

              <div>
                <p><strong>OAuth Cookies (Optional):</strong></p>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li><code className="bg-surface-container-highest px-2 py-1 rounded text-sm text-on-surface">sb-*-code-verifier</code> - Google Sign-In flow (only if you use OAuth)</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold mt-4 mb-2">5.2 Local Storage</h3>
            <p>We use browser localStorage to store the following (for guest users or temporary data):</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><code className="bg-surface-container-highest px-2 py-1 rounded text-sm text-on-surface">kinetic_user</code>, <code className="bg-surface-container-highest px-2 py-1 rounded text-sm text-on-surface">kinetic_workouts</code>, <code className="bg-surface-container-highest px-2 py-1 rounded text-sm text-on-surface">kinetic_sessions</code>, etc.</li>
              <li>This data is stored locally on your device and never transmitted without your explicit action</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">5.3 Managing Cookies</h3>
            <p>You can control cookies through your browser settings:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
              <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
            </ul>
            <p className="mt-2 text-sm italic">
              Note: Blocking essential cookies will prevent you from logging in and using authenticated features.
            </p>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-3xl font-bold mb-4">6. How We Share Your Information</h2>
            
            <p className="font-semibold">We do NOT sell, rent, or trade your personal information.</p>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">We may share your information in the following limited circumstances:</h3>
            
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>With Service Providers:</strong> Supabase (hosting/database) and Groq AI (workout generation) 
                as described in Section 3
              </li>
              <li>
                <strong>Legal Requirements:</strong> If required by law, court order, or government request
              </li>
              <li>
                <strong>Safety and Security:</strong> To protect against fraud, abuse, or threats to user safety
              </li>
              <li>
                <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets 
                (you will be notified)
              </li>
              <li>
                <strong>With Your Consent:</strong> For any other purpose with your explicit permission
              </li>
            </ul>

            <p className="mt-4 font-semibold">
              We do NOT share data with advertisers, marketers, or data brokers.
            </p>
          </section>

          {/* Your Privacy Rights */}
          <section>
            <h2 className="text-3xl font-bold mb-4">7. Your Privacy Rights</h2>
            
            <h3 className="text-2xl font-semibold mt-6 mb-3">7.1 Rights for All Users</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and all associated data</li>
              <li><strong>Data Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Withdraw Consent:</strong> Opt out of optional data processing</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-6 mb-3">7.2 California Residents (CCPA/CPRA)</h3>
            <p>If you are a California resident, you have additional rights under the California Consumer Privacy Act:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Right to Know:</strong> Request details about the personal information we collect</li>
              <li><strong>Right to Delete:</strong> Request deletion of your personal information</li>
              <li><strong>Right to Opt-Out:</strong> We do NOT sell personal information (no opt-out needed)</li>
              <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your rights</li>
              <li><strong>Sensitive Personal Information:</strong> We do not collect or use sensitive personal information beyond what is necessary for Service functionality</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-6 mb-3">7.3 EU/UK Residents (GDPR)</h3>
            <p>If you are in the European Union or United Kingdom, you have the following rights under GDPR:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Right of Access:</strong> Obtain confirmation of data processing and a copy of your data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate personal data</li>
              <li><strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> Request deletion in certain circumstances</li>
              <li><strong>Right to Restriction:</strong> Restrict processing in certain situations</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a structured format</li>
              <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
              <li><strong>Right to Lodge a Complaint:</strong> File a complaint with your local data protection authority</li>
            </ul>
            <p className="mt-2"><strong>Legal Basis for Processing:</strong></p>
            <ul className="list-disc list-inside ml-4">
              <li><strong>Contract Performance:</strong> To provide the Service you requested</li>
              <li><strong>Consent:</strong> For optional features (AI workout generation, marketing communications)</li>
              <li><strong>Legitimate Interest:</strong> For Service improvement and security</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-6 mb-3">7.4 Canadian Residents (PIPEDA)</h3>
            <p>If you are in Canada, you have rights under PIPEDA including:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Right to access your personal information</li>
              <li>Right to correct inaccuracies</li>
              <li>Right to withdraw consent</li>
              <li>Right to file a complaint with the Privacy Commissioner of Canada</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-6 mb-3">7.5 How to Exercise Your Rights</h3>
            <p>To exercise any of these rights, please contact us at:</p>
            <div className="bg-surface-container-high p-4 rounded-lg mt-2 border border-outline">
              <p><strong>Email:</strong> <a href="mailto:support@kinetic.app" className="text-primary hover:text-primary-dim transition-colors underline">support@kinetic.app</a></p>
              <p><strong>Subject Line:</strong> &quot;Privacy Rights Request - [Your Request Type]&quot;</p>
            </div>
            <p className="mt-2 text-sm">
              We will respond to your request within 30 days (or 45 days for CCPA requests). 
              We may ask for verification of your identity before processing requests.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-3xl font-bold mb-4">8. Children&apos;s Privacy</h2>
            <p>
              Our Service is not directed to individuals under the age of 13 (or 16 in the EU). We do not knowingly 
              collect personal information from children. If you are a parent or guardian and believe your child has 
              provided us with personal information, please contact us immediately. We will take steps to delete such 
              information from our records.
            </p>
          </section>

          {/* International Data Transfers */}
          <section>
            <h2 className="text-3xl font-bold mb-4">9. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in the United States or other countries where our 
              service providers operate. These countries may have different data protection laws than your country of 
              residence.
            </p>
            <p className="mt-2">
              For EU/UK users: We ensure appropriate safeguards are in place for international transfers, including 
              Standard Contractual Clauses (SCCs) approved by the European Commission.
            </p>
          </section>

          {/* Do Not Track */}
          <section>
            <h2 className="text-3xl font-bold mb-4">10. Do Not Track Signals</h2>
            <p>
              Our Service does not track users across third-party websites or serve targeted advertising. We do not 
              respond to Do Not Track (DNT) browser signals because we do not engage in the tracking activities that 
              DNT is designed to prevent.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-3xl font-bold mb-4">11. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated 
              &quot;Last Updated&quot; date. Material changes will be notified via email (if you have provided an email address) 
              or through a prominent notice on the Service.
            </p>
            <p className="mt-2">
              Your continued use of the Service after changes become effective constitutes acceptance of the revised policy.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-surface-container p-6 rounded-lg border border-outline">
            <h2 className="text-3xl font-bold mb-4">12. Contact Us</h2>
            <p className="mb-4">
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, 
              please contact us:
            </p>
            
            <div className="space-y-2">
              <p><strong>Company:</strong> Kinetic By You Inc.</p>
              <p><strong>Email:</strong> <a href="mailto:support@kinetic.app" className="text-primary hover:text-primary-dim transition-colors underline">support@kinetic.app</a></p>
              <p><strong>Mailing Address:</strong><br />
                Kinetic By You Inc.<br />
                c/o John Doe<br />
                Detroit, MI 48201<br />
                United States
              </p>
              <p className="mt-4">
                <strong>Data Protection Officer:</strong> For EU/UK inquiries, please use the same contact information above.
              </p>
            </div>
          </section>

          {/* Effective Date */}
          <section className="text-sm text-muted-foreground italic">
            <p>This Privacy Policy is effective as of April 6, 2026.</p>
            <p className="mt-2">
              By using Kinetic, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
