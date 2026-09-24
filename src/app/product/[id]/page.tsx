import { notFound } from "next/navigation";
import { productsService } from "@/features/products/services/products.service";
import { ProductDetailClient } from "./client";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const product = await productsService.getProductById(id);
    const firstImage = product.images[0] || "/placeholder-product.svg";

    return {
      title: `${product.name} - Segunda Aura Brechó`,
      description:
        product.description ||
        `${product.name} - R$ ${product.price.toFixed(2).replace(".", ",")}`,
      openGraph: {
        title: `${product.name} - Segunda Aura Brechó`,
        description: [
          `R$ ${product.price.toFixed(2).replace(".", ",")}`,
          product.size ? `Tamanho ${product.size}` : null,
          product.available ? "Disponível" : "Indisponível",
        ]
          .filter(Boolean)
          .join(" · "),
        images: [
          { url: firstImage, width: 1200, height: 630, alt: product.name },
        ],
        type: "website",
        siteName: "Segunda Aura Brechó",
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} - Segunda Aura Brechó`,
        description: `R$ ${product.price.toFixed(2).replace(".", ",")}${product.size ? ` · Tamanho ${product.size}` : ""}`,
        images: [firstImage],
      },
    };
  } catch {
    return { title: "Produto não encontrado | Segunda Aura Brechó" };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  let product;
  try {
    product = await productsService.getProductById(id);
  } catch {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}

export const revalidate = 60;
