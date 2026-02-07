
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Search, Filter, Eye, Download, Clock, CheckCircle, XCircle, Share, AlertCircle, Bell } from 'lucide-react';
import { toast } from 'sonner';
import proofService from '@/services/proofService.js';
import { ProofStatus, ProofCategories } from '@/types/proof.js';
import realtimeService from '@/services/realtimeService';
import { GenerateProofDialog } from '@/components/proofs/GenerateProofDialog';
import { ShareProofDialog } from '@/components/proofs/ShareProofDialog';
import { ProofDetailsDialog } from '@/components/proofs/ProofDetailsDialog';
import { ProofRequestsDialog } from '@/components/proofs/ProofRequestsDialog';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';

const PatientProofs = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [proofs, setProofs] = useState<any[]>([]); // Changed to any[] as Proof type is removed
  const [stats, setStats] = useState({
    active: 0,
    pending: 0,
    expired: 0,
    totalAccess: 0
  });
  const [loading, setLoading] = useState(true);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showRequestsDialog, setShowRequestsDialog] = useState(false);
  const [selectedProof, setSelectedProof] = useState<any | null>(null); // Changed to any
  const [pendingRequests, setPendingRequests] = useState(0);
  const [showExpiryDialog, setShowExpiryDialog] = useState(false);
  const [expiryProof, setExpiryProof] = useState<any | null>(null); // Changed to any
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [autoRevoke, setAutoRevoke] = useState<number | null>(null);

  // Fetch proofs and stats
  const fetchData = async () => {
    try {
      // Only include status if it's not 'all'
      const params: any = { limit: 100 };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const [proofsData, statsData, requestsResponse] = await Promise.all([
        proofService.getProofs(params),
        proofService.getProofStats(),
        fetch('/api/proof-requests/patient/pending-count', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);
      console.log('proofsData:', proofsData);
      // Fix: handle both array and object response
      if (Array.isArray(proofsData)) {
        setProofs(proofsData);
      } else if (proofsData && Array.isArray(proofsData.proofs)) {
        setProofs(proofsData.proofs);
      } else {
        setProofs([]);
      }
      setStats(statsData);
      const requestsData = await requestsResponse.json();
      setPendingRequests(requestsData.count);
    } catch (error) {
      console.error('Error fetching proofs:', error);
      toast.error('Failed to load proofs');
    } finally {
      setLoading(false);
    }
  };

  // Setup realtime updates
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    realtimeService.ensureConnection(token);

    const handleProofCreated = (data) => {
      toast.success('New proof created');
      fetchData();
    };

    const handleProofUpdated = (data) => {
      toast.info('Proof updated');
      fetchData();
    };

    const handleProofShared = (data) => {
      toast.success('Proof shared successfully');
      fetchData();
    };

    const handleProofRevoked = (data) => {
      toast.warning('Proof revoked');
      fetchData();
    };

    const handleProofExpired = (data) => {
      toast.warning('Proof expired');
      fetchData();
    };

    realtimeService.on('proof_created', handleProofCreated);
    realtimeService.on('proof_updated', handleProofUpdated);
    realtimeService.on('proof_shared', handleProofShared);
    realtimeService.on('proof_revoked', handleProofRevoked);
    realtimeService.on('proof_expired', handleProofExpired);

    return () => {
      realtimeService.off('proof_created', handleProofCreated);
      realtimeService.off('proof_updated', handleProofUpdated);
      realtimeService.off('proof_shared', handleProofShared);
      realtimeService.off('proof_revoked', handleProofRevoked);
      realtimeService.off('proof_expired', handleProofExpired);
      realtimeService.unsubscribeFromProofUpdates();
    };
  }, [navigate]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [statusFilter]);

    const filteredProofs = proofs.filter(proof => {
    const matchesSearch = proof.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proof.statement.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proof.proofType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  useEffect(() => {
    console.log('Proofs:', proofs);
    console.log('Filtered Proofs:', filteredProofs);
  }, [proofs, filteredProofs]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-health-success text-white';
      case 'expired': return 'bg-health-danger text-white';
      case 'pending': return 'bg-health-warning text-white';
      case 'revoked': return 'bg-health-danger text-white';
      default: return 'bg-health-blue-gray text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <XCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'revoked': return <AlertCircle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const handleDownload = async (proof: any) => { // Changed to any
    try {
      const blob = await proofService.downloadProof(proof._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Proof-${proof._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Proof downloaded successfully');
    } catch (error) {
      console.error('Error downloading proof:', error);
      toast.error('Failed to download proof');
    }
  };

  const handleDownloadWatermarked = async (proof: any) => { // Changed to any
    try {
      const blob = await proofService.downloadWatermarkedProof(proof._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Proof-${proof._id}-watermarked.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Watermarked proof downloaded');
    } catch (error) {
      console.error('Error downloading watermarked proof:', error);
      toast.error('Failed to download watermarked proof');
    }
  };

  const handleShare = (proof: any) => { // Changed to any
    setSelectedProof(proof);
    setShowShareDialog(true);
  };

  const handleViewDetails = (proof: any) => { // Changed to any
    setSelectedProof(proof);
    setShowDetailsDialog(true);
  };

  const handleOpenExpiryDialog = (proof: any) => { // Changed to any
    setExpiryProof(proof);
    setExpiryDate(proof.expiresAt ? new Date(proof.expiresAt) : null);
    setAutoRevoke(proof.autoRevokeAfterAccess ?? null);
    setShowExpiryDialog(true);
  };
  const handleSetExpiry = async () => {
    if (!expiryProof) return;
    try {
      await proofService.setProofExpiry(expiryProof._id, {
        expiresAt: expiryDate ?? undefined,
        autoRevokeAfterAccess: autoRevoke ?? undefined
      });
      toast.success('Expiry/auto-revoke updated');
      setShowExpiryDialog(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update expiry');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-teal"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Shared Proofs</h1>
          <p className="text-health-charcoal mt-2">Manage your data sharing permissions and zero-knowledge proofs</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline"
            className="relative"
            onClick={() => setShowRequestsDialog(true)}
          >
            <Bell className="w-4 h-4 mr-2" />
            Requests
            {pendingRequests > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-health-danger text-white text-xs flex items-center justify-center">
                {pendingRequests}
              </span>
            )}
          </Button>
          <Button 
            className="bg-health-aqua hover:bg-health-aqua/90 text-white"
            onClick={() => setShowGenerateDialog(true)}
          >
            <Shield className="w-4 h-4 mr-2" />
            Generate New Proof
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-success/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-health-success" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Active Proofs</p>
                <p className="text-2xl font-bold text-health-teal">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-warning/10 rounded-lg">
                <Clock className="w-6 h-6 text-health-warning" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Pending</p>
                <p className="text-2xl font-bold text-health-teal">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-danger/10 rounded-lg">
                <XCircle className="w-6 h-6 text-health-danger" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Expired</p>
                <p className="text-2xl font-bold text-health-teal">{stats.expired}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-aqua/10 rounded-lg">
                <Eye className="w-6 h-6 text-health-aqua" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Total Access</p>
                <p className="text-2xl font-bold text-health-teal">{stats.totalAccess}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-health-blue-gray w-4 h-4" />
                <Input
                  placeholder="Search by title, statement, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                  <SelectItem value="Revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proofs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Shared Proofs</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProofs.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-health-blue-gray/30 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-health-charcoal mb-1">No proofs found</h3>
              <p className="text-health-blue-gray">
                {searchTerm ? 'Try adjusting your search terms' : 'Start by generating a new proof'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statement</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Access Count</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProofs.map((proof) => (
                  <TableRow key={proof._id}>
                    <TableCell className="font-medium">{proof.title}</TableCell>
                    <TableCell>{proof.proofType}</TableCell>
                    <TableCell className="max-w-xs truncate">{proof.statement}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(proof.status)}>
                        {getStatusIcon(proof.status)}
                        <span className="ml-1 capitalize">{proof.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {proof.expiresAt ? (
                        <span title={format(new Date(proof.expiresAt), 'PPPpp')}>{format(new Date(proof.expiresAt), 'PPP')}</span>
                      ) : (
                        <span className="text-gray-400">No expiry</span>
                      )}
                      {proof.autoRevokeAfterAccess !== null && (
                        <div className="text-xs text-health-danger">Auto-revoke after {proof.autoRevokeAfterAccess} access{proof.autoRevokeAfterAccess > 1 ? 'es' : ''}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewDetails(proof)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleShare(proof)}
                        >
                          <Share className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownload(proof)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadWatermarked(proof)}
                        >
                          <Download className="w-4 h-4 mr-1" /> Download Watermarked
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleOpenExpiryDialog(proof)}
                        >
                          <Clock className="w-4 h-4 mr-1" /> Set Expiry
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <GenerateProofDialog
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        onProofGenerated={fetchData}
      />

      <ProofRequestsDialog
        open={showRequestsDialog}
        onOpenChange={setShowRequestsDialog}
      />

      {selectedProof && (
        <>
          <ShareProofDialog
            open={showShareDialog}
            onOpenChange={setShowShareDialog}
            proofId={selectedProof._id}
            proofTitle={selectedProof.title}
          />

          <ProofDetailsDialog
            open={showDetailsDialog}
            onOpenChange={setShowDetailsDialog}
            proof={selectedProof}
            onShare={() => {
              setShowDetailsDialog(false);
              setShowShareDialog(true);
            }}
            onDownload={() => handleDownload(selectedProof)}
          />
        </>
      )}

      {/* Expiry Dialog */}
      <Dialog open={showExpiryDialog} onOpenChange={setShowExpiryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Expiry & Auto-Revoke</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Expiry Date</label>
              <Input
                type="date"
                value={expiryDate ? format(expiryDate, 'yyyy-MM-dd') : ''}
                onChange={e => setExpiryDate(e.target.value ? new Date(e.target.value) : null)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Auto-Revoke After Accesses</label>
              <Input
                type="number"
                min={1}
                value={autoRevoke ?? ''}
                onChange={e => setAutoRevoke(e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Leave blank for unlimited"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowExpiryDialog(false)}>Cancel</Button>
              <Button className="bg-health-teal text-white" onClick={handleSetExpiry}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientProofs;
