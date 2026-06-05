import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  Plus, 
  Settings2, 
  Database, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ConnectorsPage() {
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
  const orgsSnap = await db.collection("organizations").where("userId", "==", payload.userId).get();
  const orgIds = orgsSnap.docs.map(doc => doc.id);

  let connectors: any[] = [];

  if (orgIds.length > 0) {
    // Get all companies under these organizations
    const companiesSnap = await db.collection("companies").where("organizationId", "in", orgIds).get();
    const companiesMap: Record<string, any> = {};
    const companyIds: string[] = [];

    companiesSnap.docs.forEach(doc => {
      companiesMap[doc.id] = { id: doc.id, ...doc.data() };
      companyIds.push(doc.id);
    });

    if (companyIds.length > 0) {
      // Get all connectors for these companies
      const connectorsSnap = await db.collection("connectors").where("companyId", "in", companyIds).get();
      connectors = connectorsSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          company: companiesMap[data.companyId] || { name: "Unknown" },
          lastSyncedAt: data.lastSyncedAt?.toDate() || null,
          createdAt: data.createdAt?.toDate() || null
        };
      });
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Connectors</h1>
          <p className="text-slate-500 mt-1">Manage your local data sources and sync agents.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-500 transition shadow-lg shadow-indigo-200">
          <Plus className="w-4 h-4" />
          Add Connector
        </button>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-2xl p-8 mb-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
              <Settings2 className="w-6 h-6 text-indigo-300" />
            </div>
            <h2 className="text-2xl font-bold">Local Agent Required</h2>
          </div>
          <p className="text-indigo-100 max-w-2xl mb-6 leading-relaxed">
            Since your Tally ERP runs locally, you need to install the Supreme Connector Agent on your Windows PC. 
            The agent reads data from Tally and securely pushes it to this cloud dashboard.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-white text-indigo-900 px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-50 transition shadow-lg">
              Download Windows Agent (.exe)
            </button>
            <button className="bg-white/10 border border-white/20 px-6 py-2.5 rounded-xl font-medium hover:bg-white/20 transition backdrop-blur-sm">
              View Installation Guide
            </button>
          </div>
        </div>
        <div className="absolute right-[-5%] bottom-[-20%] opacity-10">
          <Database className="w-64 h-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition group cursor-pointer">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition">
            <Database className="w-6 h-6 text-indigo-600 group-hover:text-white" />
          </div>
          <h3 className="font-bold text-slate-800">Tally Integration</h3>
          <p className="text-sm text-slate-500 mt-2">Connect to local Tally ERP via localhost:9000 using our Local Agent.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-200 transition group cursor-pointer">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition">
            <Settings2 className="w-6 h-6 text-emerald-600 group-hover:text-white" />
          </div>
          <h3 className="font-bold text-slate-800">REBOXY API</h3>
          <p className="text-sm text-slate-500 mt-2">Sync directly with REBOXY Cloud or Local API endpoints.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-orange-200 transition group cursor-pointer">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-600 group-hover:text-white transition">
            <FileSpreadsheet className="w-6 h-6 text-orange-600 group-hover:text-white" />
          </div>
          <h3 className="font-bold text-slate-800">Excel / CSV</h3>
          <p className="text-sm text-slate-500 mt-2">Upload bulk data using our intelligent column mapper.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Active Agents</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Connector Name</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">API Key</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {connectors.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-900">{c.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 capitalize">{c.type}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{c.company.name}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold w-fit ${
                      c.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      <div className={`w-1 h-1 rounded-full ${c.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">••••••••••••</code>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-slate-400 hover:text-indigo-600 transition">
                      <Settings2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {connectors.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">No connectors registered.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
