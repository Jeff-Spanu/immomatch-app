import { useEffect, useState } from "react"
import { supabase } from "../supabase"

export default function Clients() {
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTousLesClients()
  }, [])

  async function fetchTousLesClients() {
    setLoading(true)
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error) setClients(data || [])
    setLoading(false)
  }

  // Filtrage dynamique selon la recherche (Nom, Tel ou Ville)
  const filteredClients = clients.filter(c => 
    c.nom?.toLowerCase().includes(search.toLowerCase()) ||
    c.telephone?.includes(search) ||
    c.secteur?.toLowerCase().includes(search.toLowerCase())
  )

  const getCategoryColor = (cat) => {
    switch(cat) {
      case 'prestige': return 'text-[#D4AF37]';
      case 'patrimoine': return 'text-[#4A6FA5]';
      default: return 'text-[#C87533]';
    }
  }

  return (
    <div className="p-10">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div>
          <p className="text-white/30 uppercase tracking-[0.3em] text-[10px] mb-2 font-bold">Base de données</p>
          <h1 className="text-5xl font-bold text-white">Tous les Contacts</h1>
        </div>
        
        {/* BARRE DE RECHERCHE ULTRA-RAPIDE */}
        <div className="relative w-full md:w-96">
          <input 
            type="text"
            placeholder="Rechercher un nom, un tel, une ville..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#C87533] transition-all"
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="absolute right-6 top-4 opacity-20">🔍</span>
        </div>
      </div>

      <div className="liquid-glass rounded-[30px] overflow-hidden border border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-white/40">
              <th className="p-6">Client</th>
              <th className="p-6">Type</th>
              <th className="p-6">Catégorie</th>
              <th className="p-6">Localisation</th>
              <th className="p-6">Budget / Prix</th>
              <th className="p-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="p-6">
                  <p className="font-bold text-white group-hover:text-[#C87533] transition-colors">{client.nom}</p>
                  <p className="text-xs text-white/30">{client.telephone || "Pas de tel"}</p>
                </td>
                <td className="p-6">
                  <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase ${client.type_client === 'vendeur' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                    {client.type_client}
                  </span>
                </td>
                <td className={`p-6 text-[10px] font-bold uppercase tracking-tighter ${getCategoryColor(client.categorie_client)}`}>
                  {client.categorie_client}
                </td>
                <td className="p-6 text-sm text-white/60">
                  {client.secteur || "—"}
                </td>
                <td className="p-6 font-mono text-sm text-white/80">
                  {client.budget?.toLocaleString()} €
                </td>
                <td className="p-6 text-right">
                  <button className="opacity-0 group-hover:opacity-100 bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-all text-xs">
                    Modifier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredClients.length === 0 && !loading && (
          <div className="p-20 text-center text-white/20 italic">
            Aucun contact ne correspond à votre recherche.
          </div>
        )}
      </div>
    </div>
  )
}