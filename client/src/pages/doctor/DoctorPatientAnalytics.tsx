import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users, Activity, Search, ArrowRight, Heart, AlertCircle, Calendar
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';

const DoctorPatientAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.getDoctorPatients();
      if (response && response.patients) {
        setPatients(response.patients);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskLevel = (vitals: any) => {
    if (!vitals) return 'Unknown';
    // Simple mock logic for risk based on BP (sys > 140 is high)
    let sys = 0;
    if (vitals.bloodPressure && vitals.bloodPressure.includes('/')) {
      sys = parseInt(vitals.bloodPressure.split('/')[0]);
    }
    if (sys > 160) return 'Critical';
    if (sys > 140) return 'High';
    return 'Normal';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-health-charcoal">Chronic Disease Management</h1>
          <p className="text-health-blue-gray mt-2">Monitor patient vitals and chronic conditions</p>
        </div>
      </div>

      <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={fetchPatients}>
          Refresh List
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-12">Loading patients...</div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No patients found.</div>
        ) : (
          filteredPatients.map((patient) => {
            const risk = getRiskLevel(patient.latestVitals);
            return (
              <Card key={patient._id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/doctor/patient-analytics/${patient._id}`)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={patient.profileImage} />
                        <AvatarFallback className="bg-health-teal text-white">
                          {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg text-health-charcoal">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-health-blue-gray">
                          <span>{patient.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : 'N/A'} yrs</span>
                          <span>•</span>
                          <span className="capitalize">{patient.gender || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-8">
                      <div>
                        <p className="text-xs text-health-blue-gray uppercase tracking-wider mb-1">Condition</p>
                        <div className="flex gap-2">
                          {patient.primaryDiagnosis ? (
                            <Badge variant="outline">{patient.primaryDiagnosis}</Badge>
                          ) : (
                            <span className="text-sm text-gray-400">None recorded</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-health-blue-gray uppercase tracking-wider mb-1">Latest BP</p>
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-health-teal" />
                          <span className="font-medium">
                            {patient.latestVitals?.bloodPressure || '--/--'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-health-blue-gray uppercase tracking-wider mb-1">Status</p>
                        <Badge className={`${risk === 'Critical' ? 'bg-red-500' :
                            risk === 'High' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}>
                          {risk}
                        </Badge>
                      </div>

                      <Button variant="ghost" size="sm">
                        View Details <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DoctorPatientAnalytics; 