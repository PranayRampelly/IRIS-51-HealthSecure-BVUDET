import BloodDonor from '../models/BloodDonor.js';
import BloodInventory from '../models/BloodInventory.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import { validateObjectId } from '../utils/validation.js';

// Get all donors for a blood bank
export const getDonors = async (req, res) => {
  try {
    const { bloodBankId } = req.user;
    const {
      page = 1,
      limit = 10,
      bloodType,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      eligibility,
      lastDonationDate
    } = req.query;

    // Build query
    const query = { bloodBankId, isActive: true };

    if (bloodType) query['personalInfo.bloodType'] = bloodType;
    if (status) query.status = status;
    if (eligibility) query['eligibility.isEligible'] = eligibility === 'true';

    // Search functionality
    if (search) {
      query.$or = [
        { donorId: { $regex: search, $options: 'i' } },
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { 'contactInfo.email': { $regex: search, $options: 'i' } },
        { 'contactInfo.phone': { $regex: search, $options: 'i' } }
      ];
    }

    // Last donation date filter
    if (lastDonationDate) {
      const date = new Date(lastDonationDate);
      query['medicalHistory.lastDonationDate'] = { $gte: date };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const donors = await BloodDonor.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await BloodDonor.countDocuments(query);

    res.json({
      success: true,
      data: donors,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching donors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donors',
      error: error.message
    });
  }
};

// Get donor summary
export const getDonorSummary = async (req, res) => {
  try {
    const { bloodBankId } = req.user;

    const summary = await BloodDonor.aggregate([
      { $match: { bloodBankId, isActive: true } },
      {
        $group: {
          _id: {
            bloodType: '$personalInfo.bloodType',
            status: '$status'
          },
          count: { $sum: 1 },
          eligibleCount: {
            $sum: { $cond: [{ $eq: ['$eligibility.isEligible', true] }, 1, 0] }
          }
        }
      },
      {
        $group: {
          _id: '$_id.bloodType',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count',
              eligibleCount: '$eligibleCount'
            }
          }
        }
      }
    ]);

    // Get additional statistics
    const totalDonors = await BloodDonor.countDocuments({ bloodBankId, isActive: true });
    const eligibleDonors = await BloodDonor.countDocuments({ 
      bloodBankId, 
      isActive: true, 
      'eligibility.isEligible': true 
    });
    const activeDonors = await BloodDonor.countDocuments({ 
      bloodBankId, 
      isActive: true, 
      status: 'Active' 
    });

    // Get donors due for donation
    const today = new Date();
    const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
    const dueForDonation = await BloodDonor.countDocuments({
      bloodBankId,
      isActive: true,
      'eligibility.isEligible': true,
      $or: [
        { 'medicalHistory.lastDonationDate': { $lt: threeMonthsAgo } },
        { 'medicalHistory.lastDonationDate': { $exists: false } }
      ]
    });

    res.json({
      success: true,
      data: {
        summary,
        totalDonors,
        eligibleDonors,
        activeDonors,
        dueForDonation
      }
    });
  } catch (error) {
    console.error('Error fetching donor summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donor summary',
      error: error.message
    });
  }
};

// Get single donor
export const getDonor = async (req, res) => {
  try {
    const { id } = req.params;
    const { bloodBankId } = req.user;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donor ID'
      });
    }

    const donor = await BloodDonor.findOne({
      _id: id,
      bloodBankId,
      isActive: true
    });

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    res.json({
      success: true,
      data: donor
    });
  } catch (error) {
    console.error('Error fetching donor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donor',
      error: error.message
    });
  }
};

// Create new donor
export const createDonor = async (req, res) => {
  try {
    const { bloodBankId } = req.user;
    const donorData = {
      ...req.body,
      bloodBankId,
      createdBy: req.user._id
    };

    // Generate donor ID
    donorData.donorId = await BloodDonor.generateDonorId(bloodBankId);

    // Calculate BMI
    if (donorData.personalInfo.weight && donorData.personalInfo.height) {
      const heightInMeters = donorData.personalInfo.height / 100;
      donorData.personalInfo.bmi = (donorData.personalInfo.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }

    // Check eligibility
    const eligibilityCheck = donorData.checkEligibility ? donorData.checkEligibility() : { eligible: true };
    donorData.eligibility.isEligible = eligibilityCheck.eligible;

    const donor = new BloodDonor(donorData);
    await donor.save();

    res.status(201).json({
      success: true,
      message: 'Donor created successfully',
      data: donor
    });
  } catch (error) {
    console.error('Error creating donor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create donor',
      error: error.message
    });
  }
};

// Update donor
export const updateDonor = async (req, res) => {
  try {
    const { id } = req.params;
    const { bloodBankId } = req.user;
    const updateData = req.body;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donor ID'
      });
    }

    const donor = await BloodDonor.findOne({
      _id: id,
      bloodBankId,
      isActive: true
    });

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'bloodBankId' && key !== 'createdBy' && key !== 'donorId') {
        donor[key] = updateData[key];
      }
    });

    donor.updatedBy = req.user._id;

    // Recalculate BMI if weight or height changed
    if (updateData.personalInfo?.weight || updateData.personalInfo?.height) {
      const heightInMeters = donor.personalInfo.height / 100;
      donor.personalInfo.bmi = (donor.personalInfo.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }

    await donor.save();

    res.json({
      success: true,
      message: 'Donor updated successfully',
      data: donor
    });
  } catch (error) {
    console.error('Error updating donor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update donor',
      error: error.message
    });
  }
};

// Delete donor (soft delete)
export const deleteDonor = async (req, res) => {
  try {
    const { id } = req.params;
    const { bloodBankId } = req.user;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donor ID'
      });
    }

    const donor = await BloodDonor.findOne({
      _id: id,
      bloodBankId,
      isActive: true
    });

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    // Check if donor has active inventory
    const activeInventory = await BloodInventory.findOne({
      donorId: id,
      isActive: true,
      status: { $in: ['Available', 'Reserved'] }
    });

    if (activeInventory) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete donor with active blood inventory'
      });
    }

    // Soft delete
    donor.isActive = false;
    donor.updatedBy = req.user._id;
    await donor.save();

    res.json({
      success: true,
      message: 'Donor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting donor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete donor',
      error: error.message
    });
  }
};

// Add donation to donor
export const addDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { bloodBankId } = req.user;
    const donationData = req.body;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donor ID'
      });
    }

    const donor = await BloodDonor.findOne({
      _id: id,
      bloodBankId,
      isActive: true
    });

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    // Check eligibility
    const eligibilityCheck = donor.checkEligibility();
    if (!eligibilityCheck.eligible) {
      return res.status(400).json({
        success: false,
        message: `Donor is not eligible: ${eligibilityCheck.reason}`
      });
    }

    // Add donation
    donor.addDonation(donationData);

    // Update eligibility
    donor.eligibility.nextEligibilityDate = new Date();
    donor.eligibility.nextEligibilityDate.setDate(donor.eligibility.nextEligibilityDate.getDate() + 56); // 56 days for whole blood

    await donor.save();

    res.json({
      success: true,
      message: 'Donation added successfully',
      data: donor.donationHistory[donor.donationHistory.length - 1]
    });
  } catch (error) {
    console.error('Error adding donation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add donation',
      error: error.message
    });
  }
};

// Upload donor document
export const uploadDonorDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { bloodBankId } = req.user;
    const { documentType, title } = req.body;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donor ID'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const donor = await BloodDonor.findOne({
      _id: id,
      bloodBankId,
      isActive: true
    });

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.path, 'bloodbank/donors');

    // Add document to donor
    donor.documents.push({
      type: documentType,
      title,
      fileName: req.file.originalname,
      fileUrl: uploadResult.secure_url,
      uploadDate: new Date(),
      uploadedBy: req.user._id
    });

    await donor.save();

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        fileUrl: uploadResult.secure_url,
        fileName: req.file.originalname
      }
    });
  } catch (error) {
    console.error('Error uploading donor document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
};

// Get eligible donors
export const getEligibleDonors = async (req, res) => {
  try {
    const { bloodBankId } = req.user;
    const { bloodType, limit = 50 } = req.query;

    const donors = await BloodDonor.getEligibleDonors(bloodBankId, bloodType);
    const limitedDonors = donors.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: limitedDonors,
      total: donors.length
    });
  } catch (error) {
    console.error('Error fetching eligible donors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch eligible donors',
      error: error.message
    });
  }
};

// Check donor eligibility
export const checkDonorEligibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { bloodBankId } = req.user;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donor ID'
      });
    }

    const donor = await BloodDonor.findOne({
      _id: id,
      bloodBankId,
      isActive: true
    });

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    const eligibilityCheck = donor.checkEligibility();

    res.json({
      success: true,
      data: {
        isEligible: eligibilityCheck.eligible,
        reason: eligibilityCheck.reason,
        canDonate: donor.canDonate,
        nextEligibleDate: donor.eligibility.nextEligibilityDate,
        deferralEndDate: eligibilityCheck.deferralEndDate
      }
    });
  } catch (error) {
    console.error('Error checking donor eligibility:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check donor eligibility',
      error: error.message
    });
  }
};

// Add deferral to donor
export const addDonorDeferral = async (req, res) => {
  try {
    const { id } = req.params;
    const { bloodBankId } = req.user;
    const { reason, deferralType, deferralEndDate, notes } = req.body;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donor ID'
      });
    }

    const donor = await BloodDonor.findOne({
      _id: id,
      bloodBankId,
      isActive: true
    });

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    if (deferralType === 'Permanent') {
      donor.eligibility.permanentDeferral = {
        isPermanentlyDeferred: true,
        reason,
        deferralDate: new Date(),
        notes
      };
      donor.eligibility.isEligible = false;
    } else {
      donor.eligibility.deferralReasons.push({
        reason,
        deferralDate: new Date(),
        deferralEndDate: new Date(deferralEndDate),
        deferralType,
        notes
      });
    }

    donor.updatedBy = req.user._id;
    await donor.save();

    res.json({
      success: true,
      message: 'Deferral added successfully',
      data: donor.eligibility
    });
  } catch (error) {
    console.error('Error adding donor deferral:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add deferral',
      error: error.message
    });
  }
};

// Remove deferral from donor
export const removeDonorDeferral = async (req, res) => {
  try {
    const { id } = req.params;
    const { bloodBankId } = req.user;
    const { deferralIndex } = req.body;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donor ID'
      });
    }

    const donor = await BloodDonor.findOne({
      _id: id,
      bloodBankId,
      isActive: true
    });

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    if (deferralIndex >= 0 && deferralIndex < donor.eligibility.deferralReasons.length) {
      donor.eligibility.deferralReasons.splice(deferralIndex, 1);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid deferral index'
      });
    }

    // Check if donor is now eligible
    const eligibilityCheck = donor.checkEligibility();
    donor.eligibility.isEligible = eligibilityCheck.eligible;

    donor.updatedBy = req.user._id;
    await donor.save();

    res.json({
      success: true,
      message: 'Deferral removed successfully',
      data: donor.eligibility
    });
  } catch (error) {
    console.error('Error removing donor deferral:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove deferral',
      error: error.message
    });
  }
};

// Get donor donation history
export const getDonorDonationHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { bloodBankId } = req.user;
    const { page = 1, limit = 10 } = req.query;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donor ID'
      });
    }

    const donor = await BloodDonor.findOne({
      _id: id,
      bloodBankId,
      isActive: true
    }).select('donationHistory');

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    // Paginate donation history
    const skip = (page - 1) * limit;
    const donationHistory = donor.donationHistory
      .sort((a, b) => new Date(b.donationDate) - new Date(a.donationDate))
      .slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: donationHistory,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(donor.donationHistory.length / limit),
        totalItems: donor.donationHistory.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching donor donation history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation history',
      error: error.message
    });
  }
};

// Get donor statistics
export const getDonorStatistics = async (req, res) => {
  try {
    const { bloodBankId } = req.user;
    const { startDate, endDate } = req.query;

    const matchStage = { bloodBankId, isActive: true };
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const statistics = await BloodDonor.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            bloodType: '$personalInfo.bloodType',
            status: '$status'
          },
          count: { $sum: 1 },
          eligibleCount: {
            $sum: { $cond: [{ $eq: ['$eligibility.isEligible', true] }, 1, 0] }
          },
          totalDonations: { $sum: '$medicalHistory.totalDonations' },
          avgAge: { $avg: { $subtract: [new Date(), '$personalInfo.dateOfBirth'] } }
        }
      }
    ]);

    // Get additional statistics
    const totalDonors = await BloodDonor.countDocuments({ bloodBankId, isActive: true });
    const newDonorsThisMonth = await BloodDonor.countDocuments({
      bloodBankId,
      isActive: true,
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    res.json({
      success: true,
      data: {
        summary: statistics,
        totalDonors,
        newDonorsThisMonth
      }
    });
  } catch (error) {
    console.error('Error fetching donor statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donor statistics',
      error: error.message
    });
  }
};
