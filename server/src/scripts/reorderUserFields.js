import mongoose from 'mongoose';
import User from '../models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/proof-health-nexus';

async function reorderUserFields() {
  await mongoose.connect(MONGODB_URI);
  const users = await User.find();
  let updatedCount = 0;
  for (const user of users) {
    const u = user.toObject();
    // Rebuild the user object with patientId after _id and before email
    const reordered = {
      _id: u._id,
      patientId: u.patientId,
      email: u.email,
      password: u.password,
      role: u.role,
      firstName: u.firstName,
      lastName: u.lastName,
      dateOfBirth: u.dateOfBirth,
      phone: u.phone,
      address: u.address,
      bloodType: u.bloodType,
      gender: u.gender,
      maritalStatus: u.maritalStatus,
      preferences: u.preferences,
      profileComplete: u.profileComplete,
      profileImage: u.profileImage,
      isEmailVerified: u.isEmailVerified,
      emailVerificationToken: u.emailVerificationToken,
      emailVerificationExpires: u.emailVerificationExpires,
      isActive: u.isActive,
      lastLogin: u.lastLogin,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      twoFactorEnabled: u.twoFactorEnabled,
      twoFactorSecret: u.twoFactorSecret,
      backupCodes: u.backupCodes,
      isFullyActivated: u.isFullyActivated,
      mfaEnabled: u.mfaEnabled,
      mfaSecret: u.mfaSecret,
      emergencyContacts: u.emergencyContacts,
      height: u.height,
      weight: u.weight,
      allergies: u.allergies,
      currentMedications: u.currentMedications,
      medicalConditions: u.medicalConditions,
      surgeries: u.surgeries,
      insurance: u.insurance,
      profileComplete: u.profileComplete,
      // Add any other fields as needed
      __v: u.__v
    };
    const result = await User.replaceOne({ _id: user._id }, reordered);
    if (result.modifiedCount === 1) {
      updatedCount++;
      console.log(`Replaced user: ${u.email} (_id: ${u._id})`);
    } else {
      console.warn(`User not replaced: ${u.email} (_id: ${u._id})`);
    }
  }
  console.log(`User documents reordered! Total updated: ${updatedCount}`);
  await mongoose.disconnect();
}

reorderUserFields().catch(err => {
  console.error(err);
  process.exit(1);
}); 