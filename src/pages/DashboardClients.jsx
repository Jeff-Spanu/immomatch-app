import { useEffect, useState } from "react"
import { supabase } from "../supabase"

export default function DashboardClients() {
  const [clients, setClients] = useState([])
  const [filterCategorie, setFilterCategorie] = useState("tous")
  const [filterProjet, setFilterProjet] = useState("tous")

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("type_client", "vendeur") // juste vendeurs
      .order("id", { ascending: false })

    if (error) console.error(error)
    else setClients(data)
  }

  const filteredClients = clients.filter(c =>
    (filterCategorie === "tous" || c.categorie_client?.toLowerCase() === filterCategorie.toLowerCase()) &&
    (filterProjet === "tous" || c.projet_client?.toLowerCase() === filterProjet.toLowerCase())
  )

  const countCategorie = cat =>
    clients.filter(c => c.categorie_client?.toLowerCase() === cat.toLowerCase()).length

  return (
    <div className="p-10">

      <h1 className="text-5xl mb-6 text-[#C87533]">Vendeurs</h1>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="liquid-glass rounded-2xl p-5 text-center">
          <p className="text-white/40 text-sm mb-2">Total Vendeurs</p>
          <p className="text-3xl">{clients.length}</p>
        </div>
        <div className="liquid-glass rounded-2xl p-5 text-center">
          <p className="text-white/40 text-sm mb-2">Standard</p>
          <p className="text-3xl">{countCategorie("standard")}</p>
        </div>
        <div className="liquid-glass rounded-2xl p-5 text-center">
          <p className="text-white/40 text-sm mb-2">Prestige</p>
          <p className="text-3xl">{countCategorie("prestige")}</p>
        </div>
        <div className="liquid-glass rounded-2xl p-5 text-center">
          <p className="text-white/40 text-sm mb-2">Patrimoine</p>
          <p className="text-3xl">{countCategorie("patrimoine")}</p>
        </div>
      </div>

      {/* FILTRES */}
      <div className="grid md:grid-cols-2 gap-4 mb-10">
        <select
          value={filterCategorie}
          onChange={e => setFilterCategorie(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-2xl px-4 py-3"
        >
          <option value="tous">Toutes catégories</option>
          <option value="standard">Standard</option>
          <option value="prestige">Prestige</option>
          <option value="patrimoine">Patrimoine</option>
          <option value="offmarket">Off Market</option>
        </select>

        <select
          value={filterProjet}
          onChange={e => setFilterProjet(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-2xl px-4 py-3"
        >
          <option value="tous">Tous projets</option>
          <option value="résidence principale">Résidence principale</option>
          <option value="résidence secondaire">Résidence secondaire</option>
          <option value="investissement locatif">Investissement locatif</option>
          <option value="location saisonnière">Location saisonnière</option>
          <option value="défiscalisation">Défiscalisation</option>
        </select>
      </div>

      {/* LISTE CLIENTS */}
      <div className="grid gap-5">
        {filteredClients.map(client => (
          <div key={client.id} className="liquid-glass rounded-3xl p-6">
            <div className="flex justify-between items-start gap-6">
              <div>
                <h2 className="text-2xl mb-2">{client.nom}</h2>
                <p className="text-white/60">{client.telephone}</p>
                <p className="text-white/40">{client.email}</p>
              </div>
              <div className="text-right space-y-2">
                <div className="px-4 py-2 rounded-full bg-[#C87533]/20 text-[#C87533] text-sm">
                  {client.type_client}
                </div>
                <div className="px-4 py-2 rounded-full bg-white/10 text-white/70 text-sm">
                  {client.categorie_client}
                </div>
                <div className="px-4 py-2 rounded-full bg-white/5 text-white/50 text-sm">
                  {client.projet_client}
                </div>
              </div>
            </div>
            {client.notes && (
              <div className="mt-6 text-white/50 text-sm">{client.notes}</div>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}