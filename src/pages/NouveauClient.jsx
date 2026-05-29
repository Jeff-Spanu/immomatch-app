import { useState } from "react"
import { supabase } from "../supabase"

// âââ DonnÃ©es La RÃ©union âââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const SECTEURS = [
  { groupe: "Nord",  list: ["Saint-Denis", "Sainte-Marie", "Sainte-Suzanne"] },
  { groupe: "Est",   list: ["Saint-AndrÃ©", "Bras-Panon", "Saint-BenoÃ®t", "Sainte-Rose"] },
  { groupe: "Sud",   list: ["Saint-Pierre", "Saint-Joseph", "Petite-Ãle", "Le Tampon", "Entre-Deux", "Saint-Louis", "Ãtang-SalÃ©", "Saint-Philippe"] },
  { groupe: "Ouest", list: ["Saint-Paul", "Saint-Leu", "Trois-Bassins", "La Possession", "Le Port"] },
  { groupe: "Hauts", list: ["Cilaos", "Salazie", "Plaine-des-Palmistes", "La Montagne"] },
]

const TYPES_BIEN = [
  { label: "Villa",       icon: "ð¡" },
  { label: "Maison",      icon: "ð " },
  { label: "Appartement", icon: "ð¢" },
  { label: "Studio",      icon: "ðï¸" },
  { label: "Terrain",     icon: "ð¿" },
  { label: "Immeuble",    icon: "ðï¸" },
]

const CHAMBRES = ["T1", "T2", "T3", "T4", "T5", "T6+"]

const ALTITUDE = [
  { label: "Littoral",  sub: "0â100m",    value: "0-100" },
  { label: "Mi-pente",  sub: "100â800m",  value: "100-800" },
  { label: "Hauteurs",  sub: "800â1200m", value: "800-1200" },
  { label: "Altitude",  sub: "1200m+",    value: "1200+" },
]

const CRITERES_BOOL = [
  { key: "piscine",      label: "Piscine",      icon: "ð" },
  { key: "vue_mer",      label: "Vue Mer",      icon: "ð" },
  { key: "vue_montagne", label: "Vue Montagne", icon: "â°ï¸" },
  { key: "garage",       label: "Garage",       icon: "ð" },
  { key: "dependance",   label: "DÃ©pendance",   icon: "ð¡" },
  { key: "plain_pied",   label: "Plain-pied",   icon: "ð " },
]

// âââ Scanner de notes âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function scanNotes(txt = "") {
  const n = txt.toLowerCase()
  const toutes = SECTEURS.flatMap(g => g.list)

  const budget = (() => {
    const k = n.match(/(\d+)\s*k/);      if (k) return parseInt(k[1]) * 1000
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
    piscine:      n.includes("piscine") || n.includes("bassin"),
    vue_mer:      n.includes("vue mer") || n.includes("bord de mer") || n.includes("face mer"),
    vue_montagne: n.includes("vue montagne") || n.includes("cirque") || n.includes("piton"),
    garage:       n.includes("garage") || n.includes("box") || n.includes("parking"),
    dependance:   n.includes("dÃ©pendance") || n.includes("dependance") || n.includes("studio indÃ©p"),
    plain_pied:   n.includes("plain-pied") || n.includes("plain pied"),
    budget, nb_chambres, secteur,
  }
}

// âââ Routing vers la bonne table âââââââââââââââââââââââââââââââââââââââââââââ
function getTable(type_client, categorie_client) {
  if (type_client === "vendeur" && categorie_client === "prestige")   return "vendeurs_prestige"
  if (type_client === "acquereur" && categorie_client === "patrimoine") return "acquereurs_patrimoine"
  if (type_client === "vendeur")   return "vendeurs"
  return "acquereurs"
}

// âââ Styles âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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
const sectionHead = {
  fontSize: "10px",
  color: "#C4A882",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  fontWeight: "700",
  borderBottom: "1px solid rgba(196,168,130,0.18)",
  paddingBottom: "10px",
  marginBottom: "22px",
  fontFamily: "'DM Sans', sans-serif",
}
const focus = (e) => e.target.style.borderColor = "#C4A882"
const blur  = (e) => e.target.style.borderColor = "rgba(255,255,255,0.12)"

const EMPTY_FORM = {
  nom: "", telephone: "", email: "",
  type_client: "acquereur",
  categorie_client: "standard",
  budget: "",
  secteur: "",
  altitude: "",
  type_bien: "",
  nb_chambres: "",
  surface_habitable: "",
  surface_terrain: "",
  projet_client: "rÃ©sidence principale",
  piscine: false, vue_mer: false, vue_montagne: false,
  garage: false, dependance: false, plain_pied: false,
  notes: "",
}

export default function NouveauClient() {
  const [formData, setFormData]     = useState({ ...EMPTY_FORM })
  const [loading, setLoading]       = useState(false)
  const [success, setSuccess]       = useState(false)
  const [scanning, setScanning]     = useState(false)
  const [scanResult, setScanResult] = useState("")

  const set    = (key) => (e) => setFormData(p => ({ ...p, [key]: e.target.value }))
  const pick   = (key, val) => setFormData(p => ({ ...p, [key]: p[key] === val ? "" : val }))
  const toggle = (key) => setFormData(p => ({ ...p, [key]: !p[key] }))

  const roleColor = formData.type_client === "vendeur" ? "#34d399" : "#C4A882"

  function handleScanNotes() {
    if (!formData.notes) return
    setScanning(true)
    setScanResult("")
    const p = scanNotes(formData.notes)
    const found = []
    setFormData(prev => {
      const next = { ...prev }
      CRITERES_BOOL.forEach(({ key }) => {
        if (p[key] && !prev[key]) { next[key] = true; found.push(key) }
      })
      if (p.budget     && !prev.budget)      { next.budget      = p.budget;      found.push(`${Number(p.budget).toLocaleString()} â¬`) }
      if (p.nb_chambres && !prev.nb_chambres){ next.nb_chambres = p.nb_chambres; found.push(p.nb_chambres) }
      if (p.secteur    && !prev.secteur)     { next.secteur     = p.secteur;     found.push(p.secteur) }
      return next
    })
    setTimeout(() => {
      setScanning(false)
      setScanResult(found.length
        ? `â Extrait : ${found.join(", ")}`
        : "Aucun critÃ¨re supplÃ©mentaire dÃ©tectÃ©.")
    }, 600)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    const table = getTable(formData.type_client, formData.categorie_client)
    const payload = {
      ...formData,
      budget:            Number(formData.budget)            || null,
      surface_habitable: Number(formData.surface_habitable) || null,
      surface_terrain:   Number(formData.surface_terrain)   || null,
    }
    // Retirer type_client du payload (implicite dans la table)
    delete payload.type_client

    const { error } = await supabase.from(table).insert([payload])

    if (error) {
      alert("Erreur : " + error.message)
    } else {
      setSuccess(true)
      setFormData({ ...EMPTY_FORM })
      setScanResult("")
      setTimeout(() => setSuccess(false), 4000)
    }
    setLoading(false)
  }

  return (
    <div className="p-5 max-w-4xl mx-auto">

      {/* En-tÃªte */}
      <div className="mb-3">
        <p style={{ color: "#C4A882", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: "600", marginBottom: "10px" }}>
          Gestion Portefeuille
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "300", letterSpacing: "0.02em", lineHeight: 1, color: "#fff" }}>
          Nouveau Contact
        </h1>
      </div>

      {success && (
        <div style={{ marginBottom: "24px", padding: "16px 24px", borderRadius: "16px", background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.30)", color: "#34d399", fontSize: "13px", fontWeight: "500" }}>
          â Contact enregistrÃ© avec succÃ¨s.
        </div>
      )}

      <form onSubmit={handleSubmit} className="liquid-glass p-5 rounded-[40px] border border-white/10 space-y-4">

        {/* â  IDENTITÃ & RÃLE */}
        <div>
          <p style={sectionHead}>â  IdentitÃ© & RÃ´le</p>

          <div className="mb-2">
            <label style={labelStyle}>RÃ´le dans la transaction</label>
            <div className="flex flex-wrap gap-3">
              {[
                { value: "acquereur", label: "AcquÃ©reur", sub: "En recherche",    icon: "ð", color: "#C4A882" },
                { value: "vendeur",   label: "Vendeur",   sub: "Mandat de vente", icon: "ð ", color: "#34d399" },
              ].map(r => (
                <button type="button" key={r.value}
                  onClick={() => setFormData(p => ({ ...p, type_client: r.value }))}
                  style={{
                    padding: "12px 22px", borderRadius: "14px", cursor: "pointer",
                    transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif",
                    textAlign: "left", minWidth: "140px",
                    border: formData.type_client === r.value ? `2px solid ${r.color}` : "1px solid rgba(255,255,255,0.12)",
                    background: formData.type_client === r.value ? `${r.color}18` : "rgba(255,255,255,0.04)",
                    color: formData.type_client === r.value ? r.color : "rgba(255,255,255,0.55)",
                  }}
                >
                  <div style={{ fontSize: "18px", marginBottom: "4px" }}>{r.icon}</div>
                  <div style={{ fontSize: "13px", fontWeight: "700" }}>{r.label}</div>
                  <div style={{ fontSize: "10px", opacity: 0.65 }}>{r.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label style={labelStyle}>Nom complet</label>
              <input required type="text" style={inputStyle} value={formData.nom}
                onFocus={focus} onBlur={blur} onChange={set("nom")} placeholder="PrÃ©nom Nom" />
            </div>
            <div>
              <label style={labelStyle}>CatÃ©gorie</label>
              <select style={inputStyle} value={formData.categorie_client} onFocus={focus} onBlur={blur} onChange={set("categorie_client")}>
                <option value="standard"   className="bg-slate-900">Standard</option>
                <option value="prestige"   className="bg-slate-900">Prestige</option>
                <option value="patrimoine" className="bg-slate-900">Patrimoine</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3 mt-2">
            <div>
              <label style={labelStyle}>TÃ©lÃ©phone</label>
              <input type="tel" style={inputStyle} value={formData.telephone} onFocus={focus} onBlur={blur} onChange={set("telephone")} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" style={inputStyle} value={formData.email} onFocus={focus} onBlur={blur} onChange={set("email")} />
            </div>
          </div>
        </div>

        {/* â¡ PRIX Â· TYPE Â· LOCALISATION */}
        <div>
          <p style={sectionHead}>â¡ Prix Â· Type Â· Localisation</p>

          <div className="mb-2">
            <label style={{ ...labelStyle, color: roleColor }}>
              {formData.type_client === "vendeur" ? "Prix de vente (â¬)" : "Budget maximum (â¬)"}
            </label>
            <div style={{ position: "relative" }}>
              <input type="number"
                style={{ ...inputStyle, fontSize: "22px", padding: "18px 24px", borderColor: `${roleColor}50`, fontFamily: "'Cormorant Garamond', serif" }}
                placeholder="Ex : 450 000"
                value={formData.budget}
                onFocus={(e) => e.target.style.borderColor = roleColor}
                onBlur={(e)  => e.target.style.borderColor = `${roleColor}50`}
                onChange={set("budget")}
              />
              {formData.budget && (
                <span style={{ position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: roleColor, fontWeight: "600", opacity: 0.8 }}>
                  {Number(formData.budget).toLocaleString()} â¬
                </span>
              )}
            </div>
          </div>

          <div className="mb-2">
            <label style={labelStyle}>Type de bien</label>
            <div className="flex flex-wrap gap-3">
              {TYPES_BIEN.map(({ icon, label }) => (
                <button type="button" key={label} onClick={() => pick("type_bien", label)}
                  style={{
                    padding: "14px 22px", borderRadius: "14px", cursor: "pointer",
                    transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px", fontWeight: "600",
                    display: "flex", alignItems: "center", gap: "8px",
                    border: formData.type_bien === label ? "2px solid #C4A882" : "1px solid rgba(255,255,255,0.14)",
                    background: formData.type_bien === label ? "rgba(196,168,130,0.18)" : "rgba(255,255,255,0.04)",
                    color: formData.type_bien === label ? "#C4A882" : "rgba(255,255,255,0.65)",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>{icon}</span>{label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Commune</label>
              <select style={{ ...inputStyle, fontSize: "15px" }} value={formData.secteur} onFocus={focus} onBlur={blur} onChange={set("secteur")}>
                <option value="" className="bg-slate-900">SÃ©lectionner...</option>
                {SECTEURS.map(g => (
                  <optgroup key={g.groupe} label={`ââ ${g.groupe}`}>
                    {g.list.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Projet</label>
              <select style={inputStyle} value={formData.projet_client} onFocus={focus} onBlur={blur} onChange={set("projet_client")}>
                <option value="rÃ©sidence principale"   className="bg-slate-900">RÃ©sidence principale</option>
                <option value="rÃ©sidence secondaire"   className="bg-slate-900">RÃ©sidence secondaire</option>
                <option value="investissement locatif" className="bg-slate-900">Investissement locatif</option>
                <option value="location saisonniÃ¨re"   className="bg-slate-900">Location saisonniÃ¨re</option>
                <option value="dÃ©fiscalisation"        className="bg-slate-900">DÃ©fiscalisation</option>
              </select>
            </div>
          </div>
        </div>

        {/* â¢ RAFFINEMENTS */}
        <div>
          <p style={sectionHead}>â¢ Raffinements</p>

          <div className="mb-2">
            <label style={labelStyle}>Nombre de chambres</label>
            <div className="flex flex-wrap gap-2">
              {CHAMBRES.map(c => (
                <button type="button" key={c} onClick={() => pick("nb_chambres", c)}
                  style={{
                    padding: "10px 22px", borderRadius: "10px", cursor: "pointer",
                    transition: "all 0.2s", fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "16px", fontWeight: "700",
                    border: formData.nb_chambres === c ? "2px solid #C4A882" : "1px solid rgba(255,255,255,0.14)",
                    background: formData.nb_chambres === c ? "rgba(196,168,130,0.18)" : "rgba(255,255,255,0.04)",
                    color: formData.nb_chambres === c ? "#C4A882" : "rgba(255,255,255,0.60)",
                  }}
                >{c}</button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3 mb-2">
            <div>
              <label style={labelStyle}>Surface habitable (mÂ²)</label>
              <input type="number" style={inputStyle} placeholder="Ex : 120"
                value={formData.surface_habitable} onFocus={focus} onBlur={blur} onChange={set("surface_habitable")} />
            </div>
            <div>
              <label style={labelStyle}>Surface terrain (mÂ²)</label>
              <input type="number" style={inputStyle} placeholder="Ex : 800"
                value={formData.surface_terrain} onFocus={focus} onBlur={blur} onChange={set("surface_terrain")} />
            </div>
          </div>

          <div className="mb-2">
            <label style={labelStyle}>Zone / Altitude</label>
            <div className="flex flex-wrap gap-2">
              {ALTITUDE.map(a => (
                <button type="button" key={a.value} onClick={() => pick("altitude", a.value)}
                  style={{
                    padding: "8px 16px", borderRadius: "10px", cursor: "pointer",
                    transition: "all 0.18s", fontFamily: "'DM Sans', sans-serif",
                    fontSize: "11px", fontWeight: "600",
                    border: formData.altitude === a.value ? "2px solid #C4A882" : "1px solid rgba(255,255,255,0.14)",
                    background: formData.altitude === a.value ? "rgba(196,168,130,0.18)" : "rgba(255,255,255,0.04)",
                    color: formData.altitude === a.value ? "#C4A882" : "rgba(255,255,255,0.55)",
                  }}
                >
                  <div>{a.label}</div>
                  <div style={{ fontSize: "9px", opacity: 0.65, marginTop: "2px" }}>{a.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Prestations & CritÃ¨res</label>
            <div className="flex flex-wrap gap-2">
              {CRITERES_BOOL.map(({ key, label, icon }) => (
                <button type="button" key={key} onClick={() => toggle(key)}
                  style={{
                    padding: "9px 18px", borderRadius: "10px", cursor: "pointer",
                    transition: "all 0.18s", fontFamily: "'DM Sans', sans-serif",
                    fontSize: "12px", fontWeight: "600",
                    display: "flex", alignItems: "center", gap: "6px",
                    border: formData[key] ? "2px solid #C4A882" : "1px solid rgba(255,255,255,0.14)",
                    background: formData[key] ? "rgba(196,168,130,0.18)" : "rgba(255,255,255,0.04)",
                    color: formData[key] ? "#C4A882" : "rgba(255,255,255,0.55)",
                  }}
                >{icon} {label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* â£ NOTES & SCANNER */}
        <div>
          <p style={sectionHead}>â£ Notes & Scanner</p>
          <div className="flex justify-between items-center mb-3">
            <label style={{ ...labelStyle, marginBottom: 0 }}>Notes (WhatsApp / Keep / terrain)</label>
            <button type="button" onClick={handleScanNotes} disabled={!formData.notes || scanning}
              style={{
                padding: "8px 18px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
                letterSpacing: "0.12em", textTransform: "uppercase",
                cursor: formData.notes ? "pointer" : "not-allowed",
                border: "1px solid rgba(196,168,130,0.40)",
                background: "rgba(196,168,130,0.10)", color: "#C4A882",
                transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif",
                opacity: formData.notes ? 1 : 0.4,
              }}
            >
              {scanning ? "â³ Analyse..." : "â¦ Scanner la note"}
            </button>
          </div>
          <textarea rows="4"
            style={{ ...inputStyle, resize: "vertical" }}
            placeholder="Ex : Villa piscine 3 chambres vue mer Saint-Leu 850k..."
            value={formData.notes}
            onFocus={focus} onBlur={blur}
            onChange={set("notes")}
          />
          {scanResult && (
            <p style={{ marginTop: "8px", fontSize: "12px", fontStyle: "italic", color: scanResult.startsWith("â") ? "#34d399" : "rgba(255,255,255,0.45)" }}>
              {scanResult}
            </p>
          )}
        </div>

        {/* Table cible visible */}
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", textAlign: "center", letterSpacing: "0.1em" }}>
          â Enregistrement dans : <span style={{ color: "#C4A882" }}>{getTable(formData.type_client, formData.categorie_client)}</span>
        </p>

        <button type="submit" disabled={loading}
          className="w-full py-2 rounded-full bg-white text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-[#C4A882] hover:text-white transition-all disabled:opacity-50">
          {loading ? "Enregistrement en cours..." : "Enregistrer le dossier"}
        </button>

      </form>
    </div>
  )
}
