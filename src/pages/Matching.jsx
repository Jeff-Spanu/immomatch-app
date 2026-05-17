import { useEffect, useState } from "react"
import { supabase } from "../supabase"

export default function Matching() {
  const [matches, setMatches]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [visiteModal, setVisiteModal] = useState(null) // match sélectionné

  useEffect(() => { calculerRapprochements() }, [])

  async function calculerRapprochements() {
    setLoading(true)
    const { data: tousLesClients, error } = await supabase.from("clients").select("*")
    if (error) { console.error(error); setLoading(false); return }

    const acquereurs = tousLesClients.filter(c => c.type_client === "acquereur")
    const vendeurs   = tousLesClients.filter(c => c.type_client === "vendeur")
    let resultats = []

    acquereurs.forEach(a => {
      vendeurs.forEach(v => {
        let score = 0
        let criteresMatch = []
        if (a.secteur && v.secteur && a.secteur.toLowerCase() === v.secteur.toLowerCase()) { score += 40; criteresMatch.push("Secteur") }
        if (v.budget <= a.budget && v.budget > 0) { score += 30; criteresMatch.push("Prix") }
        if (a.piscine  && v.piscine)  { score += 10; criteresMatch.push("Piscine") }
        if (a.vue_mer  && v.vue_mer)  { score += 10; criteresMatch.push("Vue Mer") }
        if (a.garage   && v.garage)   { score += 10; criteresMatch.push("Garage") }
        if (score > 40) resultats.push({ acquereur: a, vendeur: v, score, details: criteresMatch })
      })
    })

    setMatches(resultats.sort((a, b) => b.score - a.score))
    setLoading(false)
  }

  // Enregistrer la note de visite dans les notes du vendeur
  async function enregistrerVisite(note, date, heure) {
    if (!note.trim() || !visiteModal) return
    const { vendeur } = visiteModal
    const entree = `[Visite ${date} ${heure}] ${note.trim()} — Acquéreur : ${visiteModal.acquereur.nom}`
    const notesMAJ = vendeur.notes ? vendeur.notes + "\n" + entree : entree
    await supabase.from("clients").update({ notes: notesMAJ }).eq("id", vendeur.id)
    setVisiteModal(null)
    alert("Visite enregistrée dans le dossier vendeur ✅")
  }

  return (
    <div className="p-10">

      {/* En-tête */}
      <div className="mb-10">
        <p style={{ color: "#C4A882", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: "600", marginBottom: "10px" }}>
          Intelligence Artificielle
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "300", letterSpacing: "0.02em", lineHeight: 1, color: "#fff" }}>
          Rapprochements Automatiques
        </h1>
      </div>

      {loading ? (
        <p style={{ color: "#C4A882" }} className="animate-pulse">Calcul des meilleures opportunités...</p>
      ) : (
        <div className="grid gap-6 mt-10">
          {matches.map((m, idx) => (
            <div key={idx} className="liquid-glass p-8 rounded-[40px] border border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden group">

              {/* Badge score */}
              <div style={{ background: "#C4A882", fontFamily: "'Cormorant Garamond', serif" }}
                className="absolute top-0 left-0 text-white px-6 py-2 rounded-br-3xl font-bold text-xl shadow-lg">
                {m.score}%
              </div>

              {/* Acquéreur */}
              <div className="flex-1 text-center md:text-left">
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: "600", marginBottom: "6px" }}>
                  Acquéreur potentiel
                </p>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: "400", color: "#fff" }}>
                  {m.acquereur.nom}
                </h3>
                <p style={{ color: "#C4A882", fontSize: "13px", fontStyle: "italic", marginTop: "4px" }}>
                  {m.acquereur.budget?.toLocaleString()} € • {m.acquereur.secteur}
                </p>
                {m.acquereur.telephone && (
                  <a href={`tel:${m.acquereur.telephone}`}
                    style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", marginTop: "4px", display: "block" }}>
                    📱 {m.acquereur.telephone}
                  </a>
                )}
              </div>

              {/* Icône match */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/15 text-2xl animate-pulse">
                  🤝
                </div>
                <div className="mt-2 flex gap-1 flex-wrap justify-center">
                  {m.details.map(d => (
                    <span key={d} style={{ fontSize: "11px", background: "rgba(255,255,255,0.12)", padding: "3px 10px", borderRadius: "20px", color: "rgba(255,255,255,0.90)", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Vendeur */}
              <div className="flex-1 text-center md:text-right">
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: "600", marginBottom: "6px" }}>
                  Bien disponible
                </p>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: "400", color: "#fff" }}>
                  {m.vendeur.nom}
                </h3>
                <p style={{ color: "#34d399", fontSize: "13px", fontStyle: "italic", marginTop: "4px" }}>
                  {m.vendeur.budget?.toLocaleString()} € • {m.vendeur.secteur}
                </p>
                {m.vendeur.telephone && (
                  <a href={`tel:${m.vendeur.telephone}`}
                    style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", marginTop: "4px", display: "block", textAlign: "right" }}>
                    📱 {m.vendeur.telephone}
                  </a>
                )}
              </div>

              {/* Action */}
              <div className="md:border-l border-white/10 md:pl-8">
                <button
                  onClick={() => setVisiteModal(m)}
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                  className="bg-white text-black px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#C4A882] hover:text-white transition-all shadow-xl">
                  Organiser Visite
                </button>
              </div>
            </div>
          ))}

          {matches.length === 0 && (
            <div className="text-center py-20 liquid-glass rounded-[40px] border border-dashed border-white/20">
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "1.1rem", fontWeight: "400", color: "rgba(255,255,255,0.90)", fontStyle: "italic" }}>
                Aucun rapprochement trouvé pour le moment.
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.65)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "10px" }}>
                Ajustez les critères ou importez de nouveaux mandats
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── MODAL ORGANISER VISITE ── */}
      {visiteModal && <ModalVisite match={visiteModal} onClose={() => setVisiteModal(null)} onSave={enregistrerVisite} />}
    </div>
  )
}

function ModalVisite({ match, onClose, onSave }) {
  const today = new Date().toISOString().split("T")[0]
  const [date,  setDate]  = useState(today)
  const [heure, setHeure] = useState("10:00")
  const [note,  setNote]  = useState("")

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
    display: "block", marginBottom: "8px",
  }

  const contactCard = (client, color) => (
    <div style={{ background: "rgba(0,0,0,0.30)", border: `1px solid ${color}30`, borderRadius: "14px", padding: "16px 20px" }}>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: "400", color: "#fff", marginBottom: "6px" }}>{client.nom}</p>
      {client.telephone && (
        <a href={`tel:${client.telephone}`} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color, textDecoration: "none", marginBottom: "4px" }}>
          📱 {client.telephone}
        </a>
      )}
      {client.email && (
        <a href={`mailto:${client.email}`} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>
          ✉️ {client.email}
        </a>
      )}
      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", marginTop: "8px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        {client.secteur} • {client.budget?.toLocaleString()} €
      </p>
    </div>
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.80)", backdropFilter: "blur(10px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-2xl rounded-[32px] p-10 relative"
        style={{
          background: "rgba(8, 8, 6, 0.97)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <button onClick={onClose} className="absolute top-6 right-7 text-white/40 hover:text-white/80 transition-colors text-2xl leading-none">×</button>

        <div className="mb-8">
          <p style={{ color: "#C4A882", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: "600", marginBottom: "8px" }}>
            Mise en relation
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: "300", color: "#fff", lineHeight: 1 }}>
            Organiser la Visite
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#C4A882" }} />
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", fontStyle: "italic" }}>
              Score de compatibilité : {match.score}% — {match.details.join(", ")}
            </span>
          </div>
        </div>

        {/* Contacts */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {contactCard(match.acquereur, "#C4A882")}
          {contactCard(match.vendeur, "#34d399")}
        </div>

        {/* Date & Heure */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label style={labelStyle}>Date de visite</label>
            <input type="date" style={inputStyle}
              value={date}
              onFocus={(e) => e.target.style.borderColor = "#C4A882"}
              onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Heure</label>
            <input type="time" style={inputStyle}
              value={heure}
              onFocus={(e) => e.target.style.borderColor = "#C4A882"}
              onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
              onChange={(e) => setHeure(e.target.value)}
            />
          </div>
        </div>

        {/* Note */}
        <div className="mb-8">
          <label style={labelStyle}>Note de visite</label>
          <textarea rows="3"
            placeholder="Lieu de rendez-vous, points à vérifier, conditions particulières..."
            style={{ ...inputStyle, resize: "vertical" }}
            value={note}
            onFocus={(e) => e.target.style.borderColor = "#C4A882"}
            onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Boutons */}
        <div className="flex gap-4">
          <button onClick={onClose}
            className="flex-1 py-4 rounded-full border border-white/15 text-white/60 hover:text-white/90 hover:border-white/30 transition-all text-xs uppercase tracking-[0.2em] font-semibold">
            Annuler
          </button>
          <button
            onClick={() => onSave(note, date, heure)}
            className="flex-1 py-4 rounded-full bg-white text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-[#C4A882] hover:text-white transition-all">
            Confirmer la visite
          </button>
        </div>
      </div>
    </div>
  )
}
