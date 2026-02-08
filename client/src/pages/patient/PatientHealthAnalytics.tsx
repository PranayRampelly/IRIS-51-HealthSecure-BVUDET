import React from 'react';
import ChronicDiseaseTracker from '@/components/doctor/ChronicDiseaseTracker';

const PatientHealthAnalytics: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-health-charcoal">My Health Analytics</h1>
                    <p className="text-health-blue-gray mt-1">Track your vital signs and chronic disease trends</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border min-h-[600px]">
                {/* No patientId prop needed - it will fetch the current user's data */}
                <ChronicDiseaseTracker />
            </div>
        </div>
    );
};

export default PatientHealthAnalytics;
