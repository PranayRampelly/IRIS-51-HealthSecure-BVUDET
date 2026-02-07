
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, CheckCircle, Globe, Database } from 'lucide-react';

const Security = () => {
  const securityFeatures = [
    {
      icon: Shield,
      title: 'Zero-Knowledge Proofs',
      description: 'Cryptographically prove facts about your health without revealing the underlying data. Our ZK-SNARK implementation ensures mathematical certainty without exposure.',
      color: 'text-health-teal',
      bgColor: 'bg-health-teal/10'
    },
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description: 'All data is encrypted with AES-256 at rest and in transit. Keys are managed using Hardware Security Modules (HSMs) with multi-party computation.',
      color: 'text-health-aqua',
      bgColor: 'bg-health-aqua/10'
    },
    {
      icon: Database,
      title: 'Decentralized Architecture',
      description: 'No single point of failure. Health data is distributed across multiple secure nodes with blockchain-based integrity verification.',
      color: 'text-health-success',
      bgColor: 'bg-health-success/10'
    },
    {
      icon: Eye,
      title: 'Immutable Audit Trail',
      description: 'Every data access, proof generation, and sharing event is recorded in an unchangeable ledger with timestamp and digital signatures.',
      color: 'text-health-warning',
      bgColor: 'bg-health-warning/10'
    },
    {
      icon: Globe,
      title: 'Global Compliance',
      description: 'Built-in compliance with HIPAA, GDPR, PIPEDA, and other international healthcare privacy regulations from day one.',
      color: 'text-health-danger',
      bgColor: 'bg-health-danger/10'
    },
    {
      icon: CheckCircle,
      title: 'Multi-Factor Authentication',
      description: 'Biometric authentication, hardware tokens, and behavioral analysis ensure only authorized users can access the system.',
      color: 'text-health-blue-gray',
      bgColor: 'bg-health-blue-gray/10'
    }
  ];

  const certifications = [
    { name: 'SOC 2 Type II', status: 'Certified' },
    { name: 'HIPAA Compliant', status: 'Verified' },
    { name: 'ISO 27001', status: 'Certified' },
    { name: 'GDPR Ready', status: 'Compliant' },
    { name: 'FedRAMP', status: 'In Progress' },
    { name: 'FIPS 140-2', status: 'Level 3' }
  ];

  return (
    <section id="security" className="py-20 bg-health-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-montserrat font-bold text-health-teal mb-6">
            Zero-Knowledge & Encryption Security
          </h2>
          <div className="w-24 h-1 bg-health-aqua mx-auto mb-6"></div>
          <p className="text-xl text-health-charcoal/80 font-open-sans max-w-3xl mx-auto">
            Military-grade security meets cutting-edge cryptography. Your health data has never been more secure.
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {securityFeatures.map((feature, index) => (
            <Card 
              key={index}
              className="border-health-blue-gray/20 hover:border-health-aqua/50 hover:shadow-xl transition-all duration-300 group"
            >
              <CardHeader>
                <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-lg font-montserrat font-semibold text-health-teal">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-health-charcoal/80 font-open-sans leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Technical Deep Dive */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-health-blue-gray/20 mb-16">
          <h3 className="text-2xl font-montserrat font-semibold text-health-teal mb-8 text-center">
            How Zero-Knowledge Proofs Work in Healthcare
          </h3>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-lg font-montserrat font-medium text-health-teal">
                  Traditional Data Sharing
                </h4>
                <div className="p-4 bg-health-danger/10 rounded-lg border border-health-danger/20">
                  <p className="text-sm font-open-sans text-health-charcoal/80">
                    ❌ Full medical records exposed<br/>
                    ❌ Privacy risks and data breaches<br/>
                    ❌ Over-sharing sensitive information<br/>
                    ❌ Compliance challenges
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-lg font-montserrat font-medium text-health-teal">
                  Zero-Knowledge Approach
                </h4>
                <div className="p-4 bg-health-success/10 rounded-lg border border-health-success/20">
                  <p className="text-sm font-open-sans text-health-charcoal/80">
                    ✅ Prove facts without revealing data<br/>
                    ✅ Mathematical certainty of truth<br/>
                    ✅ Share only what's necessary<br/>
                    ✅ Built-in privacy compliance
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-health-teal/5 to-health-aqua/5 p-6 rounded-xl">
              <h4 className="text-lg font-montserrat font-medium text-health-teal mb-4">
                Example: Allergy Verification
              </h4>
              <div className="space-y-3 text-sm font-open-sans">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-health-aqua rounded-full"></div>
                  <span>Patient has penicillin allergy in their record</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-health-aqua rounded-full"></div>
                  <span>Doctor requests allergy verification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-health-success rounded-full"></div>
                  <span>System generates proof: "Patient has penicillin allergy"</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-health-success rounded-full"></div>
                  <span>Doctor receives confirmation without seeing full medical history</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Certifications and Compliance */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-health-blue-gray/20">
          <h3 className="text-2xl font-montserrat font-semibold text-health-teal mb-8 text-center">
            Certifications & Compliance
          </h3>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((cert, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-health-light-gray rounded-lg">
                <span className="font-open-sans font-medium text-health-charcoal">
                  {cert.name}
                </span>
                <span className="text-sm font-open-sans text-health-success bg-health-success/10 px-3 py-1 rounded-full">
                  {cert.status}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm font-open-sans text-health-charcoal/60 mb-4">
              Regular security audits by leading cybersecurity firms
            </p>
            <button 
              className="bg-health-teal hover:bg-health-teal/90 text-white px-6 py-2 rounded-lg font-open-sans font-medium transition-all"
              onClick={() => window.location.href = '/compliance'}
            >
              View Security Documentation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Security;
