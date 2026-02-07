import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, ArrowRight } from 'lucide-react';
import PharmacyProfileCompletionDialog from './PharmacyProfileCompletionDialog';

interface ProfileCompletionStatus {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
}

const REQUIRED_FIELDS: Array<string> = [
  'businessName',
  'email',
  'phone',
  'licenseNumber',
  'address',
  'city',
  'state'
];

const computeFallbackStatus = (profile: Record<string, any>): ProfileCompletionStatus => {
  const missing = REQUIRED_FIELDS.filter((f) => !profile?.[f] || String(profile?.[f]).trim() === '');
  const completed = REQUIRED_FIELDS.length - missing.length;
  const pct = Math.round((completed / REQUIRED_FIELDS.length) * 100);
  return {
    isComplete: missing.length === 0,
    completionPercentage: pct,
    missingFields: missing
  };
};

const ProfileCompletionCheck: React.FC = () => {
  const [status, setStatus] = useState<ProfileCompletionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    checkProfileCompletion();
  }, []);

  const checkProfileCompletion = async () => {
    setLoading(true);
    try {
      // Use the pharmacy service instead of direct fetch
      const pharmacyService = (await import('@/services/pharmacyService')).default;
      
      try {
        const data = await pharmacyService.getProfileCompletion();
        console.log('Profile completion data:', data);
        
        const normalized: ProfileCompletionStatus = {
          isComplete: Boolean(data.isComplete || data.completed),
          completionPercentage: typeof data.completionPercentage === 'number' ? data.completionPercentage : (data.percentage || 0),
          missingFields: Array.isArray(data.missingFields) ? data.missingFields : []
        };
        
        console.log('Normalized status:', normalized);
        setStatus(normalized);
        
        if (!normalized.isComplete) {
          console.log('Profile incomplete, showing dialog');
          setShowDialog(true);
        } else {
          console.log('Profile complete, hiding dialog');
          setShowDialog(false);
        }
        return;
      } catch (error) {
        console.log('Profile completion endpoint failed, trying fallback...', error);
      }

      // Fallback: derive from profile data
      try {
        const profile = await pharmacyService.getMyProfile();
        const derived = computeFallbackStatus(profile || {});
        setStatus(derived);
        if (!derived.isComplete) setShowDialog(true);
        return;
      } catch (error) {
        console.log('Profile endpoint failed, showing default dialog...');
      }

      // If all fail, show dialog to encourage completion
      setStatus({ isComplete: false, completionPercentage: 0, missingFields: REQUIRED_FIELDS });
      setShowDialog(true);
    } catch (error) {
      console.error('Error checking profile completion:', error);
      setStatus({ isComplete: false, completionPercentage: 0, missingFields: REQUIRED_FIELDS });
      setShowDialog(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (!status || status.isComplete) return null;

  return (
    <>
      <Alert className="mb-6 border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium mb-2">Complete Your Pharmacy Profile to Access All Features</div>
              <div className="text-sm mb-3">
                Your pharmacy profile is {Math.max(0, Math.min(100, status.completionPercentage))}% complete.
                {status.missingFields.length > 0 && (
                  <span className="ml-1">
                    Missing: {status.missingFields.slice(0, 3).join(', ')}
                    {status.missingFields.length > 3 && ` and ${status.missingFields.length - 3} more`}
                  </span>
                )}
              </div>
              <Progress value={Math.max(0, Math.min(100, status.completionPercentage))} className="h-2 mb-3" />
            </div>
            <Button onClick={() => setShowDialog(true)} className="ml-4 bg-orange-600 hover:bg-orange-700">
              Complete Profile
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      <PharmacyProfileCompletionDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onComplete={() => {
          console.log('Profile completion dialog completed, rechecking status...');
          setShowDialog(false);
          checkProfileCompletion();
        }}
      />
    </>
  );
};

export default ProfileCompletionCheck;
