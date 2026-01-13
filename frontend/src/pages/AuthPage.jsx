import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, register } from '../services/api';

const AuthPage = ({ type }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', user_type: 'customer',
    driver_license_number: '', vehicle_plate_number: ''
  });
  const [error, setError] = useState('');
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Step 1: Register or Login
      const res = type === 'login' 
        ? await login({ email: formData.email, password: formData.password })
        : await register(formData);
      
      // Step 2: Debug - Log the token
      const receivedToken = res.data.access_token;
      console.log("🔑 Token Received:", receivedToken); // Check this in F12 Console

      if (!receivedToken) {
        throw new Error("No token returned from server");
      }

      localStorage.setItem('access_token', receivedToken);
      
      // Step 3: Fetch User Profile
      const userRes = await import('../services/api').then(mod => mod.getMe());
      setUser(userRes.data);
      
      // Step 4: Redirect
      const role = userRes.data.user_type;
      navigate(role === 'driver' ? '/driver-dashboard' : '/customer-dashboard');
      
    } catch (err) {
      console.error("Auth Error:", err);
      
      let errorMsg = "Unknown error";
      if (err.response) {
        errorMsg = err.response.data?.detail || err.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError((type === 'register' ? 'Registration Failed: ' : 'Login Failed: ') + errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Visuals */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-40"></div>
        <div className="relative z-10 text-center p-12">
          <h2 className="text-5xl font-extrabold text-white mb-6 tracking-tight">
            Smart City Logistics
          </h2>
          <p className="text-slate-300 text-lg max-w-lg mx-auto leading-relaxed">
            Connecting auto-rickshaw drivers with local delivery opportunities. 
            Optimize idle time, increase earnings, and serve the community better.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-slate-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
              {type === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {type === 'login' ? 'Please enter your details to sign in.' : 'Join HappyAuto today.'}
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
            {error && (
              <div className="mb-6 bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}
            
            <form className="space-y-5" onSubmit={handleSubmit}>
              {type === 'register' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                    <input name="name" type="text" required onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input name="phone" type="text" required pattern="[0-9]{10}" onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition" placeholder="9876543210" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Account Type</label>
                    <select name="user_type" onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 outline-none transition bg-white">
                      <option value="customer">Customer</option>
                      <option value="driver">Driver</option>
                    </select>
                  </div>
                  {formData.user_type === 'driver' && (
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 space-y-3">
                      <h4 className="text-sm font-bold text-amber-900">Driver Details</h4>
                      <input name="driver_license_number" type="text" placeholder="License Number" onChange={handleChange} className="block w-full px-3 py-2 border-0 bg-white rounded-lg shadow-sm text-sm focus:ring-1 focus:ring-amber-500 outline-none" />
                      <input name="vehicle_plate_number" type="text" placeholder="Vehicle Plate (e.g. KA-01-AB-1234)" onChange={handleChange} className="block w-full px-3 py-2 border-0 bg-white rounded-lg shadow-sm text-sm focus:ring-1 focus:ring-amber-500 outline-none" />
                    </div>
                  )}
                </>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <input name="email" type="email" required onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                <input name="password" type="password" required onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition" placeholder="••••••••" />
              </div>

              <button type="submit" className="w-full bg-amber-500 text-white py-3.5 rounded-xl font-bold hover:bg-amber-600 shadow-lg shadow-amber-500/30 transform hover:-translate-y-0.5 transition-all duration-200">
                {type === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </div>
          
          <div className="text-center text-sm">
            {type === 'login' ? (
              <Link to="/register" className="text-amber-600 font-semibold hover:underline">Don't have an account? Sign up</Link>
            ) : (
              <Link to="/login" className="text-amber-600 font-semibold hover:underline">Already have an account? Sign in</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;