import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import BloodBankProfileCompletionDialog from './BloodBankProfileCompletionDialog';

interface ProfileCompletionCheckProps {
  children: React.ReactNode;
}

const ProfileCompletionCheck: React.FC<ProfileCompletionCheckProps> = ({ children }) => {
  const { user } = useAuth();
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  useEffect(() => {
    // Check if user is a bloodbank and profile is not complete
    if (user && user.role === 'bloodbank' && !user.profileComplete) {
      setShowProfileDialog(true);
    }
  }, [user]);

  const handleProfileComplete = () => {
    setShowProfileDialog(false);
    // Optionally refresh user data or update context
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {children}
      <BloodBankProfileCompletionDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        onComplete={handleProfileComplete}
      />
    </>
  );
};

export default ProfileCompletionCheck;
