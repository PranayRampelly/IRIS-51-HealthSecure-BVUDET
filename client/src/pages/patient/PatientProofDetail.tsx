
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Shield, CheckCircle } from 'lucide-react';

const PatientProofDetail = () => {
  const { proofId } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/patient/proofs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Proofs
            </Button>
          </Link>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Proof #{proofId}</h1>
        </div>
        <Button className="bg-health-teal hover:bg-health-teal/90">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-health-teal" />
                <span>Zero-Knowledge Proof Certificate</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-health-light-gray/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-health-teal mb-2">Verified Statement</h3>
                  <p className="text-health-charcoal">
                    "Patient has no known allergies to penicillin as of January 15, 2024"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-health-charcoal">Generated Date</label>
                    <p className="text-health-teal">January 16, 2024 10:30 AM</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-health-charcoal">Requested By</label>
                    <p className="text-health-teal">Dr. Johnson, Cardiology</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-health-charcoal">Proof Type</label>
                    <Badge>Allergy Status</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-health-charcoal">Status</label>
                    <Badge className="bg-health-success">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-health-charcoal">Cryptographic Signature</label>
                  <div className="mt-1 p-3 bg-health-light-gray/30 rounded font-mono text-xs break-all">
                    0x7f9a2b8c4e1d6f3a9c8b7e5d2a4f8c1b9e6d3a7c5f2e8b4d1a6c9f3e7b2d5a8c4f1b7e9d2a5c8f3b6e1d4a7c9f2e5b8d1a4c7f9e2d5a8c3f6b1e4d7a9c2f5e8b1d4a7c9f2e5b8d1a4c7
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Verification Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-health-charcoal">Blockchain Verified</span>
                  <CheckCircle className="w-4 h-4 text-health-success" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-health-charcoal">Zero-Knowledge</span>
                  <CheckCircle className="w-4 h-4 text-health-success" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-health-charcoal">Tamper-Proof</span>
                  <CheckCircle className="w-4 h-4 text-health-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="text-health-charcoal">
                  <span className="font-medium">Created:</span> Jan 16, 10:30 AM
                </div>
                <div className="text-health-charcoal">
                  <span className="font-medium">Shared with:</span> Dr. Johnson
                </div>
                <div className="text-health-charcoal">
                  <span className="font-medium">Downloads:</span> 2 times
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientProofDetail;
