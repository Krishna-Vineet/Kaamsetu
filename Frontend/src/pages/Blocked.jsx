import { Link } from "react-router-dom";
import { ShieldAlert, Home, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth";
import NotFound from "@/pages/NotFound";

export default function Blocked() {
  const { user } = useAuthStore();
  if (!user?.blocked) {
    return <NotFound />;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl">
        <Card className="border-0 shadow-2xl">
          <CardContent className="p-8 sm:p-10">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
                <ShieldAlert className="w-12 h-12 text-red-600" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                Access Restricted
              </h1>
              <p className="text-gray-700 text-base sm:text-lg max-w-2xl">
                You are restricted to use KaamSetu services. Contact the support for grievance and more.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Button asChild className="bg-gray-900 hover:bg-gray-800">
                  <Link to="/">
                    <Home className="w-5 h-5 mr-2" />
                    Go to Home
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-red-300 text-red-700 hover:text-white hover:bg-red-600">
                  <a href="mailto:support@kaamsetu.co.in">
                    <Mail className="w-5 h-5 mr-2" />
                    Contact Support
                  </a>
                </Button>
              </div>

              <div className="text-xs text-gray-400 mt-4">
                If you believe this is a mistake, please reach out to our support team.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
