import { useState } from "react"
import { supabase } from "../supabase"
import { useAuth } from "../contexts/AuthContext"

const SECTEURS = [
  { groupe: "Nord", list: ["Saint-Denis", "Sainte-Marie", "Sainte-Suzanne"] },
  { groupe: "Est", list: ["Saint-André", "Bras-Panon", "Saint-Benoît", "Sainte-Rose"] },
  { groupe: "Sud", list: ["Saint-Pierre", "Saint-Joseph", "Petite-Île", "Le Tampon", "Entre-Deux", "Saint-Louis", "Étang-Salé", "Saint-Philippe"] },
  { groupe: "Ouest", list: ["Saint-Paul", "Saint-Leu", "Trois-Bassins", "La Possession", "Le Port"] },
  { groupe: "Hauts", list: ["Cilaos", "Salazie", "Plaine-des-Palmistes", "La Montagne"] },
]

const TYPES_BIEN = [
  { label: "Villa", icon: "🏡" }, { label: "Maison", icon: "🏠" },
  { label: "Appartement", icon: "🏢" }, { label: "Studio", icon: "🏗️" },
  { label: "Terrain", icon: "🌿" }, { label: "Immeuble", icon: "🏛️" },
]

const CHAMBRES = ["T1", "T2", "T3", "T4", "T5", "T6+"]

const ALTITUDE = [
  { label: "Littoral", sub: "0–100m", value: "0-100" },
  { label: "Mi-pente", sub: "100–800m", value: "100-800" },
  { label: "Hauteurs", sub: "800–1200m", value: "800-1200" },
  { label: "Altitude", sub: "1200m+", value: "1200+" },
]

const CRITERES_BOOL = [
  { key: "piscine", label: "Piscine", icon: "🏊" },
  { key: "vue_mer", label: "Vue Mer", icon: "🌊" },
  { key: "vue_montagne", label: "Vue Montagne", icon: "⛰️" },
  { key: "garage", label: "Garage", icon: "🚗" },
  { key: "dependance", label: "Dépendance", icon: "🏡" },
  { key: "plain_pied", label: "Plain-pied", icon: "🏠" },
]

function scanNotes(txt = "") {
  const n = txt.toLowerCase()
  const toutes = SECTEURS.flatMap(g => g.list)
  const budget = (() => {
    const k = n.match(/(\d+)\s*k/); if (k) return parseInt(k[1]) * 1000
    const m = n.match(/(\d{2,4})\s*000/); if (m) return parseInt(m[1]) * 1000
    return null
  })()
  const nb_chambres = (() => {
    const t = n.match(/\bt(\d)\b/); if (t) return `T${t[1]}`
    const c = n.match(/(\d)\s*chambre/); if (c) return `T${parseInt(c[1]) + 1}`
    return null
  })()
  const secteur = toutes.find(s => n.includes(s.toLowerCase())) || null
  return {
    piscine: n.includes("piscine") || n.includes("bassin"),
    vue_mer: n.includes("vue mer") || n.includes("bord de mer"),
    vue_montagne: n.includes("vue montagne") || n.includes("cirque"),
    garage: n.includes("garage") || n.includes("parking"),
    dependance: n.includes("dépendance") || n.includes("dependance"),
    plain_pied: n.includes("plain-pied") || n.includes("plain pied"),
    budget, nb_chambres, secteur,
  }
}

function getTable(type_client, categorie_client) {
  if (type_client === "vendeur" && categorie_client === "prestige") return "vendeurs_prestige"
  if (type_client === "acquereur" && categorie_client === "patrimoine") return "acquereurs_patrimoine"
  if (type_client === "vendeur") return "vendeurs"
  return "acquereurs"
}

const inputStyle = {
  width: "100%", background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px",
  padding: "12px 16px", color: "#fff", fontSize: "14px",
  outline: "none", boxSizing: "border-box", transition: "border-color .2s",
}
const labelStyle = {
  display: "block", fontSize: "10px", fontWeight: "700",
  letterSpacing: "0.15em", color: "rgba(255,255,255,0.50)",
  marginBottom: "8px", textTransform: "uppercase",
}

export default function NouveauClient() {
  const { user, profile } = useAuth()

  const EMPTY = {
    type_client: "acquereur", categorie_client: "standard",
    nom: "", telephone: "", email: "",
    budget: "", prix_vente: "", type_bien: "", secteur: "",
    nb_chambres: "", surface_habitable: "", surface_terrain: "",
    altitude: "", projet_client: "résidence principale",
    notes: "", standing: "",
    piscine: false, vue_mer: false, vue_montagne: false,
    garage: false, dependance: false, plain_pied: false,
    tipser: "",
  }

  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [autoFill, setAutoFill] = useState(false)

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function handleNotesChange(e) {
    const txt = e.target.value
    set("notes", txt)
    if (txt.length > 20) {
      const scan = scanNotes(txt)
      setAutoFill(true)
      setForm(f => ({
        ...f, notes: txt,
        piscine: f.piscine || scan.piscine,
        vue_mer: f.vue_mer || scan.vue_mer,
        vue_montagne: f.vue_montagne || scan.vue_montagne,
        garage: f.garage || scan.garage,
        dependance: f.dependance || scan.dependance,
        plain_pied: f.plain_pied || scan.plain_pied,
        budget: f.budget || (scan.budget ? String(scan.budget) : f.budget),
        nb_chambres: f.nb_chambres || scan.nb_chambres || f.nb_chambres,
        secteur: f.secteur || scan.secteur || f.secteur,
      }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nom.trim()) { setError("Le nom est obligatoire."); return }
    setSaving(true); setError(null)
    const table = getTable(form.type_client, form.categorie_client)
    const isVendeur = form.type_client === "vendeur"
    const payload = {
      nom: form.nom.trim(), telephone: form.telephone.trim(), email: form.email.trim(),
      categorie_client: form.categorie_client, type_bien: form.type_bien, secteur: form.secteur,
      nb_chambres: form.nb_chambres || null,
      surface_habitable: form.surface_habitable ? Number(form.surface_habitable) : null,
      surface_terrain: form.surface_terrain ? Number(form.surface_terrain) : null,
      altitude: form.altitude || null, projet_client: form.projet_client,
      notes: form.notes, statut: "prospect",
      piscine: form.piscine, vue_mer: form.vue_mer, vue_montagne: form.vue_montagne,
      garage: form.garage, dependance: form.dependance, plain_pied: form.plain_pied,
      agent_id: user?.id,
      apporteur_affaires: profile?.nom || null,
      tipser: form.tipser.trim() || null,
      ...(isVendeur
        ? { prix_vente: form.prix_vente ? Number(form.prix_vente) : null, budget: form.prix_vente ? Number(form.prix_vente) : null, standing: form.standing }
        : { budget: form.budget ? Number(form.budget) : null }
      ),
    }
    const { error: err } = await supabase.from(table).insert([payload])
    setSaving(false)
    if (err) { setError("Erreur : " + err.message); return }
    setSuccess(true)
    setTimeout(() => { setSuccess(false); setForm(EMPTY); setAutoFill(false) }, 2000)
  }

  const isVendeur = form.type_client === "vendeur"

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <p className="text-white/40 text-xs uppercase tracking-widest mb-1">CRM</p>
      <h1 className="text-4xl font-serif text-white mb-1">Nouveau <span className="text-[#C87533]">Contact</span></h1>
      <p className="text-white/40 text-xs mb-6">
        👤 Enregistré par <span className="text-[#C87533] font-semibold">{profile?.nom || user?.email}</span>
      </p>
      <form onSubmit={handleSubmit}>
        <section className="liquid-glass rounded-[28px] border border-white/10 p-6 mb-5">
          <p style={labelStyle}>⚡ Identité & Rôle</p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[{ val: "acquereur", title: "Acquéreur", sub: "En recherche", icon: "🎯" },
              { val: "vendeur", title: "Vendeur", sub: "Mandat de vente", icon: "🏠" }].map(opt => (
              <button type="button" key={opt.val} onClick={() => set("type_client", opt.val)}
                className={`p-4 rounded-2xl border text-left transition-all ${form.type_client === opt.val ? "bg-[#C87533]/20 border-[#C87533]/60 text-white" : "border-white/15 text-white/60 hover:border-white/30"}`}>
                <div className="text-2xl mb-2">{opt.icon}</div>
                <div className="font-bold text-sm">{opt.title}</div>
                <div className="text-[11px] opacity-60">{opt.sub}</div>
              </button>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div><label style={labelStyle}>Nom complet</label>
              <input style={inputStyle} placeholder="Prénom Nom" value={form.nom} onChange={e => set("nom", e.target.value)} required /></div>
            <div><label style={labelStyle}>Catégorie</label>
              <select style={inputStyle} value={form.categorie_client} onChange={e => set("categorie_client", e.target.value)}>
                <option value="standard" className="bg-slate-900">Standard</option>
                <option value="prestige" className="bg-slate-900">Prestige</option>
                <option value="patrimoine" className="bg-slate-900">Patrimoine</option>
              </select></div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div><label style={labelStyle}>Téléphone</label>
              <input style={inputStyle} type="tel" placeholder="0692 XX XX XX" value={form.telephone} onChange={e => set("telephone", e.target.value)} /></div>
            <div><label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" placeholder="email@exemple.com" value={form.email} onChange={e => set("email", e.target.value)} /></div>
          </div>
          <div>
            <label style={labelStyle}>📣 Recommandé par (tipser)</label>
            <input style={inputStyle} placeholder="Nom / contact de la personne qui vous a recommandé ce lead"
              value={form.tipser} onChange={e => set("tipser", e.target.value)} />
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.30)", marginTop: "4px" }}>Optionnel — traçabilité uniquement</p>
          </div>
        </section>

        <section className="liquid-glass rounded-[28px] border border-white/10 p-6 mb-5">
          <p style={labelStyle}>💰 Prix · Type · Localisation</p>
          <div className="mb-4">
            <label style={labelStyle}>{isVendeur ? "Prix de vente (€)" : "Budget maximum (€)"}</label>
            <input style={inputStyle} type="number" placeholder={isVendeur ? "Ex : 350 000" : "Ex : 450 000"}
              value={isVendeur ? form.prix_vente : form.budget} onChange={e => set(isVendeur ? "prix_vente" : "budget", e.target.value)} />
          </div>
          <div className="mb-4">
            <label style={labelStyle}>Type de bien</label>
            <div className="flex flex-wrap gap-2">
              {TYPES_BIEN.map(t => (
                <button type="button" key={t.label} onClick={() => set("type_bien", form.type_bien === t.label ? "" : t.label)}
                  className={`px-4 py-2 rounded-full border text-sm transition-all ${form.type_bien === t.label ? "bg-[#C87533]/20 border-[#C87533]/60 text-white" : "border-white/15 text-white/50 hover:border-white/30"}`}>
                  {t.icon} {t.label}</button>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label style={labelStyle}>Commune</label>
              <select style={inputStyle} value={form.secteur} onChange={e => set("secteur", e.target.value)}>
                <option value="" className="bg-slate-900">Sélectionner...</option>
                {SECTEURS.map(g => (<optgroup key={g.groupe} label={g.groupe}>
                  {g.list.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                </optgroup>))}
              </select></div>
            <div><label style={labelStyle}>Projet</label>
              <select style={inputStyle} value={form.projet_client} onChange={e => set("projet_client", e.target.value)}>
                {["Résidence principale","Résidence secondaire","Investissement locatif","Défiscalisation"].map(p => (
                  <option key={p} value={p} className="bg-slate-900">{p}</option>))}
              </select></div>
          </div>
        </section>

        <section className="liquid-glass rounded-[28px] border border-white/10 p-6 mb-5">
          <p style={labelStyle}>🔧 Raffinements</p>
          <div className="mb-4">
            <label style={labelStyle}>Chambres</label>
            <div className="flex flex-wrap gap-2">
              {CHAMBRES.map(c => (
                <button type="button" key={c} onClick={() => set("nb_chambres", form.nb_chambres === c ? "" : c)}
                  className={`px-4 py-2 rounded-full border text-sm transition-all ${form.nb_chambres === c ? "bg-white/20 border-white/50 text-white" : "border-white/15 text-white/50 hover:border-white/30"}`}>{c}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label style={labelStyle}>Surface habitable (m²)</label>
              <input style={inputStyle} type="number" placeholder="Ex : 120" value={form.surface_habitable} onChange={e => set("surface_habitable", e.target.value)} /></div>
            <div><label style={labelStyle}>Surface terrain (m²)</label>
              <input style={inputStyle} type="number" placeholder="Ex : 500" value={form.surface_terrain} onChange={e => set("surface_terrain", e.target.value)} /></div>
          </div>
          <div className="mb-4">
            <label style={labelStyle}>Altitude</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {ALTITUDE.map(a => (
                <button type="button" key={a.value} onClick={() => set("altitude", form.altitude === a.value ? "" : a.value)}
                  className={`p-3 rounded-2xl border text-center transition-all ${form.altitude === a.value ? "bg-[#C87533]/20 border-[#C87533]/60 text-white" : "border-white/15 text-white/50 hover:border-white/30"}`}>
                  <div className="text-sm font-medium">{a.label}</div>
                  <div className="text-[10px] opacity-60">{a.sub}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Prestations</label>
            <div className="flex flex-wrap gap-2">
              {CRITERES_BOOL.map(c => (
                <button type="button" key={c.key} onClick={() => set(c.key, !form[c.key])}
                  className={`px-4 py-2 rounded-full border text-sm transition-all ${form[c.key] ? "bg-[#C87533]/20 border-[#C87533]/60 text-white" : "border-white/15 text-white/50 hover:border-white/30"}`}>
                  {c.icon} {c.label}</button>
              ))}
            </div>
          </div>
        </section>

        <section className="liquid-glass rounded-[28px] border border-white/10 p-6 mb-6">
          <p style={labelStyle}>📝 Notes & Contexte</p>
          {autoFill && <p className="text-[11px] text-[#C87533] mb-3">✨ Remplissage automatique activé</p>}
          <textarea style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
            placeholder="Contexte, besoins spécifiques…" value={form.notes} onChange={handleNotesChange} />
        </section>

        {error && <div className="mb-4 px-4 py-3 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">{error}</div>}
        {success && <div className="mb-4 px-4 py-3 rounded-2xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium">✅ Contact enregistré !</div>}

        <button type="submit" disabled={saving}
          className="w-full py-4 rounded-full bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-[#C87533] hover:text-white transition-all disabled:opacity-50 cursor-pointer">
          {saving ? "Enregistrement…" : `Enregistrer ${isVendeur ? "le vendeur" : "l'acquéreur"}`}
        </button>
      </form>
    </div>
  )
}
