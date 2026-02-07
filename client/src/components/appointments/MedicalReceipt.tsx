import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Printer, 
  Share2, 
  CheckCircle, 
  MapPin, 
  Clock, 
  User, 
  Stethoscope,
  Building,
  IndianRupee,
  Calendar,
  Phone,
  Mail,
  FileText,
  Shield,
  Award,
  Clock3,
  CreditCard,
  Receipt,
  Hospital
} from 'lucide-react';

interface ReceiptData {
  appointmentNumber: string;
  doctor: {
    name: string;
    specialization: string;
    profilePhoto: string;
    experience: number;
    languages: string[];
    location: { address: string };
  };
  patient: {
    name: string;
    email: string;
    phone: string;
  };
  scheduledDate: Date;
  scheduledTime: string;
  consultationType: string;
  cost: {
    consultationFee: number;
    convenienceFee: number;
    totalAmount: number;
  };
  status: string;
  paymentDetails: {
    orderId: string;
    paymentId: string;
    razorpayPaymentId: string;
    amount: number;
    currency: string;
    status: string;
    paidAt: string;
  };
}

interface MedicalReceiptProps {
  data: ReceiptData;
  onClose: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
}

export const MedicalReceipt: React.FC<MedicalReceiptProps> = ({
  data,
  onClose,
  onPrint,
  onDownload
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    try {
      if (time.includes(':')) {
        const timeObj = new Date(`2000-01-01T${time}`);
        if (!isNaN(timeObj.getTime())) {
          return timeObj.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
        }
      }
      
      const parsedTime = new Date(time);
      if (!isNaN(parsedTime.getTime())) {
        return parsedTime.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
      
      return time || 'Time not specified';
    } catch {
      return time || 'Time not specified';
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const generatePDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);
      let yPosition = 20;

      // Helper function to add text with word wrapping
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return lines.length * fontSize * 0.4;
      };

      // Helper function to add section header
      const addSectionHeader = (text: string, y: number) => {
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 100, 100);
        doc.text(text, margin, y);
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        return y + 10;
      };

      // Helper function to add key-value pair
      const addKeyValue = (key: string, value: string, y: number) => {
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text(key, margin, y);
        doc.setFont(undefined, 'normal');
        doc.text(value, margin + 60, y);
        return y + 6;
      };

      // Hospital Header
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 100, 100);
      doc.text('HealthSecure Medical Center', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text('Professional Medical Consultation Receipt', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // Receipt Number
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`Receipt No: ${data.appointmentNumber}`, margin, yPosition);
      yPosition += 15;

      // Consultation Details Section
      yPosition = addSectionHeader('Consultation Details', yPosition);
      yPosition = addKeyValue('Date:', formatDate(data.scheduledDate), yPosition);
      yPosition = addKeyValue('Time:', formatTime(data.scheduledTime), yPosition);
      yPosition = addKeyValue('Type:', data.consultationType, yPosition);
      yPosition = addKeyValue('Status:', data.status, yPosition);
      yPosition += 10;

      // Doctor Information Section
      yPosition = addSectionHeader('Doctor Information', yPosition);
      yPosition = addKeyValue('Name:', data.doctor.name, yPosition);
      yPosition = addKeyValue('Specialization:', data.doctor.specialization, yPosition);
      yPosition = addKeyValue('Experience:', `${data.doctor.experience} years`, yPosition);
      yPosition = addKeyValue('Languages:', data.doctor.languages.join(', '), yPosition);
      yPosition = addKeyValue('Location:', data.doctor.location.address, yPosition);
      yPosition += 10;

      // Patient Information Section
      yPosition = addSectionHeader('Patient Information', yPosition);
      yPosition = addKeyValue('Name:', data.patient.name, yPosition);
      yPosition = addKeyValue('Email:', data.patient.email, yPosition);
      yPosition = addKeyValue('Phone:', data.patient.phone, yPosition);
      yPosition += 10;

      // Cost Breakdown Section
      yPosition = addSectionHeader('Service Charges', yPosition);
      yPosition = addKeyValue('Consultation Fee:', `₹${data.cost.consultationFee}`, yPosition);
      if (data.cost.convenienceFee > 0) {
        yPosition = addKeyValue('Convenience Fee (5%):', `₹${data.cost.convenienceFee}`, yPosition);
      }
      yPosition += 5;
      
      // Total Amount
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Total Amount:', margin, yPosition);
      doc.setTextColor(0, 100, 100);
      doc.text(`₹${data.cost.totalAmount}`, margin + 60, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 15;

      // Payment Details Section
      yPosition = addSectionHeader('Payment Information', yPosition);
      yPosition = addKeyValue('Order ID:', data.paymentDetails.orderId, yPosition);
      yPosition = addKeyValue('Payment ID:', data.paymentDetails.paymentId, yPosition);
      yPosition = addKeyValue('Transaction ID:', data.paymentDetails.razorpayPaymentId, yPosition);
      yPosition = addKeyValue('Status:', data.paymentDetails.status, yPosition);
      yPosition = addKeyValue('Paid At:', new Date(data.paymentDetails.paidAt).toLocaleString('en-IN'), yPosition);
      yPosition = addKeyValue('Currency:', data.paymentDetails.currency, yPosition);
      yPosition += 10;

      // Important Instructions for In-Person Consultation
      if (data.consultationType === 'in-person') {
        yPosition = addSectionHeader('Important Instructions', yPosition);
        const instructions = [
          'Please arrive 15 minutes before your scheduled appointment time',
          'Bring this receipt and a valid photo ID for verification',
          'Payment has been processed - no additional payment required',
          'Wear a mask and maintain social distancing as per hospital guidelines',
          'Contact the hospital if you need to reschedule or cancel',
          'Follow all hospital safety protocols and guidelines'
        ];
        
        instructions.forEach(instruction => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          doc.setFontSize(10);
          doc.text(`• ${instruction}`, margin + 5, yPosition);
          yPosition += 6;
        });
        yPosition += 10;
      }

      // Footer
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('This is a computer-generated receipt. No signature required.', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
      doc.text(`Generated on ${new Date().toLocaleString('en-IN')}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
      doc.text('HealthSecure Medical Center - Your Trusted Healthcare Partner', pageWidth / 2, yPosition, { align: 'center' });

      // Save the PDF
      doc.save(`medical-receipt-${data.appointmentNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      handleTextDownload();
    }
  };

  const handleTextDownload = () => {
    const receiptContent = `
        HealthSecure Medical Center - Professional Medical Receipt
        
        ================================================
        MEDICAL CONSULTATION RECEIPT
        ================================================
        
        Receipt Number: ${data.appointmentNumber}
        Date: ${formatDate(data.scheduledDate)}
        Time: ${formatTime(data.scheduledTime)}
        Consultation Type: ${data.consultationType}
        Status: ${data.status}
        
        ================================================
        DOCTOR INFORMATION
        ================================================
        Name: ${data.doctor.name}
        Specialization: ${data.doctor.specialization}
        Experience: ${data.doctor.experience} years
        Languages: ${data.doctor.languages.join(', ')}
        Location: ${data.doctor.location.address}
        
        ================================================
        PATIENT INFORMATION
        ================================================
        Name: ${data.patient.name}
        Email: ${data.patient.email}
        Phone: ${data.patient.phone}
        
        ================================================
        SERVICE CHARGES
        ================================================
        Consultation Fee: ₹${data.cost.consultationFee}
        Convenience Fee (5%): ₹${data.cost.convenienceFee}
        Total Amount: ₹${data.cost.totalAmount}
        
        ================================================
        PAYMENT INFORMATION
        ================================================
        Order ID: ${data.paymentDetails.orderId}
        Payment ID: ${data.paymentDetails.paymentId}
        Transaction ID: ${data.paymentDetails.razorpayPaymentId}
        Payment Status: ${data.paymentDetails.status}
        Paid At: ${new Date(data.paymentDetails.paidAt).toLocaleString('en-IN')}
        Currency: ${data.paymentDetails.currency}
        
        ================================================
        IMPORTANT NOTES
        ================================================
        - This is a computer-generated receipt
        - No signature required
        - Keep this receipt for your records
        - For any queries, contact support@healthsecure.com
        
        Generated on: ${new Date().toLocaleString('en-IN')}
        HealthSecure Medical Center - Your Trusted Healthcare Partner
      `;
      
      const blob = new Blob([receiptContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medical-receipt-${data.appointmentNumber}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      generatePDF();
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'HealthSecure Medical Receipt',
      text: `Medical consultation receipt for appointment with Dr. ${data.doctor.name}. Receipt Number: ${data.appointmentNumber}`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        const shareText = `${shareData.title}\n\n${shareData.text}\n\nReceipt Details:\n- Date: ${formatDate(data.scheduledDate)}\n- Time: ${formatTime(data.scheduledTime)}\n- Doctor: Dr. ${data.doctor.name}\n- Specialization: ${data.doctor.specialization}\n- Total Amount: ₹${data.cost.totalAmount}\n\nReceipt Number: ${data.appointmentNumber}`;
        
        await navigator.clipboard.writeText(shareText);
        alert('Receipt details copied to clipboard! You can now paste and share them.');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      
      try {
        const shareText = `${shareData.title}\n\n${shareData.text}\n\nReceipt Details:\n- Date: ${formatDate(data.scheduledDate)}\n- Time: ${formatTime(data.scheduledTime)}\n- Doctor: Dr. ${data.doctor.name}\n- Specialization: ${data.doctor.specialization}\n- Total Amount: ₹${data.cost.totalAmount}\n\nReceipt Number: ${data.appointmentNumber}`;
        
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        alert('Receipt details copied to clipboard! You can now paste and share them.');
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
        alert('Unable to share. Please manually copy the receipt details.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl border-0">
        <CardHeader className="border-b bg-gradient-to-r from-health-teal to-health-aqua text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Hospital className="w-7 h-7" />
              </div>
              Medical Consultation Receipt
            </CardTitle>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={handlePrint} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 bg-gray-50">
          {/* Header Section */}
          <div className="text-center mb-10 bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="w-24 h-24 bg-gradient-to-r from-health-teal to-health-aqua rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Hospital className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-health-charcoal mb-3">
              HealthSecure Medical Center
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Professional Medical Consultation Receipt
            </p>
            <Badge variant="outline" className="text-lg px-6 py-3 border-2 border-health-teal text-health-teal bg-white">
              <Receipt className="w-5 h-5 mr-2" />
              Receipt No: {data.appointmentNumber}
            </Badge>
          </div>

          {/* Main Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Consultation Details */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <CardTitle className="text-xl flex items-center gap-3 text-health-charcoal">
                  <div className="w-10 h-10 bg-health-teal rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  Consultation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Date:</span>
                    <span className="font-semibold text-health-charcoal">{formatDate(data.scheduledDate)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Time:</span>
                    <span className="font-semibold text-health-charcoal">{formatTime(data.scheduledTime)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Type:</span>
                    <Badge variant="default" className="bg-health-teal text-white capitalize">
                      {data.consultationType}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600 font-medium">Status:</span>
                    <Badge variant="default" className="bg-health-aqua text-white">
                      {data.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Doctor Information */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <CardTitle className="text-xl flex items-center gap-3 text-health-charcoal">
                  <div className="w-10 h-10 bg-health-teal rounded-lg flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  Doctor Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Name:</span>
                    <span className="font-semibold text-health-charcoal">{data.doctor.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Specialization:</span>
                    <span className="font-semibold text-health-charcoal">{data.doctor.specialization}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Experience:</span>
                    <span className="font-semibold text-health-charcoal">{data.doctor.experience} years</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600 font-medium">Languages:</span>
                    <span className="font-semibold text-health-charcoal">{data.doctor.languages.join(', ')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patient Information */}
          <Card className="shadow-lg border-0 mb-10">
            <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <CardTitle className="text-xl flex items-center gap-3 text-health-charcoal">
                <div className="w-10 h-10 bg-health-teal rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-600 text-sm font-medium block mb-2">Full Name</span>
                  <p className="font-semibold text-health-charcoal text-lg">{data.patient.name}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-600 text-sm font-medium block mb-2">Email Address</span>
                  <p className="font-semibold text-health-charcoal text-lg">{data.patient.email}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-600 text-sm font-medium block mb-2">Phone Number</span>
                  <p className="font-semibold text-health-charcoal text-lg">{data.patient.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Charges */}
          <Card className="shadow-lg border-0 mb-10">
            <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <CardTitle className="text-xl flex items-center gap-3 text-health-charcoal">
                <div className="w-10 h-10 bg-health-teal rounded-lg flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-white" />
                </div>
                Service Charges
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-4 border-b border-gray-200">
                  <span className="text-gray-600 font-medium text-lg">Consultation Fee:</span>
                  <span className="font-semibold text-health-charcoal text-lg">₹{data.cost.consultationFee}</span>
                </div>
                {data.cost.convenienceFee > 0 && (
                  <div className="flex justify-between items-center py-4 border-b border-gray-200">
                    <span className="text-gray-600 font-medium text-lg">Convenience Fee (5%):</span>
                    <span className="font-semibold text-health-charcoal text-lg">₹{data.cost.convenienceFee}</span>
                  </div>
                )}
                <Separator className="my-4" />
                <div className="flex justify-between items-center py-4 bg-gradient-to-r from-health-teal/10 to-health-aqua/10 rounded-lg px-4 border border-health-teal/20">
                  <span className="text-health-charcoal font-bold text-xl">Total Amount:</span>
                  <span className="text-health-teal font-bold text-2xl">₹{data.cost.totalAmount}</span>
                </div>
              </div>
              
              {/* Payment Transaction Details */}
              <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="font-bold text-lg mb-4 text-health-charcoal flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-health-teal" />
                  Payment Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Order ID:</span>
                      <p className="font-mono font-medium text-health-charcoal bg-white px-2 py-1 rounded text-xs border border-gray-200">{data.paymentDetails.orderId}</p>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Payment ID:</span>
                      <p className="font-mono font-medium text-health-charcoal bg-white px-2 py-1 rounded text-xs border border-gray-200">{data.paymentDetails.paymentId}</p>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Transaction ID:</span>
                      <p className="font-mono font-medium text-health-charcoal bg-white px-2 py-1 rounded text-xs border border-gray-200">{data.paymentDetails.razorpayPaymentId}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Payment Status:</span>
                      <Badge variant="default" className="bg-health-aqua text-white">
                        {data.paymentDetails.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Paid At:</span>
                      <p className="font-medium text-health-charcoal text-sm">
                        {new Date(data.paymentDetails.paidAt).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Currency:</span>
                      <p className="font-medium text-health-charcoal text-sm">{data.paymentDetails.currency}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Instructions for In-Person Consultation */}
          {data.consultationType === 'in-person' && (
            <Card className="mb-10 shadow-lg border-0 border-l-4 border-l-health-teal">
              <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <CardTitle className="text-xl flex items-center gap-3 text-health-charcoal">
                  <div className="w-10 h-10 bg-health-teal rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 text-white" />
                  </div>
                  Important Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-health-teal/20 rounded-full flex items-center justify-center mt-0.5">
                        <CheckCircle className="w-4 h-4 text-health-teal" />
                      </div>
                      <span className="text-health-charcoal">Please arrive 15 minutes before your scheduled appointment time</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-health-teal/20 rounded-full flex items-center justify-center mt-0.5">
                        <CheckCircle className="w-4 h-4 text-health-teal" />
                      </div>
                      <span className="text-health-charcoal">Bring this receipt and a valid photo ID for verification</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-health-teal/20 rounded-full flex items-center justify-center mt-0.5">
                        <CheckCircle className="w-4 h-4 text-health-teal" />
                      </div>
                      <span className="text-health-charcoal">Payment has been processed - no additional payment required</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-health-teal/20 rounded-full flex items-center justify-center mt-0.5">
                        <CheckCircle className="w-4 h-4 text-health-teal" />
                      </div>
                      <span className="text-health-charcoal">Wear a mask and maintain social distancing as per hospital guidelines</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-health-teal/20 rounded-full flex items-center justify-center mt-0.5">
                        <CheckCircle className="w-4 h-4 text-health-teal" />
                      </div>
                      <span className="text-health-charcoal">Contact the hospital if you need to reschedule or cancel</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-health-teal/20 rounded-full flex items-center justify-center mt-0.5">
                        <CheckCircle className="w-4 h-4 text-health-teal" />
                      </div>
                      <span className="text-health-charcoal">Follow all hospital safety protocols and guidelines</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hospital Location */}
          <Card className="mb-10 shadow-lg border-0">
            <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <CardTitle className="text-xl flex items-center gap-3 text-health-charcoal">
                <div className="w-10 h-10 bg-health-teal rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                Hospital Location & Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building className="w-6 h-6 mt-1 text-health-teal" />
                    <div>
                      <p className="font-semibold text-health-charcoal mb-1">Hospital Address</p>
                      <p className="text-gray-600 leading-relaxed">{data.doctor.location.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock3 className="w-6 h-6 text-health-teal" />
                    <span className="text-gray-700">
                      <strong>Arrival Time:</strong> Please arrive 15 minutes before your scheduled time
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="w-6 h-6 text-health-teal" />
                    <div>
                      <span className="text-gray-600 text-sm block">Emergency Contact</span>
                      <span className="font-semibold text-health-charcoal">+91-1800-123-4567</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-6 h-6 text-health-teal" />
                    <div>
                      <span className="text-gray-600 text-sm block">Support Email</span>
                      <span className="font-semibold text-health-charcoal">support@healthsecure.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security & Trust Badges */}
          <Card className="mb-10 shadow-lg border-0 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-health-teal/20 rounded-full flex items-center justify-center mb-3">
                    <Shield className="w-6 h-6 text-health-teal" />
                  </div>
                  <h4 className="font-semibold text-health-charcoal mb-1">Secure Payment</h4>
                  <p className="text-sm text-gray-600">256-bit SSL encrypted</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-health-aqua/20 rounded-full flex items-center justify-center mb-3">
                    <Award className="w-6 h-6 text-health-aqua" />
                  </div>
                  <h4 className="font-semibold text-health-charcoal mb-1">Certified Platform</h4>
                  <p className="text-sm text-gray-600">ISO 27001 certified</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-health-teal/20 rounded-full flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6 text-health-teal" />
                  </div>
                  <h4 className="font-semibold text-health-charcoal mb-1">Digital Receipt</h4>
                  <p className="text-sm text-gray-600">Eco-friendly & instant</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-gray-500 border-t border-gray-200 pt-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-8 h-8 bg-health-teal rounded-full flex items-center justify-center">
                <Hospital className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-health-charcoal">Thank you for choosing HealthSecure Medical Center!</h3>
            </div>
            <p className="text-sm mb-2">
              This is a computer-generated receipt. No signature required.
            </p>
            <p className="text-xs text-gray-400">
              Generated on {new Date().toLocaleString('en-IN')} | HealthSecure Medical Center - Your Trusted Healthcare Partner
            </p>
          </div>
        </CardContent>
        
        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200 bg-white">
          <div className="flex justify-center gap-4">
            <Button onClick={onClose} className="bg-health-teal hover:bg-health-teal/90 text-white px-8 py-3 text-lg">
              Close Receipt
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
