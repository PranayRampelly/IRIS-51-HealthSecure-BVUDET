import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Shield } from 'lucide-react';
import apiService from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface TwoFactorLoginProps {
  userId: string;
  onBack: () => void;
}

const TwoFactorLogin: React.FC<TwoFactorLoginProps> = ({ userId, onBack }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await apiService.login2FA({ userId, code });
      
      // Store user data in AuthContext
      if (result.user && result.token) {
        login({
          ...result.user,
          token: result.token
        });
      }
      
      // Also set token in localStorage for API service compatibility
      localStorage.setItem('token', result.token);
      
      // Navigate to dashboard - profile completion will be handled by dialog
      navigate(`/${result.user.role}/dashboard`);
    } catch (err: any) {
      setError(err.message || 'Invalid 2FA code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-health-light-gray flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-health-teal" />
            </div>
            <CardTitle className="text-2xl font-montserrat font-bold text-health-teal">
              Two-Factor Authentication
            </CardTitle>
            <p className="text-health-charcoal/70 mt-2">
              Enter the 6-digit code from your authenticator app
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="text-red-600 text-center text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <div>
                <Label htmlFor="code">Authentication Code</Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="mt-1 text-center text-lg tracking-widest"
                  maxLength={6}
                  autoComplete="one-time-code"
                  autoFocus
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1"
                  disabled={isLoading}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-health-teal hover:bg-health-teal/90"
                  disabled={isLoading || code.length !== 6}
                >
                  {isLoading ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TwoFactorLogin; 