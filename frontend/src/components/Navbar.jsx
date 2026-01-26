import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const Navbar = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
              🛺
            </div>
            <Link to="/" className="font-bold text-xl tracking-tight text-slate-800">
              Happy<span className="text-amber-600">Auto</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
              {/* <Link to="/login" className="text-slate-600 hover:text-amber-600 font-medium text-sm">Log In</Link> */}
              {/* <Link to="/register/customer" className="text-amber-600 font-medium text-sm px-2 hover:underline hidden sm:inline">
                  Customer
                </Link>
                <Link to="/register/driver" className="text-slate-900 font-medium text-sm px-2 hover:text-amber-600 hidden sm:inline">
                  Driver
                </Link> */}
                <Link to="/register/customer" className="sm:hidden bg-amber-500 text-white px-4 py-2 rounded-lg font-medium">
                  Register
                </Link>
                <div className="hidden sm:flex items-center gap-3 mr-4 px-4 py-1.5 bg-slate-100 rounded-full">
                  <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-xs font-bold text-slate-600">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-700 leading-none">{user.name}</p>
                    <p className="text-slate-500 capitalize">{user.user_type}</p>
                  </div>
                </div>

                {user.user_type === 'driver' && (
                  <>
                    <Link to="/driver-dashboard" className="text-slate-600 hover:text-amber-600 font-medium text-sm px-3 py-2 transition-colors">Dashboard</Link>
                    <Link
                      to="/driver-summary"
                      className="text-slate-600 hover:text-amber-600 font-medium text-sm px-3 py-2 transition-colors"
                  >
                    Summary
                  </Link>
                  </>
                )}
                {user.user_type === 'customer' && (
                  <>
                    <Link 
                      to="/customer-dashboard" className="text-slate-600 hover:text-amber-600 font-medium text-sm px-3 py-2 transition-colors">
                        Dashboard
                    </Link>
                    <Link
                      to="/customer-summary"
                      className="text-slate-600 hover:text-amber-600 font-medium text-sm px-3 py-2 transition-colors"
                    >
                      Summary
                    </Link>
                  </>
                )}
                
                <button onClick={handleLogout} className="ml-2 text-rose-500 hover:bg-rose-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-amber-600 font-medium text-sm">Log In</Link>
                <Link to="/register" className="bg-slate-900 text-white px-5 py-2 rounded-lg hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 text-sm font-medium">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;