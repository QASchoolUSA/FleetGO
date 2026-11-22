"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type LightboxState = {
  title: string;
  urls: string[];
  initialIndex?: number;
};

function PhotoLightboxModal({
  state,
  onClose,
}: {
  state: LightboxState;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(state.initialIndex ?? 0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") {
        setIndex((i) => (i + 1) % state.urls.length);
      }
      if (e.key === "ArrowLeft") {
        setIndex((i) => (i - 1 + state.urls.length) % state.urls.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.urls.length, onClose]);

  const safeIndex = Math.min(index, state.urls.length - 1);
  const currentUrl = state.urls[safeIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photos for ${state.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0f172a] text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{state.title}</p>
            <p className="text-xs text-white/60 tabular-nums">
              Photo {safeIndex + 1} of {state.urls.length}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close photo viewer"
            className="rounded-lg p-1.5 text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative flex min-h-[320px] flex-1 items-center justify-center bg-black/50 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentUrl}
            alt={`${state.title} — photo ${safeIndex + 1}`}
            className="max-h-[65vh] max-w-full rounded-lg object-contain"
          />

          {state.urls.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={() =>
                  setIndex((i) => (i - 1 + state.urls.length) % state.urls.length)
                }
                className="absolute left-3 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={() => setIndex((i) => (i + 1) % state.urls.length)}
                className="absolute right-3 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}
        </div>

        {state.urls.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto border-t border-white/10 bg-[#0b1220] px-4 py-3">
            {state.urls.map((url, idx) => (
              <button
                key={url}
                type="button"
                onClick={() => setIndex(idx)}
                className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  idx === safeIndex
                    ? "border-[var(--field-bright)] opacity-100"
                    : "border-transparent opacity-60 hover:opacity-90"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function PhotoLightbox({
  state,
  onClose,
}: {
  state: LightboxState | null;
  onClose: () => void;
}) {
  if (!state || state.urls.length === 0) return null;
  const key = `${state.title}:${state.initialIndex ?? 0}:${state.urls[0]}`;
  return <PhotoLightboxModal key={key} state={state} onClose={onClose} />;
}
