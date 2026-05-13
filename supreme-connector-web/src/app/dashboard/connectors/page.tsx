import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ConnectorsPage() {
  const connectorsSnap = await db.collection("connectors").orderBy("createdAt", "desc").get();
  
  const connectors = await Promise.all(connectorsSnap.docs.map(async (doc) => {
    const data = doc.data();
    let companyName = "Unknown";
    
    if (data.companyId) {
      const companyDoc = await db.collection("companies").doc(data.companyId).get();
      if (companyDoc.exists) {
        companyName = companyDoc.data()?.name || "Unknown";
      }
    }
    
    return {
      id: doc.id,
      ...data,
      companyName,
      lastSyncedAt: data.lastSyncedAt?.toDate() || null
    };
  }));

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Connectors</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-500 disabled:opacity-50" disabled>
          Register Connector (Use Agent CLI)
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-slate-500">Name</th>
              <th className="px-6 py-3 text-sm font-medium text-slate-500">Company</th>
              <th className="px-6 py-3 text-sm font-medium text-slate-500">Status</th>
              <th className="px-6 py-3 text-sm font-medium text-slate-500">Last Sync</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {connectors.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No connectors registered yet.</td>
              </tr>
            ) : connectors.map((c: any) => (
              <tr key={c.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 font-medium text-slate-900">{c.name}</td>
                <td className="px-6 py-4 text-slate-600">{c.companyName}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${c.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600 text-sm">
                  {c.lastSyncedAt ? new Date(c.lastSyncedAt).toLocaleString() : "Never"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
