import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import "leaflet/dist/leaflet.css";
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import CustomerDashboard from './pages/CustomerDashboard';
import DriverDashboard from './pages/DriverDashboard';
import ReportShowcase from './pages/ReportShowcase';
import CustomerRegister from './pages/CustomerRegister';
import DriverRegister from './pages/DriverRegister';
import CustomerSummary from "./pages/CustomerSummary";
import DriverSummary from './pages/DriverSummary';
import AdminDashboard from './pages/AdminDashboard';

// Icons (Inline SVGs for portability)
const TruckIcon = () => (
  <svg className="w-12 h-12 text-brand-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
);
const MapPinIcon = () => (
  <svg className="w-12 h-12 text-brand-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
const ClockIcon = () => (
  <svg className="w-12 h-12 text-brand-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const CheckIcon = () => (
  <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
);

// Updated Landing Page Component
const Home = () => (
  <div>
    {/* Hero Section */}
    <header className="bg-gradient-to-b from-blue-100 to-grey-100 py-24 text-center">
      <div className="container mx-auto px-4">
        <div className="inline-block p-3 rounded-full bg-blue-100 mb-6">
          <span className="text-2xl">🛺</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-brand-600 mb-6 tracking-tight">
          HappyAuto
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
          The smart platform connecting auto-rickshaw drivers with delivery opportunities. 
          We optimize idle time to increase earnings while providing customers with real-time tracking.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a href="/register/customer" className="bg-brand-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-brand-700 transition shadow-lg transform hover:-translate-y-1">
            I Need a Delivery
          </a>
          <a href="/register/driver" className="bg-white text-brand-600 border-2 border-brand-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition shadow-md transform hover:-translate-y-1">
            I am a Driver
          </a>
        </div>
      </div>
    </header>

    {/* Features Section */}
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">How HappyAuto Works</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">We bridge the gap between transportation and logistics efficiently.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-10">
          <div className="text-center p-6 rounded-xl hover:shadow-xl transition duration-300 border border-gray-100">
            <div className="flex justify-center"><ClockIcon /></div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Idle Time Optimization</h3>
            <p className="text-gray-600">
              Drivers no longer wait empty-handed. As our platform assigns deliveries during off-peak hours to maximize your daily earnings.
            </p>
          </div>
          
          <div className="text-center p-6 rounded-xl hover:shadow-xl transition duration-300 border border-gray-100">
            <div className="flex justify-center"><MapPinIcon /></div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Easy Delivery Services</h3>
            <p className="text-gray-600">
              Deliveries are lot more easier now! Our platform allows the customers to book a delivery anytime, anywhere just with a few clicks.
              Track your parcels or rides in real-time. Know exactly when your driver will arrive with our live map integration.
            </p>
          </div>
          
          <div className="text-center p-6 rounded-xl hover:shadow-xl transition duration-300 border border-gray-100">
            <div className="flex justify-center"><TruckIcon /></div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Friendly Environment</h3>
            <p className="text-gray-600">
              We secure and build a friendly environment between customers and drivers keeping the essential details transparent to both sides allowing them to communicate easier.  
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Split CTA Section */}
    <section className="py-20 bg-brand-600 text-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">For Drivers</h2>
            <p className="text-blue-100 text-lg mb-6">Turn your waiting time into earning time. Join the network of smart auto-rickshaw drivers today.</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center"><CheckIcon /> Flexible working hours</li>
              <li className="flex items-center"><CheckIcon /> Weekly payouts directly to bank</li>
              <li className="flex items-center"><CheckIcon /> Route-optimized delivery requests</li>
            </ul>
            <a href="/register/driver" className="inline-block bg-white text-brand-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
              Register as Driver
            </a>
          </div>
          
          <div className="bg-white/10 p-8 rounded-2xl backdrop-blur-sm border border-white/20">
            <h2 className="text-3xl font-bold mb-4">For Customers</h2>
            <p className="text-blue-100 text-lg mb-6">Send parcels within the city quickly and reliably. Support local drivers while getting your goods delivered.</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center"><CheckIcon /> Instant price estimation</li>
              <li className="flex items-center"><CheckIcon /> Verified and trusted drivers</li>
              <li className="flex items-center"><CheckIcon /> 24/7 Support availability</li>
            </ul>
            <a href="/register/customer" className="inline-block bg-white text-brand-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
              Create Account
            </a>
          </div>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="bg-gray-900 text-gray-400 py-10 text-center">
      <div className="container mx-auto px-4">
        <h3 className="text-white text-2xl font-bold mb-4">HappyAuto</h3>
        <p className="mb-6">Optimizing urban mobility, one ride at a time.</p>
        <div className="text-sm">
          &copy; {new Date().getFullYear()} HappyAuto. All rights reserved.
        </div>
      </div>
    </footer>
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
        <div className="min-h-screen flex flex-col font-sans">
          <Navbar />
          <main className="flex-grow">
            <Routes>

              <Route path="/" element={<Home />} />
              <Route path="/login" element={<AuthPage type="login" />} />
              <Route path="/admin" element={<AdminDashboard />} />
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
              <Route path="/customer-summary" element={<CustomerSummary />} />
              <Route path="/driver-summary" element={<DriverSummary />} />

            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;