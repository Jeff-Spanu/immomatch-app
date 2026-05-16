import { useEffect, useState } from "react"
import { supabase } from "../supabase"

export default function DashboardClients() {
  const [clients, setClients]               = useState([])
  const [filterCategorie, setFilterCategorie] = useState("tous")
  const [filterProjet, setFilterProjet]       = useState("tous")

  useEffect(() => { fetchClients() }, [])

  async function fetchClients() {
    const { data, error } = await supabase
      .from("clients").select("*")
      .eq("type_client", "vendeur")
      .order("id", { ascending: false })
    if (error) console.error(error)
    else setClients(data)
  }

  const filteredClients = clients.filter(c =>
    (filterCategorie === "tous" || c.categorie_client?.toLowerCase() === filterCategorie.toLowerCase()) &&
    (filterProjet === "tous" || c.projet_client?.toLowerCase() === filterProjet.toLowerCase())
  )

  const countCategorie = cat =>
    clients.filter(c => c.categorie_client?.toLowerCase() === cat.toLowerCase()).length

  const selectStyle = {
    width: "100%", background: "rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px",
    padding: "12px 16px", color: "#fff", fontSize: "13px",
    outline: "none", fontFamily: "'DM Sans', sans-serif",
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", padding: "40px", color: "#fff" }}>

      {/* En-tête — charte Dashboard */}
      <div className="mb-10">
        <p style={{ color: "#C4A882", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: "600", marginBottom: "10px" }}>
          Portefeuille vendeurs
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "300", letterSpacing: "0.02em", lineHeight: 1, color: "#fff" }}>
          Dashboard Clients
        </h1>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Vendeurs",  value: clients.length },
          { label: "Standard",        value: countCategorie("standard") },
          { label: "Prestige",        value: countCategorie("prestige") },
          { label: "Patrimoine",      value: countCategorie("patrimoine") },
        ].map(({ label, value }) => (
          <div key={label} className="liquid-glass rounded-2xl p-5 text-center">
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.70)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: "600", marginBottom: "10px" }}>
              {label}
            </p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.5rem", fontWeight: "300", color: "#fff", lineHeight: 1 }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="grid md:grid-cols-2 gap-4 mb-10">
        <select value={filterCategorie} onChange={e => setFilterCategorie(e.target.value)} style={selectStyle}
          onFocus={(e) => e.target.style.borderColor = "#C4A882"}
          onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.12)"}>
          <option value="tous"       className="bg-slate-900">Toutes catégories</option>
          <option value="standard"   className="bg-slate-900">Standard</option>
          <option value="prestige"   className="bg-slate-900">Prestige</option>
          <option value="patrimoine" className="bg-slate-900">Patrimoine</option>
          <option value="offmarket"  className="bg-slate-900">Off Market</option>
        </select>

        <select value={filterProjet} onChange={e => setFilterProjet(e.target.value)} style={selectStyle}
          onFocus={(e) => e.target.style.borderColor = "#C4A882"}
          onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.12)"}>
          <option value="tous"                    className="bg-slate-900">Tous projets</option>
          <option value="résidence principale"    className="bg-slate-900">Résidence principale</option>
          <option value="résidence secondaire"    className="bg-slate-900">Résidence secondaire</option>
          <option value="investissement locatif"  className="bg-slate-900">Investissement locatif</option>
          <option value="location saisonnière"    className="bg-slate-900">Location saisonnière</option>
          <option value="défiscalisation"         className="bg-slate-900">Défiscalisation</option>
        </select>
      </div>

      {/* Liste clients */}
      <div className="grid gap-5">
        {filteredClients.map(client => (
          <div key={client.id} className="liquid-glass rounded-2xl p-6"
            style={{ border: "1px solid rgba(255,255,255,0.10)" }}>
            <div className="flex justify-between items-start gap-6">
              <div className="flex-1">
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.3rem, 2vw, 1.7rem)", fontWeight: "400", color: "#fff", marginBottom: "6px" }}>
                  {client.nom}
                </h2>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.80)", marginBottom: "2px" }}>{client.telephone}</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.60)" }}>{client.email}</p>
              </div>
              <div className="text-right space-y-2">
                <div style={{ padding: "4px 14px", borderRadius: "20px", background: "rgba(196,168,130,0.15)", color: "#C4A882", fontSize: "11px", fontWeight: "600", letterSpacing: "0.1em", textTransform: "uppercase", border: "1px solid rgba(196,168,130,0.25)" }}>
                  {client.type_client}
                </div>
                <div style={{ padding: "4px 14px", borderRadius: "20px", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.80)", fontSize: "11px", fontWeight: "500", border: "1px solid rgba(255,255,255,0.12)" }}>
                  {client.categorie_client}
                </div>
                <div style={{ padding: "4px 14px", borderRadius: "20px", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.65)", fontSize: "11px", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {client.projet_client}
                </div>
              </div>
            </div>
            {client.notes && (
              <div style={{ marginTop: "16px", fontSize: "13px", color: "rgba(255,255,255,0.75)", fontStyle: "italic", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "12px" }}>
                {client.notes}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}
