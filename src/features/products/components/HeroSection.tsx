"use client";

import Link from "next/link";
import { Button } from "@/shared/components/ui/button";

interface HeroSectionProps {
  totalProducts: number;
}

export function HeroSection({ totalProducts }: HeroSectionProps) {
  return (
    <section className="w-full min-h-[500px] md:min-h-[680px] relative overflow-hidden flex flex-col md:flex-row">
      {/* Left: Editorial panel com texto */}
      <div className="relative w-full md:w-1/2 bg-neutral-950 flex items-center">
        {/* Gold vertical accent line */}
        <div className="absolute left-8 md:left-14 top-1/2 -translate-y-1/2 w-px h-[180px] md:h-[240px] bg-coral"></div>
        
        {/* Hero text */}
        <div className="pl-16 md:pl-24 pr-8 md:pr-16 py-12 md:py-20 w-full">
          <p className="text-[10px] md:text-[11px] font-medium tracking-[0.26em] uppercase text-coral mb-6 md:mb-7">
            Moda Sustentável · {totalProducts}+ Peças
          </p>
          
          <h2 className="font-serif font-bold italic text-[40px] md:text-[64px] leading-[1.04] text-white mb-6 md:mb-7">
            Estilo único,<br />
            <span className="text-coral">história</span><br />
            autêntica
          </h2>
          
          <p className="text-[13px] md:text-[14px] text-neutral-400 leading-[1.65] mb-8 md:mb-9 max-w-[380px]">
            Peças selecionadas com carinho, cada uma com sua própria história. 
            Moda consciente, estilo atemporal e autenticidade em cada detalhe.
          </p>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button
              asChild
              className="h-11 md:h-12 px-6 md:px-8 bg-coral hover:bg-coral-dark text-white text-[11px] md:text-[12px] font-semibold tracking-[0.12em] uppercase transition-colors"
            >
              <Link href="/#produtos">Explorar Coleção</Link>
            </Button>
            
            <Link
              href="/#about"
              className="h-11 md:h-12 px-6 md:px-8 border border-coral text-coral text-[11px] md:text-[12px] font-medium tracking-[0.12em] uppercase hover:bg-coral/10 transition-colors inline-flex items-center justify-center"
            >
              Sobre o Projeto
            </Link>
          </div>
        </div>
      </div>

      {/* Right: Image editorial panel */}
      <div className="flex-1 bg-neutral-900 relative min-h-[300px] md:min-h-0">
        {/* Decorative editorial texture */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #2D2420 0%, #3D302A 40%, #2A2018 100%)",
          }}
        ></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-[280px] md:w-[320px] h-[360px] md:h-[440px] border border-coral/20 flex flex-col items-center justify-center gap-4">
            {/* Aqui pode ir uma imagem destaque quando houver */}
            <div className="w-20 h-20 rounded-full border-2 border-coral/20 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-coral/20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <p className="text-[10px] tracking-[0.22em] uppercase text-neutral-600 font-medium">
              Peça em destaque
            </p>
          </div>
        </div>

        {/* Brand watermark */}
        <div className="absolute bottom-6 md:bottom-8 right-6 md:right-8 text-right">
          <p
            className="font-serif text-[60px] md:text-[80px] font-bold italic text-neutral-50/4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            SA
          </p>
        </div>
      </div>
    </section>
  );
}
