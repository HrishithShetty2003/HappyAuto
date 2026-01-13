// import React, { useState, useEffect } from 'react';
// import { getUnassigned, getMyDeliveries, acceptDelivery, startTrip, completeTrip, updateDriverStatus } from '../services/api';
// import DriverTrackingMap from '../components/DriverTrackingMap';

// const DriverDashboard = () => {
//   const [isOnline, setIsOnline] = useState(false);
//   const [unassignedJobs, setUnassignedJobs] = useState([]);
//   const [myJobs, setMyJobs] = useState([]); 
  
//   // State to track which available job is currently selected/expanded
//   const [selectedAvailableJobId, setSelectedAvailableJobId] = useState(null);

//   useEffect(() => {
//     if(isOnline) {
//       const interval = setInterval(fetchJobs, 5000);
//       return () => clearInterval(interval);
//     }
//   }, [isOnline]);

//   const fetchJobs = async () => {
//     try {
//       const unassigned = await getUnassigned();
//       const mine = await getMyDeliveries();
      
//       const unassignedData = unassigned.data || [];
//       let myJobsData = mine.data || [];

//       // --- UPDATED SORTING LOGIC ---
//       // Priority: 1. in_transit, 2. assigned, 3. completed
//       const priorityMap = { 'in_transit': 1, 'assigned': 2, 'completed': 3 };
      
//       myJobsData.sort((a, b) => {
//         const pA = priorityMap[a.status] || 4; // Default to 4 if status unknown
//         const pB = priorityMap[b.status] || 4;
        
//         // First sort by Priority (Active > Assigned > Completed)
//         if (pA !== pB) {
//           return pA - pB;
//         }
        
//         // If same priority, sort by Newest (Descending ID)
//         return b.id - a.id;
//       });

//       setUnassignedJobs(unassignedData);
//       setMyJobs(myJobsData);
//     } catch (e) { console.error(e); }
//   };

//   const toggleStatus = async () => {
//     const newStatus = !isOnline;
//     setIsOnline(newStatus);
//     await updateDriverStatus({ is_available: newStatus, current_status: newStatus ? 'online' : 'offline' });
//     if (newStatus) fetchJobs();
//   };

//   const handleAccept = async (id) => {
//     await acceptDelivery(id);
//     fetchJobs();
//     // Clear selection after accepting
//     setSelectedAvailableJobId(null);
//   };

//   const handleAction = async (id, action) => {
//     if (action === 'start') await startTrip(id);
//     if (action === 'complete') await completeTrip(id);
//     fetchJobs();
//   };

//   // --- CANCEL LOGIC ---
//   const handleCancel = async (id) => {
//     const confirm = window.confirm("Are you sure you want to cancel this delivery? It will return to the available list.");
//     if (!confirm) return;

//     try {
//       const token = localStorage.getItem('access_token');
//       await fetch(`http://127.0.0.1:8000/api/v1/deliveries/${id}`, {
//         method: 'PUT', // Or PATCH depending on your backend
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({ status: 'pending' }) // Reverting to pending moves it to available list
//       });
//       fetchJobs(); // Refresh to move job to available list
//     } catch (e) {
//       alert('Failed to cancel delivery: ' + (e.message || 'Unknown error'));
//     }
//   };

//   return (
//     <div className="max-w-6xl mx-auto pt-24 pb-12 px-4 sm:px-6">
      
//       {/* Header & Status Toggle */}
//       <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
//         <div>
//           <h1 className="text-3xl font-extrabold text-slate-900">Driver Dashboard</h1>
//           <p className="text-slate-500 mt-1">Manage your earnings and deliveries</p>
//         </div>

//         <button 
//           onClick={toggleStatus} 
//           className={`relative group w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-500 transform hover:scale-105 border-4 ${isOnline ? 'bg-green-500 border-green-600 shadow-green-500/40' : 'bg-slate-200 border-slate-300 shadow-slate-300/40'}`}
//         >
//           <span className={`text-4xl mb-1 transition-all duration-300 ${isOnline ? 'animate-bounce' : ''}`}>{isOnline ? '🟢' : '🔴'}</span>
//           <span className={`font-bold text-sm tracking-wide ${isOnline ? 'text-white' : 'text-slate-500'}`}>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
//           {isOnline && (
//             <span className="absolute inset-0 rounded-full bg-green-500 opacity-75 animate-ping"></span>
//           )}
//         </button>
//       </div>

//       {/* Grid Layout */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
//         {/* Available Jobs Column */}
//         <div className="space-y-6">
//           <div className="flex items-center justify-between gap-3">
//             <div className="flex items-center gap-3">
//                 <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
//                 </div>
//                 <h2 className="text-xl font-bold text-slate-800">Available Deliveries</h2>
//             </div>
//             <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">Tap card to view map</span>
//           </div>

//           {!isOnline ? (
//             <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-slate-300 text-center text-slate-400">
//               Go online to see new delivery opportunities.
//             </div>
//           ) : unassignedJobs.length === 0 ? (
//              <div className="bg-white p-8 rounded-2xl shadow-sm text-center text-slate-500">
//                <p className="mb-2">🔍</p>
//                No jobs nearby right now. Check back soon!
//              </div>
//           ) : (
//             unassignedJobs.map(job => (
//               <div 
//                 key={job.id} 
//                 onClick={() => setSelectedAvailableJobId(job.id === selectedAvailableJobId ? null : job.id)}
//                 className={`bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border-l-4 transition-all duration-300 cursor-pointer hover:shadow-xl overflow-hidden ${job.id === selectedAvailableJobId ? 'border-amber-500 ring-2 ring-amber-100' : 'border-slate-200'}`}
//               >
//                 <div className="flex justify-between items-center mb-4">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2">
//                         <div className="text-2xl font-bold text-slate-900">₹{job.estimated_cost}</div>
//                         <div className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
//                             {Math.round(job.estimated_distance)} KM
//                         </div>
//                     </div>
//                   </div>
//                   {/* Expand/Collapse Icon */}
//                   <div className={`transform transition-transform duration-300 text-slate-400 ${job.id === selectedAvailableJobId ? 'rotate-180' : ''}`}>
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
//                   </div>
//                 </div>
                
//                 <div className="space-y-3 mb-4">
//                   <div className="flex items-start gap-3">
//                     <div className="mt-1 w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
//                     <p className="text-sm font-medium text-slate-700">{job.pickup_address}</p>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <div className="mt-1 w-2 h-2 rounded-full bg-slate-900 shrink-0"></div>
//                     <p className="text-sm font-medium text-slate-700">{job.dropoff_address}</p>
//                   </div>
//                 </div>

//                 {/* CONDITIONAL MAP DISPLAY */}
//                 {job.id === selectedAvailableJobId && (
//                   <div className="mb-6 animate-fade-in">
//                     <DriverTrackingMap 
//                         pickup={{ lat: job.pickup_lat, lng: job.pickup_lng }}
//                         dropoff={{ lat: job.dropoff_lat, lng: job.dropoff_lng }}
//                     />
//                     <p className="text-center text-xs text-slate-400 mt-2">Pickup (Green) & Dropoff (Red) centered</p>
//                   </div>
//                 )}

//                 <div onClick={(e) => e.stopPropagation()}> {/* Prevent card toggle when clicking button */}
//                     <button 
//                     onClick={() => handleAccept(job.id)}
//                     className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-lg"
//                     >
//                     <span>Accept Job</span>
//                     <span>→</span>
//                     </button>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>

//         {/* My Active Jobs Column */}
//         <div className="space-y-6">
//            <div className="flex items-center gap-3">
//             <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
//             </div>
//             <h2 className="text-xl font-bold text-slate-800">My Active Jobs</h2>
//           </div>

//           {myJobs.length === 0 ? (
//             <div className="bg-white p-8 rounded-2xl shadow-sm text-center text-slate-500">
//               <p className="mb-2">🧾</p>
//               You have no active deliveries.
//             </div>
//           ) : (
//             myJobs.map(job => (
//               <div key={job.id} className="bg-white rounded-2xl p-6 shadow-lg shadow-blue-100/50 border-l-4 border-blue-500 relative overflow-hidden">
//                 <div className="flex justify-between items-start mb-4">
//                   <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${job.status === 'in_transit' ? 'bg-blue-100 text-blue-700' : job.status === 'assigned' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
//                     {job.status.replace('_', ' ')}
//                   </div>
//                   <div className="text-xl font-bold text-slate-900">₹{job.estimated_cost}</div>
//                 </div>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
//                    {/* Left Side: Text Details */}
//                   <div className="space-y-4">
//                     <div className="flex items-start gap-3">
//                       <div className="mt-1 w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
//                       <p className="text-sm font-medium text-slate-700">{job.pickup_address}</p>
//                     </div>
//                     <div className="flex items-start gap-3">
//                       <div className="mt-1 w-2 h-2 rounded-full bg-slate-900 shrink-0"></div>
//                       <p className="text-sm font-medium text-slate-700">{job.dropoff_address}</p>
//                     </div>
//                   </div>
                  
//                   {/* Right Side: Map - Always Visible for Active Jobs */}
//                   <div className="space-y-2">
//                     <h5 className="text-sm font-bold text-slate-700">Live Tracking</h5>
//                     <DriverTrackingMap 
//                       pickup={{ lat: job.pickup_lat, lng: job.pickup_lng }}
//                       dropoff={{ lat: job.dropoff_lat, lng: job.dropoff_lng }}
//                     />
//                   </div>
                
//                 {/* BUTTONS ROW - UPDATED FOR CANCEL VISIBILITY */}
//                 <div className="flex gap-3 mt-4">
//                   {/* Only show START if status is assigned */}
//                   {job.status === 'assigned' && (
//                     <button onClick={() => handleAction(job.id, 'start')} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition">START TRIP</button>
//                   )}
                  
//                   {/* Only show COMPLETE if status is in_transit */}
//                   {job.status === 'in_transit' && (
//                     <button onClick={() => handleAction(job.id, 'complete')} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-600/30 transition">COMPLETE</button>
//                   )}
                  
//                   {/* ONLY SHOW CANCEL IF in_transit OR assigned */}
//                   {(job.status === 'in_transit' || job.status === 'assigned') && (
//                     <button onClick={() => handleCancel(job.id)} className="flex-1 bg-red-100 text-red-600 py-3 rounded-xl font-bold hover:bg-red-200 border border border-red-200 transition">CANCEL</button>
//                   )}
//                 </div>
//               </div>
//             </div>
//             ))
//           )}
//         </div>

//       </div>
//     </div>
//   );
// };

// export default DriverDashboard;

import React, { useState, useEffect } from 'react';
import {
  getUnassigned,
  getMyDeliveries,
  acceptDelivery,
  startTrip,
  completeTrip,
  updateDriverStatus
} from '../services/api';
import DriverTrackingMap from '../components/DriverTrackingMap';

const formatPickupTime = (isoString) => {
  if (!isoString) return "Not scheduled";

  const date = new Date(isoString);

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
};

const canCancelDelivery = (scheduledPickup) => {
  if (!scheduledPickup) return false;

  const now = new Date();
  const pickupTime = new Date(scheduledPickup);

  const diffMs = pickupTime - now;
  const diffMinutes = diffMs / (1000 * 60);

  return diffMinutes > 15;
};

const DriverDashboard = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [unassignedJobs, setUnassignedJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [selectedAvailableJobId, setSelectedAvailableJobId] = useState(null);

  useEffect(() => {
    if (isOnline) {
      const interval = setInterval(fetchJobs, 5000);
      return () => clearInterval(interval);
    }
  }, [isOnline]);

  const fetchJobs = async () => {
    try {
      const unassigned = await getUnassigned();
      const mine = await getMyDeliveries();

      const priority = { in_transit: 1, assigned: 2, completed: 3 };

      const sortedMine = (mine.data || []).sort((a, b) => {
        const pA = priority[a.status] || 9;
        const pB = priority[b.status] || 9;
        return pA !== pB ? pA - pB : b.id.localeCompare(a.id);
      });

      setUnassignedJobs(unassigned.data || []);
      setMyJobs(sortedMine);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleStatus = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    await updateDriverStatus({
      is_available: newStatus,
      current_status: newStatus ? 'online' : 'offline'
    });
    if (newStatus) fetchJobs();
  };

  const handleAccept = async (id) => {
    await acceptDelivery(id);
    setSelectedAvailableJobId(null);
    fetchJobs();
  };

  const handleAction = async (id, action) => {
    if (action === 'start') await startTrip(id);
    if (action === 'complete') await completeTrip(id);
    fetchJobs();
  };

  const handleCancel = async (id) => {
  const confirmCancel = window.confirm(
    "You can cancel only if pickup is more than 15 minutes away. Continue?"
  );
  if (!confirmCancel) return;

  try {
    const token = localStorage.getItem("access_token");

    const res = await fetch(
      `http://127.0.0.1:8000/api/v1/deliveries/${id}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.detail || "Cancel failed");
      return;
    }

    // Refresh both lists
    fetchJobs();

  } catch (e) {
    alert("Network error while cancelling");
  }
};


  return (
    <div className="max-w-6xl mx-auto pt-24 pb-12 px-4 sm:px-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Driver Dashboard</h1>
          <p className="text-slate-500">Manage your deliveries</p>
        </div>

        <button
          onClick={toggleStatus}
          className={`w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 shadow-xl ${
            isOnline
              ? 'bg-green-500 border-green-600 text-white'
              : 'bg-slate-200 border-slate-300 text-slate-600'
          }`}
        >
          <span className="text-3xl">{isOnline ? '🟢' : '🔴'}</span>
          <span className="font-bold">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AVAILABLE DELIVERIES */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Available Deliveries</h2>

          {unassignedJobs.map(job => (
            <div
              key={job.id}
              onClick={() =>
                setSelectedAvailableJobId(
                  selectedAvailableJobId === job.id ? null : job.id
                )
              }
              className="bg-white p-6 rounded-2xl shadow border-l-4 border-slate-200 cursor-pointer"
            >
              <div className="flex justify-between mb-3">
                <div className="text-2xl font-bold">₹{job.estimated_cost}</div>
                <div className="text-sm bg-slate-100 px-2 py-1 rounded">
                  {job.estimated_distance?.toFixed(1)} km
                </div>
              </div>

              <p className="text-sm font-medium">📍 {job.pickup_address}</p>
              <p className="text-sm font-medium">🏁 {job.dropoff_address}</p>

              <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                <span>🕒</span>
                <span>
                  Pickup at <strong>{formatPickupTime(job.scheduled_pickup)}</strong>
                </span>
              </div>

              {/* CUSTOMER INFO */}
              <div className="mt-3 bg-slate-50 p-3 rounded-lg text-sm">
                <p>👤 {job.customer?.name || 'Customer'}</p>
                {job.customer?.phone && <p>📞 {job.customer.phone}</p>}
                <p className="mt-1">
                  ⏱ {job.estimated_time?.toFixed(0)} mins
                </p>
              </div>

              {selectedAvailableJobId === job.id && (
                <div className="mt-4">
                  <DriverTrackingMap
                    pickup={{ lat: job.pickup_lat, lng: job.pickup_lng }}
                    dropoff={{ lat: job.dropoff_lat, lng: job.dropoff_lng }}
                  />
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAccept(job.id);
                }}
                className="mt-4 w-full bg-slate-900 text-white py-3 rounded-xl font-bold"
              >
                Accept Job →
              </button>
            </div>
          ))}
        </div>

        {/* MY ACTIVE JOBS */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">My Active Jobs</h2>

          {myJobs.map(job => (
            <div
              key={job.id}
              className="bg-white p-6 rounded-2xl shadow border-l-4 border-blue-500"
            >
              <div className="flex justify-between mb-3">
                <span className="text-xs font-bold uppercase">
                  {job.status.replace('_', ' ')}
                </span>
                <span className="text-xl font-bold">₹{job.estimated_cost}</span>
              </div>

              <p className="text-sm">📍 {job.pickup_address}</p>
              <p className="text-sm">🏁 {job.dropoff_address}</p>

              <div className="flex items-center gap-2 text-xs text-slate-600 mt-3">
                <span>🕒</span>
                <span>
                  Scheduled Pickup:{" "}
                  <strong>{formatPickupTime(job.scheduled_pickup)}</strong>
                </span>
              </div>


              {/* CUSTOMER INFO */}
              <div className="mt-3 bg-blue-50 p-3 rounded-lg text-sm">
                <p>👤 {job.customer?.name || 'Customer'}</p>
                {job.customer?.phone && <p>📞 {job.customer.phone}</p>}

                {job.status === 'assigned' && (
                  <p className="mt-1">
                    📏 {job.estimated_distance?.toFixed(1)} km · ⏱{' '}
                    {job.estimated_time?.toFixed(0)} mins
                  </p>
                )}
              </div>

              <div className="mt-4">
                <DriverTrackingMap
                  pickup={{ lat: job.pickup_lat, lng: job.pickup_lng }}
                  dropoff={{ lat: job.dropoff_lat, lng: job.dropoff_lng }}
                />
              </div>

              <div className="flex gap-3 mt-4">
                {job.status === 'assigned' && (
                  <button
                    onClick={() => handleAction(job.id, 'start')}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold"
                  >
                    START TRIP
                  </button>
                )}
                {job.status === 'in_transit' && (
                  <button
                    onClick={() => handleAction(job.id, 'complete')}
                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold"
                  >
                    COMPLETE
                  </button>
                )}
                {job.status === 'assigned' && (
                  <button
                    disabled={!canCancelDelivery(job.scheduled_pickup)}
                    onClick={() => handleCancel(job.id)}
                    className={`flex-1 py-3 rounded-xl font-bold transition
                      ${
                        canCancelDelivery(job.scheduled_pickup)
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                  >
                    {canCancelDelivery(job.scheduled_pickup)
                      ? 'CANCEL'
                      : 'CANCEL LOCKED (≤15 min)'}
                  </button>
                )}


                {/* {job.status === "assigned" && (
                  <div className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                    Pickup Scheduled
                  </div>
                )} */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
