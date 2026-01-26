import React, { useState, useEffect } from 'react';
import { bookDelivery, getMyDeliveries } from '../services/api';
import DeliveryMap from "../components/DeliveryMap";
import { getRoute } from "../services/route";
import LocationInput from "../components/LocationInput"; 
import PaymentModal from "../components/PaymentModal";

// import { useRef } from "react";

// const prevDeliveriesRef = useRef([]);



const CustomerDashboard = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    pickup_address: '', pickup_lat: 12.97, pickup_lng: 77.59,
    dropoff_address: '', dropoff_lat: 12.98, dropoff_lng: 77.60,
    scheduled_pickup: ''
  });

  const [expandedDeliveryId, setExpandedDeliveryId] = useState(null);
  const [fare, setFare] = useState(null);
  const [eta, setEta] = useState(null);
  const [driver, setDriver] = useState(null);
  const [expiredDelivery, setExpiredDelivery] = useState(null);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [showRescheduleInput, setShowRescheduleInput] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  // const [cancelNotice, setCancelNotice] = useState(null);

  
  const toggleDetails = (id) => {
    setExpandedDeliveryId(prev => (prev === id ? null : id));
  };

  
  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this delivery?")) return;

    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `http://127.0.0.1:8000/api/v1/deliveries/${id}/customer-cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        const data = await res.json();
        alert(data.detail || "Cancel failed");
        return;
      }

       setDeliveries(prev =>
        prev.filter(delivery => delivery.id !== id)
      );

      // fetchDeliveries(); // refresh list
    } catch {
      alert("Network error while cancelling");
    }
  };

  const activeDeliveries = deliveries.filter(
    d => !["cancelled", "completed"].includes(d.status)
  );

  const completedUnpaidDeliveries = deliveries.filter(
    d => d.status === "completed" && d.payment_status !== "paid"
  );

  const [cancelNotice, setCancelNotice] = useState(null);

  const hasPendingPayment = completedUnpaidDeliveries.length > 0;

  useEffect(() => {
  fetch("http://127.0.0.1:8000/api/v1/deliveries/my-deliveries", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`
    }
  })
    .then(res => res.json())
    .then(data => console.log("🧪 direct fetch result:", data))
    .catch(err => console.error("🧪 direct fetch error:", err));
}, []);

  // Recalculate route when coordinates change
  useEffect(() => {
    async function calc() {
      if (
        !formData.pickup_address ||
        !formData.dropoff_address
      ) {
        setFare(null);
        setEta(null);
        return;
      }

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
  }, [
      formData.pickup_address,
      formData.dropoff_address,
      formData.pickup_lat, 
      formData.dropoff_lat
    ]
  );

  // Poll driver location
  useEffect(() => {
  const token = localStorage.getItem("access_token");

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
    console.log("📦 CustomerDashboard mounted");
    fetchDeliveries();
  }, []);

  useEffect(() => {
  const interval = setInterval(() => {
    const now = new Date();

    const expired = deliveries.find(d =>
      d.status === "pending" &&
      !d.driver_id &&
      d.scheduled_pickup &&
      new Date(d.scheduled_pickup) <= now
    );

    if (expired && !showExpiredModal) {
      setExpiredDelivery(expired);
      setShowExpiredModal(true);
    }
  }, 30_000); // every 30 seconds

  return () => clearInterval(interval);
}, [deliveries, showExpiredModal]);


  const fetchDeliveries = async () => {
    try {
      const res = await getMyDeliveries();
      setDeliveries(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };


  const handleContinueClick = () => {
    setShowRescheduleInput(true);
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleTime) {
      alert("Please select a new pickup date and time");
      return;
    }

    const newTime = new Date(rescheduleTime);
    if (newTime <= new Date()) {
      alert("Please select a future pickup time");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const local = new Date(rescheduleTime);
      const utcRescheduleTime = new Date(
        local.getTime() - local.getTimezoneOffset() * 60000
      ).toISOString();

      const res = await fetch(
        `http://127.0.0.1:8000/api/v1/deliveries/${expiredDelivery.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            scheduled_pickup: utcRescheduleTime 
          })
        }
      );

      if (!res.ok) {
        alert("Failed to reschedule pickup");
        return;
      }

      // Clean up UI
      setShowExpiredModal(false);
      setShowRescheduleInput(false);
      setRescheduleTime("");
      setExpiredDelivery(null);

      fetchDeliveries(); // refresh active list

    } catch {
      alert("Network error while rescheduling");
    }
  };

  const handleExpiredCancel = async () => {
    await handleCancel(expiredDelivery.id);
    setShowExpiredModal(false);
    setExpiredDelivery(null);
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

    if (hasPendingPayment) {
      setCancelNotice({
        message: "⚠️ Please complete your pending payment before placing a new delivery."
      });
      return;
    }

    if (!isValidScheduledPickup(formData.scheduled_pickup)) {
      alert("Please enter a valid scheduled pickup date");
      return;
    }

    setLoading(true);
    try {
    // const localDate = new Date(formData.scheduled_pickup);
    // const scheduledPickup = new Date(formData.scheduled_pickup).toISOString();

      const deliveryPayload = {
        ...formData,
        scheduled_pickup: formData.scheduled_pickup,
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

  const isValidScheduledPickup = (scheduled_pickup) => {
  if (!scheduled_pickup) return false;

  const selected = new Date(scheduled_pickup);
  const now = new Date();

  // Invalid date object
  if (isNaN(selected.getTime())) return false;

  // Must be in the future
  return selected.getTime() > now.getTime();
};

const openPayment = (delivery) => {
  setSelectedDelivery(delivery);
  setShowPayment(true);
};

const handlePaymentSuccess = async () => {
  try {
    await fetch(
      `http://127.0.0.1:8000/api/v1/deliveries/${selectedDelivery.id}/mark-paid`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    setShowPayment(false);
    setSelectedDelivery(null);

    fetchDeliveries(); // 🔥 reload from backend

  } catch (e) {
    alert("Failed to update payment status");
  }
};


const pickupPoint = formData.pickup_address
  ? { lat: formData.pickup_lat, lng: formData.pickup_lng }
  : null;

const dropoffPoint = formData.dropoff_address
  ? { lat: formData.dropoff_lat, lng: formData.dropoff_lng }
  : null;


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
                      pickup={pickupPoint}
                      dropoff={dropoffPoint}
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
              {!formData.pickup_address || !formData.dropoff_address ? (
                <div className="bg-slate-50 rounded-xl p-5 text-center border border-dashed border-slate-200">
                  <p className="text-sm font-semibold text-slate-500">
                    👋 Welcome!
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    Enter both addresses to get going 🚀
                  </p>
                </div>
              ) : (
                (fare || eta) && (
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
                )
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
                    min={new Date().toISOString().slice(0, 16)}
                    value={formData.scheduled_pickup} 
                    onChange={e => setFormData({...formData, scheduled_pickup: e.target.value})} 
                />
              </div>

              <button disabled={loading || !formData.pickup_address || !formData.dropoff_address||hasPendingPayment} type="submit" className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 ${
                hasPendingPayment
                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                :loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30'
              }`}>
                {hasPendingPayment ? "Complete Pending Payment" : <><span>Book Delivery</span><span>➜</span></>}
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
              {activeDeliveries.map(d => (
                <div key={d.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">

                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                    <div className="flex justify-between items-start mb-4">
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
                       {/* 🔹 INFO ICON */}
                        <button
                          onClick={() => toggleDetails(d.id)}
                          className="text-slate-400 hover:text-slate-700"
                          title="More details"
                        >
                          {expandedDeliveryId === d.id ? '▲' : 'ⓘ'}
                        </button>
                      </div>
                    
                      {/* 🔹 EXPANDED DETAILS */}
                      {/* {expandedDeliveryId === d.id && (
                        <div className="mt-4 bg-slate-50 p-4 rounded-xl border space-y-2 animate-fade-in">
                          <div className="flex justify-between text-sm">
                            <span>📅 Booked At</span>
                            <span>{new Date(d.created_at).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>⏱ Scheduled Pickup</span>
                            <span>
                              {d.scheduled_pickup
                                ? new Date(d.scheduled_pickup).toLocaleString('en-IN')
                                : 'Not scheduled'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>📏 Distance</span>
                            <span>{d.estimated_distance?.toFixed(1)} km</span>
                          </div>
                        </div>
                      )} */}

                      {expandedDeliveryId === d.id && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm animate-fade-in mt-6 bg-slate-50 rounded-xl border border-slate-100 p-4">
                  
                        {/* 2. Scheduled Pickup */}
                        <div className="flex items-start gap-2 relative group">
                          <span className="text-slate-400 mt-0.5">⏱️</span>

                          <div className="leading-tight">
                            {d.scheduled_pickup ? (
                              <>
                                <div className="font-semibold text-slate-700">
                                  {new Date(d.scheduled_pickup).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </div>
                                <div className="text-sm text-slate-500">
                                  {new Date(d.scheduled_pickup).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                </div>
                              </>
                            ) : (
                              <span className="font-semibold text-slate-700">Not scheduled</span>
                            )}
                          </div>

                          {/* Tooltip */}
                          <div className="absolute top-0 right-0 w-max translate-y-[-6px] translate-x-[10px] opacity-0 group-hover:opacity-100 bg-slate-400 text-white text-xs py-1 px-2 rounded-lg shadow-lg transition-opacity duration-200 pointer-events-none">
                            Scheduled Pickup
                          </div>
                        </div>


                        {/* 3. Distance */}
                        <div className="flex items-start gap-2 relative group">
                          <span className="text-slate-400">📏</span>
                          <span className="font-semibold text-slate-700">
                            {d.estimated_distance?.toFixed(1)} KM
                          </span>
                          {/* Tooltip */}
                          <div className="absolute top-0 right-0 w-max translate-y-[-6px] translate-x-[10px] opacity-0 group-hover:opacity-100 bg-slate-400 text-white text-xs py-1 px-2 rounded-lg shadow-lg transition-opacity duration-200 pointer-events-none">
                            Distance between points
                          </div>
                        </div>
                      </div>
                      )}


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

                  {(d.status === 'pending' || d.status === 'assigned') && (
                    <button
                      onClick={() => handleCancel(d.id)}
                      className="mt-4 w-full bg-red-100 text-red-600 py-2 rounded-lg font-bold hover:bg-red-200 transition"
                    >
                      Cancel Delivery
                    </button>
                  )}

                  {d.status === "completed" && d.new_payment_status !== "paid" && (
                    <button
                      onClick={() => openPayment(d)}
                      className="mt-4 w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600"
                    >
                      Pay ₹{d.actual_cost || d.estimated_cost}
                    </button>
                  )}


                  {d.payment_status === "paid" && (
                    <div className="mt-4 bg-emerald-50 text-emerald-600 py-2 rounded-xl text-center font-bold">
                      Paid ✅
                    </div>
                  )}

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
                        {d.assigned_driver.phone && (
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            📞 {d.assigned_driver.phone}
                          </p>
                        )}
                      </div>
                      <button className="bg-white border border-slate-200 text-slate-600 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {completedUnpaidDeliveries.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">
                    Payments Pending
                  </h3>

                  <div className="space-y-4">
                    {completedUnpaidDeliveries.map(d => (
                      <div
                        key={d.id}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <p className="text-sm font-bold text-slate-700">
                              Order ID: {d.id.substring(0, 8)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {d.pickup_address} → {d.dropoff_address}
                            </p>
                          </div>

                          <p className="text-xl font-extrabold text-emerald-600">
                            ₹{d.actual_cost || d.estimated_cost}
                          </p>
                        </div>

                        <button
                          onClick={() => openPayment(d)}
                          className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition"
                        >
                          Pay Now
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
         {showExpiredModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                Pickup Time Expired
              </h3>

              {expiredDelivery && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 text-sm">
                  <p className="font-semibold text-slate-700">
                    Order ID: {expiredDelivery.id.substring(0, 8)}
                  </p>

                  <p className="mt-1 text-slate-600">
                    <span className="font-medium">Pickup:</span>{" "}
                    {expiredDelivery.pickup_address}
                  </p>

                  <p className="mt-1 text-slate-600">
                    <span className="font-medium">Drop:</span>{" "}
                    {expiredDelivery.dropoff_address}
                  </p>

                  {expiredDelivery.scheduled_pickup && (
                    <p className="mt-2 text-red-600 font-medium">
                      Missed at{" "}
                      {new Date(expiredDelivery.scheduled_pickup).toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
              )}


              <p className="text-slate-600 mb-4">
                Scheduled pickup time has passed, no drivers are available.
                Would you like to continue the order or cancel?
              </p>

              {showRescheduleInput && (
                <input
                  type="datetime-local"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full border rounded-lg p-2 mb-4"
                />
              )}

              <div className="flex gap-3">
                {!showRescheduleInput ? (
                  <>
                    <button
                      onClick={handleContinueClick}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-bold"
                    >
                      Continue
                    </button>

                    <button
                      onClick={handleExpiredCancel}
                      className="flex-1 bg-red-100 text-red-600 py-2 rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleRescheduleSubmit}
                      className="flex-1 bg-green-600 text-white py-2 rounded-xl font-bold"
                    >
                      Confirm
                    </button>

                    <button
                      onClick={() => setShowRescheduleInput(false)}
                      className="flex-1 bg-slate-200 text-slate-600 py-2 rounded-xl font-bold"
                    >
                      Back
                    </button>
                  </>
                )}
          </div>
        </div>
      </div>
    )}

    {showPayment && selectedDelivery && (
      <PaymentModal
        amount={selectedDelivery.actual_cost || selectedDelivery.estimated_cost}
        onClose={() => setShowPayment(false)}
        onSuccess={handlePaymentSuccess}
      />
    )}

    </div>
  );
  
};

export default CustomerDashboard;