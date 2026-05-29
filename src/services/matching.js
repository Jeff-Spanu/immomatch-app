import { supabase } from '../supabase'

// ─── Scoring weights ────────────────────────────────────────────────────────
const W = { TYPE_BIEN: 35, SECTEUR: 30, BUDGET: 25, CRITERES: 10 }

function scoreBudget(budget, prix) {
  if (!prix || prix === 0) return 50
  if (budget >= prix) return 100
  const ratio = budget / prix
  if (ratio >= 0.90) return 80
  if (ratio >= 0.80) return 50
  if (ratio >= 0.70) return 20
  return 0
}

function scoreCriteres(vendeur, acquereur) {
  const crits = ['vue_mer', 'vue_montagne', 'piscine', 'garage', 'dependance', 'plain_pied']
  let matched = 0, total = 0
  for (const c of crits) {
    if (acquereur[c] === true) { total++; if (vendeur[c] === true) matched++ }
  }
  return total === 0 ? 50 : Math.round((matched / total) * 100)
}

function scoreSecteur(secteurV, secteurA) {
  if (!secteurV || !secteurA) return 0
  const v = secteurV.toLowerCase().trim()
  const a = secteurA.toLowerCase().trim()
  if (v === a) return 100
  if (v.includes(a.split(' ')[0]) || a.includes(v.split(' ')[0])) return 70
  return 0
}

export function computeScore(vendeur, acquereur) {
  const typeMatch = vendeur.type_bien && acquereur.type_bien &&
    vendeur.type_bien.toLowerCase() === acquereur.type_bien.toLowerCase()
  const sSecteur  = scoreSecteur(vendeur.secteur, acquereur.secteur)
  const sType     = typeMatch ? 100 : 0
  const prixV     = Number(vendeur.prix_vente) || Number(vendeur.budget) || 0
  const sBudget   = scoreBudget(Number(acquereur.budget) || 0, prixV)
  const sCriteres = scoreCriteres(vendeur, acquereur)
  const total = Math.round(
    (sType * W.TYPE_BIEN + sSecteur * W.SECTEUR + sBudget * W.BUDGET + sCriteres * W.CRITERES) / 100
  )
  return { total, detail: { type: sType, secteur: sSecteur, budget: sBudget, criteres: sCriteres }, matched: { type: typeMatch, secteur: sSecteur >= 70 } }
}

function priorite(score) {
  if (score >= 80) return 'haute'
  if (score >= 55) return 'moyenne'
  return 'basse'
}

// Calcule les matches en mémoire et tente de les sauvegarder
export async function lancerMatching() {
  const [{ data: vendeurs, error: eV }, { data: acquereurs, error: eA }] = await Promise.all([
    supabase.from('vendeurs').select('*'),
    supabase.from('acquereurs').select('*'),
  ])
  if (eV || eA) return { count: 0, error: (eV || eA).message }
  if (!vendeurs?.length || !acquereurs?.length) return { count: 0, error: 'Aucune donnée en base' }

  const matches = []
  for (const v of vendeurs) {
    for (const a of acquereurs) {
      if (!v.secteur && !v.type_bien) continue
      if (!a.budget && !a.secteur) continue
      const score = computeScore(v, a)
      if (score.total >= 40) {
        matches.push({
          vendeur_id: v.id, acquereur_id: a.id,
          score: score.total, priorite: priorite(score.total),
          analyse_ia: JSON.stringify(score.detail),
        })
      }
    }
  }
  matches.sort((a, b) => b.score - a.score)
  const top = matches.slice(0, 150)

  // Supprimer les anciens matches
  await supabase.from('matches').delete().neq('id', 0)

  // Insérer par batch de 20 pour éviter les timeouts
  if (top.length > 0) {
    const batchSize = 20
    for (let i = 0; i < top.length; i += batchSize) {
      const batch = top.slice(i, i + batchSize)
      const { error } = await supabase.from('matches').insert(batch)
      if (error) {
        console.error('Insert error:', error)
        // Retourner les matches calculés même si la sauvegarde échoue
        return { count: top.length, error: null, matches: top, saveError: error.message }
      }
    }
  }
  return { count: top.length, error: null }
}

// Calcule les matches en mémoire uniquement (sans sauvegarder)
export async function calculerMatchesMemoire() {
  const [{ data: vendeurs }, { data: acquereurs }] = await Promise.all([
    supabase.from('vendeurs').select('*'),
    supabase.from('acquereurs').select('*'),
  ])
  if (!vendeurs || !acquereurs) return []

  const matches = []
  for (const v of vendeurs) {
    for (const a of acquereurs) {
      if (!v.secteur && !v.type_bien) continue
      if (!a.budget && !a.secteur) continue
      const score = computeScore(v, a)
      if (score.total >= 40) {
        matches.push({ vendeur: v, acquereur: a, ...score, priorite: priorite(score.total), analyse_ia: JSON.stringify(score.detail) })
      }
    }
  }
  return matches.sort((a, b) => b.total - a.total).slice(0, 150)
}
