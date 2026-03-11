'use client';

import Image from 'next/image';
import { useState } from 'react';
import { isS3Image, env } from '@/shared/lib/env';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export function ProductImage({ 
  src, 
  alt, 
  className = '',
  priority = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const shouldUseUnoptimized = isS3Image(src) || !env.enableImageOptimization;

  const fallbackSrc = '/placeholder-product.png';

  const handleError = () => {
    console.error(`Failed to load image: ${src}`);
    setImageError(true);
    setImageLoading(false);
  };

  const handleLoad = () => {
    setImageLoading(false);
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <Image
        src={imageError ? fallbackSrc : src}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-300 ${
          imageLoading ? 'opacity-0' : 'opacity-100'
        }`}
        sizes={sizes}
        priority={priority}
        unoptimized={shouldUseUnoptimized}
        onError={handleError}
        onLoad={handleLoad}
      />
      
      {/* Loading skeleton */}
      {imageLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      {/* Error state */}
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center p-4">
            <svg 
              className="w-12 h-12 mx-auto text-muted-foreground" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <p className="text-xs text-muted-foreground mt-2">Imagem indisponível</p>
          </div>
        </div>
      )}
    </div>
  );
}
