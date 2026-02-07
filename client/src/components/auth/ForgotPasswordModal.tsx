
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordModalProps {
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = (data: ForgotPasswordForm) => {
    console.log('Reset password for:', data.email);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="text-center">Reset Link Sent</DialogTitle>
        </DialogHeader>
        <div className="p-6 text-center">
          <CheckCircle className="w-16 h-16 text-health-success mx-auto mb-4" />
          <p className="text-health-charcoal mb-6">
            If an account exists for this email, a reset link has been sent.
          </p>
          <Button
            onClick={onClose}
            className="bg-health-aqua hover:bg-health-aqua/90 text-white"
          >
            Close
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Reset Your Password</DialogTitle>
      </DialogHeader>
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="resetEmail">Email Address</Label>
            <Input
              id="resetEmail"
              type="email"
              {...register('email')}
              className="mt-1"
              placeholder="Enter the email associated with your account"
            />
            {errors.email && (
              <p className="text-sm text-health-danger mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="flex space-x-3">
            <Button
              type="submit"
              className="flex-1 bg-health-aqua hover:bg-health-aqua/90 text-white"
            >
              Send Reset Link
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ForgotPasswordModal;
