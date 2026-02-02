"use client";

import { useState } from "react";

type Step = 1 | 2 | 3 | 4;

export default function SignsTaskWizard() {
  const [step, setStep] = useState<Step>(1);

  const [title, setTitle] = useState("Skilte – ny opgave");
  const [quantity, setQuantity] = useState(1);
  const [signType, setSignType] = useState("outdoor");
  const [material, setMaterial] = useState("alu_dibond");
  const [printSides, setPrintSides] = useState("FOUR_ZERO");
  const [dropoffType, setDropoffType] = useState("indoors_storage");
  const [dropoffDesc, setDropoffDesc] = useState("Kælderdepot, rum 0.14");
  const [address, setAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [createdTaskId, setCreatedTaskId] = useState<string | null>(null);

  async function createDraft() {
    setBusy(true); setErr(null);
    const res = await fetch("/api/org/tasks/signs/create-draft", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title,
        item: { quantity, signType, material, printSides },
        delivery: { addressText: address, dropoffLocationType: dropoffType, dropoffLocationDescription: dropoffDesc, deliveryContactName: contactName, deliveryContactPhone: contactPhone },
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error ?? "Kunne ikke oprette kladde");
      return null;
    }
    const j = await res.json();
    setCreatedTaskId(j.taskId);
    return j.taskId as string;
  }

  async function sendToSuppliers() {
    const id = createdTaskId ?? (await createDraft());
    if (!id) return;
    setBusy(true); setErr(null);
    const res = await fetch(`/api/org/tasks/${id}/send`, { method: "POST" });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error ?? "Kunne ikke sende opgave");
      return;
    }
    window.location.href = `/org/tasks/${id}`;
  }

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <strong>Trin {step} / 4</strong>
      </div>

      {step === 1 && (
        <div style={{ display: "grid", gap: 12 }}>
          <label>
            Opgavetitel<br />
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", padding: 8 }} />
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setStep(2)} style={{ padding: 10 }}>Næste</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: "grid", gap: 12 }}>
          <label>
            Antal<br />
            <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} style={{ width: 120, padding: 8 }} />
          </label>
          <label>
            Skilttype<br />
            <select value={signType} onChange={(e) => setSignType(e.target.value)} style={{ width: "100%", padding: 8 }}>
              <option value="indoor">Indendørs</option>
              <option value="outdoor">Udendørs</option>
              <option value="facade">Facade</option>
              <option value="wayfinding">Wayfinding</option>
              <option value="temporary">Midlertidigt</option>
              <option value="information">Information</option>
              <option value="safety">Sikkerhed/påbud</option>
              <option value="special">Special</option>
            </select>
          </label>
          <label>
            Materiale<br />
            <select value={material} onChange={(e) => setMaterial(e.target.value)} style={{ width: "100%", padding: 8 }}>
              <option value="alu_dibond">Alu Dibond</option>
              <option value="pvc_foamex">PVC/Forex</option>
              <option value="acrylic_plexi">Akryl/Plexi</option>
              <option value="aluminium">Aluminium</option>
              <option value="foil">Folie</option>
              <option value="other">Andet</option>
            </select>
          </label>
          <label>
            Tryk<br />
            <select value={printSides} onChange={(e) => setPrintSides(e.target.value)} style={{ width: "100%", padding: 8 }}>
              <option value="FOUR_ZERO">4+0</option>
              <option value="FOUR_FOUR">4+4</option>
            </select>
          </label>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setStep(1)} style={{ padding: 10 }}>Tilbage</button>
            <button onClick={() => setStep(3)} style={{ padding: 10 }}>Næste</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ display: "grid", gap: 12 }}>
          <label>
            Leveringsadresse<br />
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Adresse..." style={{ width: "100%", padding: 8 }} />
          </label>
          <label>
            Hvor må det stilles<br />
            <select value={dropoffType} onChange={(e) => setDropoffType(e.target.value)} style={{ width: "100%", padding: 8 }}>
              <option value="indoors_storage">Indenfor – depot/lager</option>
              <option value="indoors_specific_room">Indenfor – specifikt lokale</option>
              <option value="outdoors_covered">Udendørs – overdækket</option>
              <option value="outdoors_uncovered">Udendørs – ikke overdækket</option>
              <option value="goods_inward">Port / vareindlevering</option>
              <option value="reception">Reception</option>
            </select>
          </label>
          <label>
            Placering (beskrivelse)<br />
            <input value={dropoffDesc} onChange={(e) => setDropoffDesc(e.target.value)} style={{ width: "100%", padding: 8 }} />
          </label>
          <label>
            Kontakt ved levering – navn<br />
            <input value={contactName} onChange={(e) => setContactName(e.target.value)} style={{ width: "100%", padding: 8 }} />
          </label>
          <label>
            Kontakt ved levering – telefon<br />
            <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} style={{ width: "100%", padding: 8 }} />
          </label>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setStep(2)} style={{ padding: 10 }}>Tilbage</button>
            <button onClick={() => setStep(4)} style={{ padding: 10 }}>Næste</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div style={{ display: "grid", gap: 12 }}>
          <h2 style={{ margin: 0 }}>Opsummering</h2>
          <div style={{ color: "#444" }}>
            <div><strong>Titel:</strong> {title}</div>
            <div><strong>Skilt:</strong> {quantity} stk • {signType} • {material} • {printSides}</div>
            <div><strong>Levering:</strong> {address || "(mangler)"} • {dropoffType} • {dropoffDesc}</div>
            <div><strong>Produktion:</strong> EU (default)</div>
          </div>

          {err && <div style={{ color: "crimson" }}>{err}</div>}

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setStep(3)} style={{ padding: 10 }}>Tilbage</button>
            <button disabled={busy} onClick={createDraft} style={{ padding: 10 }}>
              {busy ? "Gemmer..." : "Gem kladde"}
            </button>
            <button disabled={busy} onClick={sendToSuppliers} style={{ padding: 10 }}>
              {busy ? "Sender..." : "Send til leverandører"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
