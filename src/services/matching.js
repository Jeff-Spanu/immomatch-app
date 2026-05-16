export function calculerScore(a, v) {

  let score = 0

  const budgetA = parseInt(a.budget)
  const prixV = parseInt(v.prix)

  if (!isNaN(budgetA) && !isNaN(prixV)) {

    const difference = Math.abs(budgetA - prixV)

    if (difference <= 50000) {
      score += 25
    }
    else if (difference <= 100000) {
      score += 15
    }
  }

  if (a.secteur === v.secteur) {
    score += 20
  }

  if (a.type_recherche === v.type_bien) {
    score += 20
  }

  if (a.altitude_max === v.altitude) {
    score += 10
  }

  if (a.vue_mer && v.vue_mer) {
    score += 5
  }

  if (a.prestige && v.prestige) {
    score += 10
  }

  if (
    a.nb_chambres &&
    v.nb_chambres &&
    parseInt(a.nb_chambres) === parseInt(v.nb_chambres)
  ) {
    score += 10
  }

  return Math.min(score, 100)
}

export function genererAnalyse(match) {

  const points = []

  if (
    match.acquereur.secteur ===
    match.vendeur.secteur
  ) {
    points.push("secteur compatible")
  }

  if (
    match.acquereur.type_recherche ===
    match.vendeur.type_bien
  ) {
    points.push("type de bien correspondant")
  }

  if (
    match.acquereur.vue_mer &&
    match.vendeur.vue_mer
  ) {
    points.push("vue mer validée")
  }

  return points.join(" • ")
}

export function getBadge(score) {

  if (score >= 90) {
    return {
      label: "🔥 Très proche",
      color: "text-red-400"
    }
  }

  if (score >= 75) {
    return {
      label: "⭐ Excellent match",
      color: "text-yellow-400"
    }
  }

  if (score >= 50) {
    return {
      label: "👍 Compatible",
      color: "text-green-400"
    }
  }

  return {
    label: "📌 Partiel",
    color: "text-white/50"
  }
}