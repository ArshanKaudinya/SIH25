"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [loading, setL] = useState(false);
  const [error, setE] = useState("");
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/dashboard";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setL(true); setE("");
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    setL(false);
    if (r.ok) router.replace(next);
    else setE((await r.json()).error || "Login failed");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm rounded-xl border p-6 shadow-sm bg-white text-black/60">
        <h1 className="text-xl font-semibold text-[#0b5b39] mb-4">AiTHLETIQ Government Access</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="w-full border rounded-md px-3 py-2" placeholder="Username" value={username} onChange={e=>setU(e.target.value)} required />
          <input className="w-full border rounded-md px-3 py-2" placeholder="Password" type="password" value={password} onChange={e=>setP(e.target.value)} required />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={loading} className="w-full rounded-md px-3 py-2 bg-[#ffefe0] hover:bg-[#ffe5cc] border border-[#ffd7b3] text-[#9a4a00]">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
