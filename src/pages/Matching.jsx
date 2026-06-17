import { useState, useEffect } from "react"
import { calculerMatchesMemoire, lancerMatching, scoreColor, scoreBg, scoreBorder } from "../services/matching"

const lbl = {
  display: "block", fontSize: "10px", fontWeight: "700",
  letterSpacing: "0.12em", color: "var(--text2)",
  marginBottom: "4px", textTransform: "uppercase",
}

const fmtBudget = (n) => {
  const v = Number(n) || 0
  if (!v) return "—"
  return v >= 1000000
    ? (v / 1000000).toFixed(2).replace(/\.?0+$/, "") + " M€"
    : v >= 1000 ? (v / 1000).toFixed(0) + " K€" : v + " €"
}

export default function Matching() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [msg, setMsg] = useState(null)
  const [filterMin, setFilterMin] = useState(0)
  const [search, setSearch] = useState("")

  useEffect(() => { loadMatches() }, [])

  async function loadMatches() {
    setLoading(true)
    const result = await calculerMatchesMemoire()
    setMatches(result)
    setLoading(false)
  }

  async function handleRelancer() {
    setRunning(true); setMsg(null)
    const { count, error } = await lancerMatching()
    setRunning(false)
    if (error) { setMsg({ type: "error", text: "Erreur : " + error }); return }
    setMsg({ type: "success", text: `${count} rapprochements calculés et sauvegardés.` })
    await loadMatches()
    setTimeout(() => setMsg(null), 3000)
  }

  const filtered = matches.filter(m => {
    const q = search.toLowerCase()
    const matchSearch = !q
      || (m.acquereur?.nom || "").toLowerCase().includes(q)
      || (m.vendeur?.nom   || "").toLowerCase().includes(q)
      || (m.vendeur?.secteur || "").toLowerCase().includes(q)
    const matchScore = m.total >= filterMin
    return matchSearch && matchScore
  })

  const top   = filtered.filter(m => m.total >= 80)
  const moyen = filtered.filter(m => m.total >= 55 && m.total < 80)
  const faible= filtered.filter(m => m.total < 55)

  return (
    <div style={{ padding: "clamp(16px, 4vw, 40px)", paddingBottom: "88px", maxWidth: "960px" }} className="lg:pb-10">

      {/* En-tête */}
      <div style={{ marginBottom: "20px" }}>
        <p style={{ ...lbl, marginBottom: "2px" }}>IA</p>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "clamp(28px, 6vw, 36px)", fontWeight: "700", color: "var(--text)", letterSpacing: "-0.5px", marginBottom: "4px" }}>
              Matching <span style={{ color: "var(--accent)" }}>🔗</span>
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text2)" }}>
              {matches.length} rapprochements calculés · {top.length} excellents
            </p>
          </div>
          <button
            onClick={handleRelancer}
            disabled={running}
            style={{
              background: "var(--accent)", color: "#fff", border: "none",
              borderRadius: "999px", padding: "10px 20px",
              fontSize: "12px", fontWeight: "700", letterSpacing: "0.08em",
              textTransform: "uppercase", cursor: running ? "not-allowed" : "pointer",
              opacity: running ? 0.6 : 1, transition: "opacity 0.2s",
            }}
          >
            {running ? "Calcul…" : "↺ Relancer"}
          </button>
        </div>
      </div>

      {msg && (
        <div style={{
          marginBottom: "16px", padding: "12px 16px", borderRadius: "14px",
          background: msg.type === "success" ? "var(--success-bg)" : "var(--error-bg)",
          border: `1px solid ${msg.type === "success" ? "var(--success)" : "var(--error)"}`,
          color: msg.type === "success" ? "var(--success)" : "var(--error)",
          fontSize: "13px", fontWeight: "500",
        }}>{msg.text}</div>
      )}

      {/* Filtres */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou commune…"
          style={{
            flex: "1 1 200px", background: "var(--input-bg)",
            border: "1.5px solid var(--border)", borderRadius: "10px",
            padding: "9px 14px", color: "var(--text)", fontSize: "13px",
            outline: "none", fontFamily: "inherit",
          }}
        />
        {[0, 55, 80].map(min => (
          <button key={min} onClick={() => setFilterMin(min)} style={{
            padding: "9px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: "600", cursor: "pointer",
            background: filterMin === min ? "var(--accent)" : "transparent",
            color: filterMin === min ? "#fff" : "var(--text2)",
            border: filterMin === min ? "none" : "1.5px solid var(--border)",
            transition: "all 0.15s",
          }}>
            {min === 0 ? "Tous" : min === 55 ? "≥55%" : "≥80%"}
          </button>
        ))}
      </div>

      {/* Résultats */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "48px", color: "var(--text3)" }}>Calcul en cours…</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "16px", textAlign: "center", padding: "48px 24px" }}>
          <p style={{ fontSize: "32px", marginBottom: "12px" }}>🔗</p>
          <p style={{ color: "var(--text2)", fontSize: "15px", marginBottom: "6px" }}>Aucun rapprochement</p>
          <p style={{ color: "var(--text3)", fontSize: "13px" }}>Ajoutez des vendeurs et acquéreurs, puis lancez le matching.</p>
        </div>
      ) : (
        <>
          {top.length > 0 && (
            <Section titre={`🟢 Excellents — ≥80% (${top.length})`} matches={top} />
          )}
          {moyen.length > 0 && (
            <Section titre={`🟡 Bons — 55–79% (${moyen.length})`} matches={moyen} />
          )}
          {faible.length > 0 && filterMin < 55 && (
            <Section titre={`⚪ Faibles — <55% (${faible.length})`} matches={faible} collapsed />
          )}
        </>
      )}
    </div>
  )
}

function Section({ titre, matches, collapsed = false }) {
  const [open, setOpen] = useState(!collapsed)

  return (
    <div style={{ marginBottom: "20px" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", background: "none", border: "none", cursor: "pointer",
          padding: "0 0 10px", textAlign: "left",
        }}
      >
        <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text2)" }}>
          {titre}
        </p>
        <span style={{ color: "var(--text3)", fontSize: "12px", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
      </button>

      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {matches.map((m, i) => <MatchCard key={i} match={m} />)}
        </div>
      )}
    </div>
  )
}

function MatchCard({ match: m }) {
  const [open, setOpen] = useState(false)
  const score = m.total

  return (
    <div style={{
      background: scoreBg(score),
      border: `1px solid ${scoreBorder(score)}`,
      borderRadius: "16px",
      overflow: "hidden",
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "grid",
          gridTemplateColumns: "52px 1fr auto 1fr",
          gap: "10px", alignItems: "center",
          padding: "14px 16px",
          width: "100%", background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
        }}
      >
        {/* Score */}
        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: "22px", fontWeight: "300", color: scoreColor(score), lineHeight: 1 }}>{score}</span>
          <p style={{ fontSize: "10px", color: "var(--text3)", letterSpacing: "0.08em" }}>%</p>
        </div>

        {/* Acquéreur */}
        <div>
          <p style={{ fontSize: "9px", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>Acquéreur</p>
          <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text)", lineHeight: 1.2 }}>{m.acquereur?.nom || "—"}</p>
          <p style={{ fontSize: "12px", color: "var(--text2)" }}>{fmtBudget(m.acquereur?.budget)}</p>
        </div>

        <span style={{ color: "var(--text3)", fontSize: "18px" }}>→</span>

        {/* Vendeur */}
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "9px", color: "var(--success)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>Vendeur</p>
          <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text)", lineHeight: 1.2 }}>{m.vendeur?.nom || "—"}</p>
          <p style={{ fontSize: "12px", color: "var(--text2)" }}>{m.vendeur?.secteur || "—"}</p>
        </div>
      </button>

      {open && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border2)" }}>
          {/* Détail scores */}
          <div style={{ marginTop: "12px" }}>
            <p style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text3)", marginBottom: "8px" }}>
              Détail du score
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {Object.entries(m.details || {}).map(([key, pts]) => (
                <span key={key} style={{
                  fontSize: "11px", padding: "4px 10px", borderRadius: "999px",
                  background: "var(--card-bg)", border: "1px solid var(--border)",
                  color: "var(--text2)",
                }}>
                  {key.replace(/_/g, " ")} +{pts}
                </span>
              ))}
            </div>
          </div>

          {/* Badge co-closing */}
          {(m.acquereur?.tipser || m.vendeur?.tipser) && (
            <div style={{
              marginTop: "12px",
              padding: "8px 12px",
              borderRadius: "10px",
              background: "var(--accent-bg)",
              border: "1px solid var(--accent)",
              display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap",
            }}>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em" }}>🤝 Co-closing</span>
              {m.acquereur?.tipser && (
                <span style={{ fontSize: "12px", color: "var(--text2)" }}>
                  Acq. → <strong style={{ color: "var(--accent)" }}>{m.acquereur.tipser}</strong>
                </span>
              )}
              {m.acquereur?.tipser && m.vendeur?.tipser && (
                <span style={{ fontSize: "11px", color: "var(--text3)" }}>·</span>
              )}
              {m.vendeur?.tipser && (
                <span style={{ fontSize: "12px", color: "var(--text2)" }}>
                  Vend. → <strong style={{ color: "var(--success)" }}>{m.vendeur.tipser}</strong>
                </span>
              )}
            </div>
          )}

          {/* Fiche acquéreur */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "14px" }}>
            <div>
              <p style={{ fontSize: "9px", fontWeight: "700", color: "var(--accent)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Acquéreur</p>
              {m.acquereur?.telephone && <p style={{ fontSize: "12px", color: "var(--text2)", marginBottom: "2px" }}>📞 {m.acquereur.telephone}</p>}
              {m.acquereur?.type_bien && <p style={{ fontSize: "12px", color: "var(--text2)", marginBottom: "2px" }}>🏠 {m.acquereur.type_bien}</p>}
              {m.acquereur?.secteur   && <p style={{ fontSize: "12px", color: "var(--text2)", marginBottom: "2px" }}>📍 {m.acquereur.secteur}</p>}
              {m.acquereur?.nb_chambres && <p style={{ fontSize: "12px", color: "var(--text2)" }}>{m.acquereur.nb_chambres}</p>}
              {m.acquereur?.tipser && <p style={{ fontSize: "12px", color: "var(--accent)", marginTop: "4px" }}>👤 Via {m.acquereur.tipser}</p>}
            </div>
            <div>
              <p style={{ fontSize: "9px", fontWeight: "700", color: "var(--success)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Vendeur</p>
              {m.vendeur?.telephone && <p style={{ fontSize: "12px", color: "var(--text2)", marginBottom: "2px" }}>📞 {m.vendeur.telephone}</p>}
              {m.vendeur?.type_bien && <p style={{ fontSize: "12px", color: "var(--text2)", marginBottom: "2px" }}>🏠 {m.vendeur.type_bien}</p>}
              {m.vendeur?.secteur   && <p style={{ fontSize: "12px", color: "var(--text2)", marginBottom: "2px" }}>📍 {m.vendeur.secteur}</p>}
              {m.vendeur?.surface_habitable && <p style={{ fontSize: "12px", color: "var(--text2)" }}>{m.vendeur.surface_habitable} m²</p>}
              {m.vendeur?.tipser && <p style={{ fontSize: "12px", color: "var(--success)", marginTop: "4px" }}>👤 Via {m.vendeur.tipser}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
