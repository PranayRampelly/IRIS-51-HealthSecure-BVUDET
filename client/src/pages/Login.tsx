
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, User, Stethoscope, Briefcase, Microscope, Settings, Building, Pill, Brain } from 'lucide-react';
import Logo from '@/components/ui/logo';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import apiService from '@/services/api';
import TwoFactorLogin from '@/components/auth/TwoFactorLogin';
import { useAuth } from '@/contexts/AuthContext';

const roles = [
  { value: 'patient', label: 'Patient', description: 'Access your medical records', icon: User },
  { value: 'doctor', label: 'Doctor', description: 'Manage patient care', icon: Stethoscope },
  { value: 'hospital', label: 'Hospital', description: 'Manage hospital operations', icon: Building },
  { value: 'bloodbank', label: 'Blood Bank', description: 'Manage blood inventory & donations', icon: Building },
  { value: 'pharmacy', label: 'Pharmacy', description: 'Manage orders, inventory & prescriptions', icon: Pill },
  { value: 'insurance', label: 'Insurance', description: 'Process claims & policies', icon: Briefcase },
  { value: 'researcher', label: 'Researcher', description: 'Analyze health data', icon: Microscope },
  { value: 'bioaura', label: 'BioAura Ops', description: 'Run predictive health intelligence', icon: Brain },
  { value: 'admin', label: 'Admin', description: 'System administration', icon: Settings },
];

export default function Login() {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const result = await apiService.login({ ...data, rememberMe });

      // Check if 2FA is required
      if (result.mfaRequired) {
        setUserId(result.userId);
        setShow2FA(true);
        return;
      }

      // Check if we have the expected response structure
      if (!result.user || !result.user.role) {
        console.error('Unexpected login response:', result);
        setServerError('Invalid response from server. Please try again.');
        return;
      }

      // Store user data in AuthContext (token is already stored by API service)
      if (result.user && result.token) {
        login({
          ...result.user,
          token: result.token
        });
      }

      // Navigate to dashboard - profile completion will be handled by dialog
      navigate(`/${result.user.role}/dashboard`);
    } catch (err) {
      console.error('Login error:', err);

      // Provide user-friendly error messages
      let errorMessage = 'An error occurred during login. Please try again.';

      if (err.message) {
        if (err.message.includes('Invalid credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (err.message.includes('Account is deactivated')) {
          errorMessage = 'Your account has been deactivated. Please contact support.';
        } else if (err.message.includes('Connection refused') || err.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to server. Please check your internet connection.';
        } else if (err.message.includes('Token')) {
          errorMessage = 'Authentication error. Please try logging in again.';
        } else {
          errorMessage = err.message;
        }
      }

      setServerError(errorMessage);
    }
  };

  // Ensure token is saved after 2FA verification as well
  const handleBackToLogin = () => {
    setShow2FA(false);
    setUserId('');
    setServerError('');
    // If token is present in sessionStorage (from 2FA), move it to localStorage
    const token = sessionStorage.getItem('token');
    if (token) {
      localStorage.setItem('token', token);
      sessionStorage.removeItem('token');
    }
  };

  // Show 2FA component if 2FA is required
  if (show2FA) {
    return <TwoFactorLogin userId={userId} onBack={handleBackToLogin} />;
  }

  return (
    <div className="min-h-screen bg-health-light-gray flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h2 className="text-2xl font-montserrat font-bold text-center text-health-teal mb-2">Welcome Back</h2>
          {serverError && <div className="text-red-600 text-center mb-2">{serverError}</div>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block mb-1 font-medium">Select Your Role</label>
              <Select onValueChange={value => setValue('role', value, { shouldValidate: true })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center space-x-3">
                        {React.createElement(role.icon, { className: 'h-4 w-4' })}
                        <div>
                          <span className="capitalize font-medium">{role.label}</span>
                          <p className="text-xs text-health-charcoal/70">{role.description}</p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" {...register('role', { required: 'Role is required' })} />
              {errors.role && <span className="text-red-600 text-sm">{errors.role.message?.toString()}</span>}
            </div>
            <div>
              <label className="block mb-1 font-medium">Email Address</label>
              <input type="email" {...register('email', { required: 'Email is required' })} className="w-full border rounded px-3 py-2" placeholder="Enter your email" />
              {errors.email && <span className="text-red-600 text-sm">{errors.email.message?.toString()}</span>}
            </div>
            <div>
              <label className="block mb-1 font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  className="w-full border rounded px-3 py-2 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-health-blue-gray hover:text-health-teal"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <span className="text-red-600 text-sm">{errors.password.message?.toString()}</span>}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border border-gray-300"
                />
                <label htmlFor="rememberMe" className="text-sm">Remember me</label>
              </div>
              <Link to="#" className="text-sm text-health-teal hover:underline">Forgot Password?</Link>
            </div>
            <button type="submit" className="w-full bg-health-teal text-white py-2 rounded font-semibold hover:bg-health-teal/90 transition">Login as {roles.find(r => r.value === watch('role'))?.label || 'User'}</button>
            {Object.keys(errors).length > 0 && <div className="text-red-600 text-center">Form has errors</div>}
          </form>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-health-blue-gray/30" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-health-charcoal/60">Or login with</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center border border-health-blue-gray/30 rounded-lg py-2 px-4 bg-white hover:bg-health-light-gray transition font-medium text-health-charcoal text-base shadow-sm"
                onClick={() => alert('Google login coming soon!')}
              >
                <span className="mr-2">
                  <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_17_40)">
                      <path d="M47.532 24.552c0-1.636-.146-3.2-.418-4.704H24.48v9.02h13.02c-.56 3.02-2.24 5.58-4.76 7.3v6.06h7.7c4.5-4.14 7.092-10.24 7.092-17.676z" fill="#4285F4" />
                      <path d="M24.48 48c6.48 0 11.92-2.14 15.88-5.82l-7.7-6.06c-2.14 1.44-4.88 2.3-8.18 2.3-6.28 0-11.6-4.24-13.5-9.96H2.66v6.24C6.6 43.82 14.8 48 24.48 48z" fill="#34A853" />
                      <path d="M10.98 28.46c-.5-1.44-.8-2.98-.8-4.56 0-1.58.3-3.12.8-4.56v-6.24H2.66A23.97 23.97 0 000 24c0 3.98.96 7.76 2.66 11.08l8.32-6.62z" fill="#FBBC05" />
                      <path d="M24.48 9.52c3.54 0 6.68 1.22 9.16 3.62l6.84-6.84C36.4 2.14 30.96 0 24.48 0 14.8 0 6.6 4.18 2.66 10.7l8.32 6.24c1.9-5.72 7.22-9.96 13.5-9.96z" fill="#EA4335" />
                    </g>
                    <defs>
                      <clipPath id="clip0_17_40">
                        <rect width="48" height="48" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </span>
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center border border-health-blue-gray/30 rounded-lg py-2 px-4 bg-white hover:bg-health-light-gray transition font-medium text-health-charcoal text-base shadow-sm"
                onClick={() => alert('Microsoft login coming soon!')}
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" className="w-5 h-5 mr-2" />
                Microsoft
              </button>
            </div>
          </div>
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-health-charcoal">
              Don't have an account?{' '}
              <Link to="/signup" className="text-health-teal hover:underline font-semibold">
                Sign Up
              </Link>
            </p>
            <Link
              to="/"
              className="text-sm text-health-charcoal hover:text-health-teal font-medium flex items-center justify-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
