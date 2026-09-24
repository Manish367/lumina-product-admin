"use client";

import Image from "next/image";
import Link from "next/link";
import {
  MoreHorizontal,
} from "lucide-react";

import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
  onDelete: (product: Product) => void;
};

export default function ProductCard({
  product,
  onDelete,
}: ProductCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-white/20 hover:bg-white/[0.05]">
      <Link
        href={`/products/${product.id}`}
        className="block"
      >
        <div className="relative aspect-square overflow-hidden bg-white/[0.02]">
          <Image
            src={
              product.thumbnail ||
              product.images?.[0] ||
              "/placeholder.png"
            }
            alt={product.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>

        <div className="p-4">
          <div className="mb-1 text-xs uppercase tracking-wide text-gray-400">
            {product.category}
          </div>

          <h3 className="line-clamp-2 text-sm font-semibold text-white">
            {product.title}
          </h3>

          <div className="mt-3 flex items-center justify-between">
            <span className="font-semibold text-white">
              ${product.price}
            </span>

            <span className="text-xs text-gray-400">
              Stock: {product.stock}
            </span>
          </div>
        </div>
      </Link>

      {product.canDelete && (
        <button
          type="button"
          onClick={() => onDelete(product)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/60 text-gray-300 backdrop-blur transition hover:bg-black/80 hover:text-white"
          aria-label={`Delete ${product.title}`}
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}