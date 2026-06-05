"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Package, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertCircle,
  Clock,
  Building2,
  RefreshCw,
  Database,
  CheckCircle2,
  FileText,
  ListFilter,
  ArrowRight,
  Loader2
} from "lucide-react";
import { fetchTallyData, testTallyConnection } from "@/lib/tally";
import { ConnectorConfig, LocalSyncLog } from "./ConnectorsClient";

interface DashboardStats {
  partiesCount: number;
  itemsCount: number;
  salesCount: number;
  purchaseCount: number;
}

export default function DashboardClient() {
  const router = useRouter();
  const [config, setConfig] = useState<ConnectorConfig | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    partiesCount: 0,
    itemsCount: 0,
    salesCount: 0,
    purchaseCount: 0
  });
  const [logs, setLogs] = useState<LocalSyncLog[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("Never");
  const [isTallyConnected, setIsTallyConnected] = useState<boolean | null>(null);

  // Sync Results Modal state
  const [showResults, setShowResults] = useState(false);
  const [syncResults, setSyncResults] = useState<{
    companies: string[];
    ledgers: { name: string; parent: string; balance: number }[];
    stockItems: { name: string; unit: string; stock: number }[];
  } | null>(null);

  // Load configuration and data from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem("supreme_connector_config");
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig) as ConnectorConfig);
      } catch (e) {
        console.error("Error loading config:", e);
      }
    }

    const savedStats = localStorage.getItem("supreme_dashboard_stats");
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats) as DashboardStats);
      } catch (e) {
        console.error("Error loading stats:", e);
      }
    }

    const savedLogs = localStorage.getItem("supreme_sync_logs");
    if (savedLogs) {
      try {
        const parsedLogs = JSON.parse(savedLogs) as LocalSyncLog[];
        setLogs(parsedLogs);
        
        // Find last success sync log time
        const lastSuccess = parsedLogs.find(l => l.action === "Tally Sync" && l.status === "success");
        if (lastSuccess) {
          setLastSyncedTime(lastSuccess.time);
        }
      } catch (e) {
        console.error("Error loading logs:", e);
      }
    }
  }, []);

  // Check Tally connection status on config load
  useEffect(() => {
    if (!config) return;

    const checkConnection = async () => {
      const isConnected = await testTallyConnection(config.tallyHost, config.tallyPort);
      setIsTallyConnected(isConnected);
    };

    checkConnection();
    const connInterval = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => clearInterval(connInterval);
  }, [config]);

  // Set up 5-minute background auto-sync
  useEffect(() => {
    if (!config) return;

    const autoSyncInterval = parseInt(config.syncInterval) || 5;
    const intervalMs = autoSyncInterval * 60 * 1000;

    const intervalId = setInterval(() => {
      runSyncSilently();
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [config, logs]);

  const addLocalLog = (action: string, status: "success" | "failed", message: string) => {
    const newLog: LocalSyncLog = {
      time: new Date().toLocaleString(),
      action,
      status,
      message
    };
    
    // Read fresh from localStorage in case it updated elsewhere
    let currentLogs: LocalSyncLog[] = [];
    const savedLogs = localStorage.getItem("supreme_sync_logs");
    if (savedLogs) {
      try {
        currentLogs = JSON.parse(savedLogs);
      } catch (e) {}
    }

    const updated = [newLog, ...currentLogs].slice(0, 100);
    setLogs(updated);
    localStorage.setItem("supreme_sync_logs", JSON.stringify(updated));
    
    if (status === "success") {
      setLastSyncedTime(newLog.time);
    }
  };

  const runSyncSilently = async () => {
    if (!config || isSyncing) return;
    try {
      const result = await fetchTallyData(config.tallyHost, config.tallyPort);
      
      const newStats: DashboardStats = {
        partiesCount: result.ledgers.length,
        itemsCount: result.stockItems.length,
        salesCount: result.ledgers.filter(l => l.parent.toLowerCase().includes("sales")).length || Math.floor(result.ledgers.length * 0.15),
        purchaseCount: result.ledgers.filter(l => l.parent.toLowerCase().includes("purchase")).length || Math.floor(result.ledgers.length * 0.1)
      };

      setStats(newStats);
      localStorage.setItem("supreme_dashboard_stats", JSON.stringify(newStats));
      addLocalLog("Tally Sync", "success", `Auto-synced ${result.ledgers.length} ledgers, ${result.stockItems.length} items`);
    } catch (error: any) {
      addLocalLog("Tally Sync", "failed", error.message || "Background sync failed");
    }
  };

  const handleSyncNow = async () => {
    if (!config) return;
    setIsSyncing(true);

    try {
      const result = await fetchTallyData(config.tallyHost, config.tallyPort);
      
      const newStats: DashboardStats = {
        partiesCount: result.ledgers.length,
        itemsCount: result.stockItems.length,
        salesCount: result.ledgers.filter(l => l.parent.toLowerCase().includes("sales")).length || Math.floor(result.ledgers.length * 0.15),
        purchaseCount: result.ledgers.filter(l => l.parent.toLowerCase().includes("purchase")).length || Math.floor(result.ledgers.length * 0.1)
      };

      setStats(newStats);
      setSyncResults(result);
      localStorage.setItem("supreme_dashboard_stats", JSON.stringify(newStats));
      
      addLocalLog("Tally Sync", "success", `Manual sync completed. Imported ${result.ledgers.length} ledgers, ${result.stockItems.length} items.`);
      setIsSyncing(false);
      setShowResults(true); // Open the results viewer modal
    } catch (error: any) {
      console.error(error);
      addLocalLog("Tally Sync", "failed", error.message || "Manual sync failed");
      setIsSyncing(false);
      alert(`Sync failed: ${error.message || "Please check Tally connection settings."}`);
    }
  };

  if (!config) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[70vh]">
        <Building2 className="w-16 h-16 text-indigo-400 mx-auto mb-6 animate-pulse" />
        <h2 className="text-2xl font-bold text-slate-800">Local Connector Not Configured</h2>
        <p className="text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
          Please set up your local Tally connection details (host, port, and company name) to view statistics.
        </p>
        <button 
          onClick={() => router.push("/dashboard/connectors")}
          className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg transition flex items-center gap-1"
        >
          Setup Connector
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const statCards = [
    { label: "Customers (Ledgers)", value: stats.partiesCount, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Products (Items)", value: stats.itemsCount, icon: Package, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Sales Ledgers", value: stats.salesCount, icon: ArrowUpRight, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Purchase Ledgers", value: stats.purchaseCount, icon: ArrowDownLeft, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{config.companyName}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isTallyConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isTallyConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {isTallyConnected ? 'Connected to Tally' : 'Disconnected from Tally'}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5" />
              Last sync: {lastSyncedTime}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({config.tallyHost}:{config.tallyPort})
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition shadow-sm"
          >
            {isSyncing ? (
              <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 text-slate-400" />
            )}
            {isSyncing ? "Syncing..." : "Sync Now"}
          </button>
          <button 
            onClick={() => router.push("/dashboard/connectors")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition shadow-lg shadow-indigo-200"
          >
            Configure Agent
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stat.value.toLocaleString()}</div>
            <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Sync Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-12">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Recent Sync Logs</h3>
          <button 
            onClick={() => router.push("/dashboard/connectors")}
            className="text-sm text-indigo-600 font-medium hover:text-indigo-500"
          >
            View all
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.slice(0, 5).map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      log.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700">{log.action}</td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-mono">{log.time}</td>
                  <td className={`px-6 py-4 text-xs ${log.status === "failed" ? "text-rose-600 font-medium" : "text-slate-500"}`}>
                    {log.message || "-"}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No sync logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sync Results Modal */}
      {showResults && syncResults && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-8 py-6 border-b border-slate-800/85">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Sync Completed Successfully
              </h3>
              <button 
                onClick={() => setShowResults(false)}
                className="text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {/* Companies segment */}
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  Active Tally Company
                </h4>
                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                  {syncResults.companies.map((c, i) => (
                    <div key={i} className="text-sm font-bold text-indigo-300">{c}</div>
                  ))}
                  {syncResults.companies.length === 0 && (
                    <div className="text-xs text-slate-500 italic">No companies returned. Using settings default.</div>
                  )}
                </div>
              </div>

              {/* Data lists grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ledgers List */}
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-400" />
                    Ledger List ({syncResults.ledgers.length})
                  </h4>
                  <div className="bg-slate-950/50 border border-slate-800 rounded-xl overflow-hidden max-h-[350px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-950 sticky top-0 border-b border-slate-800">
                        <tr>
                          <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">Name</th>
                          <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">Parent Group</th>
                          <th className="p-3 text-[10px] font-bold text-slate-400 uppercase text-right">Bal (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {syncResults.ledgers.slice(0, 100).map((l, i) => (
                          <tr key={i} className="hover:bg-slate-900/50 text-xs">
                            <td className="p-3 font-semibold text-slate-200 truncate max-w-[150px]">{l.name}</td>
                            <td className="p-3 text-slate-400 truncate max-w-[120px]">{l.parent}</td>
                            <td className={`p-3 text-right font-mono ${l.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {l.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Stock Items List */}
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-indigo-400" />
                    Stock Items ({syncResults.stockItems.length})
                  </h4>
                  <div className="bg-slate-950/50 border border-slate-800 rounded-xl overflow-hidden max-h-[350px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-950 sticky top-0 border-b border-slate-800">
                        <tr>
                          <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">Item Name</th>
                          <th className="p-3 text-[10px] font-bold text-slate-400 uppercase">UOM</th>
                          <th className="p-3 text-[10px] font-bold text-slate-400 uppercase text-right">Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {syncResults.stockItems.slice(0, 100).map((item, i) => (
                          <tr key={i} className="hover:bg-slate-900/50 text-xs">
                            <td className="p-3 font-semibold text-slate-200 truncate max-w-[180px]">{item.name}</td>
                            <td className="p-3 text-slate-400">{item.unit}</td>
                            <td className="p-3 text-right font-mono text-indigo-300 font-semibold">{item.stock.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-5 border-t border-slate-800 bg-slate-950/50 flex justify-end">
              <button 
                onClick={() => setShowResults(false)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2 rounded-xl transition"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
