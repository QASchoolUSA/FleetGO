"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/format";

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
      <div className="relative aspect-square overflow-hidden rounded-xl bg-[var(--surface-muted)]">
        <motion.div
          key={current.url}
          initial={{ opacity: 0.4, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.28 }}
          className="absolute inset-0"
        >
          <Image
            src={current.url}
            alt={current.alt || title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </motion.div>
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, index) => (
            <button
              key={img.url + index}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border",
                index === active ? "border-[var(--navy)]" : "border-[var(--line)]",
              )}
            >
              <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
