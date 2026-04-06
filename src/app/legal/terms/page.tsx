import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Kinetic',
  description: 'Terms of Service for Kinetic - Read the rules and guidelines for using our fitness interval timer application.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: April 6, 2026</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-3xl font-bold mb-4">1. Agreement to Terms</h2>
            <p>
              Welcome to Kinetic! These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Kinetic 
              fitness interval timer application, website, and related services (collectively, the &quot;Service&quot;) provided 
              by Kinetic By You Inc. (&quot;Kinetic,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
            </p>
            <p className="mt-4 font-semibold">
              By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these 
              Terms, you may not use the Service.
            </p>
            <p className="mt-4">
              These Terms constitute a legally binding agreement between you and Kinetic By You Inc., a company 
              operating under the laws of the State of Michigan, United States.
            </p>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="text-3xl font-bold mb-4">2. Eligibility</h2>
            <p>You must be at least 13 years old to use the Service. If you are under 18, you must have permission 
            from a parent or legal guardian.</p>
            <p className="mt-2">
              For users in the European Union, you must be at least 16 years old to use the Service.
            </p>
            <p className="mt-2">
              By using the Service, you represent and warrant that:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>You meet the age requirements above</li>
              <li>You have the legal capacity to enter into these Terms</li>
              <li>You will comply with these Terms and all applicable laws</li>
              <li>All information you provide is accurate and truthful</li>
            </ul>
          </section>

          {/* Account Registration */}
          <section>
            <h2 className="text-3xl font-bold mb-4">3. Account Registration and Security</h2>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">3.1 Account Creation</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>You may use limited features as a guest without creating an account</li>
              <li>Full features require account registration with a valid email address</li>
              <li>You may sign up using email/password or Google OAuth</li>
              <li>You must provide accurate and complete information during registration</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">3.2 Account Security</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>You are responsible for maintaining the confidentiality of your password</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>You must notify us immediately of any unauthorized access or security breach</li>
              <li>We are not liable for losses caused by unauthorized use of your account</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">3.3 Account Termination</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>You may delete your account at any time through the Service settings</li>
              <li>We may suspend or terminate your account for violation of these Terms</li>
              <li>Upon termination, your data will be deleted in accordance with our Privacy Policy</li>
            </ul>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-3xl font-bold mb-4">4. Acceptable Use Policy</h2>
            
            <p className="font-semibold mb-2">You agree NOT to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Use the Service for any illegal purpose or in violation of any laws</li>
              <li>Violate the rights of others, including intellectual property rights</li>
              <li>Upload or transmit viruses, malware, or other malicious code</li>
              <li>Attempt to gain unauthorized access to the Service or related systems</li>
              <li>Interfere with or disrupt the Service or servers/networks connected to the Service</li>
              <li>Use automated scripts, bots, or scrapers to access the Service</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
              <li>Remove, obscure, or alter any copyright, trademark, or proprietary notices</li>
              <li>Impersonate another person or entity</li>
              <li>Harass, threaten, or abuse other users</li>
              <li>Collect or store personal data about other users without consent</li>
              <li>Use the Service in any way that could harm minors</li>
              <li>Submit false, misleading, or fraudulent information</li>
              <li>Spam, advertise, or solicit other users without permission</li>
              <li>Use the Service to distribute unsolicited commercial content</li>
            </ul>
          </section>

          {/* User Content */}
          <section>
            <h2 className="text-3xl font-bold mb-4">5. User-Generated Content</h2>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">5.1 Your Content</h3>
            <p>
              You may create and store workout configurations, presets, and other content (&quot;User Content&quot;). 
              You retain ownership of your User Content.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">5.2 License to Us</h3>
            <p>
              By creating User Content, you grant Kinetic a non-exclusive, worldwide, royalty-free license to:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Store, process, and transmit your User Content as necessary to provide the Service</li>
              <li>Create backups and ensure data integrity</li>
              <li>Use aggregated, anonymized data for Service improvement</li>
            </ul>
            <p className="mt-2 font-semibold">
              We will NOT share your identifiable User Content with third parties for marketing purposes.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">5.3 Content Standards</h3>
            <p>Your User Content must NOT:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Be illegal, harmful, or offensive</li>
              <li>Infringe on intellectual property rights</li>
              <li>Contain private information of others</li>
              <li>Be misleading or fraudulent</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">5.4 Content Removal</h3>
            <p>
              We reserve the right to remove any User Content that violates these Terms or is otherwise 
              objectionable, without notice.
            </p>
          </section>

          {/* AI Features */}
          <section>
            <h2 className="text-3xl font-bold mb-4">6. AI Workout Generation</h2>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">6.1 Third-Party AI Service</h3>
            <p>
              Our AI workout generation feature uses Groq AI, a third-party service. When you use this feature, 
              your workout prompt is sent to Groq for processing.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">6.2 No Medical Advice</h3>
            <p className="font-semibold">
              AI-generated workouts are for informational purposes only and do not constitute medical, fitness, 
              or health advice. See Section 9 (Disclaimer) for more information.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">6.3 Accuracy Not Guaranteed</h3>
            <p>
              AI-generated content may contain errors or inaccuracies. You are responsible for reviewing and 
              validating all AI suggestions before use.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">6.4 Usage Limits</h3>
            <p>
              We may impose usage limits on AI features to prevent abuse and manage costs. Excessive use may 
              result in temporary restrictions.
            </p>
          </section>

          {/* Service Availability */}
          <section>
            <h2 className="text-3xl font-bold mb-4">7. Service Availability and Modifications</h2>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">7.1 Service Availability</h3>
            <p>
              We strive to provide reliable Service availability, but we do not guarantee uninterrupted or error-free 
              operation. The Service may be unavailable due to:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Maintenance and updates</li>
              <li>Technical difficulties or server issues</li>
              <li>Internet or network problems</li>
              <li>Force majeure events</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">7.2 Service Modifications</h3>
            <p>We reserve the right to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Modify, suspend, or discontinue any part of the Service at any time</li>
              <li>Change features, functionality, or pricing (with reasonable notice)</li>
              <li>Update these Terms (see Section 15)</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">7.3 No Liability</h3>
            <p>
              We are not liable for any damages or losses resulting from Service unavailability, modifications, 
              or discontinuation.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-3xl font-bold mb-4">8. Intellectual Property Rights</h2>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">8.1 Our Intellectual Property</h3>
            <p>
              The Service, including all content, features, functionality, software, code, designs, logos, and 
              trademarks (&quot;Kinetic Materials&quot;) are owned by Kinetic By You Inc. and protected by copyright, 
              trademark, and other intellectual property laws.
            </p>
            <p className="mt-2">
              You may not copy, modify, distribute, sell, or lease any part of the Service or Kinetic Materials 
              without our express written permission.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">8.2 Limited License</h3>
            <p>
              We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the 
              Service for personal, non-commercial purposes in accordance with these Terms.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">8.3 Copyright Infringement</h3>
            <p>
              If you believe that your copyrighted work has been infringed, please contact us at 
              <a href="mailto:support@kinetic.app" className="text-primary hover:text-primary-dim transition-colors underline ml-1">support@kinetic.app</a> with:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Description of the copyrighted work</li>
              <li>Location of the infringing material</li>
              <li>Your contact information</li>
              <li>A statement of good faith belief</li>
              <li>Your signature (physical or electronic)</li>
            </ul>
          </section>

          {/* Disclaimer */}
          <section className="bg-error-container p-6 rounded-lg border-2 border-error">
            <h2 className="text-3xl font-bold mb-4 text-on-surface">9. Health and Fitness Disclaimer</h2>
            
            <p className="font-bold text-lg mb-3 text-on-surface">⚠️ IMPORTANT: READ CAREFULLY</p>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">9.1 Not Medical Advice</h3>
            <p>
              <strong>The Service is a workout timer tool and does NOT provide medical, fitness, health, or nutritional advice.</strong> 
              All content, including AI-generated workouts, is for informational and entertainment purposes only.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">9.2 Consult a Healthcare Professional</h3>
            <p>
              <strong>Before starting any exercise program, consult with a qualified healthcare provider or licensed 
              fitness professional,</strong> especially if you:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Have any medical conditions or health concerns</li>
              <li>Are taking medications</li>
              <li>Have a history of heart disease, high blood pressure, or other cardiovascular issues</li>
              <li>Are pregnant or nursing</li>
              <li>Are over 40 years old and sedentary</li>
              <li>Have any physical limitations or injuries</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">9.3 Exercise at Your Own Risk</h3>
            <p>
              <strong>You assume all risks associated with using the Service and following any workouts.</strong> 
              Exercise can be strenuous and may result in injury. You are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Exercising at an appropriate intensity for your fitness level</li>
              <li>Using proper form and technique</li>
              <li>Stopping immediately if you feel pain, dizziness, or discomfort</li>
              <li>Ensuring a safe exercise environment</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">9.4 No Guarantees</h3>
            <p>
              We make no guarantees regarding fitness results, weight loss, health improvements, or any other outcomes. 
              Results vary based on individual factors.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">9.5 Calorie Estimates</h3>
            <p>
              Calorie burn estimates are approximations based on general formulas and may not be accurate for your 
              individual metabolism, body composition, or exercise intensity.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-3xl font-bold mb-4">10. Limitation of Liability</h2>
            
            <p className="font-bold uppercase mb-3">TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">10.1 No Warranties</h3>
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, 
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Warranties of merchantability, fitness for a particular purpose, or non-infringement</li>
              <li>Warranties that the Service will be uninterrupted, error-free, or secure</li>
              <li>Warranties regarding the accuracy, completeness, or reliability of content</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">10.2 Limitation of Damages</h3>
            <p>
              IN NO EVENT SHALL KINETIC BY YOU INC., ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, revenue, data, or use</li>
              <li>Personal injury or property damage</li>
              <li>Damages arising from your use or inability to use the Service</li>
            </ul>
            <p className="mt-2">
              EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">10.3 Maximum Liability</h3>
            <p>
              Our total liability to you for any claims arising from or related to the Service shall not exceed 
              the greater of: (a) $100 USD, or (b) the amount you paid to us in the 12 months preceding the claim.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">10.4 Jurisdictional Variations</h3>
            <p>
              Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability. 
              In such jurisdictions, our liability is limited to the maximum extent permitted by law.
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-3xl font-bold mb-4">11. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Kinetic By You Inc., its officers, directors, 
              employees, agents, and affiliates from and against any claims, liabilities, damages, losses, costs, 
              or expenses (including reasonable attorneys&apos; fees) arising from or related to:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Your use or misuse of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any law or regulation</li>
              <li>Your violation of any third-party rights</li>
              <li>Your User Content</li>
              <li>Any injury or damage you sustain while using the Service</li>
            </ul>
          </section>

          {/* Dispute Resolution */}
          <section>
            <h2 className="text-3xl font-bold mb-4">12. Dispute Resolution</h2>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">12.1 Informal Resolution</h3>
            <p>
              Before filing a formal claim, you agree to contact us at 
              <a href="mailto:support@kinetic.app" className="text-primary hover:text-primary-dim transition-colors underline ml-1">support@kinetic.app</a> 
              and attempt to resolve the dispute informally for at least 30 days.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">12.2 Binding Arbitration (US Users)</h3>
            <p>
              For users in the United States, any dispute that cannot be resolved informally shall be resolved through 
              binding arbitration in accordance with the American Arbitration Association (AAA) rules. The arbitration 
              shall take place in Detroit, Michigan, or another mutually agreed location.
            </p>
            <p className="mt-2 font-semibold">
              YOU AGREE TO WAIVE YOUR RIGHT TO A JURY TRIAL AND TO PARTICIPATE IN A CLASS ACTION LAWSUIT.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">12.3 Small Claims Court</h3>
            <p>
              Either party may bring an individual action in small claims court instead of arbitration if the claim 
              qualifies.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">12.4 EU/UK Users</h3>
            <p>
              If you are in the EU or UK, you have the right to bring a dispute to your local courts or to use the 
              European Commission&apos;s Online Dispute Resolution platform: 
              <a href="https://ec.europa.eu/consumers/odr" className="text-primary hover:text-primary-dim transition-colors underline ml-1" target="_blank" rel="noopener noreferrer">
                https://ec.europa.eu/consumers/odr
              </a>
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-3xl font-bold mb-4">13. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of Michigan, 
              United States, without regard to its conflict of law provisions.
            </p>
            <p className="mt-2">
              For international users, we respect local consumer protection laws that cannot be waived by contract.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-3xl font-bold mb-4">14. Termination</h2>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">14.1 Termination by You</h3>
            <p>
              You may terminate your account at any time by deleting your account through the Service settings or 
              contacting us at <a href="mailto:support@kinetic.app" className="text-primary hover:text-primary-dim transition-colors underline">support@kinetic.app</a>.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">14.2 Termination by Us</h3>
            <p>We may suspend or terminate your account immediately, without notice, for:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Violation of these Terms</li>
              <li>Fraudulent, abusive, or illegal activity</li>
              <li>Prolonged inactivity (with reasonable notice)</li>
              <li>At our sole discretion for any reason</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">14.3 Effect of Termination</h3>
            <p>Upon termination:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Your right to use the Service ceases immediately</li>
              <li>Your data will be deleted in accordance with our Privacy Policy</li>
              <li>Sections of these Terms that should survive (e.g., disclaimers, liability limitations) remain in effect</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">14.4 Notice Period</h3>
            <p>
              You must report any disputes or issues within <strong>7 days</strong> of the event giving rise to the dispute. 
              Failure to report within this timeframe may result in waiver of your claim.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-3xl font-bold mb-4">15. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. When we make material changes, we will:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Update the &quot;Last Updated&quot; date at the top of this page</li>
              <li>Notify you via email (if you have provided one) or through a prominent notice on the Service</li>
              <li>Provide at least 30 days&apos; notice for significant changes</li>
            </ul>
            <p className="mt-2 font-semibold">
              Your continued use of the Service after changes become effective constitutes acceptance of the revised Terms.
            </p>
            <p className="mt-2">
              If you do not agree to the new Terms, you must stop using the Service and may delete your account.
            </p>
          </section>

          {/* Miscellaneous */}
          <section>
            <h2 className="text-3xl font-bold mb-4">16. Miscellaneous</h2>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">16.1 Entire Agreement</h3>
            <p>
              These Terms, together with our Privacy Policy and any other legal notices published on the Service, 
              constitute the entire agreement between you and Kinetic.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">16.2 Severability</h3>
            <p>
              If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall 
              remain in full force and effect.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">16.3 Waiver</h3>
            <p>
              Our failure to enforce any right or provision of these Terms shall not be deemed a waiver of such right 
              or provision.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">16.4 Assignment</h3>
            <p>
              You may not assign or transfer these Terms without our prior written consent. We may assign these Terms 
              without restriction.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">16.5 Force Majeure</h3>
            <p>
              We are not liable for any delay or failure to perform resulting from causes beyond our reasonable control, 
              including natural disasters, war, terrorism, riots, acts of government, or internet/network failures.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">16.6 Third-Party Services</h3>
            <p>
              The Service may contain links to third-party websites or services. We are not responsible for their 
              content, policies, or practices. Your use of third-party services is at your own risk.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">16.7 Export Compliance</h3>
            <p>
              You agree to comply with all export and import laws and regulations applicable to your use of the Service.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-surface-container p-6 rounded-lg border border-outline">
            <h2 className="text-3xl font-bold mb-4">17. Contact Information</h2>
            <p className="mb-4">
              If you have questions about these Terms, please contact us:
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
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="text-sm text-muted-foreground italic border-t pt-6">
            <p>
              By using Kinetic, you acknowledge that you have read, understood, and agree to be bound by these 
              Terms of Service.
            </p>
            <p className="mt-2">
              These Terms are effective as of April 6, 2026.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
