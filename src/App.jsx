import Clients from "./pages/Clients"
import { Routes, Route } from "react-router-dom"

import Sidebar from "./components/Sidebar"

import Dashboard from "./pages/Dashboard"
import NouveauClient from "./pages/NouveauClient"
import Acquereurs from "./pages/Acquereurs"
import Vendeurs from "./pages/Vendeurs"
import Matching from "./pages/Matching"
import Prestige from "./pages/Prestige"
import Patrimoine from "./pages/Patrimoine"
import ImportCSV from "./pages/ImportCSV"
import DashboardClients from "./pages/DashboardClients"

export default function App() {
  return (
    <div
      className="min-h-screen text-white flex relative overflow-x-hidden bg-charcoal"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >

      {/* ─── FOND DESKTOP : fixed = identique sur TOUTES les pages ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none hidden lg:block">
        <img
          src="/immomatch-bg.png"
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.82) contrast(1.02)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/15 to-black/5" />
        <div className="absolute top-[-150px] left-[-150px] w-[500px] h-[500px] bg-wood/10 blur-3xl rounded-full" />
      </div>

      {/* ─── FOND MOBILE / TABLETTE ─── */}
      <div className="fixed inset-0 z-0 bg-[#1C1917] lg:hidden" />

      {/* ─── INTERFACE ─── */}
      <div className="relative z-10 flex flex-col md:flex-row w-full min-h-screen">
        <Sidebar />

        <main className="flex-1 p-4 md:p-10 overflow-y-auto overflow-x-hidden w-full">
          <Routes>
            <Route path="/"                   element={<Dashboard />} />
            <Route path="/nouveau-client"     element={<NouveauClient />} />
            <Route path="/clients"            element={<Clients />} />
            <Route path="/acquereurs"         element={<Acquereurs />} />
            <Route path="/vendeurs"           element={<Vendeurs />} />
            <Route path="/matching"           element={<Matching />} />
            <Route path="/prestige"           element={<Prestige />} />
            <Route path="/patrimoine"         element={<Patrimoine />} />
            <Route path="/import-csv"         element={<ImportCSV />} />
            <Route path="/dashboard-clients"  element={<DashboardClients />} />
          </Routes>
        </main>
      </div>

    </div>
  )
}
