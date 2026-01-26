export default function UserTable({ type, data }) {
  return (
    <div className="bg-white rounded-xl shadow mt-8 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Phone</th>
            {type === "drivers" && <th className="p-3">Vehicle</th>}
            {type === "drivers" && <th className="p-3">Rating</th>}
            <th className="p-3">Joined</th>
          </tr>
        </thead>

        <tbody>
          {data.map((u) => (
            <tr key={u.id} className="border-t hover:bg-slate-50">
              <td className="p-3 font-medium">{u.name}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3">{u.phone}</td>

              {type === "drivers" && (
                <>
                  <td className="p-3 text-center">
                    {u.vehicle_number || "—"}
                  </td>
                  <td className="p-3 text-center">
                    ⭐ {u.rating ?? "N/A"}
                  </td>
                </>
              )}

              <td className="p-3 text-center">
                {new Date(u.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
