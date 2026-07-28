"use client";

import { Minus } from "lucide-react";
import { FLOWERS, bqMedia, type BouquetMode } from "./assets";
import type { StemCount } from "./types";

/** Grid of the 12 blooms — tap a tile to add one, tap the − to remove one. */
export default function FlowerTray({
  mode,
  flowers,
  onAdd,
  onRemove,
  disableAdd,
}: {
  mode: BouquetMode;
  flowers: StemCount[];
  onAdd: (id: number) => void;
  onRemove: (id: number) => void;
  /** True when the max bloom count is reached (adding is blocked). */
  disableAdd: boolean;
}) {
  const countOf = (id: number) => flowers.find((f) => f.id === id)?.count ?? 0;

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
      {FLOWERS.map((f) => {
        const count = countOf(f.id);
        const selected = count > 0;
        return (
          <div key={f.id} className="relative">
            <button
              type="button"
              onClick={() => onAdd(f.id)}
              disabled={disableAdd && !selected}
              title={`${f.name} — ${f.meaning} · ${f.birthMonth}`}
              aria-label={`Add ${f.name}. ${f.meaning}. Currently ${count} in bouquet.`}
              className="bq-chip w-full flex flex-col items-center gap-1 p-2 disabled:opacity-40"
              style={{
                background: selected ? "rgba(184,164,240,0.16)" : "#fffdf9",
                borderColor: selected ? "#8b6fd4" : "#2b2440",
                boxShadow: selected ? "3px 4px 0 rgba(139,111,212,0.28)" : "2px 3px 0 rgba(43,36,64,0.12)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bqMedia(mode, `${f.key}.webp`)}
                alt={f.name}
                width={52}
                height={52}
                draggable={false}
                style={{ width: 52, height: 52, objectFit: "contain" }}
              />
              <span className="bq-display" style={{ fontSize: 11, fontWeight: 700, color: "#2b2440" }}>{f.name}</span>
              <span style={{ fontSize: 8.5, letterSpacing: "0.04em", color: "#7a7191", textTransform: "uppercase" }}>{f.meaning}</span>
            </button>

            {selected && (
              <>
                <span
                  className="bq-display"
                  aria-hidden
                  style={{ position: "absolute", top: -7, right: -7, minWidth: 22, height: 22, padding: "0 5px", borderRadius: 999, display: "grid", placeItems: "center", background: "#ff5f96", color: "#fff", border: "2px solid #2b2440", fontSize: 11, fontWeight: 800 }}
                >
                  {count}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(f.id)}
                  aria-label={`Remove one ${f.name}`}
                  style={{ position: "absolute", bottom: -7, right: -7, width: 22, height: 22, borderRadius: 999, display: "grid", placeItems: "center", background: "#fffdf9", color: "#2b2440", border: "2px solid #2b2440", cursor: "pointer" }}
                >
                  <Minus size={12} />
                </button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
