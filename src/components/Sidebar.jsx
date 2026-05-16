import { NavLink } from "react-router-dom"

export default function Sidebar() {

  function linkClass(isActive) {
    return `
      block
      w-full
      rounded-xl
      px-4
      py-3
      text-sm
      font-medium
      tracking-wide
      transition-all
      duration-200
      liquid-glass
      ${isActive ? "accent-glow" : "hover:bg-white/10 text-white/60 hover:text-white/90"}
    `
  }

  return (
    <aside className="w-64 border-r border-white/10 px-5 py-7 hidden lg:flex flex-col backdrop-blur-2xl"
           style={{ background: "rgba(20, 18, 15, 0.45)" }}>

      {/* Logo */}
      <div className="mb-10 pl-1">
        <h1 className="font-serif text-4xl font-light tracking-wide text-white leading-none">
          Immo<span className="text-orange-500 font-normal">Match</span>
        </h1>
        <p className="text-white/60 mt-2 text-[12px] font-medium tracking-[0.18em] uppercase">
          IAD Réunion · Off Market
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">

        <p className="text-[11px] font-semibold text-white/60 tracking-[0.16em] uppercase px-4 mb-2 mt-1">
          Principal
        </p>

        <NavLink to="/" end className={({ isActive }) => linkClass(isActive)}>
          Tableau de bord
        </NavLink>

        <NavLink to="/nouveau-client" className={({ isActive }) => linkClass(isActive)}>
          Nouveau client
        </NavLink>

        <NavLink to="/clients" className={({ isActive }) => linkClass(isActive)}>
          Clients
        </NavLink>

        <p className="text-[11px] font-semibold text-white/60 tracking-[0.16em] uppercase px-4 mb-2 mt-5">
          Segments
        </p>

        <NavLink to="/acquereurs" className={({ isActive }) => linkClass(isActive)}>
          Acquéreurs
        </NavLink>

        <NavLink to="/vendeurs" className={({ isActive }) => linkClass(isActive)}>
          Vendeurs
        </NavLink>

        <NavLink to="/matching" className={({ isActive }) => linkClass(isActive)}>
          Correspondance IA
        </NavLink>

        <NavLink to="/prestige" className={({ isActive }) => linkClass(isActive)}>
          Prestige
        </NavLink>

        <NavLink to="/patrimoine" className={({ isActive }) => linkClass(isActive)}>
          Patrimoine
        </NavLink>

        <p className="text-[11px] font-semibold text-white/60 tracking-[0.16em] uppercase px-4 mb-2 mt-5">
          Outils
        </p>

        <NavLink to="/import-csv" className={({ isActive }) => linkClass(isActive)}>
          Import CSV
        </NavLink>

      </nav>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-white/10">
        <p className="text-[10px] text-white/40 tracking-wide">
          ImmoMatch CRM v2
        </p>
        <p className="text-[10px] text-white/30 mt-0.5">
          Matching intelligent immobilier
        </p>
      </div>

    </aside>
  )
}