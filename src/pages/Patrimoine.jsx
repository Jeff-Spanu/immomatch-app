import { useEffect, useState } from "react"
import { supabase } from "../supabase"

const inputStyle = {
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

const labelStyle = {
  fontSize: "11px",
  fontWeight: "600",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.75)",
  display: "block",
  marginBottom: "8px",
  fontFamily: "'DM Sans', sans-serif",
}

export default function Patrimoine() {
  const [clients, setClients]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [editClient, setEditClient] = useState(null)
  const [saving, setSaving]         = useState(false)
  const [newNote, setNewNote]       = useState("")

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
    if (!error) setClients(prev => prev.map(c => c.id === clientId ? { ...c, ...updates } : c))
  }

  function openEdit(client) {
    setEditClient({ ...client })
    setNewNote("")
  }
  function closeEdit() { setEditClient(null) }

  // Ajouter une note horodatée à l'historique
  function ajouterNote() {
    if (!newNote.trim()) return
    const date = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
    const entree = `[${date}] ${newNote.trim()}`
    const notesExistantes = editClient.notes ? editClient.notes + "\n" + entree : entree
    setEditClient({ ...editClient, notes: notesExistantes })
    setNewNote("")
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const { id, nom, telephone, email, type_client, categorie_client, budget, secteur, notes, projet_client } = editClient
    const { error } = await supabase
      .from("clients")
      .update({ nom, telephone, email, type_client, categorie_client, budget: Number(budget) || null, secteur, notes, projet_client })
      .eq("id", id)
    if (error) {
      alert("Erreur : " + error.message)
    } else {
      setClients(prev => prev.map(c => c.id === id ? { ...c, ...editClient } : c))
      closeEdit()
    }
    setSaving(false)
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
                <button
                  onClick={() => openEdit(client)}
                  style={{ fontSize: "11px", color: "#7BA7D4", letterSpacing: "0.12em", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontWeight: "600", fontFamily: "'DM Sans', sans-serif" }}
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

      {/* ── MODAL HISTORIQUE & ÉDITION ── */}
      {editClient && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.80)", backdropFilter: "blur(10px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeEdit() }}
        >
          <div
            className="w-full max-w-2xl rounded-[32px] p-10 relative"
            style={{
              background: "rgba(10, 12, 18, 0.97)",
              border: "1px solid rgba(74,111,165,0.40)",
              boxShadow: "0 0 80px rgba(74,111,165,0.08), 0 40px 100px rgba(0,0,0,0.7)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <button onClick={closeEdit} className="absolute top-6 right-7 text-white/40 hover:text-white/80 transition-colors text-2xl leading-none">×</button>

            <div className="mb-8">
              <p style={{ color: "#7BA7D4", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: "600", marginBottom: "8px" }}>
                Dossier Patrimoine
              </p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: "300", color: "#fff", lineHeight: 1 }}>
                {editClient.nom}
              </h2>
            </div>

            <form onSubmit={handleSave} className="space-y-6">

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label style={labelStyle}>Nom complet</label>
                  <input required type="text" style={inputStyle}
                    value={editClient.nom || ""}
                    onFocus={(e) => e.target.style.borderColor = "#7BA7D4"}
                    onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    onChange={(e) => setEditClient({ ...editClient, nom: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Type de projet</label>
                  <select style={inputStyle}
                    value={editClient.projet_client || "défiscalisation"}
                    onFocus={(e) => e.target.style.borderColor = "#7BA7D4"}
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
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label style={labelStyle}>Téléphone</label>
                  <input type="tel" style={inputStyle}
                    value={editClient.telephone || ""}
                    onFocus={(e) => e.target.style.borderColor = "#7BA7D4"}
                    onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    onChange={(e) => setEditClient({ ...editClient, telephone: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" style={inputStyle}
                    value={editClient.email || ""}
                    onFocus={(e) => e.target.style.borderColor = "#7BA7D4"}
                    onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    onChange={(e) => setEditClient({ ...editClient, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label style={labelStyle}>Enveloppe (€)</label>
                  <input type="number" style={inputStyle}
                    value={editClient.budget || ""}
                    onFocus={(e) => e.target.style.borderColor = "#7BA7D4"}
                    onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    onChange={(e) => setEditClient({ ...editClient, budget: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Secteur / Zone</label>
                  <input type="text" style={inputStyle}
                    value={editClient.secteur || ""}
                    onFocus={(e) => e.target.style.borderColor = "#7BA7D4"}
                    onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    onChange={(e) => setEditClient({ ...editClient, secteur: e.target.value })}
                  />
                </div>
              </div>

              {/* Historique des échanges */}
              <div>
                <label style={{ ...labelStyle, color: "#7BA7D4" }}>Historique des échanges</label>

                {/* Historique existant */}
                <div style={{ background: "rgba(0,0,0,0.30)", border: "1px solid rgba(74,111,165,0.20)", borderRadius: "12px", padding: "16px", minHeight: "100px", marginBottom: "12px", maxHeight: "160px", overflowY: "auto" }}>
                  {editClient.notes ? (
                    editClient.notes.split("\n").map((line, i) => (
                      <p key={i} style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", lineHeight: 1.7, fontStyle: line.startsWith("[") ? "normal" : "italic" }}>
                        {line}
                      </p>
                    ))
                  ) : (
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>Aucun échange enregistré pour ce dossier.</p>
                  )}
                </div>

                {/* Ajouter une note */}
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Ajouter un échange (appel, visite, proposition...)..."
                    style={{ ...inputStyle, flex: 1 }}
                    value={newNote}
                    onFocus={(e) => e.target.style.borderColor = "#7BA7D4"}
                    onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); ajouterNote() } }}
                  />
                  <button
                    type="button"
                    onClick={ajouterNote}
                    style={{ padding: "0 20px", borderRadius: "14px", background: "rgba(74,111,165,0.20)", border: "1px solid rgba(74,111,165,0.40)", color: "#7BA7D4", fontSize: "11px", fontWeight: "600", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}
                    onMouseOver={(e) => e.target.style.background = "rgba(74,111,165,0.35)"}
                    onMouseOut={(e)  => e.target.style.background = "rgba(74,111,165,0.20)"}
                  >
                    + Ajouter
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button type="button" onClick={closeEdit}
                  className="flex-1 py-4 rounded-full border border-white/15 text-white/60 hover:text-white/90 hover:border-white/30 transition-all text-xs uppercase tracking-[0.2em] font-semibold">
                  Annuler
                </button>
                <button type="submit" disabled={saving}
                  style={{ background: "rgba(74,111,165,0.85)", color: "#fff", flex: 1 }}
                  className="py-4 rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:opacity-90 transition-all disabled:opacity-50">
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
