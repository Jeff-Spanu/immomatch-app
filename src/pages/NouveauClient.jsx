import { useState } from "react"
import { supabase } from "../supabase"
import { useAuth } from "../contexts/AuthContext"

// ─── Données La Réunion ──────────────────────────────────────────────────────
const SECTEURS = [
  { groupe: "Nord", list: ["Saint-Denis", "Sainte-Marie", "Sainte-Suzanne"] },
  { groupe: "Est",  list: ["Saint-André", "Bras-Panon", "Saint-Benoît", "Sainte-Rose"] },
  { groupe: "Sud",  list: ["Saint-Pierre", "Saint-Joseph", "Petite-Île", "Le Tampon", "Entre-Deux", "Saint-Louis", "Étang-Salé", "Saint-Philippe"] },
  { groupe: "Ouest",list: ["Saint-Paul", "Saint-Leu", "Trois-Bassins", "La Possession", "Le Port"] },
  { groupe: "Hauts",list: ["Cilaos", "Salazie", "Plaine-des-Palmistes", "La Montagne"] },
]
const TYPES_BIEN  = [{ label:"Villa",icon:"🏡" },{ label:"Maison",icon:"🏠" },{ label:"Appartement",icon:"🏢" },{ label:"Studio",icon:"🏗️" },{ label:"Terrain",icon:"🌿" },{ label:"Immeuble",icon:"🏛️" }]
const CHAMBRES    = ["T1","T2","T3","T4","T5","T6+"]
const ALTITUDE    = [{ label:"Littoral",sub:"0–100m",value:"0-100" },{ label:"Mi-pente",sub:"100–800m",value:"100-800" },{ label:"Hauteurs",sub:"800–1200m",value:"800-1200" },{ label:"Altitude",sub:"1200m+",value:"1200+" }]
const CRITERES_BOOL = [{ key:"piscine",label:"Piscine",icon:"🏊" },{ key:"vue_mer",label:"Vue Mer",icon:"🌊" },{ key:"vue_montagne",label:"Vue Montagne",icon:"⛰️" },{ key:"garage",label:"Garage",icon:"🚗" },{ key:"dependance",label:"Dépendance",icon:"🏡" },{ key:"plain_pied",label:"Plain-pied",icon:"🏠" }]

// ─── Scanner de notes ────────────────────────────────────────────────────────
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
  return {
    piscine: n.includes("piscine") || n.includes("bassin"),
    vue_mer: n.includes("vue mer") || n.includes("bord de mer") || n.includes("face mer"),
    vue_montagne: n.includes("vue montagne") || n.includes("cirque") || n.includes("piton"),
    garage: n.includes("garage") || n.includes("box") || n.includes("parking"),
    dependance: n.includes("dépendance") || n.includes("dependance") || n.includes("studio indép"),
    plain_pied: n.includes("plain-pied") || n.includes("plain pied"),
    budget,
    nb_chambres,
    secteur: toutes.find(s => n.includes(s.toLowerCase())) || null,
  }
}

function getTable(type_client, categorie_client) {
  if (type_client === "vendeur" && categorie_client === "prestige")   return "vendeurs_prestige"
  if (type_client === "acquereur" && categorie_client === "patrimoine") return "acquereurs_patrimoine"
  if (type_client === "vendeur") return "vendeurs"
  return "acquereurs"
}

// ─── Styles thème ─────────────────────────────────────────────────────────────
const inp = {
  width: "100%", background: "var(--input-bg)", border: "1.5px solid var(--border)",
  borderRadius: "12px", padding: "12px 16px", color: "var(--text)",
  fontSize: "14px", outline: "none", boxSizing: "border-box",
  transition: "border-color .2s", fontFamily: "inherit",
}
const lbl = {
  display: "block", fontSize: "10px", fontWeight: "700", letterSpacing: "0.15em",
  color: "var(--text2)", marginBottom: "8px", textTransform: "uppercase",
}
const card = {
  background: "var(--card-bg)", border: "1px solid var(--card-border)",
  backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
}

// ─── Bouton toggle ────────────────────────────────────────────────────────────
function ToggleBtn({ active, onClick, children, style = {} }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: "9px 14px", borderRadius: "10px", border: "1.5px solid",
      fontSize: "13px", cursor: "pointer", transition: "all 0.15s",
      borderColor: active ? "var(--accent)" : "var(--border)",
      background: active ? "var(--accent-bg)" : "transparent",
      color: active ? "var(--accent)" : "var(--text2)",
      fontWeight: active ? "600" : "400",
      ...style,
    }}>{children}</button>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────
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
        piscine: f.piscine || scan.piscine, vue_mer: f.vue_mer || scan.vue_mer,
        vue_montagne: f.vue_montagne || scan.vue_montagne, garage: f.garage || scan.garage,
        dependance: f.dependance || scan.dependance, plain_pied: f.plain_pied || scan.plain_pied,
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
      altitude: form.altitude || null, projet_client: form.projet_client, notes: form.notes,
      statut: "prospect", piscine: form.piscine, vue_mer: form.vue_mer,
      vue_montagne: form.vue_montagne, garage: form.garage, dependance: form.dependance,
      plain_pied: form.plain_pied, agent_id: user?.id,
      apporteur_affaires: profile?.nom || null, tipser: form.tipser.trim() || null,
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
  const S = { borderRadius: "24px", padding: "20px", marginBottom: "14px", ...card }

  return (
    <div style={{ padding: "clamp(16px, 4vw, 40px)", paddingBottom: "88px", maxWidth: "680px", margin: "0 auto" }} className="lg:pb-10">
      <p style={{ ...lbl, marginBottom: "2px" }}>CRM</p>
      <h1 style={{ fontSize: "clamp(28px, 6vw, 36px)", fontFamily: "Georgia, serif", fontWeight: "400", color: "var(--text)", marginBottom: "4px" }}>
        Nouveau <span style={{ color: "var(--accent)" }}>Contact</span>
      </h1>
      <p style={{ fontSize: "12px", color: "var(--text2)", marginBottom: "24px" }}>
        👤 Enregistré par <span style={{ color: "var(--accent)", fontWeight: "600" }}>{profile?.nom || user?.email}</span>
      </p>

      <form onSubmit={handleSubmit}>

        {/* ── Identité & Rôle ── */}
        <section style={S}>
          <p style={{ ...lbl, fontSize: "11px", color: "var(--accent)", marginBottom: "14px" }}>⚡ Identité & Rôle</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
            {[{ val:"acquereur",title:"Acquéreur",sub:"En recherche",icon:"🎯" },{ val:"vendeur",title:"Vendeur",sub:"Mandat de vente",icon:"🏠" }].map(opt => (
              <button type="button" key={opt.val} onClick={() => set("type_client", opt.val)} style={{
                padding: "14px", borderRadius: "14px", border: "1.5px solid", textAlign: "left", cursor: "pointer", transition: "all 0.15s",
                borderColor: form.type_client === opt.val ? "var(--accent)" : "var(--border)",
                background: form.type_client === opt.val ? "var(--accent-bg)" : "transparent",
                color: form.type_client === opt.val ? "var(--accent)" : "var(--text2)",
              }}>
                <div style={{ fontSize: "22px", marginBottom: "6px" }}>{opt.icon}</div>
                <div style={{ fontWeight: "700", fontSize: "14px" }}>{opt.title}</div>
                <div style={{ fontSize: "11px", opacity: 0.6 }}>{opt.sub}</div>
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={lbl}>Nom complet</label>
              <input style={inp} placeholder="Prénom Nom" value={form.nom} onChange={e => set("nom", e.target.value)} required />
            </div>
            <div>
              <label style={lbl}>Catégorie</label>
              <select style={inp} value={form.categorie_client} onChange={e => set("categorie_client", e.target.value)}>
                <option value="standard">Standard</option>
                <option value="prestige">Prestige</option>
                <option value="patrimoine">Patrimoine</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={lbl}>Téléphone</label>
              <input style={inp} type="tel" placeholder="0692 XX XX XX" value={form.telephone} onChange={e => set("telephone", e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Email</label>
              <input style={inp} type="email" placeholder="email@exemple.com" value={form.email} onChange={e => set("email", e.target.value)} />
            </div>
          </div>

          <div>
            <label style={lbl}>👤 Apporté par (Alchemistria)</label>
            <select style={inp} value={form.tipser} onChange={e => set("tipser", e.target.value)}>
              <option value="">— Aucun / direct —</option>
              <option value="Jeff">Jeff</option>
              <option value="Katia">Katia</option>
              <option value="Alfred">Alfred</option>
              <option value="Philippe">Philippe</option>
              <option value="Michelle">Michelle</option>
              <option value="Sébastien">Sébastien</option>
            </select>
            <p style={{ fontSize: "10px", color: "var(--text3)", marginTop: "4px" }}>Co-closing 50/50 si renseigné</p>
          </div>
        </section>

        {/* ── Prix · Type · Localisation ── */}
        <section style={S}>
          <p style={{ ...lbl, fontSize: "11px", color: "var(--accent)", marginBottom: "14px" }}>💰 Prix · Type · Localisation</p>

          <div style={{ marginBottom: "14px" }}>
            <label style={lbl}>{isVendeur ? "Prix de vente (€)" : "Budget maximum (€)"}</label>
            <input style={inp} type="number" placeholder={isVendeur ? "Ex : 350 000" : "Ex : 450 000"}
              value={isVendeur ? form.prix_vente : form.budget}
              onChange={e => set(isVendeur ? "prix_vente" : "budget", e.target.value)} />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={lbl}>Type de bien</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {TYPES_BIEN.map(t => (
                <ToggleBtn key={t.label} active={form.type_bien === t.label}
                  onClick={() => set("type_bien", form.type_bien === t.label ? "" : t.label)}>
                  {t.icon} {t.label}
                </ToggleBtn>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={lbl}>Commune</label>
              <select style={inp} value={form.secteur} onChange={e => set("secteur", e.target.value)}>
                <option value="">Sélectionner...</option>
                {SECTEURS.map(g => (
                  <optgroup key={g.groupe} label={g.groupe}>
                    {g.list.map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>Projet</label>
              <select style={inp} value={form.projet_client} onChange={e => set("projet_client", e.target.value)}>
                {["Résidence principale","Résidence secondaire","Investissement locatif","Défiscalisation"].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ── Raffinements ── */}
        <section style={S}>
          <p style={{ ...lbl, fontSize: "11px", color: "var(--accent)", marginBottom: "14px" }}>🔧 Raffinements</p>

          <div style={{ marginBottom: "14px" }}>
            <label style={lbl}>Nombre de chambres</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {CHAMBRES.map(c => (
                <ToggleBtn key={c} active={form.nb_chambres === c}
                  onClick={() => set("nb_chambres", form.nb_chambres === c ? "" : c)}>
                  {c}
                </ToggleBtn>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
            <div>
              <label style={lbl}>Surface habitable (m²)</label>
              <input style={inp} type="number" placeholder="Ex : 120"
                value={form.surface_habitable} onChange={e => set("surface_habitable", e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Surface terrain (m²)</label>
              <input style={inp} type="number" placeholder="Ex : 500"
                value={form.surface_terrain} onChange={e => set("surface_terrain", e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={lbl}>Altitude</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }} className="md:grid-cols-4">
              {ALTITUDE.map(a => (
                <ToggleBtn key={a.value} active={form.altitude === a.value}
                  onClick={() => set("altitude", form.altitude === a.value ? "" : a.value)}
                  style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "13px", fontWeight: "600" }}>{a.label}</div>
                  <div style={{ fontSize: "10px", opacity: 0.6 }}>{a.sub}</div>
                </ToggleBtn>
              ))}
            </div>
          </div>

          <div>
            <label style={lbl}>Prestations recherchées</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {CRITERES_BOOL.map(c => (
                <ToggleBtn key={c.key} active={form[c.key]}
                  onClick={() => set(c.key, !form[c.key])}>
                  {c.icon} {c.label}
                </ToggleBtn>
              ))}
            </div>
          </div>
        </section>

        {/* ── Notes ── */}
        <section style={S}>
          <p style={{ ...lbl, fontSize: "11px", color: "var(--accent)", marginBottom: "10px" }}>📝 Notes & Contexte</p>
          {autoFill && (
            <p style={{ fontSize: "11px", color: "var(--accent)", marginBottom: "10px" }}>✨ Remplissage automatique activé</p>
          )}
          <textarea style={{ ...inp, minHeight: "100px", resize: "vertical" }}
            placeholder="Contexte, besoins spécifiques, remarques importantes…"
            value={form.notes} onChange={handleNotesChange} />
        </section>

        {/* ── Feedback ── */}
        {error && (
          <div style={{ marginBottom: "14px", padding: "12px 16px", borderRadius: "14px", background: "var(--error-bg)", border: "1px solid var(--error)", color: "var(--error)", fontSize: "13px" }}>{error}</div>
        )}
        {success && (
          <div style={{ marginBottom: "14px", padding: "12px 16px", borderRadius: "14px", background: "var(--success-bg)", border: "1px solid var(--success)", color: "var(--success)", fontSize: "13px", fontWeight: "600" }}>
            ✅ Contact enregistré avec succès !
          </div>
        )}

        {/* ── Submit ── */}
        <button type="submit" disabled={saving} style={{
          width: "100%", padding: "16px", borderRadius: "14px",
          background: "var(--accent)", color: "#fff",
          border: "none", fontSize: "15px", fontWeight: "700",
          letterSpacing: "0.05em", cursor: saving ? "not-allowed" : "pointer",
          opacity: saving ? 0.6 : 1, transition: "opacity 0.2s",
        }}>
          {saving ? "Enregistrement…" : `Enregistrer ${isVendeur ? "le vendeur" : "l'acquéreur"}`}
        </button>

      </form>
    </div>
  )
}
