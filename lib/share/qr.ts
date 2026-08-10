// ─── QR encoder ──────────────────────────────────────────────────────────────
//
// A complete QR Code Model 2 encoder in ~300 lines, byte mode, versions 1–40,
// all four error-correction levels, with the standard mask-penalty search.
//
// ── WHY THIS IS HAND-WRITTEN AND NOT A PACKAGE ───────────────────────────────
//
// The house rule is "no new dependencies except html-to-image". A QR generator
// is one of the few things small enough to write rather than install: the format
// is a frozen 2006 standard, so this file can never need a version bump, and the
// alternative (`qrcode` + `@types/qrcode`, ~50KB and a canvas shim) would ship
// on every template page for one 40-character URL.
//
// The algorithm is the well-known reference decomposition — Reed–Solomon over
// GF(256) with the primitive polynomial 0x11D, block interleaving, and the eight
// data masks scored by the four penalty rules in §8.8.2 of ISO/IEC 18004. Do not
// "simplify" any of it. In particular:
//
//   • THE MASK SEARCH IS NOT OPTIONAL. Skipping it and hard-coding mask 0 makes
//     codes that a phone can still usually read but that fail at an angle, in
//     bad light, or once printed on a card — which is exactly the case this is
//     built for. All eight masks are drawn and scored.
//
//   • THE PENALTY RULES ARE THE SPEC'S RULES. The constants 3/3/40/10 and the
//     "finder-like run" pattern are lifted from the standard verbatim. They look
//     arbitrary because they are: they encode empirical scanner behaviour.
//
//   • ERROR CORRECTION IS CHOSEN BY THE CALLER, and the printable card asks for
//     "high" on purpose. A quarter of a printed card can be creased, smudged, or
//     covered by the centre logo and the code still resolves.
//
// The output is a boolean matrix and nothing else. Rendering it — as SVG on
// screen, as canvas for the PNG download — belongs to the components.

/** Error-correction level, weakest to strongest. */
export type EcLevel = "low" | "medium" | "quartile" | "high";

const EC_ORDER: EcLevel[] = ["low", "medium", "quartile", "high"];

/** ECC codewords per block, indexed [ecLevel][version]. Index 0 is unused. */
const ECC_CODEWORDS_PER_BLOCK: number[][] = [
  [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
];

/** Number of ECC blocks, indexed [ecLevel][version]. Index 0 is unused. */
const NUM_ERROR_CORRECTION_BLOCKS: number[][] = [
  [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  [-1, 1, 1, 2, 4, 4, 4, 5, 5, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
];

// ── GF(256) ──────────────────────────────────────────────────────────────────
// Multiplication in the field used by Reed–Solomon, done the long way rather
// than with log tables. It runs once per codeword per block on a 40-character
// string; a lookup table would save microseconds nobody can measure.

function gfMultiply(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    // Multiply by x, reducing modulo the primitive polynomial x^8+x^4+x^3+x^2+1.
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}

/** The divisor polynomial for `degree` ECC codewords, leading 1 dropped. */
function rsDivisor(degree: number): number[] {
  const result: number[] = new Array(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = gfMultiply(result[j], root);
      if (j + 1 < result.length) result[j] ^= result[j + 1];
    }
    root = gfMultiply(root, 0x02);
  }
  return result;
}

function rsRemainder(data: number[], divisor: number[]): number[] {
  const result: number[] = new Array(divisor.length).fill(0);
  for (const b of data) {
    const factor = b ^ (result.shift() as number);
    result.push(0);
    for (let i = 0; i < divisor.length; i++) result[i] ^= gfMultiply(divisor[i], factor);
  }
  return result;
}

// ── Geometry ─────────────────────────────────────────────────────────────────

/** Total data + ECC modules available at a version, before format/version info. */
function rawDataModules(version: number): number {
  let result = (16 * version + 128) * version + 64;
  if (version >= 2) {
    const numAlign = Math.floor(version / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (version >= 7) result -= 36;
  }
  return result;
}

function dataCodewords(version: number, ecl: number): number {
  return (
    Math.floor(rawDataModules(version) / 8) -
    ECC_CODEWORDS_PER_BLOCK[ecl][version] * NUM_ERROR_CORRECTION_BLOCKS[ecl][version]
  );
}

/** Centre coordinates of the alignment patterns. Empty at version 1. */
function alignmentPositions(version: number): number[] {
  if (version === 1) return [];
  const numAlign = Math.floor(version / 7) + 2;
  const step =
    version === 32 ? 26 : Math.ceil((version * 4 + 4) / (numAlign * 2 - 2)) * 2;
  const result: number[] = [6];
  for (let pos = version * 4 + 17 - 7; result.length < numAlign; pos -= step) {
    result.splice(1, 0, pos);
  }
  return result;
}

// ── Encoding ─────────────────────────────────────────────────────────────────

/** UTF-8 bytes. QR byte mode is bytes, so a "€" is three of them, not one. */
function utf8Bytes(text: string): number[] {
  const out: number[] = [];
  for (const byte of new TextEncoder().encode(text)) out.push(byte);
  return out;
}

function appendBits(bits: number[], value: number, length: number): void {
  for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
}

/** Smallest version at this EC level that holds `byteLen` bytes, or null. */
function pickVersion(byteLen: number, ecl: number): number | null {
  for (let version = 1; version <= 40; version++) {
    const capacityBits = dataCodewords(version, ecl) * 8;
    // 4 mode bits + the character-count field, which widens past version 9.
    const usedBits = 4 + (version <= 9 ? 8 : 16) + byteLen * 8;
    if (usedBits <= capacityBits) return version;
  }
  return null;
}

/** Data codewords with terminator, byte padding, and the 0xEC/0x11 pad run. */
function buildCodewords(bytes: number[], version: number, ecl: number): number[] {
  const bits: number[] = [];
  appendBits(bits, 0b0100, 4); // byte mode
  appendBits(bits, bytes.length, version <= 9 ? 8 : 16);
  for (const b of bytes) appendBits(bits, b, 8);

  const capacityBits = dataCodewords(version, ecl) * 8;
  appendBits(bits, 0, Math.min(4, capacityBits - bits.length));
  appendBits(bits, 0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < capacityBits; pad ^= 0xec ^ 0x11) {
    appendBits(bits, pad, 8);
  }

  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    codewords.push(byte);
  }
  return codewords;
}

/** Split into blocks, add ECC, and interleave into the final codeword stream. */
function interleave(data: number[], version: number, ecl: number): number[] {
  const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[ecl][version];
  const eccLen = ECC_CODEWORDS_PER_BLOCK[ecl][version];
  const rawCodewords = Math.floor(rawDataModules(version) / 8);
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
  const shortBlockLen = Math.floor(rawCodewords / numBlocks);

  const blocks: number[][] = [];
  const divisor = rsDivisor(eccLen);
  for (let i = 0, k = 0; i < numBlocks; i++) {
    const dataLen = shortBlockLen - eccLen + (i < numShortBlocks ? 0 : 1);
    const dat = data.slice(k, k + dataLen);
    k += dataLen;
    const ecc = rsRemainder(dat, divisor);
    // A short block gets a placeholder codeword so every block is the same
    // length and the interleave below is a plain rectangular transpose. It is
    // appended AFTER the ECC is computed — it is not data — and skipped again
    // when the stream is read back out. Leaving it out shifts every codeword
    // after the ninth, which produces a symbol that looks right and scans as
    // garbage.
    if (i < numShortBlocks) dat.push(0);
    blocks.push(dat.concat(ecc));
  }

  const result: number[] = [];
  for (let i = 0; i < blocks[0].length; i++) {
    for (let j = 0; j < blocks.length; j++) {
      // Skip the placeholder — column `shortBlockLen - eccLen` of the short
      // blocks only.
      if (i !== shortBlockLen - eccLen || j >= numShortBlocks) result.push(blocks[j][i]);
    }
  }
  return result;
}

// ── Module placement ─────────────────────────────────────────────────────────

class Grid {
  readonly size: number;
  readonly modules: boolean[][];
  /** True where a function pattern lives, so data placement skips it. */
  readonly reserved: boolean[][];

  constructor(version: number) {
    this.size = version * 4 + 17;
    this.modules = Array.from({ length: this.size }, () => new Array(this.size).fill(false));
    this.reserved = Array.from({ length: this.size }, () => new Array(this.size).fill(false));
  }

  set(x: number, y: number, dark: boolean, isFunction: boolean): void {
    if (x < 0 || y < 0 || x >= this.size || y >= this.size) return;
    this.modules[y][x] = dark;
    if (isFunction) this.reserved[y][x] = true;
  }
}

function drawFunctionPatterns(grid: Grid, version: number, ecl: number): void {
  const size = grid.size;

  // Timing lines.
  for (let i = 0; i < size; i++) {
    grid.set(6, i, i % 2 === 0, true);
    grid.set(i, 6, i % 2 === 0, true);
  }

  // Three finders, each with its separator ring.
  for (const [cx, cy] of [
    [3, 3],
    [size - 4, 3],
    [3, size - 4],
  ]) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < size && y >= 0 && y < size) {
          grid.set(x, y, dist !== 2 && dist !== 4, true);
        }
      }
    }
  }

  // Alignment patterns, minus the three that would collide with the finders.
  const align = alignmentPositions(version);
  for (let i = 0; i < align.length; i++) {
    for (let j = 0; j < align.length; j++) {
      const corner =
        (i === 0 && j === 0) ||
        (i === 0 && j === align.length - 1) ||
        (i === align.length - 1 && j === 0);
      if (corner) continue;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          grid.set(align[j] + dx, align[i] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1, true);
        }
      }
    }
  }

  // Format info is written for real after masking; reserve its cells now so the
  // data pass walks around them.
  drawFormatBits(grid, ecl, 0, true);

  if (version >= 7) drawVersionBits(grid, version);
}

/** The 15-bit format field, BCH(15,5) with generator 0x537, XOR-masked 0x5412. */
function drawFormatBits(grid: Grid, ecl: number, mask: number, reserveOnly: boolean): void {
  // The standard's own level ordering is M, L, H, Q — not the strength order
  // this file uses everywhere else. Mapping it here keeps that oddity in one
  // place instead of leaking a second level enum through the whole module.
  const eclBits = [0b01, 0b00, 0b11, 0b10][ecl];
  const data = (eclBits << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const bits = ((data << 10) | rem) ^ 0x5412;

  const size = grid.size;
  const bit = (i: number) => ((bits >>> i) & 1) === 1;
  const put = (x: number, y: number, v: boolean) => grid.set(x, y, reserveOnly ? false : v, true);

  // First copy, wrapped around the top-left finder.
  for (let i = 0; i <= 5; i++) put(8, i, bit(i));
  put(8, 7, bit(6));
  put(8, 8, bit(7));
  put(7, 8, bit(8));
  for (let i = 9; i < 15; i++) put(14 - i, 8, bit(i));

  // Second copy, split between the other two finders.
  for (let i = 0; i < 8; i++) put(size - 1 - i, 8, bit(i));
  for (let i = 8; i < 15; i++) put(8, size - 15 + i, bit(i));

  // The dark module. Always set, at a fixed position, on every symbol.
  grid.set(8, size - 8, true, true);
}

/** The 18-bit version field, BCH(18,6) with generator 0x1F25. Version 7+ only. */
function drawVersionBits(grid: Grid, version: number): void {
  let rem = version;
  for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
  const bits = (version << 12) | rem;

  for (let i = 0; i < 18; i++) {
    const dark = ((bits >>> i) & 1) === 1;
    const a = grid.size - 11 + (i % 3);
    const b = Math.floor(i / 3);
    grid.set(a, b, dark, true);
    grid.set(b, a, dark, true);
  }
}

/** The zigzag walk: two-module columns, right to left, skipping column 6. */
function drawCodewords(grid: Grid, codewords: number[]): void {
  const size = grid.size;
  let i = 0; // bit index into the stream

  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5; // the vertical timing line is not a data column
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!grid.reserved[y][x] && i < codewords.length * 8) {
          grid.modules[y][x] = ((codewords[i >>> 3] >>> (7 - (i & 7))) & 1) !== 0;
          i++;
        }
        // Remaining modules past the end of the stream stay light, which is
        // what the spec's "remainder bits" are: always zero, never encoded.
      }
    }
  }
}

const MASK_FNS: Array<(x: number, y: number) => boolean> = [
  (x, y) => (x + y) % 2 === 0,
  (_x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

function applyMask(grid: Grid, mask: number): void {
  const fn = MASK_FNS[mask];
  for (let y = 0; y < grid.size; y++) {
    for (let x = 0; x < grid.size; x++) {
      if (!grid.reserved[y][x] && fn(x, y)) grid.modules[y][x] = !grid.modules[y][x];
    }
  }
}

/**
 * The four penalty rules of §8.8.2. Lower is better.
 *
 * N1 runs of five or more, N2 2×2 blocks, N3 finder-lookalikes anywhere in the
 * symbol, N4 deviation from a 50/50 dark ratio.
 */
function penalty(grid: Grid): number {
  const size = grid.size;
  const N1 = 3;
  const N2 = 3;
  const N3 = 40;
  const N4 = 10;
  let result = 0;

  /**
   * The last seven run lengths, newest first. The finder test needs five runs
   * plus the gap on either side, which is why it is seven and not five.
   */
  const addHistory = (runLength: number, history: number[]): void => {
    // The very first run of a line is preceded by the quiet zone, so it counts
    // as `size` modules wider than it measures.
    if (history[0] === 0) runLength += size;
    history.pop();
    history.unshift(runLength);
  };

  /** How many 1:1:3:1:1 finder lookalikes the current history contains (0–2). */
  const countPatterns = (h: number[]): number => {
    const n = h[1];
    const core = n > 0 && h[2] === n && h[3] === n * 3 && h[4] === n && h[5] === n;
    return (
      (core && h[0] >= n * 4 && h[6] >= n ? 1 : 0) + (core && h[6] >= n * 4 && h[0] >= n ? 1 : 0)
    );
  };

  const terminate = (runColor: boolean, runLength: number, history: number[]): number => {
    let len = runLength;
    if (runColor) {
      addHistory(len, history);
      len = 0;
    }
    len += size; // the quiet zone past the end of the line
    addHistory(len, history);
    return countPatterns(history);
  };

  const scanLine = (get: (i: number) => boolean) => {
    let runColor = false;
    let runLength = 0;
    const history = [0, 0, 0, 0, 0, 0, 0];

    for (let i = 0; i < size; i++) {
      const color = get(i);
      if (color === runColor) {
        runLength++;
        if (runLength === 5) result += N1;
        else if (runLength > 5) result++;
      } else {
        addHistory(runLength, history);
        // Only scored at the end of a light run, so each pattern counts once.
        if (!runColor) result += countPatterns(history) * N3;
        runColor = color;
        runLength = 1;
      }
    }
    result += terminate(runColor, runLength, history) * N3;
  };

  for (let y = 0; y < size; y++) scanLine((x) => grid.modules[y][x]);
  for (let x = 0; x < size; x++) scanLine((y) => grid.modules[y][x]);

  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const c = grid.modules[y][x];
      if (
        c === grid.modules[y][x + 1] &&
        c === grid.modules[y + 1][x] &&
        c === grid.modules[y + 1][x + 1]
      ) {
        result += N2;
      }
    }
  }

  let dark = 0;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (grid.modules[y][x]) dark++;

  const total = size * size;
  // Ten points per 5% the dark ratio strays from half.
  const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
  result += Math.max(k, 0) * N4;

  return result;
}

// ── Public API ───────────────────────────────────────────────────────────────

export interface QrMatrix {
  /** Side length in modules, 21 at version 1 up to 177 at version 40. */
  size: number;
  /** Row-major; `modules[y][x]` is true for a dark module. */
  modules: boolean[][];
  /**
   * True where the module belongs to a function pattern — the three finders and
   * their separators, the timing lines, the alignment patterns, and the
   * format/version fields.
   *
   * Exposed because the photo renderer has to leave these alone. A scanner
   * locates and orients a symbol from the finders and the timing lines BEFORE
   * it reads a single data module, so those are the one part that can never be
   * tinted towards a photograph: soften them and the code stops being found at
   * all, which fails differently and much worse than a code that is found and
   * misread.
   */
  functionModules: boolean[][];
  version: number;
  ecLevel: EcLevel;
}

/**
 * Encode `text` as a QR matrix, or return null if it does not fit at any
 * version (roughly 1,270 bytes at "high", 2,950 at "low").
 *
 * Never throws. A share sheet whose QR tab crashes the page is strictly worse
 * than one that says the link is too long to encode.
 */
export function encodeQr(text: string, ecLevel: EcLevel = "high"): QrMatrix | null {
  if (!text) return null;

  const ecl = EC_ORDER.indexOf(ecLevel);
  if (ecl < 0) return null;

  try {
    const bytes = utf8Bytes(text);
    const version = pickVersion(bytes.length, ecl);
    if (version === null) return null;

    const codewords = interleave(buildCodewords(bytes, version, ecl), version, ecl);

    // Draw once per mask and keep the best. The masks differ only in which data
    // modules are inverted, so the function patterns are redrawn each time to
    // keep the reserved map honest rather than un-masking in place.
    let best: Grid | null = null;
    let bestPenalty = Infinity;
    let bestMask = 0;

    for (let mask = 0; mask < 8; mask++) {
      const grid = new Grid(version);
      drawFunctionPatterns(grid, version, ecl);
      drawCodewords(grid, codewords);
      applyMask(grid, mask);
      drawFormatBits(grid, ecl, mask, false);

      const score = penalty(grid);
      if (score < bestPenalty) {
        bestPenalty = score;
        best = grid;
        bestMask = mask;
      }
    }

    if (!best) return null;
    void bestMask;

    return {
      size: best.size,
      modules: best.modules,
      functionModules: best.reserved,
      version,
      ecLevel,
    };
  } catch {
    return null;
  }
}

/**
 * The matrix as an SVG path `d` string, one module per unit square, with an
 * `origin`-module quiet zone already applied.
 *
 * One path for the whole symbol rather than N² `<rect>` elements: a version-6
 * code is 41×41 and the rect version puts ~800 nodes in the DOM, which is
 * enough to make the sheet's open animation stutter on a mid-range phone.
 */
export function qrPath(matrix: QrMatrix, quietZone = 2): string {
  const parts: string[] = [];
  for (let y = 0; y < matrix.size; y++) {
    for (let x = 0; x < matrix.size; x++) {
      if (matrix.modules[y][x]) {
        parts.push(`M${x + quietZone} ${y + quietZone}h1v1h-1z`);
      }
    }
  }
  return parts.join("");
}

/** Side length of the rendered symbol in module units, quiet zone included. */
export const qrExtent = (matrix: QrMatrix, quietZone = 2): number =>
  matrix.size + quietZone * 2;
