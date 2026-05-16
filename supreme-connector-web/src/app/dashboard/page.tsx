import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  let totalConnectors = 0;
  let activeConnectors = 0;
  let totalLogs = 0;
  let error: string | null = null;

  try {
    const connectorsSnap = await db.collection("connectors").get();
    totalConnectors = connectorsSnap.size;
    
    connectorsSnap.forEach(doc => {
      if (doc.data().status === "active") activeConnectors++;
    });

    const logsSnap = await db.collection("sync_logs").count().get();
    totalLogs = logsSnap.data().count;
  } catch (err: any) {
    console.error("Dashboard data fetch error:", err);
    error = err.message || "Failed to load dashboard data";
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-lg mb-8">
          <h2 className="font-bold mb-1">Error Loading Dashboard</h2>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2 opacity-70">Please check your Firebase environment variables in Vercel.</p>
        </div>
        <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
      </div>
    );
  }

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
