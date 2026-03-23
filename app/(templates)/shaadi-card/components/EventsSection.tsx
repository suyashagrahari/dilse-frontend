"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, CalendarDays, ExternalLink } from "lucide-react";
import type { ShaadiData } from "./types";

const C_ACCENT = "#AB1C3E";
const C_MED    = "#CB6B82";
const C_DARK   = "#6D2B3B";
const C_BG     = "#FDF5F0";
const C_CARD   = "#FFFAF8";

interface Props {
  data: ShaadiData;
}

export default memo(function EventsSection({ data }: Props) {
  const activeEvents = data.events.filter((ev) => !ev.disabled);
  const disabledEvents = data.events.filter((ev) => ev.disabled);

  return (
    <section
      className="min-h-screen py-10 px-4 pb-24 lg:pb-10"
      style={{ background: `linear-gradient(180deg, ${C_BG} 0%, #FAE8E8 100%)` }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto"
      >
        {/* Section header */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
            style={{ background: `${C_ACCENT}18`, border: `1px solid ${C_ACCENT}30` }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <CalendarDays size={13} style={{ color: C_ACCENT }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: C_ACCENT }}>Celebrations</span>
          </motion.div>
          <h2 className="text-2xl font-bold" style={{ color: C_DARK }}>Wedding Events</h2>
          <p className="text-sm mt-1" style={{ color: C_MED }}>Mark your calendar for these special moments</p>
        </div>

        {/* Events timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-5 top-0 bottom-0 w-px hidden sm:block"
            style={{ background: `linear-gradient(to bottom, ${C_ACCENT}40, ${C_MED}20, transparent)` }}
          />

          <div className="space-y-4">
            {activeEvents.map((ev, idx) => (
              <motion.div
                key={ev.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.08, duration: 0.4 }}
                className="relative sm:pl-14"
              >
                {/* Timeline dot */}
                <div
                  className="hidden sm:flex absolute left-0 top-4 w-10 h-10 rounded-full items-center justify-center text-lg shadow-md"
                  style={{ background: `${C_CARD}`, border: `2px solid ${C_ACCENT}30`, boxShadow: `0 0 0 4px ${C_ACCENT}10` }}
                >
                  {ev.icon}
                </div>

                <div
                  className="rounded-2xl p-4 shadow-sm"
                  style={{ background: C_CARD, border: `1px solid ${C_MED}25` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl sm:hidden">{ev.icon}</span>
                      <div>
                        <h3 className="text-sm font-bold" style={{ color: C_DARK }}>{ev.name}</h3>
                        <p className="text-[11px]" style={{ color: C_MED }}>{ev.hindi}</p>
                      </div>
                    </div>
                    <div
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ background: `${C_ACCENT}15`, color: C_ACCENT }}
                    >
                      {ev.date}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-2">
                    <div className="flex items-center gap-1.5">
                      <Clock size={11} style={{ color: C_MED }} />
                      <span className="text-xs" style={{ color: C_DARK }}>{ev.time}</span>
                    </div>
                    {ev.venue && (
                      <div className="flex items-center gap-1.5">
                        <MapPin size={11} style={{ color: C_MED }} />
                        <span className="text-xs" style={{ color: C_DARK }}>{ev.venue}</span>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.venue + " " + data.venue)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-0.5"
                        >
                          <ExternalLink size={10} style={{ color: C_MED }} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Disabled events */}
        {disabledEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: C_MED }}>
              Not happening this time
            </p>
            <div className="flex flex-wrap gap-2">
              {disabledEvents.map((ev) => (
                <div
                  key={ev.name}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full opacity-40"
                  style={{ background: `${C_ACCENT}10`, border: `1px solid ${C_ACCENT}20` }}
                >
                  <span className="text-sm">{ev.icon}</span>
                  <span className="text-xs font-medium" style={{ color: C_DARK }}>{ev.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
});
