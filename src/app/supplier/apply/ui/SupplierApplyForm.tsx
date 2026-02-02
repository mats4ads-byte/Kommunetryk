"use client";

import { useState } from "react";

export default function SupplierApplyForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [capSigns, setCapSigns] = useState(true);
  const [capMontage, setCapMontage] = useState(false);
  const [production, setProduction] = useState("eu");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setMsg(null);
    setLoading(true);
    const res = await fetch("/api/supplier/apply", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name, email, phone,
        capabilities: [
          ...(capSigns ? ["signs"] : []),
          ...(capMontage ? ["montage"] : []),
        ],
        productionCountryType: production,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error ?? "Ansøgning fejlede");
      return;
    }
    setMsg("Tak! Jeres ansøgning er modtaget og afventer manuel godkendelse.");
    setName(""); setEmail(""); setPhone("");
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
      <label>Firmanavn<br />
        <input value={name} onChange={(e) => setName(e.target.value)} required style={{ width: "100%", padding: 8 }} />
      </label>
      <label>E-mail<br />
        <input value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%", padding: 8 }} />
      </label>
      <label>Telefon<br />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: "100%", padding: 8 }} />
      </label>

      <fieldset style={{ border: "1px solid #eee", borderRadius: 8, padding: 10 }}>
        <legend>Kompetencer</legend>
        <label style={{ display: "block" }}>
          <input type="checkbox" checked={capSigns} onChange={(e) => setCapSigns(e.target.checked)} /> Skilte
        </label>
        <label style={{ display: "block" }}>
          <input type="checkbox" checked={capMontage} onChange={(e) => setCapMontage(e.target.checked)} /> Montage
        </label>
      </fieldset>

      <label>Produktion<br />
        <select value={production} onChange={(e) => setProduction(e.target.value)} style={{ width: "100%", padding: 8 }}>
          <option value="denmark">Danmark</option>
          <option value="eu">EU</option>
          <option value="global">Global</option>
        </select>
      </label>

      {err && <div style={{ color: "crimson" }}>{err}</div>}
      {msg && <div style={{ color: "green" }}>{msg}</div>}

      <button disabled={loading} style={{ padding: 10 }}>{loading ? "Sender..." : "Send ansøgning"}</button>
    </form>
  );
}
