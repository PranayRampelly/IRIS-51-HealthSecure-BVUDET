import React from 'react';
import { Route } from 'react-router-dom';
import InsuranceDashboard from '@/pages/insurance/InsuranceDashboard';
import InsuranceClaims from '@/pages/insurance/InsuranceClaims';
import InsurancePolicies from '@/pages/insurance/InsurancePolicies';
import CreatePolicy from '@/pages/insurance/CreatePolicy';
import CreateClaim from '@/pages/insurance/CreateClaim';
import InsuranceValidateProofs from '@/pages/insurance/InsuranceValidateProofs';
import InsuranceReports from '@/pages/insurance/InsuranceReports';
import InsuranceSettings from '@/pages/insurance/InsuranceSettings';

export const insuranceRoutes = [
  <Route key="insurance-dashboard" path="/insurance/dashboard" element={<InsuranceDashboard />} />,
  <Route key="insurance-claims" path="/insurance/claims" element={<InsuranceClaims />} />,
  <Route key="create-claim" path="/insurance/claims/new" element={<CreateClaim />} />,
  <Route key="insurance-policies" path="/insurance/policies" element={<InsurancePolicies />} />,
  <Route key="create-policy" path="/insurance/policies/create" element={<CreatePolicy />} />,
  <Route key="insurance-validate-proofs" path="/insurance/validate-proofs" element={<InsuranceValidateProofs />} />,
  <Route key="insurance-reports" path="/insurance/reports" element={<InsuranceReports />} />,
  <Route key="insurance-settings" path="/insurance/settings" element={<InsuranceSettings />} />
]; 