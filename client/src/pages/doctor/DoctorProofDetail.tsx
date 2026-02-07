
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield, CheckCircle, Download, Eye } from 'lucide-react';

const DoctorProofDetail = () => {
  const { proofId } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/doctor/verify-proofs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Proofs
            </Button>
          </Link>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Proof Verification</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button className="bg-health-success hover:bg-health-success/90">
            <CheckCircle className="w-4 h-4 mr-2" />
            Accept Proof
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-health-teal" />
                <span>Zero-Knowledge Proof Verification</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-health-success/10 border border-health-success/20 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-health-success" />
                    <h3 className="font-semibold text-health-success">Proof Valid</h3>
                  </div>
                  <p className="text-health-charcoal">
                    The submitted proof has been cryptographically verified and is authentic.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-health-charcoal">Patient</label>
                    <p className="text-health-teal font-medium">John Doe (ID: 12345)</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-health-charcoal">Verified Statement</label>
                    <div className="mt-1 p-3 bg-health-light-gray/50 rounded">
                      <p className="text-health-charcoal">
                        "Patient has no known allergies to penicillin as verified on January 15, 2024"
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-health-charcoal">Proof Type</label>
                      <Badge>Allergy Status</Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-health-charcoal">Generated</label>
                      <p className="text-health-teal">Jan 16, 2024 10:30 AM</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-health-charcoal">Cryptographic Hash</label>
                  <div className="mt-1 p-3 bg-health-light-gray/30 rounded font-mono text-xs break-all">
                    0x7f9a2b8c4e1d6f3a9c8b7e5d2a4f8c1b9e6d3a7c5f2e8b4d1a6c9f3e7b2d5a8c
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-health-charcoal">Authenticity</span>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-health-success" />
                    <span className="text-sm text-health-success">Verified</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-health-charcoal">Integrity</span>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-health-success" />
                    <span className="text-sm text-health-success">Intact</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-health-charcoal">Timestamp</span>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-health-success" />
                    <span className="text-sm text-health-success">Valid</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full bg-health-success hover:bg-health-success/90">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept & Use
                </Button>
                <Button variant="outline" className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="text-health-charcoal">
                  <span className="font-medium">Original Record:</span> Medical_Record_001
                </div>
                <div className="text-health-charcoal">
                  <span className="font-medium">Source:</span> General Hospital
                </div>
                <div className="text-health-charcoal">
                  <span className="font-medium">Provider:</span> Dr. Sarah Smith
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorProofDetail;
