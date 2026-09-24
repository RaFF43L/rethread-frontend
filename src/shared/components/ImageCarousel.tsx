"use client";

import { useState, useCallback, useEffect } from "react";
import { ProductImage } from "@/shared/components/ProductImage";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ImageCarouselProps {
  images: string[];
  videos?: string[];
  alt: string;
  className?: string;
  priority?: boolean;
  objectFit?: "cover" | "contain";
}

export function ImageCarousel({
  images,
  videos = [],
  alt,
  className,
  priority = false,
  objectFit = "cover",
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const totalItems = images.length + videos.length;

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? totalItems - 1 : prev - 1));
    setIsZoomed(false);
    setZoomLevel(1);
  }, [totalItems]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === totalItems - 1 ? 0 : prev + 1));
    setIsZoomed(false);
    setZoomLevel(1);
  }, [totalItems]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "Escape" && isZoomed) setIsZoomed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrevious, goToNext, isZoomed]);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1));
    if (zoomLevel <= 1.5) setIsZoomed(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || zoomLevel <= 1) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleImageClick = () => {
    if (!isZoomed) {
      setIsZoomed(true);
      setZoomLevel(2);
    }
  };

  const currentIsVideo = currentIndex >= images.length;
  const currentVideoIndex = currentIndex - images.length;

  if (totalItems === 0) {
    return (
      <div className={cn("aspect-square bg-secondary", className)}>
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          Sem imagens disponíveis
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative group", className)}>
      {/* Main image/video area */}
      <div
        className="relative aspect-square bg-secondary rounded-lg overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isZoomed && setZoomPosition({ x: 50, y: 50 })}
      >
        {currentIsVideo ? (
          <video
            key={currentVideoIndex}
            controls
            className="w-full h-full object-cover"
            poster={images[0]}
          >
            <source src={videos[currentVideoIndex]} type="video/mp4" />
            Seu navegador não suporta vídeos.
          </video>
        ) : (
          <div
            onClick={handleImageClick}
            className={cn(
              "relative w-full h-full cursor-zoom-in transition-transform duration-300",
              isZoomed && "cursor-zoom-out"
            )}
            style={{
              transform: isZoomed ? `scale(${zoomLevel})` : "scale(1)",
              transformOrigin: isZoomed ? `${zoomPosition.x}% ${zoomPosition.y}%` : "center",
            }}
          >
            <ProductImage
              src={images[currentIndex]}
              alt={`${alt} - Imagem ${currentIndex + 1}`}
              className="w-full h-full"
              priority={priority && currentIndex === 0}
              objectFit={objectFit}
            />
          </div>
        )}

        {/* Zoom controls */}
        {!currentIsVideo && (
          <div className={cn(
            "absolute top-4 right-4 z-20 flex gap-2",
            "transition-opacity duration-300",
            "opacity-0 group-hover:opacity-100"
          )}>
            {isZoomed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsZoomed(false);
                  setZoomLevel(1);
                }}
                className={cn(
                  "p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg",
                  "hover:bg-white transition-all duration-200",
                  "hover:scale-110 active:scale-95"
                )}
                aria-label="Fechar zoom"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoomIn();
                setIsZoomed(true);
              }}
              disabled={zoomLevel >= 3}
              className={cn(
                "p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg",
                "hover:bg-white transition-all duration-200",
                "hover:scale-110 active:scale-95",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              aria-label="Aumentar zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoomOut();
              }}
              disabled={zoomLevel <= 1}
              className={cn(
                "p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg",
                "hover:bg-white transition-all duration-200",
                "hover:scale-110 active:scale-95",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              aria-label="Diminuir zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation arrows */}
        {totalItems > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 z-20",
                "p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg",
                "hover:bg-white transition-all duration-200",
                "opacity-0 group-hover:opacity-100",
                "hover:scale-110 active:scale-95"
              )}
              aria-label="Imagem anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 z-20",
                "p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg",
                "hover:bg-white transition-all duration-200",
                "opacity-0 group-hover:opacity-100",
                "hover:scale-110 active:scale-95"
              )}
              aria-label="Próxima imagem"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Indicator dots */}
        {totalItems > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {Array.from({ length: totalItems }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsZoomed(false);
                  setZoomLevel(1);
                }}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  currentIndex === index
                    ? "bg-white w-6"
                    : "bg-white/60 hover:bg-white/80"
                )}
                aria-label={`Ir para imagem ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {totalItems > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsZoomed(false);
                setZoomLevel(1);
              }}
              className={cn(
                "relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden",
                "border-2 transition-all duration-200",
                currentIndex === index
                  ? "border-foreground scale-105"
                  : "border-border hover:border-foreground/50"
              )}
            >
              <ProductImage
                src={image}
                alt={`${alt} miniatura ${index + 1}`}
                className="w-full h-full"
                objectFit="cover"
              />
            </button>
          ))}
          {videos.map((video, index) => (
            <button
              key={`video-${index}`}
              onClick={() => setCurrentIndex(images.length + index)}
              className={cn(
                "relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden",
                "border-2 transition-all duration-200",
                currentIndex === images.length + index
                  ? "border-foreground scale-105"
                  : "border-border hover:border-foreground/50"
              )}
            >
              <video className="w-full h-full object-cover" muted>
                <source src={video} type="video/mp4" />
              </video>
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[6px] border-l-black border-y-[4px] border-y-transparent ml-0.5" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
