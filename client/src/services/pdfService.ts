import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ClaimPDFData {
  claimNumber: string;
  status: string;
  claimType: string;
  amount: number;
  approvedAmount?: number;
  submittedDate: string;
  personalInfo?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  coverageInfo?: {
    selectedPlan: string;
    coverageAmount: number;
  };
  documents?: Array<{
    name: string;
    type: string;
    uploadedAt: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface PolicyPDFData {
  policyNumber: string;
  policyName: string;
  policyType: string;
  status: string;
  startDate: string;
  endDate: string;
  premium: {
    amount: number;
    frequency: string;
  };
  coverageAmount: number;
  deductible: number;
  coinsurance: number;
  copay: number;
  outOfPocketMax: number;
  usedAmount: number;
  remainingAmount: number;
  insuranceCompany: {
    firstName?: string;
    lastName?: string;
    companyName?: string;
  };
  documents?: Array<{
    name: string;
    type: string;
    uploadedAt: string;
  }>;
  notes?: string;
  autoRenew: boolean;
  createdAt?: string;
  updatedAt?: string;
}

class PDFService {
  private generateHeader(doc: jsPDF, title: string) {
    // Add company logo/header
    doc.setFillColor(16, 185, 129); // HealthSecure green
    doc.rect(0, 0, 210, 30, 'F');
    
    // Company name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('HealthSecure', 20, 20);
    
    // Subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Zero-Knowledge Health Insurance Platform', 20, 28);
    
    // Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, 50);
    
    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 60);
  }

  private generateClaimInfo(doc: jsPDF, claim: ClaimPDFData, yPosition: number) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Claim Information', 20, yPosition);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const info = [
      ['Claim Number:', claim.claimNumber],
      ['Status:', claim.status.toUpperCase()],
      ['Type:', claim.claimType],
      ['Amount:', `$${claim.amount.toLocaleString()}`],
    ];
    
    if (claim.approvedAmount) {
      info.push(['Approved Amount:', `$${claim.approvedAmount.toLocaleString()}`]);
    }
    
    info.push(['Submitted Date:', new Date(claim.submittedDate).toLocaleDateString()]);
    
    let currentY = yPosition + 10;
    info.forEach(([label, value]) => {
      doc.text(label, 20, currentY);
      doc.text(value, 80, currentY);
      currentY += 6;
    });
    
    return currentY + 10;
  }

  private generatePersonalInfo(doc: jsPDF, claim: ClaimPDFData, yPosition: number) {
    if (!claim.personalInfo) return yPosition;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Personal Information', 20, yPosition);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const info = [
      ['Name:', `${claim.personalInfo.firstName} ${claim.personalInfo.lastName}`],
      ['Email:', claim.personalInfo.email],
    ];
    
    let currentY = yPosition + 10;
    info.forEach(([label, value]) => {
      doc.text(label, 20, currentY);
      doc.text(value, 80, currentY);
      currentY += 6;
    });
    
    return currentY + 10;
  }

  private generateTimeline(doc: jsPDF, claim: ClaimPDFData, yPosition: number) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Timeline', 20, yPosition);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const timeline = [
      ['Created:', new Date(claim.createdAt || claim.submittedDate).toLocaleDateString()],
      ['Submitted:', new Date(claim.submittedDate).toLocaleDateString()],
    ];
    
    if (claim.updatedAt && claim.updatedAt !== claim.createdAt) {
      timeline.push(['Last Updated:', new Date(claim.updatedAt).toLocaleDateString()]);
    }
    
    let currentY = yPosition + 10;
    timeline.forEach(([label, value]) => {
      doc.text(label, 20, currentY);
      doc.text(value, 80, currentY);
      currentY += 6;
    });
    
    return currentY + 10;
  }

  private generateDocuments(doc: jsPDF, claim: ClaimPDFData, yPosition: number) {
    if (!claim.documents || claim.documents.length === 0) return yPosition;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Documents', 20, yPosition);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    let currentY = yPosition + 10;
    claim.documents.forEach((document, index) => {
      const docInfo = [
        `${index + 1}. ${document.name}`,
        `Type: ${document.type} | Uploaded: ${new Date(document.uploadedAt).toLocaleDateString()}`
      ];
      
      docInfo.forEach(line => {
        doc.text(line, 20, currentY);
        currentY += 5;
      });
      currentY += 3;
    });
    
    return currentY + 10;
  }

  private generatePolicyInfo(doc: jsPDF, policy: PolicyPDFData, yPosition: number) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Policy Information', 20, yPosition);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const info = [
      ['Policy Number:', policy.policyNumber],
      ['Policy Name:', policy.policyName],
      ['Type:', policy.policyType],
      ['Status:', policy.status.toUpperCase()],
      ['Premium:', `$${policy.premium.amount}/${policy.premium.frequency}`],
    ];
    
    let currentY = yPosition + 10;
    info.forEach(([label, value]) => {
      doc.text(label, 20, currentY);
      doc.text(value, 80, currentY);
      currentY += 6;
    });
    
    return currentY + 10;
  }

  private generatePolicyCoverage(doc: jsPDF, policy: PolicyPDFData, yPosition: number) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Coverage Details', 20, yPosition);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const coverage = [
      ['Total Coverage:', `$${policy.coverageAmount.toLocaleString()}`],
      ['Used Amount:', `$${policy.usedAmount.toLocaleString()}`],
      ['Remaining Amount:', `$${policy.remainingAmount.toLocaleString()}`],
      ['Deductible:', `$${policy.deductible.toLocaleString()}`],
      ['Coinsurance:', `${policy.coinsurance}%`],
      ['Copay:', `$${policy.copay}`],
      ['Out-of-Pocket Max:', `$${policy.outOfPocketMax.toLocaleString()}`],
    ];
    
    let currentY = yPosition + 10;
    coverage.forEach(([label, value]) => {
      doc.text(label, 20, currentY);
      doc.text(value, 80, currentY);
      currentY += 6;
    });
    
    return currentY + 10;
  }

  private generatePolicyTimeline(doc: jsPDF, policy: PolicyPDFData, yPosition: number) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Policy Timeline', 20, yPosition);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const timeline = [
      ['Start Date:', new Date(policy.startDate).toLocaleDateString()],
      ['End Date:', new Date(policy.endDate).toLocaleDateString()],
    ];
    
    if (policy.createdAt) {
      timeline.push(['Created:', new Date(policy.createdAt).toLocaleDateString()]);
    }
    
    if (policy.updatedAt && policy.updatedAt !== policy.createdAt) {
      timeline.push(['Last Updated:', new Date(policy.updatedAt).toLocaleDateString()]);
    }
    
    let currentY = yPosition + 10;
    timeline.forEach(([label, value]) => {
      doc.text(label, 20, currentY);
      doc.text(value, 80, currentY);
      currentY += 6;
    });
    
    return currentY + 10;
  }

  private generatePolicyDocuments(doc: jsPDF, policy: PolicyPDFData, yPosition: number) {
    if (!policy.documents || policy.documents.length === 0) return yPosition;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Policy Documents', 20, yPosition);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    let currentY = yPosition + 10;
    policy.documents.forEach((document, index) => {
      const docInfo = [
        `${index + 1}. ${document.name}`,
        `Type: ${document.type} | Uploaded: ${new Date(document.uploadedAt).toLocaleDateString()}`
      ];
      
      docInfo.forEach(line => {
        doc.text(line, 20, currentY);
        currentY += 5;
      });
      currentY += 3;
    });
    
    return currentY + 10;
  }

  private generateFooter(doc: jsPDF) {
    const pageHeight = doc.internal.pageSize.height;
    
    doc.setFillColor(240, 240, 240);
    doc.rect(0, pageHeight - 30, 210, 30, 'F');
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    doc.text('HealthSecure - Zero-Knowledge Health Insurance Platform', 20, pageHeight - 20);
    doc.text('This document was generated automatically. For questions, contact support@healthsecure.com', 20, pageHeight - 15);
    doc.text(`Page ${doc.getCurrentPageInfo().pageNumber}`, 180, pageHeight - 15);
  }

  async generateClaimPDF(claim: ClaimPDFData): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // Generate header
        this.generateHeader(doc, 'Insurance Claim Report');
        
        // Generate content sections
        let currentY = 80;
        currentY = this.generateClaimInfo(doc, claim, currentY);
        currentY = this.generatePersonalInfo(doc, claim, currentY);
        currentY = this.generateTimeline(doc, claim, currentY);
        currentY = this.generateDocuments(doc, claim, currentY);
        
        // Generate footer
        this.generateFooter(doc);
        
        // Convert to blob
        const pdfBlob = doc.output('blob');
        resolve(pdfBlob);
      } catch (error) {
        reject(error);
      }
    });
  }

  async generatePolicyPDF(policy: PolicyPDFData): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // Generate header
        this.generateHeader(doc, 'Insurance Policy Report');
        
        // Generate content sections
        let currentY = 80;
        currentY = this.generatePolicyInfo(doc, policy, currentY);
        currentY = this.generatePolicyCoverage(doc, policy, currentY);
        currentY = this.generatePolicyTimeline(doc, policy, currentY);
        currentY = this.generatePolicyDocuments(doc, policy, currentY);
        
        // Generate footer
        this.generateFooter(doc);
        
        // Convert to blob
        const pdfBlob = doc.output('blob');
        resolve(pdfBlob);
      } catch (error) {
        reject(error);
      }
    });
  }

  async generateClaimPDFFromHTML(element: HTMLElement, filename: string): Promise<Blob> {
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      return pdf.output('blob');
    } catch (error) {
      throw new Error('Failed to generate PDF from HTML');
    }
  }

  downloadPDF(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export default new PDFService(); 