import { useEffect, useState } from "react"
import { supabase } from "../supabase"

// ─── Algo de matching ─────────────────────────────────────────────────────────
function calculerScore(a, v) {
  let score = 0
  const details = []

  // Secteur — critère principal
  if (a.secteur && v.secteur && a.secteur.toLowerCase() === v.secteur.toLowerCase()) {
    score += 35; details.push("Secteur")
  }

  // Budget — le vendeur doit être dans le budget acquéreur
  if (v.budget && a.budget && v.budget <= a.budget) {
    score += 25; details.push("Prix")
  }

  // Type de bien
  if (a.type_bien && v.type_bien && a.type_bien.toLowerCase() === v.type_bien.toLowerCase()) {
    score += 10; details.push("Type de bien")
  }

  // Nombre de chambres
  if (a.nb_chambres && v.nb_chambres && a.nb_chambres === v.nb_chambres) {
    score += 10; details.push("Chambres")
  }

  // Surface habitable (tolérance ±20%)
  if (a.surface_habitable && v.surface_habitable && v.surface_habitable >= a.surface_habitable * 0.8) {
    score += 8; details.push("Surface")
  }

  // Altitude / zone
  if (a.altitude && v.altitude && a.altitude === v.altitude) {
    score += 5; details.push("Zone")
  }

  // Critères booléens
  if (a.piscine      && v.piscine)      { score += 4; details.push("Piscine") }
  if (a.vue_mer      && v.vue_mer)      { score += 4; details.push("Vue Mer") }
  if (a.vue_montagne && v.vue_montagne) { score += 3; details.push("Vue Montagne") }
  if (a.garage       && v.garage)       { score += 3; details.push("Garage") }
  if (a.dependance   && v.dependance)   { score += 3; details.push("Dépendance") }
  if (a.plain_pied   && v.plain_pied)   { score += 2; details.push("Plain-pied") }

  return { score, details }
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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
  fontSize: "11px", fontWeight: "600", letterSpacing: "0.18em",
  textTransform: "uppercase", color: "rgba(255,255,255,0.75)",
  display: "block", marginBottom: "8px", fontFamily: "'DM Sans', sans-serif",
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function Matching() {
  const [matches, setMatches]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [visiteModal, setVisiteModal] = useState(null)
  const [scoreMin, setScoreMin]       = useState(40)

  useEffect(() => { calculerRapprochements() }, [])

  async function calculerRapprochements() {
    setLoading(true)

    // Lire depuis les 4 tables métier
    const [resA, resV, resAP, resVP] = await Promise.all([
      supabase.from("acquereurs").select("*"),
      supabase.from("vendeurs").select("*"),
      supabase.from("acquereurs_patrimoine").select("*"),
      supabase.from("vendeurs_prestige").select("*"),
    ])

    const acquereurs = [
      ...(resA.data  || []).map(r => ({ ...r, type_client: "acquereur" })),
      ...(resAP.data || []).map(r => ({ ...r, type_client: "acquereur_patrimoine" })),
    ]
    const vendeurs = [
      ...(resV.data  || []).map(r => ({ ...r, type_client: "vendeur" })),
      ...(resVP.data || []).map(r => ({ ...r, type_client: "vendeur_prestige" })),
    ]

    const resultats = []
    for (const a of acquereurs) {
      for (const v of vendeurs) {
        const { score, details } = calculerScore(a, v)
        if (score >= 40) resultats.push({ acquereur: a, vendeur: v, score, details })
      }
    }

    setMatches(resultats.sort((a, b) => b.score - a.score))
    setLoading(false)
  }

  async function enregistrerVisite(note, date, heure) {
    if (!note.trim() || !visiteModal) return
    const { vendeur } = visiteModal
    const table = vendeur.type_client === "vendeur_prestige" ? "vendeurs_prestige" : "vendeurs"
    const entree = `[Visite ${date} ${heure}] ${note.trim()} — Acquéreur : ${visiteModal.acquereur.nom}`
    const notesMAJ = vendeur.notes ? vendeur.notes + "\n" + entree : entree
    await supabase.from(table).update({ notes: notesMAJ }).eq("id", vendeur.id)
    setVisiteModal(null)
    alert("Visite enregistrée ✅")
  }

  const matchesFiltres = matches.filter(m => m.score >= scoreMin)

  const scoreColor = (s) => s >= 80 ? "#34d399" : s >= 60 ? "#C4A882" : "rgba(255,255,255,0.60)"

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", padding: "40px", color: "#fff" }}>

      {/* En-tête */}
      <div className="mb-10">
        <p style={{ color: "#C4A882", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: "600", marginBottom: "10px" }}>
          Intelligence Artificielle
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "300", letterSpacing: "0.02em", lineHeight: 1 }}>
          Rapprochements Automatiques
        </h1>
      </div>

      {/* KPI + filtre score */}
      <div className="flex flex-wrap items-center gap-6 mb-10">
        <div className="liquid-glass rounded-2xl px-6 py-4 text-center min-w-[120px]">
          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.60)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Matches</p>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.5rem", fontWeight: "300" }}>{matchesFiltres.length}</p>
        </div>
        <div className="liquid-glass rounded-2xl px-6 py-4 flex-1 min-w-[200px]">
          <label style={{ ...labelStyle, marginBottom: "10px" }}>Score minimum : {scoreMin}%</label>
          <input type="range" min="30" max="90" step="5" value={scoreMin}
            onChange={(e) => setScoreMin(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#C4A882" }}
          />
        </div>
        <button onClick={calculerRapprochements}
          style={{ padding: "12px 24px", borderRadius: "20px", border: "1px solid rgba(196,168,130,0.40)", background: "rgba(196,168,130,0.10)", color: "#C4A882", fontSize: "11px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
          ↻ Recalculer
        </button>
      </div>

      {/* Liste matches */}
      {loading ? (
        <p style={{ color: "#C4A882", fontStyle: "italic" }} className="animate-pulse">Calcul des rapprochements...</p>
      ) : (
        <div className="grid gap-6">
          {matchesFiltres.map((m, idx) => (
            <div key={idx} className="liquid-glass p-8 rounded-[32px] border border-white/10 relative overflow-hidden">

              {/* Score badge */}
              <div style={{ position: "absolute", top: 0, left: 0, background: scoreColor(m.score), fontFamily: "'Cormorant Garamond', serif", color: m.score >= 40 ? "#000" : "#fff", padding: "6px 20px", borderBottomRightRadius: "20px", fontSize: "1.4rem", fontWeight: "700" }}>
                {m.score}%
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-8 mt-4">

                {/* Acquéreur */}
                <div className="flex-1">
                  <p style={{ fontSize: "11px", color: "#C4A882", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: "600", marginBottom: "6px" }}>Acquéreur</p>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: "400" }}>{m.acquereur.nom}</h3>
                  <p style={{ fontSize: "13px", color: "#C4A882", marginTop: "4px", fontStyle: "italic" }}>
                    {m.acquereur.budget?.toLocaleString()} € · {m.acquereur.secteur}
                  </p>
                  {m.acquereur.nb_chambres && <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", marginTop: "2px" }}>{m.acquereur.nb_chambres} · {m.acquereur.type_bien}</p>}
                  {m.acquereur.telephone && (
                    <a href={`tel:${m.acquereur.telephone}`} style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "4px", display: "block" }}>
                      📱 {m.acquereur.telephone}
                    </a>
                  )}
                </div>

                {/* Critères */}
                <div className="flex flex-col items-center gap-2">
                  <div className="text-2xl animate-pulse">🤝</div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {m.details.map(d => (
                      <span key={d} style={{ fontSize: "10px", background: "rgba(255,255,255,0.10)", padding: "3px 10px", borderRadius: "20px", color: "rgba(255,255,255,0.85)", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Vendeur */}
                <div className="flex-1 text-right">
                  <p style={{ fontSize: "11px", color: "#34d399", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: "600", marginBottom: "6px" }}>Vendeur</p>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: "400" }}>{m.vendeur.nom}</h3>
                  <p style={{ fontSize: "13px", color: "#34d399", marginTop: "4px", fontStyle: "italic" }}>
                    {m.vendeur.budget?.toLocaleString()} € · {m.vendeur.secteur}
                  </p>
                  {m.vendeur.nb_chambres && <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", marginTop: "2px" }}>{m.vendeur.nb_chambres} · {m.vendeur.type_bien}</p>}
                  {m.vendeur.telephone && (
                    <a href={`tel:${m.vendeur.telephone}`} style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "4px", display: "block", textAlign: "right" }}>
                      📱 {m.vendeur.telephone}
                    </a>
                  )}
                </div>

              </div>

              {/* Bouton visite */}
              <div className="flex justify-center mt-6">
                <button onClick={() => setVisiteModal(m)}
                  style={{ fontFamily: "'DM Sans', sans-serif", background: "#fff", color: "#000", padding: "12px 32px", borderRadius: "40px", fontSize: "11px", fontWeight: "700", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", border: "none", transition: "all 0.2s" }}
                  onMouseOver={(e) => { e.target.style.background = "#C4A882"; e.target.style.color = "#fff" }}
                  onMouseOut={(e)  => { e.target.style.background = "#fff";    e.target.style.color = "#000" }}
                >
                  Organiser la visite
                </button>
              </div>

            </div>
          ))}

          {matchesFiltres.length === 0 && !loading && (
            <div className="text-center py-20 liquid-glass rounded-[32px] border border-dashed border-white/20">
              <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.70)", fontStyle: "italic" }}>Aucun rapprochement au-dessus de {scoreMin}%</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.40)", marginTop: "8px", letterSpacing: "0.12em", textTransform: "uppercase" }}>Abaisse le score minimum ou enrichis les fiches</p>
            </div>
          )}
        </div>
      )}

      {visiteModal && (
        <ModalVisite match={visiteModal} onClose={() => setVisiteModal(null)} onSave={enregistrerVisite} />
      )}
    </div>
  )
}

// ─── Modal visite ─────────────────────────────────────────────────────────────
function ModalVisite({ match, onClose, onSave }) {
  const today = new Date().toISOString().split("T")[0]
  const [date,  setDate]  = useState(today)
  const [heure, setHeure] = useState("10:00")
  const [note,  setNote]  = useState("")

  const inputS = {
    width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "14px", padding: "14px 20px", outline: "none", color: "#fff",
    fontSize: "14px", fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.2s",
  }
  const labelS = {
    fontSize: "11px", fontWeight: "600", letterSpacing: "0.18em", textTransform: "uppercase",
    color: "rgba(255,255,255,0.75)", display: "block", marginBottom: "8px",
  }
  const focus = (e) => e.target.style.borderColor = "#C4A882"
  const blur  = (e) => e.target.style.borderColor = "rgba(255,255,255,0.12)"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.80)", backdropFilter: "blur(10px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-xl rounded-[32px] p-10 relative"
        style={{ background: "rgba(8,8,6,0.97)", border: "1px solid rgba(196,168,130,0.25)", boxShadow: "0 40px 100px rgba(0,0,0,0.7)", maxHeight: "90vh", overflowY: "auto" }}
      >
        <button onClick={onClose} className="absolute top-6 right-7 text-white/40 hover:text-white/80 text-2xl">×</button>

        <div className="mb-8">
          <p style={{ color: "#C4A882", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: "600", marginBottom: "8px" }}>Mise en relation</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: "300", color: "#fff" }}>Organiser la visite</h2>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "6px" }}>{match.acquereur.nom} · {match.vendeur.nom} · {match.score}%</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label style={labelS}>Date</label>
            <input type="date" style={inputS} value={date} onFocus={focus} onBlur={blur} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label style={labelS}>Heure</label>
            <input type="time" style={inputS} value={heure} onFocus={focus} onBlur={blur} onChange={(e) => setHeure(e.target.value)} />
          </div>
        </div>

        <div className="mb-8">
          <label style={labelS}>Note de visite</label>
          <textarea rows="3" style={{ ...inputS, resize: "vertical" }}
            placeholder="Lieu de rendez-vous, points à vérifier..."
            value={note} onFocus={focus} onBlur={blur} onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <button onClick={onClose}
            className="flex-1 py-4 rounded-full border border-white/15 text-white/60 hover:text-white/90 transition-all text-xs uppercase tracking-[0.2em] font-semibold">
            Annuler
          </button>
          <button onClick={() => onSave(note, date, heure)}
            className="flex-1 py-4 rounded-full bg-white text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-[#C4A882] hover:text-white transition-all">
            Confirmer
          </button>
        </div>
      </div>
    </div>
  )
}
