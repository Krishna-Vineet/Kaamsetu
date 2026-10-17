import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { authApi } from "@/api/auth";
import { useAuthStore } from "@/store/auth";

// Helper function for user-friendly error messages
const getErrorMessage = (error) => {
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};

// Helper function for redirecting users based on role
const redirectBasedOnRole = (role, navigate) => {
  switch (role) {
    case "client":
      navigate("/client/hire");
      break;
    case "worker":
      navigate("/worker/find");
      break;
    // case "admin":
    //   navigate("/admin/dashboard");
    //   break;
    default:
      navigate("/");
  }
};

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setUser, setAuthenticated, setLoading, setError, reset } = useAuthStore();

  const register = useMutation({
    mutationFn: (data) => authApi.register(data),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      toast.success("Registration successful! Please verify your email.");
      navigate("/otp", { state: { email: data.email } });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
      setError(message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const login = useMutation({
    mutationFn: (data) => authApi.login(data),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      setUser(data.user);
      setAuthenticated(true);
      toast.success(`Welcome back, ${data.user.name}!`);
      redirectBasedOnRole(data.user.role, navigate);
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
      setError(message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const logout = useMutation({
    mutationFn: () => authApi.logout(),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      reset();
      queryClient.clear();
      toast.success("Logged out successfully");
      navigate("/");
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
      // Even if the server logout fails, clear local state
      reset();
      navigate("/");
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const verifyOtp = useMutation({
    mutationFn: (data) => authApi.verifyOtp(data),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      setUser(data.user);
      setAuthenticated(true);
      toast.success("Email verified successfully!");
      redirectBasedOnRole(data.user.role, navigate);
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
      setError(message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const resendOtp = useMutation({
    mutationFn: (email) => authApi.resendOtp(email),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: () => {
      toast.success("OTP sent successfully!");
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
      setError(message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const forgotPassword = useMutation({
    mutationFn: (email) => authApi.forgotPassword(email),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      toast.success("Password reset OTP sent to your email!");
      navigate("/reset-password", { state: { email: data.email } });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
      setError(message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const resetPassword = useMutation({
    mutationFn: (data) => authApi.resetPassword(data),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: () => {
      toast.success("Password reset successfully!");
      navigate("/login");
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
      setError(message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  return {
    register,
    login,
    logout,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
  };
};