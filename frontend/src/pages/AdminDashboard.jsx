import { useEffect, useState } from "react";
import { getAllCustomers, getAllDrivers } from "../services/adminApi";
import UserTable from "../components/admin/UserTable";
import RegistrationChart from "../components/admin/RegistrationChart";

export default function AdminDashboard() {
  const [view, setView] = useState("customers");
  const [data, setData] = useState([]);

  useEffect(() => {
    if (view === "customers") {
      getAllCustomers().then(res => setData(res.data));
    } else {
      getAllDrivers().then(res => setData(res.data));
    }
  }, [view]);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-6">
        Admin Dashboard
      </h1>

      {/* 🔽 DROPDOWN */}
      <select
        value={view}
        onChange={(e) => setView(e.target.value)}
        className="mb-6 px-4 py-2 rounded-lg border shadow-sm"
      >
        <option value="customers">Customers</option>
        <option value="drivers">Drivers</option>
      </select>

      {/* 📊 GRAPH */}
      <RegistrationChart />

      {/* 📋 TABLE */}
      <UserTable type={view} data={data} />
    </div>
  );
}
