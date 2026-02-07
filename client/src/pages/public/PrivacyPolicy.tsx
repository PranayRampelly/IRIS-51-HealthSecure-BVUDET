
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white font-open-sans">
      <Header />
      
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-montserrat font-bold text-health-teal mb-8">
            Privacy Policy
          </h1>
          
          <Card>
            <CardContent className="pt-6">
              <div className="prose max-w-none">
                <p className="text-health-charcoal mb-6">
                  Last updated: {new Date().toLocaleDateString()}
                </p>

                <h2 className="text-2xl font-semibold text-health-teal mb-4">1. Introduction</h2>
                <p className="text-health-charcoal mb-6">
                  HealthTech is committed to protecting your privacy and ensuring the security of your personal health information. 
                  This Privacy Policy explains how we collect, use, and safeguard your data in compliance with HIPAA, GDPR, and other applicable privacy regulations.
                </p>

                <h2 className="text-2xl font-semibold text-health-teal mb-4">2. Zero-Knowledge Architecture</h2>
                <p className="text-health-charcoal mb-6">
                  Our platform uses zero-knowledge proof technology, which means we can verify facts about your health data 
                  without actually seeing or storing your sensitive medical information. This ensures maximum privacy protection.
                </p>

                <h2 className="text-2xl font-semibold text-health-teal mb-4">3. Data Collection and Use</h2>
                <p className="text-health-charcoal mb-4">We collect and process the following types of information:</p>
                <ul className="list-disc pl-6 text-health-charcoal mb-6">
                  <li>Account information (name, email, role)</li>
                  <li>Authentication data (encrypted passwords, 2FA tokens)</li>
                  <li>Usage analytics (anonymized)</li>
                  <li>Audit logs for compliance purposes</li>
                </ul>

                <h2 className="text-2xl font-semibold text-health-teal mb-4">4. Data Sharing</h2>
                <p className="text-health-charcoal mb-6">
                  We only share data with explicit consent and in accordance with zero-knowledge principles. 
                  Healthcare providers, insurance companies, and researchers can only access verified proofs, not raw medical data.
                </p>

                <h2 className="text-2xl font-semibold text-health-teal mb-4">5. Your Rights</h2>
                <p className="text-health-charcoal mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 text-health-charcoal mb-6">
                  <li>Access your personal data</li>
                  <li>Correct inaccuracies</li>
                  <li>Delete your account and data</li>
                  <li>Revoke data sharing permissions</li>
                  <li>Export your data</li>
                </ul>

                <h2 className="text-2xl font-semibold text-health-teal mb-4">6. Security Measures</h2>
                <p className="text-health-charcoal mb-6">
                  We implement industry-leading security measures including end-to-end encryption, 
                  multi-factor authentication, regular security audits, and compliance with healthcare data protection standards.
                </p>

                <h2 className="text-2xl font-semibold text-health-teal mb-4">7. Contact Information</h2>
                <p className="text-health-charcoal">
                  For privacy-related questions, contact our Data Protection Officer at privacy@healthtech.com
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

export default PrivacyPolicy;
