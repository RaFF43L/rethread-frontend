"use client";

import Link from "next/link";
import { Instagram, Facebook, Mail } from "lucide-react";

const footerLinks = {
  comprar: [
    { label: "Todas as Peças", href: "/" },
    { label: "Calças", href: "/?categoria=calca" },
    { label: "Blusas", href: "/?categoria=blusa" },
    { label: "Vestidos", href: "/?categoria=vestido" },
    { label: "Shorts", href: "/?categoria=short" },
  ],
  sobre: [
    { label: "Nossa História", href: "/#about" },
    { label: "Como Funciona", href: "/#about" },
    { label: "Sustentabilidade", href: "/#about" },
    { label: "Contato", href: "/#contact" },
  ],
  ajuda: [
    { label: "Como Comprar", href: "/#about" },
    { label: "Envio e Entrega", href: "/#about" },
    { label: "Trocas e Devoluções", href: "/#about" },
    { label: "Perguntas Frequentes", href: "/#about" },
  ],
};

export function EditorialFooter() {
  return (
    <footer className="w-full bg-neutral-950 pt-14 md:pt-16 pb-6 md:pb-8 px-4 md:px-14">
      <div className="max-w-[1360px] mx-auto">
        {/* Main footer content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 mb-12 md:mb-14">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2">
            <h3 className="font-serif text-[24px] md:text-[26px] font-bold italic text-white mb-1">
              Segunda Aura
            </h3>
            <p className="text-[9px] tracking-[0.22em] uppercase text-neutral-700 mb-4 md:mb-5">
              Brechó de Estilo · Desde 2024
            </p>
            <p className="text-[12px] md:text-[13px] text-neutral-600 leading-[1.65] mb-6 md:mb-7 max-w-[260px]">
              Moda sustentável com peças únicas e autênticas. 
              Cada item com sua própria história, cuidadosamente selecionado para você.
            </p>
            
            {/* Social links */}
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 border border-neutral-900 flex items-center justify-center text-neutral-700 hover:border-coral hover:text-coral transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-[13px] h-[13px]" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 border border-neutral-900 flex items-center justify-center text-neutral-700 hover:border-coral hover:text-coral transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-[13px] h-[13px]" />
              </a>
              <a
                href="mailto:contato@segundaaura.com.br"
                className="w-8 h-8 border border-neutral-900 flex items-center justify-center text-neutral-700 hover:border-coral hover:text-coral transition-colors"
                aria-label="Email"
              >
                <Mail className="w-[13px] h-[13px]" />
              </a>
            </div>
          </div>

          {/* Comprar */}
          <div>
            <h4 className="text-[11px] font-medium tracking-[0.14em] uppercase text-neutral-400 mb-4 md:mb-5">
              Comprar
            </h4>
            <ul className="space-y-2.5 md:space-y-3">
              {footerLinks.comprar.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[12px] md:text-[13px] text-neutral-700 hover:text-neutral-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sobre */}
          <div>
            <h4 className="text-[11px] font-medium tracking-[0.14em] uppercase text-neutral-400 mb-4 md:mb-5">
              Sobre
            </h4>
            <ul className="space-y-2.5 md:space-y-3">
              {footerLinks.sobre.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[12px] md:text-[13px] text-neutral-700 hover:text-neutral-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ajuda */}
          <div>
            <h4 className="text-[11px] font-medium tracking-[0.14em] uppercase text-neutral-400 mb-4 md:mb-5">
              Ajuda
            </h4>
            <ul className="space-y-2.5 md:space-y-3">
              {footerLinks.ajuda.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[12px] md:text-[13px] text-neutral-700 hover:text-neutral-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="border-t border-neutral-900 pt-5 md:pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] md:text-[11px] text-neutral-800 text-center md:text-left">
            © {new Date().getFullYear()} Segunda Aura Brechó. Todos os direitos reservados.
          </p>
          
          <p className="text-[10px] md:text-[11px] text-neutral-800 text-center md:text-right">
            Feito com ♻️ para um consumo mais consciente
          </p>
        </div>
      </div>
    </footer>
  );
}
