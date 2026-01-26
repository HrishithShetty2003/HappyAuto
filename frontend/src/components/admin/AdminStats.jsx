const AdminStats = () => {
  const stats = [
    { label: "Total Users", value: 200 },
    { label: "Active Drivers", value: 68 },
    { label: "Completed Deliveries", value: 412 },
    { label: "Revenue", value: "₹48,000" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white rounded-2xl p-6 shadow-sm border"
        >
          <p className="text-xs font-bold text-slate-500 uppercase">
            {s.label}
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default AdminStats;
