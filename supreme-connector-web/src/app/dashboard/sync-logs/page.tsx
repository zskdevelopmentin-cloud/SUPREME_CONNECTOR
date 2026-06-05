import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SyncLogsPage() {
  const token = cookies().get("token")?.value;
  const payload = token ? await verifyJwt(token) : null;

  if (!payload) {
    redirect("/login");
  }

  const logsSnap = await db.collection("sync_logs").orderBy("createdAt", "desc").limit(100).get();
  
  const logs = await Promise.all(logsSnap.docs.map(async (doc) => {
    const data = doc.data();
    let connectorName = "Unknown";
    
    if (data.connectorId) {
      const connDoc = await db.collection("connectors").doc(data.connectorId).get();
      if (connDoc.exists) {
        connectorName = connDoc.data()?.name || "Unknown";
      }
    }
    
    return {
      id: doc.id,
      ...data,
      connectorName,
      createdAt: data.createdAt?.toDate() || null
    };
  }));

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Sync Logs</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-slate-500">Time</th>
              <th className="px-6 py-3 text-sm font-medium text-slate-500">Connector</th>
              <th className="px-6 py-3 text-sm font-medium text-slate-500">Status</th>
              <th className="px-6 py-3 text-sm font-medium text-slate-500">Records</th>
              <th className="px-6 py-3 text-sm font-medium text-slate-500">Error</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No sync logs found.</td>
              </tr>
            ) : logs.map((log: any) => (
              <tr key={log.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 text-sm text-slate-600">
                  {log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">{log.connectorName}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    log.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 
                    log.status === 'failed' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{log.recordsProcessed || 0}</td>
                <td className="px-6 py-4 text-rose-600 text-sm max-w-xs truncate" title={log.errorMessage || ""}>
                  {log.errorMessage || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
