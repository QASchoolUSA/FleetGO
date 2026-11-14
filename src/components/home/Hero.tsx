"use client";

import Link from "next/link";
import { motion } from "motion/react";

export function Hero() {
  return (
    <section className="relative isolate min-h-[72vh] overflow-hidden bg-[var(--navy-deep)] text-white md:min-h-[78vh]">
      <div
        className="absolute inset-0 bg-cover bg-[center_30%]"
        style={{
          backgroundImage:
            "linear-gradient(105deg, rgba(14,47,122,0.82) 0%, rgba(14,47,122,0.55) 52%, rgba(14,47,122,0.28) 100%), url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=2000&q=80')",
        }}
      />

      <div className="relative mx-auto flex min-h-[72vh] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 md:min-h-[78vh] md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-[family-name:var(--font-display)] text-5xl font-semibold uppercase leading-none tracking-[0.04em] sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="text-white">Fleet</span>
            <span className="text-[var(--signal)]">Go</span>
          </p>
          <h1 className="mt-5 max-w-xl font-[family-name:var(--font-display)] text-2xl font-semibold uppercase leading-tight tracking-wide text-white/95 sm:text-3xl md:text-4xl">
            Parts that keep fleets moving
          </h1>
          <p className="mt-4 max-w-md text-base text-white/75 sm:text-lg">
            Auto and Class 8 parts with vehicle fitment, clear part numbers, and checkout that gets you back on the road.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex h-12 items-center justify-center rounded-md bg-[var(--signal)] px-6 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[var(--signal-dark)]"
            >
              Shop parts
            </Link>
            <Link
              href="/c/semi-hd"
              className="inline-flex h-12 items-center justify-center rounded-md border border-white/35 bg-[var(--navy-deep)]/50 px-6 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:border-white/55 hover:bg-[var(--navy-deep)]/70"
            >
              Semi / HD
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
