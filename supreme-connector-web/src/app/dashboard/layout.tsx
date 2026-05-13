import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <aside className="w-64 bg-indigo-900 text-white flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">SUPREME</h2>
          <p className="text-xs text-indigo-300 mt-1">Connector Admin</p>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/dashboard" className="block px-4 py-2 rounded bg-indigo-800 text-white font-medium hover:bg-indigo-700 transition">
            Overview
          </Link>
          <Link href="/dashboard/connectors" className="block px-4 py-2 rounded text-indigo-200 hover:bg-indigo-800 hover:text-white transition">
            Connectors
          </Link>
          <Link href="/dashboard/sync-logs" className="block px-4 py-2 rounded text-indigo-200 hover:bg-indigo-800 hover:text-white transition">
            Sync Logs
          </Link>
        </nav>
        <div className="p-4 bg-indigo-950 text-xs text-indigo-400 text-center">
          &copy; {new Date().getFullYear()} Reboxy Inc.
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
