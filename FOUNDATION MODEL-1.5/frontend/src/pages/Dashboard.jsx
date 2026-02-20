



































































































































































































































































































































































































































































































































































































































































































































































































































































import { useAuthStore } from '../store/authStore';
import { LogOut, User, Shield } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">
                Auth System Dashboard
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Welcome Card */}
            <div className="card">
              <div className="flex items-center">
                <User className="h-8 w-8 text-blue-600" />
                <h3 className="ml-3 text-lg font-medium text-gray-900">
                  Welcome back!
                </h3>
              </div>
              <p className="mt-4 text-gray-600">
                You are successfully logged in to the Model 1.5 authentication system.
              </p>
            </div>

            {/* User Info Card */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Your Profile
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900">{user?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{user?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email Verified</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user?.emailVerified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user?.emailVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* System Status Card */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                System Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Authentication Service</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Session Management</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Token Refresh</span>
                </div>
              </div>
            </div>
          </div>

          {/* Features Overview */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Model 1.5 Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h4 className="text-md font-medium text-gray-900 mb-2">
                  🔐 Secure Authentication
                </h4>
                <p className="text-gray-600 text-sm">
                  JWT-based authentication with refresh tokens, password hashing, and account lockout protection.
                </p>
              </div>

              <div className="card">
                <h4 className="text-md font-medium text-gray-900 mb-2">
                  📊 Audit Logging
                </h4>
                <p className="text-gray-600 text-sm">
                  Comprehensive logging of all authentication events for security monitoring.
                </p>
              </div>

              <div className="card">
                <h4 className="text-md font-medium text-gray-900 mb-2">
                  🚀 Scalable Architecture
                </h4>
                <p className="text-gray-600 text-sm">
                  Modular NestJS backend with clean separation of concerns, ready for future expansion.
                </p>
              </div>

              <div className="card">
                <h4 className="text-md font-medium text-gray-900 mb-2">
                  🎨 Modern Frontend
                </h4>
                <p className="text-gray-600 text-sm">
                  React with Vite, Zustand state management, and Tailwind CSS for a smooth user experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
