import { useEffect, useState } from "react"
import { supabase } from "../supabase"

export default function Acquereurs() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchClients() }, [])

  async function fetchClients() {
    setLoading(true)
    const { data, error } = await supabase
      .from("clients").select("*")
      .eq("type_client", "acquereur")
      .order("id", { ascending: false })
    if (error) { console.error("Erreur chargement :", error); setClients([]) }
    else { setClients(data || []) }
    setLoading(false)
  }

  async function affinerDepuisNotes(client) {
    const n = client.notes?.toLowerCase() || ""
    const updates = {
      piscine:  n.includes("piscine") || n.includes("pool") || n.includes("bassin"),
      vue_mer:  n.includes("mer") || n.includes("océan") || n.includes("vue mer"),
      garage:   n.includes("garage") || n.includes("box") || n.includes("parking"),
      varangue: n.includes("varangue") || n.includes("terrasse") || n.includes("balcon"),
      jardin:   n.includes("jardin") || n.includes("cour") || n.includes("terrain"),
      budget:   n.match(/\d+k/i) ? parseInt(n.match(/\d+k/i)[0]) * 1000 : client.budget
    }
    await updateClient(client.id, updates)
    alert("Analyse de la note terminée ! Les critères ont été mis à jour. ✨")
  }

  async function updateClient(clientId, updates) {
    const { error } = await supabase.from("clients").update(updates).eq("id", clientId)
    if (error) { console.error("Erreur update :", error); return }
    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, ...updates } : c)))
  }

  const card = {
    backgroundColor: "rgba(8, 6, 4, 0.50)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "24px",
    padding: "28px 32px",
    marginBottom: "20px",
  }

  const budgetBox = {
    background: "rgba(0,0,0,0.30)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "12px",
    padding: "18px 22px",
    minWidth: "220px",
  }

  const notesBox = {
    background: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    padding: "14px 16px",
    minHeight: "80px",
  }

  const badgeStyle = (active) => ({
    padding: "5px 14px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    cursor: "pointer",
    border: active ? "1px solid #C4A882" : "1px solid rgba(255,255,255,0.15)",
    background: active ? "rgba(196,168,130,0.2)" : "rgba(255,255,255,0.05)",
    color: active ? "#C4A882" : "rgba(255,255,255,0.65)",
    transition: "all 0.2s",
  })

  const inputStyle = {
    background: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "13px",
    color: "#fff",
    outline: "none",
    width: "100%",
  }

  const sectionLabel = {
    fontSize: "11px",
    color: "rgba(255,255,255,0.70)",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    fontWeight: "600",
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", padding: "28px", color: "#fff" }}>

      {/* En-tête — charte Dashboard */}
      <div className="mb-8">
        <p style={{ color: "#C4A882", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: "600", marginBottom: "10px" }}>
          Gestion Portefeuille
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "300", letterSpacing: "0.02em", lineHeight: 1 }}>
          Acquéreurs
        </h1>
      </div>

      <div>
        {clients.map((client) => (
          <div key={client.id} style={card}>

            <div className="flex flex-col lg:flex-row justify-between gap-6">

              {/* Infos client */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", fontWeight: "400", letterSpacing: "0.01em" }}>
                    {client.nom}
                  </h2>
                  <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.75)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                    {client.categorie_client}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1" style={{ fontSize: "13px", color: "rgba(255,255,255,0.80)" }}>
                  <span>
                    <span style={{ color: "rgba(255,255,255,0.70)", fontSize: "10px", fontWeight: "700", letterSpacing: "0.12em", marginRight: "6px" }}>TÉL</span>
                    {client.telephone || "Non renseigné"}
                  </span>
                  <span>
                    <span style={{ color: "rgba(255,255,255,0.70)", fontSize: "10px", fontWeight: "700", letterSpacing: "0.12em", marginRight: "6px" }}>MAIL</span>
                    {client.email || "Non renseigné"}
                  </span>
                </div>
              </div>

              {/* Budget & secteur */}
              <div style={budgetBox} className="lg:text-right">
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: "400", color: "#C4A882", lineHeight: 1 }}>
                  {client.budget?.toLocaleString()} €
                </p>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.70)", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: "6px" }}>
                  {client.secteur || "Secteur à définir"}
                </p>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: "10px", paddingTop: "10px", fontSize: "12px", color: "rgba(255,255,255,0.70)", fontWeight: "400" }}>
                  {client.type_bien || "Type de bien non spécifié"}
                </div>
              </div>
            </div>

            {/* Notes + Critères */}
            <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 style={sectionLabel}>Notes Google Keep</h3>
                  <button
                    onClick={() => affinerDepuisNotes(client)}
                    style={{ fontSize: "11px", color: "#C4A882", fontWeight: "600", letterSpacing: "0.1em", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer" }}
                  >
                    ✦ Scanner la note
                  </button>
                </div>
                <div style={notesBox}>
                  <p style={{ fontSize: "13px", fontStyle: "italic", color: "rgba(255,255,255,0.80)", lineHeight: 1.6, fontWeight: "300" }}>
                    {client.notes || "Aucune note importée pour ce contact."}
                  </p>
                </div>
              </div>

              <div>
                <h3 style={{ ...sectionLabel, marginBottom: "10px" }}>Critères Qualifiés</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => updateClient(client.id, { piscine: !client.piscine })} style={badgeStyle(client.piscine)}>Piscine</button>
                  <button onClick={() => updateClient(client.id, { vue_mer: !client.vue_mer })} style={badgeStyle(client.vue_mer)}>Vue Mer</button>
                  <button onClick={() => updateClient(client.id, { garage: !client.garage })} style={badgeStyle(client.garage)}>Garage</button>
                  <button onClick={() => updateClient(client.id, { jardin: !client.jardin })} style={badgeStyle(client.jardin)}>Jardin</button>
                  <button onClick={() => updateClient(client.id, { varangue: !client.varangue })} style={badgeStyle(client.varangue)}>Varangue</button>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <input type="text" placeholder="Modifier secteur..." style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = "#C4A882"}
                    onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.10)"; if (e.target.value) updateClient(client.id, { secteur: e.target.value }) }}
                  />
                  <input type="number" placeholder="Modifier budget..." style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = "#C4A882"}
                    onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.10)"; if (e.target.value) updateClient(client.id, { budget: Number(e.target.value) }) }}
                  />
                </div>
              </div>
            </div>

          </div>
        ))}

        {clients.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.55)", fontStyle: "italic", fontSize: "14px" }}>
            Aucun acquéreur trouvé dans la base.
          </div>
        )}
      </div>

    </div>
  )
}
