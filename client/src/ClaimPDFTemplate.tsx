import React from 'react';
import { ClaimPDFData } from '@/services/pdfService';

interface ClaimPDFTemplateProps {
  claim: ClaimPDFData;
}

const ClaimPDFTemplate: React.FC<ClaimPDFTemplateProps> = ({ claim }) => {
  return (
    <div className="pdf-template bg-white p-8 max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="header bg-green-600 text-white p-6 mb-8 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">HealthSecure</h1>
            <p className="text-lg opacity-90">Zero-Knowledge Health Insurance Platform</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Generated on</p>
            <p className="font-semibold">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Insurance Claim Report</h2>
        <div className="w-24 h-1 bg-green-600 mx-auto"></div>
      </div>

      {/* Claim Information */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
          Claim Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Claim Number:</span>
              <span className="font-mono text-gray-800">{claim.claimNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                claim.status === 'approved' ? 'bg-green-100 text-green-800' :
                claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                claim.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {claim.status.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Type:</span>
              <span className="text-gray-800">{claim.claimType}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Amount:</span>
              <span className="font-bold text-gray-800">${claim.amount.toLocaleString()}</span>
            </div>
            {claim.approvedAmount && (
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Approved Amount:</span>
                <span className="font-bold text-green-600">${claim.approvedAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Submitted Date:</span>
              <span className="text-gray-800">{new Date(claim.submittedDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      {claim.personalInfo && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
            Personal Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Name:</span>
              <span className="text-gray-800">{claim.personalInfo.firstName} {claim.personalInfo.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Email:</span>
              <span className="text-gray-800">{claim.personalInfo.email}</span>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
          Timeline
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600">Created:</span>
            <span className="text-gray-800">{new Date(claim.createdAt || claim.submittedDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600">Submitted:</span>
            <span className="text-gray-800">{new Date(claim.submittedDate).toLocaleDateString()}</span>
          </div>
          {claim.updatedAt && claim.updatedAt !== claim.createdAt && (
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Last Updated:</span>
              <span className="text-gray-800">{new Date(claim.updatedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Documents */}
      {claim.documents && claim.documents.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
            Documents
          </h3>
          <div className="space-y-3">
            {claim.documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{doc.name}</p>
                    <p className="text-sm text-gray-600">
                      {doc.type} • Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-8 border-t-2 border-gray-200">
        <div className="text-center text-gray-600">
          <p className="font-semibold mb-2">HealthSecure - Zero-Knowledge Health Insurance Platform</p>
          <p className="text-sm">This document was generated automatically. For questions, contact support@healthsecure.com</p>
        </div>
      </div>
    </div>
  );
};

export default ClaimPDFTemplate; 