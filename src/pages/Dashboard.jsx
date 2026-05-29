import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabase"
import { lancerMatching } from "../services/matching"

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ vendeurs: 0, acquereurs: 0, matches: 0, prestige: 0, volumeAffaires: 0 })
  const [loading, setLoading] = useState(false)
  const [matchMsg, setMatchMsg] = useState(null)

  useEffect(() => { fetchStats() }, [])

  async function fetchStats() {
    const [vRes, aRes, mRes] = await Promise.all([
      supabase.from('vendeurs').select('id, prix_vente', { count: 'exact' }),
      supabase.from('acquereurs').select('id', { count: 'exact' }),
      supabase.from('matches').select('id', { count: 'exact' }),
    ])
    const volume = (vRes.data || []).reduce((acc, v) => acc + (Number(v.prix_vente) || 0), 0)
    setStats({
      vendeurs:       vRes.count  || 0,
      acquereurs:     aRes.count  || 0,
      matches:        mRes.count  || 0,
      volumeAffaires: volume,
    })
  }

  async function handleLancerMatching() {
    setLoading(true)
    setMatchMsg(null)
    const { count, error } = await lancerMatching()
    setLoading(false)
    if (error) { setMatchMsg({ type: 'error', text: 'Erreur : ' + error }); return }
    setMatchMsg({ type: 'success', text: count + ' rapprochements trouvés !' })
    await fetchStats()
    setTimeout(() => navigate('/matching'), 1200)
  }

  const fmt = (n) => n >= 1000000 ? (n/1000000).toFixed(1) + ' M€' : n >= 1000 ? (n/1000).toFixed(0) + ' K€' : n + ' €'

  return (
    <div className="p-6 md:p-10">
      <div className="mb-6">
        <h1 className="text-5xl font-serif tracking-tight text-white">Immo<span className="text-[#C87533]">Match</span></h1>
        <p className="text-white/60 uppercase tracking-[0.4em] text-xs mt-2">Intelligence Immobilière & Pilotage</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="VOLUME D'AFFAIRES" value={fmt(stats.volumeAffaires)} sub="Total mandats vendeurs" color="border-[#C87533]/40" />
        <StatCard title="MANDATS VENDEURS"  value={stats.vendeurs}            sub="Biens en stock"       color="border-white/20" />
        <StatCard title="PORTEFEUILLE ACQ."  value={stats.acquereurs}          sub="Recherches actives"  color="border-white/20" />
        <StatCard title="MATCHES ACTIFS"     value={stats.matches}             sub="Rapprochements IA"  color="border-[#D4AF37]/40" />
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Matching */}
        <div className="liquid-glass p-6 rounded-[32px] border border-white/10 group hover:border-[#C8753]/40 transition-all">
          <h3 className="text-xl font-light mb-2 italic text-white">Prêt pour un match ?</h3>
          <p className="text-white/60 text-sm mb-4 leading-relaxed">L'algorithme analyse la compatibilité entre vos {stats.vendeurs} mandats et {stats.acquereurs} acquéreurs.</p>
          {matchMsg && (
            <p className={`text-sm mb-3 font-medium ${matchMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {matchMsg.text}
            </p>
          )}
          <button
            onClick={handleLancerMatching}
            disabled={loading}
            className="bg-white text-black px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#C87533] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? 'Analyse en cours...' : 'Lancer le Matching'}
          </button>
        </div>

        {/* Prestige */}
        <div className="liquid-glass p-6 rounded-[40px] border border-white/10 bg-gradient-to-br from-[#D4AF37]/5 to-transparent">
          <h3 className="text-xl font-light mb-2 italic text-[#D4AF37]">Focus Prestige</h3>
          <p className="text-white/60 text-sm mb-4 leading-relaxed">Sélection Gold — biens d'exception, clients patrimoniaux.</p>
          <button
            onClick={() => navigate('/prestige')}
            className="border border-[#D4AF37]/50 text-[#D4AF37] px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#D4AF37]/10 transition-all cursor-pointer"
          >
            Voir la sélection
          </button>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, sub, color }) {
  return (
    <div className={`liquid-glass p-5 rounded-[28px] border ${color} hover:scale-[1.02] transition-transform`}>
      <p className="text-[10px] uppercase tracking-widest text-white/60 mb-2 font-bold">{title}</p>
      <h2 className="text-4xl font-light text-white mb-1">{value}</h2>
      <p className="text-xs text-white/50">{sub}</p>
    </div>
  )
}
