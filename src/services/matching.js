import { supabase } from "../supabase"

// ── Algorithme de scoring ─────────────────────────────────────────────────────
//  Points attribués par critère (total max = 100)
const POIDS = {
  type_bien:    30,   // même type de bien
  secteur:      25,   // même commune
  budget:       20,   // budget acquéreur >= prix vendeur (ou ≤ +10%)
  nb_chambres:  10,   // même configuration
  bool_criteres: 15,  // piscine, vue mer, etc. (3 pts chacun, 5 critères max)
}

function scorerMatch(acquereur, vendeur) {
  let total = 0
  const details = {}

  // Type de bien
  if (acquereur.type_bien && vendeur.type_bien &&
      acquereur.type_bien.toLowerCase() === vendeur.type_bien.toLowerCase()) {
    total += POIDS.type_bien
    details.type_bien = POIDS.type_bien
  }

  // Secteur / commune
  if (acquereur.secteur && vendeur.secteur &&
      acquereur.secteur.toLowerCase() === vendeur.secteur.toLowerCase()) {
    total += POIDS.secteur
    details.secteur = POIDS.secteur
  }

  // Budget vs prix de vente
  const budget = Number(acquereur.budget) || 0
  const prix   = Number(vendeur.prix_vente) || Number(vendeur.budget) || 0
  if (budget > 0 && prix > 0) {
    if (budget >= prix) {
      // Budget couvre le prix → score plein
      total += POIDS.budget
      details.budget = POIDS.budget
    } else if (budget >= prix * 0.85) {
      // Budget à moins de 15% → score partiel
      const partial = Math.round(POIDS.budget * (budget / prix))
      total += partial
      details.budget = partial
    }
  }

  // Nombre de chambres
  if (acquereur.nb_chambres && vendeur.nb_chambres &&
      acquereur.nb_chambres === vendeur.nb_chambres) {
    total += POIDS.nb_chambres
    details.nb_chambres = POIDS.nb_chambres
  }

  // Critères booléens (3 pts chacun, 5 max = 15 pts)
  const BOOLS = ["piscine", "vue_mer", "vue_montagne", "garage", "dependance"]
  let boolScore = 0
  BOOLS.forEach(key => {
    if (acquereur[key] && vendeur[key]) boolScore += 3
  })
  total += Math.min(boolScore, POIDS.bool_criteres)
  if (boolScore > 0) details.bool_criteres = Math.min(boolScore, POIDS.bool_criteres)

  return { total: Math.min(total, 100), details }
}

// ── Calculer les matches en mémoire (sans sauvegarder) ───────────────────────
export async function calculerMatchesMemoire() {
  const [vRes, aRes] = await Promise.all([
    supabase.from("vendeurs").select("*"),
    supabase.from("acquereurs").select("*"),
  ])

  const vendeurs   = vRes.data  || []
  const acquereurs = aRes.data  || []

  const matches = []
  for (const acquereur of acquereurs) {
    for (const vendeur of vendeurs) {
      const { total, details } = scorerMatch(acquereur, vendeur)
      if (total >= 30) {   // seuil minimum de pertinence
        matches.push({ acquereur, vendeur, total, details })
      }
    }
  }

  // Trier par score décroissant
  return matches.sort((a, b) => b.total - a.total)
}

// ── Lancer le matching et sauvegarder dans Supabase ──────────────────────────
export async function lancerMatching() {
  try {
    const matches = await calculerMatchesMemoire()
    if (matches.length === 0) return { count: 0 }

    // Supprimer les anciens matches
    await supabase.from("matches").delete().neq("id", "00000000-0000-0000-0000-000000000000")

    // Insérer les nouveaux
    const rows = matches.map(m => ({
      acquereur_id:    m.acquereur.id,
      vendeur_id:      m.vendeur.id,
      score_total:     m.total,
      score_details:   m.details,
      acquereur_nom:   m.acquereur.nom  || null,
      vendeur_nom:     m.vendeur.nom    || null,
      vendeur_secteur: m.vendeur.secteur || null,
      created_at:      new Date().toISOString(),
    }))

    const { error } = await supabase.from("matches").insert(rows)
    if (error) return { count: 0, error: error.message }

    return { count: matches.length }
  } catch (e) {
    return { count: 0, error: e.message }
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function scoreColor(score) {
  if (score >= 80) return "var(--score-high)"
  if (score >= 55) return "var(--score-mid)"
  return "var(--score-low)"
}

export function scoreBg(score) {
  if (score >= 80) return "var(--success-bg)"
  if (score >= 55) return "var(--warn-bg)"
  return "var(--border2)"
}

export function scoreBorder(score) {
  if (score >= 80) return "var(--success)"
  if (score >= 55) return "var(--warn)"
  return "var(--border)"
}
