"use client";

import Link from "next/link";
import { motion } from "motion/react";

export function Hero() {
  return (
    <section className="relative isolate min-h-[72vh] overflow-hidden bg-[var(--navy-deep)] text-white md:min-h-[78vh]">
      {/* Full-bleed truck — left-weighted so the cab stays in frame */}
      <div
        className="absolute inset-0 bg-cover bg-[28%_42%] sm:bg-[32%_38%] md:bg-[center_36%] lg:bg-[42%_34%]"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=2000&q=80')",
        }}
        aria-hidden
      />

      {/* Mobile: clear the upper truck, darken the lower copy band */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-[rgba(10,34,88,0.94)] via-[rgba(10,34,88,0.55)] to-[rgba(10,34,88,0.18)] md:hidden"
        aria-hidden
      />

      {/* Desktop: darken the right copy column; leave the truck side open */}
      <div
        className="absolute inset-0 hidden bg-gradient-to-l from-[rgba(10,34,88,0.9)] via-[rgba(10,34,88,0.42)] to-[rgba(10,34,88,0.12)] md:block"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[72vh] max-w-7xl flex-col justify-end px-4 pb-14 pt-24 sm:px-6 md:min-h-[78vh] md:justify-center md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl md:ml-auto"
        >
          <p className="font-[family-name:var(--font-display)] text-5xl font-semibold uppercase leading-none tracking-[0.04em] sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="text-white">Fleet</span>
            <span className="text-[var(--signal)]">Go</span>
          </p>
          <h1 className="mt-5 max-w-xl font-[family-name:var(--font-display)] text-2xl font-semibold uppercase leading-tight tracking-wide text-white/95 sm:text-3xl md:text-4xl">
            Parts that keep fleets moving
          </h1>
          <p className="mt-4 max-w-md text-base text-white/80 sm:text-lg">
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
