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

function getTable(type_client) {
  switch (type_client) {
    case "vendeur":              return "vendeurs"
    case "vendeur_prestige":     return "vendeurs_prestige"
    case "acquereur_patrimoine": return "acquereurs_patrimoine"
    default:                     return "acquereurs"
  }
}

export default function Clients() {
  const [clients, setClients]       = useState([])
  const [search, setSearch]         = useState("")
  const [loading, setLoading]       = useState(true)
  const [editClient, setEditClient] = useState(null)
  const [saving, setSaving]         = useState(false)
  const [filterType, setFilterType] = useState("tous")

  useEffect(() => { fetchTousLesClients() }, [])

  async function fetchTousLesClients() {
    setLoading(true)
    const [resA, resV, resAP, resVP] = await Promise.all([
      supabase.from("acquereurs").select("*").order("created_at", { ascending: false }),
      supabase.from("vendeurs").select("*").order("created_at", { ascending: false }),
      supabase.from("acquereurs_patrimoine").select("*").order("created_at", { ascending: false }),
      supabase.from("vendeurs_prestige").select("*").order("created_at", { ascending: false }),
    ])
    const tous = [
      ...(resA.data  || []).map(r => ({ ...r, type_client: "acquereur" })),
      ...(resV.data  || []).map(r => ({ ...r, type_client: "vendeur" })),
      ...(resAP.data || []).map(r => ({ ...r, type_client: "acquereur_patrimoine" })),
      ...(resVP.data || []).map(r => ({ ...r, type_client: "vendeur_prestige" })),
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    setClients(tous)
    setLoading(false)
  }

  function openEdit(client) { setEditClient({ ...client }) }
  function closeEdit()      { setEditClient(null) }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const { id, type_client, nom, telephone, email, categorie_client, budget, secteur, notes } = editClient
    const table = getTable(type_client)
    const { error } = await supabase
      .from(table)
      .update({ nom, telephone, email, categorie_client, budget: Number(budget) || null, secteur, notes })
      .eq("id", id)
    if (error) {
      alert("Erreur : " + error.message)
    } else {
      setClients(prev => prev.map(c =>
        c.id === id && c.type_client === type_client ? { ...c, ...editClient } : c
      ))
      closeEdit()
    }
    setSaving(false)
  }

  const filteredClients = clients.filter(c => {
    const matchSearch =
      c.nom?.toLowerCase().includes(search.toLowerCase()) ||
      c.telephone?.includes(search) ||
      c.secteur?.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === "tous" || c.type_client === filterType
    return matchSearch && matchType
  })

  const typeLabel = (t) => {
    switch(t) {
      case "vendeur":              return { label: "Vendeur",     color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" }
      case "vendeur_prestige":     return { label: "V. Prestige", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" }
      case "acquereur_patrimoine": return { label: "Patrimoine",  color: "bg-blue-500/15 text-blue-400 border-blue-500/30" }
      default:                     return { label: "Acquéreur",   color: "bg-orange-500/15 text-orange-400 border-orange-500/30" }
    }
  }

  const getCategoryColor = (cat) => {
    switch(cat) {
      case 'prestige':   return 'text-[#D4AF37]'
      case 'patrimoine': return 'text-[#4A6FA5]'
      default:           return 'text-[#C87533]'
    }
  }

  const focus = (e) => e.target.style.borderColor = "#C4A882"
  const blur  = (e) => e.target.style.borderColor = "rgba(255,255,255,0.12)"

  const selectStyle = {
    background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "10px", padding: "8px 14px", color: "#fff", fontSize: "12px",
    outline: "none", fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
  }

  return (
    <div className="p-10">

      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
        <div>
          <p style={{ color: "#C4A882", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: "600", marginBottom: "10px" }}>
            Base de données
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "300", letterSpacing: "0.02em", lineHeight: 1, color: "#fff" }}>
            Tous les contacts
          </h1>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={selectStyle}
            onFocus={focus} onBlur={blur}>
            <option value="tous">Tous</option>
            <option value="acquereur">Acquéreurs</option>
            <option value="vendeur">Vendeurs</option>
            <option value="acquereur_patrimoine">Patrimoine</option>
            <option value="vendeur_prestige">Prestige</option>
          </select>
          <div className="relative w-full md:w-72">
            <input type="text" placeholder="Nom, téléphone, ville..."
              className="w-full border border-white/15 rounded-xl px-5 py-3 text-sm outline-none transition-all text-white placeholder-white/40"
              style={{ background: "rgba(8,6,4,0.62)", backdropFilter: "blur(24px)" }}
              onFocus={(e) => e.target.style.borderColor = "#C4A882"}
              onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="absolute right-5 top-3 opacity-40 text-sm">🔍</span>
          </div>
        </div>
      </div>

      {/* Compteur */}
      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.40)", marginBottom: "16px", letterSpacing: "0.08em" }}>
        {filteredClients.length} contact{filteredClients.length > 1 ? "s" : ""}
      </p>

      {/* Tableau */}
      <div style={{ background: "rgba(8, 6, 4, 0.55)", borderRadius: "24px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.10)" }}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}>
              <th className="px-5 py-3 text-[11px] uppercase tracking-widest text-white/75 font-bold">Contact</th>
              <th className="px-5 py-3 text-[11px] uppercase tracking-widest text-white/75 font-bold">Type</th>
              <th className="px-5 py-3 text-[11px] uppercase tracking-widest text-white/75 font-bold">Catégorie</th>
              <th className="px-5 py-3 text-[11px] uppercase tracking-widest text-white/75 font-bold">Localisation</th>
              <th className="px-5 py-3 text-[11px] uppercase tracking-widest text-white/75 font-bold">Budget / Prix</th>
              <th className="px-5 py-3 text-right text-[11px] uppercase tracking-widest text-white/75 font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => {
              const tl = typeLabel(client.type_client)
              return (
                <tr key={`${client.type_client}-${client.id}`}
                  className="hover:bg-white/[0.04] transition-colors group"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <td className="px-5 py-2.5">
                    <p className="text-sm font-semibold text-white/95 group-hover:text-[#C4A882] transition-colors leading-tight">{client.nom}</p>
                    <p className="text-[11px] text-white/55 mt-0.5">{client.telephone || "—"}</p>
                  </td>
                  <td className="px-5 py-2.5">
                    <span className={`text-[11px] px-3 py-1 rounded-full font-semibold uppercase tracking-wide border ${tl.color}`}>
                      {tl.label}
                    </span>
                  </td>
                  <td className={`px-5 py-2.5 text-[11px] font-bold uppercase tracking-wide ${getCategoryColor(client.categorie_client)}`}>
                    {client.categorie_client || "—"}
                  </td>
                  <td className="px-5 py-2.5 text-sm text-white/85">{client.secteur || "—"}</td>
                  <td className="px-5 py-2.5 text-sm font-medium text-white/90">
                    {client.budget ? `${Number(client.budget).toLocaleString()} €` : "—"}
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    <button onClick={() => openEdit(client)}
                      className="opacity-0 group-hover:opacity-100 hover:bg-[#C4A882]/20 hover:border-[#C4A882]/50 hover:text-[#C4A882] px-3 py-1.5 rounded-lg transition-all text-xs text-white/80 border border-white/15">
                      Modifier
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredClients.length === 0 && !loading && (
          <div className="p-16 text-center text-white/40 italic text-sm">
            Aucun contact trouvé.
          </div>
        )}
      </div>

      {/* Modal */}
      {editClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeEdit() }}
        >
          <div className="w-full max-w-2xl rounded-[32px] p-10 relative"
            style={{ background: "rgba(12, 9, 6, 0.95)", border: "1px solid rgba(196,168,130,0.25)", boxShadow: "0 40px 100px rgba(0,0,0,0.6)", maxHeight: "90vh", overflowY: "auto" }}
          >
            <button onClick={closeEdit} className="absolute top-6 right-7 text-white/40 hover:text-white/80 text-2xl">×</button>

            <div className="mb-8">
              <p style={{ color: "#C4A882", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: "600", marginBottom: "8px" }}>
                Édition · <span style={{ opacity: 0.6 }}>{getTable(editClient.type_client)}</span>
              </p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: "300", color: "#fff", lineHeight: 1 }}>
                {editClient.nom}
              </h2>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label style={labelStyle}>Nom complet</label>
                  <input required type="text" style={inputStyle} value={editClient.nom || ""} onFocus={focus} onBlur={blur} onChange={(e) => setEditClient({ ...editClient, nom: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Catégorie</label>
                  <select style={inputStyle} value={editClient.categorie_client || "standard"} onFocus={focus} onBlur={blur} onChange={(e) => setEditClient({ ...editClient, categorie_client: e.target.value })}>
                    <option value="standard"   className="bg-slate-900">Standard</option>
                    <option value="prestige"   className="bg-slate-900">Prestige</option>
                    <option value="patrimoine" className="bg-slate-900">Patrimoine</option>
                  </select>
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
                  <label style={labelStyle}>Secteur / Ville</label>
                  <input type="text" style={inputStyle} value={editClient.secteur || ""} onFocus={focus} onBlur={blur} onChange={(e) => setEditClient({ ...editClient, secteur: e.target.value })} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Notes</label>
                <textarea rows="4" style={{ ...inputStyle, resize: "vertical" }} value={editClient.notes || ""} onFocus={focus} onBlur={blur} onChange={(e) => setEditClient({ ...editClient, notes: e.target.value })} />
              </div>

              <div className="flex gap-4 pt-2">
                <button type="button" onClick={closeEdit}
                  className="flex-1 py-4 rounded-full border border-white/15 text-white/60 hover:text-white/90 transition-all text-xs uppercase tracking-[0.2em] font-semibold">
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
