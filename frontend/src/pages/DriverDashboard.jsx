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

// const isPickupTimeValid = (scheduledPickup) => {
//   if (!scheduledPickup) return true; // safety fallback
//   return new Date(scheduledPickup).getTime() > Date.now();
// };


// const canCancelDelivery = (scheduledPickup) => {
//   if (!scheduledPickup) return false;

//   const now = new Date();
//   const pickupTime = new Date(scheduledPickup);

//   const diffMs = pickupTime - now;
//   const diffMinutes = diffMs / (1000 * 60);

//   return diffMinutes > 15;
// };



const DriverDashboard = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [unassignedJobs, setUnassignedJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [selectedAvailableJobId, setSelectedAvailableJobId] = useState(null);
  const [prevJobIds, setPrevJobIds] = useState([]);

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

    const unassignedData = (unassigned.data || []).filter(
      // job.status !== 'cancelled' && isPickupTimeValid(job.scheduled_pickup)
      job => job.status === 'pending'
    );

    const myJobsData = mine.data || [];
    const currentIds = myJobsData.map(j => j.id);

    prevJobIds.forEach(prevId => {
      if (!currentIds.includes(prevId)) {
        alert("❌ A delivery was cancelled!.");
      }
    });

    const priorityMap = { 'in_transit': 1, 'assigned': 2, 'completed': 3 };

    myJobsData.sort((a, b) => {
      const pA = priorityMap[a.status] || 4;
      const pB = priorityMap[b.status] || 4;
      return pA !== pB ? pA - pB : b.id - a.id;
    });

    setUnassignedJobs(unassignedData);
    setPrevJobIds(currentIds);
    setMyJobs(myJobsData);
  } catch (e) {
    console.error(e);
  }
  };

  const hasActiveJob = myJobs.some(job =>
    job.status === "assigned" || job.status === "in_transit"
  );

  const toggleStatus = async () => {
    if (isOnline && hasActiveJob) {
      alert("You must complete your current delivery before going offline.");
      return;
    }
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
    try{
      if (action === 'start') await startTrip(id);
      if (action === 'complete') await completeTrip(id);
      fetchJobs();
    }catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Unable to start trip. Please try again.";
      alert(msg);
    }
  };

  const handleCancel = async (job) => {
  let warning = "Are you sure you want to cancel this delivery?";

  if (job.status === "in_transit") {
    warning = "Cancelling during delivery will incur a ₹100 fine. Continue?";
  } else if (job.scheduled_pickup) {
    const diff =
      (new Date(job.scheduled_pickup) - new Date()) / (1000 * 60);

    if (diff <= 5) {
      warning = "Cancelling within 5 minutes of pickup will incur a ₹100 fine. Continue?";
    }
  }

  if (!window.confirm(warning)) return;

  try {
    const token = localStorage.getItem("access_token");

    const res = await fetch(
      `http://127.0.0.1:8000/api/v1/deliveries/${job.id}/driver-cancel`,
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

    if (data.fine && data.fine > 0) {
      alert(`Delivery cancelled. ₹${data.fine} fine has been applied.`);
    }

    fetchJobs(); // refresh dashboard
  } catch {
    alert("Network error while cancelling");
  }
};

// const canStartTrip = (job) => {
//   return job.status === "assigned";
// };

const activeJobs = myJobs.filter(
  j => j.status === "assigned" || j.status === "in_transit"
);

const recentCompletedJobs = myJobs
  .filter(j => j.status === "completed")
  .sort(
    (a, b) =>
      new Date(b.actual_delivery || b.created_at) -
      new Date(a.actual_delivery || a.created_at)
  )
  .slice(0, 3);


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

          {!isOnline ? (
            <div className="bg-white p-8 rounded-2xl border-2 border-dashed text-center text-slate-400">
              Go online to see new delivery opportunities.
            </div>
          ) : unassignedJobs.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center text-slate-500">
              <p className="text-3xl mb-2">📭</p>
              <p className="font-semibold">No active deliveries available currently</p>
              <p className="text-xs mt-1 text-slate-400">
                New requests will appear here automatically
              </p>
            </div>
          ) : (
            unassignedJobs.map(job => (
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
            )))
          }
      </div>

        {/* MY ACTIVE JOBS */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">My Active Jobs</h2>
          {activeJobs.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center text-slate-400">
              No active deliveries
            </div>
          ) : (
          activeJobs.map(job => (
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
                  <div className="flex-1 flex flex-col gap-1">
                    <button
                      onClick={() => handleAction(job.id, 'start')}
                      className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700"
                    >
                      START TRIP
                    </button>

                    <p className="text-xs text-slate-500 text-center">
                      Start at scheduled pickup time
                    </p>

                  </div>
                )}

                {job.status === 'in_transit' && (
                  <button
                    onClick={() => handleAction(job.id, 'complete')}
                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold"
                  >
                    COMPLETE
                  </button>
                )}
                {["pending", "assigned", "in_transit"].includes(job.status) && (
                  <button
                    onClick={() => handleCancel(job)}
                    className="flex-1 py-3 rounded-xl font-bold bg-red-100 text-red-600 hover:bg-red-200"
                  >
                    CANCEL
                  </button>
                )}



                {/* {job.status === "assigned" && (
                  <div className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                    Pickup Scheduled
                  </div>
                )} */}
              </div>
            </div>
          )))}
        </div>
      </div>

      {recentCompletedJobs.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">
            Recently Completed Deliveries
          </h2>

          <div className="flex gap-6 overflow-x-auto pb-2">
            {recentCompletedJobs.map(job => (
              <div
                key={job.id}
                className="min-w-[320px] bg-white p-4 rounded-2xl shadow border border-slate-100"
              >
                {/* HEADER */}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold uppercase text-emerald-600">
                    Completed
                  </span>
                  <span className="text-sm font-bold">
                    ₹{job.actual_cost || job.estimated_cost}
                  </span>
                </div>

                {/* ADDRESSES */}
                <p className="text-sm">📍 {job.pickup_address}</p>
                <p className="text-sm">🏁 {job.dropoff_address}</p>

                {/* CUSTOMER */}
                <div className="mt-2 text-xs text-slate-600">
                  👤 {job.customer?.name || "Customer"}
                  {job.customer?.phone && ` · 📞 ${job.customer.phone}`}
                </div>

                {/* MAP (compact) */}
                <div className="mt-3 h-40 rounded-xl overflow-hidden">
                  <DriverTrackingMap
                    pickup={{ lat: job.pickup_lat, lng: job.pickup_lng }}
                    dropoff={{ lat: job.dropoff_lat, lng: job.dropoff_lng }}
                  />
                </div>

                {/* FOOTER */}
                <div className="mt-2 text-xs text-slate-500 text-right">
                  {job.actual_delivery
                    ? new Date(job.actual_delivery).toLocaleString("en-IN")
                    : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


    </div>
  );
};

export default DriverDashboard;
