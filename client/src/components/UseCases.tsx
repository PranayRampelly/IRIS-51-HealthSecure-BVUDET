
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { User, Stethoscope, Briefcase, Microscope, Settings, Key, Shield, FileText, CheckCircle, Database, Search, ArrowRight, Zap, Lock, Eye, Globe, Users, TrendingUp, Clock, Award, Star } from 'lucide-react';
import CountUp from '@/components/CountUp';

const UseCases = () => {
  const roles = [
    {
      id: 'patient',
      title: 'Patient',
      subtitle: 'Complete Data Sovereignty',
      heading: 'Patient – Your Data, Your Terms',
      icon: User,
      keyIcon: Key,
      description: 'Take complete control of your health data with enterprise-grade security and granular privacy controls.',
      stats: [
        { label: 'Data Types', value: '50+' },
        { label: 'EHR Systems', value: '100+' },
        { label: 'Access Control', value: 'Granular' }
      ],
      features: [
        {
          title: 'Advanced Authentication & Security',
          description: 'Multi-factor authentication with biometric support, hardware security keys, and enterprise-grade encryption. Strong password policies with real-time breach monitoring.',
          icon: Shield
        },
        {
          title: 'Comprehensive Record Management',
          description: 'Upload PDFs, images, DICOM files, or seamlessly connect to 100+ EHR systems via HL7/FHIR APIs. Automated data validation and standardization.',
          icon: FileText
        },
        {
          title: 'Intelligent Health Dashboard',
          description: 'AI-powered timeline view of all medical records with smart filtering, trend analysis, and predictive health insights. Export capabilities for personal records.',
          icon: TrendingUp
        },
        {
          title: 'Granular Permission Control',
          description: 'Fine-grained access control with time-limited permissions, purpose-based sharing, and automatic expiration. Share specific data points without exposing full records.',
          icon: Key
        },
        {
          title: 'Zero-Knowledge Proof Generation',
          description: 'Generate cryptographic proofs for specific medical conditions (e.g., \'HbA1c < 7%\', \'No allergies to penicillin\') with preview and validation before sharing.',
          icon: Eye
        },
        {
          title: 'Comprehensive Access Monitoring',
          description: 'Real-time audit logs with detailed analytics, exportable reports (CSV/PDF), and instant notifications for all data access requests.',
          icon: Clock
        },
        {
          title: 'Instant Access Revocation',
          description: 'One-click revocation with automatic notifications, blockchain-based immutable logs, and compliance reporting for all access changes.',
          icon: Lock
        }
      ],
      ctaText: 'Create Your Account',
      ctaStyle: 'filled',
      color: 'text-health-teal',
      bgColor: 'bg-health-teal/10',
      borderColor: 'border-health-teal/20'
    },
    {
      id: 'doctor',
      title: 'Doctor / Hospital',
      subtitle: 'Clinical Excellence',
      heading: 'Doctor & Hospital – Verify in Seconds',
      icon: Stethoscope,
      keyIcon: Shield,
      description: 'Streamline patient care with instant verification, seamless EHR integration, and comprehensive clinical workflows.',
      stats: [
        { label: 'EHR Systems', value: '25+' },
        { label: 'Verification Time', value: '< 3 sec' },
        { label: 'Integration APIs', value: 'FHIR/HL7' }
      ],
      features: [
        {
          title: 'Intelligent Medical Proof Requests',
          description: 'Advanced patient search with AI-powered suggestions. Request specific medical conditions, treatment history, or diagnostic results with contextual templates.',
          icon: Search
        },
        {
          title: 'Real-Time Proof Verification',
          description: 'Instant cryptographic validation with detailed audit trails. Verify patient conditions, medication compliance, and treatment outcomes without accessing full records.',
          icon: CheckCircle
        },
        {
          title: 'Comprehensive Clinical Documentation',
          description: 'Upload diagnoses, prescriptions, treatment plans, and clinical notes with automated patient consent management and secure record integration.',
          icon: FileText
        },
        {
          title: 'Enterprise EHR Integration',
          description: 'Seamless integration with Epic, Cerner, Allscripts, and 25+ major hospital systems via FHIR/HL7 APIs with automated synchronization.',
          icon: Database
        },
        {
          title: 'Advanced Clinical Dashboard',
          description: 'Comprehensive provider portal with patient management, proof templates, analytics, and real-time collaboration tools for clinical teams.',
          icon: TrendingUp
        },
        {
          title: 'Compliance & Audit Management',
          description: 'Automated compliance reporting, audit trail generation, and regulatory documentation for HIPAA, GDPR, and healthcare standards.',
          icon: Award
        }
      ],
      ctaText: 'Apply for Provider Access',
      ctaStyle: 'outline',
      color: 'text-health-aqua',
      bgColor: 'bg-health-aqua/10',
      borderColor: 'border-health-aqua/20'
    },
    {
      id: 'insurance',
      title: 'Insurance',
      subtitle: 'Risk Management',
      heading: 'Insurance – Hassle-Free Claims',
      icon: Briefcase,
      keyIcon: FileText,
      description: 'Streamline claims processing with automated verification, reduced fraud, and enhanced compliance management.',
      stats: [
        { label: 'Processing Time', value: '90% faster' },
        { label: 'Fraud Reduction', value: '85%' },
        { label: 'Compliance', value: '100%' }
      ],
      features: [
        {
          title: 'Intelligent Claim Data Requests',
          description: 'Automated claim requests with smart templates and patient-specific requirements. Customizable proof requests for different claim types and coverage scenarios.',
          icon: Search
        },
        {
          title: 'Real-Time Proof Validation',
          description: 'Instant cryptographic verification with blockchain-based audit trails. Automated fraud detection and risk assessment with detailed compliance reporting.',
          icon: CheckCircle
        },
        {
          title: 'Automated Claim Processing',
          description: 'AI-powered claim approval workflows with configurable rules. Automatic processing based on proof results, coverage policies, and risk assessments.',
          icon: Zap
        },
        {
          title: 'Zero Data Storage Liability',
          description: 'Eliminate data breach risks with zero-knowledge architecture. No full medical records stored, reducing compliance burden and liability exposure.',
          icon: Shield
        },
        {
          title: 'Advanced Analytics Dashboard',
          description: 'Comprehensive claims analytics, fraud detection metrics, and performance insights. Real-time monitoring and predictive analytics for risk management.',
          icon: TrendingUp
        },
        {
          title: 'Regulatory Compliance Suite',
          description: 'Automated compliance reporting for HIPAA, state regulations, and insurance standards. Audit trail generation and regulatory documentation.',
          icon: Award
        }
      ],
      ctaText: 'Integrate Your System',
      ctaStyle: 'filled',
      color: 'text-health-success',
      bgColor: 'bg-health-success/10',
      borderColor: 'border-health-success/20'
    },
    {
      id: 'researcher',
      title: 'Researcher',
      subtitle: 'Data Innovation',
      heading: 'Researcher – Verified & Anonymized',
      icon: Microscope,
      keyIcon: Database,
      description: 'Access verified, anonymized datasets for groundbreaking medical research while maintaining complete patient privacy.',
      stats: [
        { label: 'Data Points', value: '10M+' },
        { label: 'Research Studies', value: '500+' },
        { label: 'Privacy Level', value: '100%' }
      ],
      features: [
        {
          title: 'Advanced Dataset Access',
          description: 'Request access to verified, anonymized datasets with sophisticated filtering capabilities. Define complex criteria for age, conditions, treatments, and outcomes.',
          icon: Search
        },
        {
          title: 'Cryptographically Verified Results',
          description: 'Receive only cryptographically proven statistics without any patient identifiers. Access aggregated data like "200 patients with diabetes achieving HbA1c < 7%".',
          icon: CheckCircle
        },
        {
          title: 'Intelligent Query Builder',
          description: 'Advanced query interface with drag-and-drop functionality. Set complex criteria for demographics, medical conditions, treatment protocols, and outcome measures.',
          icon: Database
        },
        {
          title: 'Automated Compliance & Ethics',
          description: 'Built-in compliance engine ensuring full HIPAA, GDPR, and research ethics adherence. Automated IRB approval workflows and ethical review processes.',
          icon: Shield
        },
        {
          title: 'Research Analytics Dashboard',
          description: 'Comprehensive research portal with saved queries, scheduled data pulls, statistical analysis tools, and export capabilities to CSV/JSON/SPSS formats.',
          icon: TrendingUp
        },
        {
          title: 'Collaborative Research Platform',
          description: 'Multi-institutional research collaboration tools with secure data sharing, peer review systems, and publication-ready analytics and visualizations.',
          icon: Users
        }
      ],
      ctaText: 'Join Research Network',
      ctaStyle: 'outline',
      color: 'text-health-warning',
      bgColor: 'bg-health-warning/10',
      borderColor: 'border-health-warning/20'
    },
    {
      id: 'admin',
      title: 'Admin / System Owner',
      subtitle: 'Enterprise Control',
      heading: 'Admin – Control & Audit Everything',
      icon: Settings,
      keyIcon: Search,
      description: 'Comprehensive system administration with advanced security monitoring, compliance management, and enterprise-grade controls.',
      stats: [
        { label: 'Security Alerts', value: 'Real-time' },
        { label: 'Compliance', value: '100%' },
        { label: 'System Uptime', value: '99.9%' }
      ],
      features: [
        {
          title: 'Advanced User & Role Management',
          description: 'Comprehensive user lifecycle management with granular permissions, role-based access control, and automated provisioning workflows.',
          icon: Users
        },
        {
          title: 'Enterprise Security Monitoring',
          description: 'Advanced SIEM dashboard with real-time threat detection, behavioral analytics, and automated incident response for security events.',
          icon: Shield
        },
        {
          title: 'Comprehensive Audit & Compliance',
          description: 'Detailed audit trails with configurable retention policies, automated compliance reporting, and regulatory documentation generation.',
          icon: FileText
        },
        {
          title: 'Government & Regulatory Integration',
          description: 'Seamless integration with NHIN, state health authorities, and regulatory databases for identity verification and compliance monitoring.',
          icon: Globe
        },
        {
          title: 'System Administration Console',
          description: 'Advanced admin portal with system health monitoring, performance metrics, encryption key management, and infrastructure controls.',
          icon: Settings
        },
        {
          title: 'Enterprise Analytics & Reporting',
          description: 'Comprehensive analytics dashboard with usage metrics, performance insights, cost optimization, and executive reporting capabilities.',
          icon: TrendingUp
        }
      ],
      ctaText: 'Request Admin Access',
      ctaStyle: 'link',
      color: 'text-health-blue-gray',
      bgColor: 'bg-health-blue-gray/10',
      borderColor: 'border-health-blue-gray/20'
    }
  ];

  const [activeTab, setActiveTab] = useState('patient');

  return (
    <section id="use-cases" className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-montserrat font-bold text-health-teal mb-4">
            Tailored for Every Healthcare Role
          </h2>
          <div className="w-16 h-1 bg-health-aqua mx-auto mb-4"></div>
          <p className="text-lg text-health-charcoal/80 font-open-sans max-w-2xl mx-auto">
            Discover how Zero-Knowledge healthcare technology benefits every stakeholder in the healthcare ecosystem.
          </p>
        </div>

        {/* Compact Desktop Tabs */}
        <div className="hidden lg:block">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8 bg-health-light-gray rounded-lg p-1">
              {roles.map((role) => (
                <TabsTrigger
                  key={role.id}
                  value={role.id}
                  className={`font-open-sans font-medium px-4 py-3 rounded-md transition-all ${
                    activeTab === role.id
                      ? 'text-health-teal bg-white shadow-sm border-b-2 border-health-aqua'
                      : 'text-health-charcoal hover:text-health-teal'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <role.icon className="w-4 h-4" />
                    {role.title}
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {roles.map((role) => (
              <TabsContent key={role.id} value={role.id} className="mt-6">
                <Card className={`${role.borderColor} shadow-lg`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`w-12 h-12 ${role.bgColor} rounded-lg flex items-center justify-center relative`}>
                        <role.icon className={`w-6 h-6 ${role.color}`} />
                        <role.keyIcon className={`w-3 h-3 ${role.color} absolute -top-1 -right-1`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-montserrat font-semibold text-health-teal">
                          {role.heading}
                        </CardTitle>
                        <p className="text-sm text-health-charcoal/70 font-open-sans">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid gap-4">
                      {role.features.slice(0, 4).map((feature, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <CheckCircle className="w-4 h-4 text-health-success mt-1 flex-shrink-0" />
                          <div>
                            <h4 className="font-open-sans font-semibold text-health-charcoal mb-1 text-sm">
                              {feature.title}
                            </h4>
                            <p className="text-xs font-open-sans text-health-charcoal/70">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6">
                      {role.ctaStyle === 'filled' && (
                        <button 
                          className="bg-health-aqua hover:bg-health-aqua/90 text-white px-6 py-2 rounded-lg font-open-sans font-medium transition-all hover:scale-105 shadow-md"
                          onClick={() => {
                            if (role.id === 'patient') window.location.href = '/signup';
                            else if (role.id === 'insurance') window.location.href = '/contact';
                            else window.location.href = '/contact';
                          }}
                        >
                          {role.ctaText}
                        </button>
                      )}
                      {role.ctaStyle === 'outline' && (
                        <button 
                          className="border-2 border-health-teal text-health-teal hover:bg-health-teal hover:text-white px-6 py-2 rounded-lg font-open-sans font-medium transition-all"
                          onClick={() => window.location.href = '/contact'}
                        >
                          {role.ctaText}
                        </button>
                      )}
                      {role.ctaStyle === 'link' && (
                        <button 
                          className="text-health-teal hover:text-health-aqua font-open-sans font-medium underline transition-colors"
                          onClick={() => window.location.href = '/contact'}
                        >
                          {role.ctaText}
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Compact Mobile Accordion */}
        <div className="lg:hidden">
          <Accordion type="single" collapsible className="w-full space-y-3">
            {roles.map((role) => (
              <AccordionItem key={role.id} value={role.id} className={`${role.borderColor} rounded-lg border`}>
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${role.bgColor} rounded-lg flex items-center justify-center relative`}>
                      <role.icon className={`w-4 h-4 ${role.color}`} />
                      <role.keyIcon className={`w-2 h-2 ${role.color} absolute -top-0.5 -right-0.5`} />
                    </div>
                    <span className="font-montserrat font-semibold text-health-teal text-left text-sm">
                      {role.heading}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3">
                    {role.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-3 h-3 text-health-success mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-open-sans font-semibold text-health-charcoal mb-1 text-xs">
                            {feature.title}
                          </h4>
                          <p className="text-xs font-open-sans text-health-charcoal/70">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-4">
                      {role.ctaStyle === 'filled' && (
                        <button 
                          className="bg-health-aqua hover:bg-health-aqua/90 text-white px-4 py-2 rounded-lg font-open-sans font-medium transition-all text-xs w-full"
                          onClick={() => {
                            if (role.id === 'patient') window.location.href = '/signup';
                            else if (role.id === 'insurance') window.location.href = '/contact';
                            else window.location.href = '/contact';
                          }}
                        >
                          {role.ctaText}
                        </button>
                      )}
                      {role.ctaStyle === 'outline' && (
                        <button 
                          className="border-2 border-health-teal text-health-teal hover:bg-health-teal hover:text-white px-4 py-2 rounded-lg font-open-sans font-medium transition-all text-xs w-full"
                          onClick={() => window.location.href = '/contact'}
                        >
                          {role.ctaText}
                        </button>
                      )}
                      {role.ctaStyle === 'link' && (
                        <button 
                          className="text-health-teal hover:text-health-aqua font-open-sans font-medium underline transition-colors text-xs"
                          onClick={() => window.location.href = '/contact'}
                        >
                          {role.ctaText}
                        </button>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Compact Statistics Section */}
        <div className="mt-12 bg-gradient-to-r from-health-teal to-health-aqua rounded-xl p-6 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-montserrat font-bold mb-1">
                <CountUp from={0} to={500} separator="," duration={2} delay={0.2} />K+
              </div>
              <div className="text-xs font-open-sans opacity-90">Patients Protected</div>
            </div>
            <div>
              <div className="text-2xl font-montserrat font-bold mb-1">
                <CountUp from={0} to={200} duration={2} delay={0.4} />+
              </div>
              <div className="text-xs font-open-sans opacity-90">Healthcare Providers</div>
            </div>
            <div>
              <div className="text-2xl font-montserrat font-bold mb-1">
                <CountUp from={0} to={50} duration={2} delay={0.6} />+
              </div>
              <div className="text-xs font-open-sans opacity-90">Research Institutions</div>
            </div>
            <div>
              <div className="text-2xl font-montserrat font-bold mb-1">
                <CountUp from={0} to={99.9} duration={2} delay={0.8} />%
              </div>
              <div className="text-xs font-open-sans opacity-90">Uptime Guarantee</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UseCases;
