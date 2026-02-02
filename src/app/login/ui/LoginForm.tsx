"use client";

import { useState } from "react";

export default function LoginForm({ nextPath }: { nextPath: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password, nextPath }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error ?? "Login fejlede");
      return;
    }
    const j = await res.json();
    window.location.href = j.redirect ?? "/dashboard";
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
      <label>
        E-mail<br />
        <input value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%", padding: 8 }} />
      </label>
      <label>
        Password<br />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: 8 }} />
      </label>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
      <button disabled={loading} style={{ padding: 10 }}>
        {loading ? "Logger ind..." : "Login"}
      </button>
    </form>
  );
}
