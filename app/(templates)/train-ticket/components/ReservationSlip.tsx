"use client";

// ─── SCREEN 2 — the Electronic Reservation Slip ──────────────────────────────
//
// Everything lives inside one hard 1px ruled box grid. No radii, no shadows, no
// gradients but the print banding, and colour appears exactly nowhere: a slip
// that has been "designed" stops being funny, because the joke is the register,
// not the styling.
//
// LEGAL: the crest is invented (two rails converging into a heart) and the
// authority is the fictional Indian Hearts Railway / IHRCTC. No real carrier or
// ticketing portal is referenced here, in the markup, or in the file names.

import { forwardRef } from "react";
import {
  type TicketData,
  fmtDateSlip,
  fmtDateTime,
  fmtTime,
} from "./types";
import { Barcode, IhrctcMark, PnrGlyphs } from "./marks";
import { BANDING, Cell, DEVANAGARI, INK, MONO, PAPER, RULE, TonerStreak } from "./Paper";
import { useCountdown } from "../hooks/useTicketClock";

const hair = `1px solid ${RULE}`;

function ColHead({ children, width }: { children: React.ReactNode; width?: number }) {
  return (
    <th
      style={{
        width,
        borderRight: hair,
        borderBottom: hair,
        padding: "3px 4px",
        fontSize: 7,
        letterSpacing: "0.06em",
        fontWeight: 700,
        textAlign: "left",
        lineHeight: 1.3,
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, width, style }: { children: React.ReactNode; width?: number; style?: React.CSSProperties }) {
  return (
    <td
      style={{
        width,
        borderRight: hair,
        borderBottom: hair,
        padding: "4px",
        fontSize: 9,
        lineHeight: 1.35,
        verticalAlign: "top",
        wordBreak: "break-word",
        ...style,
      }}
    >
      {children}
    </td>
  );
}

const ReservationSlip = forwardRef<HTMLDivElement, { data: TicketData }>(function ReservationSlip({ data }, ref) {
  const countdown = useCountdown(data.departureAt);
  const seats = data.passengers;

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: "100%",
        background: PAPER,
        backgroundImage: BANDING,
        color: INK,
        fontFamily: MONO,
        border: hair,
        overflow: "hidden",
      }}
    >
      <TonerStreak />

      {/* ── header ────────────────────────────────────────────────────────────
          Nudged 1px left of the body block. Real two-pass printing never lines
          up perfectly, and a perfectly registered header is the loudest tell. */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 8px 7px",
          borderBottom: hair,
          marginLeft: -1,
        }}
      >
        <IhrctcMark size={30} />
        <div style={{ flex: 1, textAlign: "center", minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", lineHeight: 1.25 }}>
            ELECTRONIC RESERVATION SLIP (ERS)
          </div>
          <div style={{ fontFamily: DEVANAGARI, fontSize: 9, lineHeight: 1.35, color: "#333" }}>
            इलेक्ट्रॉनिक आरक्षण पर्ची
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: 6.5, lineHeight: 1.35, letterSpacing: "0.04em", color: "#333", width: 62 }}>
          INDIAN
          <br />
          HEARTS
          <br />
          RAILWAY
        </div>
      </div>

      {/* ── identity grid ─────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: hair }}>
        <Cell label="PNR" style={{ borderRight: hair }} valueStyle={{ fontSize: 12, letterSpacing: "0.06em" }}>
          <PnrGlyphs pnr={data.pnr} />
        </Cell>
        <Cell label="TRAIN No. / NAME" style={{ gridColumn: "span 2" }}>
          {data.trainNo} / {data.trainName}
        </Cell>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: hair }}>
        <Cell label="QUOTA" style={{ borderRight: hair }}>{data.quota}</Cell>
        <Cell label="CLASS" style={{ borderRight: hair }}>{data.classCode}</Cell>
        <Cell label="DATE OF JOURNEY" valueStyle={{ fontSize: 10 }}>{fmtDateSlip(data.departureAt)}</Cell>
      </div>

      {/* ── from / to ─────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: hair }}>
        <div style={{ borderRight: hair, padding: "5px 6px" }}>
          <div style={{ fontSize: 7, letterSpacing: "0.1em", color: "#444" }}>FROM</div>
          <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: "0.08em", lineHeight: 1.15 }}>{data.from.code}</div>
          <div style={{ fontSize: 9, lineHeight: 1.4 }}>{data.from.name}</div>
          <div style={{ fontSize: 9, lineHeight: 1.4 }}>DEP {fmtTime(data.departureAt)}</div>
        </div>
        <div style={{ padding: "5px 6px" }}>
          <div style={{ fontSize: 7, letterSpacing: "0.1em", color: "#444" }}>TO</div>
          <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: "0.08em", lineHeight: 1.15 }}>{data.to.code}</div>
          <div style={{ fontSize: 9, lineHeight: 1.4 }}>{data.to.name}</div>
          <div style={{ fontSize: 9, lineHeight: 1.4 }}>ARR {fmtTime(data.arrivalAt)}</div>
        </div>
      </div>

      <div style={{ borderBottom: hair, padding: "4px 6px", fontSize: 8, lineHeight: 1.4, color: "#222" }}>
        BOARDING AT {data.from.name.toUpperCase()} ({data.from.code}) · {fmtDateTime(data.departureAt)}
      </div>

      {/* ── passengers ────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: hair, padding: "4px 6px", fontSize: 7, letterSpacing: "0.12em", background: "rgba(0,0,0,.035)" }}>
        PASSENGER DETAILS
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <thead>
          <tr>
            <ColHead width={20}>S.N</ColHead>
            <ColHead>NAME</ColHead>
            <ColHead width={24}>AGE</ColHead>
            <ColHead width={24}>SEX</ColHead>
            <ColHead width={58}>BOOKING STATUS</ColHead>
            <ColHead width={86}>CURRENT STATUS</ColHead>
          </tr>
        </thead>
        <tbody>
          {seats.length === 0 ? (
            <tr>
              <Td style={{ borderRight: "none" }}>
                <span style={{ fontSize: 8.5, color: "#555" }}>
                  Chart not prepared — passenger details are withheld until the chart is prepared.
                </span>
              </Td>
            </tr>
          ) : (
            seats.map((p, i) => (
              <tr key={i}>
                <Td width={20}>{i + 1}</Td>
                <Td>{p.name}</Td>
                <Td width={24}>{p.age || "—"}</Td>
                <Td width={24}>{p.gender}</Td>
                <Td width={58}>{p.bookingStatus}</Td>
                <Td width={86}>
                  <div style={{ fontWeight: 700 }}>{p.currentStatus}</div>
                  {(p.coach || p.seat) && (
                    <div style={{ fontSize: 8.5 }}>
                      {p.coach} {p.seat}
                    </div>
                  )}
                  {p.berth && <div style={{ fontSize: 7.5, color: "#333" }}>{p.berth}</div>}
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ── fare ──────────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: hair, padding: "4px 6px", fontSize: 7, letterSpacing: "0.12em", background: "rgba(0,0,0,.035)" }}>
        FARE DETAILS
      </div>
      <div style={{ borderBottom: hair, padding: "5px 6px 6px" }}>
        {data.fare.map((f, i) => {
          const last = i === data.fare.length - 1;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                fontSize: last ? 10 : 9,
                fontWeight: last ? 700 : 400,
                lineHeight: 1.6,
                borderTop: last ? hair : undefined,
                marginTop: last ? 3 : 0,
                paddingTop: last ? 3 : 0,
              }}
            >
              <span style={{ color: "#333" }}>{f.label}</span>
              <span style={{ textAlign: "right", wordBreak: "break-word" }}>{f.value}</span>
            </div>
          );
        })}
      </div>

      {/* ── boarding countdown ─────────────────────────────────────────────
          The only reason anyone reopens this page. Clamped at zero by the hook,
          so the band flips to DEPARTED rather than ever printing negative time. */}
      <div
        style={{
          borderBottom: hair,
          padding: "7px 6px",
          textAlign: "center",
          background: "rgba(0,0,0,.05)",
        }}
      >
        <div style={{ fontSize: 7, letterSpacing: "0.16em", color: "#444" }}>
          {countdown.elapsed ? "STATUS" : "DEPARTURE IN"}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.1em", lineHeight: 1.5 }}>
          {!countdown.ready ? "--d --h --m --s" : countdown.elapsed ? "DEPARTED" : countdown.text}
        </div>
      </div>

      {/* ── barcode + reference ───────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, padding: "8px 6px 6px", borderBottom: hair }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Barcode seed={data.pnr} height={28} />
          <div style={{ fontSize: 7, letterSpacing: "0.2em", marginTop: 2 }}>{data.pnr.replace(/\s/g, "")}</div>
        </div>
        <div style={{ fontSize: 6.5, lineHeight: 1.4, textAlign: "right", color: "#333", width: 108 }}>
          IHRCTC/ERS/{data.trainNo}
          <br />
          COUNTERFOIL — RETAIN
          <br />
          UNTIL END OF JOURNEY
        </div>
      </div>

      {/* ── fine print ─────────────────────────────────────────────────────
          6.5px, justified, one continuous run. It has to be genuinely unreadable
          at a glance — that is what makes people pinch-zoom, and the zoom is
          where the sincerity is hiding. If this is comfortable, it is too big. */}
      <div
        style={{
          padding: "6px 6px 8px",
          fontSize: 6.5,
          lineHeight: 1.35,
          textAlign: "justify",
          color: "#1a1a1a",
          hyphens: "auto",
        }}
      >
        <span style={{ letterSpacing: "0.1em", fontWeight: 700 }}>CONDITIONS OF CARRIAGE — </span>
        {data.finePrint.join(" · ")}
      </div>
    </div>
  );
});

export default ReservationSlip;
