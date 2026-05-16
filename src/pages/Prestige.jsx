import { useEffect, useState } from "react"
import { supabase } from "../supabase"

export default function Prestige() {
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
      .eq("categorie_client", "prestige") // Filtre exclusif Prestige
      .order("budget", { ascending: false }) // Les plus gros budgets en premier

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

  const badgeStyle = (active) => `px-4 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-bold transition-all duration-700 ${
    active 
      ? "bg-[#D4AF37] text-black shadow-[0_0_20px_rgba(212,175,55,0.4)]" 
      : "bg-white/5 text-white/20 border border-white/10"
  }`

  return (
    <div className="p-10 bg-[#050505] min-h-screen">
      <div className="mb-16 text-center">
        <p className="text-[#D4AF37] uppercase tracking-[0.5em] text-[10px] mb-4 font-bold">Sélection Exclusive</p>
        <h1 className="text-6xl font-serif text-white tracking-tighter">Portefeuille Prestige</h1>
        <div className="w-24 h-px bg-[#D4AF37] mx-auto mt-6 opacity-50"></div>
      </div>

      <div className="max-w-6xl mx-auto grid gap-10">
        {clients.map((client) => (
          <div key={client.id} className="relative group p-1 border border-[#D4AF37]/20 rounded-[60px] overflow-hidden transition-all hover:border-[#D4AF37]/50">
            <div className="bg-[#0a0a0a] p-10 rounded-[58px] flex flex-col lg:flex-row justify-between gap-10">
              
              {/* CÔTÉ GAUCHE : IDENTITÉ */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-3 h-3 rounded-full bg-[#D4AF37] animate-pulse"></span>
                  <h2 className="text-4xl font-serif text-white leading-none">{client.nom}</h2>
                </div>
                <div className="space-y-2">
                  <p className="text-white/40 text-xs uppercase tracking-widest font-medium">Contact Privé</p>
                  <p className="text-white/80 font-light">{client.telephone || "Ligne non renseignée"}</p>
                  <p className="text-white/80 font-light truncate">{client.email || "Email confidentiel"}</p>
                </div>
              </div>

              {/* CÔTÉ DROIT : CHIFFRES & LIEU */}
              <div className="lg:text-right border-l lg:border-l-0 lg:border-r border-white/10 lg:pr-10 lg:pl-0 pl-10 flex flex-col justify-center">
                <p className="text-[#D4AF37] text-5xl font-serif mb-2">{client.budget?.toLocaleString()} €</p>
                <p className="text-white/30 text-xs uppercase tracking-[0.3em] font-bold">{client.secteur || "Localisation Premium"}</p>
                <div className="mt-4 inline-block px-4 py-1 rounded-full border border-[#D4AF37]/30 text-[#D4AF37] text-[9px] uppercase font-bold self-start lg:self-end">
                   {client.type_client}
                </div>
              </div>

              {/* PRESTATIONS HAUT DE GAMME */}
              <div className="flex flex-col justify-between min-w-[200px] gap-6">
                <div className="flex flex-wrap lg:justify-end gap-2">
                   <button onClick={() => updateClient(client.id, { vue_mer: !client.vue_mer })} className={badgeStyle(client.vue_mer)}>Vue Mer</button>
                   <button onClick={() => updateClient(client.id, { piscine: !client.piscine })} className={badgeStyle(client.piscine)}>Piscine</button>
                   <button onClick={() => updateClient(client.id, { varangue: !client.varangue })} className={badgeStyle(client.varangue)}>Varangue</button>
                </div>
                <button className="w-full py-4 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-colors">
                  Ouvrir le dossier
                </button>
              </div>

            </div>
          </div>
        ))}

        {clients.length === 0 && (
          <div className="text-center py-32 border border-dashed border-white/10 rounded-[60px]">
            <p className="text-white/20 font-serif italic text-2xl font-light">Aucun dossier Prestige pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}