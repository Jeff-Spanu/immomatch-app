import { useEffect, useState } from "react"
import { supabase } from "../supabase"

export default function Acquereurs() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {
    setLoading(true)
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("type_client", "acquereur")
      .order("id", { ascending: false })

    if (error) {
      console.error("Erreur chargement :", error)
      setClients([])
    } else {
      setClients(data || [])
    }
    setLoading(false)
  }

  // --- LOGIQUE D'AFFINAGE IA (SCAN DES NOTES) ---
  async function affinerDepuisNotes(client) {
    const n = client.notes?.toLowerCase() || ""
    
    // Détection automatique dans le texte
    const updates = {
      piscine: n.includes("piscine") || n.includes("pool") || n.includes("bassin"),
      vue_mer: n.includes("mer") || n.includes("océan") || n.includes("vue mer"),
      garage: n.includes("garage") || n.includes("box") || n.includes("parking"),
      varangue: n.includes("varangue") || n.includes("terrasse") || n.includes("balcon"),
      jardin: n.includes("jardin") || n.includes("cour") || n.includes("terrain"),
      // Si la note contient "500k", on transforme en 500000
      budget: n.match(/\d+k/i) ? parseInt(n.match(/\d+k/i)[0]) * 1000 : client.budget
    }

    await updateClient(client.id, updates)
    alert("Analyse de la note terminée ! Les critères ont été mis à jour. ✨")
  }

  // --- SAUVEGARDE DANS SUPABASE ---
  async function updateClient(clientId, updates) {
    const { error } = await supabase
      .from("clients")
      .update(updates)
      .eq("id", clientId)

    if (error) {
      console.error("Erreur update :", error)
      return
    }

    // Mise à jour de l'affichage sans recharger la page
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, ...updates } : c))
    )
  }

  const badgeStyle = (active) => `px-4 py-1.5 rounded-full text-[10px] uppercase font-bold transition-all duration-500 ${
    active 
      ? "bg-[#C87533] text-white border border-[#C87533] shadow-[0_0_15px_rgba(200,117,51,0.3)]" 
      : "bg-white/5 text-white/20 border border-white/10"
  }`

  return (
    <div className="p-10">
      <div className="mb-10">
        <p className="text-[#C87533] uppercase tracking-[0.3em] text-xs mb-3">Gestion Portefeuille</p>
        <h1 className="text-5xl font-light italic">Acquéreurs</h1>
      </div>

      <div className="grid gap-8">
        {clients.map((client) => (
          <div key={client.id} className="liquid-glass p-10 rounded-[50px] border border-white/10 relative group transition-all hover:border-[#C87533]/30">
            
            <div className="flex flex-col lg:flex-row justify-between gap-8">
              {/* INFOS CLIENT */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-4xl font-serif text-white">{client.nom}</h2>
                  <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] text-white/40 uppercase tracking-widest border border-white/10">
                    {client.categorie_client}
                  </span>
                </div>
                <div className="flex flex-wrap gap-6 text-white/50 text-sm">
                  <span className="flex items-center gap-2"> <span className="opacity-30">TEL</span> {client.telephone || "Non renseigné"}</span>
                  <span className="flex items-center gap-2"> <span className="opacity-30">MAIL</span> {client.email || "Non renseigné"}</span>
                </div>
              </div>

              {/* BUDGET & SECTEUR */}
              <div className="lg:text-right bg-white/[0.02] p-6 rounded-[30px] border border-white/5 min-w-[250px]">
                <p className="text-[#C87533] text-3xl font-light">{client.budget?.toLocaleString()} €</p>
                <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] mt-1">{client.secteur || "Secteur à définir"}</p>
                <div className="mt-4 pt-4 border-t border-white/5 text-xs text-white/60">
                   {client.type_bien || "Type de bien non spécifié"}
                </div>
              </div>
            </div>

            {/* ANALYSE DES NOTES (KEEP) */}
            <div className="mt-10 grid xl:grid-cols-2 gap-10">
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Notes Google Keep</h3>
                    <button 
                      onClick={() => affinerDepuisNotes(client)}
                      className="text-[#C87533] text-[10px] font-bold uppercase hover:underline flex items-center gap-2"
                    >
                      🪄 Scanner la note
                    </button>
                  </div>
                  <div className="p-6 bg-black/40 rounded-[30px] border border-white/5 min-h-[100px]">
                    <p className="text-sm italic text-white/70 leading-relaxed">
                      {client.notes ? `"${client.notes}"` : "Aucune note importée pour ce contact."}
                    </p>
                  </div>
               </div>

               {/* BADGES INTERACTIFS */}
               <div className="space-y-4">
                  <h3 className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Critères Qualifiés</h3>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => updateClient(client.id, { piscine: !client.piscine })} className={badgeStyle(client.piscine)}>Piscine</button>
                    <button onClick={() => updateClient(client.id, { vue_mer: !client.vue_mer })} className={badgeStyle(client.vue_mer)}>Vue Mer</button>
                    <button onClick={() => updateClient(client.id, { garage: !client.garage })} className={badgeStyle(client.garage)}>Garage</button>
                    <button onClick={() => updateClient(client.id, { jardin: !client.jardin })} className={badgeStyle(client.jardin)}>Jardin</button>
                    <button onClick={() => updateClient(client.id, { varangue: !client.varangue })} className={badgeStyle(client.varangue)}>Varangue</button>
                  </div>
                  
                  {/* MODIF RAPIDE SECTEUR/BUDGET */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                     <input 
                       type="text" 
                       placeholder="Changer secteur..."
                       className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-xs outline-none focus:border-[#C87533]"
                       onBlur={(e) => updateClient(client.id, { secteur: e.target.value })}
                     />
                     <input 
                       type="number" 
                       placeholder="Changer budget..."
                       className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-xs outline-none focus:border-[#C87533]"
                       onBlur={(e) => updateClient(client.id, { budget: e.target.value })}
                     />
                  </div>
               </div>
            </div>
          </div>
        ))}

        {clients.length === 0 && !loading && (
          <div className="text-center py-20 opacity-20 italic">Aucun acquéreur trouvé dans la base.</div>
        )}
      </div>
    </div>
  )
}