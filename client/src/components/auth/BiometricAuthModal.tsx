import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getWebAuthnRegistrationOptions, verifyWebAuthnRegistration } from '@/lib/api';
import { startRegistration } from '@simplewebauthn/browser';

interface BiometricRegistrationModalProps {
  open: boolean;
  onSuccess: () => void;
  onError: (err: string) => void;
  error: string | null;
  onClose: () => void;
}

const BiometricRegistrationModal: React.FC<BiometricRegistrationModalProps> = ({ open, onSuccess, onError, error, onClose }) => {
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      // 1. Get registration options from backend
      const { data: options } = await getWebAuthnRegistrationOptions();
      // 2. Start registration ceremony
      const attResp = await startRegistration(options);
      // 3. Send attestation response to backend for verification
      const { data: verify } = await verifyWebAuthnRegistration(attResp);
      if (verify.verified) {
        setLoading(false);
        onSuccess();
      } else {
        setLoading(false);
        onError('Biometric registration failed.');
      }
    } catch (err: unknown) {
      setLoading(false);
      let message = 'Biometric registration failed.';
      if (typeof err === 'object' && err !== null) {
        const maybeResponse = (err as { response?: { data?: { message?: string } } });
        if (maybeResponse.response?.data?.message) {
          message = maybeResponse.response.data.message;
        } else if ('message' in err && typeof (err as { message?: string }).message === 'string') {
          message = (err as { message?: string }).message!;
        }
      }
      onError(message);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 relative flex flex-col items-center">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-health-teal" onClick={onClose}>&times;</button>
        <Lock className="w-10 h-10 text-health-teal mb-3" />
        <h2 className="font-bold text-2xl text-health-teal mb-2 font-montserrat">Register New Biometric Device</h2>
        <p className="text-gray-600 mb-4 text-center">
          Enroll a new fingerprint, face recognition, or security key for your account.<br />
          This will allow you to unlock the Document Vault with this device in the future.
        </p>
        {loading ? (
          <div className="flex flex-col items-center mb-2">
            <div className="w-8 h-8 border-4 border-health-teal border-t-transparent rounded-full animate-spin mb-2" />
            <span className="text-health-teal font-semibold">Registering...</span>
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm mb-2">{error}</div>
        ) : null}
        <Button
          className="w-full bg-health-teal text-white font-semibold mt-2"
          disabled={loading}
          onClick={handleRegister}
        >
          {loading ? 'Registering...' : 'Register New Biometric'}
        </Button>
      </div>
    </div>
  );
};

export default BiometricRegistrationModal; 