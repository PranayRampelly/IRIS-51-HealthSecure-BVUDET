import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, CheckCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, setup2FA, role } = location.state || {};
  
  const [step, setStep] = useState<'email' | '2fa'>('email');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [qrCode, setQrCode] = useState('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
  const [isVerified, setIsVerified] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState('');

  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  // Poll the backend every 3 seconds to check if the user's email is verified
  useEffect(() => {
    if (!email) return;
    let interval: NodeJS.Timeout;
    const checkVerification = async () => {
      setChecking(true);
      setCheckError('');
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/auth/check-email-verified`, { params: { email } });
        if (res.data && res.data.verified) {
          setIsVerified(true);
        } else {
          setIsVerified(false);
        }
      } catch (err) {
        setCheckError('Could not check verification status.');
      } finally {
        setChecking(false);
      }
    };
    checkVerification();
    interval = setInterval(checkVerification, 3000);
    return () => clearInterval(interval);
  }, [email]);

  useEffect(() => {
    if (isVerified) {
      // If 2FA is required, redirect to /2fa-setup
      if (setup2FA) {
        setTimeout(() => {
          navigate('/2fa-setup', { state: { email } });
        }, 1200);
      }
    }
  }, [isVerified, setup2FA, navigate, email]);

  const getRoleDashboardPath = (userRole: string) => {
    switch (userRole) {
      case 'patient':
        return '/patient/dashboard';
      case 'doctor':
        return '/doctor/dashboard';
      case 'hospital':
        return '/hospital/dashboard';
      case 'insurance':
        return '/insurance/dashboard';
      case 'researcher':
        return '/researcher/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/patient/dashboard';
    }
  };

  const handleResendEmail = async () => {
    try {
      console.log('Resending verification email to:', email);
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/auth/resend-verification`, {
        email: email
      });
      
      if (response.data) {
        console.log('Resend email successful');
        setCountdown(60);
        setCanResend(false);
        alert('Verification email sent successfully!');
      }
    } catch (error) {
      console.error('Resend email error:', error);
      alert(error.response?.data?.message || 'Failed to resend verification email. Please try again.');
    }
  };

  const handleEmailVerification = () => {
    if (!isVerified) return;
    if (setup2FA) {
      navigate('/2fa-setup', { state: { email } });
    } else {
      navigate('/login');
    }
  };

  const handleCodeSubmit = () => {
    if (code.length === 6) {
      const dashboardPath = getRoleDashboardPath(role);
      navigate(dashboardPath);
    }
  };

  const handleCodeChange = (value: string) => {
    if (value.length <= 6 && /^\d*$/.test(value)) {
      setCode(value);
    }
  };

  if (step === '2fa') {
    return (
      <div className="min-h-screen bg-health-light-gray flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-health-teal" />
            </div>
            <CardTitle className="text-2xl font-montserrat font-bold text-health-teal">
              Setup Two-Factor Authentication
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-health-charcoal mb-4">
                Scan this QR code with your authenticator app:
              </p>
              <div className="bg-white p-4 rounded-lg border-2 border-health-blue-gray/20 inline-block">
                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
              </div>
              <p className="text-sm text-health-charcoal/70 mt-2">
                Backup Code: <span className="font-mono bg-health-light-gray px-2 py-1 rounded">ABC123DEF456</span>
              </p>
            </div>

            <div>
              <Label htmlFor="authCode">Enter 6-digit code from your app</Label>
              <Input
                id="authCode"
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="mt-1 text-center text-lg tracking-widest"
                placeholder="000000"
                maxLength={6}
              />
            </div>

            <Button
              onClick={handleCodeSubmit}
              disabled={code.length !== 6}
              className="w-full bg-health-teal hover:bg-health-teal/90 text-white"
            >
              Verify & Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-health-light-gray flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-health-success" />
          </div>
          <CardTitle className="text-2xl font-montserrat font-bold text-health-teal">
            Verify Your Email
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <p className="text-health-charcoal">
            We've sent a verification link to:
          </p>
          <p className="font-medium text-health-teal bg-health-light-gray px-4 py-2 rounded">
            {email}
          </p>
          <p className="text-health-charcoal">
            Please click the link in your email to continue.
          </p>
          {checking && <p className="text-health-warning">Checking verification status...</p>}
          {checkError && <p className="text-health-danger">{checkError}</p>}
          {isVerified && <p className="text-health-success">Your email has been verified! You can now continue.</p>}

          <div className="space-y-3">
            <Button
              onClick={handleEmailVerification}
              className="w-full bg-health-aqua hover:bg-health-aqua/90 text-white"
              disabled={!isVerified}
            >
              I've verified my email
            </Button>

            <Button
              onClick={handleResendEmail}
              disabled={!canResend}
              variant="outline"
              className="w-full border-health-teal text-health-teal hover:bg-health-teal hover:text-white"
            >
              {canResend ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend Link
                </>
              ) : (
                `Resend in ${countdown}s`
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;
