import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { logo } from '@/assets/assets';

export function ForgotPassword() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = (data) => {
    navigate('/otp', { state: { email: data.email, from: 'forgot-password' } });
  };

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
            <p className="text-gray-600 text-sm sm:text-base mt-2">Reset your password</p>
          </div>

          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
            <CardHeader className="pb-6">
              <div className="flex items-center mb-4">
                <Link
                  to="/login"
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </div>
              <CardTitle className="text-2xl text-center text-gray-900">Reset Password</CardTitle>
              <CardDescription className="text-center text-gray-600">
                Enter your email or phone number and we'll send you a verification code to reset your password
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 sm:px-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email or Phone</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="text"
                      placeholder="Enter your email or phone number"
                      autoComplete="email"
                      className={`pl-10 h-12 rounded-lg border-gray-200 bg-white/80 text-gray-900 placeholder-gray-500 focus:border-[#445FA2] focus:ring-[#445FA2] transition-all duration-200 backdrop-blur-sm ${errors.email ? 'border-red-500' : ''}`}
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-[#445FA2] to-[#009889] hover:from-[#445FA2]/90 hover:to-[#009889]/90 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Send Reset Code
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Remember your password?{" "}
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
  );
}