// Countries for the wishlist phone field: India first, then the places most of
// our visitors write from, then everyone else alphabetically. `min`/`max` are
// national-number digit counts, used only to guide typing — the server has the
// final say (controllers/wishlist.controller.ts → parsePhone).

export interface Country { iso: string; name: string; dial: string; min: number; max: number }

const C = (iso: string, name: string, dial: string, min = 6, max = 14): Country => ({ iso, name, dial, min, max });

export const COUNTRIES: Country[] = [
  C("IN", "India", "+91", 10, 10),
  C("US", "United States", "+1", 10, 10),
  C("GB", "United Kingdom", "+44", 9, 10),
  C("AE", "United Arab Emirates", "+971", 8, 9),
  C("CA", "Canada", "+1", 10, 10),
  C("AU", "Australia", "+61", 9, 9),
  C("SG", "Singapore", "+65", 8, 8),
  C("SA", "Saudi Arabia", "+966", 9, 9),
  C("NP", "Nepal", "+977", 9, 10),
  C("BD", "Bangladesh", "+880", 10, 10),
  C("LK", "Sri Lanka", "+94", 9, 9),
  C("QA", "Qatar", "+974", 8, 8),
  C("KW", "Kuwait", "+965", 8, 8),
  C("OM", "Oman", "+968", 8, 8),
  C("BH", "Bahrain", "+973", 8, 8),
  C("NZ", "New Zealand", "+64", 8, 10),
  C("MY", "Malaysia", "+60", 9, 10),
  C("DE", "Germany", "+49", 10, 11),
  C("FR", "France", "+33", 9, 9),
  C("NL", "Netherlands", "+31", 9, 9),
  C("IE", "Ireland", "+353", 9, 9),
  C("IT", "Italy", "+39", 9, 10),
  C("ES", "Spain", "+34", 9, 9),
  C("BE", "Belgium", "+32", 9, 9),
  C("CH", "Switzerland", "+41", 9, 9),
  C("SE", "Sweden", "+46", 7, 9),
  C("NO", "Norway", "+47", 8, 8),
  C("DK", "Denmark", "+45", 8, 8),
  C("FI", "Finland", "+358", 9, 10),
  C("PL", "Poland", "+48", 9, 9),
  C("PT", "Portugal", "+351", 9, 9),
  C("AT", "Austria", "+43", 10, 11),
  C("JP", "Japan", "+81", 10, 10),
  C("KR", "South Korea", "+82", 9, 10),
  C("CN", "China", "+86", 11, 11),
  C("HK", "Hong Kong", "+852", 8, 8),
  C("TH", "Thailand", "+66", 9, 9),
  C("ID", "Indonesia", "+62", 9, 12),
  C("PH", "Philippines", "+63", 10, 10),
  C("VN", "Vietnam", "+84", 9, 10),
  C("PK", "Pakistan", "+92", 10, 10),
  C("AF", "Afghanistan", "+93", 9, 9),
  C("MV", "Maldives", "+960", 7, 7),
  C("BT", "Bhutan", "+975", 8, 8),
  C("MU", "Mauritius", "+230", 8, 8),
  C("FJ", "Fiji", "+679", 7, 7),
  C("ZA", "South Africa", "+27", 9, 9),
  C("NG", "Nigeria", "+234", 10, 10),
  C("KE", "Kenya", "+254", 9, 9),
  C("EG", "Egypt", "+20", 10, 10),
  C("TZ", "Tanzania", "+255", 9, 9),
  C("UG", "Uganda", "+256", 9, 9),
  C("BR", "Brazil", "+55", 10, 11),
  C("MX", "Mexico", "+52", 10, 10),
  C("AR", "Argentina", "+54", 10, 10),
  C("TT", "Trinidad and Tobago", "+1", 10, 10),
  C("GY", "Guyana", "+592", 7, 7),
  C("RU", "Russia", "+7", 10, 10),
  C("TR", "Turkey", "+90", 10, 10),
  C("IL", "Israel", "+972", 9, 9),
];

/** 🇮🇳 from "IN" — regional-indicator letters. */
export function flagOf(iso: string): string {
  return String.fromCodePoint(...[...iso.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

/** A first guess at the visitor's country: time zone, then browser language, then India. */
export function guessCountry(): Country {
  const byIso = (iso?: string) => COUNTRIES.find((c) => c.iso === iso);
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (/Kolkata|Calcutta/.test(tz)) return COUNTRIES[0];
    const tzMap: Record<string, string> = {
      "Asia/Dubai": "AE", "Europe/London": "GB", "Asia/Singapore": "SG", "Asia/Riyadh": "SA", "Asia/Kathmandu": "NP",
      "Asia/Dhaka": "BD", "Asia/Colombo": "LK", "Asia/Qatar": "QA", "Asia/Kuwait": "KW", "Asia/Muscat": "OM",
      "Australia/Sydney": "AU", "Australia/Melbourne": "AU", "America/Toronto": "CA", "America/Vancouver": "CA",
    };
    const t = byIso(tzMap[tz]);
    if (t) return t;
    if (tz.startsWith("America/")) return byIso("US")!;
    const region = (navigator.language || "").split("-")[1];
    const l = byIso(region?.toUpperCase());
    if (l) return l;
  } catch {
    /* fall through */
  }
  return COUNTRIES[0];
}
