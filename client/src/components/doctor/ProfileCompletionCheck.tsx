import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, ArrowRight } from 'lucide-react';
import DoctorProfileCompletionDialog from './DoctorProfileCompletionDialog';

interface ProfileCompletionStatus {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
}

const ProfileCompletionCheck: React.FC = () => {
  const [status, setStatus] = useState<ProfileCompletionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    checkProfileCompletion();
  }, []);

  const checkProfileCompletion = async () => {
    try {
      const response = await fetch('/api/doctor/profile-completion', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        
        // Auto-open dialog for new doctors with incomplete profiles
        if (!data.isComplete && data.completionPercentage < 30) {
          setShowDialog(true);
        }
      }
    } catch (error) {
      console.error('Error checking profile completion:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!status || status.isComplete) {
    return null;
  }

  return (
    <>
      <Alert className="mb-6 border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium mb-2">
                Complete Your Profile to Access All Features
              </div>
              <div className="text-sm mb-3">
                Your profile is {status.completionPercentage}% complete. 
                {status.missingFields.length > 0 && (
                  <span className="ml-1">
                    Missing: {status.missingFields.slice(0, 3).join(', ')}
                    {status.missingFields.length > 3 && ` and ${status.missingFields.length - 3} more`}
                  </span>
                )}
              </div>
              <Progress value={status.completionPercentage} className="h-2 mb-3" />
            </div>
            <Button
              onClick={() => setShowDialog(true)}
              className="ml-4 bg-orange-600 hover:bg-orange-700"
            >
              Complete Profile
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      <DoctorProfileCompletionDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onComplete={() => {
          // Refresh the profile completion status
          checkProfileCompletion();
        }}
      />
    </>
  );
};

export default ProfileCompletionCheck; 