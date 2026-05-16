import { useEffect, useState } from "react"
import { supabase } from "../supabase"

export default function Prestige() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchClients() }, [])

  async function fetchClients() {
    setLoading(true)
    const { data, error } = await supabase
      .from("clients").select("*")
      .eq("categorie_client", "prestige")
      .order("budget", { ascending: false })
    if (error) { console.error(error); setClients([]) }
    else { setClients(data || []) }
    setLoading(false)
  }

  async function updateClient(clientId, updates) {
    const { error } = await supabase.from("clients").update(updates).eq("id", clientId)
    if (!error) setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, ...updates } : c)))
  }

  const card = {
    backgroundColor: "rgba(8, 6, 4, 0.50)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(196,168,130,0.20)",
    borderRadius: "16px",
    padding: "32px 36px",
    marginBottom: "20px",
  }

  const prixBox = {
    background: "rgba(0,0,0,0.30)",
    border: "1px solid rgba(196,168,130,0.15)",
    borderRadius: "12px",
    padding: "18px 22px",
    minWidth: "220px",
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

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", padding: "28px", color: "#fff" }}>

      {/* En-tête — charte Dashboard */}
      <div className="mb-10">
        <p style={{ color: "#C4A882", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: "600", marginBottom: "10px" }}>
          Sélection Exclusive
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "300", letterSpacing: "0.02em", lineHeight: 1 }}>
          Portefeuille Prestige
        </h1>
        <div style={{ width: "40px", height: "1px", background: "#C4A882", marginTop: "16px", opacity: 0.6 }} />
      </div>

      <div>
        {clients.map((client) => (
          <div key={client.id} style={card}>

            <div className="flex flex-col lg:flex-row justify-between gap-8">

              {/* Identité */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#C4A882", display: "inline-block", flexShrink: 0 }} />
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: "400", letterSpacing: "0.02em" }}>
                    {client.nom}
                  </h2>
                </div>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.70)", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: "600", marginBottom: "10px" }}>
                  Contact Privé
                </p>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.80)", fontWeight: "300", lineHeight: 1.8 }}>
                  <div>{client.telephone || "Ligne non renseignée"}</div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)" }}>{client.email || "Email confidentiel"}</div>
                </div>
              </div>

              {/* Budget & localisation */}
              <div style={prixBox} className="lg:text-right flex flex-col justify-center">
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.2rem", fontWeight: "400", color: "#C4A882", lineHeight: 1 }}>
                  {client.budget?.toLocaleString()} €
                </p>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.70)", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: "8px", fontWeight: "600" }}>
                  {client.secteur || "Localisation Premium"}
                </p>
                <div style={{ marginTop: "10px" }}>
                  <span style={{ fontSize: "10px", padding: "3px 12px", borderRadius: "20px", border: "1px solid rgba(196,168,130,0.30)", color: "#C4A882", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: "600" }}>
                    {client.type_client}
                  </span>
                </div>
              </div>

              {/* Prestations */}
              <div style={{ minWidth: "200px" }} className="flex flex-col justify-between gap-4">
                <div className="flex flex-wrap lg:justify-end gap-2">
                  <button onClick={() => updateClient(client.id, { vue_mer: !client.vue_mer })} style={badgeStyle(client.vue_mer)}>Vue Mer</button>
                  <button onClick={() => updateClient(client.id, { piscine: !client.piscine })} style={badgeStyle(client.piscine)}>Piscine</button>
                  <button onClick={() => updateClient(client.id, { varangue: !client.varangue })} style={badgeStyle(client.varangue)}>Varangue</button>
                </div>
                <button
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "transparent", border: "1px solid rgba(196,168,130,0.45)", color: "#C4A882", fontSize: "11px", fontWeight: "600", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif" }}
                  onMouseOver={(e) => { e.target.style.background = "rgba(196,168,130,0.12)" }}
                  onMouseOut={(e) => { e.target.style.background = "transparent" }}
                >
                  Ouvrir le dossier
                </button>
              </div>
            </div>

          </div>
        ))}

        {clients.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "60px 40px", border: "1px solid rgba(196,168,130,0.40)", borderRadius: "16px", backgroundColor: "rgba(5,4,2,0.80)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", fontWeight: "500", fontStyle: "italic", color: "#ffffff" }}>
              Aucun dossier Prestige pour le moment.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
