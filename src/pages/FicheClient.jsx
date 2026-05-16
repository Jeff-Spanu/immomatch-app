import { useState } from "react";

export default function FicheClient({ client, onClose }) {
  if (!client) return null;

  // Calcul du style selon la catégorie
  const isPrestige = client.categorie_client === "prestige";
  const accentColor = isPrestige ? "border-gold/50" : "border-[#C87533]/50";
  const textColor = isPrestige ? "text-gold" : "text-[#C87533]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={`relative w-full max-w-4xl bg-[#0a0a0a] rounded-[40px] border ${accentColor} overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300`}>
        
        {/* Header de la Fiche */}
        <div className="p-8 md:p-12 flex justify-between items-start border-b border-white/5">
          <div>
            <span className={`text-[10px] uppercase tracking-[0.3em] font-bold ${textColor}`}>
              Dossier {client.categorie_client} • {client.type_client}
            </span>
            <h2 className="text-5xl font-serif text-white mt-2">{client.nom}</h2>
            <p className="text-white/40 mt-2 italic">{client.secteur || "Secteur non défini"}</p>
          </div>
          <button 
            onClick={onClose}
            className="bg-white/5 hover:bg-white/10 text-white w-12 h-12 rounded-full flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-white/5">
          
          {/* Colonne 1 : Coordonnées */}
          <div className="p-8 bg-[#0a0a0a] space-y-6">
            <h3 className="text-xs uppercase text-white/30 tracking-widest font-bold">Contact</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-white/20 uppercase">Téléphone</p>
                <p className="text-white">{client.telephone || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/20 uppercase">Email</p>
                <p className="text-white truncate">{client.email || "—"}</p>
              </div>
            </div>
          </div>

          {/* Colonne 2 : Critères Immo */}
          <div className="p-8 bg-[#0a0a0a] space-y-6">
            <h3 className="text-xs uppercase text-white/30 tracking-widest font-bold">Projet Immobilier</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-white/20 uppercase">Budget / Prix</p>
                <p className={`text-xl ${textColor}`}>{client.budget?.toLocaleString()} €</p>
              </div>
              <div>
                <p className="text-[10px] text-white/20 uppercase">Type de bien</p>
                <p className="text-white">{client.type_bien || "—"}</p>
              </div>
            </div>
          </div>

          {/* Colonne 3 : Équipements (Badges) */}
          <div className="p-8 bg-[#0a0a0a] space-y-6">
            <h3 className="text-xs uppercase text-white/30 tracking-widest font-bold">Prestations</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Piscine", val: client.piscine },
                { label: "Vue Mer", val: client.vue_mer },
                { label: "Garage", val: client.garage },
                { label: "Varangue", val: client.varangue },
                { label: "Jardin", val: client.jardin }
              ].map(item => (
                <span key={item.label} className={`px-3 py-1 rounded-full text-[9px] uppercase font-bold ${item.val ? "bg-white/10 text-white border border-white/20" : "opacity-20 grayscale text-white/50"}`}>
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Section Notes (Keep) */}
        <div className="p-8 md:p-12 bg-white/[0.02]">
          <h3 className="text-xs uppercase text-white/30 tracking-widest font-bold mb-4">Notes de terrain (Google Keep)</h3>
          <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
            <p className="text-sm text-white/60 leading-relaxed italic">
              {client.notes ? `"${client.notes}"` : "Aucune note disponible pour ce dossier."}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-black flex justify-end gap-4">
            <button className="px-6 py-2 text-xs text-white/40 hover:text-white transition">
                Générer PDF
            </button>
            <button className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition ${isPrestige ? "bg-gold text-black" : "bg-[#C87533] text-white"}`}>
                Contacter le client
            </button>
        </div>
      </div>
    </div>
  );
}