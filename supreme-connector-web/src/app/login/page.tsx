"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Lock, 
  Building2, 
  User, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  Eye,
  EyeOff,
  Database,
  CheckCircle2
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const payload = isLogin 
      ? { email, password } 
      : { email, password, name, organizationName };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      // Smooth transition to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-4 md:p-8 relative overflow-hidden">
      
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-5xl bg-slate-900/60 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side: Brand Showcase */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-indigo-900/40 to-slate-900/80 p-8 md:p-12 flex flex-col justify-between border-r border-slate-800/50">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                <Database className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">SUPREME</span>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-extrabold text-white leading-tight">
                Bridge Tally ERP & the Cloud.
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Connect your offline enterprise systems directly to a powerful modern cloud interface in real-time. Secure, automated, and instant.
              </p>
            </div>
          </div>

          <div className="mt-8 md:mt-0 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Secure JWT & HTTP-Only cookie-based sessions.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Multi-company management & sync status tracking.
              </p>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 mt-8 md:mt-0">
            &copy; {new Date().getFullYear()} Reboxy Inc. All rights reserved.
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <div className="flex gap-4 border-b border-slate-800/80 mb-6 pb-px">
              <button 
                onClick={() => { setIsLogin(true); setError(""); }}
                className={`pb-3 text-sm font-semibold transition-all relative ${
                  isLogin ? "text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Sign In
                {isLogin && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
                )}
              </button>
              <button 
                onClick={() => { setIsLogin(false); setError(""); }}
                className={`pb-3 text-sm font-semibold transition-all relative ${
                  !isLogin ? "text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Create Account
                {!isLogin && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
                )}
              </button>
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isLogin ? "Welcome back" : "Get started with Supreme"}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {isLogin ? "Enter your credentials to access the admin portal" : "Set up your admin user and organization profile"}
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-xl mb-6 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-slate-950/40 border border-slate-800 text-white rounded-xl py-3 pl-11 pr-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition placeholder-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Organization Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder="Acme Corporates"
                      className="w-full bg-slate-950/40 border border-slate-800 text-white rounded-xl py-3 pl-11 pr-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition placeholder-slate-600"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-950/40 border border-slate-800 text-white rounded-xl py-3 pl-11 pr-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition placeholder-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/40 border border-slate-800 text-white rounded-xl py-3 pl-11 pr-12 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition placeholder-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed group mt-8"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? "Sign In" : "Register Profile"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </main>
  );
}
