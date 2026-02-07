
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-white font-open-sans">
      <Header />
      
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-montserrat font-bold text-health-teal mb-8">
            Terms of Service
          </h1>
          
          <Card>
            <CardContent className="pt-6">
              <div className="prose max-w-none">
                <p className="text-health-charcoal mb-6">
                  Last updated: {new Date().toLocaleDateString()}
                </p>

                <h2 className="text-2xl font-semibold text-health-teal mb-4">1. Acceptance of Terms</h2>
                <p className="text-health-charcoal mb-6">
                  By accessing and using HealthTech's zero-knowledge healthcare data exchange platform, 
                  you agree to be bound by these Terms of Service and all applicable laws and regulations.
                </p>

                <h2 className="text-2xl font-semibold text-health-teal mb-4">2. Service Description</h2>
                <p className="text-health-charcoal mb-6">
                  HealthTech provides a secure platform for healthcare data verification and sharing using 
                  zero-knowledge proof technology. The service enables patients, healthcare providers, 
                  insurance companies, and researchers to interact with health data while maintaining privacy.
                </p>

                <h2 className="text-2xl font-semibold text-health-teal mb-4">3. User Responsibilities</h2>
                <p className="text-health-charcoal mb-4">Users must:</p>
                <ul className="list-disc pl-6 text-health-charcoal mb-6">
                  <li>Provide accurate and truthful information</li>
                  <li>Maintain the security of their account credentials</li>
                  <li>Comply with applicable healthcare regulations</li>
                  <li>Respect patient privacy and consent requirements</li>
                  <li>Use the platform only for legitimate healthcare purposes</li>
                </ul>

                <h2 className="text-2xl font-semibold text-health-teal mb-4">4. Data Ownership and Rights</h2>
                <p className="text-health-charcoal mb-6">
                  Patients retain full ownership of their health data. Healthcare providers and other users 
                  can only access verified proofs with explicit patient consent. All data sharing is logged and auditable.
                </p>

                <h2 className="text-2xl font-semibold text-health-teal mb-4">5. Compliance</h2>
                <p className="text-health-charcoal mb-6">
                  Our platform is designed to comply with HIPAA, GDPR, and other applicable healthcare data protection regulations. 
                  Users are responsible for ensuring their use of the platform complies with their local regulations.
                </p>

                <h2 className="text-2xl font-semibold text-health-teal mb-4">6. Limitation of Liability</h2>
                <p className="text-health-charcoal mb-6">
                  HealthTech provides the platform "as is" and disclaims all warranties. We are not liable for 
                  any indirect, incidental, or consequential damages arising from use of the service.
                </p>

                <h2 className="text-2xl font-semibold text-health-teal mb-4">7. Termination</h2>
                <p className="text-health-charcoal mb-6">
                  Either party may terminate the service agreement at any time. Upon termination, 
                  users may export their data and all access permissions will be revoked.
                </p>

                <h2 className="text-2xl font-semibold text-health-teal mb-4">8. Contact Information</h2>
                <p className="text-health-charcoal">
                  For questions about these terms, contact us at legal@healthtech.com
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfService;
