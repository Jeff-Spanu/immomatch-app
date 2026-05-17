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

export default function Prestige() {
  const [clients, setClients]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [editClient, setEditClient] = useState(null)
  const [saving, setSaving]         = useState(false)

  useEffect(() => { fetchClients() }, [])

  async function fetchClients() {
    setLoading(true)
    const [resVP, resAP] = await Promise.all([
      supabase.from("vendeurs_prestige").select("*").order("budget", { ascending: false }),
      supabase.from("acquereurs_patrimoine").select("*").order("budget", { ascending: false }),
    ])
    const vendeurs   = (resVP.data || []).map(r => ({ ...r, type_client: "vendeur",   _table: "vendeurs_prestige" }))
    const acquereurs = (resAP.data || []).map(r => ({ ...r, type_client: "acquereur", _table: "acquereurs_patrimoine" }))
    setClients([...vendeurs, ...acquereurs].sort((a, b) => (b.budget || 0) - (a.budget || 0)))
    setLoading(false)
  }

  async function updateClient(client, updates) {
    const { error } = await supabase.from(client._table).update(updates).eq("id", client.id)
    if (!error) setClients(prev => prev.map(c => c.id === client.id && c._table === client._table ? { ...c, ...updates } : c))
  }

  function openEdit(client) { setEditClient({ ...client }) }
  function closeEdit()      { setEditClient(null) }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const { id, _table, nom, telephone, email, type_client, budget, secteur, notes, nb_chambres, surface_habitable, surface_terrain, type_bien } = editClient
    const { error } = await supabase
      .from(_table)
      .update({ nom, telephone, email, budget: Number(budget) || null, secteur, notes, nb_chambres, surface_habitable: Number(surface_habitable) || null, surface_terrain: Number(surface_terrain) || null, type_bien })
      .eq("id", id)
    if (error) {
      alert("Erreur : " + error.message)
    } else {
      setClients(prev => prev.map(c => c.id === id && c._table === _table ? { ...c, ...editClient } : c))
      closeEdit()
    }
    setSaving(false)
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

  const focus = (e) => e.target.style.borderColor = "#C4A882"
  const blur  = (e) => e.target.style.borderColor = "rgba(255,255,255,0.12)"

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", padding: "28px", color: "#fff" }}>

      <div className="mb-10">
        <p style={{ color: "#C4A882", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: "600", marginBottom: "10px" }}>
          Sélection Exclusive
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "300", letterSpacing: "0.02em", lineHeight: 1 }}>
          Portefeuille Prestige & Patrimoine
        </h1>
        <div style={{ width: "40px", height: "1px", background: "#C4A882", marginTop: "16px", opacity: 0.6 }} />
      </div>

      <div>
        {clients.map((client) => (
          <div key={`${client._table}-${client.id}`} style={card}>

            <div className="flex flex-col lg:flex-row justify-between gap-8">

              {/* Identité */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: client._table === "vendeurs_prestige" ? "#34d399" : "#C4A882", display: "inline-block", flexShrink: 0 }} />
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: "400", letterSpacing: "0.02em" }}>
                    {client.nom}
                  </h2>
                  <span style={{ fontSize: "10px", padding: "2px 10px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.20)", color: "rgba(255,255,255,0.55)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {client.type_client}
                  </span>
                </div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.80)", fontWeight: "300", lineHeight: 1.8 }}>
                  <div>{client.telephone || "Ligne non renseignée"}</div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)" }}>{client.email || "Email confidentiel"}</div>
                  {client.nb_chambres && <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", marginTop: "4px" }}>{client.nb_chambres} · {client.type_bien}</div>}
                </div>
              </div>

              {/* Budget */}
              <div style={prixBox} className="lg:text-right flex flex-col justify-center">
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.2rem", fontWeight: "400", color: "#C4A882", lineHeight: 1 }}>
                  {client.budget?.toLocaleString()} €
                </p>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.70)", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: "8px", fontWeight: "600" }}>
                  {client.secteur || "Localisation Premium"}
                </p>
                {client.surface_habitable && (
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.50)", marginTop: "6px" }}>
                    {client.surface_habitable} m² hab. · {client.surface_terrain} m² terrain
                  </p>
                )}
              </div>

              {/* Critères + bouton */}
              <div style={{ minWidth: "200px" }} className="flex flex-col justify-between gap-4">
                <div className="flex flex-wrap lg:justify-end gap-2">
                  <button onClick={() => updateClient(client, { vue_mer:      !client.vue_mer      })} style={badgeStyle(client.vue_mer)}>Vue Mer</button>
                  <button onClick={() => updateClient(client, { piscine:      !client.piscine      })} style={badgeStyle(client.piscine)}>Piscine</button>
                  <button onClick={() => updateClient(client, { vue_montagne: !client.vue_montagne })} style={badgeStyle(client.vue_montagne)}>Vue Montagne</button>
                  <button onClick={() => updateClient(client, { dependance:   !client.dependance   })} style={badgeStyle(client.dependance)}>Dépendance</button>
                  <button onClick={() => updateClient(client, { plain_pied:   !client.plain_pied   })} style={badgeStyle(client.plain_pied)}>Plain-pied</button>
                </div>
                <button onClick={() => openEdit(client)}
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "transparent", border: "1px solid rgba(196,168,130,0.45)", color: "#C4A882", fontSize: "11px", fontWeight: "600", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif" }}
                  onMouseOver={(e) => { e.target.style.background = "rgba(196,168,130,0.12)" }}
                  onMouseOut={(e)  => { e.target.style.background = "transparent" }}
                >
                  Ouvrir le dossier
                </button>
              </div>
            </div>

            {client.notes && (
              <div style={{ marginTop: "20px", borderTop: "1px solid rgba(196,168,130,0.12)", paddingTop: "16px", fontSize: "13px", color: "rgba(255,255,255,0.70)", fontStyle: "italic", fontWeight: "300", lineHeight: 1.6 }}>
                {client.notes}
              </div>
            )}
          </div>
        ))}

        {clients.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "60px 40px", border: "1px solid rgba(196,168,130,0.40)", borderRadius: "16px", backgroundColor: "rgba(5,4,2,0.80)" }}>
            <p style={{ fontSize: "15px", fontWeight: "500", fontStyle: "italic", color: "#fff" }}>
              Aucun dossier Prestige ou Patrimoine pour le moment.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {editClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.80)", backdropFilter: "blur(10px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeEdit() }}
        >
          <div className="w-full max-w-2xl rounded-[32px] p-10 relative"
            style={{ background: "rgba(12, 9, 6, 0.97)", border: "1px solid rgba(196,168,130,0.35)", boxShadow: "0 40px 100px rgba(0,0,0,0.7)", maxHeight: "90vh", overflowY: "auto" }}
          >
            <button onClick={closeEdit} className="absolute top-6 right-7 text-white/40 hover:text-white/80 text-2xl">×</button>

            <div className="mb-8">
              <p style={{ color: "#C4A882", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: "600", marginBottom: "8px" }}>Dossier Prestige</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: "300", color: "#fff", lineHeight: 1 }}>{editClient.nom}</h2>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label style={labelStyle}>Nom complet</label>
                  <input required type="text" style={inputStyle} value={editClient.nom || ""} onFocus={focus} onBlur={blur} onChange={(e) => setEditClient({ ...editClient, nom: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Type de bien</label>
                  <input type="text" style={inputStyle} placeholder="Villa, Appartement..." value={editClient.type_bien || ""} onFocus={focus} onBlur={blur} onChange={(e) => setEditClient({ ...editClient, type_bien: e.target.value })} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label style={labelStyle}>Téléphone</label>
                  <input type="tel" style={inputStyle} value={editClient.telephone || ""} onFocus={focus} onBlur={blur} onChange={(e) => setEditClient({ ...editClient, telephone: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" style={inputStyle} value={editClient.email || ""} onFocus={focus} onBlur={blur} onChange={(e) => setEditClient({ ...editClient, email: e.target.value })} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label style={labelStyle}>Budget / Prix (€)</label>
                  <input type="number" style={inputStyle} value={editClient.budget || ""} onFocus={focus} onBlur={blur} onChange={(e) => setEditClient({ ...editClient, budget: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Localisation</label>
                  <input type="text" style={inputStyle} value={editClient.secteur || ""} onFocus={focus} onBlur={blur} onChange={(e) => setEditClient({ ...editClient, secteur: e.target.value })} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label style={labelStyle}>Surface habitable (m²)</label>
                  <input type="number" style={inputStyle} value={editClient.surface_habitable || ""} onFocus={focus} onBlur={blur} onChange={(e) => setEditClient({ ...editClient, surface_habitable: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Surface terrain (m²)</label>
                  <input type="number" style={inputStyle} value={editClient.surface_terrain || ""} onFocus={focus} onBlur={blur} onChange={(e) => setEditClient({ ...editClient, surface_terrain: e.target.value })} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Notes & Critères</label>
                <textarea rows="4" style={{ ...inputStyle, resize: "vertical" }} value={editClient.notes || ""} onFocus={focus} onBlur={blur} onChange={(e) => setEditClient({ ...editClient, notes: e.target.value })} />
              </div>

              <div className="flex gap-4 pt-2">
                <button type="button" onClick={closeEdit} className="flex-1 py-4 rounded-full border border-white/15 text-white/60 hover:text-white/90 transition-all text-xs uppercase tracking-[0.2em] font-semibold">Annuler</button>
                <button type="submit" disabled={saving} style={{ background: "#C4A882", color: "#000" }} className="flex-1 py-4 rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:opacity-90 transition-all disabled:opacity-50">
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
