
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, User, Briefcase, Microscope, Eye, Upload } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Lock,
      title: 'Zero-Knowledge Proofs',
      description: 'Share verifiable information without revealing the underlying data. Prove you meet criteria without exposing sensitive details.',
      color: 'text-health-aqua',
      bgColor: 'bg-health-aqua/10'
    },
    {
      icon: User,
      title: 'Patient Control',
      description: 'You decide what to share, when to share it, and who can access it. Revoke access instantly whenever needed.',
      color: 'text-health-teal',
      bgColor: 'bg-health-teal/10'
    },
    {
      icon: Briefcase,
      title: 'Provider Integration',
      description: 'Seamlessly integrate with existing healthcare systems. Verify patient information in real-time without compromising privacy.',
      color: 'text-health-success',
      bgColor: 'bg-health-success/10'
    },
    {
      icon: Microscope,
      title: 'Research Platform',
      description: 'Enable groundbreaking medical research with anonymized, aggregated data while maintaining individual privacy.',
      color: 'text-health-warning',
      bgColor: 'bg-health-warning/10'
    },
    {
      icon: Eye,
      title: 'Audit Trail',
      description: 'Complete transparency with immutable logs of every data access request and sharing event.',
      color: 'text-health-danger',
      bgColor: 'bg-health-danger/10'
    },
    {
      icon: Upload,
      title: 'Secure Upload',
      description: 'Military-grade encryption for all data uploads with automated verification and validation processes.',
      color: 'text-health-blue-gray',
      bgColor: 'bg-health-blue-gray/10'
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-montserrat font-bold text-health-teal mb-4">
            Revolutionary Healthcare Privacy
          </h2>
          <p className="text-xl text-health-charcoal font-open-sans max-w-3xl mx-auto">
            Advanced cryptographic techniques meet healthcare innovation. 
            Experience the future of medical data sharing.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="border-health-blue-gray/20 hover:border-health-aqua/50 transition-all duration-300 hover:shadow-lg group"
            >
              <CardHeader>
                <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-health-teal font-montserrat">
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

        {/* Security Badges */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 py-8 border-t border-health-blue-gray/20">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-health-success rounded-full animate-pulse"></div>
            <span className="text-sm font-open-sans text-health-charcoal">HIPAA Compliant</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-health-success rounded-full animate-pulse"></div>
            <span className="text-sm font-open-sans text-health-charcoal">SOC 2 Type II</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-health-success rounded-full animate-pulse"></div>
            <span className="text-sm font-open-sans text-health-charcoal">256-bit Encryption</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-health-success rounded-full animate-pulse"></div>
            <span className="text-sm font-open-sans text-health-charcoal">Zero-Trust Architecture</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
