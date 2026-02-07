
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, File, Shield, Lock, Eye, CheckCircle } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: User,
      title: 'Patient Control & Consent',
      description: 'Patients securely upload their medical records or connect hospital EHR accounts. They decide exactly what to share and with whom—right from their personal dashboard.',
      features: [
        'Secure two-factor authentication',
        'Encrypted cloud storage (AES-256)',
        'View and manage all health data in one place'
      ],
      iconColor: 'text-health-teal',
      bgColor: 'bg-health-teal/10',
      borderColor: 'border-health-teal/20'
    },
    {
      icon: File,
      title: 'Prove Facts Without Revealing',
      description: 'When a doctor, insurer, or researcher needs proof—say, allergy status or treatment dates—they request a proof. Our system uses Zero-Knowledge technology to generate a cryptographic proof without disclosing full records.',
      features: [
        'Request and generate proofs in seconds',
        'Proofs verify conditions like \'No penicillin allergy\' or \'Completed treatment\'',
        'All proofs have digital signatures and timestamps'
      ],
      iconColor: 'text-health-aqua',
      bgColor: 'bg-health-aqua/10',
      borderColor: 'border-health-aqua/20'
    },
    {
      icon: Shield,
      title: 'Audit & Compliance',
      description: 'Every access is logged in an immutable audit trail. Patients see exactly who accessed what data and why. Admins maintain compliance with HIPAA, GDPR, and local regulations.',
      features: [
        'Real-time alerts for unusual access',
        'Downloadable audit reports (CSV/PDF)',
        'Integrations with government health databases for compliance checks'
      ],
      iconColor: 'text-health-success',
      bgColor: 'bg-health-success/10',
      borderColor: 'border-health-success/20'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-health-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-montserrat font-bold text-health-teal mb-6">
            How Our Zero-Knowledge Healthcare Platform Works
          </h2>
          <div className="w-24 h-1 bg-health-aqua mx-auto mb-6"></div>
          <p className="text-xl text-health-charcoal/80 font-open-sans max-w-3xl mx-auto">
            Experience the future of healthcare data exchange with military-grade privacy and seamless interoperability.
          </p>
        </div>

        {/* Three Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <Card 
              key={index}
              className={`${step.borderColor} hover:shadow-xl transition-all duration-300 group relative overflow-hidden`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
                  <step.icon className="w-full h-full" />
                </div>
              </div>
              
              <CardHeader className="relative">
                <div className={`w-16 h-16 ${step.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <step.icon className={`w-8 h-8 ${step.iconColor}`} />
                </div>
                <CardTitle className="text-xl font-montserrat font-semibold text-health-teal">
                  {step.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative">
                <p className="text-health-charcoal/80 font-open-sans leading-relaxed mb-6">
                  {step.description}
                </p>
                
                <div className="space-y-3">
                  {step.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-health-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-open-sans text-health-charcoal/70">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Process Flow Visualization */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-health-blue-gray/20">
          <h3 className="text-2xl font-montserrat font-semibold text-health-teal text-center mb-8">
            Zero-Knowledge Proof Process Flow
          </h3>
          
          <div className="grid md:grid-cols-5 gap-4 items-center">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-health-teal/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-6 h-6 text-health-teal" />
              </div>
              <p className="text-sm font-open-sans text-health-charcoal">Patient uploads records</p>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex justify-center">
              <div className="w-8 h-0.5 bg-health-aqua"></div>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-health-aqua/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6 text-health-aqua" />
              </div>
              <p className="text-sm font-open-sans text-health-charcoal">Data encrypted & stored</p>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex justify-center">
              <div className="w-8 h-0.5 bg-health-aqua"></div>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-health-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Eye className="w-6 h-6 text-health-success" />
              </div>
              <p className="text-sm font-open-sans text-health-charcoal">Proof generated & verified</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-lg font-open-sans text-health-charcoal/80 mb-6">
            Ready to experience the future of healthcare data privacy?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="bg-health-aqua hover:bg-health-aqua/90 text-white px-8 py-3 rounded-lg font-open-sans font-medium transition-all hover:scale-105"
              onClick={() => window.location.href = '/signup'}
            >
              Start Free Trial
            </button>
            <button 
              className="border border-health-teal text-health-teal hover:bg-health-teal hover:text-white px-8 py-3 rounded-lg font-open-sans font-medium transition-all"
              onClick={() => window.location.href = '/contact'}
            >
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
