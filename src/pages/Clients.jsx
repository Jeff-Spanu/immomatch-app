import { useEffect, useState } from "react"
import { supabase } from "../supabase"

export default function Clients() {
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchTousLesClients() }, [])

  async function fetchTousLesClients() {
    setLoading(true)
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false })
    if (!error) setClients(data || [])
    setLoading(false)
  }

  const filteredClients = clients.filter(c =>
    c.nom?.toLowerCase().includes(search.toLowerCase()) ||
    c.telephone?.includes(search) ||
    c.secteur?.toLowerCase().includes(search.toLowerCase())
  )

  const getCategoryColor = (cat) => {
    switch(cat) {
      case 'prestige':   return 'text-[#D4AF37]'
      case 'patrimoine': return 'text-[#4A6FA5]'
      default:           return 'text-[#C87533]'
    }
  }

  return (
    <div className="p-10">

      {/* En-tête — charte Dashboard */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
        <div>
          <p style={{ color: "#C4A882", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: "600", marginBottom: "10px" }}>
            Base de données
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "300", letterSpacing: "0.02em", lineHeight: 1, color: "#fff" }}>
            Tous les contacts
          </h1>
        </div>
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Nom, téléphone, ville..."
            className="w-full border border-white/15 rounded-xl px-5 py-3 text-sm outline-none transition-all text-white placeholder-white/40"
            style={{ background: "rgba(8,6,4,0.62)", backdropFilter: "blur(24px)" }}
            onFocus={(e) => e.target.style.borderColor = "#C4A882"}
            onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="absolute right-5 top-3 opacity-40 text-sm">🔍</span>
        </div>
      </div>

      {/* Tableau */}
      <div style={{
        background: "rgba(8, 6, 4, 0.55)",
        borderRadius: "24px",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.10)"
      }}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}>
              <th className="px-5 py-3 text-[11px] uppercase tracking-widest text-white/75 font-bold">Client</th>
              <th className="px-5 py-3 text-[11px] uppercase tracking-widest text-white/75 font-bold">Type</th>
              <th className="px-5 py-3 text-[11px] uppercase tracking-widest text-white/75 font-bold">Catégorie</th>
              <th className="px-5 py-3 text-[11px] uppercase tracking-widest text-white/75 font-bold">Localisation</th>
              <th className="px-5 py-3 text-[11px] uppercase tracking-widest text-white/75 font-bold">Budget / Prix</th>
              <th className="px-5 py-3 text-right text-[11px] uppercase tracking-widest text-white/75 font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr
                key={client.id}
                className="hover:bg-white/[0.04] transition-colors group"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <td className="px-5 py-2.5">
                  <p className="text-sm font-semibold text-white/95 group-hover:text-[#C4A882] transition-colors leading-tight">{client.nom}</p>
                  <p className="text-[11px] text-white/55 mt-0.5">{client.telephone || "—"}</p>
                </td>
                <td className="px-5 py-2.5">
                  <span className={`text-[11px] px-3 py-1 rounded-full font-semibold uppercase tracking-wide ${
                    client.type_client === 'vendeur'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                  }`}>
                    {client.type_client}
                  </span>
                </td>
                <td className={`px-5 py-2.5 text-[11px] font-bold uppercase tracking-wide ${getCategoryColor(client.categorie_client)}`}>
                  {client.categorie_client || "—"}
                </td>
                <td className="px-5 py-2.5 text-sm text-white/85">{client.secteur || "—"}</td>
                <td className="px-5 py-2.5 text-sm font-medium text-white/90">{client.budget?.toLocaleString()} €</td>
                <td className="px-5 py-2.5 text-right">
                  <button className="opacity-0 group-hover:opacity-100 bg-white/8 hover:bg-white/15 px-3 py-1.5 rounded-lg transition-all text-xs text-white/80 border border-white/15">
                    Modifier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredClients.length === 0 && !loading && (
          <div className="p-16 text-center text-white/40 italic text-sm">
            Aucun contact ne correspond à votre recherche.
          </div>
        )}
      </div>

    </div>
  )
}
