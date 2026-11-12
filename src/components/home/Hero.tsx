"use client";

import Link from "next/link";
import { motion } from "motion/react";

export function Hero() {
  return (
    <section className="relative isolate min-h-[68vh] overflow-hidden bg-[var(--field)] text-white md:min-h-[72vh]">
      <div
        className="absolute inset-0 bg-cover bg-[center_30%]"
        style={{
          backgroundImage:
            "linear-gradient(105deg, rgba(14,47,122,0.92) 0%, rgba(19,66,168,0.78) 48%, rgba(27,84,212,0.45) 100%), url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=2000&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(75,126,240,0.35),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(216,33,42,0.18),transparent_50%)]" />

      <div className="relative mx-auto flex min-h-[68vh] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 md:min-h-[72vh] md:py-20">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="font-[family-name:var(--font-display)] text-5xl font-bold uppercase leading-none tracking-[0.04em] sm:text-6xl md:text-7xl lg:text-8xl"
        >
          <span className="text-[var(--field-bright)]">Fleet</span>
          <span className="text-[var(--signal)]">Go</span>
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mt-4 max-w-xl font-[family-name:var(--font-display)] text-3xl font-semibold uppercase leading-tight tracking-wide sm:text-4xl md:text-5xl"
        >
          Parts that keep fleets moving
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="mt-4 max-w-md text-base text-white/75 sm:text-lg"
        >
          Auto and Class 8 parts with vehicle fitment, clear part numbers, and checkout that gets you back on the road.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <Link
            href="/shop"
            className="inline-flex h-12 items-center justify-center rounded-md bg-[var(--signal)] px-6 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[var(--signal-dark)]"
          >
            Shop parts
          </Link>
          <Link
            href="/c/semi-hd"
            className="inline-flex h-12 items-center justify-center rounded-md border border-[var(--field-bright)]/60 bg-[var(--field)]/35 px-6 text-sm font-bold uppercase tracking-wide text-white backdrop-blur transition hover:border-[var(--field-bright)] hover:bg-[var(--field)]/55"
          >
            Semi / HD
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
