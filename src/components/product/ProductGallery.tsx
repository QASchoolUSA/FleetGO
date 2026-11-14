"use client";

import { useState } from "react";
import { cn } from "@/lib/format";
import { ProductImageFrame } from "./ProductImageFrame";

export function ProductGallery({
  images,
  title,
}: {
  images: { url: string; alt: string }[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!current) {
    return <div className="aspect-square rounded-xl bg-[var(--surface-muted)]" />;
  }

  return (
    <div>
      <ProductImageFrame
        src={current.url}
        alt={current.alt || title}
        variant="gallery"
        priority
        fadeKey={current.url}
        sizes="(max-width: 768px) 100vw, 50vw"
        className="aspect-square rounded-xl"
      />
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, index) => (
            <button
              key={img.url + index}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border",
                index === active ? "border-[var(--field)]" : "border-[var(--line)]",
              )}
            >
              <ProductImageFrame
                src={img.url}
                alt=""
                variant="thumb"
                sizes="64px"
                className="absolute inset-0"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
