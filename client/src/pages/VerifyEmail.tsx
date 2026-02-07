import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

const VerifyEmail = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');

  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    setVerifying(true);
    setError('');
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/auth/verify-email?token=${token}`);
      if (res.data && res.data.message === 'Email verified successfully') {
        setVerified(true);
      } else {
        setError(res.data?.message || 'Verification failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-health-light-gray flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            {verified ? (
              <CheckCircle className="h-8 w-8 text-health-success" />
            ) : (
              <XCircle className="h-8 w-8 text-health-warning" />
            )}
          </div>
          <CardTitle className="text-2xl font-montserrat font-bold text-health-teal">
            Email Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-health-charcoal">
            {verified
              ? 'Your email has been successfully verified!'
              : 'Click the button below to verify your email.'}
          </p>
          {error && <p className="text-health-danger">{error}</p>}
          <Button
            onClick={handleVerify}
            className="w-full bg-health-aqua hover:bg-health-aqua/90 text-white"
            disabled={verifying || verified}
          >
            {verifying ? 'Verifying...' : verified ? 'Verified' : 'Verify'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail; 