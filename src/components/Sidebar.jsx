import { NavLink } from "react-router-dom"

export default function Sidebar() {

  function linkClass(isActive) {

    return `
      block
      w-full
      rounded-2xl
      p-4
      transition
      liquid-glass

      ${
        isActive
          ? "accent-glow text-[#C87533]"
          : "hover:bg-white/10 text-white/80"
      }
    `
  }

  return (

    <aside className="w-72 border-r border-white/10 p-6 hidden lg:flex flex-col backdrop-blur-xl">

      <div className="mb-12">

        <h1 className="text-5xl leading-none font-semibold">
          Immo<span className="text-[#C87533]">Match</span>
        </h1>

        <p className="text-white/40 mt-3 text-sm">
          CRM Immobilier • La Réunion
        </p>

      </div>

      <nav className="space-y-3">

        <NavLink
          to="/"
          end
          className={({ isActive }) => linkClass(isActive)}
        >
          🏠 Tableau de bord
        </NavLink>

        <NavLink
          to="/nouveau-client"
          className={({ isActive }) => linkClass(isActive)}
        >
          ➕ Nouveau client
        </NavLink>

        <NavLink
          to="/clients"
          className={({ isActive }) => linkClass(isActive)}
        >
          👥 Clients
        </NavLink>

        <NavLink
          to="/acquereurs"
          className={({ isActive }) => linkClass(isActive)}
        >
          🧑‍💼 Acquéreurs
        </NavLink>

        <NavLink
          to="/vendeurs"
          className={({ isActive }) => linkClass(isActive)}
        >
          🏡 Vendeurs
        </NavLink>

        <NavLink
          to="/matching"
          className={({ isActive }) => linkClass(isActive)}
        >
          🤖 Correspondance IA
        </NavLink>

        <NavLink
          to="/prestige"
          className={({ isActive }) => linkClass(isActive)}
        >
          💎 Prestige
        </NavLink>

        <NavLink
          to="/patrimoine"
          className={({ isActive }) => linkClass(isActive)}
        >
          🏛️ Patrimoine
        </NavLink>

        <NavLink
          to="/import-csv"
          className={({ isActive }) => linkClass(isActive)}
        >
          📥 Import CSV
        </NavLink>

      </nav>

      <div className="mt-auto pt-8 text-xs text-white/30">

        ImmoMatch CRM v2  
        <br />
        Matching intelligent immobilier

      </div>

    </aside>

  )
}