import mongoose from 'mongoose';
import VaultFile from './src/models/VaultFile.js';
import VaultShare from './src/models/VaultShare.js';
import VaultAudit from './src/models/VaultAudit.js';
import User from './src/models/User.js';

async function testVaultFileManagement() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthsecure');
    console.log('Connected to MongoDB');

    console.log('🗄️ Testing Vault & File Management System...\n');

    // Test 1: Create vault file
    console.log('1. Creating vault file...');
    const newVaultFile = new VaultFile({
      fileId: 'FILE-' + Date.now(),
      ownerId: new mongoose.Types.ObjectId(),
      fileName: 'medical_report_2024.pdf',
      originalName: 'medical_report_2024.pdf',
      fileType: 'application/pdf',
      category: 'medical',
      subcategory: 'reports',
      size: 2048576, // 2MB
      cloudinaryUrl: 'https://res.cloudinary.com/healthsecure/image/upload/v1234567890/medical_report_2024.pdf',
      cloudinaryPublicId: 'healthsecure/medical_report_2024',
      metadata: {
        patientId: 'PAT-123456',
        doctorId: 'DOC-789012',
        reportType: 'blood_test',
        testDate: new Date('2024-01-15'),
        labName: 'City Lab Services'
      },
      tags: ['blood_test', 'medical_report', 'lab_results'],
      isEncrypted: true,
      encryptionKey: 'encrypted_key_here',
      accessLevel: 'private',
      isActive: true
    });

    await newVaultFile.save();
    console.log('✅ Vault file created successfully');
    console.log('   - File ID:', newVaultFile._id);
    console.log('   - File Name:', newVaultFile.fileName);
    console.log('   - Category:', newVaultFile.category);
    console.log('   - Size:', newVaultFile.size, 'bytes');

    // Test 2: Create vault share
    console.log('\n2. Creating vault share...');
    const newVaultShare = new VaultShare({
      shareId: 'SHARE-' + Date.now(),
      fileId: newVaultFile._id,
      ownerId: new mongoose.Types.ObjectId(),
      sharedWith: new mongoose.Types.ObjectId(),
      shareType: 'view',
      permissions: {
        view: true,
        download: true,
        edit: false,
        share: false
      },
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      accessCode: 'ABC123',
      isActive: true
    });

    await newVaultShare.save();
    console.log('✅ Vault share created successfully');
    console.log('   - Share ID:', newVaultShare._id);
    console.log('   - Share Type:', newVaultShare.shareType);
    console.log('   - Permissions:', Object.keys(newVaultShare.permissions).filter(k => newVaultShare.permissions[k]));

    // Test 3: Create vault audit log
    console.log('\n3. Creating vault audit log...');
    const newVaultAudit = new VaultAudit({
      fileId: newVaultFile._id,
      userId: new mongoose.Types.ObjectId(),
      action: 'file_uploaded',
      timestamp: new Date(),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: {
        fileName: newVaultFile.fileName,
        fileSize: newVaultFile.size,
        category: newVaultFile.category
      }
    });

    await newVaultAudit.save();
    console.log('✅ Vault audit log created successfully');
    console.log('   - Audit ID:', newVaultAudit._id);
    console.log('   - Action:', newVaultAudit.action);
    console.log('   - Timestamp:', newVaultAudit.timestamp);

    // Test 4: Create multiple file types
    console.log('\n4. Creating multiple file types...');
    const fileTypes = [
      {
        fileName: 'prescription.pdf',
        category: 'medical',
        subcategory: 'prescriptions',
        fileType: 'application/pdf',
        size: 512000
      },
      {
        fileName: 'xray_chest.jpg',
        category: 'medical',
        subcategory: 'imaging',
        fileType: 'image/jpeg',
        size: 1048576
      },
      {
        fileName: 'insurance_policy.pdf',
        category: 'insurance',
        subcategory: 'policies',
        fileType: 'application/pdf',
        size: 1536000
      }
    ];

    const createdFiles = [];
    for (const fileData of fileTypes) {
      const file = new VaultFile({
        fileId: 'FILE-' + Date.now() + Math.random(),
        ownerId: new mongoose.Types.ObjectId(),
        fileName: fileData.fileName,
        originalName: fileData.fileName,
        fileType: fileData.fileType,
        category: fileData.category,
        subcategory: fileData.subcategory,
        size: fileData.size,
        cloudinaryUrl: `https://res.cloudinary.com/healthsecure/image/upload/v1234567890/${fileData.fileName}`,
        cloudinaryPublicId: `healthsecure/${fileData.fileName}`,
        accessLevel: 'private',
        isActive: true
      });
      await file.save();
      createdFiles.push(file);
      console.log(`✅ Created ${fileData.fileName} (${fileData.category}/${fileData.subcategory})`);
    }

    // Test 5: Test file queries
    console.log('\n5. Testing file queries...');
    const medicalFiles = await VaultFile.find({ category: 'medical' });
    console.log(`✅ Found ${medicalFiles.length} medical files`);

    const largeFiles = await VaultFile.find({ size: { $gt: 1000000 } }); // > 1MB
    console.log(`✅ Found ${largeFiles.length} files larger than 1MB`);

    const pdfFiles = await VaultFile.find({ fileType: 'application/pdf' });
    console.log(`✅ Found ${pdfFiles.length} PDF files`);

    // Test 6: Test file sharing queries
    console.log('\n6. Testing file sharing queries...');
    const activeShares = await VaultShare.find({ isActive: true });
    console.log(`✅ Found ${activeShares.length} active shares`);

    const expiredShares = await VaultShare.find({
      expiryDate: { $lt: new Date() }
    });
    console.log(`✅ Found ${expiredShares.length} expired shares`);

    // Test 7: Test audit log queries
    console.log('\n7. Testing audit log queries...');
    const recentAudits = await VaultAudit.find({
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });
    console.log(`✅ Found ${recentAudits.length} audit logs in last 24 hours`);

    const uploadAudits = await VaultAudit.find({ action: 'file_uploaded' });
    console.log(`✅ Found ${uploadAudits.length} file upload audit logs`);

    // Test 8: Test file statistics
    console.log('\n8. Testing file statistics...');
    const fileStats = await VaultFile.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalSize: { $sum: '$size' },
          avgSize: { $avg: '$size' }
        }
      }
    ]);
    console.log('✅ File statistics by category:', fileStats);

    // Test 9: Test file type statistics
    console.log('\n9. Testing file type statistics...');
    const fileTypeStats = await VaultFile.aggregate([
      {
        $group: {
          _id: '$fileType',
          count: { $sum: 1 },
          totalSize: { $sum: '$size' }
        }
      }
    ]);
    console.log('✅ File type statistics:', fileTypeStats);

    // Test 10: Test access control
    console.log('\n10. Testing access control...');
    const privateFiles = await VaultFile.find({ accessLevel: 'private' });
    console.log(`✅ Found ${privateFiles.length} private files`);

    const sharedFiles = await VaultFile.find({ accessLevel: 'shared' });
    console.log(`✅ Found ${sharedFiles.length} shared files`);

    // Test 11: Test file search functionality
    console.log('\n11. Testing file search functionality...');
    const searchResults = await VaultFile.find({
      $or: [
        { fileName: { $regex: 'medical', $options: 'i' } },
        { 'metadata.labName': { $regex: 'lab', $options: 'i' } },
        { tags: { $in: ['blood_test'] } }
      ]
    });
    console.log(`✅ Found ${searchResults.length} files matching search criteria`);

    // Test 12: Test file sharing permissions
    console.log('\n12. Testing file sharing permissions...');
    const viewOnlyShares = await VaultShare.find({
      'permissions.view': true,
      'permissions.download': false,
      'permissions.edit': false
    });
    console.log(`✅ Found ${viewOnlyShares.length} view-only shares`);

    const fullAccessShares = await VaultShare.find({
      'permissions.view': true,
      'permissions.download': true,
      'permissions.edit': true
    });
    console.log(`✅ Found ${fullAccessShares.length} full access shares`);

    // Test 13: Test file encryption status
    console.log('\n13. Testing file encryption status...');
    const encryptedFiles = await VaultFile.find({ isEncrypted: true });
    console.log(`✅ Found ${encryptedFiles.length} encrypted files`);

    const unencryptedFiles = await VaultFile.find({ isEncrypted: false });
    console.log(`✅ Found ${unencryptedFiles.length} unencrypted files`);

    // Test 14: Test file metadata queries
    console.log('\n14. Testing file metadata queries...');
    const labReports = await VaultFile.find({
      'metadata.reportType': 'blood_test'
    });
    console.log(`✅ Found ${labReports.length} blood test reports`);

    const recentFiles = await VaultFile.find({
      'metadata.testDate': { $gte: new Date('2024-01-01') }
    });
    console.log(`✅ Found ${recentFiles.length} files from 2024`);

    // Test 15: Test file size analysis
    console.log('\n15. Testing file size analysis...');
    const sizeRanges = [
      { min: 0, max: 100000, label: 'Small (< 100KB)' },
      { min: 100000, max: 1000000, label: 'Medium (100KB - 1MB)' },
      { min: 1000000, max: 10000000, label: 'Large (1MB - 10MB)' },
      { min: 10000000, max: Infinity, label: 'Very Large (> 10MB)' }
    ];

    for (const range of sizeRanges) {
      const count = await VaultFile.countDocuments({
        size: { $gte: range.min, $lt: range.max }
      });
      console.log(`✅ ${range.label}: ${count} files`);
    }

    // Test 16: Test audit trail
    console.log('\n16. Testing audit trail...');
    const fileAuditTrail = await VaultAudit.find({
      fileId: newVaultFile._id
    }).sort({ timestamp: -1 });
    
    console.log(`✅ Found ${fileAuditTrail.length} audit entries for file`);

    // Test 17: Test share expiry management
    console.log('\n17. Testing share expiry management...');
    const sharesExpiringSoon = await VaultShare.find({
      expiryDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
      },
      isActive: true
    });
    console.log(`✅ Found ${sharesExpiringSoon.length} shares expiring in next 7 days`);

    // Cleanup
    console.log('\n18. Cleaning up test data...');
    await VaultFile.findByIdAndDelete(newVaultFile._id);
    await VaultShare.findByIdAndDelete(newVaultShare._id);
    await VaultAudit.findByIdAndDelete(newVaultAudit._id);
    
    for (const file of createdFiles) {
      await VaultFile.findByIdAndDelete(file._id);
    }
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testVaultFileManagement();
