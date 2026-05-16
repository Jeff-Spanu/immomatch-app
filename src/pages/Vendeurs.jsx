import { useEffect, useState } from "react"
import { supabase } from "../supabase"

export default function Vendeurs() {
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
      .eq("type_client", "vendeur")
      .order("id", { ascending: false })

    if (error) {
      console.error("Erreur chargement :", error)
      setClients([])
    } else {
      setClients(data || [])
    }
    setLoading(false)
  }

  async function affinerDepuisNotes(client) {
    const n = client.notes?.toLowerCase() || ""
    const updates = {
      piscine: n.includes("piscine") || n.includes("pool") || n.includes("bassin"),
      vue_mer: n.includes("mer") || n.includes("océan") || n.includes("vue"),
      garage: n.includes("garage") || n.includes("box") || n.includes("sous-sol"),
      varangue: n.includes("varangue") || n.includes("terrasse") || n.includes("deck"),
      jardin: n.includes("jardin") || n.includes("terrain") || n.includes("parcelle"),
      budget: n.match(/\d+k/i) ? parseInt(n.match(/\d+k/i)[0]) * 1000 : client.budget
    }
    await updateClient(client.id, updates)
    alert("Mandat mis à jour selon vos notes de visite ! 🏠")
  }

  async function updateClient(clientId, updates) {
    const { error } = await supabase
      .from("clients")
      .update(updates)
      .eq("id", clientId)

    if (error) return console.error("Erreur update :", error)

    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, ...updates } : c))
    )
  }

  const badgeStyle = (active) => `px-4 py-1.5 rounded-full text-[10px] uppercase font-bold transition-all duration-500 ${
    active 
      ? "bg-emerald-600 text-white border border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
      : "bg-white/5 text-white/20 border border-white/10"
  }`

  return (
    <div className="p-10">
      <div className="mb-10">
        <p className="text-emerald-500 uppercase tracking-[0.3em] text-[10px] mb-3 font-bold">Mandats de vente</p>
        <h1 className="text-5xl font-light italic text-white">Vendeurs</h1>
      </div>

      <div className="grid gap-8">
        {clients.map((client) => (
          <div key={client.id} className="liquid-glass p-10 rounded-[50px] border border-white/10 relative group transition-all hover:border-emerald-500/30">
            
            <div className="flex flex-col lg:flex-row justify-between gap-8">
              {/* INFOS VENDEUR */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-4xl font-serif text-white">{client.nom}</h2>
                  <span className="bg-emerald-500/10 px-3 py-1 rounded-full text-[9px] text-emerald-400 uppercase tracking-widest border border-emerald-500/20 font-bold">
                    Mandat Actif
                  </span>
                </div>
                <div className="flex flex-wrap gap-6 text-white/50 text-sm">
                  <span className="flex items-center gap-2">📱 {client.telephone || "—"}</span>
                  <span className="flex items-center gap-2">📍 {client.secteur || "Secteur non défini"}</span>
                </div>
              </div>

              {/* PRIX DU BIEN */}
              <div className="lg:text-right bg-white/[0.02] p-6 rounded-[30px] border border-white/5 min-w-[250px]">
                <p className="text-emerald-400 text-3xl font-light">
                  {Number(client.budget || 0).toLocaleString()} €
                </p>
                <p className="text-white/30 text-[9px] uppercase tracking-[0.2em] mt-1 font-bold">
                  Prix de mise en vente
                </p>
                <div className="mt-4 pt-4 border-t border-white/5 text-xs text-white/60 font-medium">
                  {client.type_bien || "Maison / Appartement"}
                </div>
              </div>
            </div>

            {/* NOTES DE VISITE & CRITÈRES */}
            <div className="mt-10 grid xl:grid-cols-2 gap-10">
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Notes de Visite (Keep)</h3>
                    <button onClick={() => affinerDepuisNotes(client)} className="text-emerald-500 text-[10px] font-bold uppercase hover:underline">
                      🪄 Extraire les caractéristiques
                    </button>
                  </div>
                  <div className="p-6 bg-black/40 rounded-[30px] border border-white/5 italic text-sm text-white/70 leading-relaxed">
                    {client.notes ? `"${client.notes}"` : "Aucune note technique pour ce mandat."}
                  </div>
               </div>

               {/* ÉQUIPEMENTS DU BIEN */}
               <div className="space-y-4">
                  <h3 className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Prestations du bien</h3>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => updateClient(client.id, { piscine: !client.piscine })} className={badgeStyle(client.piscine)}>Piscine</button>
                    <button onClick={() => updateClient(client.id, { vue_mer: !client.vue_mer })} className={badgeStyle(client.vue_mer)}>Vue Mer</button>
                    <button onClick={() => updateClient(client.id, { garage: !client.garage })} className={badgeStyle(client.garage)}>Garage</button>
                    <button onClick={() => updateClient(client.id, { jardin: !client.jardin })} className={badgeStyle(client.jardin)}>Jardin</button>
                    <button onClick={() => updateClient(client.id, { varangue: !client.varangue })} className={badgeStyle(client.varangue)}>Varangue</button>
                  </div>
                  
                  {/* ÉDITION RAPIDE */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                     <input 
                       type="text" 
                       placeholder="Ville du bien..."
                       className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-xs outline-none focus:border-emerald-500 text-white"
                       onBlur={(e) => updateClient(client.id, { secteur: e.target.value })}
                     />
                     <input 
                       type="number" 
                       placeholder="Nouveau prix..."
                       className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-xs outline-none focus:border-emerald-500 text-white"
                       onBlur={(e) => updateClient(client.id, { budget: e.target.value })}
                     />
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}