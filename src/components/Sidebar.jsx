import ThemeSwitcher from "./ThemeSwitcher"
import { useState } from "react"
import { NavLink } from "react-router-dom"
import { useTheme } from "../hooks/useTheme"

// Raccourcis de la barre du bas mobile
const MOBILE_NAV = [
  { to: "/",            icon: "⊞",  label: "Accueil" },
  { to: "/clients",     icon: "👥", label: "Clients" },
  { to: "/acquereurs",  icon: "🎯", label: "Acquér." },
  { to: "/vendeurs",    icon: "🏠", label: "Vendeurs" },
  { to: "/matching",    icon: "🔗", label: "Match" },
  { to: "/import-csv",  icon: "↑",  label: "Import" },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const isLight = theme === "light"

  function linkClass(isActive) {
    return `
      block w-full rounded-xl px-4 py-3 text-sm font-medium tracking-wide
      transition-all duration-200 liquid-glass
      ${isActive ? "accent-glow" : "hover:bg-white/10 text-white/60 hover:text-white/90"}
    `
  }

  return (
    <>
      {/* 📱 BARRE MOBILE (haut) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#14120F]/90 backdrop-blur-md border-b border-white/10 px-5 flex items-center justify-between z-50">
        <img
          src="/Logo_Premium.png"
          alt="ImmoMatch"
          style={{ height: "40px", width: "auto", objectFit: "contain" }}
        />
        <div className="flex items-center gap-1">
          {/* Bouton clair / sombre */}
          <button
            onClick={() => setTheme(isLight ? "dark" : "light")}
            aria-label="Basculer clair / sombre"
            className="text-white p-2 focus:outline-none"
            style={{ fontSize: "18px", lineHeight: 1 }}
          >
            {isLight ? "🌙" : "☀️"}
          </button>
          {/* Hamburger */}
          <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2 focus:outline-none" aria-label="Menu">
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
          <span className="mt-2 text-[9px] font-bold tracking-widest uppercase border border-[#C87533]/50 text-[#C87533] px-3 py-1 rounded-full">
            🔥 Alchemistria
          </span>
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
        <div className="mt-auto pt-4 border-t border-white/10 hidden lg:block">
          <ThemeSwitcher />
          <p className="text-[10px] text-white/40 tracking-wide mt-3">ImmoMatch CRM v2</p>
          <p className="text-[10px] text-[#C87533]/60 mt-0.5">🔥 Collectif Alchemistria · CONFIDENTIEL</p>
        </div>
      </aside>

      {/* Overlay mobile */}
      {isOpen && (
        <div onClick={() => setIsOpen(false)} className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm" />
      )}

      {/* 📱 BARRE DU BAS MOBILE */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
        style={{
          background: "var(--bg-sidebar)",
          borderTop: "1px solid var(--border)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {MOBILE_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={() => setIsOpen(false)}
            style={({ isActive }) => ({
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "2px",
              padding: "8px 2px",
              textDecoration: "none",
              color: isActive ? "var(--accent)" : "var(--text-muted)",
              WebkitTapHighlightColor: "transparent",
            })}
          >
            <span style={{ fontSize: "19px", lineHeight: 1 }}>{item.icon}</span>
            <span style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "-0.2px" }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
