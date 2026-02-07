import React, { useState } from 'react';
import { PaymentSuccessDialog } from '@/components/appointments/PaymentSuccessDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const TestPaymentSuccess: React.FC = () => {
  const [showDialog, setShowDialog] = useState(false);

  const sampleAppointmentData = {
    _id: 'apt-test-123',
    appointmentNumber: 'APT-2024-TEST-001',
    doctor: {
      name: 'Dr. Sarah Johnson',
      specialization: 'Cardiologist',
      profilePhoto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
      experience: 15,
      languages: ['English', 'Spanish'],
      location: { address: '123 Medical Center Dr, New York, NY 10001' }
    },
    patient: {
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567'
    },
    scheduledDate: '2024-12-25',
    scheduledTime: '14:30:00',
    consultationType: 'online' as const,
    cost: {
      consultationFee: 150,
      totalAmount: 150
    },
    status: 'confirmed',
    videoCallLink: 'https://meet.healthsecure.com/APT-2024-TEST-001',
    videoCallDetails: {
      platform: 'HealthSecure Video',
      roomId: 'APT-2024-TEST-001',
      password: 'abc123'
    }
  };

  const samplePaymentData = {
    orderId: 'order_test_123456789',
    paymentId: 'pay_test_987654321',
    razorpayPaymentId: 'pay_test_123456789',
    amount: 15000, // in paise
    currency: 'INR',
    status: 'completed',
    paidAt: '2024-12-20T10:30:00Z',
    receiptUrl: undefined
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-green-600">
              🧪 Payment Success Dialog Test Page
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                This page tests the PaymentSuccessDialog component independently.
                Click the button below to see the success dialog in action.
              </p>
              
              <Button 
                onClick={() => setShowDialog(true)}
                className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-3"
                size="lg"
              >
                🎉 Show Payment Success Dialog
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">Sample Appointment Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div><strong>Doctor:</strong> {sampleAppointmentData.doctor.name}</div>
                    <div><strong>Specialization:</strong> {sampleAppointmentData.doctor.specialization}</div>
                    <div><strong>Date:</strong> {sampleAppointmentData.scheduledDate}</div>
                    <div><strong>Time:</strong> {sampleAppointmentData.scheduledTime}</div>
                    <div><strong>Type:</strong> {sampleAppointmentData.consultationType}</div>
                    <div><strong>Amount:</strong> ₹{sampleAppointmentData.cost.totalAmount}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800">Sample Payment Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div><strong>Order ID:</strong> {samplePaymentData.orderId}</div>
                    <div><strong>Payment ID:</strong> {samplePaymentData.paymentId}</div>
                    <div><strong>Amount:</strong> ₹{(samplePaymentData.amount / 100).toFixed(2)}</div>
                    <div><strong>Currency:</strong> {samplePaymentData.currency}</div>
                    <div><strong>Status:</strong> {samplePaymentData.status}</div>
                    <div><strong>Paid:</strong> {new Date(samplePaymentData.paidAt).toLocaleDateString()}</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Test Instructions:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
                <li>Click the "Show Payment Success Dialog" button above</li>
                <li>The success dialog should appear with all appointment and payment details</li>
                <li>Test all the action buttons (Add to Calendar, Download Receipt, Share, etc.)</li>
                <li>Verify the video call information is displayed correctly</li>
                <li>Check that the dialog closes properly when clicking "Done"</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Payment Success Dialog */}
        <PaymentSuccessDialog
          open={showDialog}
          onClose={() => setShowDialog(false)}
          appointmentData={sampleAppointmentData}
          paymentData={samplePaymentData}
        />
      </div>
    </div>
  );
};



