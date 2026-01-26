import React, { useEffect, useState } from "react";
import { getDriverCompletedDeliveries } from "../services/api";

const DriverSummary = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await getDriverCompletedDeliveries();
        setDeliveries(res.data || []);
      } catch (e) {
        console.error("Failed to load summary", e);
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  if (loading) {
    return <div className="pt-24 text-center text-slate-500">Loading summary…</div>;
  }

  return (
    <div className="max-w-7xl mx-auto pt-24 pb-12 px-4">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-6">
        Delivery Summary
      </h1>

      {deliveries.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow border border-dashed text-center">
          <p className="text-slate-500 font-medium">
            No completed deliveries yet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow border">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Pickup</th>
                <th className="px-4 py-3 text-left">Dropoff</th>
                <th className="px-4 py-3">Scheduled</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Income Earned</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {deliveries.map(d => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs">
                    {d.id.slice(0, 8)}
                  </td>

                  <td className="px-4 py-3">
                    {d.pickup_address}
                  </td>

                  <td className="px-4 py-3">
                    {d.dropoff_address}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {new Date(d.scheduled_pickup).toLocaleString("en-IN")}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className="font-semibold">{d.customer?.name}</div>
                    <div className="text-xs text-slate-500">
                      {d.customer?.phone}
                    </div>
                  </td>
                  
                  
                  <td className="px-4 py-3 text-center font-bold text-green-600">
                    {/* ₹{d.actual_cost ?? d.estimated_cost} */}
                    ₹{(d.estimated_cost * 0.75).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DriverSummary;
