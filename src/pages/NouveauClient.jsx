import { useState } from "react"
import { supabase } from "../supabase"

export default function NouveauClient() {
  const [formData, setFormData] = useState({
    nom: "",
    telephone: "",
    email: "",
    type_client: "acquereur", // Par défaut
    categorie_client: "standard",
    budget: "",
    secteur: "",
    notes: ""
  })

  async function handleSubmit(e) {
    e.preventDefault()
    
    const { error } = await supabase
      .from("clients")
      .insert([formData])

    if (error) {
      alert("Erreur : " + error.message)
    } else {
      alert("Client ajouté avec succès ! ✨")
      // Reset du formulaire
      setFormData({
        nom: "", telephone: "", email: "", 
        type_client: "acquereur", categorie_client: "standard",
        budget: "", secteur: "", notes: ""
      })
    }
  }

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h1 className="text-5xl font-light mb-10 italic">Nouveau Contact</h1>

      <form onSubmit={handleSubmit} className="liquid-glass p-10 rounded-[40px] border border-white/10 space-y-8">
        
        {/* LIGNE 1 : NOM & TYPE */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Nom Complet</label>
            <input 
              required
              type="text" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-[#C87533] transition-all"
              value={formData.nom}
              onChange={(e) => setFormData({...formData, nom: e.target.value})}
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Type de projet</label>
            <select 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-[#C87533] appearance-none"
              value={formData.type_client}
              onChange={(e) => setFormData({...formData, type_client: e.target.value})}
            >
              <option value="acquereur" className="bg-slate-900">Acquéreur (Recherche)</option>
              <option value="vendeur" className="bg-slate-900">Vendeur (Mandat)</option>
            </select>
          </div>
        </div>

        {/* LIGNE 2 : CONTACT */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Téléphone</label>
            <input 
              type="tel" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-[#C87533]"
              value={formData.telephone}
              onChange={(e) => setFormData({...formData, telephone: e.target.value})}
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Email</label>
            <input 
              type="email" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-[#C87533]"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
        </div>

        {/* LIGNE 3 : CATEGORIE & BUDGET */}
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Catégorie</label>
            <select 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-[#C87533] appearance-none"
              value={formData.categorie_client}
              onChange={(e) => setFormData({...formData, categorie_client: e.target.value})}
            >
              <option value="standard" className="bg-slate-900">Standard</option>
              <option value="prestige" className="bg-slate-900 text-[#D4AF37]">Prestige</option>
              <option value="patrimoine" className="bg-slate-900 text-[#4A6FA5]">Patrimoine</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Budget / Prix (€)</label>
            <input 
              type="number" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-[#C87533]"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: e.target.value})}
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Secteur / Ville</label>
            <input 
              type="text" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-[#C87533]"
              value={formData.secteur}
              onChange={(e) => setFormData({...formData, secteur: e.target.value})}
            />
          </div>
        </div>

        {/* LIGNE 4 : NOTES */}
        <div>
          <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Notes & Critères</label>
          <textarea 
            rows="4"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-[#C87533]"
            placeholder="Ex: Villa avec piscine, 3 chambres, vue mer..."
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          ></textarea>
        </div>

        <button 
          type="submit"
          className="w-full py-5 rounded-full bg-white text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-[#C87533] hover:text-white transition-all shadow-xl"
        >
          Enregistrer le dossier
        </button>
      </form>
    </div>
  )
}