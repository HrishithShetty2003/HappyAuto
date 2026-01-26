import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Nov", users: 60, drivers: 20 },
  { month: "Dec", users: 70, drivers: 25 },
  { month: "Jan", users: 70, drivers: 25 },
];

const RegistrationChart = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border">
      <h3 className="text-lg font-bold text-slate-800 mb-4">
        Monthly Registrations
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="users" fill="#f59e0b" name="Customers" />
          <Bar dataKey="drivers" fill="#3b82f6" name="Drivers" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RegistrationChart;
