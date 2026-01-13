import React, { useState, useEffect } from 'react';
import { bookDelivery, getMyDeliveries } from '../services/api';
import DeliveryMap from "../components/DeliveryMap";
import { getRoute } from "../services/route";
import LocationInput from "../components/LocationInput"; 

const CustomerDashboard = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    pickup_address: '', pickup_lat: 12.97, pickup_lng: 77.59,
    dropoff_address: '', dropoff_lat: 12.98, dropoff_lng: 77.60,
    scheduled_pickup: ''
  });

  const [fare, setFare] = useState(null);
  const [eta, setEta] = useState(null);
  const [driver, setDriver] = useState(null);

  // Recalculate route when coordinates change
  useEffect(() => {
    async function calc() {
      if (
        formData.pickup_lat == null || 
        formData.dropoff_lat == null
      ) return;

      const pickup = {
        lat: formData.pickup_lat,
        lng: formData.pickup_lng
      };

      const dropoff = {
        lat: formData.dropoff_lat,
        lng: formData.dropoff_lng
      };

      try {
        const { distanceKm, durationMin } = await getRoute(pickup, dropoff);
        setEta(durationMin.toFixed(1));
        const cost = 30 + distanceKm * 12 + durationMin * 1;
        setFare(cost.toFixed(2));
      } catch(e) {
        console.log("Route calculation failed");
      }
    }
    calc();
  }, [formData.pickup_lat, formData.dropoff_lat]);

  // Poll driver location
  useEffect(() => {
  const token = localStorage.getItem("token");

  // 🚨 If user is not logged in, do not poll
  if (!token) {
    console.warn("No auth token found. Skipping driver location polling.");
    return;
  }

  const id = setInterval(async () => {
    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/v1/deliveries/driver/location",
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ REQUIRED
            "Content-Type": "application/json"
          }
        }
      );

      // 🔹 No active delivery / no driver assigned
      if (res.status === 404) {
        setDriver(null);
        return;
      }

      // 🔒 Token expired or invalid
      if (res.status === 401) {
        console.warn("Unauthorized. Stopping driver polling.");
        clearInterval(id);
        setDriver(null);
        return;
      }

      if (!res.ok) {
        console.warn(`Driver location fetch failed: ${res.status}`);
        return;
      }

      const loc = await res.json();

      // ✅ Only update when coordinates exist
      if (loc?.lat != null && loc?.lng != null) {
        setDriver({
          lat: Number(loc.lat),
          lng: Number(loc.lng)
        });
      } else {
        setDriver(null);
      }

    } catch (e) {
      // Network failure → silently ignore
      setDriver(null);
    }
  }, 4000);

  return () => clearInterval(id);
}, []);

  // Fetch deliveries on load
  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const res = await getMyDeliveries();
      setDeliveries(res.data || []);
    } catch (e) { console.error(e); }
  };

  const handleLocationChange = (type) => (data) => {
    setFormData({ 
      ...formData, 
      [`${type}_address`]: data.address,
      [`${type}_lat`]: data.lat,
      [`${type}_lng`]: data.lng
    });
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const deliveryPayload = {
        ...formData,
        vehicle_make: 'Bajaj',
        vehicle_model: 'Auto Rickshaw', 
        vehicle_year: 2020,
        vehicle_vin: 'TBD' 
      };

      await bookDelivery(deliveryPayload);
      alert('✅ Delivery booked successfully!');
      
      // Reset form
      setFormData({ 
        ...formData, 
        pickup_address: '', 
        dropoff_address: '', 
        scheduled_pickup: '' 
      });
      setFare(null);
      setEta(null);
      fetchDeliveries();
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.detail || 'Unknown error'));
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 bg-slate-50 min-h-screen">
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Book Delivery</h1>
        <p className="text-slate-500 mt-1">Fast and reliable auto-rickshaw delivery service.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Booking Form Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 p-6 sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 mb-6 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="text-amber-500">✦</span> New Delivery Details
            </h3>
            
            <form onSubmit={handleBook} className="space-y-6">
              
              {/* ADDRESS INPUTS */}
              <div className="space-y-5 relative pl-6">
                
                <LocationInput 
                  label="Pickup Location" 
                  icon="🟢"
                  value={formData.pickup_address}
                  onSelect={handleLocationChange('pickup')} 
                />
                
                <div className="absolute left-[11px] top-10 bottom-4 w-0.5 border-l-2 border-dashed border-slate-300"></div>

                <LocationInput 
                  label="Dropoff Destination" 
                  icon="🔴"
                  value={formData.dropoff_address}
                  onSelect={handleLocationChange('dropoff')} 
                />
              </div>

              {/* MAP SECTION */}
              <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 group min-h-[420px]">
                
                {formData.pickup_address && formData.dropoff_address ? (
                  <>
                    <DeliveryMap 
                      pickup={{
                        lat: formData.pickup_lat,
                        lng: formData.pickup_lng
                      }}
                      dropoff={{
                        lat: formData.dropoff_lat,
                        lng: formData.dropoff_lng
                      }}
                      driver={driver}
                    />
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg shadow-sm text-xs font-semibold text-slate-600">
                      Route Preview
                    </div>
                  </>
                ) : (
                  /* Placeholder State */
                  <div className="h-[420px] w-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 border-2 border-dashed border-slate-200 m-1 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.553-.894L15 7m0 13V7m0 0L9 7" />
                    </svg>
                    <p className="text-sm font-medium">Enter both locations to see the route</p>
                  </div>
                )}
              </div>
              
              {/* ESTIMATES */}
              {(fare || eta) && (
                <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center border border-slate-100 animate-fade-in">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Estimated Cost</p>
                    <p className="text-xl font-extrabold text-slate-900">₹{fare || "--"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-bold uppercase">ETA</p>
                    <p className="text-lg font-bold text-amber-600">{eta ? `${eta} mins` : "--"}</p>
                  </div>
                </div>
              )}
                            
              {/* SCHEDULING */}
              <div className="bg-amber-50 rounded-xl p-4 space-y-3 border border-amber-100">
                <div className="flex items-center gap-2">
                    <span className="text-xl">⏱️</span>
                    <label className="text-sm font-bold text-amber-900 uppercase">Scheduled Pickup</label>
                </div>
                <input 
                    required 
                    type="datetime-local" 
                    className="w-full px-3 py-2 text-sm bg-white border border-amber-200 rounded-lg focus:border-amber-500 outline-none transition shadow-sm"
                    value={formData.scheduled_pickup} 
                    onChange={e => setFormData({...formData, scheduled_pickup: e.target.value})} 
                />
              </div>

              <button disabled={loading || !formData.pickup_address || !formData.dropoff_address} type="submit" className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 ${
                loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30'
              }`}>
                {loading ? 'Processing...' : <><span>Book Delivery</span><span>➜</span></>}
              </button>
            </form>
          </div>
        </div>

        {/* Active Deliveries Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
             <h3 className="text-xl font-bold text-slate-800">Active Deliveries</h3>
             <span className="bg-white border border-slate-200 px-3 py-1 rounded-full text-xs font-bold text-slate-500 shadow-sm">{deliveries.length} Active</span>
          </div>

          {deliveries.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-2xl">📦</div>
              <h4 className="text-lg font-bold text-slate-900">No deliveries yet</h4>
              <p className="text-slate-500">Book your first delivery using the form.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {deliveries.map(d => (
                <div key={d.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${d.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                         {d.status === 'pending' ? '🕒' : '🚛'}
                      </div>
                      <div>
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${d.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                          {d.status}
                        </span>
                        <p className="text-xs text-slate-400 mt-0.5">ID: {d.id.substring(0, 8)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-slate-900">₹{d.estimated_cost}</p>
                      <p className="text-xs text-slate-500">Estimated Cost</p>
                    </div>
                  </div>
                  
                  <div className="relative pl-4 border-l-2 border-slate-100 space-y-4">
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white ring-2 ring-amber-100"></div>
                      <p className="text-sm font-medium text-slate-800">{d.pickup_address}</p>
                      <p className="text-xs text-slate-500">Pickup Point</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-3 h-3 bg-slate-800 rounded-full border-2 border-white ring-2 ring-slate-100"></div>
                      <p className="text-sm font-medium text-slate-800">{d.dropoff_address}</p>
                      <p className="text-xs text-slate-500">Destination</p>
                    </div>
                  </div>

                  {d.assigned_driver && (
                    <div className="mt-4 bg-slate-50 rounded-xl p-3 flex items-center gap-3 border border-slate-100">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-sm font-bold text-slate-600">
                        {d.assigned_driver.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">{d.assigned_driver.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                           🛺 {d.assigned_driver.vehicle_number}
                        </p>
                      </div>
                      <button className="bg-white border border-slate-200 text-slate-600 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;