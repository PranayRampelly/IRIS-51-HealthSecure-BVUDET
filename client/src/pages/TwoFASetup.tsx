import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TwoFASetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [step, setStep] = useState<'setup' | 'backup' | 'done'>('setup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get email from state or query params
  const email = location.state?.email || new URLSearchParams(location.search).get('email');
  const token = new URLSearchParams(location.search).get('token') || (location.state && location.state.token);

  // Debug: Log the email value
  console.log('2FA Setup email:', email);

  // Fetch QR code on mount
  useEffect(() => {
    const fetchQr = async () => {
      if (!email) {
        setError('Email is required for 2FA setup');
        return;
      }
      
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        const body = { email };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch('http://localhost:5000/api/auth/2fa/setup', {
          method: 'POST',
          headers,
          body: JSON.stringify(body)
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to generate QR code');
        }
        const data = await res.json();
        setQrCode(data.qrCodeDataURL);
        setSecret(data.secret);
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message || 'Failed to generate QR code');
      } finally {
        setLoading(false);
      }
    };
    fetchQr();
  }, [email]);

  // Handle code verification
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required for 2FA verification');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid 2FA code');
      setBackupCodes(data.backupCodes);
      setStep('backup');
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to verify 2FA code');
    } finally {
      setLoading(false);
    }
  };

  // Handle backup codes acknowledgement
  const handleBackupAcknowledge = () => {
    setStep('done');
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  // Handle QR re-generation
  const handleRegenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const body = { email };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('http://localhost:5000/api/auth/2fa/setup', {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to regenerate QR code');
      }
      const data = await res.json();
      setQrCode(data.qrCodeDataURL);
      setSecret(data.secret);
      setCode('');
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to regenerate QR code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-health-light-gray">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-montserrat text-health-teal text-center">
            {step === 'setup' && 'Set Up Two-Factor Authentication'}
            {step === 'backup' && 'Backup Codes'}
            {step === 'done' && '2FA Setup Complete!'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 'setup' && (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="flex flex-col items-center">
                {qrCode && <img src={qrCode} alt="2FA QR Code" className="mb-2 w-40 h-40" />}
                <div className="text-sm text-health-charcoal mb-2">Scan this QR code with your authenticator app (Google Authenticator, Authy, etc).</div>
                <Button type="button" variant="outline" onClick={handleRegenerate} disabled={loading} className="mb-2">Re-generate QR</Button>
                <div className="text-xs text-health-charcoal/70">Or enter this secret manually: <span className="font-mono">{secret}</span></div>
              </div>
              <div>
                <label className="block font-medium mb-1">Enter 6-digit code from your app</label>
                <Input type="text" value={code} onChange={e => setCode(e.target.value)} maxLength={6} pattern="[0-9]{6}" required autoFocus />
              </div>
              {error && <div className="text-red-600 text-center">{error}</div>}
              <Button type="submit" className="w-full bg-health-teal text-white" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </Button>
            </form>
          )}
          {step === 'backup' && (
            <div className="space-y-4 text-center">
              <div className="text-health-charcoal font-medium mb-2">Save these backup codes in a safe place. Each code can be used once if you lose access to your authenticator app.</div>
              <div className="grid grid-cols-2 gap-2 justify-center">
                {backupCodes.map((code, i) => (
                  <div key={i} className="bg-health-light-gray rounded px-3 py-2 font-mono text-lg tracking-widest border border-health-blue-gray/20">{code}</div>
                ))}
              </div>
              <Button className="w-full bg-health-teal text-white mt-4" onClick={handleBackupAcknowledge}>
                I have saved my backup codes
              </Button>
            </div>
          )}
          {step === 'done' && (
            <div className="text-center text-health-success font-semibold text-lg py-8">
              2FA setup complete! Redirecting to login...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TwoFASetup; 