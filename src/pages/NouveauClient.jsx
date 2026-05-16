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
    notes: ""
  })

  async function handleSubmit(e) {
    e.preventDefault()
    const { error } = await supabase.from("clients").insert([formData])
    if (error) {
      alert("Erreur : " + error.message)
    } else {
      alert("Client ajouté avec succès ! ✨")
      setFormData({ nom: "", telephone: "", email: "", type_client: "acquereur", categorie_client: "standard", budget: "", secteur: "", notes: "" })
    }
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

  return (
    <div className="p-10 max-w-4xl mx-auto">

      {/* En-tête — identique Dashboard */}
      <div className="mb-10">
        <p style={{ color: "#C4A882", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: "600", marginBottom: "10px" }}>
          Gestion Portefeuille
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "300", letterSpacing: "0.02em", lineHeight: 1, color: "#fff" }}>
          Nouveau Contact
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="liquid-glass p-10 rounded-[40px] border border-white/10 space-y-8">

        {/* NOM & TYPE */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <label style={labelStyle}>Nom Complet</label>
            <input
              required type="text"
              style={inputStyle}
              value={formData.nom}
              onFocus={(e) => e.target.style.borderColor = "#C4A882"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
              onChange={(e) => setFormData({...formData, nom: e.target.value})}
            />
          </div>
          <div>
            <label style={labelStyle}>Type de projet</label>
            <select
              style={inputStyle}
              value={formData.type_client}
              onFocus={(e) => e.target.style.borderColor = "#C4A882"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
              onChange={(e) => setFormData({...formData, type_client: e.target.value})}
            >
              <option value="acquereur" className="bg-slate-900">Acquéreur (Recherche)</option>
              <option value="vendeur" className="bg-slate-900">Vendeur (Mandat)</option>
            </select>
          </div>
        </div>

        {/* CONTACT */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <label style={labelStyle}>Téléphone</label>
            <input
              type="tel"
              style={inputStyle}
              value={formData.telephone}
              onFocus={(e) => e.target.style.borderColor = "#C4A882"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
              onChange={(e) => setFormData({...formData, telephone: e.target.value})}
            />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              style={inputStyle}
              value={formData.email}
              onFocus={(e) => e.target.style.borderColor = "#C4A882"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
        </div>

        {/* CATÉGORIE, BUDGET, SECTEUR */}
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <label style={labelStyle}>Catégorie</label>
            <select
              style={inputStyle}
              value={formData.categorie_client}
              onFocus={(e) => e.target.style.borderColor = "#C4A882"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
              onChange={(e) => setFormData({...formData, categorie_client: e.target.value})}
            >
              <option value="standard"   className="bg-slate-900">Standard</option>
              <option value="prestige"   className="bg-slate-900">Prestige</option>
              <option value="patrimoine" className="bg-slate-900">Patrimoine</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Budget / Prix (€)</label>
            <input
              type="number"
              style={inputStyle}
              value={formData.budget}
              onFocus={(e) => e.target.style.borderColor = "#C4A882"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
              onChange={(e) => setFormData({...formData, budget: e.target.value})}
            />
          </div>
          <div>
            <label style={labelStyle}>Secteur / Ville</label>
            <input
              type="text"
              style={inputStyle}
              value={formData.secteur}
              onFocus={(e) => e.target.style.borderColor = "#C4A882"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
              onChange={(e) => setFormData({...formData, secteur: e.target.value})}
            />
          </div>
        </div>

        {/* NOTES */}
        <div>
          <label style={labelStyle}>Notes & Critères</label>
          <textarea
            rows="4"
            style={{ ...inputStyle, resize: "vertical" }}
            placeholder="Ex: Villa avec piscine, 3 chambres, vue mer..."
            value={formData.notes}
            onFocus={(e) => e.target.style.borderColor = "#C4A882"}
            onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          />
        </div>

        <button
          type="submit"
          className="w-full py-5 rounded-full bg-white text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-[#C4A882] hover:text-white transition-all"
        >
          Enregistrer le dossier
        </button>

      </form>
    </div>
  )
}
