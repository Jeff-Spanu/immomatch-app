import { supabase } from '../supabase'

// ─── Scoring weights ───────────────────────────────────────────────────────
const W = {
  TYPE_BIEN:  35,   // type de bien identique
  SECTEUR:    30,   // même secteur géographique
  BUDGET:     25,   // budget compatible avec prix
  CRITERES:   10,   // critères optionnels (vue mer, piscine, etc.)
}

// Score budget : 100% si budget >= prix, dégressif sinon
function scoreBudget(budget, prix) {
  if (!prix || prix === 0) return 50          // prix inconnu → neutre
  if (budget >= prix) return 100
  const ratio = budget / prix
  if (ratio >= 0.90) return 80               // écart < 10%
  if (ratio >= 0.80) return 50               // écart 10-20%
  if (ratio >= 0.70) return 20               // écart 20-30%
  return 0
}

// Score critères optionnels (vue_mer, piscine, garage, etc.)
function scoreCriteres(vendeur, acquereur) {
  const crits = ['vue_mer', 'vue_montagne', 'piscine', 'garage', 'dependance', 'plain_pied']
  let matched = 0, total = 0
  for (const c of crits) {
    if (acquereur[c] === true) {
      total++
      if (vendeur[c] === true) matched++
    }
  }
  return total === 0 ? 50 : Math.round((matched / total) * 100)
}

// Calcul du score global pondéré
export function computeScore(vendeur, acquereur) {
  const typeMatch   = vendeur.type_bien && acquereur.type_bien &&
                      vendeur.type_bien.toLowerCase() === acquereur.type_bien.toLowerCase()
  const secteurMatch = vendeur.secteur && acquereur.secteur &&
                       vendeur.secteur.toLowerCase() === acquereur.secteur.toLowerCase()

  const sType    = typeMatch    ? 100 : 0
  const sSecteur = secteurMatch ? 100 : 0
  const sBudget  = scoreBudget(Number(acquereur.budget) || 0, Number(vendeur.prix_vente) || 0)
  const sCriteres = scoreCriteres(vendeur, acquereur)

  const total = Math.round(
    (sType    * W.TYPE_BIEN  +
     sSecteur * W.SECTEUR    +
     sBudget  * W.BUDGET     +
     sCriteres * W.CRITERES) / 100
  )

  return {
    total,
    detail: { type: sType, secteur: sSecteur, budget: sBudget, criteres: sCriteres },
    matched: { type: typeMatch, secteur: secteurMatch }
  }
}

// Priorité texte selon score
function priorite(score) {
  if (score >= 80) return 'haute'
  if (score >= 55) return 'moyenne'
  return 'basse'
}

// Lance le matching complet et sauvegarde en base
export async function lancerMatching() {
  const [{ data: vendeurs }, { data: acquereurs }] = await Promise.all([
    supabase.from('vendeurs').select('*').neq('type_bien', ''),
    supabase.from('acquereurs').select('*').neq('type_bien', ''),
  ])
  if (!vendeurs || !acquereurs) return { count: 0, error: 'Données manquantes' }

  const matches = []
  for (const v of vendeurs) {
    for (const a of acquereurs) {
      const score = computeScore(v, a)
      if (score.total >= 40) {
        matches.push({
          vendeur_id:   v.id,
          acquereur_id: a.id,
          score:        score.total,
          priorite:     priorite(score.total),
          analyse_ia:   JSON.stringify(score.detail),
        })
      }
    }
  }

  // Sort and keep top 100
  matches.sort((a, b) => b.score - a.score)
  const top = matches.slice(0, 100)

  // Replace all matches
  await supabase.from('matches').delete().neq('id', 0)
  if (top.length > 0) {
    await supabase.from('matches').insert(top)
  }

  return { count: top.length, error: null }
}
