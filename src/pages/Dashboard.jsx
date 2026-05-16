import { useEffect, useState } from "react"
import { supabase } from "../supabase"

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    vendeurs: 0,
    acquereurs: 0,
    prestige: 0,
    volumeAffaires: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    const { data, error } = await supabase.from("clients").select("*")
    
    if (!error && data) {
      const vendeurs = data.filter(c => c.type_client === "vendeur")
      const acquereurs = data.filter(c => c.type_client === "acquereur")
      const prestige = data.filter(c => c.categorie_client === "prestige")
      
      // Calcul du volume d'affaires (somme des prix vendeurs)
      const volume = vendeurs.reduce((acc, curr) => acc + (Number(curr.budget) || 0), 0)

      setStats({
        total: data.length,
        vendeurs: vendeurs.length,
        acquereurs: acquereurs.length,
        prestige: prestige.length,
        volumeAffaires: volume
      })
    }
  }

  return (
    <div className="p-10">
      {/* HEADER AVEC NOUVEAU NOM */}
      <div className="mb-16">
        <h1 className="text-7xl font-serif tracking-tighter text-white">
          Immo<span className="text-[#C87533]">Match</span>
        </h1>
        <p className="text-white/30 uppercase tracking-[0.4em] text-xs mt-4">Intelligence Immobilière & Pilotage</p>
      </div>

      {/* GRILLE DE STATISTIQUES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        
        <StatCard title="Volume d'affaires" value={`${(stats.volumeAffaires / 1000000).toFixed(1)} M€`} sub="Total mandats vendeurs" color="border-emerald-500/30" />
        
        <StatCard title="Mandats Vendeurs" value={stats.vendeurs} sub="Biens en stock" color="border-emerald-500/30" />
        
        <StatCard title="Portefeuille Acquéreurs" value={stats.acquereurs} sub="Recherches actives" color="border-[#C87533]/30" />
        
        <StatCard title="Dossiers Prestige" value={stats.prestige} sub="Sélection Gold" color="border-[#D4AF37]/30" />

      </div>

      {/* ACCÈS RAPIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="liquid-glass p-10 rounded-[40px] border border-white/5 group hover:border-[#C87533]/40 transition-all cursor-pointer">
          <h3 className="text-2xl font-light mb-4 italic">Prêt pour un match ?</h3>
          <p className="text-white/50 text-sm mb-8 leading-relaxed">L'algorithme a identifié de nouvelles compatibilités entre vos mandats et vos acquéreurs.</p>
          <button className="bg-white text-black px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest group-hover:bg-[#C87533] group-hover:text-white transition-all">
            Lancer le Matching
          </button>
        </div>

        <div className="liquid-glass p-10 rounded-[40px] border border-white/5 bg-gradient-to-br from-[#D4AF37]/5 to-transparent">
          <h3 className="text-2xl font-light mb-4 italic text-[#D4AF37]">Focus Prestige</h3>
          <p className="text-white/50 text-sm mb-8 leading-relaxed">Vous avez {stats.prestige} dossiers haut de gamme en attente d'expertise.</p>
          <div className="flex gap-4">
             <div className="w-12 h-12 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">⚜️</div>
             <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center opacity-20">⚜️</div>
             <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center opacity-20">⚜️</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, sub, color }) {
  return (
    <div className={`liquid-glass p-8 rounded-[35px] border ${color} hover:scale-105 transition-transform`}>
      <p className="text-[10px] uppercase tracking-widest text-white/30 mb-4 font-bold">{title}</p>
      <h2 className="text-5xl font-light text-white mb-2">{value}</h2>
      <p className="text-xs text-white/20">{sub}</p>
    </div>
  )
}