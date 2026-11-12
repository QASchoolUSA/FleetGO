import Image from "next/image";
import Link from "next/link";
import type { CatalogCategory } from "@/lib/catalog/types";

export function FeaturedCategories({ categories }: { categories: CatalogCategory[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-8 max-w-2xl">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold uppercase tracking-wide text-[var(--navy)] sm:text-4xl">
          Shop by category
        </h2>
        <p className="mt-2 text-[var(--ink-muted)]">
          Navigate like a parts counter — brakes to Class 8 air systems, without the maze.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/c/${cat.slug}`}
            className="group relative aspect-[5/4] overflow-hidden rounded-xl"
          >
            {cat.image ? (
              <Image
                src={cat.image}
                alt=""
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            ) : (
              <div className="absolute inset-0 bg-[var(--field)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <span className="absolute bottom-3 left-3 right-3 font-[family-name:var(--font-display)] text-lg font-bold uppercase tracking-wide text-white sm:text-xl">
              {cat.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
