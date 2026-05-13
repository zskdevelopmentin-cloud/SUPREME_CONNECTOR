import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const connectorsSnap = await db.collection("connectors").get();
  const totalConnectors = connectorsSnap.size;
  
  let activeConnectors = 0;
  connectorsSnap.forEach(doc => {
    if (doc.data().status === "active") activeConnectors++;
  });

  const logsSnap = await db.collection("sync_logs").count().get();
  const totalLogs = logsSnap.data().count;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-slate-500 font-medium mb-2">Total Connectors</h3>
          <span className="text-4xl font-bold text-slate-800">{totalConnectors}</span>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-slate-500 font-medium mb-2">Active Connectors</h3>
          <span className="text-4xl font-bold text-emerald-600">{activeConnectors}</span>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-slate-500 font-medium mb-2">Total Syncs</h3>
          <span className="text-4xl font-bold text-blue-600">{totalLogs}</span>
        </div>
      </div>
    </div>
  );
}
