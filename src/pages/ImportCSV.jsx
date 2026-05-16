import { useState } from "react"
import Papa from "papaparse"
import { supabase } from "../supabase"

export default function ImportCSV() {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const [typeClient, setTypeClient] = useState("vendeur")
  const [categorieClient, setCategorieClient] = useState("standard")
  const [projetClient, setProjetClient] = useState("résidence principale")

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    setMessage("Importation en cours...")

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async function(results) {
        try {
          const rows = results.data

          // === Préparer les objets pour la table UNIQUE 'clients' ===
          console.log("Colonnes détectées :", Object.keys(rows[0]));
          const clientsCRM = rows.map((row) => {
            // 1. Logique de récupération du NOM (Français / Anglais / Google)
            const nomComplet = row["Name"] || row["Display Name"] || row["Nom"];
            const prenom = row["First Name"] || row["Prénom"] || "";
            const nomFamille = row["Last Name"] || row["Nom de famille"] || "";
            const nomFinal = nomComplet || `${prenom} ${nomFamille}`.trim() || "Contact Sans Nom";

            // 2. Nettoyage du budget
            const rawBudget = row["Budget"] || row["Prix"] || "0"
            const cleanBudget = parseInt(rawBudget.replace(/[^0-9]/g, "")) || 0

            return {
              // Champs Identité
              nom: nomFinal,
              telephone: row["Phone 1 - Value"] || row["Mobile Phone"] || row["Téléphone"] || "",
              email: row["E-mail 1 - Value"] || row["E-mail"] || "",
              notes: row["Notes"] || "", 
              
              // Champs Métier
              secteur: row["Address 1 - City"] || row["Secteur"] || row["Ville"] || "",
              type_client: typeClient,
              categorie_client: categorieClient,
              projet_client: projetClient,
              statut: "prospect",
              budget: cleanBudget,
              type_bien: row["Type de bien"] || row["Recherche"] || "",
              nb_chambres: parseInt(row["Nb chambres"]) || null,
              altitude: row["Altitude"] || "",
              
              // Conversion des booléens présents dans ta table
              vue_mer: String(row["Vue mer"] || "").toUpperCase() === "TRUE",
              piscine: String(row["Piscine"] || "").toUpperCase() === "TRUE",
              garage: String(row["Garage"] || "").toUpperCase() === "TRUE",
              varangue: String(row["Varangue"] || "").toUpperCase() === "TRUE"
              
              // 'jardin' et 'plain_pied' ont été retirés car ils n'existent pas dans ton schéma Supabase
            }
          })

          // === Insertion UNIQUE dans la table 'clients' ===
          const { error } = await supabase
            .from("clients")
            .insert(clientsCRM)

          if (error) {
            console.error("Détails erreur Supabase :", error)
            throw error
          }

          setMessage(`${clientsCRM.length} contacts importés avec succès ! ✅`)

        } catch (err) {
          console.error(err)
          setMessage(`Erreur : ${err.message || "Problème de colonnes"}. ❌`)
        } finally {
          setLoading(false)
        }
      },
      error: function(error) {
        console.error(error)
        setLoading(false)
        setMessage("Erreur de lecture du fichier CSV. ❌")
      }
    })
  }

  return (
    <div className="p-10">
      <div className="mb-10">
        <p className="text-[#C87533] uppercase tracking-[0.3em] text-xs mb-3">Import CRM</p>
        <h1 className="text-5xl mb-4">Import Clients</h1>
        <p className="text-white/40">Base Google Contacts & Keep Note</p>
      </div>

      <div className="liquid-glass rounded-3xl p-10 max-w-3xl">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="text-sm text-white/50 block mb-2">Type client</label>
            <select value={typeClient} onChange={(e) => setTypeClient(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white">
              <option value="vendeur">Vendeur</option>
              <option value="acquereur">Acquéreur</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-white/50 block mb-2">Dossier</label>
            <select value={categorieClient} onChange={(e) => setCategorieClient(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white">
              <option value="standard">Standard</option>
              <option value="prestige">Prestige 💎</option>
              <option value="patrimoine">Patrimoine 🏛️</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-white/50 block mb-2">Projet par défaut</label>
            <select value={projetClient} onChange={(e) => setProjetClient(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white">
              <option value="résidence principale">Résidence principale</option>
              <option value="résidence secondaire">Résidence secondaire</option>
              <option value="investissement locatif">Investissement locatif</option>
            </select>
          </div>
        </div>

        <div className="border-2 border-dashed border-white/10 rounded-3xl p-8 text-center hover:border-[#C87533]/50 transition cursor-pointer relative">
          <input type="file" accept=".csv" onChange={handleFile} 
            className="absolute inset-0 opacity-0 cursor-pointer" />
          <p className="text-white/60">Cliquez ou glissez votre fichier Google CSV ici</p>
        </div>

        {loading && <p className="text-[#C87533] mt-6 text-center animate-pulse">Analyse et importation...</p>}
        {!loading && message && (
          <div className={`mt-6 p-4 rounded-2xl text-center ${message.includes('Erreur') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}