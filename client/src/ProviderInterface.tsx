
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Lock, Eye, Download } from 'lucide-react';

const ProviderInterface = () => {
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed'>('pending');

  const mockProofs = [
    {
      id: '1',
      patient: 'Patient #4A7B',
      requirement: 'Age 18+ verification',
      status: 'verified',
      timestamp: '2024-01-15 14:30',
      proofHash: '0x7f9a2b8c...'
    },
    {
      id: '2',
      patient: 'Patient #8C2D',
      requirement: 'No diabetes history',
      status: 'verified',
      timestamp: '2024-01-15 14:28',
      proofHash: '0x3e1f6d4a...'
    },
    {
      id: '3',
      patient: 'Patient #9F5E',
      requirement: 'Current medications disclosure',
      status: 'pending',
      timestamp: '2024-01-15 14:25',
      proofHash: 'pending...'
    }
  ];

  const handleVerifyProof = () => {
    setVerificationStatus('verified');
  };

  return (
    <section className="py-16 bg-health-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-montserrat font-bold text-health-teal mb-4">
            Healthcare Provider Portal
          </h2>
          <p className="text-lg text-health-charcoal font-open-sans max-w-3xl mx-auto">
            Verify patient information instantly without accessing full medical records. 
            Get only the data you need, when you need it.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Verification Interface */}
          <Card className="border-health-blue-gray/20 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-health-teal font-montserrat">
                <Briefcase className="w-5 h-5" />
                Proof Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-health-light-gray rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-health-charcoal">Patient Request</span>
                    <Badge variant="secondary">Insurance Verification</Badge>
                  </div>
                  <div className="space-y-2 text-sm text-health-charcoal/70">
                    <div>• Age: 18+ ✓</div>
                    <div>• No diabetes history ✓</div>
                    <div>• Current medications: Selective disclosure</div>
                    <div>• Insurance status: Active</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border border-health-aqua/30 bg-health-aqua/5 rounded-lg">
                  <Lock className="w-5 h-5 text-health-aqua" />
                  <div className="flex-1">
                    <div className="font-medium text-health-teal">Zero-Knowledge Proof</div>
                    <div className="text-sm text-health-charcoal/70">
                      Hash: 0x7f9a2b8c3e1f6d4a...
                    </div>
                  </div>
                  <Badge className="bg-health-success text-white">Valid</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleVerifyProof}
                  className="w-full bg-health-aqua hover:bg-health-aqua/90 text-white"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Verify Proof
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-health-teal text-health-teal hover:bg-health-teal hover:text-white"
                  onClick={() => window.location.href = '/doctor/verify-proofs'}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Certificate
                </Button>
              </div>

              {verificationStatus === 'verified' && (
                <div className="p-4 bg-health-success/10 border border-health-success/20 rounded-lg animate-fade-in">
                  <div className="flex items-center gap-2 text-health-success font-medium">
                    <div className="w-2 h-2 bg-health-success rounded-full"></div>
                    Verification Complete
                  </div>
                  <div className="text-sm text-health-charcoal/70 mt-1">
                    Patient meets all requirements for insurance coverage.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Verifications */}
          <Card className="border-health-blue-gray/20 bg-white">
            <CardHeader>
              <CardTitle className="text-health-teal font-montserrat">
                Recent Verifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockProofs.map((proof) => (
                  <div 
                    key={proof.id}
                    className="p-4 border border-health-blue-gray/20 rounded-lg hover:border-health-aqua/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-health-charcoal">
                        {proof.patient}
                      </div>
                      <Badge 
                        variant={proof.status === 'verified' ? 'default' : 'secondary'}
                        className={proof.status === 'verified' ? 'bg-health-success text-white' : ''}
                      >
                        {proof.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-health-charcoal/70 mb-2">
                      {proof.requirement}
                    </div>
                    <div className="flex items-center justify-between text-xs text-health-charcoal/50">
                      <span>{proof.timestamp}</span>
                      <span className="font-mono">{proof.proofHash}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Guide */}
        <Card className="mt-8 border-health-blue-gray/20 bg-white">
          <CardHeader>
            <CardTitle className="text-health-teal font-montserrat">
              Integration Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-health-aqua/10 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-health-aqua">1</span>
                </div>
                <h3 className="font-montserrat font-semibold text-health-teal">Request Proof</h3>
                <p className="text-sm text-health-charcoal/70 font-open-sans">
                  Specify exactly what information you need from patients
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-health-aqua/10 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-health-aqua">2</span>
                </div>
                <h3 className="font-montserrat font-semibold text-health-teal">Verify Instantly</h3>
                <p className="text-sm text-health-charcoal/70 font-open-sans">
                  Cryptographically verify patient claims without full data access
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-health-aqua/10 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-health-aqua">3</span>
                </div>
                <h3 className="font-montserrat font-semibold text-health-teal">Maintain Privacy</h3>
                <p className="text-sm text-health-charcoal/70 font-open-sans">
                  Complete HIPAA compliance with zero-knowledge architecture
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ProviderInterface;
