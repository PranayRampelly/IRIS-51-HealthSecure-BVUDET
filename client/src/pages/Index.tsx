
import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import UseCases from '@/components/UseCases';
import Security from '@/components/Security';
import PatientDashboard from '@/components/PatientDashboard';
import ProviderInterface from '@/components/ProviderInterface';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-white font-open-sans">
      <Header />
      <Hero />
      <HowItWorks />
      <Features />
      <UseCases />
      <Security />
      <PatientDashboard />
      <ProviderInterface />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
