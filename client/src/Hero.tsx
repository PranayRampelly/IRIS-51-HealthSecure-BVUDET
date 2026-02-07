
import React from 'react';
import { Button } from '@/components/ui/button';
import LogoLoop from '@/components/LogoLoop';
import { Card } from '@/components/ui/card';
import { Lock, User, Briefcase, Microscope, Play, ArrowRight } from 'lucide-react';
import CountUp from '@/components/CountUp';

const Hero = () => {
  return (
    <section id="hero" className="relative min-h-screen bg-gradient-to-br from-health-light-gray via-white to-health-aqua/5 py-20 overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-health-teal rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-32 h-32 border border-health-aqua rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 border border-health-teal rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Subtle animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-health-teal/5 via-health-aqua/5 to-health-light-gray/5 animate-pulse"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Column - Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-montserrat font-bold text-health-teal leading-tight">
                Your Medical Data.
                <br />
                <span className="text-health-aqua">Your Control.</span>
                <br />
                <span className="text-3xl lg:text-4xl font-medium">Verified Without Exposure.</span>
              </h1>
              
              <div className="w-24 h-1 bg-health-aqua"></div>
              
              <p className="text-xl text-health-charcoal font-open-sans leading-relaxed">
                HealthTech leverages Zero-Knowledge Proofs to let you share proven health facts—no full records required. 
                Experience trust and privacy at scale.
              </p>
              
              <p className="text-lg text-health-charcoal/80 font-open-sans leading-relaxed">
                Control your medical data with revolutionary zero-knowledge proofs. Share exactly what's needed, 
                when it's needed, without revealing your full health records.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-health-aqua hover:bg-health-aqua/90 text-white px-8 py-4 text-lg font-open-sans font-medium group transform hover:scale-105 transition-all duration-200 shadow-lg"
                onClick={() => window.location.href = '/signup'}
              >
                Get Started — It's Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-health-teal text-health-teal hover:bg-health-teal hover:text-white px-8 py-4 text-lg font-open-sans font-medium group"
                onClick={() => window.location.href = '/contact'}
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo Video
              </Button>
            </div>

          </div>

          {/* Right Column - Interactive Demo & Animation */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {/* Zero-Knowledge Proof Demo */}
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-health-blue-gray/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-montserrat font-semibold text-health-teal">
                    Zero-Knowledge Proof Demo
                  </h3>
                  <div className="relative group">
                    <div className="w-7 h-7 bg-health-aqua/10 border-2 border-health-aqua rounded-lg flex items-center justify-center transition-all duration-300 group-hover:bg-health-aqua group-hover:scale-110 group-hover:shadow-lg">
                      <Lock className="w-4 h-4 text-health-aqua group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-health-success rounded-full border-2 border-white shadow-sm"></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-health-light-gray rounded-lg hover:bg-health-success/10 transition-colors">
                    <span className="text-sm font-open-sans text-health-charcoal">Age verification (18+)</span>
                    <div className="w-3 h-3 bg-health-success rounded-full animate-pulse"></div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-health-light-gray rounded-lg hover:bg-health-success/10 transition-colors">
                    <span className="text-sm font-open-sans text-health-charcoal">No diabetes history</span>
                    <div className="w-3 h-3 bg-health-success rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-health-light-gray rounded-lg hover:bg-health-aqua/10 transition-colors">
                    <span className="text-sm font-open-sans text-health-charcoal">Current medications: None disclosed</span>
                    <div className="w-3 h-3 bg-health-aqua rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-health-blue-gray/20">
                  <p className="text-xs text-health-charcoal/60 font-open-sans">
                    ✓ Insurance verified without revealing full medical history
                  </p>
                  <p className="text-xs text-health-success font-open-sans mt-1">
                    Animation illustrating Zero-Knowledge data exchange
                  </p>
                </div>
              </div>
            </Card>

            {/* Security Badges */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-gradient-to-br from-health-aqua/10 to-health-aqua/5 border-health-aqua/20 hover:shadow-lg transition-all duration-300 group">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-montserrat font-bold text-health-teal group-hover:scale-110 transition-transform">256-bit</div>
                  <div className="text-sm text-health-charcoal font-open-sans">Encryption</div>
                </div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-br from-health-teal/10 to-health-teal/5 border-health-teal/20 hover:shadow-lg transition-all duration-300 group">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-montserrat font-bold text-health-teal group-hover:scale-110 transition-transform">HIPAA</div>
                  <div className="text-sm text-health-charcoal font-open-sans">Compliant</div>
                </div>
              </Card>
            </div>

            {/* Additional Trust Indicators */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-gradient-to-br from-health-success/10 to-health-success/5 border-health-success/20 hover:shadow-lg transition-all duration-300 group">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-montserrat font-bold text-health-teal group-hover:scale-110 transition-transform">SOC 2</div>
                  <div className="text-sm text-health-charcoal font-open-sans">Type II</div>
                </div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-br from-health-warning/10 to-health-warning/5 border-health-warning/20 hover:shadow-lg transition-all duration-300 group">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-montserrat font-bold text-health-teal group-hover:scale-110 transition-transform">
                    <CountUp from={0} to={99.9} duration={2} delay={0.5} />%
                  </div>
                  <div className="text-sm text-health-charcoal font-open-sans">Uptime</div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Trust Indicators - Full Width */}
        <div className="mt-20 pt-12 border-t border-health-blue-gray/20">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-montserrat font-bold text-health-teal mb-4">
              Trusted by Leading Healthcare Organizations
            </h2>
            <p className="text-lg text-health-charcoal/70 font-open-sans mb-8 max-w-2xl mx-auto">
              Join thousands of healthcare providers, hospitals, and technology companies who trust our platform
            </p>
            <div className="w-full" style={{ height: '100px', position: 'relative', overflow: 'hidden' }}>
              <LogoLoop
                logos={[
                  { src: '/logos/apollo.svg?v=2', alt: 'Apollo Hospitals', href: 'https://www.apollohospitals.com' },
                  { src: '/logos/fortis.svg?v=2', alt: 'Fortis Healthcare', href: 'https://www.fortishealthcare.com' },
                  { src: '/logos/max.svg?v=2', alt: 'Max Healthcare', href: 'https://www.maxhealthcare.in' },
                  { src: '/logos/narayana.svg?v=2', alt: 'Narayana Health', href: 'https://www.narayanahealth.org' },
                  { src: '/logos/manipal.svg?v=2', alt: 'Manipal Hospitals', href: 'https://www.manipalhospitals.com' },
                  { src: '/logos/cloudnine.svg?v=2', alt: 'Cloudnine Hospitals', href: 'https://www.cloudninecare.com' },
                  { src: '/logos/lalpathlabs.svg?v=2', alt: 'Dr. Lal PathLabs', href: 'https://www.lalpathlabs.com' },
                  { src: '/logos/srl.svg?v=2', alt: 'SRL Diagnostics', href: 'https://www.srlworld.com' },
                  { src: '/logos/metropolis.svg?v=2', alt: 'Metropolis Healthcare', href: 'https://www.metropolisindia.com' },
                  { src: '/logos/practo.svg?v=2', alt: 'Practo', href: 'https://www.practo.com' },
                  { src: '/logos/tata1mg.svg?v=2', alt: 'Tata 1mg', href: 'https://www.1mg.com' },
                  { src: '/logos/pharmeasy.svg?v=2', alt: 'PharmEasy', href: 'https://www.pharmeasy.in' },
                  { src: '/logos/netmeds.svg?v=2', alt: 'Netmeds', href: 'https://www.netmeds.com' },
                  { src: '/logos/medibuddy.svg?v=2', alt: 'MediBuddy', href: 'https://www.medibuddy.in' },
                  { src: '/logos/portea.svg?v=2', alt: 'Portea', href: 'https://www.portea.com' },
                  { src: '/logos/starhealth.svg?v=2', alt: 'Star Health', href: 'https://www.starhealth.in' },
                  { src: '/logos/nivabupa.svg?v=2', alt: 'Niva Bupa', href: 'https://www.nivabupa.com' },
                  { src: '/logos/abh.svg?v=2', alt: 'Aditya Birla Health Insurance', href: 'https://www.adityabirlacapital.com/healthinsurance' },
                  { src: '/logos/hdfcergo.svg?v=2', alt: 'HDFC ERGO Health', href: 'https://www.hdfcergo.com' },
                ]}
                speed={60}
                direction="left"
                logoHeight={50}
                gap={100}
                pauseOnHover
                scaleOnHover
                fadeOut
                fadeOutColor="#ffffff"
                ariaLabel="Healthcare technology partners"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
