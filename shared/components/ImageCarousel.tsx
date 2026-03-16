'use client';

import { useState, useCallback, useEffect } from 'react';
import { ProductImage } from '@/shared/components/ProductImage';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  videos?: string[];
  alt: string;
  className?: string;
  priority?: boolean;
}

export function ImageCarousel({ 
  images, 
  videos = [],
  alt, 
  className = '',
  priority = false 
}: ImageCarouselProps) {
  // Junta imagens e vídeos em um único array, mantendo a ordem: imagens primeiro, depois vídeos
  const media = [...images, ...videos];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;
  const hasMultiple = media.length > 1;

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  }, [media.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  }, [media.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) goToNext();
    else if (distance < -minSwipeDistance) goToPrevious();
  };

  useEffect(() => {
    if (!hasMultiple) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext, hasMultiple]);

  if (media.length === 0) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        <ProductImage src={'/placeholder-product.svg'} alt={alt} priority={priority} />
      </div>
    );
  }

  // Verifica se o item atual é imagem ou vídeo
  const isVideo = currentIndex >= images.length;
  const currentMedia = media[currentIndex];

  return (
    <div
      className={`relative w-full h-full ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {isVideo ? (
        <video
          src={currentMedia}
          controls
          autoPlay
          muted
          playsInline
          className="object-cover w-full h-full rounded-lg"
          style={{ maxHeight: '100%', maxWidth: '100%' }}
        />
      ) : (
        <ProductImage
          src={currentMedia}
          alt={hasMultiple ? `${alt} - ${currentIndex + 1} de ${media.length}` : alt}
          priority={priority}
        />
      )}

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToPrevious(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/80 hover:bg-white rounded-full shadow-md z-30 cursor-pointer"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>

          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToNext(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/80 hover:bg-white rounded-full shadow-md z-30 cursor-pointer"
            aria-label="Próximo"
          >
            <ChevronRight className="w-5 h-5 text-gray-800" />
          </button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 rounded-full px-2 py-1 z-30">
            {media.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentIndex(index); }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  index === currentIndex ? 'bg-white w-6' : 'bg-white/50 w-2 hover:bg-white/75'
                }`}
                aria-label={`Ir para mídia ${index + 1}`}
              />
            ))}
          </div>

          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-30 pointer-events-none">
            {currentIndex + 1} / {media.length}
          </div>
        </>
      )}
    </div>
  );
}

