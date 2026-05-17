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

export default function Vendeurs() {
  const [clients, setClients]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [editClient, setEditClient] = useState(null)
  const [saving, setSaving]         = useState(false)

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
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, ...updates } : c))
  }

  function openEdit(client) { setEditClient({ ...client }) }
  function closeEdit()      { setEditClient(null) }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const { id, nom, telephone, email, categorie_client, budget, secteur, notes, type_bien } = editClient
    const { error } = await supabase
      .from("clients")
      .update({ nom, telephone, email, categorie_client, budget: Number(budget) || null, secteur, notes, type_bien })
      .eq("id", id)
    if (error) {
      alert("Erreur : " + error.message)
    } else {
      setClients(prev => prev.map(c => c.id === id ? { ...c, ...editClient } : c))
      closeEdit()
    }
    setSaving(false)
  }

  const badgeStyle = (active) => `px-4 py-1.5 rounded-full text-[11px] uppercase font-bold transition-all duration-500 ${
    active
      ? "bg-emerald-600 text-white border border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
      : "bg-white/5 text-white/65 border border-white/15"
  }`

  return (
    <div className="p-10">

      {/* En-tête */}
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
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: "400", color: "#fff" }}>
                    {client.nom}
                  </h2>
                  <span className="bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/40 font-bold text-emerald-400"
                    style={{ fontSize: "10px" }}>
                    Mandat Actif
                  </span>
                  {/* Bouton modifier */}
                  <button
                    onClick={() => openEdit(client)}
                    style={{ fontSize: "10px", padding: "3px 12px", borderRadius: "20px", border: "1px solid rgba(52,211,153,0.35)", color: "#34d399", background: "rgba(52,211,153,0.08)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: "600", cursor: "pointer", transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif" }}
                    onMouseOver={(e) => e.target.style.background = "rgba(52,211,153,0.18)"}
                    onMouseOut={(e)  => e.target.style.background = "rgba(52,211,153,0.08)"}
                  >
                    ✎ Modifier
                  </button>
                </div>
                <div className="flex flex-wrap gap-6 text-sm" style={{ color: "rgba(255,255,255,0.80)", fontFamily: "'DM Sans', sans-serif" }}>
                  <span className="flex items-center gap-2">📱 {client.telephone || "—"}</span>
                  <span className="flex items-center gap-2">📍 {client.secteur || "Secteur non défini"}</span>
                  {client.email && <span className="flex items-center gap-2">✉️ {client.email}</span>}
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
                  <button onClick={() => updateClient(client.id, { piscine:  !client.piscine  })} className={badgeStyle(client.piscine)}>Piscine</button>
                  <button onClick={() => updateClient(client.id, { vue_mer:  !client.vue_mer  })} className={badgeStyle(client.vue_mer)}>Vue Mer</button>
                  <button onClick={() => updateClient(client.id, { garage:   !client.garage   })} className={badgeStyle(client.garage)}>Garage</button>
                  <button onClick={() => updateClient(client.id, { jardin:   !client.jardin   })} className={badgeStyle(client.jardin)}>Jardin</button>
                  <button onClick={() => updateClient(client.id, { varangue: !client.varangue })} className={badgeStyle(client.varangue)}>Varangue</button>
                </div>
                {/* Inputs rapides — bug corrigé : garde si non vide */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <input type="text" placeholder="Ville du bien..."
                    key={`secteur-${client.id}`}
                    defaultValue={client.secteur || ""}
                    className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-sm outline-none text-white placeholder-white/40"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                    onFocus={(e) => e.target.style.borderColor = "#34d399"}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255,255,255,0.10)"
                      if (e.target.value.trim()) updateClient(client.id, { secteur: e.target.value.trim() })
                    }}
                  />
                  <input type="number" placeholder="Nouveau prix..."
                    key={`budget-${client.id}`}
                    defaultValue={client.budget || ""}
                    className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-sm outline-none text-white placeholder-white/40"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                    onFocus={(e) => e.target.style.borderColor = "#34d399"}
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
          <div className="text-center py-20 italic" style={{ color: "rgba(255,255,255,0.55)", fontSize: "14px" }}>
            Aucun vendeur trouvé dans la base.
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
              background: "rgba(8, 12, 10, 0.97)",
              border: "1px solid rgba(52,211,153,0.25)",
              boxShadow: "0 0 60px rgba(52,211,153,0.06), 0 40px 100px rgba(0,0,0,0.65)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <button onClick={closeEdit} className="absolute top-6 right-7 text-white/40 hover:text-white/80 transition-colors text-2xl leading-none">×</button>

            <div className="mb-8">
              <p style={{ color: "#34d399", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: "600", marginBottom: "8px" }}>
                Mandat Vendeur
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
                    onFocus={(e) => e.target.style.borderColor = "#34d399"}
                    onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    onChange={(e) => setEditClient({ ...editClient, nom: e.target.value })}
                  />
                </div>
                <div>
                  <label style={modalLabelStyle}>Catégorie</label>
                  <select style={modalInputStyle}
                    value={editClient.categorie_client || "standard"}
                    onFocus={(e) => e.target.style.borderColor = "#34d399"}
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
                    onFocus={(e) => e.target.style.borderColor = "#34d399"}
                    onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    onChange={(e) => setEditClient({ ...editClient, telephone: e.target.value })}
                  />
                </div>
                <div>
                  <label style={modalLabelStyle}>Email</label>
                  <input type="email" style={modalInputStyle}
                    value={editClient.email || ""}
                    onFocus={(e) => e.target.style.borderColor = "#34d399"}
                    onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    onChange={(e) => setEditClient({ ...editClient, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label style={modalLabelStyle}>Prix de vente (€)</label>
                  <input type="number" style={modalInputStyle}
                    value={editClient.budget || ""}
                    onFocus={(e) => e.target.style.borderColor = "#34d399"}
                    onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    onChange={(e) => setEditClient({ ...editClient, budget: e.target.value })}
                  />
                </div>
                <div>
                  <label style={modalLabelStyle}>Localisation</label>
                  <input type="text" style={modalInputStyle}
                    value={editClient.secteur || ""}
                    onFocus={(e) => e.target.style.borderColor = "#34d399"}
                    onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    onChange={(e) => setEditClient({ ...editClient, secteur: e.target.value })}
                  />
                </div>
                <div>
                  <label style={modalLabelStyle}>Type de bien</label>
                  <input type="text" style={modalInputStyle}
                    placeholder="Villa, Appartement..."
                    value={editClient.type_bien || ""}
                    onFocus={(e) => e.target.style.borderColor = "#34d399"}
                    onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    onChange={(e) => setEditClient({ ...editClient, type_bien: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={modalLabelStyle}>Notes de visite</label>
                <textarea rows="4"
                  style={{ ...modalInputStyle, resize: "vertical" }}
                  placeholder="Description du bien, travaux, atouts, contraintes..."
                  value={editClient.notes || ""}
                  onFocus={(e) => e.target.style.borderColor = "#34d399"}
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
                  style={{ flex: 1, background: saving ? "rgba(52,211,153,0.4)" : "rgba(52,211,153,0.85)", color: "#000" }}
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
