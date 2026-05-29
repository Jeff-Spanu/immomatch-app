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

const CRITERES = [
  { key: "piscine",      label: "Piscine" },
  { key: "vue_mer",      label: "Vue Mer" },
  { key: "vue_montagne", label: "Vue Montagne" },
  { key: "garage",       label: "Garage" },
  { key: "dependance",   label: "Dépendance" },
  { key: "plain_pied",   label: "Plain-pied" },
]

function scanNotes(txt = "") {
  const n = txt.toLowerCase()
  const SECTEURS = ["Saint-Denis","Sainte-Marie","Sainte-Suzanne","Saint-André","Bras-Panon","Saint-Benoît","Sainte-Rose","Saint-Pierre","Saint-Joseph","Petite-Île","Le Tampon","Entre-Deux","Saint-Louis","Étang-Salé","Saint-Philippe","Saint-Paul","Saint-Leu","Trois-Bassins","La Possession","Le Port","Cilaos","Salazie","Plaine-des-Palmistes","La Montagne"]
  const budget = (() => {
    const k = n.match(/(\d+)\s*k/); if (k) return parseInt(k[1]) * 1000
    const m = n.match(/(\d{2,4})\s*000/); if (m) return parseInt(m[1]) * 1000
    return null
  })()
  const nb_chambres = (() => {
    const t = n.match(/\bt(\d)\b/); if (t) return `T${t[1]}`
    const c = n.match(/(\d)\s*chambre/); if (c) return `T${parseInt(c[1])+1}`
    return null
  })()
  return {
    piscine: n.includes("piscine")||n.includes("bassin"),
    vue_mer: n.includes("vue mer")||n.includes("bord de mer"),
    vue_montagne: n.includes("vue montagne")||n.includes("cirque"),
    garage: n.includes("garage")||n.includes("box"),
    dependance: n.includes("dépendance")||n.includes("dependance"),
    plain_pied: n.includes("plain-pied")||n.includes("plain pied"),
    budget, nb_chambres,
    secteur: SECTEURS.find(s => n.includes(s.toLowerCase())) || null,
  }
}

export default function Vendeurs() {
  const [clients, setClients]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [editClient, setEditClient] = useState(null)
  const [saving, setSaving]         = useState(false)
  const [search, setSearch]         = useState("")

  useEffect(() => { fetchClients() }, [])

  async function fetchClients() {
    setLoading(true)
    const { data, error } = await supabase.from("vendeurs").select("*").order("id", { ascending: false })
    if (error) { console.error(error); setClients([]) }
    else setClients(data || [])
    setLoading(false)
  }

  async function updateClient(clientId, updates) {
    const { error } = await supabase.from("vendeurs").update(updates).eq("id", clientId)
    if (error) { console.error(error); return }
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, ...updates } : c))
  }

  async function affinerDepuisNotes(client) {
    const p = scanNotes(client.notes)
    const updates = {}
    CRITERES.forEach(({ key }) => { if (p[key]) updates[key] = true })
    if (p.budget)      updates.budget      = p.budget
    if (p.nb_chambres) updates.nb_chambres = p.nb_chambres
    if (p.secteur)     updates.secteur     = p.secteur
    await updateClient(client.id, updates)
    alert("Caractéristiques extraites 🏠")
  }

  function openEdit(client) { setEditClient({ ...client }) }
  function closeEdit()      { setEditClient(null) }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const { id, nom, telephone, email, categorie_client, budget, prix_vente, secteur, notes, nb_chambres, surface_habitable, surface_terrain, type_bien, altitude, projet_client, apporteur_affaires } = editClient
    // prix_vente = champ dédié vendeur ; budget = fallback legacy
    const prixNum = Number(prix_vente) || Number(budget) || null
    const payload = { nom, telephone, email, categorie_client, prix_vente: prixNum, budget: prixNum, secteur, notes, nb_chambres, surface_habitable: Number(surface_habitable)||null, surface_terrain: Number(surface_terrain)||null, type_bien, altitude, projet_client, apporteur_affaires: apporteur_affaires || null }
    let error
    if (id) {
      ({ error } = await supabase.from("vendeurs").update(payload).eq("id", id))
    } else {
      ({ error } = await supabase.from("vendeurs").insert([{ ...payload, statut: "prospect" }]))
    }
    if (error) { alert("Erreur : " + error.message) }
    else { await fetchClients(); closeEdit() }
    setSaving(false)
  }

  const card = {
    backgroundColor: "rgba(8, 6, 4, 0.50)",
    backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(52,211,153,0.18)",
    borderRadius: "24px", padding: "28px 32px", marginBottom: "20px",
  }
  const prixBox = {
    background: "rgba(0,0,0,0.30)", border: "1px solid rgba(52,211,153,0.15)",
    borderRadius: "12px", padding: "18px 22px", minWidth: "220px",
  }
  const notesBox = {
    background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px", padding: "14px 16px", minHeight: "80px",
  }
  const badgeStyle = (active) => ({
    padding: "5px 14px", borderRadius: "20px", fontSize: "11px", fontWeight: "600",
    letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
    border: active ? "1px solid #34d399" : "1px solid rgba(255,255,255,0.15)",
    background: active ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.05)",
    color: active ? "#34d399" : "rgba(255,255,255,0.65)", transition: "all 0.2s",
  })
  const inlineInputStyle = {
    background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "8px", padding: "8px 12px", fontSize: "13px",
    color: "#fff", outline: "none", width: "100%",
  }
  const sectionLabel = {
    fontSize: "11px", color: "rgba(255,255,255,0.70)",
    letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: "600",
  }
  const focus = (e) => e.target.style.borderColor = "#34d399"
  const blur  = (e) => e.target.style.borderColor = "rgba(255,255,255,0.12)"

  const q = search.toLowerCase()
  const filteredClients = search
    ? clients.filter(c =>
        (c.nom || '').toLowerCase().includes(q) ||
        (c.secteur || '').toLowerCase().includes(q) ||
        (c.type_bien || '').toLowerCase().includes(q) ||
        (c.telephone || '').toLowerCase().includes(q)
      )
    : clients

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", padding: "16px", color: "#fff" }}>

      <div className="mb-6 flex items-center gap-3 liquid-glass rounded-2xl px-4 py-2.5 border border-white/10">
        <span className="text-white/40 text-sm">🔍</span>
        <input
          type="text"
          placeholder="Rechercher par nom, secteur, type..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-white placeholder:text-white/30 text-sm outline-none"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-white/40 hover:text-white/70 text-xs">✕</button>
        )}
      </div>
      <div className="mb-5 flex justify-between items-end">
        <div>
          <p style={{ color: "#C4A882", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: "600", marginBottom: "10px" }}>Mandats de vente</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "300", letterSpacing: "0.02em", lineHeight: 1 }}>Vendeurs</h1>
        </div>
        <button onClick={() => openEdit({ nom:"", telephone:"", email:"", categorie_client:"standard", budget:"", secteur:"", notes:"", type_bien:"", nb_chambres:"", surface_habitable:"", surface_terrain:"", altitude:"", projet_client:"résidence principale" })}
          style={{ padding: "10px 20px", borderRadius: "12px", border: "1px solid rgba(52,211,153,0.40)", background: "rgba(52,211,153,0.10)", color: "#34d399", fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
          + Ajouter
        </button>
      </div>

      <div>
        {filteredClients.map((client) => (
          <div key={client.id} style={card}>
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", fontWeight: "400" }}>{client.nom}</h2>
                  <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "20px", border: "1px solid rgba(52,211,153,0.30)", color: "#34d399", letterSpacing: "0.15em", textTransform: "uppercase" }}>{client.categorie_client}</span>
                  <button onClick={() => openEdit(client)}
                    style={{ fontSize: "10px", padding: "3px 12px", borderRadius: "20px", border: "1px solid rgba(52,211,153,0.35)", color: "#34d399", background: "rgba(52,211,153,0.08)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: "600", cursor: "pointer", transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif" }}
                    onMouseOver={(e) => e.target.style.background = "rgba(52,211,153,0.18)"}
                    onMouseOut={(e)  => e.target.style.background = "rgba(52,211,153,0.08)"}
                  >✎ Modifier</button>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1" style={{ fontSize: "13px", color: "rgba(255,255,255,0.80)" }}>
                  <span><span style={{ color: "rgba(255,255,255,0.70)", fontSize: "10px", fontWeight: "700", letterSpacing: "0.12em", marginRight: "6px" }}>TÉL</span>{client.telephone || "Non renseigné"}</span>
                  <span><span style={{ color: "rgba(255,255,255,0.70)", fontSize: "10px", fontWeight: "700", letterSpacing: "0.12em", marginRight: "6px" }}>MAIL</span>{client.email || "Non renseigné"}</span>
                </div>
              </div>

              <div style={prixBox} className="lg:text-right">
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: "400", color: "#34d399", lineHeight: 1 }}>{(client.prix_vente || client.budget)?.toLocaleString()} €</p>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.70)", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: "6px" }}>{client.secteur || "Secteur à définir"}</p>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: "10px", paddingTop: "10px", fontSize: "12px", color: "rgba(255,255,255,0.70)" }}>
                  {client.type_bien || "Type non spécifié"}
                  {client.nb_chambres && <span style={{ marginLeft: "8px", color: "#34d399" }}>· {client.nb_chambres}</span>}
                </div>
                {(client.surface_habitable || client.surface_terrain) && (
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.50)", marginTop: "4px" }}>
                    {client.surface_habitable && `${client.surface_habitable}m² hab.`}
                    {client.surface_habitable && client.surface_terrain && " · "}
                    {client.surface_terrain && `${client.surface_terrain}m² terrain`}
                  </div>
                )}
                {client.apporteur_affaires && (
                  <div style={{ marginTop: "6px", fontSize: "11px", color: "#D4AF37" }}>👤 {client.apporteur_affaires}</div>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 style={sectionLabel}>Notes de visite</h3>
                  <button onClick={() => affinerDepuisNotes(client)} style={{ fontSize: "11px", color: "#34d399", fontWeight: "600", letterSpacing: "0.1em", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer" }}>✦ Extraire les critères</button>
                </div>
                <div style={notesBox}>
                  <p style={{ fontSize: "13px", fontStyle: "italic", color: "rgba(255,255,255,0.80)", lineHeight: 1.6, fontWeight: "300" }}>
                    {client.notes ? `"${client.notes}"` : "Aucune note de visite."}
                  </p>
                </div>
              </div>

              <div>
                <h3 style={{ ...sectionLabel, marginBottom: "10px" }}>Prestations du bien</h3>
                <div className="flex flex-wrap gap-2">
                  {CRITERES.map(({ key, label }) => (
                    <button key={key} onClick={() => updateClient(client.id, { [key]: !client[key] })} style={badgeStyle(client[key])}>{label}</button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <input type="text" placeholder="Modifier secteur..." style={inlineInputStyle} defaultValue={client.secteur || ""} key={`s-${client.id}`}
                    onFocus={(e) => e.target.style.borderColor = "#34d399"}
                    onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.10)"; if (e.target.value.trim()) updateClient(client.id, { secteur: e.target.value.trim() }) }}
                  />
                  <input type="number" placeholder="Modifier prix..." style={inlineInputStyle} defaultValue={client.budget || ""} key={`b-${client.id}`}
                    onFocus={(e) => e.target.style.borderColor = "#34d399"}
                    onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.10)"; if (e.target.value.trim()) updateClient(client.id, { budget: Number(e.target.value) }) }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {clients.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.55)", fontStyle: "italic", fontSize: "14px" }}>Aucun vendeur trouvé dans la base.</div>
        )}
      </div>

      {editClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(10px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeEdit() }}
        >
          <div className="w-full max-w-2xl rounded-[32px] p-10 relative"
            style={{ background: "rgba(8, 12, 10, 0.97)", border: "1px solid rgba(52,211,153,0.25)", boxShadow: "0 40px 100px rgba(0,0,0,0.65)", maxHeight: "90vh", overflowY: "auto" }}
          >
            <button onClick={closeEdit} className="absolute top-6 right-7 text-white/40 hover:text-white/80 text-2xl leading-none">×</button>
            <div className="mb-8">
              <p style={{ color: "#34d399", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: "600", marginBottom: "8px" }}>{editClient.id ? "Mandat Vendeur" : "Nouveau Vendeur"}</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: "300", color: "#fff", lineHeight: 1 }}>{editClient.nom || "Nouveau vendeur"}</h2>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div><label style={modalLabelStyle}>Nom complet</label><input required type="text" style={modalInputStyle} value={editClient.nom||""} onFocus={focus} onBlur={blur} onChange={(e) => setEditClient({...editClient, nom: e.target.value})} /></div>
                <div><label style={modalLabelStyle}>Catégorie</label>
                  <select style={modalInputStyle} value={editClient.categorie_client||"standard"} onFocus={focus} onBlur={blur} onChange={(e) => setEditClient({...editClient, categorie_client: e.target.value})}>
                    <option value="standard" className="bg-slate-900">Standard</option>
                    <option value="prestige" className="bg-slate-900">Prestige</option>
                    <option value="patrimoine" className="bg-slate-900">Patrimoine</option>
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div><label style={modalLabelStyle}>Téléphone</label><input type="tel" style={modalInputStyle} value={editClient.telephone||""} onFocus={focus} onBlur={blur} onChange={(e) => setEditClient({...editClient, telephone: e.target.value})} /></div>
                <div><label style={modalLabelStyle}>Email</label><input type="email" style={modalInputStyle} value={editClient.email||""} onFocus={focus} onBlur={blur} onChange={(e) => setEditClient({...editClient, email: e.target.value})} /></div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div><label style={modalLabelStyle}>Prix de vente (€)</label><input type="number" style={modalInputStyle} value={editClient.prix_vente||editClient.budget||""} onFocus={focus} onBlur={blur} onChange={(e) => setEditClient({...editClient, prix_vente: e.target.value, budget: e.target.value})} /></div>
                <div><label style={modalLabelStyle}>Secteur / Ville</label><input type="text" style={modalInputStyle} value={editClient.secteur||""} onFocus={focus} onBlur={blur} onChange={(e) => setEditClient({...editClient, secteur: e.target.value})} /></div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div><label style={modalLabelStyle}>Membre Alchemistria (apporteur)</label>
                  <select style={modalInputStyle} value={editClient.apporteur_affaires||""} onFocus={focus} onBlur={blur} onChange={(e) => setEditClient({...editClient, apporteur_affaires: e.target.value})}>
                    <option value="" className="bg-slate-900">— Choisir —</option>
                    <option value="Jeff" className="bg-slate-900">Jeff</option>
                    <option value="Katia" className="bg-slate-900">Katia</option>
                    <option value="Alfred" className="bg-slate-900">Alfred</option>
                    <option value="Philippe" className="bg-slate-900">Philippe</option>
                    <option value="Michelle" className="bg-slate-900">Michelle</option>
                    <option value="Sébastien" className="bg-slate-900">Sébastien</option>
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div><label style={modalLabelStyle}>Type de bien</label><input type="text" style={modalInputStyle} placeholder="Villa, T3..." value={editClient.type_bien||""} onFocus={focus} onBlur={blur} onChange={(e) => setEditClient({...editClient, type_bien: e.target.value})} /></div>
                <div><label style={modalLabelStyle}>Chambres</label><input type="text" style={modalInputStyle} placeholder="T3, T4..." value={editClient.nb_chambres||""} onFocus={focus} onBlur={blur} onChange={(e) => setEditClient({...editClient, nb_chambres: e.target.value})} /></div>
                <div><label style={modalLabelStyle}>Surface hab. (m²)</label><input type="number" style={modalInputStyle} value={editClient.surface_habitable||""} onFocus={focus} onBlur={blur} onChange={(e) => setEditClient({...editClient, surface_habitable: e.target.value})} /></div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div><label style={modalLabelStyle}>Surface terrain (m²)</label><input type="number" style={modalInputStyle} value={editClient.surface_terrain||""} onFocus={focus} onBlur={blur} onChange={(e) => setEditClient({...editClient, surface_terrain: e.target.value})} /></div>
                <div><label style={modalLabelStyle}>Projet vendeur</label>
                  <select style={modalInputStyle} value={editClient.projet_client||"résidence principale"} onFocus={focus} onBlur={blur} onChange={(e) => setEditClient({...editClient, projet_client: e.target.value})}>
                    <option value="résidence principale" className="bg-slate-900">Résidence principale</option>
                    <option value="résidence secondaire" className="bg-slate-900">Résidence secondaire</option>
                    <option value="investissement locatif" className="bg-slate-900">Investissement locatif</option>
                    <option value="location saisonnière" className="bg-slate-900">Location saisonnière</option>
                    <option value="défiscalisation" className="bg-slate-900">Défiscalisation</option>
                  </select>
                </div>
              </div>
              <div><label style={modalLabelStyle}>Notes de visite</label>
                <textarea rows="4" style={{...modalInputStyle, resize:"vertical"}} placeholder="Description du bien, travaux, atouts..." value={editClient.notes||""} onFocus={focus} onBlur={blur} onChange={(e) => setEditClient({...editClient, notes: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={closeEdit} className="flex-1 py-4 rounded-full border border-white/15 text-white/60 hover:text-white/90 transition-all text-xs uppercase tracking-[0.2em] font-semibold">Annuler</button>
                <button type="submit" disabled={saving} style={{ flex:1, background:"rgba(52,211,153,0.85)", color:"#000" }} className="py-4 rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:opacity-90 transition-all disabled:opacity-50">
                  {saving ? "Enregistrement..." : editClient.id ? "Sauvegarder" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
