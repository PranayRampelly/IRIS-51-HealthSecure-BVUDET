import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ChronicDiseaseTracker from '@/components/doctor/ChronicDiseaseTracker';

const DoctorPatientAnalyticsDetail: React.FC = () => {
    const { patientId } = useParams<{ patientId: string }>();
    const navigate = useNavigate();

    if (!patientId) {
        return <div>Invalid Patient ID</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/doctor/patient-analytics')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Patient List
                </Button>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-health-charcoal">Detailed Health Analytics</h1>
                    <p className="text-health-blue-gray mt-1">Deep dive into patient vitals and chronic disease trends</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border min-h-[600px]">
                <ChronicDiseaseTracker patientId={patientId} />
            </div>
        </div>
    );
};

export default DoctorPatientAnalyticsDetail;
