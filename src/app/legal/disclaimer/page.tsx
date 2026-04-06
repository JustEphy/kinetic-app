import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disclaimer | Kinetic',
  description: 'Legal disclaimer for Kinetic - Important information about using our fitness interval timer application.',
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">Disclaimer</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: April 6, 2026</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          {/* Important Notice */}
          <section className="bg-error-container p-6 rounded-lg border-2 border-error">
            <p className="font-bold text-2xl mb-4 text-on-surface">⚠️ IMPORTANT NOTICE</p>
            <p className="font-semibold text-lg">
              PLEASE READ THIS DISCLAIMER CAREFULLY BEFORE USING KINETIC. BY USING THIS APPLICATION, YOU ACKNOWLEDGE 
              THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO THE TERMS OF THIS DISCLAIMER.
            </p>
          </section>

          {/* General Disclaimer */}
          <section>
            <h2 className="text-3xl font-bold mb-4">1. General Disclaimer</h2>
            <p>
              The information and services provided by Kinetic By You Inc. (&quot;Kinetic,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) 
              through the Kinetic fitness interval timer application (the &quot;Service&quot;) are provided for general informational 
              and educational purposes only. The Service is designed as a workout timing tool and should not be interpreted 
              as professional advice of any kind.
            </p>
            <p className="mt-4 font-semibold">
              YOU ASSUME ALL RISKS AND RESPONSIBILITIES ASSOCIATED WITH THE USE OF THE SERVICE AND ANY WORKOUTS OR 
              ACTIVITIES PERFORMED USING THE SERVICE.
            </p>
          </section>

          {/* Not Medical Advice */}
          <section className="bg-secondary-container p-6 rounded-lg border-l-4 border-secondary">
            <h2 className="text-3xl font-bold mb-4 text-on-surface">2. Not Medical, Fitness, or Health Advice</h2>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">2.1 No Professional Advice</h3>
            <p className="font-semibold">
              THE SERVICE, INCLUDING ALL CONTENT, FEATURES, WORKOUT TIMERS, AI-GENERATED WORKOUTS, AND RECOMMENDATIONS, 
              DOES NOT CONSTITUTE AND SHOULD NOT BE CONSTRUED AS MEDICAL, FITNESS, HEALTH, NUTRITIONAL, OR ANY OTHER 
              PROFESSIONAL ADVICE.
            </p>
            <p className="mt-2">
              We are not healthcare providers, licensed fitness professionals, nutritionists, or medical practitioners. 
              The Service is a tool for timing interval workouts and should be used as such.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">2.2 Consult Qualified Professionals</h3>
            <p className="font-semibold">
              BEFORE BEGINNING ANY EXERCISE PROGRAM, DIET, OR FITNESS REGIMEN, YOU SHOULD CONSULT WITH YOUR PHYSICIAN 
              OR OTHER QUALIFIED HEALTHCARE PROVIDER.
            </p>
            <p className="mt-2">This is especially important if you:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Have any pre-existing medical conditions (heart disease, diabetes, asthma, etc.)</li>
              <li>Are taking any medications or undergoing medical treatment</li>
              <li>Have a history of cardiovascular disease or high blood pressure</li>
              <li>Are pregnant, nursing, or planning to become pregnant</li>
              <li>Are over 40 years of age and have been sedentary</li>
              <li>Have any physical limitations, disabilities, or injuries</li>
              <li>Experience chest pain, dizziness, or shortness of breath during physical activity</li>
              <li>Have been advised by a healthcare professional to limit physical activity</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">2.3 Do Not Rely on the Service for Medical Decisions</h3>
            <p>
              Never disregard professional medical advice or delay seeking medical treatment because of information 
              you receive through the Service. If you have a medical emergency, call emergency services immediately.
            </p>
          </section>

          {/* Exercise Risks */}
          <section>
            <h2 className="text-3xl font-bold mb-4">3. Assumption of Risk</h2>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">3.1 Inherent Risks of Exercise</h3>
            <p className="font-semibold">
              PHYSICAL EXERCISE AND ACTIVITY INVOLVE INHERENT RISKS, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Muscle strains, tears, and sprains</li>
              <li>Joint injuries</li>
              <li>Bone fractures</li>
              <li>Cardiovascular stress or events (heart attack, stroke)</li>
              <li>Heat exhaustion or heat stroke</li>
              <li>Dehydration</li>
              <li>Dizziness, fainting, or loss of consciousness</li>
              <li>Aggravation of pre-existing conditions</li>
              <li>In rare cases, permanent disability or death</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">3.2 You Assume All Risks</h3>
            <p className="font-semibold">
              BY USING THE SERVICE, YOU VOLUNTARILY ASSUME ALL RISKS ASSOCIATED WITH EXERCISE AND PHYSICAL ACTIVITY.
            </p>
            <p className="mt-2">You acknowledge and agree that:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>You are solely responsible for your own safety during exercise</li>
              <li>You will exercise at an intensity appropriate for your fitness level</li>
              <li>You will use proper form, technique, and equipment</li>
              <li>You will ensure a safe exercise environment</li>
              <li>You will stop exercising immediately if you experience pain, discomfort, or unusual symptoms</li>
              <li>You understand that intensity levels and durations suggested by the Service may not be appropriate for you</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">3.3 Listen to Your Body</h3>
            <p className="font-semibold">
              STOP EXERCISING IMMEDIATELY IF YOU EXPERIENCE ANY OF THE FOLLOWING:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Chest pain or pressure</li>
              <li>Severe shortness of breath</li>
              <li>Dizziness or lightheadedness</li>
              <li>Nausea or vomiting</li>
              <li>Irregular heartbeat or palpitations</li>
              <li>Sharp or shooting pain</li>
              <li>Joint or muscle pain that worsens</li>
              <li>Numbness or tingling</li>
              <li>Sudden weakness</li>
              <li>Vision problems</li>
            </ul>
            <p className="mt-2 font-semibold">
              If you experience any of these symptoms, seek medical attention immediately if necessary.
            </p>
          </section>

          {/* AI-Generated Content */}
          <section>
            <h2 className="text-3xl font-bold mb-4">4. AI-Generated Workout Disclaimer</h2>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">4.1 Automated Content</h3>
            <p>
              Some workout configurations on the Service are generated using artificial intelligence (AI) technology 
              powered by Groq AI. These AI-generated workouts are created by algorithms, not by human fitness professionals.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">4.2 No Personalization</h3>
            <p className="font-semibold">
              AI-GENERATED WORKOUTS ARE NOT PERSONALIZED TO YOUR INDIVIDUAL FITNESS LEVEL, HEALTH STATUS, LIMITATIONS, 
              OR GOALS.
            </p>
            <p className="mt-2">
              These workouts are general suggestions and may not be appropriate or safe for you. You are responsible 
              for evaluating whether an AI-generated workout is suitable for your abilities.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">4.3 Potential for Errors</h3>
            <p>
              AI-generated content may contain errors, inaccuracies, or inappropriate recommendations. We do not 
              guarantee the accuracy, completeness, suitability, or safety of AI-generated workouts.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">4.4 Review Before Use</h3>
            <p className="font-semibold">
              YOU MUST CAREFULLY REVIEW AND VALIDATE ALL AI-GENERATED WORKOUTS BEFORE USE.
            </p>
            <p className="mt-2">
              Modify or discard any suggestions that appear excessive, inappropriate, or unsafe for your fitness level.
            </p>
          </section>

          {/* Accuracy of Information */}
          <section>
            <h2 className="text-3xl font-bold mb-4">5. Accuracy and Completeness of Information</h2>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">5.1 No Guarantees</h3>
            <p>
              While we strive to provide accurate and helpful information, we make no representations or warranties 
              regarding the accuracy, completeness, reliability, or suitability of any content, features, or data 
              provided through the Service.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">5.2 Calorie Estimates</h3>
            <p className="font-semibold">
              CALORIE BURN ESTIMATES ARE APPROXIMATIONS ONLY AND MAY NOT BE ACCURATE.
            </p>
            <p className="mt-2">
              Actual calorie expenditure varies widely based on individual factors including age, gender, weight, 
              body composition, metabolism, exercise intensity, and fitness level. Do not rely on these estimates 
              for medical, dietary, or weight management decisions.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">5.3 Time and Duration Data</h3>
            <p>
              The Service provides timing functions for intervals and workouts. While we strive for accuracy, timer 
              functions may be affected by device performance, battery status, or software issues. Do not rely on 
              the Service for critical time-sensitive applications.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">5.4 Third-Party Content</h3>
            <p>
              The Service may include content or data from third-party sources (such as Groq AI). We are not 
              responsible for the accuracy, legality, or appropriateness of third-party content.
            </p>
          </section>

          {/* No Guaranteed Results */}
          <section>
            <h2 className="text-3xl font-bold mb-4">6. No Guaranteed Results</h2>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">6.1 Individual Results Vary</h3>
            <p className="font-semibold">
              WE MAKE NO GUARANTEES, REPRESENTATIONS, OR WARRANTIES REGARDING ANY RESULTS YOU MAY ACHIEVE BY USING 
              THE SERVICE.
            </p>
            <p className="mt-2">
              Results from exercise programs vary from person to person depending on numerous factors including 
              starting fitness level, genetics, effort, consistency, diet, sleep, stress levels, and adherence to 
              proper technique.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">6.2 No Weight Loss or Fitness Guarantees</h3>
            <p>
              We do not guarantee any specific outcomes such as:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Weight loss or fat loss</li>
              <li>Muscle gain or strength improvements</li>
              <li>Improved athletic performance</li>
              <li>Health improvements</li>
              <li>Aesthetic changes</li>
              <li>Injury prevention or recovery</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">6.3 Past Performance Not Indicative</h3>
            <p>
              Statistics and progress data shown in the Service (such as streaks, totals, or personal records) reflect 
              past performance only and do not predict future results.
            </p>
          </section>

          {/* Technical Limitations */}
          <section>
            <h2 className="text-3xl font-bold mb-4">7. Technical Limitations and Service Availability</h2>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">7.1 &quot;As Is&quot; Basis</h3>
            <p className="font-semibold">
              THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">7.2 No Warranty of Reliability</h3>
            <p>
              We do not warrant that:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>The Service will be uninterrupted, timely, secure, or error-free</li>
              <li>Defects will be corrected</li>
              <li>The Service or servers are free of viruses or harmful components</li>
              <li>Timer functions will be precise or accurate</li>
              <li>Data will be saved or retrievable at all times</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">7.3 Device Compatibility</h3>
            <p>
              The Service&apos;s functionality may vary depending on your device, browser, operating system, and internet 
              connection. We do not guarantee compatibility with all devices or configurations.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">7.4 Data Loss</h3>
            <p className="font-semibold">
              WE ARE NOT RESPONSIBLE FOR ANY LOSS OF DATA, WORKOUTS, STATISTICS, OR OTHER INFORMATION.
            </p>
            <p className="mt-2">
              You should maintain your own backups of important information. For guest users, data stored in browser 
              localStorage may be lost if you clear your browser data or switch devices.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-3xl font-bold mb-4">8. Third-Party Services and Links</h2>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">8.1 External Services</h3>
            <p>
              The Service integrates with third-party services including:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Supabase (database and authentication)</li>
              <li>Groq AI (workout generation)</li>
              <li>Google OAuth (optional login)</li>
            </ul>
            <p className="mt-2 font-semibold">
              WE ARE NOT RESPONSIBLE FOR THE AVAILABILITY, ACCURACY, SECURITY, OR PRIVACY PRACTICES OF THIRD-PARTY SERVICES.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">8.2 Third-Party Links</h3>
            <p>
              The Service may contain links to third-party websites or resources. These links are provided for 
              convenience only. We do not endorse, control, or assume responsibility for any third-party content, 
              products, services, or practices.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">8.3 Use at Your Own Risk</h3>
            <p>
              Your use of third-party services and your navigation to external websites is entirely at your own risk. 
              You should review the terms and privacy policies of any third-party services you use.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="bg-surface-container-high p-6 rounded-lg border border-outline">
            <h2 className="text-3xl font-bold mb-4">9. Limitation of Liability</h2>
            
            <p className="font-bold text-lg mb-3 uppercase">TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
            
            <p className="font-semibold mb-2">
              IN NO EVENT SHALL KINETIC BY YOU INC., ITS OFFICERS, DIRECTORS, EMPLOYEES, CONTRACTORS, AGENTS, 
              AFFILIATES, OR SUPPLIERS BE LIABLE FOR ANY:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Personal injury, illness, disability, or death</li>
              <li>Property damage</li>
              <li>Direct, indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, revenue, data, use, goodwill, or other intangible losses</li>
              <li>Damages resulting from unauthorized access to or alteration of your data</li>
              <li>Damages resulting from errors, mistakes, or inaccuracies in content</li>
              <li>Damages from your reliance on any information obtained through the Service</li>
            </ul>
            <p className="mt-4 font-semibold">
              THIS LIMITATION APPLIES WHETHER THE ALLEGED LIABILITY IS BASED ON CONTRACT, TORT, NEGLIGENCE, STRICT 
              LIABILITY, OR ANY OTHER BASIS, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p className="mt-4 text-sm">
              Some jurisdictions do not allow the exclusion or limitation of certain damages. In such jurisdictions, 
              our liability is limited to the maximum extent permitted by law.
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-3xl font-bold mb-4">10. Indemnification</h2>
            <p className="font-semibold">
              You agree to indemnify, defend, and hold harmless Kinetic By You Inc., its officers, directors, employees, 
              contractors, agents, and affiliates from and against any and all claims, liabilities, damages, losses, 
              costs, expenses (including reasonable attorneys&apos; fees), or injuries (including death) arising from or 
              related to:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Your use or misuse of the Service</li>
              <li>Your participation in any exercise or physical activity related to the Service</li>
              <li>Your violation of these terms or any applicable laws</li>
              <li>Your violation of any third-party rights</li>
              <li>Any content you submit or create</li>
            </ul>
          </section>

          {/* Jurisdictional Variations */}
          <section>
            <h2 className="text-3xl font-bold mb-4">11. Jurisdictional Variations</h2>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">11.1 Consumer Protection Laws</h3>
            <p>
              Nothing in this Disclaimer is intended to limit or exclude any rights you may have under applicable 
              consumer protection laws that cannot be waived by contract.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">11.2 EU/UK Users</h3>
            <p>
              If you are in the European Union or United Kingdom, certain limitations of liability may not apply to 
              you under EU consumer protection directives or UK consumer rights legislation.
            </p>

            <h3 className="text-xl font-semibold mt-4 mb-2">11.3 California Users</h3>
            <p>
              California Civil Code Section 1542 provides: &quot;A general release does not extend to claims that the 
              creditor or releasing party does not know or suspect to exist in his or her favor at the time of executing 
              the release, and that if known by him or her would have materially affected his or her settlement with 
              the debtor or released party.&quot;
            </p>
            <p className="mt-2">
              You hereby waive any rights under Section 1542 or similar statutes.
            </p>
          </section>

          {/* Updates */}
          <section>
            <h2 className="text-3xl font-bold mb-4">12. Changes to This Disclaimer</h2>
            <p>
              We reserve the right to modify this Disclaimer at any time. Changes will be posted on this page with 
              an updated &quot;Last Updated&quot; date. Material changes will be communicated through the Service or via email.
            </p>
            <p className="mt-2 font-semibold">
              Your continued use of the Service after changes become effective constitutes acceptance of the modified 
              Disclaimer.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-surface-container p-6 rounded-lg border border-outline">
            <h2 className="text-3xl font-bold mb-4">13. Questions</h2>
            <p className="mb-4">
              If you have questions about this Disclaimer, please contact us:
            </p>
            <div className="space-y-2">
              <p><strong>Email:</strong> <a href="mailto:support@kinetic.app" className="text-primary hover:text-primary-dim transition-colors underline">support@kinetic.app</a></p>
              <p><strong>Company:</strong> Kinetic By You Inc.</p>
              <p><strong>Location:</strong> Detroit, MI, United States</p>
            </div>
          </section>

          {/* Final Acknowledgment */}
          <section className="border-t-2 border-error pt-6">
            <p className="font-bold text-xl mb-3 text-on-surface">
              ACKNOWLEDGMENT
            </p>
            <p className="font-semibold">
              BY USING THE KINETIC SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THIS DISCLAIMER IN ITS ENTIRETY, 
              UNDERSTAND ITS CONTENTS, AND AGREE TO BE BOUND BY ITS TERMS.
            </p>
            <p className="mt-4 font-semibold">
              YOU FURTHER ACKNOWLEDGE THAT YOU ARE USING THE SERVICE AT YOUR OWN RISK AND THAT YOU ASSUME FULL 
              RESPONSIBILITY FOR ANY INJURIES, DAMAGES, OR LOSSES THAT MAY RESULT FROM YOUR USE OF THE SERVICE.
            </p>
            <p className="mt-4 text-sm italic">
              This Disclaimer is effective as of April 6, 2026.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
