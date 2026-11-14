"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { cn } from "@/lib/format";

const insets = {
  card: "inset-3 sm:inset-3.5",
  gallery: "inset-4 sm:inset-6",
  thumb: "inset-1.5",
  cart: "inset-1.5",
} as const;

export type ProductImageVariant = keyof typeof insets;

export function ProductImageFrame({
  src,
  alt,
  sizes,
  priority = false,
  className,
  variant = "card",
  imageClassName,
  fadeKey,
}: {
  src?: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  variant?: ProductImageVariant;
  imageClassName?: string;
  /** When set, fades the image in on change (PDP gallery). */
  fadeKey?: string;
}) {
  if (!src) {
    return (
      <div
        className={cn("relative overflow-hidden bg-[var(--surface)]", className)}
      />
    );
  }

  const image = (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      className={cn("object-contain object-center", imageClassName)}
      sizes={sizes}
    />
  );

  return (
    <div
      className={cn("relative overflow-hidden bg-[var(--surface)]", className)}
    >
      {fadeKey ? (
        <motion.div
          key={fadeKey}
          initial={{ opacity: 0.35 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className={cn("absolute", insets[variant])}
        >
          {image}
        </motion.div>
      ) : (
        <div className={cn("absolute", insets[variant])}>{image}</div>
      )}
    </div>
  );
}
