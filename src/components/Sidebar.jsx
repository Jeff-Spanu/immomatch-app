import { useState } from "react"
import { NavLink } from "react-router-dom"

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)

  function linkClass(isActive) {
    return `
      block w-full rounded-xl px-4 py-3 text-sm font-medium tracking-wide
      transition-all duration-200 liquid-glass
      ${isActive ? "accent-glow" : "hover:bg-white/10 text-white/60 hover:text-white/90"}
    `
  }

  return (
    <>
      {/* 📱 BARRE MOBILE */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#14120F]/90 backdrop-blur-md border-b border-white/10 px-5 flex items-center justify-between z-50">
        <img
          src="/Logo_Premium.png"
          alt="ImmoMatch"
          style={{ height: "40px", width: "auto", objectFit: "contain" }}
        />
        <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2 focus:outline-none">
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* 🖥️ SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 border-r border-white/10 px-5 py-7 flex flex-col backdrop-blur-2xl transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ background: "rgba(20, 18, 15, 0.95)" }}
      >
        {/* Logo desktop */}
        <div className="hidden lg:flex flex-col items-center mb-10">
          <img
            src="/Logo_Premium.png"
            alt="ImmoMatch"
            style={{ width: "180px", height: "auto", objectFit: "contain", borderRadius: "12px" }}
          />
          <p className="text-white/50 mt-3 text-[10px] font-medium tracking-[0.20em] uppercase text-center">
            IAD Réunion · Off Market
          </p>
        </div>

        {/* Espacement mobile */}
        <div className="h-14 lg:hidden" />

        {/* Navigation */}
        <nav className="flex flex-col gap-1 overflow-y-auto">
          <p className="text-[11px] font-semibold text-white/60 tracking-[0.16em] uppercase px-4 mb-2 mt-1">
            Principal
          </p>
          <NavLink to="/" end className={({ isActive }) => linkClass(isActive)} onClick={() => setIsOpen(false)}>Tableau de bord</NavLink>
          <NavLink to="/nouveau-client" className={({ isActive }) => linkClass(isActive)} onClick={() => setIsOpen(false)}>Nouveau client</NavLink>
          <NavLink to="/clients" className={({ isActive }) => linkClass(isActive)} onClick={() => setIsOpen(false)}>Clients</NavLink>

          <p className="text-[11px] font-semibold text-white/60 tracking-[0.16em] uppercase px-4 mb-2 mt-5">
            Segments
          </p>
          <NavLink to="/acquereurs" className={({ isActive }) => linkClass(isActive)} onClick={() => setIsOpen(false)}>Acquéreurs</NavLink>
          <NavLink to="/vendeurs" className={({ isActive }) => linkClass(isActive)} onClick={() => setIsOpen(false)}>Vendeurs</NavLink>
          <NavLink to="/matching" className={({ isActive }) => linkClass(isActive)} onClick={() => setIsOpen(false)}>Correspondance IA</NavLink>
          <NavLink to="/prestige" className={({ isActive }) => linkClass(isActive)} onClick={() => setIsOpen(false)}>Prestige</NavLink>
          <NavLink to="/patrimoine" className={({ isActive }) => linkClass(isActive)} onClick={() => setIsOpen(false)}>Patrimoine</NavLink>

          <p className="text-[11px] font-semibold text-white/60 tracking-[0.16em] uppercase px-4 mb-2 mt-5">
            Outils
          </p>
          <NavLink to="/import-csv" className={({ isActive }) => linkClass(isActive)} onClick={() => setIsOpen(false)}>Import CSV</NavLink>
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-white/10 hidden lg:block">
          <p className="text-[10px] text-white/40 tracking-wide">ImmoMatch CRM v2</p>
          <p className="text-[10px] text-white/30 mt-0.5">Matching intelligent immobilier</p>
        </div>
      </aside>

      {/* Overlay mobile */}
      {isOpen && (
        <div onClick={() => setIsOpen(false)} className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm" />
      )}
    </>
  )
}
