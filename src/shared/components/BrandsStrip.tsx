"use client";

interface BrandsStripProps {
  brands?: string[];
}

export function BrandsStrip({ 
  brands = [
    "Zara", "H&M", "Farm", "Animale", "Shoulder", 
    "Amissima", "C&A", "Renner", "Le Lis Blanc", "Colcci"
  ] 
}: BrandsStripProps) {
  return (
    <section className="w-full py-8 md:py-10 bg-neutral-950 overflow-hidden">
      <div className="px-4 md:px-14 flex items-center gap-8 md:gap-10">
        <p className="text-[9px] md:text-[10px] font-medium tracking-[0.20em] uppercase text-neutral-700 whitespace-nowrap shrink-0">
          Marcas em destaque
        </p>
        <div className="w-px h-4 bg-neutral-900 shrink-0"></div>
        
        {/* Scrolling brands */}
        <div className="flex items-center gap-8 md:gap-10 overflow-x-auto scrollbar-hide">
          {brands.map((brand, index) => (
            <div key={brand} className="flex items-center gap-8 md:gap-10 shrink-0">
              <span className="font-serif text-[18px] md:text-[20px] font-medium italic text-neutral-400 whitespace-nowrap">
                {brand}
              </span>
              {index < brands.length - 1 && (
                <span className="text-neutral-800 text-xs">·</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
