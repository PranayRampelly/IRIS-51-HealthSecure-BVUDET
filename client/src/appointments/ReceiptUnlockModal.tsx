import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Lock, 
  Unlock, 
  Receipt, 
  IndianRupee,
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

interface ReceiptUnlockModalProps {
  open: boolean;
  onClose: () => void;
  appointmentData: {
    _id: string;
    appointmentNumber: string;
    doctor: {
      _id: string;
      name: string;
      specialization: string;
      profilePhoto: string;
    };
    patient: {
      name: string;
      email: string;
      phone: string;
    };
    scheduledDate: string;
    scheduledTime: string;
    consultationType: 'in-person';
    cost: {
      consultationFee: number;
      originalConsultationFee?: number;
      convenienceFee: number;
      totalAmount: number;
    };
    status: string;
  };
  onPaymentSuccess: (paymentData: any) => void;
}

export const ReceiptUnlockModal: React.FC<ReceiptUnlockModalProps> = ({
  open,
  onClose,
  appointmentData,
  onPaymentSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  const handleUnlockReceipt = async () => {
    try {
      setLoading(true);
      
      // Create Razorpay order for convenience fee payment
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          doctorId: appointmentData.doctor._id,
          consultationType: 'in-person',
          amount: appointmentData.cost.convenienceFee,
          appointmentId: appointmentData._id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }

      const result = await response.json();
      
      if (result.success) {
        setPaymentData(result.data);
        
        // Initialize Razorpay payment
        const options = {
          key: result.data.key,
          amount: result.data.amount,
          currency: result.data.currency,
          name: 'HealthSecure',
          description: `Convenience Fee for ${appointmentData.doctor.name}`,
          order_id: result.data.orderId,
          handler: async (response: any) => {
            try {
              // Verify payment
              const verifyResponse = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  appointmentId: appointmentData._id
                })
              });

              if (!verifyResponse.ok) {
                throw new Error('Payment verification failed');
              }

              const verifyResult = await verifyResponse.json();
              
              if (verifyResult.success) {
                toast.success('Payment successful! Receipt unlocked.');
                onPaymentSuccess(verifyResult.data);
                onClose();
              } else {
                throw new Error(verifyResult.message || 'Payment verification failed');
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              toast.error('Payment verification failed. Please try again.');
            }
          },
          prefill: {
            name: appointmentData.patient.name,
            email: appointmentData.patient.email,
            contact: appointmentData.patient.phone
          },
          theme: {
            color: '#0D9488'
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        throw new Error(result.message || 'Failed to create payment order');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-health-charcoal">
            <Lock className="w-8 h-8 text-health-teal" />
            Unlock Your Receipt
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Locked Receipt Notice */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-orange-800">
                <AlertCircle className="w-5 h-5" />
                Receipt Currently Locked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-700 mb-4">
                Your appointment receipt is currently locked. To unlock it and access your appointment details, 
                please pay the convenience fee below.
              </p>
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <Info className="w-4 h-4" />
                <span>This fee covers platform services and receipt generation</span>
              </div>
            </CardContent>
          </Card>

          {/* Appointment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-health-teal" />
                Appointment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-health-charcoal/60">Appointment:</span>
                  <p className="font-medium">{appointmentData.appointmentNumber}</p>
                </div>
                <div>
                  <span className="text-health-charcoal/60">Doctor:</span>
                  <p className="font-medium">{appointmentData.doctor.name}</p>
                </div>
                <div>
                  <span className="text-health-charcoal/60">Date:</span>
                  <p className="font-medium">{new Date(appointmentData.scheduledDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-health-charcoal/60">Time:</span>
                  <p className="font-medium">{appointmentData.scheduledTime}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-health-teal" />
                Payment Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
                             <div className="space-y-3">
                 <div className="flex justify-between items-center">
                   <span className="text-health-charcoal/60">Consultation Fee:</span>
                   <span className="font-medium">₹{appointmentData.cost.originalConsultationFee || (appointmentData.cost.consultationFee + appointmentData.cost.convenienceFee)} (Free)</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-health-charcoal/60">Convenience Fee:</span>
                   <span className="font-medium">₹{appointmentData.cost.convenienceFee}</span>
                 </div>
                <Separator />
                <div className="flex justify-between items-center text-lg font-semibold text-health-teal">
                  <span>Total Amount:</span>
                  <span>₹{appointmentData.cost.totalAmount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-700">
                  <p className="font-medium mb-1">Secure Payment</p>
                  <p>Your payment is processed securely through Razorpay. We use industry-standard encryption to protect your data.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleUnlockReceipt} 
              disabled={loading}
              className="flex-1 bg-health-teal hover:bg-health-teal/90 text-white"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 mr-2" />
                  Pay ₹{appointmentData.cost.totalAmount} & Unlock Receipt
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
