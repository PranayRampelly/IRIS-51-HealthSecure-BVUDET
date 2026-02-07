
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Search, Filter, Eye, CheckCircle, XCircle, Clock, AlertTriangle, FileText, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import proofValidationService, { ProofValidation, ManualReviewData } from '@/services/proofValidationService';

const InsuranceValidateProofs = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('pending');
  const [proofs, setProofs] = useState<ProofValidation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProofs: 0,
    hasNext: false,
    hasPrev: false
  });
  const [statistics, setStatistics] = useState({
    pending: 0,
    verified: 0,
    flagged: 0,
    rejected: 0,
    totalValue: 0
  });
  const [aiInsights, setAiInsights] = useState({
    documentAuthenticity: { signatureAnalysis: 0, watermarkVerification: 0 },
    contentValidation: { medicalTerminology: 0, dateConsistency: 0 },
    riskAssessment: { fraudDetection: 0, patternAnalysis: 0 },
    totalProofs: 0
  });

  // Fetch proofs from backend
  const fetchProofs = async () => {
    try {
      setLoading(true);
      const response = await proofValidationService.getProofs({
        page: pagination.currentPage,
        limit: 10,
        status: activeTab === 'all' ? undefined : activeTab,
        search: searchTerm || undefined,
        sortBy: 'submittedDate',
        sortOrder: 'desc'
      });
      
      setProofs(response.proofs);
      setPagination(response.pagination);
      setStatistics(response.statistics);
      setAiInsights(response.aiInsights);
    } catch (error) {
      console.error('Error fetching proofs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch proofs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle manual review
  const handleManualReview = async (proofId: string, decision: 'approved' | 'rejected' | 'flagged', notes?: string) => {
    try {
      setUpdating(proofId);
      const reviewData: ManualReviewData = {
        decision,
        notes
      };
      
      await proofValidationService.manualReview(proofId, reviewData);
      
      toast({
        title: 'Success',
        description: `Proof ${decision}`,
      });
      
      // Refresh proofs
      fetchProofs();
    } catch (error) {
      console.error('Error in manual review:', error);
      toast({
        title: 'Error',
        description: 'Failed to process review',
        variant: 'destructive'
      });
    } finally {
      setUpdating(null);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const blob = await proofValidationService.exportProofs({
        format: 'csv',
        status: statusFilter === 'all' ? undefined : statusFilter
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proofs-export-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Success',
        description: 'Export completed successfully',
      });
    } catch (error) {
      console.error('Error exporting proofs:', error);
      toast({
        title: 'Error',
        description: 'Failed to export proofs',
        variant: 'destructive'
      });
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  // Filter proofs based on search and status
  const filteredProofs = proofs.filter(proof => {
    const matchesSearch = searchTerm === '' || 
      proof.patientId.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proof.patientId.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proof.proofId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proof.claimId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || proof.status === statusFilter;
    const matchesTab = activeTab === 'all' || proof.status === activeTab;
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  // Load proofs on component mount and when dependencies change
  useEffect(() => {
    fetchProofs();
  }, [pagination.currentPage, activeTab, searchTerm]);

  const getStatusColor = (status: ProofValidation['status']) => {
    return proofValidationService.getStatusColor(status);
  };

  const getRiskColor = (risk: ProofValidation['riskScore']) => {
    return proofValidationService.getRiskColor(risk);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Validate Proofs</h1>
          <p className="text-health-charcoal mt-2">Verify and validate medical proofs using AI and blockchain technology</p>
        </div>
        <Button 
          className="bg-health-success hover:bg-health-success/90 text-white"
          onClick={handleExport}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-warning/10 rounded-lg">
                <Clock className="w-6 h-6 text-health-warning" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Pending Validation</p>
                <p className="text-2xl font-bold text-health-teal">{statistics.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-success/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-health-success" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Verified Today</p>
                <p className="text-2xl font-bold text-health-teal">{statistics.verified}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-danger/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-health-danger" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">Flagged for Review</p>
                <p className="text-2xl font-bold text-health-teal">{statistics.flagged}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-health-aqua/10 rounded-lg">
                <Shield className="w-6 h-6 text-health-aqua" />
              </div>
              <div>
                <p className="text-sm text-health-charcoal">AI Accuracy</p>
                <p className="text-2xl font-bold text-health-teal">
                  {aiInsights.totalProofs > 0 
                    ? Math.round((aiInsights.documentAuthenticity.signatureAnalysis + 
                                 aiInsights.contentValidation.medicalTerminology + 
                                 aiInsights.riskAssessment.fraudDetection) / 3)
                    : 0}%
                </p>
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
                  placeholder="Search by proof ID, patient, or provider..."
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
                  <SelectItem value="all">All Proofs</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Proof Validation Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">Pending ({statistics.pending})</TabsTrigger>
              <TabsTrigger value="verified">Verified ({statistics.verified})</TabsTrigger>
              <TabsTrigger value="flagged">Flagged ({statistics.flagged})</TabsTrigger>
              <TabsTrigger value="all">All Proofs ({pagination.totalProofs})</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-health-teal" />
                  <span className="ml-2 text-health-charcoal">Loading proofs...</span>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Proof ID</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Claim ID</TableHead>
                        <TableHead>Risk Score</TableHead>
                        <TableHead>AI Confidence</TableHead>
                        <TableHead>Blockchain</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProofs.map((proof) => (
                        <TableRow key={proof._id}>
                          <TableCell className="font-mono text-sm">{proof.proofId}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {proof.patientId.firstName} {proof.patientId.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{proof.patientId.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {proof.providerId ? (
                              <div>
                                <div className="font-medium">
                                  {proof.providerId.firstName} {proof.providerId.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{proof.providerId.email}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {proofValidationService.getDocumentTypeDisplay(proof.documentType)}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{proof.claimId}</TableCell>
                          <TableCell>
                            <Badge className={getRiskColor(proof.riskScore)}>
                              {proof.riskScore}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-health-light-gray rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${proofValidationService.getConfidenceColor(proof.aiAnalysis?.confidence || 0)}`}
                                  style={{ width: `${proof.aiAnalysis?.confidence || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-sm">{proof.aiAnalysis?.confidence || 0}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {proof.blockchainVerification?.verified ? (
                              <CheckCircle className="w-4 h-4 text-health-success" />
                            ) : (
                              <XCircle className="w-4 h-4 text-health-danger" />
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(proof.status)}>
                              {proofValidationService.getStatusDisplay(proof.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4" />
                              </Button>
                              {(proof.status === 'pending' || proof.status === 'manual_review') && (
                                <>
                                  <Button 
                                    size="sm" 
                                    className="bg-health-success hover:bg-health-success/90 text-white"
                                    onClick={() => handleManualReview(proof._id, 'approved')}
                                    disabled={updating === proof._id}
                                  >
                                    {updating === proof._id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <CheckCircle className="w-4 h-4" />
                                    )}
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleManualReview(proof._id, 'rejected')}
                                    disabled={updating === proof._id}
                                  >
                                    {updating === proof._id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <XCircle className="w-4 h-4" />
                                    )}
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-500">
                        Showing page {pagination.currentPage} of {pagination.totalPages}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.currentPage - 1)}
                          disabled={!pagination.hasPrev}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.currentPage + 1)}
                          disabled={!pagination.hasNext}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* AI Validation Insights */}
      <Card>
        <CardHeader>
          <CardTitle>AI Validation Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-health-teal">Document Authenticity</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Signature Analysis</span>
                  <span className="text-sm font-medium">{aiInsights.documentAuthenticity.signatureAnalysis}%</span>
                </div>
                <div className="w-full bg-health-light-gray rounded-full h-2">
                  <div className="bg-health-success h-2 rounded-full" style={{ width: `${aiInsights.documentAuthenticity.signatureAnalysis}%` }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Watermark Verification</span>
                  <span className="text-sm font-medium">{aiInsights.documentAuthenticity.watermarkVerification}%</span>
                </div>
                <div className="w-full bg-health-light-gray rounded-full h-2">
                  <div className="bg-health-success h-2 rounded-full" style={{ width: `${aiInsights.documentAuthenticity.watermarkVerification}%` }}></div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-health-teal">Content Validation</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Medical Terminology</span>
                  <span className="text-sm font-medium">{aiInsights.contentValidation.medicalTerminology}%</span>
                </div>
                <div className="w-full bg-health-light-gray rounded-full h-2">
                  <div className="bg-health-success h-2 rounded-full" style={{ width: `${aiInsights.contentValidation.medicalTerminology}%` }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Date Consistency</span>
                  <span className="text-sm font-medium">{aiInsights.contentValidation.dateConsistency}%</span>
                </div>
                <div className="w-full bg-health-light-gray rounded-full h-2">
                  <div className="bg-health-success h-2 rounded-full" style={{ width: `${aiInsights.contentValidation.dateConsistency}%` }}></div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-health-teal">Risk Assessment</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Fraud Detection</span>
                  <span className="text-sm font-medium">{aiInsights.riskAssessment.fraudDetection}%</span>
                </div>
                <div className="w-full bg-health-light-gray rounded-full h-2">
                  <div className="bg-health-success h-2 rounded-full" style={{ width: `${aiInsights.riskAssessment.fraudDetection}%` }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Pattern Analysis</span>
                  <span className="text-sm font-medium">{aiInsights.riskAssessment.patternAnalysis}%</span>
                </div>
                <div className="w-full bg-health-light-gray rounded-full h-2">
                  <div className="bg-health-success h-2 rounded-full" style={{ width: `${aiInsights.riskAssessment.patternAnalysis}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsuranceValidateProofs;
