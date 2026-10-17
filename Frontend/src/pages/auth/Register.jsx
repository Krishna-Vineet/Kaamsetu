import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Phone, Lock, Briefcase, Users, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth';
import { authApi } from '../../api/auth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { logo } from '@/assets/assets';

export function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('client');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { clearError, setUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      role: 'client'
    }
  });

  const password = watch('password');

  // Clear error when component mounts or when form is submitted
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setValue('role', role);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    try {
      const role = data.role ?? selectedRole;
      const registrationData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role,
        password: data.password
      };

      const response = await authApi.register(registrationData);
      
      if (response.success && response.requiresVerification) {
        // Navigate to OTP verification page with email
        navigate('/otp', { 
          state: { 
            email: data.email,
            role: role,
            message: response.message 
          } 
        });
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    {/* Animated Particles */}
      <div className="absolute inset-0 min-h-screen">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#445FA2]/30 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '0s' }}></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-[#009889]/30 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#445FA2]/25 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
      </div>
    <div className="min-h-screen w-full relative overflow-hidden">
      

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md md:max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block group">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <img 
                  src={logo} 
                  alt="KaamSetu Logo" 
                  className="h-10 w-auto"
                />
                <h1 className="text-3xl sm:text-4xl font-bold text-[#445FA2] group-hover:text-[#009889] transition-colors duration-200">
                  KaamSetu
                </h1>
              </div>
            </Link>
            <p className="text-gray-600 text-sm sm:text-base mt-2">Create your account</p>
          </div>

          <Card className="shadow-md border-0 bg-white/95 backdrop-blur-xl rounded-xl overflow-hidden">
            <CardHeader className="pb-6 border-b">
              <CardTitle className="text-2xl text-center text-gray-900 font-bold">Sign Up</CardTitle>
              <CardDescription className="text-center text-gray-600 mt-2">
                Create your account to get started
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 sm:px-10 py-8">
              {/* Error Display */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-700">
                    {error}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      autoComplete="name"
                      className={`pl-10 h-12 rounded-lg border-gray-300 bg-white/90 text-gray-900 placeholder-gray-500 focus:border-[#445FA2] focus:ring-[#445FA2] transition-all duration-200 backdrop-blur-sm ${errors.name ? 'border-red-500' : ''}`}
                      {...register('name', { required: 'Full name is required' })}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      autoComplete="email"
                      className={`pl-10 h-12 rounded-lg border-gray-300 bg-white/90 text-gray-900 placeholder-gray-500 focus:border-[#445FA2] focus:ring-[#445FA2] transition-all duration-200 backdrop-blur-sm ${errors.email ? 'border-red-500' : ''}`}
                      {...register('email', { required: 'Email is required' })}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      autoComplete="tel"
                      className={`pl-10 h-12 rounded-lg border-gray-300 bg-white/90 text-gray-900 placeholder-gray-500 focus:border-[#445FA2] focus:ring-[#445FA2] transition-all duration-200 backdrop-blur-sm ${errors.phone ? 'border-red-500' : ''}`}
                      {...register('phone', { required: 'Phone number is required' })}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone.message}</p>
                  )}
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">I want to</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleRoleSelect('client')}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                        selectedRole === 'client'
                          ? 'border-[#445FA2] bg-[#445FA2]/10 text-[#445FA2]'
                          : 'border-gray-200 bg-white/80 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Users className="h-6 w-6" />
                      <span className="font-medium">Hire Workers</span>
                      <span className="text-xs text-center">I need help with tasks</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleRoleSelect('worker')}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                        selectedRole === 'worker'
                          ? 'border-[#009889] bg-[#009889]/10 text-[#009889]'
                          : 'border-gray-200 bg-white/80 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Briefcase className="h-6 w-6" />
                      <span className="font-medium">Find Work</span>
                      <span className="text-xs text-center">I can help with tasks</span>
                    </button>
                  </div>
                  {errors.role && (
                    <p className="text-sm text-red-500">{errors.role.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="new-password"
                      className={`pl-10 pr-10 h-12 rounded-lg border-gray-300 bg-white/90 text-gray-900 placeholder-gray-500 focus:border-[#445FA2] focus:ring-[#445FA2] transition-all duration-200 backdrop-blur-sm ${errors.password ? 'border-red-500' : ''}`}
                      {...register('password', { required: 'Password is required' })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                  
                  {/* Password strength indicator */}
                  {password && (
                    <div className="space-y-1">
                      <div className="flex space-x-1">
                        <div className={`h-1 w-1/4 rounded ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-200'}`} />
                        <div className={`h-1 w-1/4 rounded ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-200'}`} />
                        <div className={`h-1 w-1/4 rounded ${/[a-z]/.test(password) ? 'bg-green-500' : 'bg-gray-200'}`} />
                        <div className={`h-1 w-1/4 rounded ${/\d/.test(password) ? 'bg-green-500' : 'bg-gray-200'}`} />
                      </div>
                      <p className="text-xs text-gray-600">
                        Password must contain at least 8 characters, uppercase, lowercase, and number
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className={`pl-10 pr-10 h-12 rounded-lg border-gray-300 bg-white/90 text-gray-900 placeholder-gray-500 focus:border-[#445FA2] focus:ring-[#445FA2] transition-all duration-200 backdrop-blur-sm ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      {...register('confirmPassword', { 
                        required: 'Please confirm your password',
                        validate: (value) => value === watch('password') || 'Passwords do not match'
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-[#445FA2] to-[#009889] hover:from-[#445FA2]/90 hover:to-[#009889]/90 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>

              {/* Sign In Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link to="/login" className="text-[#445FA2] hover:text-[#009889] hover:underline font-medium transition-colors duration-200">
                    Sign In
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
}