import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabase"
import { lancerMatching } from "../services/matching"

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ vendeurs: 0, acquereurs: 0, matches: 0, volumeAffaires: 0 })
  const [alertes, setAlertes] = useState({ sansType: 0, sansPrix: 0, sansBudget: 0, sansSecteur: 0, urgents: 0 })
  const [loading, setLoading] = useState(false)
  const [matchMsg, setMatchMsg] = useState(null)
  const [topMatches, setTopMatches] = useState([])

  useEffect(() => { fetchStats() }, [])

  async function fetchStats() {
    const [vRes, aRes, mRes, topRes] = await Promise.all([
      supabase.from('vendeurs').select('id, prix_vente, budget, type_bien, secteur'),
      supabase.from('acquereurs').select('id, budget, secteur, notes'),
      supabase.from('matches').select('id', { count: 'exact' }),
      supabase.from('matches')
        .select('score, priorite, vendeur:vendeur_id(nom, secteur), acquereur:acquereur_id(nom, budget, telephone)')
        .order('score', { ascending: false })
        .limit(5),
    ])

    const vData = vRes.data || []
    const aData = aRes.data || []

    const volume = vData.reduce((acc, v) => acc + (Number(v.prix_vente) || Number(v.budget) || 0), 0)
    const urgents = aData.filter(a => a.notes && (a.notes.includes('URGENT') || a.notes.includes('🔴'))).length

    setStats({
      vendeurs: vData.length,
      acquereurs: aData.length,
      matches: mRes.count || 0,
      volumeAffaires: volume,
    })
    setAlertes({
      sansType:    vData.filter(v => !v.type_bien).length,
      sansPrix:    vData.filter(v => !v.prix_vente && !v.budget).length,
      sansBudget:  aData.filter(a => !a.budget || a.budget === 0).length,
      sansSecteur: vData.filter(v => !v.secteur).length,
      urgents,
    })
    setTopMatches(topRes.data || [])
  }

  async function handleLancerMatching() {
    setLoading(true)
    setMatchMsg(null)
    const { count, error } = await lancerMatching()
    setLoading(false)
    if (error) { setMatchMsg({ type: 'error', text: 'Erreur : ' + error }); return }
    setMatchMsg({ type: 'success', text: `${count} rapprochements calculés !` })
    await fetchStats()
    setTimeout(() => navigate('/matching'), 1200)
  }

  const fmt = (n) => n >= 1000000 ? (n / 1000000).toFixed(1) + ' M€' : n >= 1000 ? (n / 1000).toFixed(0) + ' K€' : n + ' €'
  const fmtBudget = (n) => n > 0 ? Number(n).toLocaleString('fr-FR') + ' €' : '—'
  const hasAlertes = Object.values(alertes).some(v => v > 0)

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-5xl font-serif tracking-tight text-white">Immo<span className="text-[#C87533]">Match</span></h1>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#C87533] border border-[#C87533]/40 px-2 py-1 rounded-full">Alchemistria</span>
        </div>
        <p className="text-white/60 uppercase tracking-[0.4em] text-xs mt-2">Intelligence Immobilière & Pilotage</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="VOLUME D'AFFAIRES" value={fmt(stats.volumeAffaires)} sub="Total mandats vendeurs" color="border-[#C87533]/40" />
        <StatCard title="MANDATS VENDEURS"  value={stats.vendeurs}            sub="Biens en stock"         color="border-white/20" />
        <StatCard title="PORTEFEUILLE ACQ."  value={stats.acquereurs}          sub="Recherches actives"    color="border-white/20" />
        <StatCard title="MATCHES ACTIFS"     value={stats.matches}             sub="Rapprochements IA"    color="border-[#D4AF37]/40" />
      </div>

      {/* Alertes données */}
      {hasAlertes && (
        <div className="liquid-glass border border-amber-500/30 rounded-[24px] p-5 mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-3">⚠️ Points d'attention — Données à compléter</p>
          <div className="flex flex-wrap gap-2">
            {alertes.urgents > 0    && <AlertBadge color="red"    label={`🔴 ${alertes.urgents} acquéreur(s) URGENT à rappeler`} />}
            {alertes.sansBudget > 0 && <AlertBadge color="amber"  label={`${alertes.sansBudget} acquéreur(s) sans budget → matching impossible`} />}
            {alertes.sansType > 0   && <AlertBadge color="amber"  label={`${alertes.sansType} vendeur(s) sans type de bien`} />}
            {alertes.sansPrix > 0   && <AlertBadge color="amber"  label={`${alertes.sansPrix} vendeur(s) sans prix de vente`} />}
            {alertes.sansSecteur > 0 && <AlertBadge color="white" label={`${alertes.sansSecteur} vendeur(s) sans secteur`} />}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Matching */}
        <div className="liquid-glass p-6 rounded-[32px] border border-white/10 hover:border-[#C87533]/40 transition-all">
          <h3 className="text-xl font-light mb-2 italic text-white">Prêt pour un match ?</h3>
          <p className="text-white/60 text-sm mb-4 leading-relaxed">
            L'algorithme analyse la compatibilité entre vos {stats.vendeurs} mandats et {stats.acquereurs} acquéreurs.
          </p>
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

      {/* Top 5 matches */}
      {topMatches.length > 0 && (
        <div className="liquid-glass border border-white/10 rounded-[28px] p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">🔗 Top Rapprochements</p>
            <button onClick={() => navigate('/matching')} className="text-[10px] text-[#C87533] hover:text-[#C87533]/80 uppercase tracking-widest">Voir tous →</button>
          </div>
          <div className="flex flex-col gap-3">
            {topMatches.map((m, i) => {
              const scoreColor = m.score >= 80 ? 'text-green-400' : m.score >= 55 ? 'text-amber-400' : 'text-white/50'
              const scoreBg    = m.score >= 80 ? 'bg-green-500/10 border-green-500/20' : m.score >= 55 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-white/5 border-white/10'
              return (
                <div key={i} className={`${scoreBg} border rounded-2xl px-4 py-3 grid grid-cols-[48px_1fr_auto_1fr] gap-3 items-center`}>
                  <span className={`text-xl font-light ${scoreColor}`}>{m.score}%</span>
                  <div>
                    <p className="text-[9px] text-[#C87533] uppercase tracking-widest mb-0.5">Acquéreur</p>
                    <p className="text-white text-sm font-medium leading-tight">{m.acquereur?.nom || '—'}</p>
                    <p className="text-white/40 text-[10px]">{fmtBudget(m.acquereur?.budget)}</p>
                  </div>
                  <span className="text-white/30 text-lg">→</span>
                  <div className="text-right">
                    <p className="text-[9px] text-green-400 uppercase tracking-widest mb-0.5">Vendeur</p>
                    <p className="text-white text-sm font-medium leading-tight">{m.vendeur?.nom || '—'}</p>
                    <p className="text-white/40 text-[10px]">{m.vendeur?.secteur || '—'}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
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

function AlertBadge({ label, color }) {
  const styles = {
    red:   'bg-red-500/15 border-red-500/30 text-red-300',
    amber: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
    white: 'bg-white/5 border-white/15 text-white/50',
  }
  return (
    <span className={`${styles[color]} border rounded-full px-3 py-1 text-[11px] font-medium`}>{label}</span>
  )
}
