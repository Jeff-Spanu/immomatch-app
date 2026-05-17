import { useEffect, useState } from "react"
import { supabase } from "../supabase"

const modalInputStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "14px",
  padding: "14px 20px",
  outline: "none",
  color: "#fff",
  fontSize: "14px",
  fontFamily: "'DM Sans', sans-serif",
  transition: "border-color 0.2s",
}

const modalLabelStyle = {
  fontSize: "11px",
  fontWeight: "600",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.75)",
  display: "block",
  marginBottom: "8px",
  fontFamily: "'DM Sans', sans-serif",
}

export default function DashboardClients() {
  const [clients, setClients]               = useState([])
  const [loading, setLoading]               = useState(true)
  const [filterCategorie, setFilterCategorie] = useState("tous")
  const [filterProjet, setFilterProjet]       = useState("tous")
  const [editClient, setEditClient]           = useState(null)
  const [saving, setSaving]                   = useState(false)

  useEffect(() => { fetchClients() }, [])

  async function fetchClients() {
    setLoading(true)
    const { data, error } = await supabase
      .from("clients").select("*")
      .eq("type_client", "vendeur")
      .order("id", { ascending: false })
    if (error) { console.error(error); setClients([]) }
    else setClients(data || [])
    setLoading(false)
  }

  const filteredClients = clients.filter(c =>
    (filterCategorie === "tous" || c.categorie_client?.toLowerCase() === filterCategorie.toLowerCase()) &&
    (filterProjet    === "tous" || c.projet_client?.toLowerCase()    === filterProjet.toLowerCase())
  )

  const countCategorie = cat =>
    clients.filter(c => c.categorie_client?.toLowerCase() === cat.toLowerCase()).length

  function openEdit(client) { setEditClient({ ...client }) }
  function closeEdit()      { setEditClient(null) }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const { id, nom, telephone, email, categorie_client, budget, secteur, notes, projet_client, type_bien } = editClient
    const { error } = await supabase
      .from("clients")
      .update({ nom, telephone, email, categorie_client, budget: Number(budget) || null, secteur, notes, projet_client, type_bien })
      .eq("id", id)
    if (error) {
      alert("Erreur : " + error.message)
    } else {
      setClients(prev => prev.map(c => c.id === id ? { ...c, ...editClient } : c))
      closeEdit()
    }
    setSaving(false)
  }

  const selectStyle = {
    width: "100%", background: "rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px",
    padding: "12px 16px", color: "#fff", fontSize: "13px",
    outline: "none", fontFamily: "'DM Sans', sans-serif",
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", padding: "40px", color: "#fff" }}>

      {/* En-tête */}
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
          { label: "Total Vendeurs",  value: loading ? "—" : clients.length },
          { label: "Standard",        value: loading ? "—" : countCategorie("standard") },
          { label: "Prestige",        value: loading ? "—" : countCategorie("prestige") },
          { label: "Patrimoine",      value: loading ? "—" : countCategorie("patrimoine") },
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
          onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}>
          <option value="tous"       className="bg-slate-900">Toutes catégories</option>
          <option value="standard"   className="bg-slate-900">Standard</option>
          <option value="prestige"   className="bg-slate-900">Prestige</option>
          <option value="patrimoine" className="bg-slate-900">Patrimoine</option>
          <option value="offmarket"  className="bg-slate-900">Off Market</option>
        </select>

        <select value={filterProjet} onChange={e => setFilterProjet(e.target.value)} style={selectStyle}
          onFocus={(e) => e.target.style.borderColor = "#C4A882"}
          onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}>
          <option value="tous"                    className="bg-slate-900">Tous projets</option>
          <option value="résidence principale"    className="bg-slate-900">Résidence principale</option>
          <option value="résidence secondaire"    className="bg-slate-900">Résidence secondaire</option>
          <option value="investissement locatif"  className="bg-slate-900">Investissement locatif</option>
          <option value="location saisonnière"    className="bg-slate-900">Location saisonnière</option>
          <option value="défiscalisation"         className="bg-slate-900">Défiscalisation</option>
        </select>
      </div>

      {/* Chargement */}
      {loading && (
        <p style={{ color: "#C4A882", textAlign: "center", fontSize: "13px", fontStyle: "italic" }} className="animate-pulse py-20">
          Chargement du portefeuille...
        </p>
      )}

      {/* Liste clients */}
      {!loading && (
        <div className="grid gap-5">
          {filteredClients.map(client => (
            <div key={client.id} className="liquid-glass rounded-2xl p-6 group"
              style={{ border: "1px solid rgba(255,255,255,0.10)" }}>
              <div className="flex justify-between items-start gap-6">
                <div className="flex-1">
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.3rem, 2vw, 1.7rem)", fontWeight: "400", color: "#fff", marginBottom: "6px" }}>
                    {client.nom}
                  </h2>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.80)", marginBottom: "2px" }}>{client.telephone || "—"}</p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.60)" }}>{client.email || "—"}</p>
                  {client.budget > 0 && (
                    <p style={{ fontSize: "13px", color: "#C4A882", marginTop: "6px", fontFamily: "'Cormorant Garamond', serif" }}>
                      {Number(client.budget).toLocaleString()} € · {client.secteur || "Secteur non défini"}
                    </p>
                  )}
                </div>
                <div className="text-right space-y-2">
                  <div style={{ padding: "4px 14px", borderRadius: "20px", background: "rgba(196,168,130,0.15)", color: "#C4A882", fontSize: "11px", fontWeight: "600", letterSpacing: "0.1em", textTransform: "uppercase", border: "1px solid rgba(196,168,130,0.25)" }}>
                    {client.type_client}
                  </div>
                  <div style={{ padding: "4px 14px", borderRadius: "20px", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.80)", fontSize: "11px", fontWeight: "500", border: "1px solid rgba(255,255,255,0.12)" }}>
                    {client.categorie_client}
                  </div>
                  {client.projet_client && (
                    <div style={{ padding: "4px 14px", borderRadius: "20px", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.65)", fontSize: "11px", border: "1px solid rgba(255,255,255,0.08)" }}>
                      {client.projet_client}
                    </div>
                  )}
                  <button
                    onClick={() => openEdit(client)}
                    className="opacity-0 group-hover:opacity-100 transition-all text-[11px] px-3 py-1.5 rounded-lg border border-white/15 text-white/70 hover:text-[#C4A882] hover:border-[#C4A882]/40 bg-white/5"
                  >
                    ✎ Modifier
                  </button>
                </div>
              </div>
              {client.notes && (
                <div style={{ marginTop: "16px", fontSize: "13px", color: "rgba(255,255,255,0.75)", fontStyle: "italic", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "12px" }}>
                  {client.notes}
                </div>
              )}
            </div>
          ))}

          {filteredClients.length === 0 && (
            <div className="text-center py-20 italic" style={{ color: "rgba(255,255,255,0.40)", fontSize: "14px" }}>
              Aucun vendeur ne correspond aux filtres sélectionnés.
            </div>
          )}
        </div>
      )}

      {/* ── MODAL MODIFICATION ── */}
      {editClient && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(10px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeEdit() }}
        >
          <div
            className="w-full max-w-2xl rounded-[32px] p-10 relative"
            style={{
              background: "rgba(12, 9, 6, 0.97)",
              border: "1px solid rgba(196,168,130,0.25)",
              boxShadow: "0 40px 100px rgba(0,0,0,0.65)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <button onClick={closeEdit} className="absolute top-6 right-7 text-white/40 hover:text-white/80 transition-colors text-2xl leading-none">×</button>

            <div className="mb-8">
              <p style={{ color: "#C4A882", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: "600", marginBottom: "8px" }}>
                Modification du dossier
              </p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: "300", color: "#fff", lineHeight: 1 }}>
                {editClient.nom}
              </h2>
            </div>

            <form onSubmit={handleSave} className="space-y-6">

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label style={modalLabelStyle}>Nom complet</label>
                  <input required type="text" style={modalInputStyle}
                    value={editClient.nom || ""}
                    onFocus={(e) => e.target.style.borderColor = "#C4A882"}
                    onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    onChange={(e) => setEditClient({ ...editClient, nom: e.target.value })}
                  />
                </div>
                <div>
                  <label style={modalLabelStyle}>Catégorie</label>
                  <select style={modalInputStyle}
                    value={editClient.categorie_client || "standard"}
                    onFocus={(e) => e.target.style.borderColor = "#C4A882"}
                    onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    onChange={(e) => setEditClient({ ...editClient, categorie_client: e.target.value })}
                  >
                    <option value="standard"   className="bg-slate-900">Standard</option>
                    <option value="prestige"   className="bg-slate-900">Prestige</option>
                    <option value="patrimoine" className="bg-slate-900">Patrimoine</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label style={modalLabelStyle}>Téléphone</label>
                  <input type="tel" style={modalInputStyle}
                    value={editClient.telephone || ""}
                    onFocus={(e) => e.target.style.borderColor = "#C4A882"}
                    onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    onChange={(e) => setEditClient({ ...editClient, telephone: e.target.value })}
                  />
                </div>
                <div>
                  <label style={modalLabelStyle}>Email</label>
                  <input type="email" style={modalInputStyle}
                    value={editClient.email || ""}
                    onFocus={(e) => e.target.style.borderColor = "#C4A882"}
                    onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    onChange={(e) => setEditClient({ ...editClient, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label style={modalLabelStyle}>Budget / Prix (€)</label>
                  <input type="number" style={modalInputStyle}
                    value={editClient.budget || ""}
                    onFocus={(e) => e.target.style.borderColor = "#C4A882"}
                    onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    onChange={(e) => setEditClient({ ...editClient, budget: e.target.value })}
                  />
                </div>
                <div>
                  <label style={modalLabelStyle}>Secteur / Ville</label>
                  <input type="text" style={modalInputStyle}
                    value={editClient.secteur || ""}
                    onFocus={(e) => e.target.style.borderColor = "#C4A882"}
                    onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    onChange={(e) => setEditClient({ ...editClient, secteur: e.target.value })}
                  />
                </div>
                <div>
                  <label style={modalLabelStyle}>Type de bien</label>
                  <input type="text" style={modalInputStyle}
                    placeholder="Villa, Appartement..."
                    value={editClient.type_bien || ""}
                    onFocus={(e) => e.target.style.borderColor = "#C4A882"}
                    onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    onChange={(e) => setEditClient({ ...editClient, type_bien: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={modalLabelStyle}>Projet</label>
                <select style={modalInputStyle}
                  value={editClient.projet_client || "résidence principale"}
                  onFocus={(e) => e.target.style.borderColor = "#C4A882"}
                  onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                  onChange={(e) => setEditClient({ ...editClient, projet_client: e.target.value })}
                >
                  <option value="résidence principale"   className="bg-slate-900">Résidence principale</option>
                  <option value="résidence secondaire"   className="bg-slate-900">Résidence secondaire</option>
                  <option value="investissement locatif" className="bg-slate-900">Investissement locatif</option>
                  <option value="location saisonnière"   className="bg-slate-900">Location saisonnière</option>
                  <option value="défiscalisation"        className="bg-slate-900">Défiscalisation</option>
                </select>
              </div>

              <div>
                <label style={modalLabelStyle}>Notes</label>
                <textarea rows="3" style={{ ...modalInputStyle, resize: "vertical" }}
                  value={editClient.notes || ""}
                  onFocus={(e) => e.target.style.borderColor = "#C4A882"}
                  onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                  onChange={(e) => setEditClient({ ...editClient, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button type="button" onClick={closeEdit}
                  className="flex-1 py-4 rounded-full border border-white/15 text-white/60 hover:text-white/90 hover:border-white/30 transition-all text-xs uppercase tracking-[0.2em] font-semibold">
                  Annuler
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-4 rounded-full bg-white text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-[#C4A882] hover:text-white transition-all disabled:opacity-50">
                  {saving ? "Enregistrement..." : "Sauvegarder"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}
