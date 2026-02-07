
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, User, Eye, Upload, Download } from 'lucide-react';

const PatientDashboard = () => {
  const [selectedData, setSelectedData] = useState<string[]>([]);

  const healthData = [
    { id: 'age', label: 'Age Verification (18+)', status: 'verified', sensitive: false },
    { id: 'blood-type', label: 'Blood Type', status: 'available', sensitive: true },
    { id: 'allergies', label: 'Known Allergies', status: 'available', sensitive: true },
    { id: 'medications', label: 'Current Medications', status: 'available', sensitive: true },
    { id: 'conditions', label: 'Medical Conditions', status: 'available', sensitive: true },
    { id: 'vaccinations', label: 'Vaccination Records', status: 'verified', sensitive: false },
  ];

  const toggleSelection = (id: string) => {
    setSelectedData(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-montserrat font-bold text-health-teal mb-4">
            Patient Control Center
          </h2>
          <p className="text-lg text-health-charcoal font-open-sans max-w-3xl mx-auto">
            Choose exactly what information to share with healthcare providers, insurers, or researchers. 
            Your data, your control.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Data Selection Panel */}
          <div className="lg:col-span-2">
            <Card className="border-health-blue-gray/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-health-teal font-montserrat">
                  <User className="w-5 h-5" />
                  Your Health Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {healthData.map((item) => (
                  <div 
                    key={item.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedData.includes(item.id)
                        ? 'border-health-aqua bg-health-aqua/5'
                        : 'border-health-blue-gray/20 hover:border-health-aqua/50'
                    }`}
                    onClick={() => toggleSelection(item.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 border-2 rounded ${
                          selectedData.includes(item.id)
                            ? 'bg-health-aqua border-health-aqua'
                            : 'border-health-blue-gray'
                        }`}>
                          {selectedData.includes(item.id) && (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                        <span className="font-open-sans text-health-charcoal">
                          {item.label}
                        </span>
                        {item.sensitive && (
                          <Lock className="w-4 h-4 text-health-warning" />
                        )}
                      </div>
                      <Badge 
                        variant={item.status === 'verified' ? 'default' : 'secondary'}
                        className={item.status === 'verified' ? 'bg-health-success text-white' : ''}
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sharing Panel */}
          <div className="space-y-6">
            <Card className="border-health-blue-gray/20">
              <CardHeader>
                <CardTitle className="text-health-teal font-montserrat">
                  Zero-Knowledge Sharing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-health-charcoal font-open-sans">
                  Selected items: {selectedData.length}
                </div>
                
                <div className="space-y-2">
                  <Button 
                    className="w-full bg-health-aqua hover:bg-health-aqua/90 text-white"
                    disabled={selectedData.length === 0}
                    onClick={() => window.location.href = '/patient/proofs'}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Generate Proof
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-health-teal text-health-teal hover:bg-health-teal hover:text-white"
                    onClick={() => window.location.href = '/patient/proofs'}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Proof
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-health-blue-gray/20 bg-health-light-gray/50">
              <CardHeader>
                <CardTitle className="text-health-teal font-montserrat text-sm">
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-health-charcoal/60">Age verification shared</span>
                    <span className="text-health-success">2m ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-health-charcoal/60">Vaccination proof sent</span>
                    <span className="text-health-success">1h ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-health-charcoal/60">Insurance verification</span>
                    <span className="text-health-success">3h ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PatientDashboard;
