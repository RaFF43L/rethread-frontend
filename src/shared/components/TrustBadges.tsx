"use client";

import { Heart, Leaf, Recycle } from "lucide-react";

const badges = [
  {
    icon: Heart,
    title: "Moda Sustentável",
    description: "Prolongue a vida das roupas e reduza o impacto ambiental com escolhas conscientes.",
  },
  {
    icon: Leaf,
    title: "Menos Resíduos",
    description: "Reduza o descarte têxtil e contribua para um planeta mais limpo e sustentável.",
  },
  {
    icon: Recycle,
    title: "Consumo Consciente",
    description: "Faça parte do movimento slow fashion e valorize qualidade sobre quantidade.",
  },
];

export function TrustBadges() {
  return (
    <section className="w-full py-16 md:py-20 px-4 md:px-14 bg-background">
      <div className="max-w-[1360px] mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-[10px] md:text-[11px] font-medium tracking-[0.22em] uppercase text-neutral-600 mb-3">
            Por que escolher a Segunda Aura?
          </p>
          <h2 className="font-serif text-[32px] md:text-[40px] font-bold italic text-neutral-950">
            Compre com confiança
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.title} className="text-center">
                <div className="w-12 h-12 md:w-14 md:h-14 border border-coral flex items-center justify-center mx-auto mb-5 md:mb-6">
                  <Icon className="text-coral w-5 h-5 md:w-6 md:h-6" />
                </div>
                <h3 className="font-serif text-[20px] md:text-[22px] font-bold italic text-neutral-950 mb-2 md:mb-3">
                  {badge.title}
                </h3>
                <p className="text-[12px] md:text-[13px] text-neutral-700 leading-[1.65]">
                  {badge.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
