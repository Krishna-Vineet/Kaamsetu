import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/auth';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { OTPInput } from '../../components/OTPInput';
import { logo } from '@/assets/assets';

export function OtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useAuthStore();
  
  // Get data from location state
  const email = location.state?.email;
  const role = location.state?.role;
  const from = location.state?.from || '/register';

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: email || '',
      code: ''
    }
  });

  const otpValue = watch('code');

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await authApi.verifyOtp({
        data: email,
        code: data.code
      });

      if (response.success) {
        // Set user in store
        setUser(response.user);
        
        // Navigate based on role
        if (response.role === 'worker') {
          navigate('/worker/find');
        } else {
          navigate('/client/hire');
        }
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;
    
    try {
      // For resending OTP, we would need to call register again
      // This is a simplified approach - in production you might want a separate resend endpoint
      setCountdown(60);
      setCanResend(false);
      setValue('code', '');
      setError('');
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  const handleOTPChange = (value) => {
    setValue('code', value);
    setError(''); // Clear error when user types
    
    // Auto-submit when OTP is complete (with small delay to ensure state is updated)
    if (value.length === 6) {
      setTimeout(() => {
        handleSubmit(onSubmit)();
      }, 100);
    }
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-teal-50 relative overflow-hidden">
      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#445FA2]/30 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '0s' }}></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-[#009889]/30 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#445FA2]/25 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-sm sm:max-w-md">
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
            <p className="text-gray-600 text-sm sm:text-base mt-2">Verify your identity</p>
          </div>

          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
            <CardHeader className="pb-6">
              <div className="flex items-center mb-4">
                <Link 
                  to={from === 'register' ? '/register' : '/forgot-password'} 
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </div>
              <CardTitle className="text-2xl text-center text-gray-900">Enter Verification Code</CardTitle>
              <CardDescription className="text-center text-gray-600">
                We've sent a 6-digit code to<br />
                <span className="font-medium text-gray-900">{email}</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 sm:px-8">
              {/* Error Display */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* OTP Input */}
                <div className="space-y-2">
                  <OTPInput
                    value={otpValue}
                    onChange={handleOTPChange}
                    error={!!errors.code}
                  />

                  {errors.code && (
                    <p className="text-sm text-red-500 text-center">{errors.code.message}</p>
                  )}
                </div>

                {/* Resend OTP */}
                <div className="text-center">
                  {canResend ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleResendOtp}
                      className="text-[#445FA2] hover:text-[#009889] hover:bg-transparent"
                    >
                      Resend Code
                    </Button>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Resend code in {countdown}s
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-[#445FA2] to-[#009889] hover:from-[#445FA2]/90 hover:to-[#009889]/90 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                  disabled={otpValue.length !== 6}
                >
                  Verify Code
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Didn't receive the code?{" "}
                  <Link 
                    to={from} 
                    state={{ email, role }}
                    className="text-[#445FA2] hover:text-[#009889] hover:underline font-medium transition-colors duration-200"
                  >
                    Try again
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}