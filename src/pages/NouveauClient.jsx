import { useState } from "react"
import { supabase } from "../supabase"

export default function NouveauClient() {
  const [formData, setFormData] = useState({
    nom: "",
    telephone: "",
    email: "",
    type_client: "acquereur",
    categorie_client: "standard",
    budget: "",
    secteur: "",
    type_bien: "",
    projet_client: "résidence principale",
    notes: ""
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    const { error } = await supabase.from("clients").insert([{
      ...formData,
      budget: Number(formData.budget) || null
    }])

    if (error) {
      alert("Erreur : " + error.message)
    } else {
      setSuccess(true)
      setFormData({
        nom: "", telephone: "", email: "",
        type_client: "acquereur", categorie_client: "standard",
        budget: "", secteur: "", type_bien: "",
        projet_client: "résidence principale", notes: ""
      })
      setTimeout(() => setSuccess(false), 4000)
    }
    setLoading(false)
  }

  const labelStyle = {
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.75)",
    display: "block",
    marginBottom: "8px",
    fontFamily: "'DM Sans', sans-serif",
  }

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "14px",
    padding: "14px 20px",
    outline: "none",
    color: "#fff",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.2s",
  }

  const set = (key) => (e) => setFormData({ ...formData, [key]: e.target.value })
  const focus = (e) => e.target.style.borderColor = "#C4A882"
  const blur  = (e) => e.target.style.borderColor = "rgba(255,255,255,0.12)"

  return (
    <div className="p-10 max-w-4xl mx-auto">

      {/* En-tête */}
      <div className="mb-10">
        <p style={{ color: "#C4A882", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: "600", marginBottom: "10px" }}>
          Gestion Portefeuille
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "300", letterSpacing: "0.02em", lineHeight: 1, color: "#fff" }}>
          Nouveau Contact
        </h1>
      </div>

      {/* Message de succès */}
      {success && (
        <div style={{ marginBottom: "24px", padding: "16px 24px", borderRadius: "16px", background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.30)", color: "#34d399", fontSize: "13px", fontWeight: "500" }}>
          ✓ Contact enregistré avec succès dans la base de données.
        </div>
      )}

      <form onSubmit={handleSubmit} className="liquid-glass p-10 rounded-[40px] border border-white/10 space-y-8">

        {/* NOM & TYPE */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <label style={labelStyle}>Nom Complet</label>
            <input required type="text" style={inputStyle}
              value={formData.nom}
              onFocus={focus} onBlur={blur}
              onChange={set("nom")}
            />
          </div>
          <div>
            <label style={labelStyle}>Type de projet</label>
            <select style={inputStyle} value={formData.type_client}
              onFocus={focus} onBlur={blur}
              onChange={set("type_client")}
            >
              <option value="acquereur" className="bg-slate-900">Acquéreur (Recherche)</option>
              <option value="vendeur"   className="bg-slate-900">Vendeur (Mandat)</option>
            </select>
          </div>
        </div>

        {/* CONTACT */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <label style={labelStyle}>Téléphone</label>
            <input type="tel" style={inputStyle}
              value={formData.telephone}
              onFocus={focus} onBlur={blur}
              onChange={set("telephone")}
            />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" style={inputStyle}
              value={formData.email}
              onFocus={focus} onBlur={blur}
              onChange={set("email")}
            />
          </div>
        </div>

        {/* CATÉGORIE, BUDGET, SECTEUR */}
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <label style={labelStyle}>Catégorie</label>
            <select style={inputStyle} value={formData.categorie_client}
              onFocus={focus} onBlur={blur}
              onChange={set("categorie_client")}
            >
              <option value="standard"   className="bg-slate-900">Standard</option>
              <option value="prestige"   className="bg-slate-900">Prestige</option>
              <option value="patrimoine" className="bg-slate-900">Patrimoine</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Budget / Prix (€)</label>
            <input type="number" style={inputStyle}
              value={formData.budget}
              onFocus={focus} onBlur={blur}
              onChange={set("budget")}
            />
          </div>
          <div>
            <label style={labelStyle}>Secteur / Ville</label>
            <input type="text" style={inputStyle}
              value={formData.secteur}
              onFocus={focus} onBlur={blur}
              onChange={set("secteur")}
            />
          </div>
        </div>

        {/* TYPE DE BIEN & PROJET */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <label style={labelStyle}>Type de bien</label>
            <input type="text" style={inputStyle}
              placeholder="Villa, Appartement, Terrain..."
              value={formData.type_bien}
              onFocus={focus} onBlur={blur}
              onChange={set("type_bien")}
            />
          </div>
          <div>
            <label style={labelStyle}>Projet</label>
            <select style={inputStyle} value={formData.projet_client}
              onFocus={focus} onBlur={blur}
              onChange={set("projet_client")}
            >
              <option value="résidence principale"   className="bg-slate-900">Résidence principale</option>
              <option value="résidence secondaire"   className="bg-slate-900">Résidence secondaire</option>
              <option value="investissement locatif" className="bg-slate-900">Investissement locatif</option>
              <option value="location saisonnière"   className="bg-slate-900">Location saisonnière</option>
              <option value="défiscalisation"        className="bg-slate-900">Défiscalisation</option>
            </select>
          </div>
        </div>

        {/* NOTES */}
        <div>
          <label style={labelStyle}>Notes & Critères</label>
          <textarea rows="4"
            style={{ ...inputStyle, resize: "vertical" }}
            placeholder="Ex : Villa avec piscine, 3 chambres, vue mer, varangue..."
            value={formData.notes}
            onFocus={focus} onBlur={blur}
            onChange={set("notes")}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 rounded-full bg-white text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-[#C4A882] hover:text-white transition-all disabled:opacity-50"
        >
          {loading ? "Enregistrement en cours..." : "Enregistrer le dossier"}
        </button>

      </form>
    </div>
  )
}
