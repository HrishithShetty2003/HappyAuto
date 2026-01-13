import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register } from '../services/api';

const DriverRegister = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', 
    driver_license_number: '', vehicle_plate_number: ''
  });
  const [error, setError] = useState('');
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Explicitly set user_type to 'driver'
      const res = await register({ 
        ...formData, 
        user_type: 'driver' 
      });
      
      localStorage.setItem('aceess_token', res.data.access_token);
      const userRes = await import('../services/api').then(mod => mod.getMe());
      setUser(userRes.data);
      navigate('/driver-dashboard');
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-40"></div>
        <div className="relative z-10 text-center p-12">
          <h2 className="text-5xl font-extrabold text-white mb-6 tracking-tight">
            Drive with Us
          </h2>
          <p className="text-slate-300 text-lg max-w-lg mx-auto leading-relaxed">
            Join HappyAuto to minimize your idle time. Accept local deliveries and increase your daily earnings.
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-slate-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
              Driver Sign Up
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Start earning by delivering packages nearby.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
            {error && (
              <div className="mb-6 bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}
            
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                <input name="name" type="text" required onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition" placeholder="Ramesh Kumar" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                <input name="phone" type="text" required pattern="[0-9]{10}" onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition" placeholder="9876543210" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <input name="email" type="email" required onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition" placeholder="driver@example.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                <input name="password" type="password" required onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition" placeholder="••••••••" />
              </div>

              {/* Driver Specific Fields */}
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 space-y-4">
                <h4 className="text-sm font-bold text-amber-900 uppercase tracking-wide">Vehicle Details</h4>
                <input name="driver_license_number" type="text" placeholder="License Number" onChange={handleChange} className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-amber-500 outline-none transition" />
                <input name="vehicle_plate_number" type="text" placeholder="Vehicle Plate (e.g. KA-01-AB-1234)" onChange={handleChange} className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-amber-500 outline-none transition" />
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 shadow-lg shadow-slate-900/30 transform hover:-translate-y-0.5 transition-all duration-200">
                Register as Driver
              </button>
            </form>
          </div>
          
          <div className="text-center text-sm">
            <span className="text-slate-500">Already have an account? </span>
            <Link to="/login" className="text-amber-600 font-semibold hover:underline">Log In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverRegister;