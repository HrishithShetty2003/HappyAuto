import React, { useEffect, useState } from "react";
import { getCompletedDeliveries } from "../services/api";

const CustomerSummary = () => {
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getCompletedDeliveries();
        // const all = res.data || [];

        // const completedOnly = all.filter(
        //   d => d.status === "completed"
        // );

        setCompleted(res.data || []);
      } catch (e) {
        console.error("Failed to load summary", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Order Summary
        </h1>
        <p className="text-slate-500 mt-1">
          History of your completed deliveries
        </p>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            Loading summary…
          </div>
        ) : completed.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📦</div>
            <h3 className="font-bold text-slate-900">
              No completed deliveries yet
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              Your completed orders will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Order</th>
                  <th className="px-4 py-3 text-left">Route</th>
                  <th className="px-4 py-3 text-left">Scheduled Pickup</th>
                  <th className="px-4 py-3 text-left">Driver</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {completed.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    {/* Order ID */}
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">
                      {d.id.slice(0, 8)}
                    </td>

                    {/* Route */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">
                        {d.pickup_address}
                      </p>
                      <p className="text-xs text-slate-500">
                        → {d.dropoff_address}
                      </p>
                    </td>

                    {/* Scheduled Pickup */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">
                        {new Date(d.scheduled_pickup).toLocaleDateString("en-IN")}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(d.scheduled_pickup).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true
                        })}
                      </p>
                    </td>

                    {/* Driver */}
                    <td className="px-4 py-3">
                      {d.assigned_driver ? (
                        <>
                          <p className="font-medium text-slate-800">
                            {d.assigned_driver.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            📞 {d.assigned_driver.phone || "N/A"}
                          </p>
                        </>
                      ) : (
                        <span className="text-slate-400 text-xs">
                          Not available
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      ₹{d.estimated_cost}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSummary;
