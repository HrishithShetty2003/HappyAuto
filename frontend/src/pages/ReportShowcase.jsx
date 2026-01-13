import React from 'react';

const ReportShowcase = () => {
  
  // --- Mock Data ---
  const availableDeliveries = [
    {
      id: 'D001',
      cost: 150,
      distance: 4.2,
      pickup: 'Tech Park Main Gate',
      dropoff: 'City Center Mall'
    },
    {
      id: 'D002',
      cost: 85,
      distance: 1.5,
      pickup: 'Railway Station',
      dropoff: 'Bus Stand'
    },
    {
      id: 'D003',
      cost: 220,
      distance: 6.0,
      pickup: 'Airport Terminal 2',
      dropoff: 'Grand Hotel'
    }
  ];

  const activeDriverJobs = [
    {
      id: 'D004',
      status: 'in_transit', // or 'assigned', 'completed'
      cost: 120,
      pickup: 'MG Road Metro',
      dropoff: 'Indiranagar 100ft Road',
      customer: 'Rahul Verma'
    }
  ];

  const onlineDrivers = [
    { id: 1, name: 'Ramesh Kumar', vehicle: 'KA-01-AB-1234', rating: 4.8, distance: '0.5 km' },
    { id: 2, name: 'Suresh P.', vehicle: 'KA-01-XY-9999', rating: 4.5, distance: '1.2 km' },
    { id: 3, name: 'Vikram Singh', vehicle: 'KA-05-ZZ-5555', rating: 4.2, distance: '2.0 km' },
    { id: 4, name: 'Anil Das', vehicle: 'KA-03-AA-1111', rating: 4.9, distance: '0.8 km' },
  ];

  const activeCustomerBookings = [
    {
      id: 'D004',
      status: 'assigned',
      cost: 120,
      pickup: 'MG Road Metro',
      dropoff: 'Indiranagar 100ft Road',
      driver: 'Ramesh Kumar',
      vehicle: 'KA-01-AB-1234',
      eta: '15 mins'
    },
    {
      id: 'D005',
      status: 'completed',
      cost: 85,
      pickup: 'Forum Mall',
      dropoff: 'Koramangala',
      driver: 'Suresh P.',
      vehicle: 'KA-01-XY-9999',
      eta: 'Delivered'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4 font-sans">
      <div className="max-w-7xl mx-auto space-y-20">

        {/* --- REPORT HEADER --- */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-900">HappyAuto</h1>
          <p className="text-slate-500">Services That Bring A Smile</p>
        </div>

        {/* ==================================================== */}
        {/* DRIVER DASHBOARD SECTION */}
        {/* ==================================================== */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-slate-900 rounded"></div>
            <h2 className="text-3xl font-bold text-slate-900">Driver Dashboard </h2>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 relative overflow-hidden">
            
            {/* Top Bar & Status */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Good Morning, Ramesh</h3>
                <p className="text-slate-500">Ready to earn?</p>
              </div>
              
              {/* STATUS TOGGLE BUTTON (Online) */}
              <button className="relative group w-36 h-36 rounded-full bg-green-500 shadow-2xl shadow-green-500/40 border-4 border-green-600 flex flex-col items-center justify-center text-white transition-all">
                <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></span>
                <span className="text-5xl mb-1 relative z-10">🟢</span>
                <span className="font-bold text-lg tracking-wide relative z-10">ONLINE</span>
                <span className="text-xs opacity-80 relative z-10">Waiting for jobs</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              
              {/* Available Deliveries */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-600 p-2 rounded-lg">📜</span>
                  Available Deliveries
                </h4>
                
                <div className="space-y-4">
                  {availableDeliveries.map(job => (
                    <div key={job.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border-l-4 border-amber-500">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-2xl font-bold text-slate-900">₹{job.cost}</span>
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase">{job.distance} KM</span>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          {job.pickup}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
                          {job.dropoff}
                        </div>
                      </div>
                      <button className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-bold hover:bg-slate-800 transition">
                        ACCEPT JOB
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Delivery Status */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">📦</span>
                  Active Job Status
                </h4>

                {activeDriverJobs.map(job => (
                  <div key={job.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md border-l-4 border-blue-500">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                           {job.status.replace('_', ' ')}
                        </span>
                        <p className="text-xs text-slate-400 mt-1">Customer: {job.customer}</p>
                      </div>
                      <div className="text-xl font-bold text-slate-900">₹{job.cost}</div>
                    </div>

                    {/* Status Progress */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm">✓</div>
                        <p className="text-sm font-medium text-slate-500 line-through">Assigned</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/30 animate-pulse">2</div>
                        <p className="text-sm font-bold text-blue-600">In Transit</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-sm">3</div>
                        <p className="text-sm font-medium text-slate-400">Completed</p>
                      </div>
                    </div>

                    <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/30">
                      COMPLETE TRIP
                    </button>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>


        {/* ==================================================== */}
        {/* CUSTOMER DASHBOARD SECTION */}
        {/* ==================================================== */}
        <section>
           <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-amber-500 rounded"></div>
            <h2 className="text-3xl font-bold text-slate-900">Customer Dashboard</h2>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
            
            {/* View Online Drivers */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-bold text-slate-800">Available Drivers Nearby</h4>
                <span className="text-sm text-slate-500">4 drivers found</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {onlineDrivers.map(driver => (
                  <div key={driver.id} className="border border-slate-200 rounded-xl p-4 text-center hover:border-amber-300 hover:shadow-lg transition cursor-pointer group">
                    <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-3 overflow-hidden border-2 border-white shadow-sm">
                      <img src={`https://ui-avatars.com/api/?name=${driver.name}&background=random`} alt="Driver" className="w-full h-full object-cover" />
                    </div>
                    <h5 className="font-bold text-slate-900 text-sm">{driver.name}</h5>
                    <div className="flex items-center justify-center gap-1 text-xs text-amber-500 my-1">
                      ★ {driver.rating}
                    </div>
                    <p className="text-xs text-slate-500 font-mono bg-slate-100 inline-block px-2 py-0.5 rounded">{driver.vehicle}</p>
                    <p className="text-xs text-green-600 mt-2 font-medium">{driver.distance} away</p>
                    
                    {/* Hover Effect Action */}
                    <button className="mt-3 w-full bg-white border border-slate-300 text-slate-700 text-xs font-bold py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      BOOK
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Deliveries & Status */}
            <div className="space-y-6">
               <div className="flex justify-between items-center mb-4">
                <h4 className="text-xl font-bold text-slate-800">My Deliveries</h4>
              </div>

              {activeCustomerBookings.map(booking => (
                <div key={booking.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  
                  {/* Status Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <div className="flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm ${booking.status === 'assigned' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                         {booking.status === 'assigned' ? '🚛' : '✅'}
                       </div>
                       <div>
                         <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider mb-1 inline-block ${booking.status === 'assigned' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                           {booking.status}
                         </span>
                         <p className="text-xs text-slate-400 font-mono">ID: {booking.id}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-2xl font-bold text-slate-900">₹{booking.cost}</p>
                       <p className="text-sm text-slate-500">Estimated Cost</p>
                    </div>
                  </div>

                  {/* Route Visualization */}
                  <div className="relative pl-8 border-l-2 border-slate-200 space-y-6 mb-6">
                    <div className="relative">
                      <div className="absolute -left-[35px] top-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white shadow-sm"></div>
                      <p className="text-sm font-bold text-slate-800">{booking.pickup}</p>
                      <p className="text-xs text-slate-500">Pickup Point</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[35px] top-1 w-4 h-4 bg-slate-800 rounded-full border-2 border-white shadow-sm"></div>
                      <p className="text-sm font-bold text-slate-800">{booking.dropoff}</p>
                      <p className="text-xs text-slate-500">Destination</p>
                    </div>
                  </div>

                  {/* Driver Details Card */}
                  {booking.status === 'assigned' && (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden">
                           <img src={`https://ui-avatars.com/api/?name=${booking.driver}&background=random`} alt="Driver" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{booking.driver}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                             🛺 {booking.vehicle}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-blue-600">{booking.eta}</p>
                        <p className="text-xs text-slate-400">Arriving</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};

export default ReportShowcase;