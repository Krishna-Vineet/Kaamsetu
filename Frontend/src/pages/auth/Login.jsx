import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth';
import { authApi } from '../../api/auth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';
import { logo } from '@/assets/assets';

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [infoMessage, setInfoMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: { email: '', password: '' }
  });

  // Clear error when component mounts or when form is submitted
  useEffect(() => {
    if (location.state?.message) {
      setInfoMessage(location.state.message);
      // Clear the state from history so the message doesn't reappear
      window.history.replaceState({}, document.title)
    }
  }, [location.state]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    if (infoMessage) setInfoMessage('');
    
    try {
      const response = await authApi.login({
        data: data.email,
        password: data.password,
        rememberMe
      });

      if (response.success) {
        // Set user in store - tokens are now managed by the server via cookies
        login(response.user);
        
        // If blocked, redirect to blocked page
        if (response?.user?.blocked) {
          navigate('/blocked', { replace: true });
          return;
        }

        // Show success message
        toast.success('Login successful! Redirecting...', {
          position: 'top-center',
          duration: 2000
        });
        
        // Navigate based on role or from location
        let destination = '/client/hire';
        if (response.role === 'worker') {
          destination = '/worker/find';
        } else if (location.state?.from?.pathname) {
          destination = location.state.from.pathname;
        }
        
        // Small delay for better UX
        setTimeout(() => {
          navigate(destination, { replace: true });
        }, 500);
      }
    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';
      
      // More specific error messages
      if (err.message.includes('credentials') || err.message.includes('invalid')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (err.message.includes('network') || err.message.includes('fetch')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (err.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again in a moment.';
      } else if (err.message.includes('verification')) {
        errorMessage = 'Please verify your email before logging in.';
      }
      
      setError(errorMessage);
      
      // Show error toast
      toast.error(errorMessage, {
        position: 'top-center',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Animated Particles */}
      <div className="absolute inset-0 min-h-screen overflow-hidden">
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
            <p className="text-gray-600 text-sm sm:text-base mt-2">Welcome back! Sign in to your account</p>
          </div>

          <Card className="shadow-md border-0 bg-white/95 backdrop-blur-xl rounded-xl overflow-hidden">
            <CardHeader className="pb-6 border-b">
              <CardTitle className="text-2xl text-center text-gray-900 font-bold">Sign In</CardTitle>
              <CardDescription className="text-center text-gray-600 mt-2">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 sm:px-10 py-8">
              {/* Info Message Display */}
              {infoMessage && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    {infoMessage}
                  </div>
                </div>
              )}

              {/* Global Error Display */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-700">
                    {error}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className={`pl-10 h-12 rounded-lg border-gray-300 bg-white/90 text-gray-900 placeholder-gray-500 focus:border-[#445FA2] focus:ring-[#445FA2] transition-all duration-200 backdrop-blur-sm ${errors.email ? 'border-red-500' : ''}`}
                      {...register('email', { required: 'Email is required' })}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email?.message}</p>
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
                    <p className="text-sm text-red-500">{errors.password?.message}</p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked)}
                      className="border-gray-300 data-[state=checked]:bg-[#445FA2] data-[state=checked]:border-[#445FA2]"
                    />
                    <Label htmlFor="rememberMe" className="text-sm text-gray-600">
                      Remember me
                    </Label>
                  </div>
                  <Link to="/forgot-password" className="text-sm text-[#445FA2] hover:text-[#009889] hover:underline transition-colors duration-200 font-medium">
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-[#445FA2] hover:bg-[#3a4f8a] text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : 'Sign In'}
                </Button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-[#445FA2] hover:text-[#009889] hover:underline font-medium transition-colors duration-200">
                    Sign Up
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