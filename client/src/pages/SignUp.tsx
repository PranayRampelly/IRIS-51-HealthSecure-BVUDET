import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock, User, Stethoscope, Briefcase, Microscope, Settings, Eye, EyeOff, Building, Pill, Brain } from 'lucide-react';
import apiService from '@/services/api';

const signUpSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number and special character'),
  confirmPassword: z.string(),
  role: z.enum(['patient', 'doctor', 'hospital', 'bloodbank', 'insurance', 'researcher', 'admin', 'pharmacy', 'bioaura']),
  organization: z.string().optional(),
  licenseNumber: z.string().optional(),
  hospitalType: z.string().optional(),
  hospitalAddress: z.string().optional(),
  hospitalPhone: z.string().optional(),
  bloodBankType: z.string().optional(),
  bloodBankAddress: z.string().optional(),
  bloodBankPhone: z.string().optional(),
  emergencyContact: z.string().optional(),
  agreeToTerms: z.boolean(),
  agreeToPrivacy: z.boolean(),
  setup2FA: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => data.agreeToTerms === true, {
  message: "You must agree to the terms and conditions",
  path: ["agreeToTerms"],
}).refine((data) => data.agreeToPrivacy === true, {
  message: "You must agree to the privacy policy",
  path: ["agreeToPrivacy"],
});

type SignUpForm = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [setup2FA, setSetup2FA] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      agreeToTerms: false,
      agreeToPrivacy: false,
      setup2FA: false
    }
  });

  const watchedRole = watch('role');

  const onSubmit = async (data: SignUpForm) => {
    setIsLoading(true);
    
    try {
      // Prepare user data for API
      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role,
        // Add role-specific fields
        ...(data.role === 'doctor' && {
          licenseNumber: data.licenseNumber,
          specialization: data.organization || 'General Medicine',
          hospital: data.organization || 'General Hospital',
          experience: 0
        }),
        ...(data.role === 'hospital' && {
          hospitalName: data.organization || '',
          hospitalType: data.hospitalType || 'General Hospital',
          licenseNumber: data.licenseNumber || '',
          address: data.hospitalAddress || '',
          phone: data.hospitalPhone || '',
          emergencyContact: data.emergencyContact || ''
        }),
        ...(data.role === 'bloodbank' && {
          bloodBankName: data.organization || '',
          bloodBankType: data.bloodBankType || 'Standalone Blood Bank',
          bloodBankLicense: data.licenseNumber || '',
          address: data.bloodBankAddress || '',
          phone: data.bloodBankPhone || '',
          emergencyContact: data.emergencyContact || ''
        }),
        ...(data.role === 'patient' && {
          dateOfBirth: new Date().toISOString().split('T')[0], // You might want to add a date picker
          bloodType: 'A+', // You might want to add a blood type selector
          phone: '' // You might want to add a phone field
        }),
        ...(data.role === 'pharmacy' && {
          pharmacyName: data.organization || '',
          pharmacyLicense: data.licenseNumber || '',
          pharmacyType: 'Retail Pharmacy'
        }),
        ...(data.role === 'bioaura' && {
          organization: data.organization || '',
          licenseNumber: data.licenseNumber || '',
        }),
        ...(data.role === 'insurance' && {
          insurance: { provider: data.organization || '' }
        })
      };

      // Call the API
      const response = await apiService.register(userData);
      
      console.log('Sign up successful:', response);
      
      // Store the token
      apiService.setToken(response.token);
      
      // Store credentials for auto-login after verification
      sessionStorage.setItem('signupEmail', data.email);
      sessionStorage.setItem('signupPassword', data.password);
      
      // Navigate to email verification
      navigate('/email-verification', { 
        state: { 
          email: data.email,
          setup2FA: data.setup2FA || false,
          role: data.role
        } 
      });
    } catch (error) {
      console.error('Sign up error:', error);
      alert(error.message || 'Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const roleIcons = {
    patient: User,
    doctor: Stethoscope,
    hospital: Building,
    bloodbank: Building,
    pharmacy: Pill,
    insurance: Briefcase,
    researcher: Microscope,
    admin: Settings,
  bioaura: Brain,
  };

  const roleDescriptions = {
    patient: 'Access your health records and manage data sharing',
    doctor: 'Request patient data proofs and upload prescriptions',
    hospital: 'Manage hospital operations and patient care',
    bloodbank: 'Manage blood inventory and donor operations',
    pharmacy: 'Manage pharmacy orders, inventory and prescriptions',
    insurance: 'Validate claims and manage policy verification',
    researcher: 'Access anonymized data for medical research',
  admin: 'Manage users and oversee system operations',
  bioaura: 'Monitor predictive health intelligence and supply readiness'
  };

  return (
    <div className="min-h-screen bg-health-light-gray flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Lock className="h-8 w-8 text-health-teal" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-health-aqua rounded-full animate-pulse-glow"></div>
            </div>
          </div>
          <CardTitle className="text-3xl font-montserrat font-bold text-health-teal">
            Create Your Account
          </CardTitle>
          <p className="text-health-charcoal mt-2">
            Join the secure healthcare data platform
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  className="mt-1"
                  placeholder="Enter your first name"
                />
                {errors.firstName && (
                  <p className="text-sm text-health-danger mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  className="mt-1"
                  placeholder="Enter your last name"
                />
                {errors.lastName && (
                  <p className="text-sm text-health-danger mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className="mt-1"
                placeholder="Enter your email address"
              />
              {errors.email && (
                <p className="text-sm text-health-danger mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className="mt-1 pr-10"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-health-blue-gray hover:text-health-teal"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-health-danger mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    className="mt-1 pr-10"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-health-blue-gray hover:text-health-teal"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-health-danger mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <Label>Account Type</Label>
              <Select onValueChange={(value) => setValue('role', value as any)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleIcons).map(([role, Icon]) => (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center space-x-3">
                        <Icon className="h-4 w-4" />
                        <div>
                          <span className="capitalize font-medium">{role}</span>
                          <p className="text-xs text-health-charcoal/70">
                            {roleDescriptions[role as keyof typeof roleDescriptions]}
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-health-danger mt-1">{errors.role.message}</p>
              )}
            </div>

            {/* Role-specific fields */}
            {(watchedRole === 'doctor' || watchedRole === 'hospital' || watchedRole === 'bloodbank' || watchedRole === 'insurance' || watchedRole === 'researcher' || watchedRole === 'pharmacy' || watchedRole === 'bioaura') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                    <Label htmlFor="organization">
                      {watchedRole === 'doctor' ? 'Hospital/Clinic' : 
                       watchedRole === 'hospital' ? 'Hospital Name' :
                       watchedRole === 'bloodbank' ? 'Blood Bank Name' :
                       watchedRole === 'pharmacy' ? 'Pharmacy Name' :
                       watchedRole === 'insurance' ? 'Insurance Company' :
                       watchedRole === 'bioaura' ? 'BioAura Hub Name' : 'Research Institution'}
                    </Label>
                    <Input
                      id="organization"
                      {...register('organization')}
                      className="mt-1"
                      placeholder={`Enter your ${watchedRole === 'doctor' ? 'hospital or clinic' : 
                                                watchedRole === 'hospital' ? 'hospital name' :
                                                watchedRole === 'bloodbank' ? 'blood bank name' :
                                                watchedRole === 'pharmacy' ? 'pharmacy name' :
                                                watchedRole === 'insurance' ? 'insurance company' :
                                                watchedRole === 'bioaura' ? 'BioAura hub name' : 'research institution'}`}
                    />
                  </div>

                  {(watchedRole === 'doctor' || watchedRole === 'hospital' || watchedRole === 'bloodbank' || watchedRole === 'pharmacy' || watchedRole === 'bioaura') && (
                  <div>
                    <Label htmlFor="licenseNumber">
                      {watchedRole === 'doctor' ? 'Medical License Number' : 
                       watchedRole === 'hospital' ? 'Hospital License Number' :
                       watchedRole === 'pharmacy' ? 'Pharmacy License Number' :
                       watchedRole === 'bioaura' ? 'BioAura Operations License' : 'Blood Bank License Number'}
                    </Label>
                    <Input
                      id="licenseNumber"
                      {...register('licenseNumber')}
                      className="mt-1"
                      placeholder={`Enter your ${watchedRole === 'doctor' ? 'medical' : 
                                                watchedRole === 'hospital' ? 'hospital' :
                                                watchedRole === 'pharmacy' ? 'pharmacy' :
                                                watchedRole === 'bioaura' ? 'BioAura operations' : 'blood bank'} license number`}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Additional Hospital-specific fields */}
            {watchedRole === 'hospital' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hospitalType">Hospital Type</Label>
                    <Select onValueChange={(value) => setValue('hospitalType', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select hospital type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General Hospital">General Hospital</SelectItem>
                        <SelectItem value="Specialty Hospital">Specialty Hospital</SelectItem>
                        <SelectItem value="Teaching Hospital">Teaching Hospital</SelectItem>
                        <SelectItem value="Research Hospital">Research Hospital</SelectItem>
                        <SelectItem value="Private Hospital">Private Hospital</SelectItem>
                        <SelectItem value="Public Hospital">Public Hospital</SelectItem>
                        <SelectItem value="Emergency Hospital">Emergency Hospital</SelectItem>
                        <SelectItem value="Rehabilitation Hospital">Rehabilitation Hospital</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="hospitalAddress">Hospital Address</Label>
                  <Input
                    id="hospitalAddress"
                    {...register('hospitalAddress')}
                    className="mt-1"
                    placeholder="Enter complete hospital address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hospitalPhone">Hospital Phone</Label>
                    <Input
                      id="hospitalPhone"
                      {...register('hospitalPhone')}
                      className="mt-1"
                      placeholder="Enter hospital phone number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      {...register('emergencyContact')}
                      className="mt-1"
                      placeholder="Enter emergency contact number"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Additional Blood Bank-specific fields */}
            {watchedRole === 'bloodbank' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bloodBankType">Blood Bank Type</Label>
                    <Select onValueChange={(value) => setValue('bloodBankType', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select blood bank type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hospital Blood Bank">Hospital Blood Bank</SelectItem>
                        <SelectItem value="Standalone Blood Bank">Standalone Blood Bank</SelectItem>
                        <SelectItem value="Mobile Blood Bank">Mobile Blood Bank</SelectItem>
                        <SelectItem value="Regional Blood Center">Regional Blood Center</SelectItem>
                        <SelectItem value="National Blood Center">National Blood Center</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bloodBankAddress">Blood Bank Address</Label>
                  <Input
                    id="bloodBankAddress"
                    {...register('bloodBankAddress')}
                    className="mt-1"
                    placeholder="Enter complete blood bank address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bloodBankPhone">Blood Bank Phone</Label>
                    <Input
                      id="bloodBankPhone"
                      {...register('bloodBankPhone')}
                      className="mt-1"
                      placeholder="Enter blood bank phone number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      {...register('emergencyContact')}
                      className="mt-1"
                      placeholder="Enter emergency contact number"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Two-Factor Authentication */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="setup2FA"
                checked={setup2FA}
                onCheckedChange={(checked) => {
                  const isChecked = checked === true;
                  setSetup2FA(isChecked);
                  setValue('setup2FA', isChecked);
                }}
              />
              <Label htmlFor="setup2FA" className="text-sm">
                Set up two-factor authentication (recommended for enhanced security)
              </Label>
            </div>

            {/* Terms and Privacy */}
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  onCheckedChange={(checked) => setValue('agreeToTerms', checked === true)}
                />
                <Label htmlFor="agreeToTerms" className="text-sm leading-5">
                  I agree to the{' '}
                  <Link to="/terms" className="text-health-aqua hover:underline">
                    Terms and Conditions
                  </Link>
                </Label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-health-danger">{errors.agreeToTerms.message}</p>
              )}

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeToPrivacy"
                  onCheckedChange={(checked) => setValue('agreeToPrivacy', checked === true)}
                />
                <Label htmlFor="agreeToPrivacy" className="text-sm leading-5">
                  I agree to the{' '}
                  <Link to="/privacy" className="text-health-aqua hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              {errors.agreeToPrivacy && (
                <p className="text-sm text-health-danger">{errors.agreeToPrivacy.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-health-teal hover:bg-health-teal/90 text-white"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;
