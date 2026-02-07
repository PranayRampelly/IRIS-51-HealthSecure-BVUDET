import ProofValidation from '../models/ProofValidation.js';
import AIValidationService from '../services/aiValidationService.js';
import BlockchainService from '../services/blockchainService.js';
import User from '../models/User.js';
import { logAccess } from '../utils/logger.js';

class ProofValidationController {
  // Get all proofs with filtering and pagination
  async getProofs(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        search,
        documentType,
        riskScore,
        sortBy = 'submittedDate',
        sortOrder = 'desc'
      } = req.query;

      const insuranceProvider = req.user.insuranceProvider;
      
      // Build query
      const query = { insuranceProvider };
      
      if (status && status !== 'all') {
        query.status = status;
      }
      
      if (documentType && documentType !== 'all') {
        query.documentType = documentType;
      }
      
      if (riskScore && riskScore !== 'all') {
        query.riskScore = riskScore;
      }
      
      if (search) {
        query.$or = [
          { proofId: { $regex: search, $options: 'i' } },
          { claimId: { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const [proofs, total] = await Promise.all([
        ProofValidation.find(query)
          .populate('patientId', 'firstName lastName email')
          .populate('providerId', 'firstName lastName email')
          .populate('validatedBy', 'firstName lastName email')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        ProofValidation.countDocuments(query)
      ]);

      // Get statistics
      const stats = await ProofValidation.getValidationStats(insuranceProvider);
      const aiInsights = await ProofValidation.getAIInsights(insuranceProvider);

      const totalPages = Math.ceil(total / parseInt(limit));
      
      res.json({
        success: true,
        data: {
          proofs,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalProofs: total,
            hasNext: parseInt(page) < totalPages,
            hasPrev: parseInt(page) > 1
          },
          statistics: {
            pending: stats.pending.count,
            verified: stats.verified.count,
            flagged: stats.flagged.count,
            rejected: stats.rejected.count,
            totalValue: proofs.reduce((sum, proof) => sum + (proof.overallScore || 0), 0)
          },
          aiInsights
        }
      });

      // Create audit log
      await logAccess(
        req.user._id,
        'VIEW_PROOFS',
        'ProofValidation',
        null,
        null,
        req,
        `Viewed proof validation queue (${proofs.length} proofs)`
      );
    } catch (error) {
      console.error('Error fetching proofs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch proofs',
        error: error.message
      });
    }
  }

  // Get single proof by ID
  async getProofById(req, res) {
    try {
      const { id } = req.params;
      const insuranceProvider = req.user.insuranceProvider;

      const proof = await ProofValidation.findOne({
        _id: id,
        insuranceProvider
      })
      .populate('patientId', 'firstName lastName email')
      .populate('providerId', 'firstName lastName email')
      .populate('validatedBy', 'firstName lastName email')
      .populate('manualReviews.reviewedBy', 'firstName lastName email');

      if (!proof) {
        return res.status(404).json({
          success: false,
          message: 'Proof not found'
        });
      }

      res.json({
        success: true,
        data: proof
      });

      // Create audit log
      await logAccess(
        req.user._id,
        'VIEW_PROOF',
        'ProofValidation',
        proof._id,
        null,
        req,
        `Viewed proof details: ${proof.proofId}`
      );
    } catch (error) {
      console.error('Error fetching proof:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch proof',
        error: error.message
      });
    }
  }

  // Start AI validation process
  async startAIValidation(req, res) {
    try {
      const { id } = req.params;
      const insuranceProvider = req.user.insuranceProvider;

      const proof = await ProofValidation.findOne({
        _id: id,
        insuranceProvider
      });

      if (!proof) {
        return res.status(404).json({
          success: false,
          message: 'Proof not found'
        });
      }

      if (proof.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Proof is not in pending status'
        });
      }

      // Update status to processing
      proof.status = 'ai_processing';
      await proof.save();

      // Start AI validation in background
      this.performAIValidation(proof._id, proof.documentUrl, proof.documentType);

      res.json({
        success: true,
        message: 'AI validation started',
        data: {
          proofId: proof.proofId,
          status: proof.status
        }
      });

      // Create audit log
      await logAccess(
        req.user._id,
        'START_AI_VALIDATION',
        'ProofValidation',
        proof._id,
        null,
        req,
        `Started AI validation for proof: ${proof.proofId}`
      );
    } catch (error) {
      console.error('Error starting AI validation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start AI validation',
        error: error.message
      });
    }
  }

  // Perform AI validation (background process)
  async performAIValidation(proofId, documentUrl, documentType) {
    try {
      console.log(`Starting AI validation for proof ${proofId}`);
      
      // Perform AI analysis
      const aiAnalysis = await AIValidationService.validateDocument(documentUrl, documentType);
      
      // Perform blockchain verification
      const documentHash = BlockchainService.generateDocumentHash(documentUrl, {
        proofId,
        documentType,
        timestamp: new Date()
      });
      
      const blockchainVerification = await BlockchainService.verifyOnBlockchain(documentHash);
      
      // Update proof with results
      const proof = await ProofValidation.findById(proofId);
      if (proof) {
        proof.aiAnalysis = aiAnalysis;
        proof.blockchainVerification = blockchainVerification;
        proof.aiProcessedDate = new Date();
        
        // Determine final status based on AI confidence
        if (aiAnalysis.confidence >= 90) {
          proof.status = 'verified';
          proof.verifiedDate = new Date();
          proof.validatedBy = proof.createdBy; // Auto-validated by AI
        } else if (aiAnalysis.confidence >= 70) {
          proof.status = 'manual_review';
        } else {
          proof.status = 'flagged';
        }
        
        await proof.save();
        
        console.log(`AI validation completed for proof ${proofId}. Status: ${proof.status}`);
      }
    } catch (error) {
      console.error(`AI validation failed for proof ${proofId}:`, error);
      
      // Update proof with error status
      const proof = await ProofValidation.findById(proofId);
      if (proof) {
        proof.status = 'flagged';
        proof.notes = `AI validation failed: ${error.message}`;
        await proof.save();
      }
    }
  }

  // Manual review decision
  async manualReview(req, res) {
    try {
      const { id } = req.params;
      const { decision, notes, riskFactors, recommendations } = req.body;
      const insuranceProvider = req.user.insuranceProvider;

      const proof = await ProofValidation.findOne({
        _id: id,
        insuranceProvider
      });

      if (!proof) {
        return res.status(404).json({
          success: false,
          message: 'Proof not found'
        });
      }

      if (!['approved', 'rejected', 'flagged'].includes(decision)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid decision'
        });
      }

      // Add manual review
      const manualReview = {
        reviewedBy: req.user._id,
        reviewDate: new Date(),
        decision,
        notes,
        riskFactors: riskFactors || [],
        recommendations: recommendations || []
      };

      proof.manualReviews.push(manualReview);
      proof.status = decision === 'approved' ? 'verified' : decision;
      
      if (decision === 'approved') {
        proof.verifiedDate = new Date();
        proof.validatedBy = req.user._id;
      } else if (decision === 'rejected') {
        proof.rejectedDate = new Date();
      }

      await proof.save();

      // Create audit log
      await logAccess(
        req.user._id,
        'MANUAL_REVIEW',
        'ProofValidation',
        proof._id,
        null,
        req,
        `Proof ${decision}: ${proof.proofId}`
      );

      res.json({
        success: true,
        message: `Proof ${decision}`,
        data: {
          proofId: proof.proofId,
          status: proof.status,
          review: manualReview
        }
      });
    } catch (error) {
      console.error('Error in manual review:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process manual review',
        error: error.message
      });
    }
  }

  // Batch validation
  async batchValidate(req, res) {
    try {
      const { proofIds, action } = req.body;
      const insuranceProvider = req.user.insuranceProvider;

      if (!['approve', 'reject', 'flag'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
      }

      const proofs = await ProofValidation.find({
        _id: { $in: proofIds },
        insuranceProvider,
        status: { $in: ['pending', 'manual_review'] }
      });

      if (proofs.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No valid proofs found for batch processing'
        });
      }

      const results = [];
      for (const proof of proofs) {
        try {
          const decision = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'flagged';
          
          const manualReview = {
            reviewedBy: req.user._id,
            reviewDate: new Date(),
            decision,
            notes: `Batch ${action} by ${req.user.firstName} ${req.user.lastName}`,
            riskFactors: [],
            recommendations: []
          };

          proof.manualReviews.push(manualReview);
          proof.status = decision === 'approved' ? 'verified' : decision;
          
          if (decision === 'approved') {
            proof.verifiedDate = new Date();
            proof.validatedBy = req.user._id;
          } else if (decision === 'rejected') {
            proof.rejectedDate = new Date();
          }

          await proof.save();
          results.push({
            proofId: proof.proofId,
            success: true,
            status: proof.status
          });
        } catch (error) {
          results.push({
            proofId: proof.proofId,
            success: false,
            error: error.message
          });
        }
      }

      // Create audit log
      await logAccess(
        req.user._id,
        'BATCH_VALIDATION',
        'ProofValidation',
        null,
        null,
        req,
        `Batch ${action}: ${proofs.length} proofs processed`
      );

      res.json({
        success: true,
        message: `Batch ${action} completed`,
        data: {
          totalProcessed: proofs.length,
          results
        }
      });
    } catch (error) {
      console.error('Error in batch validation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process batch validation',
        error: error.message
      });
    }
  }

  // Export proofs
  async exportProofs(req, res) {
    try {
      const { format = 'csv', status, startDate, endDate } = req.query;
      const insuranceProvider = req.user.insuranceProvider;

      // Build query
      const query = { insuranceProvider };
      
      if (status && status !== 'all') {
        query.status = status;
      }
      
      if (startDate && endDate) {
        query.submittedDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const proofs = await ProofValidation.find(query)
        .populate('patientId', 'firstName lastName email')
        .populate('providerId', 'firstName lastName email')
        .populate('validatedBy', 'firstName lastName email')
        .sort({ submittedDate: -1 })
        .lean();

      if (format === 'csv') {
        const csvData = this.convertToCSV(proofs);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=proofs-${Date.now()}.csv`);
        res.send(csvData);
        
        // Create audit log
        await logAccess(
          req.user._id,
          'EXPORT_PROOFS',
          'ProofValidation',
          null,
          null,
          req,
          `Exported ${proofs.length} proofs in CSV format`
        );
      } else if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=proofs-${Date.now()}.json`);
        res.json({
          success: true,
          data: proofs,
          exportDate: new Date(),
          totalRecords: proofs.length
        });
        
        // Create audit log
        await logAccess(
          req.user._id,
          'EXPORT_PROOFS',
          'ProofValidation',
          null,
          null,
          req,
          `Exported ${proofs.length} proofs in JSON format`
        );
      } else {
        res.status(400).json({
          success: false,
          message: 'Unsupported export format'
        });
      }
    } catch (error) {
      console.error('Error exporting proofs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export proofs',
        error: error.message
      });
    }
  }

  // Get validation statistics
  async getValidationStats(req, res) {
    try {
      const insuranceProvider = req.user.insuranceProvider;
      
      const [stats, aiInsights, modelMetrics] = await Promise.all([
        ProofValidation.getValidationStats(insuranceProvider),
        ProofValidation.getAIInsights(insuranceProvider),
        AIValidationService.getModelMetrics()
      ]);

      res.json({
        success: true,
        data: {
          stats,
          aiInsights,
          modelMetrics
        }
      });

      // Create audit log
      await logAccess(
        req.user._id,
        'VIEW_STATS',
        'ProofValidation',
        null,
        null,
        req,
        'Viewed proof validation statistics'
      );
    } catch (error) {
      console.error('Error fetching validation stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch validation statistics',
        error: error.message
      });
    }
  }

  // Get blockchain status
  async getBlockchainStatus(req, res) {
    try {
      const { network = 'ethereum' } = req.query;
      
      const status = await BlockchainService.getBlockchainStatus(network);
      
      res.json({
        success: true,
        data: status
      });

      // Create audit log
      await logAccess(
        req.user._id,
        'VIEW_BLOCKCHAIN_STATUS',
        'ProofValidation',
        null,
        null,
        req,
        `Viewed blockchain status for ${network} network`
      );
    } catch (error) {
      console.error('Error fetching blockchain status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch blockchain status',
        error: error.message
      });
    }
  }

  // Utility method to convert data to CSV
  convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = [
      'Proof ID',
      'Claim ID',
      'Patient',
      'Provider',
      'Document Type',
      'Status',
      'Risk Score',
      'AI Confidence',
      'Blockchain Verified',
      'Submitted Date',
      'Validated Date',
      'Validated By'
    ];
    
    const rows = data.map(proof => [
      proof.proofId,
      proof.claimId,
      proof.patientId ? `${proof.patientId.firstName} ${proof.patientId.lastName}` : 'N/A',
      proof.providerId ? `${proof.providerId.firstName} ${proof.providerId.lastName}` : 'N/A',
      proof.documentType,
      proof.status,
      proof.riskScore,
      proof.aiAnalysis?.confidence || 'N/A',
      proof.blockchainVerification?.verified ? 'Yes' : 'No',
      proof.submittedDate,
      proof.verifiedDate || 'N/A',
      proof.validatedBy ? `${proof.validatedBy.firstName} ${proof.validatedBy.lastName}` : 'N/A'
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }
}

export default new ProofValidationController(); 