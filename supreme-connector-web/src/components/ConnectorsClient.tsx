"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Settings2, 
  Database, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Wifi,
  WifiOff,
  Clock,
  Save,
  X
} from "lucide-react";
import { testTallyConnection } from "@/lib/tally";

export interface ConnectorConfig {
  connectorName: string;
  companyName: string;
  tallyHost: string;
  tallyPort: string;
  syncInterval: string;
  apiUrl: string;
}

export interface LocalSyncLog {
  time: string;
  action: string;
  status: "success" | "failed" | "running";
  message?: string;
}

export default function ConnectorsClient({
  serverCompanyId
}: {
  serverCompanyId?: string;
}) {
  const [config, setConfig] = useState<ConnectorConfig | null>(null);
  const [logs, setLogs] = useState<LocalSyncLog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "failed">("idle");

  // Form states
  const [formName, setFormName] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formHost, setFormHost] = useState("localhost");
  const [formPort, setFormPort] = useState("9000");
  const [formInterval, setFormInterval] = useState("5");
  const [formApiUrl, setFormApiUrl] = useState("https://supreme-connector.vercel.app");

  // Load from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem("supreme_connector_config");
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig) as ConnectorConfig;
        setConfig(parsed);
        // Pre-fill form
        setFormName(parsed.connectorName);
        setFormCompany(parsed.companyName);
        setFormHost(parsed.tallyHost);
        setFormPort(parsed.tallyPort);
        setFormInterval(parsed.syncInterval);
        setFormApiUrl(parsed.apiUrl);
      } catch (e) {
        console.error("Error parsing local config:", e);
      }
    }

    const savedLogs = localStorage.getItem("supreme_sync_logs");
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs) as LocalSyncLog[]);
      } catch (e) {
        console.error("Error parsing sync logs:", e);
      }
    }
  }, []);

  const handleOpenModal = () => {
    setTestStatus("idle");
    setIsModalOpen(true);
  };

  const handleTestConnection = async () => {
    setTestStatus("testing");
    const isConnected = await testTallyConnection(formHost, formPort);
    setTestStatus(isConnected ? "success" : "failed");
  };

  const handleSave = () => {
    const newConfig: ConnectorConfig = {
      connectorName: formName || "Local Tally Connector",
      companyName: formCompany || "Tally Company",
      tallyHost: formHost || "localhost",
      tallyPort: formPort || "9000",
      syncInterval: formInterval || "5",
      apiUrl: formApiUrl || "https://supreme-connector.vercel.app"
    };

    localStorage.setItem("supreme_connector_config", JSON.stringify(newConfig));
    setConfig(newConfig);
    setIsModalOpen(false);

    // Add setup event log
    addLocalLog("Setup Connector", "success", `Configured local Tally on ${newConfig.tallyHost}:${newConfig.tallyPort}`);
  };

  const addLocalLog = (action: string, status: "success" | "failed", message: string) => {
    const newLog: LocalSyncLog = {
      time: new Date().toLocaleString(),
      action,
      status,
      message
    };
    const updated = [newLog, ...logs].slice(0, 100);
    setLogs(updated);
    localStorage.setItem("supreme_sync_logs", JSON.stringify(updated));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto relative">
      {/* Page Title & Add Button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Connectors</h1>
          <p className="text-slate-500 mt-1">Manage local TallyPrime data sources and integration configs.</p>
          {serverCompanyId && (
            <p className="text-xs text-slate-500 mt-1.5">
              Your Company ID: <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-semibold text-[11px] select-all">{serverCompanyId}</code>
            </p>
          )}
        </div>
        <button 
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-500 transition shadow-lg shadow-indigo-200"
        >
          <Plus className="w-4 h-4" />
          {config ? "Edit Setup" : "Add Connector"}
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-2xl p-8 mb-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
              <Database className="w-6 h-6 text-indigo-300" />
            </div>
            <h2 className="text-2xl font-bold">Local TallyPrime Integration</h2>
          </div>
          <p className="text-indigo-100 max-w-2xl mb-6 leading-relaxed">
            Run Supreme Connector locally to connect to your offline Tally ERP. 
            The system communicates directly with Tally Prime XML Server to fetch ledgers, sales, and products without uploading sensitive data elsewhere.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={handleOpenModal}
              className="bg-white text-indigo-900 px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-50 transition shadow-lg"
            >
              Configure Local Connection
            </button>
            <a 
              href="/dashboard"
              className="bg-white/10 border border-white/20 px-6 py-2.5 rounded-xl font-medium hover:bg-white/20 transition backdrop-blur-sm flex items-center justify-center"
            >
              View Sync Dashboard
            </a>
          </div>
        </div>
        <div className="absolute right-[-5%] bottom-[-20%] opacity-10">
          <Database className="w-64 h-64" />
        </div>
      </div>

      {/* Quick Setup Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div 
          onClick={handleOpenModal}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition group cursor-pointer"
        >
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition">
            <Database className="w-6 h-6 text-indigo-600 group-hover:text-white" />
          </div>
          <h3 className="font-bold text-slate-800">Tally Integration</h3>
          <p className="text-sm text-slate-500 mt-2">Connect to local Tally ERP via localhost:9000 or custom IP.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm opacity-60 hover:opacity-100 transition group cursor-not-allowed">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 text-emerald-600">
            <Settings2 className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="font-bold text-slate-800">REBOXY API</h3>
          <p className="text-sm text-slate-500 mt-2">Cloud-sync status with REBOXY backend databases.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm opacity-60 hover:opacity-100 transition group cursor-not-allowed">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4 text-orange-600">
            <FileSpreadsheet className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="font-bold text-slate-800">Excel / CSV</h3>
          <p className="text-sm text-slate-500 mt-2">Bulk import via spreadsheets (coming soon).</p>
        </div>
      </div>

      {/* Active Local Connection Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-12">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Active Connectors</h3>
          {config && (
            <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5" />
              Syncs every {config.syncInterval} mins
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Connector Name</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Company</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Host:Port</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {config ? (
                <tr className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-600" />
                    {config.connectorName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{config.companyName}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">{config.tallyHost}:{config.tallyPort}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold w-fit bg-emerald-100 text-emerald-800">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active (Local)
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={handleOpenModal}
                      className="text-slate-400 hover:text-indigo-600 transition"
                    >
                      <Settings2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                    No active connector. Click &quot;Add Connector&quot; above to setup your local Tally.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Local Sync Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Local Connection logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Details / Error Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No local logs found.</td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono whitespace-nowrap">{log.time}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700 whitespace-nowrap">{log.action}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.status === "success" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-xs ${log.status === "failed" ? "text-rose-600 font-medium" : "text-slate-600"}`}>
                      {log.message || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Setup Setup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-8 py-6 border-b border-slate-800/80">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-indigo-400" />
                Connector Configuration
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Connector Name</label>
                  <input 
                    type="text" 
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. Tally Desktop Connector"
                    className="w-full bg-slate-950/40 border border-slate-800 text-white rounded-xl py-2.5 px-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition placeholder-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Company Name</label>
                  <input 
                    type="text" 
                    value={formCompany}
                    onChange={e => setFormCompany(e.target.value)}
                    placeholder="e.g. Acme Corp Tally"
                    className="w-full bg-slate-950/40 border border-slate-800 text-white rounded-xl py-2.5 px-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition placeholder-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tally Host</label>
                  <input 
                    type="text" 
                    value={formHost}
                    onChange={e => setFormHost(e.target.value)}
                    placeholder="localhost"
                    className="w-full bg-slate-950/40 border border-slate-800 text-white rounded-xl py-2.5 px-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition placeholder-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tally Port</label>
                  <input 
                    type="text" 
                    value={formPort}
                    onChange={e => setFormPort(e.target.value)}
                    placeholder="9000"
                    className="w-full bg-slate-950/40 border border-slate-800 text-white rounded-xl py-2.5 px-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition placeholder-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Sync Interval (minutes)</label>
                  <select 
                    value={formInterval}
                    onChange={e => setFormInterval(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-4 text-sm focus:border-indigo-500 outline-none transition"
                  >
                    <option value="1">Every 1 Minute</option>
                    <option value="5">Every 5 Minutes</option>
                    <option value="15">Every 15 Minutes</option>
                    <option value="30">Every 30 Minutes</option>
                    <option value="60">Every 1 Hour</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">API Base URL</label>
                  <input 
                    type="text" 
                    value={formApiUrl}
                    onChange={e => setFormApiUrl(e.target.value)}
                    placeholder="https://supreme-connector.vercel.app"
                    className="w-full bg-slate-950/40 border border-slate-800 text-white rounded-xl py-2.5 px-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition placeholder-slate-700"
                  />
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-5 flex items-center justify-between gap-4">
                {/* Connection Tester */}
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testStatus === "testing"}
                  className="bg-slate-950/80 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs px-4 py-2.5 rounded-xl font-medium transition flex items-center gap-2"
                >
                  {testStatus === "testing" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : testStatus === "success" ? (
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <WifiOff className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  {testStatus === "testing" ? "Testing..." :
                   testStatus === "success" ? "Connected" :
                   testStatus === "failed" ? "Failed (Retry)" : "Test Tally Connection"}
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 transition"
                  >
                    <Save className="w-4 h-4" />
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
