import apiService from './api';

// Types
export interface ProofValidation {
  _id: string;
  proofId: string;
  claimId: string;
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  providerId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  documentType: 'medical_certificate' | 'treatment_record' | 'lab_results' | 'prescription' | 'billing_statement' | 'other';
  documentUrl: string;
  originalFileName?: string;
  fileSize?: number;
  mimeType?: string;
  status: 'pending' | 'ai_processing' | 'ai_completed' | 'manual_review' | 'verified' | 'flagged' | 'rejected';
  riskScore: 'low' | 'medium' | 'high' | 'critical';
  aiAnalysis?: {
    documentAuthenticity: {
      signatureAnalysis: number;
      watermarkVerification: number;
      metadataValidation: number;
      overallAuthenticity: number;
    };
    contentValidation: {
      medicalTerminology: number;
      dateConsistency: number;
      providerVerification: number;
      overallContent: number;
    };
    riskAssessment: {
      fraudDetection: number;
      patternAnalysis: number;
      anomalyDetection: number;
      overallRisk: number;
    };
    confidence: number;
    analysisDate: Date;
    modelVersion: string;
  };
  blockchainVerification?: {
    verified: boolean;
    transactionHash?: string;
    blockNumber?: number;
    verificationDate?: Date;
    network: string;
    smartContractAddress?: string;
  };
  manualReviews: Array<{
    reviewedBy: {
      _id: string;
      firstName: string;
      lastName: string;
    };
    reviewDate: Date;
    decision: 'approved' | 'rejected' | 'flagged' | 'pending';
    notes?: string;
    riskFactors: string[];
    recommendations: string[];
  }>;
  submittedDate: Date;
  aiProcessedDate?: Date;
  verifiedDate?: Date;
  rejectedDate?: Date;
  insuranceProvider: string;
  validatedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  tags: string[];
  notes?: string;
  overallScore?: number;
  validationAge?: number;
}

export interface ProofValidationResponse {
  proofs: ProofValidation[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProofs: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  statistics: {
    pending: number;
    verified: number;
    flagged: number;
    rejected: number;
    totalValue: number;
  };
  aiInsights: {
    documentAuthenticity: {
      signatureAnalysis: number;
      watermarkVerification: number;
    };
    contentValidation: {
      medicalTerminology: number;
      dateConsistency: number;
    };
    riskAssessment: {
      fraudDetection: number;
      patternAnalysis: number;
    };
    totalProofs: number;
  };
}

export interface ManualReviewData {
  decision: 'approved' | 'rejected' | 'flagged';
  notes?: string;
  riskFactors?: string[];
  recommendations?: string[];
}

export interface BatchValidationData {
  proofIds: string[];
  action: 'approve' | 'reject' | 'flag';
}

export interface ValidationStats {
  stats: {
    pending: { count: number; avgConfidence: number; avgRisk: number };
    verified: { count: number; avgConfidence: number; avgRisk: number };
    flagged: { count: number; avgConfidence: number; avgRisk: number };
    rejected: { count: number; avgConfidence: number; avgRisk: number };
  };
  aiInsights: {
    documentAuthenticity: {
      signatureAnalysis: number;
      watermarkVerification: number;
    };
    contentValidation: {
      medicalTerminology: number;
      dateConsistency: number;
    };
    riskAssessment: {
      fraudDetection: number;
      patternAnalysis: number;
    };
    totalProofs: number;
  };
  modelMetrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    modelVersion: string;
    lastUpdated: Date;
  };
}

export interface BlockchainStatus {
  network: string;
  status: 'online' | 'offline';
  lastBlock?: number;
  gasPrice?: number;
  confirmationTime?: number;
  lastUpdated: Date;
  error?: string;
}

interface ValidationResponse {
  success: boolean;
  message: string;
  data: unknown;
}

class ProofValidationService {
  async getProofs(filters = {}) {
    try {
      const response = await apiService.get('/proof-validation/proofs', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching proofs:', error);
      // Return empty data on error
      return {
        proofs: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalProofs: 0,
          hasNext: false,
          hasPrev: false
        },
        statistics: {
          pending: 0,
          verified: 0,
          flagged: 0,
          rejected: 0,
          totalValue: 0
        },
        aiInsights: {
          documentAuthenticity: {
            signatureAnalysis: 0,
            watermarkVerification: 0
          },
          contentValidation: {
            medicalTerminology: 0,
            dateConsistency: 0
          },
          riskAssessment: {
            fraudDetection: 0,
            patternAnalysis: 0
          },
          totalProofs: 0
        }
      };
    }
  }

  async validateProof(proofId: string) {
    try {
      const response = await apiService.post(`/proof-validation/proofs/${proofId}/validate`);
      return response.data;
    } catch (error) {
      console.error('Error validating proof:', error);
      throw error;
    }
  }

  async manualReview(proofId: string, reviewData: ManualReviewData) {
    try {
      const response = await apiService.post(`/proof-validation/proofs/${proofId}/review`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error in manual review:', error);
      throw error;
    }
  }

  async batchValidate(batchData: BatchValidationData) {
    try {
      const response = await apiService.post('/proof-validation/batch', batchData);
      return response.data;
    } catch (error) {
      console.error('Error in batch validation:', error);
      throw error;
    }
  }

  async exportProofs(options: { format: string; status?: string }) {
    try {
      const response = await apiService.get('/proof-validation/export', {
        params: options,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting proofs:', error);
      throw error;
    }
  }

  async getValidationStats() {
    try {
      const response = await apiService.get('/proof-validation/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching validation stats:', error);
      throw error;
    }
  }

  async getBlockchainStatus() {
    try {
      const response = await apiService.get('/proof-validation/blockchain-status');
      return response.data;
    } catch (error) {
      console.error('Error fetching blockchain status:', error);
      throw error;
    }
  }

  // Helper functions
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getDocumentTypeDisplay(type: ProofValidation['documentType']): string {
    const types = {
      'medical_certificate': 'Medical Certificate',
      'treatment_record': 'Treatment Record',
      'lab_results': 'Lab Results',
      'prescription': 'Prescription',
      'billing_statement': 'Billing Statement',
      'other': 'Other'
    };
    return types[type] || type;
  }

  getStatusColor(status: ProofValidation['status']): string {
    switch (status) {
      case 'verified':
        return 'bg-health-success text-white';
      case 'rejected':
        return 'bg-health-danger text-white';
      case 'flagged':
        return 'bg-health-warning text-white';
      case 'pending':
        return 'bg-health-blue-gray text-white';
      case 'ai_processing':
        return 'bg-health-aqua text-white';
      case 'ai_completed':
        return 'bg-health-teal text-white';
      case 'manual_review':
        return 'bg-health-warning text-white';
      default:
        return 'bg-health-blue-gray text-white';
    }
  }

  getRiskColor(risk: ProofValidation['riskScore']): string {
    switch (risk) {
      case 'low':
        return 'bg-health-success text-white';
      case 'medium':
        return 'bg-health-warning text-white';
      case 'high':
        return 'bg-health-danger text-white';
      case 'critical':
        return 'bg-red-800 text-white';
      default:
        return 'bg-health-blue-gray text-white';
    }
  }

  getStatusDisplay(status: ProofValidation['status']): string {
    const statuses = {
      'pending': 'Pending',
      'ai_processing': 'AI Processing',
      'ai_completed': 'AI Completed',
      'manual_review': 'Manual Review',
      'verified': 'Verified',
      'flagged': 'Flagged',
      'rejected': 'Rejected'
    };
    return statuses[status] || status;
  }

  formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  getValidationAge(submittedDate: Date): number {
    const now = new Date();
    const submitted = new Date(submittedDate);
    return Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24));
  }

  getConfidenceColor(confidence: number): string {
    if (confidence >= 80) return 'text-health-success';
    if (confidence >= 60) return 'text-health-warning';
    return 'text-health-danger';
  }

  getBlockchainIcon(verified: boolean): { icon: string; color: string } {
    return verified
      ? { icon: '🔗', color: 'text-health-success' }
      : { icon: '⛓️', color: 'text-health-danger' };
  }

  getRecommendations(analysis: ProofValidation['aiAnalysis']): string[] {
    if (!analysis) return [];

    const recommendations = [];
    if (analysis.documentAuthenticity.overallAuthenticity < 70) {
      recommendations.push('Document authenticity requires manual verification');
    }
    if (analysis.contentValidation.overallContent < 70) {
      recommendations.push('Content validation suggests manual review');
    }
    if (analysis.riskAssessment.overallRisk > 70) {
      recommendations.push('High risk detected - requires immediate attention');
    }

    return recommendations;
  }

  getRiskFactors(analysis: ProofValidation['aiAnalysis']): string[] {
    if (!analysis) return [];

    const factors = [];
    if (analysis.documentAuthenticity.signatureAnalysis < 50) {
      factors.push('Signature analysis failed');
    }
    if (analysis.documentAuthenticity.watermarkVerification < 50) {
      factors.push('Watermark verification failed');
    }
    if (analysis.contentValidation.medicalTerminology < 50) {
      factors.push('Medical terminology validation failed');
    }
    if (analysis.riskAssessment.fraudDetection > 80) {
      factors.push('High fraud risk detected');
    }

    return factors;
  }
}

export default new ProofValidationService(); 