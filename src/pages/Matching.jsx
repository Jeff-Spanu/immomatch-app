import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import { lancerMatching, calculerMatchesMemoire } from "../services/matching"

const PRIORITE_COLORS = {
  haute:   { bg: 'bg-green-500/20',  border: 'border-green-500/40',  text: 'text-green-400',  label: '🔥 FORT'   },
  moyenne: { bg: 'bg-amber-500/20',  border: 'border-amber-500/40',  text: 'text-amber-400',  label: '⚡ MOYEN'  },
  basse:   { bg: 'bg-white/5',       border: 'border-white/10',      text: 'text-white/50',   label: '📎 FAIBLE' },
}

function ScoreBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="text-white/40 w-14 shrink-0">{label}</span>
      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: value + '%' }} />
      </div>
      <span className="text-white/60 w-7 text-right">{value}%</span>
    </div>
  )
}

function MatchCard({ match }) {
  const [open, setOpen] = useState(false)
  const p = PRIORITE_COLORS[match.priorite] || PRIORITE_COLORS.basse
  const detail = (() => { try { return JSON.parse(match.analyse_ia) } catch { return null } })()

  // Support both DB format (match.vendeur) and memory format (match.vendeur direct)
  const v = match.vendeur || {}
  const a = match.acquereur || {}
  const score = match.score || match.total || 0

  return (
    <div className={`${p.bg} ${p.border} border rounded-[20px] p-4 transition-all hover:scale-[1.005]`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[9px] font-bold uppercase tracking-widest ${p.text}`}>{p.label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xl font-light text-white">{score}%</span>
          <button onClick={() => setOpen(!open)} className="text-white/30 hover:text-white/70 text-xs transition-colors">
            {open ? '▲' : '▼'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center mb-3">
        <div>
          <p className="text-[8px] text-[#C87533] uppercase tracking-widest mb-0.5">ACQUÉREUR</p>
          <p className="text-white font-medium text-xs leading-tight">{a.nom || '—'}</p>
          <p className="text-white/50 text-[10px]">{a.budget > 0 ? Number(a.budget).toLocaleString('fr-FR') + ' €' : '—'} · {a.secteur || '—'}</p>
          {a.telephone && <p className="text-white/40 text-[9px] mt-0.5">📞 {a.telephone}</p>}
          {a.apporteur_affaires && <p className="text-[#D4AF37]/70 text-[9px]">👤 {a.apporteur_affaires}</p>}
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-6 h-6 rounded-full bg-[#C87533]/20 border border-[#C87533]/40 flex items-center justify-center text-[#C87533] text-xs">💛</div>
          <div className="flex gap-0.5">
            {match.matched?.type    && <span className="text-[7px] bg-white/10 rounded-full px-1 py-0.5 text-white/60">TYPE</span>}
            {match.matched?.secteur && <span className="text-[7px] bg-white/10 rounded-full px-1 py-0.5 text-white/60">SECT.</span>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[8px] text-green-400 uppercase tracking-widest mb-0.5">VENDEUR</p>
          <p className="text-white font-medium text-xs leading-tight">{v.nom || '—'}</p>
          <p className="text-white/50 text-[10px]">{(v.prix_vente || v.budget) > 0 ? Number(v.prix_vente || v.budget).toLocaleString('fr-FR') + ' €' : '—'} · {v.secteur || '—'}</p>
          {v.telephone && <p className="text-white/40 text-[9px] mt-0.5">📞 {v.telephone}</p>}
          {v.apporteur_affaires && <p className="text-[#D4AF37]/70 text-[9px]">👤 {v.apporteur_affaires}</p>}
        </div>
      </div>

      {open && detail && (
        <div className="border-t border-white/10 pt-3 mt-2 space-y-1.5">
          <ScoreBar label="Type"     value={detail.type}     color="bg-blue-400" />
          <ScoreBar label="Secteur"  value={detail.secteur}  color="bg-green-400" />
          <ScoreBar label="Budget"   value={detail.budget}   color="bg-amber-400" />
          <ScoreBar label="Critères" value={detail.criteres} color="bg-purple-400" />
        </div>
      )}

      <button
        onClick={() => window.open(`tel:${a.telephone}`)}
        className="mt-2 w-full py-1.5 rounded-full border border-white/20 text-white/70 text-[9px] uppercase tracking-widest hover:bg-white/10 transition-all"
      >
        Organiser la visite
      </button>
    </div>
  )
}

export default function Matching() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [minScore, setMinScore] = useState(40)
  const [filterPriorite, setFilterPriorite] = useState('all')
  const [msg, setMsg] = useState(null)
  const [modeMemoire, setModeMemoire] = useState(false)

  useEffect(() => { fetchMatches() }, [])

  async function fetchMatches() {
    setLoading(true)
    const { data } = await supabase
      .from('matches')
      .select(`*, vendeur:vendeur_id(*), acquereur:acquereur_id(*)`)
      .order('score', { ascending: false })

    if (data && data.length > 0) {
      setMatches(data)
      setModeMemoire(false)
    } else {
      // Fallback : calculer en mémoire
      const memMatches = await calculerMatchesMemoire()
      setMatches(memMatches.map(m => ({ ...m, score: m.total })))
      setModeMemoire(memMatches.length > 0)
    }
    setLoading(false)
  }

  async function handleRelancer() {
    setRunning(true)
    setMsg(null)
    const { count, error, saveError } = await lancerMatching()
    if (error) {
      // Fallback mémoire si erreur RLS
      const memMatches = await calculerMatchesMemoire()
      setMatches(memMatches.map(m => ({ ...m, score: m.total })))
      setModeMemoire(true)
      setMsg({ ok: true, text: `${memMatches.length} rapprochements calculés (mode temps réel)` })
      setRunning(false)
      return
    }
    if (saveError) {
      setMsg({ ok: true, text: `${count} rapprochements calculés ✓` })
    } else {
      setMsg({ ok: true, text: `${count} rapprochements sauvegardés ✓` })
    }
    await fetchMatches()
    setRunning(false)
  }

  const filtered = matches.filter(m => {
    const score = m.score || m.total || 0
    if (score < minScore) return false
    if (filterPriorite !== 'all' && m.priorite !== filterPriorite) return false
    return true
  })

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Intelligence Artificielle</p>
        <h1 className="text-4xl font-serif text-white mb-1">Rapprochements <span className="text-[#C87533]">Automatiques</span></h1>
        <p className="text-white/50 text-sm">Algorithme multi-critères · Type · Secteur · Budget · Prestations</p>
        {modeMemoire && <p className="text-amber-400/70 text-xs mt-1">⚡ Mode temps réel — résultats calculés à la volée</p>}
      </div>

      <div className="flex flex-wrap gap-3 items-center mb-6">
        <div className="liquid-glass rounded-2xl px-4 py-2 flex items-center gap-3 border border-white/10">
          <span className="text-white/60 text-xs uppercase tracking-widest">Matches</span>
          <span className="text-2xl font-light text-white">{filtered.length}</span>
        </div>

        <div className="liquid-glass rounded-2xl px-4 py-2 flex items-center gap-3 border border-white/10 flex-1 min-w-[200px]">
          <span className="text-white/60 text-xs uppercase tracking-widest shrink-0">Score min</span>
          <input type="range" min="20" max="90" value={minScore}
            onChange={e => setMinScore(Number(e.target.value))}
            className="flex-1 accent-[#C87533]" />
          <span className="text-white/80 text-xs w-8 text-right">{minScore}%</span>
        </div>

        <div className="flex gap-2">
          {['all', 'haute', 'moyenne', 'basse'].map(p => (
            <button key={p} onClick={() => setFilterPriorite(p)}
              className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest border transition-all ${
                filterPriorite === p ? 'bg-[#C87533] border-[#C87533] text-white' : 'border-white/20 text-white/50 hover:border-white/40'
              }`}>
              {p === 'all' ? 'Tous' : p}
            </button>
          ))}
        </div>

        <button onClick={handleRelancer} disabled={running}
          className="ml-auto px-5 py-2 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-[#C87533] hover:text-white transition-all disabled:opacity-50 cursor-pointer">
          {running ? '⏳ Calcul...' : '↻ Relancer'}
        </button>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-2 rounded-xl text-sm ${msg.ok ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <div className="text-center text-white/40 py-20">Chargement des rapprochements...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-white/40 py-20">
          <p className="text-2xl mb-2">🔍</p>
          <p>Aucun rapprochement avec ce filtre.</p>
          <p className="text-xs mt-1">Baissez le score minimum ou relancez le matching.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((m, i) => <MatchCard key={m.id || i} match={m} />)}
        </div>
      )}
    </div>
  )
}
