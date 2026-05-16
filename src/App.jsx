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
    <div className="min-h-screen text-white flex relative overflow-hidden bg-black">

      {/* Background premium */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=2070&auto=format&fit=crop"
          alt="background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[3px]" />
        <div className="absolute top-[-200px] left-[-200px] w-[700px] h-[700px] bg-[#C87533]/20 blur-3xl rounded-full" />
        <div className="absolute bottom-[-200px] right-[-200px] w-[700px] h-[700px] bg-orange-500/10 blur-3xl rounded-full" />
      </div>

      {/* App */}
      <div className="relative z-10 flex w-full">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-10 overflow-auto">
          <Routes>

            <Route path="/" element={<Dashboard />} />
            <Route path="/nouveau-client" element={<NouveauClient />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/acquereurs" element={<Acquereurs />} />
            <Route path="/vendeurs" element={<Vendeurs />} />
            <Route path="/matching" element={<Matching />} />
            <Route path="/prestige" element={<Prestige />} />
            <Route path="/patrimoine" element={<Patrimoine />} />
            <Route path="/import-csv" element={<ImportCSV />} />
            <Route path="/dashboard-clients" element={<DashboardClients />} />

          </Routes>
        </main>
      </div>
    </div>
  )
}