import React, { useState, ReactNode } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Alert } from '../ui/alert';

interface TwoFactorChallengeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (code: string, isBackup: boolean) => void;
  loading?: boolean;
  error?: string | null;
  extra?: ReactNode;
}

const TwoFactorChallengeModal: React.FC<TwoFactorChallengeModalProps> = ({
  open,
  onClose,
  onSubmit,
  loading = false,
  error = null,
  extra,
}) => {
  const [code, setCode] = useState('');
  const [isBackup, setIsBackup] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    onSubmit(code.trim(), isBackup);
  };

  const handleClose = () => {
    setCode('');
    setIsBackup(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTitle>Two-Factor Authentication Required</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-sm">
              {isBackup ? 'Enter Backup Code' : 'Enter 2FA Code'}
            </label>
            <Input
              type="text"
              autoFocus
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder={isBackup ? 'Backup code' : '6-digit code'}
              maxLength={isBackup ? 16 : 6}
              pattern={isBackup ? undefined : '[0-9]{6}'}
              disabled={loading}
            />
            <button
              type="button"
              className="mt-2 text-xs text-blue-600 hover:underline"
              onClick={() => setIsBackup(b => !b)}
              disabled={loading}
            >
              {isBackup ? 'Use authenticator app code' : 'Use a backup code'}
            </button>
          </div>
          {error && <Alert variant="destructive">{error}</Alert>}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <span className="animate-spin mr-2 w-4 h-4 border-2 border-t-transparent border-white rounded-full inline-block align-middle"></span>}
              Verify
            </Button>
          </DialogFooter>
        </form>
        {extra && <div className="mt-4">{extra}</div>}
      </DialogContent>
    </Dialog>
  );
};

export default TwoFactorChallengeModal; 