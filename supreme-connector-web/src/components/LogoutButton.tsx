"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        // Clear caches and perform a clean redirect to login page
        window.location.href = "/login";
      } else {
        console.error("Failed to log out");
        setLoading(false);
      }
    } catch (error) {
      console.error("Logout error:", error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-indigo-300 hover:bg-indigo-800 hover:text-white transition duration-200 group text-sm font-medium"
    >
      <div className="flex items-center gap-3">
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-white" />
        ) : (
          <LogOut className="w-4 h-4 text-indigo-400 group-hover:text-white transition duration-200" />
        )}
        <span>{loading ? "Signing Out..." : "Sign Out"}</span>
      </div>
    </button>
  );
}
