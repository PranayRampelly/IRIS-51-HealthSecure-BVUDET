
import React from 'react';
import { Lock, Github, Linkedin, Twitter } from 'lucide-react';
import CountUp from '@/components/CountUp';

const Footer = () => {
  const footerSections = [
    {
      title: 'About HealthTech',
      links: [
        { name: 'Our Mission', href: '/contact' },
        { name: 'About Us', href: '/contact' },
        { name: 'Leadership Team', href: '/contact' },
        { name: 'Careers', href: '/contact' },
        { name: 'Press Kit', href: '/contact' },
        { name: 'News & Updates', href: '/contact' }
      ]
    },
    {
      title: 'Products & Features',
      links: [
        { name: 'Zero-Knowledge System', href: '/features' },
        { name: 'Encrypted Storage', href: '/features' },
        { name: 'Consent Management', href: '/features' },
        { name: 'Audit Trail', href: '/features' },
        { name: 'Interoperability', href: '/features' },
        { name: 'Mobile Apps', href: '/contact' }
      ]
    },
    {
      title: 'For Developers',
      links: [
        { name: 'API Documentation', href: '/resources' },
        { name: 'HL7/FHIR Integration', href: '/resources' },
        { name: 'SDKs & Libraries', href: '/resources' },
        { name: 'Sandbox Environment', href: '/resources' },
        { name: 'Code Examples', href: '/resources' },
        { name: 'Developer Community', href: '/contact' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'Terms of Service', href: '/terms-of-service' },
        { name: 'Privacy Policy', href: '/privacy-policy' },
        { name: 'Security Compliance', href: '/compliance' },
        { name: 'HIPAA Compliance', href: '/compliance' },
        { name: 'GDPR Compliance', href: '/compliance' },
        { name: 'Contact Support', href: '/contact' }
      ]
    }
  ];

  return (
    <footer className="bg-health-teal text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Section */}
        <div className="grid lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center space-x-3">
              <img
                src="/Heathtech.png"
                alt="HealthTech Logo"
                className="h-12 w-12 object-contain rounded-xl"
              />
              <div className="font-montserrat">
                <span className="text-xl font-bold">Health</span>
                <span className="text-xl font-medium">Tech</span>
              </div>
            </div>
            <p className="text-white/80 font-open-sans text-sm leading-relaxed">
              Empowering patients with zero-knowledge healthcare data exchange. 
              Your health, your data, your control.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-health-success rounded-full"></div>
                <span className="text-xs font-open-sans text-white/70">HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-health-success rounded-full"></div>
                <span className="text-xs font-open-sans text-white/70">SOC 2 Type II</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-health-success rounded-full"></div>
                <span className="text-xs font-open-sans text-white/70">ISO 27001 Certified</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="font-montserrat font-semibold text-lg text-white">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a 
                      href={link.href} 
                      className="text-white/80 hover:text-health-aqua transition-colors font-open-sans text-sm hover:underline"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-white/20 pt-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-montserrat font-semibold text-lg text-white mb-2">
                Stay Updated
              </h3>
              <p className="text-white/80 font-open-sans text-sm">
                Get the latest updates on healthcare privacy, Zero-Knowledge technology, and product releases.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-health-aqua font-open-sans"
              />
              <button 
                className="bg-health-aqua hover:bg-health-aqua/90 text-white px-6 py-3 rounded-lg font-open-sans font-medium transition-colors whitespace-nowrap"
                onClick={() => {
                  // For now, redirect to contact page for newsletter subscription
                  window.location.href = '/contact';
                }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="border-t border-white/20 pt-8 mb-8">
          <div className="text-center mb-6">
            <h3 className="font-montserrat font-semibold text-lg text-white mb-4">
              Trusted by Leading Organizations
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-montserrat font-bold text-health-aqua">
                <CountUp from={0} to={500} separator="," duration={2} delay={0.2} />K+
              </div>
              <div className="text-xs font-open-sans text-white/70">Patients Protected</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-montserrat font-bold text-health-aqua">
                <CountUp from={0} to={200} duration={2} delay={0.4} />+
              </div>
              <div className="text-xs font-open-sans text-white/70">Healthcare Providers</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-montserrat font-bold text-health-aqua">
                <CountUp from={0} to={50} duration={2} delay={0.6} />+
              </div>
              <div className="text-xs font-open-sans text-white/70">Research Institutions</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-montserrat font-bold text-health-aqua">
                <CountUp from={0} to={99.9} duration={2} delay={0.8} />%
              </div>
              <div className="text-xs font-open-sans text-white/70">Uptime Guarantee</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/20 bg-health-teal/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <p className="text-white/60 text-sm font-open-sans">
                © 2025 HealthTech. All rights reserved.
              </p>
              <div className="flex items-center space-x-4">
                <span className="text-white/60 text-sm font-open-sans">Secured by Zero-Knowledge Proofs</span>
                <div className="w-2 h-2 bg-health-aqua rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <span className="text-white/60 text-sm font-open-sans">Follow us:</span>
              <div className="flex items-center space-x-4">
                <a 
                  href="https://linkedin.com/company/healthtech" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-health-aqua transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href="https://twitter.com/healthtech" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-health-aqua transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                                  <a 
                    href="https://github.com/healthtech" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-health-aqua transition-colors"
                    aria-label="GitHub"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                </div>
              </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
