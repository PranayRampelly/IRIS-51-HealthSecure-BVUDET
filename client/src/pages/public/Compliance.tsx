
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, FileCheck, Globe } from 'lucide-react';

const Compliance = () => {
  return (
    <div className="min-h-screen bg-white font-open-sans">
      <Header />
      
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-montserrat font-bold text-health-teal mb-4">
              Compliance & Security
            </h1>
            <p className="text-xl text-health-charcoal max-w-3xl mx-auto">
              HealthTech meets the highest standards for healthcare data protection and regulatory compliance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="border-health-success/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Shield className="w-8 h-8 text-health-success" />
                  <Badge className="bg-health-success text-white">Certified</Badge>
                </div>
                <CardTitle className="text-xl font-montserrat">HIPAA Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-health-charcoal mb-4">
                  Full compliance with Health Insurance Portability and Accountability Act (HIPAA) requirements for protected health information.
                </p>
                <ul className="text-sm text-health-charcoal space-y-2">
                  <li>• Administrative safeguards</li>
                  <li>• Physical safeguards</li>
                  <li>• Technical safeguards</li>
                  <li>• Business associate agreements</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-health-aqua/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Globe className="w-8 h-8 text-health-aqua" />
                  <Badge className="bg-health-aqua text-white">Certified</Badge>
                </div>
                <CardTitle className="text-xl font-montserrat">GDPR Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-health-charcoal mb-4">
                  Full compliance with General Data Protection Regulation (GDPR) for European data protection.
                </p>
                <ul className="text-sm text-health-charcoal space-y-2">
                  <li>• Data minimization principles</li>
                  <li>• Right to be forgotten</li>
                  <li>• Consent management</li>
                  <li>• Data portability rights</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Lock className="w-8 h-8 text-health-teal mb-4" />
                <CardTitle className="text-lg font-montserrat">SOC 2 Type II</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-health-charcoal text-sm">
                  Audited controls for security, availability, processing integrity, confidentiality, and privacy.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileCheck className="w-8 h-8 text-health-success mb-4" />
                <CardTitle className="text-lg font-montserrat">ISO 27001</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-health-charcoal text-sm">
                  International standard for information security management systems and risk management.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="w-8 h-8 text-health-warning mb-4" />
                <CardTitle className="text-lg font-montserrat">FHIR Compliant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-health-charcoal text-sm">
                  Fast Healthcare Interoperability Resources standard for electronic health record data exchange.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16">
            <Card className="bg-health-light-gray/50">
              <CardContent className="pt-8">
                <h2 className="text-2xl font-montserrat font-bold text-health-teal mb-6 text-center">
                  Security Architecture
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-health-teal rounded-full flex items-center justify-center mx-auto mb-3">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-health-teal mb-2">Zero-Knowledge Proofs</h3>
                    <p className="text-sm text-health-charcoal">Verify data without exposing it</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-health-aqua rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-health-teal mb-2">End-to-End Encryption</h3>
                    <p className="text-sm text-health-charcoal">AES-256 encryption at rest and in transit</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-health-success rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileCheck className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-health-teal mb-2">Audit Trails</h3>
                    <p className="text-sm text-health-charcoal">Complete activity logging and monitoring</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-health-warning rounded-full flex items-center justify-center mx-auto mb-3">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-health-teal mb-2">Multi-Factor Auth</h3>
                    <p className="text-sm text-health-charcoal">Enhanced access control and verification</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Compliance;
