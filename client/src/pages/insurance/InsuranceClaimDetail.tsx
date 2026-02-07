
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, FileText, Shield, DollarSign, Calendar, User, Upload, Download, Trash2, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import insuranceClaimService, { InsuranceClaim } from '@/services/insuranceClaimService';

const InsuranceClaimDetail = () => {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [claim, setClaim] = useState<InsuranceClaim | null>(null);
  const [coverage, setCoverage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Status update modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    status: 'approved' as InsuranceClaim['status'],
    approvedAmount: '',
    reviewNotes: '',
    priority: 'medium' as InsuranceClaim['priority']
  });

  // Document upload modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: 'document',
    file: null as File | null
  });

  useEffect(() => {
    if (claimId) {
      fetchClaimDetails();
    }
  }, [claimId]);

  const fetchClaimDetails = async () => {
    try {
      setLoading(true);
      const allClaims = insuranceClaimService.getClaims().claims;
      const foundClaim = allClaims.find(c => c.id === claimId);
      setClaim(foundClaim || null);
      setCoverage(null); // No backend coverage, set to null
    } catch (error) {
      console.error('Error fetching claim details:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch claim details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setUpdating(true);
      if (!claimId) return;
      if (statusUpdate.status === 'draft') {
        await insuranceClaimService.saveDraft({ id: claimId, ...statusUpdate });
      } else {
        await insuranceClaimService.submitClaim(claimId, statusUpdate);
      }
      toast({
        title: 'Success',
        description: 'Claim status updated successfully',
      });
      setShowStatusModal(false);
      fetchClaimDetails();
    } catch (error) {
      console.error('Error updating claim status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update claim status',
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDocumentUpload = async () => {
    if (!uploadForm.file) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive'
      });
      return;
    }
    setUploading(true);
    try {
      if (!claimId) return;
      // Simulate document upload by updating claim's documents array
      const allClaims = insuranceClaimService.getClaims().claims;
      const foundClaim = allClaims.find(c => c.id === claimId);
      if (!foundClaim) throw new Error('Claim not found');
      const newDoc = {
        id: `DOC-${Date.now()}`,
        name: uploadForm.name,
        type: uploadForm.type,
        url: URL.createObjectURL(uploadForm.file),
        uploadedAt: new Date().toISOString(),
        status: 'pending'
      };
      insuranceClaimService.updateClaim(claimId, {
        documents: [...(foundClaim.documents || []), newDoc]
      });
      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });
      setShowUploadModal(false);
      fetchClaimDetails();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload document',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      if (!claimId) return;
      const allClaims = insuranceClaimService.getClaims().claims;
      const foundClaim = allClaims.find(c => c.id === claimId);
      if (!foundClaim) throw new Error('Claim not found');
      const updatedDocs = (foundClaim.documents || []).filter((doc: any) => doc.id !== documentId);
      insuranceClaimService.updateClaim(claimId, { documents: updatedDocs });
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });
      fetchClaimDetails();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount: number) => {
    return insuranceClaimService.formatAmount(amount);
  };

  const getStatusColor = (status: InsuranceClaim['status']) => {
    return insuranceClaimService.getStatusColor(status);
  };

  const getPriorityColor = (priority: InsuranceClaim['priority']) => {
    return insuranceClaimService.getPriorityColor(priority);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-health-teal" />
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-health-danger mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-health-charcoal">Claim not found</h2>
        <p className="text-health-blue-gray mt-2">The claim you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/insurance/claims')} className="mt-4">
          Back to Claims
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/insurance/claims">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Claims
            </Button>
          </Link>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Claim #{claim.claimId}</h1>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="docName">Document Name</Label>
                  <Input
                    id="docName"
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter document name"
                  />
                </div>
                <div>
                  <Label htmlFor="docType">Document Type</Label>
                  <Select value={uploadForm.type} onValueChange={(value) => setUploadForm(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="medical_record">Medical Record</SelectItem>
                      <SelectItem value="invoice">Invoice</SelectItem>
                      <SelectItem value="prescription">Prescription</SelectItem>
                      <SelectItem value="lab_result">Lab Result</SelectItem>
                      <SelectItem value="imaging">Imaging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="docFile">File</Label>
                  <Input
                    id="docFile"
                    type="file"
                    onChange={(e) => setUploadForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleDocumentUpload} disabled={uploading || !uploadForm.file}>
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Upload
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
            <DialogTrigger asChild>
              <Button className="bg-health-success hover:bg-health-success/90">
                Update Status
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Claim Status</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={statusUpdate.status} onValueChange={(value) => setStatusUpdate(prev => ({ ...prev, status: value as InsuranceClaim['status'] }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="requires_proof">Requires Proof</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {statusUpdate.status === 'approved' && (
                  <div>
                    <Label htmlFor="approvedAmount">Approved Amount</Label>
                    <Input
                      id="approvedAmount"
                      type="number"
                      step="0.01"
                      value={statusUpdate.approvedAmount}
                      onChange={(e) => setStatusUpdate(prev => ({ ...prev, approvedAmount: e.target.value }))}
                      placeholder="Enter approved amount"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={statusUpdate.priority} onValueChange={(value) => setStatusUpdate(prev => ({ ...prev, priority: value as InsuranceClaim['priority'] }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reviewNotes">Review Notes</Label>
                  <Textarea
                    id="reviewNotes"
                    value={statusUpdate.reviewNotes}
                    onChange={(e) => setStatusUpdate(prev => ({ ...prev, reviewNotes: e.target.value }))}
                    placeholder="Enter review notes"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowStatusModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleStatusUpdate} disabled={updating}>
                    {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Update Status
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Claim Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-health-charcoal">Claim ID</label>
                  <p className="text-health-teal font-medium">{claim.claimId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-health-charcoal">Status</label>
                  <Badge className={getStatusColor(claim.status)}>
                    {claim.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-health-charcoal">Priority</label>
                  <Badge className={getPriorityColor(claim.priority)}>
                    {claim.priority}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-health-charcoal">Submitted Date</label>
                  <p className="text-health-teal">{formatDate(claim.submittedDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-health-charcoal">Claim Amount</label>
                  <p className="text-health-teal font-bold">{formatAmount(claim.claimAmount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-health-charcoal">Approved Amount</label>
                  <p className="text-health-teal font-bold">{formatAmount(claim.approvedAmount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-health-charcoal">Provider</label>
                  <p className="text-health-teal">{claim.providerName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-health-charcoal">Service Date</label>
                  <p className="text-health-teal">{formatDate(claim.serviceDate)}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-health-charcoal">Claim Type</label>
                  <p className="text-health-teal">{insuranceClaimService.getClaimTypeDisplay(claim.claimType)}</p>
                </div>
                {claim.description && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-health-charcoal">Description</label>
                    <p className="text-health-teal">{claim.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {claim.procedureCodes && claim.procedureCodes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Services & Procedures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {claim.procedureCodes.map((procedure, index) => (
                    <div key={index} className="border rounded p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-health-teal">{procedure.description}</h4>
                          <p className="text-sm text-health-charcoal">CPT Code: {procedure.code}</p>
                        </div>
                        <span className="font-bold text-health-teal">{formatAmount(procedure.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Documents & Proofs</CardTitle>
            </CardHeader>
            <CardContent>
              {claim.documents && claim.documents.length > 0 ? (
                <div className="space-y-3">
                  {claim.documents.map((document) => (
                    <div key={document.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-health-teal" />
                        <div>
                          <span className="font-medium text-health-teal">{document.name}</span>
                          <p className="text-sm text-health-charcoal">
                            {document.type} • {formatDate(document.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={document.status === 'verified' ? "default" : "secondary"}>
                          {document.status === 'verified' ? 'Verified' : 'Pending'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(document.url, '_blank')}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDocumentDelete(document.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-health-blue-gray">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No documents uploaded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Policy Holder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-health-teal" />
                  <span className="font-medium text-health-teal">{claim.patientName}</span>
                </div>
                <div className="text-sm text-health-charcoal space-y-1">
                  <p><span className="font-medium">Email:</span> {claim.patientEmail}</p>
                  <p><span className="font-medium">Policy #:</span> {claim.policyNumber}</p>
                  {claim.groupNumber && <p><span className="font-medium">Group #:</span> {claim.groupNumber}</p>}
                  <p><span className="font-medium">Member ID:</span> {claim.memberId}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {coverage && (
            <Card>
              <CardHeader>
                <CardTitle>Coverage Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-health-charcoal">Deductible</span>
                    <span className="text-health-teal">{formatAmount(claim.deductible)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-health-charcoal">Coinsurance</span>
                    <span className="text-health-teal">{claim.coinsurance}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-health-charcoal">Copay</span>
                    <span className="text-health-teal">{formatAmount(claim.copay)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-health-charcoal">Out-of-Pocket Max</span>
                    <span className="text-health-teal">{formatAmount(claim.outOfPocketMax)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-medium">
                    <span className="text-health-charcoal">Insurance Pays</span>
                    <span className="text-health-teal">{formatAmount(coverage.insurancePays)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-health-charcoal">Patient Responsibility</span>
                    <span className="text-health-teal">{formatAmount(coverage.patientResponsibility)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Claim Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-health-success rounded-full"></div>
                  <span className="text-health-charcoal">Claim submitted - {formatDate(claim.submittedDate)}</span>
                </div>
                {claim.reviewDate && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-health-success rounded-full"></div>
                    <span className="text-health-charcoal">Reviewed - {formatDate(claim.reviewDate)}</span>
                  </div>
                )}
                {claim.processedDate && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-health-success rounded-full"></div>
                    <span className="text-health-charcoal">Processed - {formatDate(claim.processedDate)}</span>
                  </div>
                )}
                {claim.reviewNotes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm font-medium text-health-charcoal mb-1">Review Notes:</p>
                    <p className="text-sm text-health-blue-gray">{claim.reviewNotes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InsuranceClaimDetail;
