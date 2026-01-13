import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import CustomerDashboard from './pages/CustomerDashboard';
import DriverDashboard from './pages/DriverDashboard';
import ReportShowcase from './pages/ReportShowcase';
import CustomerRegister from './pages/CustomerRegister';
import DriverRegister from './pages/DriverRegister';


// Simple Landing Page
const Home = () => (
  <div className="text-center py-20">
    <h1 className="text-5xl font-extrabold text-brand-600 mb-6">HappyAuto 🛺</h1>
    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
      Optimizing idle time for auto-rickshaw drivers through smart delivery assignments and real-time tracking.
    </p>
    <div className="space-x-4">
      <a href="/register" className="bg-brand-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-brand-700">Get Started</a>
    </div>
  </div>
);

// Protected Route Wrapper
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.user_type !== role) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<AuthPage type="login" />} />
              <Route path="/register" element={<AuthPage type="register" />} />
              <Route path="/report-showcase" element={<ReportShowcase />} />
              <Route path="/register/customer" element={<CustomerRegister />} />
              <Route path="/register/driver" element={<DriverRegister />} />
              <Route path="/customer-dashboard" element={
                <ProtectedRoute role="customer">
                  <CustomerDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/driver-dashboard" element={
                <ProtectedRoute role="driver">
                  <DriverDashboard />
                </ProtectedRoute>
              } />

            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;