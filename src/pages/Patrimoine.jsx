import { useEffect, useState } from "react"
import { supabase } from "../supabase"

export default function Patrimoine() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchClients() }, [])

  async function fetchClients() {
    setLoading(true)
    const { data, error } = await supabase
      .from("clients").select("*")
      .eq("categorie_client", "patrimoine")
      .order("id", { ascending: false })
    if (error) { console.error(error); setClients([]) }
    else { setClients(data || []) }
    setLoading(false)
  }

  async function updateClient(clientId, updates) {
    const { error } = await supabase.from("clients").update(updates).eq("id", clientId)
    if (!error) setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, ...updates } : c)))
  }

  const badgeStyle = (active) => `px-3 py-1 rounded-md text-[11px] uppercase tracking-wider font-bold transition-all ${
    active
      ? "bg-[#4A6FA5] text-white border border-[#4A6FA5]"
      : "bg-white/5 text-white/65 border border-white/15"
  }`

  const card = {
    backgroundColor: "rgba(8, 6, 4, 0.50)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(74, 111, 165, 0.30)",
    borderRadius: "16px",
    overflow: "hidden",
    marginBottom: "16px",
  }

  const analyseBox = {
    background: "rgba(0,0,0,0.25)",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid rgba(74, 111, 165, 0.20)",
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", padding: "40px", color: "#fff" }}>

      <div className="mb-10">
        <p style={{ color: "#C4A882", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: "600", marginBottom: "10px" }}>
          Gestion d'actifs
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "300", letterSpacing: "0.02em", lineHeight: 1, color: "#fff" }}>
          Investissement & Patrimoine
        </h1>
      </div>

      <div className="grid gap-5">
        {clients.map((client) => (
          <div key={client.id} style={card} className="flex flex-col md:flex-row">

            <div style={{ width: "4px", background: client.type_client === 'vendeur' ? '#10b981' : '#f97316', flexShrink: 0 }} />

            <div className="flex-1 p-8 grid md:grid-cols-3 gap-8 items-center">

              <div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.3rem, 2vw, 1.7rem)", fontWeight: "400", color: "#fff", marginBottom: "4px" }}>
                  {client.nom}
                </h2>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", marginBottom: "12px" }}>
                  {client.email || "Pas d'email"}
                </p>
                <span style={{ fontSize: "10px", background: "rgba(74,111,165,0.15)", padding: "3px 10px", borderRadius: "6px", color: "#7BA7D4", border: "1px solid rgba(74,111,165,0.25)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: "600" }}>
                  {client.projet_client || "Défiscalisation"}
                </span>
              </div>

              <div style={analyseBox}>
                <div className="flex justify-between items-end mb-2">
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.70)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "600" }}>Enveloppe</span>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontWeight: "400", color: "#7BA7D4" }}>{client.budget?.toLocaleString()} €</span>
                </div>
                <div style={{ width: "100%", background: "rgba(255,255,255,0.08)", height: "3px", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ background: "#4A6FA5", height: "100%", width: "70%" }} />
                </div>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.70)", marginTop: "8px", fontStyle: "italic" }}>
                  Rentabilité cible : {client.type_bien === 'Immeuble' ? '6.5%' : '4.2%'}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => updateClient(client.id, { garage: !client.garage })} className={badgeStyle(client.garage)}>Box/Parking</button>
                  <button onClick={() => updateClient(client.id, { plain_pied: !client.plain_pied })} className={badgeStyle(client.plain_pied)}>Rapport</button>
                  <button className={badgeStyle(true)}>Zone {client.secteur || 'À définir'}</button>
                </div>
                <button style={{ fontSize: "11px", color: "rgba(255,255,255,0.70)", letterSpacing: "0.12em", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontWeight: "600" }}
                  className="hover:text-white transition-colors">
                  → Historique des échanges
                </button>
              </div>

            </div>
          </div>
        ))}

        {clients.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "60px 40px", border: "1px solid rgba(74,111,165,0.40)", borderRadius: "16px", backgroundColor: "rgba(5,4,2,0.80)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", fontWeight: "500", fontStyle: "italic", color: "#ffffff" }}>
              Aucun dossier patrimoine identifié.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
