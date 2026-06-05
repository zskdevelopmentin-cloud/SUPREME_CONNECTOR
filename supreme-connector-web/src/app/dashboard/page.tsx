import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertCircle,
  Clock,
  Building2,
  RefreshCw
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const token = cookies().get("token")?.value;
  const payload = token ? await verifyJwt(token) : null;

  if (!payload) {
    redirect("/login");
  }

  if (!db) {
    return (
      <div className="p-8 text-center text-rose-500 font-semibold">
        Database not initialized.
      </div>
    );
  }

  // Get user's organizations
  const orgsSnap = await db.collection("organizations").where("userId", "==", payload.userId).limit(1).get();
  
  if (orgsSnap.empty) {
    return (
      <div className="p-8 text-center">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800">No Organization Found</h2>
        <p className="text-slate-500 mt-2">Please register an organization profile first.</p>
      </div>
    );
  }

  const orgDoc = orgsSnap.docs[0];
  
  // Get first company under organization
  const companiesSnap = await db.collection("companies").where("organizationId", "==", orgDoc.id).limit(1).get();
  
  if (companiesSnap.empty) {
    return (
      <div className="p-8 text-center">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800">No Company Found</h2>
        <p className="text-slate-500 mt-2">Please set up a company to get started.</p>
      </div>
    );
  }

  const companyDoc = companiesSnap.docs[0];
  const companyData = companyDoc.data();
  const companyId = companyDoc.id;

  // Get connectors for this company
  const connectorsSnap = await db.collection("connectors").where("companyId", "==", companyId).get();
  const connectors = connectorsSnap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      lastSyncedAt: data.lastSyncedAt?.toDate() || null,
      createdAt: data.createdAt?.toDate() || null
    } as any;
  });

  const connector = connectors[0];

  // Fetch count of parties, inventoryItems, salesInvoices, purchaseInvoices
  const partiesCount = await db.collection("parties").where("companyId", "==", companyId).count().get();
  const itemsCount = await db.collection("inventoryItems").where("companyId", "==", companyId).count().get();
  const salesCount = await db.collection("salesInvoices").where("companyId", "==", companyId).count().get();
  const purchaseCount = await db.collection("purchaseInvoices").where("companyId", "==", companyId).count().get();

  const failedSyncs = await db.collection("sync_logs")
    .where("companyId", "==", companyId)
    .where("status", "==", "failed")
    .count()
    .get();

  // Fetch sync logs for the main connector if it exists
  let syncLogs: any[] = [];
  if (connector) {
    const logsSnap = await db.collection("sync_logs")
      .where("connectorId", "==", connector.id)
      .orderBy("createdAt", "desc")
      .limit(5)
      .get();
    syncLogs = logsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || null
      };
    });
  }

  const stats = [
    { label: "Customers", value: partiesCount.data().count, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Products", value: itemsCount.data().count, icon: Package, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Sales", value: salesCount.data().count, icon: ArrowUpRight, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Purchases", value: purchaseCount.data().count, icon: ArrowDownLeft, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{companyData.name}</h1>
          <p className="text-xs text-slate-500 mt-1">Company ID: <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-semibold text-[11px] select-all">{companyId}</code></p>
          <div className="flex items-center gap-4 mt-2">
            <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
              connector?.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${connector?.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {connector?.status === 'active' ? 'Connected' : 'Disconnected'}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              Last sync: {connector?.lastSyncedAt ? new Date(connector.lastSyncedAt).toLocaleString() : 'Never'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm">
            <RefreshCw className="w-4 h-4 text-slate-400" />
            Sync Now
          </button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-500 transition shadow-lg shadow-indigo-200">
            Configure Agent
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              {failedSyncs.data().count > 0 && stat.label === "Sales" && (
                <div className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded text-[10px] font-bold">
                  <AlertCircle className="w-3 h-3" />
                  {failedSyncs.data().count} FAILED
                </div>
              )}
            </div>
            <div className="text-2xl font-bold text-slate-900">{stat.value.toLocaleString()}</div>
            <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Recent Sync Logs</h3>
          <button className="text-sm text-indigo-600 font-medium hover:text-indigo-500">View all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Batch ID</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Records</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {syncLogs.map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      log.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-600">{log.batchId}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{log.recordsProcessed}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}</td>
                </tr>
              ))}
              {syncLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No sync logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
