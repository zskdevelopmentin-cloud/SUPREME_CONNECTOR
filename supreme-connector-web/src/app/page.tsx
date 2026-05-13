export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-indigo-900 to-slate-900 text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col gap-8">
        <h1 className="text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          SUPREME CONNECTOR
        </h1>
        <p className="text-xl text-slate-300">
          Bridging the gap between Local ERP and Cloud Dashboards.
        </p>
        <div className="flex gap-4 mt-8">
          <a
            href="/dashboard"
            className="rounded-full bg-blue-600 px-8 py-3 font-semibold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/30"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </main>
  );
}
