import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import SectionTitle from "../components/ui/SectionTitle"

export default function Matching() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    calculerRapprochements()
  }, [])

  async function calculerRapprochements() {
    setLoading(true)
    
    // 1. Récupérer TOUT le monde d'un coup
    const { data: tousLesClients, error } = await supabase
      .from("clients")
      .select("*")

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    const acquereurs = tousLesClients.filter(c => c.type_client === "acquereur")
    const vendeurs = tousLesClients.filter(c => c.type_client === "vendeur")

    let resultats = []

    // 2. Algorithme de Croisement
    acquereurs.forEach(a => {
      vendeurs.forEach(v => {
        let score = 0
        let criteresMatch = []

        // Critère 1 : Secteur (Crucial)
        if (a.secteur && v.secteur && a.secteur.toLowerCase() === v.secteur.toLowerCase()) {
          score += 40
          criteresMatch.push("Secteur")
        }

        // Critère 2 : Budget (Vendeur doit être <= Budget Acquéreur)
        if (v.budget <= a.budget && v.budget > 0) {
          score += 30
          criteresMatch.push("Prix")
        }

        // Critère 3 : Prestations
        if (a.piscine && v.piscine) { score += 10; criteresMatch.push("Piscine") }
        if (a.vue_mer && v.vue_mer) { score += 10; criteresMatch.push("Vue Mer") }
        if (a.garage && v.garage) { score += 10; criteresMatch.push("Garage") }

        // On n'affiche que si le score est significatif (> 40%)
        if (score > 40) {
          resultats.push({
            acquereur: a,
            vendeur: v,
            score,
            details: criteresMatch
          })
        }
      })
    })

    // Trier par meilleur score
    setMatches(resultats.sort((a, b) => b.score - a.score))
    setLoading(false)
  }

  return (
    <div className="p-10">
      <SectionTitle eyebrow="Intelligence Artificielle" title="Rapprochements Automatiques" />

      {loading ? (
        <p className="text-[#C87533] animate-pulse">Calcul des meilleures opportunités...</p>
      ) : (
        <div className="grid gap-6 mt-10">
          {matches.map((m, idx) => (
            <div key={idx} className="liquid-glass p-8 rounded-[40px] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden group">
              
              {/* Badge Score */}
              <div className="absolute top-0 left-0 bg-[#C87533] text-white px-6 py-2 rounded-br-3xl font-bold text-xl shadow-lg">
                {m.score}%
              </div>

              {/* Partie Acquéreur */}
              <div className="flex-1 text-center md:text-left">
                <p className="text-[10px] text-white/30 uppercase mb-1">Acquéreur potentiel</p>
                <h3 className="text-2xl font-medium">{m.acquereur.nom}</h3>
                <p className="text-[#C87533] text-sm italic">{m.acquereur.budget?.toLocaleString()} € • {m.acquereur.secteur}</p>
              </div>

              {/* Icone de Match */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-2xl animate-pulse">
                  🤝
                </div>
                <div className="mt-2 flex gap-1">
                   {m.details.map(d => (
                     <span key={d} className="text-[8px] bg-white/10 px-2 py-0.5 rounded-full text-white/60 lowercase">{d}</span>
                   ))}
                </div>
              </div>

              {/* Partie Vendeur / Bien */}
              <div className="flex-1 text-center md:text-right">
                <p className="text-[10px] text-white/30 uppercase mb-1">Bien disponible</p>
                <h3 className="text-2xl font-medium">{m.vendeur.nom}</h3>
                <p className="text-green-400 text-sm italic">{m.vendeur.budget?.toLocaleString()} € • {m.vendeur.secteur}</p>
              </div>

              {/* Action */}
              <div className="md:border-l border-white/5 md:pl-8">
                <button className="bg-white text-black px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#C87533] hover:text-white transition-all shadow-xl">
                  Organiser Visite
                </button>
              </div>
            </div>
          ))}

          {matches.length === 0 && (
            <div className="text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10">
              <p className="text-white/20 italic italic">Aucun rapprochement trouvé pour le moment.</p>
              <p className="text-xs text-white/10 mt-2 uppercase">Ajustez les critères ou importez de nouveaux mandats</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}