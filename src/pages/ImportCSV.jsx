import { useState } from "react"
import Papa from "papaparse"
import { supabase } from "../supabase"

export default function ImportCSV() {
  const [message, setMessage]       = useState("")
  const [loading, setLoading]       = useState(false)
  const [typeClient, setTypeClient] = useState("vendeur")
  const [categorieClient, setCategorieClient] = useState("standard")
  const [projetClient, setProjetClient]       = useState("résidence principale")

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
          console.log("Colonnes détectées :", Object.keys(rows[0]))

          const clientsCRM = rows.map((row) => {
            const nomComplet = row["Name"] || row["Display Name"] || row["Nom"]
            const prenom     = row["First Name"] || row["Prénom"] || ""
            const nomFamille = row["Last Name"] || row["Nom de famille"] || ""
            const nomFinal   = nomComplet || `${prenom} ${nomFamille}`.trim() || "Contact Sans Nom"
            const rawBudget  = row["Budget"] || row["Prix"] || "0"
            const cleanBudget = parseInt(rawBudget.replace(/[^0-9]/g, "")) || 0

            return {
              nom: nomFinal,
              telephone: row["Phone 1 - Value"] || row["Mobile Phone"] || row["Téléphone"] || "",
              email: row["E-mail 1 - Value"] || row["E-mail"] || "",
              notes: row["Notes"] || "",
              secteur: row["Address 1 - City"] || row["Secteur"] || row["Ville"] || "",
              type_client: typeClient,
              categorie_client: categorieClient,
              projet_client: projetClient,
              statut: "prospect",
              budget: cleanBudget,
              type_bien: row["Type de bien"] || row["Recherche"] || "",
              nb_chambres: parseInt(row["Nb chambres"]) || null,
              altitude: row["Altitude"] || "",
              vue_mer:  String(row["Vue mer"]  || "").toUpperCase() === "TRUE",
              piscine:  String(row["Piscine"]  || "").toUpperCase() === "TRUE",
              garage:   String(row["Garage"]   || "").toUpperCase() === "TRUE",
              varangue: String(row["Varangue"] || "").toUpperCase() === "TRUE",
            }
          })

          const { error } = await supabase.from("clients").insert(clientsCRM)
          if (error) { console.error("Détails erreur Supabase :", error); throw error }
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

  const labelStyle = {
    fontSize: "11px", fontWeight: "600", letterSpacing: "0.18em",
    textTransform: "uppercase", color: "rgba(255,255,255,0.75)",
    display: "block", marginBottom: "8px",
  }

  const selectStyle = {
    width: "100%", background: "rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px",
    padding: "12px 16px", color: "#fff", fontSize: "13px",
    outline: "none", fontFamily: "'DM Sans', sans-serif",
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", padding: "40px", color: "#fff" }}>

      {/* En-tête — charte Dashboard */}
      <div className="mb-10">
        <p style={{ color: "#C4A882", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: "600", marginBottom: "10px" }}>
          Import CRM
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "300", letterSpacing: "0.02em", lineHeight: 1, color: "#fff", marginBottom: "10px" }}>
          Import Clients
        </h1>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.70)" }}>
          Base Google Contacts & Keep Note
        </p>
      </div>

      <div className="liquid-glass rounded-3xl p-10 max-w-3xl">

        {/* Sélecteurs */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div>
            <label style={labelStyle}>Type client</label>
            <select value={typeClient} onChange={(e) => setTypeClient(e.target.value)} style={selectStyle}
              onFocus={(e) => e.target.style.borderColor = "#C4A882"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.12)"}>
              <option value="vendeur"   className="bg-slate-900">Vendeur</option>
              <option value="acquereur" className="bg-slate-900">Acquéreur</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Dossier</label>
            <select value={categorieClient} onChange={(e) => setCategorieClient(e.target.value)} style={selectStyle}
              onFocus={(e) => e.target.style.borderColor = "#C4A882"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.12)"}>
              <option value="standard"   className="bg-slate-900">Standard</option>
              <option value="prestige"   className="bg-slate-900">Prestige 💎</option>
              <option value="patrimoine" className="bg-slate-900">Patrimoine 🏛️</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Projet par défaut</label>
            <select value={projetClient} onChange={(e) => setProjetClient(e.target.value)} style={selectStyle}
              onFocus={(e) => e.target.style.borderColor = "#C4A882"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.12)"}>
              <option value="résidence principale"  className="bg-slate-900">Résidence principale</option>
              <option value="résidence secondaire"  className="bg-slate-900">Résidence secondaire</option>
              <option value="investissement locatif" className="bg-slate-900">Investissement locatif</option>
            </select>
          </div>
        </div>

        {/* Zone drop */}
        <div style={{ border: "1.5px dashed rgba(196,168,130,0.35)", borderRadius: "16px", padding: "48px 32px", textAlign: "center", position: "relative", transition: "border-color 0.2s", cursor: "pointer" }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = "rgba(196,168,130,0.70)"}
          onMouseOut={(e) => e.currentTarget.style.borderColor = "rgba(196,168,130,0.35)"}>
          <input type="file" accept=".csv" onChange={handleFile}
            style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }} />
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.80)", fontWeight: "400" }}>
            Cliquez ou glissez votre fichier Google CSV ici
          </p>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", marginTop: "8px", letterSpacing: "0.08em" }}>
            Format .csv — Google Contacts ou Keep
          </p>
        </div>

        {/* Messages */}
        {loading && (
          <p style={{ color: "#C4A882", marginTop: "24px", textAlign: "center", fontSize: "13px" }} className="animate-pulse">
            Analyse et importation...
          </p>
        )}
        {!loading && message && (
          <div style={{ marginTop: "24px", padding: "16px", borderRadius: "12px", textAlign: "center", fontSize: "13px", fontWeight: "500",
            background: message.includes('Erreur') ? "rgba(239,68,68,0.12)" : "rgba(52,211,153,0.12)",
            color:      message.includes('Erreur') ? "#f87171" : "#34d399",
            border:     message.includes('Erreur') ? "1px solid rgba(239,68,68,0.25)" : "1px solid rgba(52,211,153,0.25)"
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
