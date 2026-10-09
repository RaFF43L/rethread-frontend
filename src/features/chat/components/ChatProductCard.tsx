"use client";

import Link from "next/link";
import { ProductImage } from "@/shared/components/ProductImage";
import { getImageUrl } from "@/shared/lib/env";
import { formatPrice } from "@/shared/utils/format";
import type { ChatProductItem } from "@/features/chat/types";

/** Resolves the best available thumbnail URL for a chat product item. */
function resolveImage(item: ChatProductItem): string {
  if (item.images && item.images.length > 0) {
    const first = [...item.images].sort((a, b) => a.id - b.id)[0];
    return getImageUrl(first.urlS3, "/placeholder-product.svg");
  }
  if (item.imageUrls && item.imageUrls.length > 0) {
    return getImageUrl(item.imageUrls[0], "/placeholder-product.svg");
  }
  return "/placeholder-product.svg";
}

function resolvePrice(preco: ChatProductItem["preco"]): number | null {
  const value = typeof preco === "string" ? parseFloat(preco) : preco;
  return typeof value === "number" && !Number.isNaN(value) ? value : null;
}

export function ChatProductCard({ item }: { item: ChatProductItem }) {
  const price = resolvePrice(item.preco);

  return (
    <Link
      href={`/product/${item.codigoIdentificacao}`}
      className="group block w-32 shrink-0 overflow-hidden rounded-lg border border-line bg-background transition-colors hover:border-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
      aria-label={`Ver ${item.marca ?? "produto"}`}
    >
      <div className="relative aspect-[3/4] w-full bg-muted">
        <ProductImage
          src={resolveImage(item)}
          alt={item.marca ?? "Produto"}
          sizes="128px"
        />
      </div>
      <div className="p-2">
        <p className="truncate text-xs font-medium text-foreground">
          {item.marca ?? "Produto"}
        </p>
        {price !== null && (
          <p className="mt-0.5 text-xs font-semibold text-action">
            {formatPrice(price)}
          </p>
        )}
        {item.size && (
          <p className="mt-0.5 truncate text-[0.6875rem] text-muted-foreground">
            Tam. {item.size}
          </p>
        )}
      </div>
    </Link>
  );
}
