import { useEffect, useState } from "react"
import { supabase } from "../supabase"

export default function Vendeurs() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchClients() }, [])

  async function fetchClients() {
    setLoading(true)
    const { data, error } = await supabase
      .from("clients").select("*")
      .eq("type_client", "vendeur")
      .order("id", { ascending: false })
    if (error) { console.error("Erreur chargement :", error); setClients([]) }
    else { setClients(data || []) }
    setLoading(false)
  }

  async function affinerDepuisNotes(client) {
    const n = client.notes?.toLowerCase() || ""
    const updates = {
      piscine:  n.includes("piscine") || n.includes("pool") || n.includes("bassin"),
      vue_mer:  n.includes("mer") || n.includes("océan") || n.includes("vue"),
      garage:   n.includes("garage") || n.includes("box") || n.includes("sous-sol"),
      varangue: n.includes("varangue") || n.includes("terrasse") || n.includes("deck"),
      jardin:   n.includes("jardin") || n.includes("terrain") || n.includes("parcelle"),
      budget:   n.match(/\d+k/i) ? parseInt(n.match(/\d+k/i)[0]) * 1000 : client.budget
    }
    await updateClient(client.id, updates)
    alert("Mandat mis à jour selon vos notes de visite ! 🏠")
  }

  async function updateClient(clientId, updates) {
    const { error } = await supabase.from("clients").update(updates).eq("id", clientId)
    if (error) return console.error("Erreur update :", error)
    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, ...updates } : c)))
  }

  const badgeStyle = (active) => `px-4 py-1.5 rounded-full text-[11px] uppercase font-bold transition-all duration-500 ${
    active
      ? "bg-emerald-600 text-white border border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
      : "bg-white/5 text-white/65 border border-white/15"
  }`

  return (
    <div className="p-10">

      {/* En-tête — charte Dashboard */}
      <div className="mb-10">
        <p style={{ color: "#C4A882", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: "600", marginBottom: "10px" }}>
          Mandats de vente
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "300", letterSpacing: "0.02em", lineHeight: 1, color: "#fff" }}>
          Vendeurs
        </h1>
      </div>

      <div className="grid gap-8">
        {clients.map((client) => (
          <div
            key={client.id}
            className="liquid-glass p-10 rounded-[50px] relative group transition-all hover:shadow-[0_0_40px_rgba(52,211,153,0.12)]"
            style={{ border: "1.5px solid rgba(52, 211, 153, 0.55)", boxShadow: "0 0 28px rgba(52, 211, 153, 0.07)" }}
          >
            <div className="flex flex-col lg:flex-row justify-between gap-8">

              {/* INFOS VENDEUR */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: "400", color: "#fff" }}>
                    {client.nom}
                  </h2>
                  <span className="bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/40 font-bold text-emerald-400"
                    style={{ fontSize: "10px" }}>
                    Mandat Actif
                  </span>
                </div>
                <div className="flex flex-wrap gap-6 text-sm" style={{ color: "rgba(255,255,255,0.80)", fontFamily: "'DM Sans', sans-serif" }}>
                  <span className="flex items-center gap-2">📱 {client.telephone || "—"}</span>
                  <span className="flex items-center gap-2">📍 {client.secteur || "Secteur non défini"}</span>
                </div>
              </div>

              {/* PRIX DU BIEN */}
              <div className="lg:text-right bg-white/[0.02] p-6 rounded-[30px] border border-emerald-500/20 min-w-[250px]">
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: "400", color: "#34d399", lineHeight: 1 }}>
                  {Number(client.budget || 0).toLocaleString()} €
                </p>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.70)", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: "6px", fontWeight: "600" }}>
                  Prix de mise en vente
                </p>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", marginTop: "12px", paddingTop: "12px", fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: "400" }}>
                  {client.type_bien || "Maison / Appartement"}
                </div>
              </div>
            </div>

            {/* NOTES & CRITÈRES */}
            <div className="mt-10 grid xl:grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 style={{ fontSize: "11px", color: "rgba(255,255,255,0.70)", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: "600" }}>
                    Notes de visite (Keep)
                  </h3>
                  <button onClick={() => affinerDepuisNotes(client)}
                    style={{ fontSize: "11px", color: "#34d399", fontWeight: "600", letterSpacing: "0.1em", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer" }}>
                    🪄 Extraire les caractéristiques
                  </button>
                </div>
                <div className="p-6 bg-black/30 rounded-[20px] border border-white/8"
                  style={{ fontSize: "13px", fontStyle: "italic", color: "rgba(255,255,255,0.85)", lineHeight: 1.6, fontWeight: "300" }}>
                  {client.notes ? `"${client.notes}"` : "Aucune note technique pour ce mandat."}
                </div>
              </div>

              <div className="space-y-4">
                <h3 style={{ fontSize: "11px", color: "rgba(255,255,255,0.70)", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: "600" }}>
                  Prestations du bien
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => updateClient(client.id, { piscine: !client.piscine })} className={badgeStyle(client.piscine)}>Piscine</button>
                  <button onClick={() => updateClient(client.id, { vue_mer: !client.vue_mer })} className={badgeStyle(client.vue_mer)}>Vue Mer</button>
                  <button onClick={() => updateClient(client.id, { garage: !client.garage })} className={badgeStyle(client.garage)}>Garage</button>
                  <button onClick={() => updateClient(client.id, { jardin: !client.jardin })} className={badgeStyle(client.jardin)}>Jardin</button>
                  <button onClick={() => updateClient(client.id, { varangue: !client.varangue })} className={badgeStyle(client.varangue)}>Varangue</button>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <input type="text" placeholder="Ville du bien..."
                    className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-sm outline-none text-white placeholder-white/40"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                    onFocus={(e) => e.target.style.borderColor = "#34d399"}
                    onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.10)"; updateClient(client.id, { secteur: e.target.value }) }}
                  />
                  <input type="number" placeholder="Nouveau prix..."
                    className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-sm outline-none text-white placeholder-white/40"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                    onFocus={(e) => e.target.style.borderColor = "#34d399"}
                    onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.10)"; updateClient(client.id, { budget: e.target.value }) }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {clients.length === 0 && !loading && (
          <div className="text-center py-20 italic" style={{ color: "rgba(255,255,255,0.55)", fontSize: "14px" }}>
            Aucun vendeur trouvé dans la base.
          </div>
        )}
      </div>
    </div>
  )
}
