import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://cfeoamiobreykwiantyh.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const IMPORT_TOKEN = process.env.IMPORT_TOKEN

// Mapping ville → secteur
const SECTEUR_MAP = {
  'Le Tampon': 'Le Tampon',
  'Saint-Louis': 'Saint-Louis',
  'Saint-Pierre': 'Saint-Pierre',
  'Saint-Denis': 'Saint-Denis',
  'Saint-Philippe': 'Saint-Philippe / Sud Sauvage',
  "L'Étang-Salé": "L'Étang-Salé",
  'Les Avirons': 'Les Avirons',
  'Petite-Île': 'Petite-Île',
  'Saint-Joseph': 'Saint-Joseph',
}

// Mapping type_bien
const TYPE_MAP = {
  'Maison': 'Maison',
  'Maison de campagne': 'Maison',
  'Maison Prestige': 'Villa',
  'Maison / Gîte': 'Maison',
  'Appartement': 'Appartement',
  'Terrain': 'Terrain',
  'Local Commercial': 'Local commercial',
  'Villa': 'Villa',
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  // Auth
  const auth = req.headers['authorization']
  if (!IMPORT_TOKEN || auth !== `Bearer ${IMPORT_TOKEN}`) {
    return res.status(401).json({ error: 'Token invalide' })
  }

  try {
    const { rows } = req.body
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'Aucune donnée reçue' })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Transformation des lignes
    const vendeurs = rows.map(row => ({
      nom:               (row.nom || '').trim(),
      prenom:            (row.prenom || '').trim(),
      telephone:         (row.telephone || '').trim(),
      email:             (row.email || '').trim(),
      type_bien:         TYPE_MAP[row.type_bien] || row.type_bien || '',
      secteur:           SECTEUR_MAP[row.secteur] || row.secteur || '',
      prix:              parseInt(String(row.prix || '0').replace(/[^0-9]/g, '')) || 0,
      surface_habitable: parseFloat(row.surface) || null,
      surface_terrain:   parseFloat(row.terrain) || null,
      nb_pieces:         parseInt(row.pieces) || null,
      nb_chambres:       parseInt(row.chambres) || null,
      annee_construction: parseInt(row.annee_construction) || null,
      exclusivite:       row.exclusivite === 'Oui' || row.exclusivite === 'true',
      notes:             (row.notes || '').trim(),
      statut:            row.statut || 'actif',
      conseiller:        (row.conseiller || '').trim(),
      type_client:       'vendeur',
      categorie_client:  'standard',
    }))

    // Détection doublons par téléphone/email
    const phones = vendeurs.map(v => v.telephone).filter(Boolean)
    const emails  = vendeurs.map(v => v.email).filter(Boolean)

    let existingPhones = [], existingEmails = []
    if (phones.length) {
      const { data } = await supabase.from('vendeurs').select('telephone').in('telephone', phones)
      existingPhones = (data || []).map(r => r.telephone)
    }
    if (emails.length) {
      const { data } = await supabase.from('vendeurs').select('email').in('email', emails)
      existingEmails = (data || []).map(r => r.email)
    }

    const nouveaux = vendeurs.filter(v =>
      !existingPhones.includes(v.telephone) && !existingEmails.includes(v.email)
    )
    const doublons = vendeurs.length - nouveaux.length

    if (nouveaux.length === 0) {
      return res.status(200).json({
        inserted: 0,
        doublons,
        message: `Aucun nouveau vendeur (${doublons} doublon(s) ignoré(s))`
      })
    }

    const { error } = await supabase.from('vendeurs').insert(nouveaux)
    if (error) throw error

    return res.status(200).json({
      inserted: nouveaux.length,
      doublons,
      message: `✅ ${nouveaux.length} vendeur(s) importé(s)${doublons ? ` — ${doublons} doublon(s) ignoré(s)` : ''}`
    })

  } catch (err) {
    console.error('Import error:', err)
    return res.status(500).json({ error: err.message })
  }
}
