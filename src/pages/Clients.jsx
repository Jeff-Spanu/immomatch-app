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

export default function Clients() {
  const [clients, setClients]       = useState([])
  const [search, setSearch]         = useState("")
  const [loading, setLoading]       = useState(true)
  const [editClient, setEditClient] = useState(null)   // client en cours d'édition
  const [saving, setSaving]         = useState(false)

  useEffect(() => { fetchTousLesClients() }, [])

  async function fetchTousLesClients() {
    setLoading(true)
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false })
    if (!error) setClients(data || [])
    setLoading(false)
  }

  // Ouvrir le modal pré-rempli
  function openEdit(client) {
    setEditClient({ ...client })
  }

  function closeEdit() {
    setEditClient(null)
  }

  // Sauvegarder les modifications
  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const { id, nom, telephone, email, type_client, categorie_client, budget, secteur, notes } = editClient
    const { error } = await supabase
      .from("clients")
      .update({ nom, telephone, email, type_client, categorie_client, budget: Number(budget) || null, secteur, notes })
      .eq("id", id)

    if (error) {
      alert("Erreur lors de la sauvegarde : " + error.message)
    } else {
      setClients(prev => prev.map(c => c.id === id ? { ...c, ...editClient } : c))
      closeEdit()
    }
    setSaving(false)
  }

  const filteredClients = clients.filter(c =>
    c.nom?.toLowerCase().includes(search.toLowerCase()) ||
    c.telephone?.includes(search) ||
    c.secteur?.toLowerCase().includes(search.toLowerCase())
  )

  const getCategoryColor = (cat) => {
    switch(cat) {
      case 'prestige':   return 'text-[#D4AF37]'
      case 'patrimoine': return 'text-[#4A6FA5]'
      default:           return 'text-[#C87533]'
    }
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
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Nom, téléphone, ville..."
            className="w-full border border-white/15 rounded-xl px-5 py-3 text-sm outline-none transition-all text-white placeholder-white/40"
            style={{ background: "rgba(8,6,4,0.62)", backdropFilter: "blur(24px)" }}
            onFocus={(e) => e.target.style.borderColor = "#C4A882"}
            onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="absolute right-5 top-3 opacity-40 text-sm">🔍</span>
        </div>
      </div>

      {/* Tableau */}
      <div style={{
        background: "rgba(8, 6, 4, 0.55)",
        borderRadius: "24px",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.10)"
      }}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}>
              <th className="px-5 py-3 text-[11px] uppercase tracking-widest text-white/75 font-bold">Client</th>
              <th className="px-5 py-3 text-[11px] uppercase tracking-widest text-white/75 font-bold">Type</th>
              <th className="px-5 py-3 text-[11px] uppercase tracking-widest text-white/75 font-bold">Catégorie</th>
              <th className="px-5 py-3 text-[11px] uppercase tracking-widest text-white/75 font-bold">Localisation</th>
              <th className="px-5 py-3 text-[11px] uppercase tracking-widest text-white/75 font-bold">Budget / Prix</th>
              <th className="px-5 py-3 text-right text-[11px] uppercase tracking-widest text-white/75 font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr
                key={client.id}
                className="hover:bg-white/[0.04] transition-colors group"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <td className="px-5 py-2.5">
                  <p className="text-sm font-semibold text-white/95 group-hover:text-[#C4A882] transition-colors leading-tight">{client.nom}</p>
                  <p className="text-[11px] text-white/55 mt-0.5">{client.telephone || "—"}</p>
                </td>
                <td className="px-5 py-2.5">
                  <span className={`text-[11px] px-3 py-1 rounded-full font-semibold uppercase tracking-wide ${
                    client.type_client === 'vendeur'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                  }`}>
                    {client.type_client}
                  </span>
                </td>
                <td className={`px-5 py-2.5 text-[11px] font-bold uppercase tracking-wide ${getCategoryColor(client.categorie_client)}`}>
                  {client.categorie_client || "—"}
                </td>
                <td className="px-5 py-2.5 text-sm text-white/85">{client.secteur || "—"}</td>
                <td className="px-5 py-2.5 text-sm font-medium text-white/90">{client.budget?.toLocaleString()} €</td>
                <td className="px-5 py-2.5 text-right">
                  <button
                    onClick={() => openEdit(client)}
                    className="opacity-0 group-hover:opacity-100 bg-white/8 hover:bg-[#C4A882]/20 hover:border-[#C4A882]/50 hover:text-[#C4A882] px-3 py-1.5 rounded-lg transition-all text-xs text-white/80 border border-white/15"
                  >
                    Modifier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredClients.length === 0 && !loading && (
          <div className="p-16 text-center text-white/40 italic text-sm">
            Aucun contact ne correspond à votre recherche.
          </div>
        )}
      </div>

      {/* ── MODAL DE MODIFICATION ── */}
      {editClient && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeEdit() }}
        >
          <div
            className="w-full max-w-2xl rounded-[32px] p-10 relative"
            style={{
              background: "rgba(12, 9, 6, 0.95)",
              border: "1px solid rgba(196,168,130,0.25)",
              boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* Fermer */}
            <button
              onClick={closeEdit}
              className="absolute top-6 right-7 text-white/40 hover:text-white/80 transition-colors text-2xl leading-none"
            >
              ×
            </button>

            {/* Titre modal */}
            <div className="mb-8">
              <p style={{ color: "#C4A882", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: "600", marginBottom: "8px" }}>
                Édition du dossier
              </p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: "300", color: "#fff", lineHeight: 1 }}>
                {editClient.nom}
              </h2>
            </div>

            <form onSubmit={handleSave} className="space-y-6">

              {/* NOM & TYPE */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label style={labelStyle}>Nom complet</label>
                  <input
                    required type="text"
                    style={inputStyle}
                    value={editClient.nom || ""}
                    onFocus={(e) => e.target.style.borderColor = "#C4A882"}
                    onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    onChange={(e) => setEditClient({ ...editClient, nom: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Type de projet</label>
                  <select
                    style={inputStyle}
                    value={editClient.type_client || "acquereur"}
                    onFocus={(e) => e.target.style.borderColor = "#C4A882"}
                    onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    onChange={(e) => setEditClient({ ...editClient, type_client: e.target.value })}
                  >
                    <option value="acquereur" className="bg-slate-900">Acquéreur (Recherche)</option>
                    <option value="vendeur"   className="bg-slate-900">Vendeur (Mandat)</option>
                  </select>
                </div>
              </div>

              {/* CONTACT */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label style={labelStyle}>Téléphone</label>
                  <input
                    type="tel"
                    style={inputStyle}
                    value={editClient.telephone || ""}
                    onFocus={(e) => e.target.style.borderColor = "#C4A882"}
                    onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    onChange={(e) => setEditClient({ ...editClient, telephone: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    style={inputStyle}
                    value={editClient.email || ""}
                    onFocus={(e) => e.target.style.borderColor = "#C4A882"}
                    onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    onChange={(e) => setEditClient({ ...editClient, email: e.target.value })}
                  />
                </div>
              </div>

              {/* CATÉGORIE, BUDGET, SECTEUR */}
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label style={labelStyle}>Catégorie</label>
                  <select
                    style={inputStyle}
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
                <div>
                  <label style={labelStyle}>Budget / Prix (€)</label>
                  <input
                    type="number"
                    style={inputStyle}
                    value={editClient.budget || ""}
                    onFocus={(e) => e.target.style.borderColor = "#C4A882"}
                    onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    onChange={(e) => setEditClient({ ...editClient, budget: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Secteur / Ville</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={editClient.secteur || ""}
                    onFocus={(e) => e.target.style.borderColor = "#C4A882"}
                    onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    onChange={(e) => setEditClient({ ...editClient, secteur: e.target.value })}
                  />
                </div>
              </div>

              {/* NOTES */}
              <div>
                <label style={labelStyle}>Notes & Critères</label>
                <textarea
                  rows="4"
                  style={{ ...inputStyle, resize: "vertical" }}
                  placeholder="Ex : Villa avec piscine, 3 chambres, vue mer..."
                  value={editClient.notes || ""}
                  onFocus={(e) => e.target.style.borderColor = "#C4A882"}
                  onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                  onChange={(e) => setEditClient({ ...editClient, notes: e.target.value })}
                />
              </div>

              {/* BOUTONS */}
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="flex-1 py-4 rounded-full border border-white/15 text-white/60 hover:text-white/90 hover:border-white/30 transition-all text-xs uppercase tracking-[0.2em] font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-4 rounded-full bg-white text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-[#C4A882] hover:text-white transition-all disabled:opacity-50"
                >
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
