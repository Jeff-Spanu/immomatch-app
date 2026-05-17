export function computeScore(a, v) {
  let score = 0
  let details = []

  // Secteur
  if (a.secteur && v.secteur &&
      a.secteur.toLowerCase() === v.secteur.toLowerCase()) {
    score += 40
    details.push("Secteur")
  }

  // Budget
  if (v.budget && a.budget && v.budget <= a.budget) {
    score += 30
    details.push("Prix")
  }

  // Piscine
  if (a.piscine && v.piscine) {
    score += 10
    details.push("Piscine")
  }

  // Vue mer
  if (a.vue_mer && v.vue_mer) {
    score += 10
    details.push("Vue Mer")
  }

  // Garage
  if (a.garage && v.garage) {
    score += 10
    details.push("Garage")
  }

  return { score, details }
}