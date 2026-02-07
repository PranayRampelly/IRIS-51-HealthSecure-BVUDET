
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, HelpCircle, ArrowRight } from 'lucide-react';

const Resources = () => {
  return (
    <div className="min-h-screen bg-white font-open-sans">
      <Header />
      
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-montserrat font-bold text-health-teal mb-4">
              Resources & Documentation
            </h1>
            <p className="text-xl text-health-charcoal max-w-3xl mx-auto">
              Everything you need to understand and implement zero-knowledge healthcare data exchange
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="w-8 h-8 text-health-teal mb-4" />
                <CardTitle className="text-xl font-montserrat">Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-health-charcoal mb-4">
                  Comprehensive guides, API references, and integration tutorials for developers and healthcare professionals.
                </p>
                <Button className="bg-health-teal hover:bg-health-teal/90">
                  View Docs <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="w-8 h-8 text-health-aqua mb-4" />
                <CardTitle className="text-xl font-montserrat">Blog</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-health-charcoal mb-4">
                  Latest insights on healthcare privacy, zero-knowledge proofs, and industry best practices.
                </p>
                <Button variant="outline" className="border-health-aqua text-health-aqua hover:bg-health-aqua hover:text-white">
                  Read Blog <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <HelpCircle className="w-8 h-8 text-health-success mb-4" />
                <CardTitle className="text-xl font-montserrat">FAQs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-health-charcoal mb-4">
                  Frequently asked questions about security, compliance, integration, and platform features.
                </p>
                <Button variant="outline" className="border-health-success text-health-success hover:bg-health-success hover:text-white">
                  View FAQs <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Resources;
