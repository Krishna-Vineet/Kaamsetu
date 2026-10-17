import { createBrowserRouter } from "react-router-dom";
// Components
import ScrollToTop from "@/components/ScrollToTop";
// Layouts
import PublicLayout from "@/layouts/PublicLayout";
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
// Protected Route Component
import { ProtectedRoute } from "@/components/ProtectedRoute";
// Public Pages
import Home from "@/pages/Home";
import About from "@/pages/About";
import ReachUs from "@/pages/ReachUs";
import HelpCenter from "@/pages/HelpCenter";
import Safety from "@/pages/Safety";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import NotFound from "@/pages/NotFound";
import Unauthorized from "@/pages/Unauthorized";
import Blocked from "@/pages/Blocked";
import TestAuth from "@/pages/TestAuth";
// Auth Pages
import { Login } from "@/pages/auth/Login";
import { Register } from "@/pages/auth/Register";
import { ForgotPassword } from "@/pages/auth/ForgotPassword";
import { OtpVerification } from "@/pages/auth/OtpVerification";
import { ResetPassword } from "@/pages/auth/ResetPassword";
// Client Pages
import Hire from "@/pages/client/Hire";
import WorksClient from "@/pages/client/Works";
import AccountClient from "@/pages/client/Account";
import PostWork from "@/pages/client/Post";
// Worker Pages
import FindWork from "@/pages/worker/Find";
import WorksWorker from "@/pages/worker/Works";
import AccountWorker from "@/pages/worker/Account";

const router = createBrowserRouter([
  {
    element: (
      <>
        <ScrollToTop />
        <PublicLayout />
      </>
    ),
    children: [
      { path: "/", element: <Home /> },
      { path: "/about", element: <About /> },
      { path: "/reach-us", element: <ReachUs /> },
      { path: "/help-center", element: <HelpCenter /> },
      { path: "/safety", element: <Safety /> },
      { path: "/privacy", element: <Privacy /> },
      { path: "/terms", element: <Terms /> },
      { path: "/unauthorized", element: <Unauthorized /> },
      { path: "/blocked", element: <Blocked /> },
      { path: "/test-auth", element: <TestAuth /> },
    ],
  },
  {
    element: (
      <>
        <ScrollToTop />
        <AuthLayout />
      </>
    ),
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/otp", element: <OtpVerification /> },
      { path: "/reset-password", element: <ResetPassword /> },
    ],
  },
  {
    element: (
      <>
        <ScrollToTop />
        <DashboardLayout />
      </>
    ),
    children: [
      // Client Pages - Protected
      {
        path: "/client/hire",
        element: (
          <ProtectedRoute requiredRole="client">
            <Hire />
          </ProtectedRoute>
        )
      },
      {
        path: "/client/post",
        element: (
          <ProtectedRoute requiredRole="client">
            <PostWork />
          </ProtectedRoute>
        )
      },
      {
        path: "/client/works",
        element: (
          <ProtectedRoute requiredRole="client">
            <WorksClient />
          </ProtectedRoute>
        )
      },
      {
        path: "/client/account",
        element: (
          <ProtectedRoute requiredRole="client">
            <AccountClient />
          </ProtectedRoute>
        )
      },

      // Worker Pages - Protected
      {
        path: "/worker/find",
        element: (
          <ProtectedRoute requiredRole="worker">
            <FindWork />
          </ProtectedRoute>
        )
      },
      {
        path: "/worker/works",
        element: (
          <ProtectedRoute requiredRole="worker">
            <WorksWorker />
          </ProtectedRoute>
        )
      },
      {
        path: "/worker/account",
        element: (
          <ProtectedRoute requiredRole="worker">
            <AccountWorker />
          </ProtectedRoute>
        )
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

export default router;
