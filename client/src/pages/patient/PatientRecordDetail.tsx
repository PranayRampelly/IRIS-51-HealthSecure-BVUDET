
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Download, 
  Share, 
  FileText, 
  Copy,
  ExternalLink,
  Calendar,
  Clock,
  Building,
  Tag,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';
import realtimeService from '@/services/realtimeService';

interface HealthRecord {
  _id: string;
  type: string;
  title: string;
  description?: string;
  provider: string;
  date: string;
  status: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

const PatientRecordDetail = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<HealthRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareForm, setShareForm] = useState({
    email: '',
    message: '',
    duration: '7'
  });

  useEffect(() => {
    if (recordId) {
      fetchRecord();
      setupRealtimeConnection();
    }
  }, [recordId]);

  useEffect(() => {
    return () => {
      // Remove any custom cleanup for unsubscribeFromRecordUpdates
      // Add any needed cleanup for event listeners here
    };
  }, [recordId]);

  const fetchRecord = async () => {
    if (!recordId) return;
    
    try {
      setLoading(true);
      const response = await api.getHealthRecord(recordId);
      
      if (response && response.record) {
        setRecord(response.record);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: unknown) {
      console.error('Error fetching record:', error);
      toast.error('Failed to load health record');
      navigate('/patient/records');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!record?._id) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/health-records/export/${record._id}?format=pdf`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (!response.ok) throw new Error('Failed to download PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Health-Record-${record._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Medical report PDF downloaded');
      // Send real-time update about download
      realtimeService.sendUpdate('health-record:downloaded', { recordId: record._id });
    } catch (error) {
      toast.error('Failed to download medical report');
      console.error('Download error:', error);
    }
  };

  const handleShare = async () => {
    if (!record || !shareForm.email) {
      toast.error('Please provide recipient email');
      return;
    }

    try {
      const response = await api.shareHealthRecord(record._id, shareForm);
      
      // Send real-time update about sharing
      realtimeService.sendUpdate('health-record:shared', { 
        recordId: record._id, 
        sharedWith: shareForm.email 
      });
      
      toast.success(`Record shared with ${shareForm.email}`);
      setShowShareDialog(false);
      setShareForm({ email: '', message: '', duration: '7' });
    } catch (error) {
      console.error('Error sharing record:', error);
      toast.error('Failed to share record');
    }
  };

  const handleCreateProof = async () => {
    if (!record) return;

    try {
      const response = await api.createProof(record._id);
      
      // Send real-time update about proof creation
      realtimeService.sendUpdate('proof:created', { recordId: record._id });
      
      toast.success('Proof created successfully');
      // Optionally navigate to the proof
      navigate(`/patient/proofs/${response.proofId}`);
    } catch (error) {
      console.error('Error creating proof:', error);
      toast.error('Failed to create proof');
    }
  };

  const handleCopyLink = async () => {
    if (!record) return;

    try {
      const shareableLink = `${window.location.origin}/shared/records/${record._id}`;
      await navigator.clipboard.writeText(shareableLink);
      
      // Send real-time update about link copy
      realtimeService.sendUpdate('health-record:link-copied', { recordId: record._id });
      
      toast.success('Link copied to clipboard');
    } catch (error) {
      console.error('Error copying link:', error);
      toast.error('Failed to copy link');
    }
  };

  const handlePrint = async () => {
    if (!record) return;

    try {
      // Open print dialog
      window.print();
      
      // Send real-time update about printing
      realtimeService.sendUpdate('health-record:printed', { recordId: record._id });
      
      toast.success('Print dialog opened');
    } catch (error) {
      console.error('Error printing record:', error);
      toast.error('Failed to print record');
    }
  };

  const setupRealtimeConnection = () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userId && userRole && recordId) {
      // Initialize real-time connection if not already connected
      if (!realtimeService.getConnectionStatus()) {
        realtimeService.initialize(token, userId, userRole).catch((error) => {
          console.error('Failed to connect to real-time service:', error);
        });
      }
      
      // Listen for real-time updates using the correct methods
      realtimeService.onMessage('health-record:updated', (data: { record: HealthRecord }) => {
        if (data.record._id === recordId) {
          toast.success('Record updated in real-time');
          fetchRecord();
        }
      });

      realtimeService.onMessage('health-record:shared', (data: { recordId: string; sharedWith: string }) => {
        if (data.recordId === recordId) {
          toast.success(`Record shared with ${data.sharedWith}`);
        }
      });

      realtimeService.onMessage('health-record:downloaded', (data: { recordId: string }) => {
        if (data.recordId === recordId) {
          toast.info('Record downloaded');
        }
      });

      realtimeService.onMessage('proof:created', (data: { recordId: string }) => {
        if (data.recordId === recordId) {
          toast.success('New proof created');
        }
      });

      realtimeService.onMessage('health-record:link-copied', (data: { recordId: string }) => {
        if (data.recordId === recordId) {
          toast.info('Record link copied');
        }
      });

      realtimeService.onMessage('health-record:printed', (data: { recordId: string }) => {
        if (data.recordId === recordId) {
          toast.info('Record printed');
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-teal"></div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <h2 className="text-2xl font-semibold text-gray-800">Record Not Found</h2>
        <p className="text-gray-600">The health record you're looking for doesn't exist or has been removed.</p>
        <Button 
          onClick={() => navigate('/patient/records')}
          className="mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Records
        </Button>
      </div>
    );
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/patient/records')}
            className="text-health-teal hover:text-health-teal/90"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Records
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{record.title}</h1>
            <p className="text-gray-600">{record.type} • {new Date(record.date).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={handleDownload}
            disabled={!record.fileUrl}
            className="bg-health-aqua hover:bg-health-aqua/90 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            onClick={() => setShowShareDialog(true)}
            className="bg-health-teal hover:bg-health-teal/90 text-white"
          >
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Record Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-health-teal" />
                <span>Record Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <p className="mt-1 text-gray-900">{record.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="mt-1 text-gray-900">{format(new Date(record.date), 'MMMM dd, yyyy')}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Provider</label>
                <p className="mt-1 text-gray-900">{record.provider}</p>
              </div>
              {record.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="mt-1 text-gray-700 whitespace-pre-wrap">{record.description}</p>
                </div>
              )}
              {record.tags && record.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Tags</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {record.tags.map(tag => (
                      <Badge key={tag} variant="tag">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-2">
                  <Badge className={
                    record.status.toLowerCase() === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }>
                    {record.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Information */}
          {record.fileUrl && (
            <Card>
              <CardHeader>
                <CardTitle>File Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <FileText className="w-8 h-8 text-health-teal" />
                    <div>
                      <p className="font-medium">{record.fileName}</p>
                      <p className="text-sm text-gray-500">
                        {record.mimeType} • {formatFileSize(record.fileSize)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => window.open(record.fileUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button onClick={handleDownload} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleCreateProof}
                className="w-full bg-health-teal hover:bg-health-teal/90 text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Create Proof
              </Button>
              <Button 
                onClick={handleCopyLink}
                variant="outline" 
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button 
                onClick={handlePrint}
                variant="outline" 
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Print Record
              </Button>
            </CardContent>
          </Card>

          {/* Record Information */}
          <Card>
            <CardHeader>
              <CardTitle>Record Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">{format(new Date(record.createdAt), 'MMM dd, yyyy')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">{format(new Date(record.updatedAt), 'MMM dd, yyyy')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Building className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Provider</p>
                  <p className="font-medium">{record.provider}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Health Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Recipient Email</label>
              <Input
                type="email"
                value={shareForm.email}
                onChange={(e) => setShareForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="doctor@hospital.com"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Message (Optional)</label>
              <Textarea
                value={shareForm.message}
                onChange={(e) => setShareForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Add a note about why you're sharing this record..."
                className="w-full"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Access Duration</label>
              <Select 
                value={shareForm.duration}
                onValueChange={(value) => setShareForm(prev => ({ ...prev, duration: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleShare} className="bg-health-teal hover:bg-health-teal/90 text-white">
                Share Record
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientRecordDetail;
