import React from 'react';

interface ConsentModalProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const ConsentModal: React.FC<ConsentModalProps> = ({ open, onAccept, onDecline }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full border border-health-teal animate-fade-in">
        <h2 className="text-2xl font-bold mb-4 text-health-teal">Consent Required</h2>
        <p className="mb-4 text-gray-700">
          By booking this appointment, you consent to the processing of your health data and agree to the platform's privacy policy and terms of service. Your consent will be securely logged and auditable.
        </p>
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onDecline}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 bg-white hover:bg-gray-100 transition"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            className="px-4 py-2 rounded-lg bg-health-teal text-white font-semibold hover:bg-health-aqua transition shadow"
            autoFocus
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentModal; 