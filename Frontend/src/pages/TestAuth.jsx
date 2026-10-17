import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

function TestAuth() {
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    // Check authentication status when component mounts
    checkAuth();
  }, [checkAuth]);

  const handleSimulateRefresh = () => {
    // Simulate a page refresh by forcing a re-render
    setRefreshCount(prev => prev + 1);
    checkAuth();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Status:</span>{' '}
            <span className={`font-semibold ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
              {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </span>
          </p>
          <p>
            <span className="font-medium">Refresh Count:</span> {refreshCount}
          </p>
        </div>
      </div>

      {isAuthenticated && user ? (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {user.name}</p>
            <p><span className="font-medium">Email:</span> {user.email}</p>
            <p><span className="font-medium">Role:</span> {user.role}</p>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Not Logged In</h2>
          <p>Please log in to see your user information.</p>
          <div className="mt-4">
            <Link to="/login">
              <Button>Go to Login</Button>
            </Link>
          </div>
        </div>
      )}

      <div className="flex space-x-4">
        <Button onClick={handleSimulateRefresh}>
          Simulate Page Refresh
        </Button>
        <Link to="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}

export default TestAuth;