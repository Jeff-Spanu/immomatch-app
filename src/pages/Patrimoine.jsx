import { useEffect, useState } from "react"
import { supabase } from "../supabase"

export default function Patrimoine() {
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
      .eq("categorie_client", "patrimoine") // Filtre Patrimoine / Investisseurs
      .order("id", { ascending: false })

    if (error) {
      console.error(error)
      setClients([])
    } else {
      setClients(data || [])
    }
    setLoading(false)
  }

  async function updateClient(clientId, updates) {
    const { error } = await supabase.from("clients").update(updates).eq("id", clientId)
    if (!error) {
      setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, ...updates } : c)))
    }
  }

  const badgeStyle = (active) => `px-3 py-1 rounded-md text-[9px] uppercase tracking-wider font-bold transition-all ${
    active 
      ? "bg-[#4A6FA5] text-white" 
      : "bg-white/5 text-white/20 border border-white/10"
  }`

  return (
    <div className="p-10 bg-[#0f1115]">
      <div className="mb-12 border-l-4 border-[#4A6FA5] pl-6">
        <p className="text-[#4A6FA5] uppercase tracking-[0.2em] text-[10px] mb-1 font-bold">Gestion d'actifs</p>
        <h1 className="text-4xl font-bold text-white">Investissement & Patrimoine</h1>
      </div>

      <div className="grid gap-6">
        {clients.map((client) => (
          <div key={client.id} className="bg-[#161a21] rounded-2xl border border-white/5 overflow-hidden flex flex-col md:flex-row shadow-xl">
            
            {/* BLOC INDICATEUR TYPE */}
            <div className={`w-2 ${client.type_client === 'vendeur' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>

            <div className="flex-1 p-8 grid md:grid-cols-3 gap-8 items-center">
              
              {/* COLONNE 1 : L'INVESTISSEUR */}
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{client.nom}</h2>
                <p className="text-white/40 text-xs mb-4">{client.email || "Pas d'email"}</p>
                <div className="flex gap-2">
                  <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-white/60 border border-white/10 uppercase">
                    {client.projet_client || "Défiscalisation"}
                  </span>
                </div>
              </div>

              {/* COLONNE 2 : ANALYSE FINANCIÈRE */}
              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[10px] text-white/30 uppercase">Enveloppe</span>
                  <span className="text-[#4A6FA5] font-bold">{client.budget?.toLocaleString()} €</span>
                </div>
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div className="bg-[#4A6FA5] h-full w-[70%]"></div>
                </div>
                <p className="text-[10px] text-white/40 mt-2 italic">Rentabilité cible : {client.type_bien === 'Immeuble' ? '6.5%' : '4.2%'}</p>
              </div>

              {/* COLONNE 3 : CARACTÉRISTIQUES ACTIF */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => updateClient(client.id, { garage: !client.garage })} className={badgeStyle(client.garage)}>Box/Parking</button>
                  <button onClick={() => updateClient(client.id, { plain_pied: !client.plain_pied })} className={badgeStyle(client.plain_pied)}>Rapport</button>
                  <button onClick={() => updateClient(client.id, { secteur: !client.secteur })} className={badgeStyle(true)}>Zone {client.secteur || 'Tours'}</button>
                </div>
                <button className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest text-left transition">
                  → Historique des échanges
                </button>
              </div>

            </div>
          </div>
        ))}

        {clients.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
            <p className="text-white/30 italic">Aucun dossier patrimoine identifié.</p>
          </div>
        )}
      </div>
    </div>
  )
}