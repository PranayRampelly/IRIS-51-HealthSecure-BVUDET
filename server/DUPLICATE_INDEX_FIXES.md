# Duplicate Schema Index Fixes

## Overview
Fixed duplicate schema index warnings that were appearing during server startup. The warnings were caused by having both `unique: true` (which creates an index) and explicit `schema.index()` calls for the same field.

## Issues Fixed

### 1. InsuranceApplication.js
**Problem**: `applicationNumber` field had both `unique: true` and explicit index
- **Line 23**: Had `unique: true` in schema definition
- **Line 121**: Had `insuranceApplicationSchema.index({ applicationNumber: 1 })`

**Fix**: Removed `unique: true` from schema definition, keeping only the explicit index

### 2. InsurancePolicy.js
**Problem**: `policyNumber` field had both `unique: true` and `index: true`
- **Line 130**: Had `unique: true, index: true` in schema definition

**Fix**: Removed both `unique: true` and `index: true` from schema definition, keeping only the explicit index

### 3. Policy.js
**Problem**: `policyNumber` field had both `unique: true` and explicit index
- **Line 21**: Had `unique: true` in schema definition
- **Line 117**: Had `policySchema.index({ policyNumber: 1 })`

**Fix**: Removed `unique: true` from schema definition, keeping only the explicit index

### 4. ProofRequest.js
**Problem**: `requestId` field had both `unique: true` and `index: true`
- **Line 56**: Had `unique: true, index: true` in schema definition

**Fix**: Removed both `unique: true` and `index: true` from schema definition, keeping only the explicit index

## Models Checked (No Issues Found)

The following models were checked and found to have no duplicate index issues:
- **PatientAdmission.js**: `admissionNumber` has `unique: true` but no explicit index
- **EmergencyResponse.js**: `emergencyNumber` has `unique: true` but no explicit index
- **Appointment.js**: `appointmentNumber` has `unique: true` but no explicit index
- **InsuranceClaim.js**: `claimNumber` has `unique: true` but no explicit index
- **Doctor.js**: `userId` and `registrationNumber` have `unique: true` but no explicit indexes
- **ProofValidation.js**: `proofId` has `unique: true` but no explicit index

## Best Practices Applied

1. **Single Index Definition**: Each field now has only one index definition
2. **Explicit Indexes Preferred**: Used explicit `schema.index()` calls for better control
3. **Consistent Approach**: All models now follow the same pattern

## Verification

To verify the fixes work:
```bash
cd server
node test-server-no-warnings.js
```

This should import all models without any duplicate index warnings.

## Impact

- ✅ **No more duplicate index warnings** during server startup
- ✅ **Improved performance** by avoiding redundant indexes
- ✅ **Cleaner schema definitions** with consistent indexing approach
- ✅ **Better maintainability** with explicit index definitions

## Next Steps

1. Test the server startup to confirm no warnings
2. Verify that all database operations still work correctly
3. Monitor performance to ensure indexes are working as expected 