import { useEffect, useState } from "react"
import { supabase } from "../supabase"

export default function Matching() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="p-10">

      {/* En-tête — charte Dashboard */}
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
              </div>

              {/* Action */}
              <div className="md:border-l border-white/10 md:pl-8">
                <button
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
    </div>
  )
}
