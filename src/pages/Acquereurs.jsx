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

export default function Acquereurs() {
  const [clients, setClients]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [editClient, setEditClient] = useState(null)
  const [saving, setSaving]         = useState(false)

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
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, ...updates } : c))
  }

  function openEdit(client) { setEditClient({ ...client }) }
  function closeEdit()      { setEditClient(null) }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const { id, nom, telephone, email, categorie_client, budget, secteur, notes } = editClient
    const { error } = await supabase
      .from("clients")
      .update({ nom, telephone, email, categorie_client, budget: Number(budget) || null, secteur, notes })
      .eq("id", id)
    if (error) {
      alert("Erreur : " + error.message)
    } else {
      setClients(prev => prev.map(c => c.id === id ? { ...c, ...editClient } : c))
      closeEdit()
    }
    setSaving(false)
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

  const inlineInputStyle = {
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

      {/* En-tête */}
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
                  {/* Bouton modifier */}
                  <button
                    onClick={() => openEdit(client)}
                    style={{ fontSize: "10px", padding: "3px 12px", borderRadius: "20px", border: "1px solid rgba(196,168,130,0.35)", color: "#C4A882", background: "rgba(196,168,130,0.08)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: "600", cursor: "pointer", transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif" }}
                    onMouseOver={(e) => e.target.style.background = "rgba(196,168,130,0.18)"}
                    onMouseOut={(e)  => e.target.style.background = "rgba(196,168,130,0.08)"}
                  >
                    ✎ Modifier
                  </button>
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
                  <button onClick={() => updateClient(client.id, { piscine:  !client.piscine  })} style={badgeStyle(client.piscine)}>Piscine</button>
                  <button onClick={() => updateClient(client.id, { vue_mer:  !client.vue_mer  })} style={badgeStyle(client.vue_mer)}>Vue Mer</button>
                  <button onClick={() => updateClient(client.id, { garage:   !client.garage   })} style={badgeStyle(client.garage)}>Garage</button>
                  <button onClick={() => updateClient(client.id, { jardin:   !client.jardin   })} style={badgeStyle(client.jardin)}>Jardin</button>
                  <button onClick={() => updateClient(client.id, { varangue: !client.varangue })} style={badgeStyle(client.varangue)}>Varangue</button>
                </div>
                {/* Inputs rapides — correctement contrôlés */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <input
                    type="text"
                    placeholder="Modifier secteur..."
                    style={inlineInputStyle}
                    defaultValue={client.secteur || ""}
                    key={`secteur-${client.id}`}
                    onFocus={(e) => e.target.style.borderColor = "#C4A882"}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255,255,255,0.10)"
                      if (e.target.value.trim()) updateClient(client.id, { secteur: e.target.value.trim() })
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Modifier budget..."
                    style={inlineInputStyle}
                    defaultValue={client.budget || ""}
                    key={`budget-${client.id}`}
                    onFocus={(e) => e.target.style.borderColor = "#C4A882"}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255,255,255,0.10)"
                      if (e.target.value.trim()) updateClient(client.id, { budget: Number(e.target.value) })
                    }}
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
                Dossier Acquéreur
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

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label style={modalLabelStyle}>Budget (€)</label>
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
              </div>

              <div>
                <label style={modalLabelStyle}>Notes & Critères</label>
                <textarea rows="4"
                  style={{ ...modalInputStyle, resize: "vertical" }}
                  placeholder="Ex : Villa avec piscine, 3 chambres, vue mer..."
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
