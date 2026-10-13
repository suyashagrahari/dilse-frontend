// How far apart are we? A small built-in table of the cities long-distance
// couples (mostly Indian, at home and abroad) actually live in, so a sender who
// leaves "km" at 0 still gets a real number and, across time zones, two
// clocks. Unknown cities simply show no number ("too many kilometres").

type City = readonly [lat: number, lon: number, tz: string];

const C: Record<string, City> = {
  // India
  mumbai: [19.076, 72.8777, "Asia/Kolkata"],
  delhi: [28.6139, 77.209, "Asia/Kolkata"],
  bengaluru: [12.9716, 77.5946, "Asia/Kolkata"],
  hyderabad: [17.385, 78.4867, "Asia/Kolkata"],
  chennai: [13.0827, 80.2707, "Asia/Kolkata"],
  kolkata: [22.5726, 88.3639, "Asia/Kolkata"],
  pune: [18.5204, 73.8567, "Asia/Kolkata"],
  ahmedabad: [23.0225, 72.5714, "Asia/Kolkata"],
  jaipur: [26.9124, 75.7873, "Asia/Kolkata"],
  lucknow: [26.8467, 80.9462, "Asia/Kolkata"],
  kanpur: [26.4499, 80.3319, "Asia/Kolkata"],
  noida: [28.5355, 77.391, "Asia/Kolkata"],
  gurugram: [28.4595, 77.0266, "Asia/Kolkata"],
  chandigarh: [30.7333, 76.7794, "Asia/Kolkata"],
  indore: [22.7196, 75.8577, "Asia/Kolkata"],
  bhopal: [23.2599, 77.4126, "Asia/Kolkata"],
  nagpur: [21.1458, 79.0882, "Asia/Kolkata"],
  surat: [21.1702, 72.8311, "Asia/Kolkata"],
  vadodara: [22.3072, 73.1812, "Asia/Kolkata"],
  patna: [25.5941, 85.1376, "Asia/Kolkata"],
  ranchi: [23.3441, 85.3096, "Asia/Kolkata"],
  bhubaneswar: [20.2961, 85.8245, "Asia/Kolkata"],
  guwahati: [26.1445, 91.7362, "Asia/Kolkata"],
  dehradun: [30.3165, 78.0322, "Asia/Kolkata"],
  varanasi: [25.3176, 82.9739, "Asia/Kolkata"],
  prayagraj: [25.4358, 81.8463, "Asia/Kolkata"],
  agra: [27.1767, 78.0081, "Asia/Kolkata"],
  amritsar: [31.634, 74.8723, "Asia/Kolkata"],
  ludhiana: [30.901, 75.8573, "Asia/Kolkata"],
  jammu: [32.7266, 74.857, "Asia/Kolkata"],
  srinagar: [34.0837, 74.7973, "Asia/Kolkata"],
  shimla: [31.1048, 77.1734, "Asia/Kolkata"],
  goa: [15.4909, 73.8278, "Asia/Kolkata"],
  kochi: [9.9312, 76.2673, "Asia/Kolkata"],
  thiruvananthapuram: [8.5241, 76.9366, "Asia/Kolkata"],
  coimbatore: [11.0168, 76.9558, "Asia/Kolkata"],
  mysuru: [12.2958, 76.6394, "Asia/Kolkata"],
  mangaluru: [12.9141, 74.856, "Asia/Kolkata"],
  visakhapatnam: [17.6868, 83.2185, "Asia/Kolkata"],
  vijayawada: [16.5062, 80.648, "Asia/Kolkata"],
  madurai: [9.9252, 78.1198, "Asia/Kolkata"],
  raipur: [21.2514, 81.6296, "Asia/Kolkata"],
  udaipur: [24.5854, 73.7125, "Asia/Kolkata"],
  jodhpur: [26.2389, 73.0243, "Asia/Kolkata"],
  nashik: [19.9975, 73.7898, "Asia/Kolkata"],
  aurangabad: [19.8762, 75.3433, "Asia/Kolkata"],
  manipal: [13.3525, 74.7928, "Asia/Kolkata"],
  vellore: [12.9165, 79.1325, "Asia/Kolkata"],
  kota: [25.2138, 75.8648, "Asia/Kolkata"],
  meerut: [28.9845, 77.7064, "Asia/Kolkata"],
  // Nearby
  kathmandu: [27.7172, 85.324, "Asia/Kathmandu"],
  dhaka: [23.8103, 90.4125, "Asia/Dhaka"],
  colombo: [6.9271, 79.8612, "Asia/Colombo"],
  karachi: [24.8607, 67.0011, "Asia/Karachi"],
  lahore: [31.5204, 74.3587, "Asia/Karachi"],
  // Middle East
  dubai: [25.2048, 55.2708, "Asia/Dubai"],
  "abu dhabi": [24.4539, 54.3773, "Asia/Dubai"],
  doha: [25.2854, 51.531, "Asia/Qatar"],
  riyadh: [24.7136, 46.6753, "Asia/Riyadh"],
  muscat: [23.588, 58.3829, "Asia/Muscat"],
  kuwait: [29.3759, 47.9774, "Asia/Kuwait"],
  // Asia-Pacific
  singapore: [1.3521, 103.8198, "Asia/Singapore"],
  "kuala lumpur": [3.139, 101.6869, "Asia/Kuala_Lumpur"],
  bangkok: [13.7563, 100.5018, "Asia/Bangkok"],
  "hong kong": [22.3193, 114.1694, "Asia/Hong_Kong"],
  tokyo: [35.6762, 139.6503, "Asia/Tokyo"],
  seoul: [37.5665, 126.978, "Asia/Seoul"],
  shanghai: [31.2304, 121.4737, "Asia/Shanghai"],
  sydney: [-33.8688, 151.2093, "Australia/Sydney"],
  melbourne: [-37.8136, 144.9631, "Australia/Melbourne"],
  brisbane: [-27.4698, 153.0251, "Australia/Brisbane"],
  perth: [-31.9505, 115.8605, "Australia/Perth"],
  auckland: [-36.8485, 174.7633, "Pacific/Auckland"],
  // Europe
  london: [51.5074, -0.1278, "Europe/London"],
  manchester: [53.4808, -2.2426, "Europe/London"],
  birmingham: [52.4862, -1.8904, "Europe/London"],
  edinburgh: [55.9533, -3.1883, "Europe/London"],
  dublin: [53.3498, -6.2603, "Europe/Dublin"],
  paris: [48.8566, 2.3522, "Europe/Paris"],
  berlin: [52.52, 13.405, "Europe/Berlin"],
  munich: [48.1351, 11.582, "Europe/Berlin"],
  frankfurt: [50.1109, 8.6821, "Europe/Berlin"],
  amsterdam: [52.3676, 4.9041, "Europe/Amsterdam"],
  milan: [45.4642, 9.19, "Europe/Rome"],
  rome: [41.9028, 12.4964, "Europe/Rome"],
  madrid: [40.4168, -3.7038, "Europe/Madrid"],
  zurich: [47.3769, 8.5417, "Europe/Zurich"],
  stockholm: [59.3293, 18.0686, "Europe/Stockholm"],
  warsaw: [52.2297, 21.0122, "Europe/Warsaw"],
  moscow: [55.7558, 37.6173, "Europe/Moscow"],
  // Americas
  "new york": [40.7128, -74.006, "America/New_York"],
  "new jersey": [40.7357, -74.1724, "America/New_York"],
  boston: [42.3601, -71.0589, "America/New_York"],
  washington: [38.9072, -77.0369, "America/New_York"],
  atlanta: [33.749, -84.388, "America/New_York"],
  chicago: [41.8781, -87.6298, "America/Chicago"],
  dallas: [32.7767, -96.797, "America/Chicago"],
  houston: [29.7604, -95.3698, "America/Chicago"],
  austin: [30.2672, -97.7431, "America/Chicago"],
  denver: [39.7392, -104.9903, "America/Denver"],
  seattle: [47.6062, -122.3321, "America/Los_Angeles"],
  "san francisco": [37.7749, -122.4194, "America/Los_Angeles"],
  "san jose": [37.3382, -121.8863, "America/Los_Angeles"],
  "los angeles": [34.0522, -118.2437, "America/Los_Angeles"],
  toronto: [43.6532, -79.3832, "America/Toronto"],
  vancouver: [49.2827, -123.1207, "America/Vancouver"],
  montreal: [45.5017, -73.5673, "America/Toronto"],
  calgary: [51.0447, -114.0719, "America/Edmonton"],
  ottawa: [45.4215, -75.6972, "America/Toronto"],
  // Africa
  nairobi: [-1.2921, 36.8219, "Africa/Nairobi"],
  johannesburg: [-26.2041, 28.0473, "Africa/Johannesburg"],
  "cape town": [-33.9249, 18.4241, "Africa/Johannesburg"],
};

const ALIAS: Record<string, string> = {
  bangalore: "bengaluru",
  bombay: "mumbai",
  "new delhi": "delhi",
  "delhi ncr": "delhi",
  ncr: "delhi",
  gurgaon: "gurugram",
  calcutta: "kolkata",
  madras: "chennai",
  poona: "pune",
  baroda: "vadodara",
  allahabad: "prayagraj",
  banaras: "varanasi",
  benares: "varanasi",
  trivandrum: "thiruvananthapuram",
  cochin: "kochi",
  mysore: "mysuru",
  mangalore: "mangaluru",
  vizag: "visakhapatnam",
  "greater noida": "noida",
  "navi mumbai": "mumbai",
  thane: "mumbai",
  secunderabad: "hyderabad",
  nyc: "new york",
  "new york city": "new york",
  ny: "new york",
  sf: "san francisco",
  "bay area": "san francisco",
  "silicon valley": "san jose",
  la: "los angeles",
  "washington dc": "washington",
  dc: "washington",
  uk: "london",
  dxb: "dubai",
  sharjah: "dubai",
  kl: "kuala lumpur",
};

function key(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function findCity(name: string): City | null {
  const k = key(name);
  if (!k) return null;
  if (C[k]) return C[k];
  if (ALIAS[k]) return C[ALIAS[k]];
  // "Koramangala, Bengaluru" / "Mumbai, India": try each comma/space part.
  const parts = name.split(/[,/()-]/).map(key).filter(Boolean);
  for (const p of parts) {
    if (C[p]) return C[p];
    if (ALIAS[p]) return C[ALIAS[p]];
  }
  return null;
}

/** Great-circle km between two known cities, or null. */
export function kmBetween(a: string, b: string): number | null {
  const A = findCity(a);
  const B = findCity(b);
  if (!A || !B) return null;
  const R = 6371;
  const r = Math.PI / 180;
  const dLat = (B[0] - A[0]) * r;
  const dLon = (B[1] - A[1]) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(A[0] * r) * Math.cos(B[0] * r) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

/** The two cities' IANA zones when both are known and they differ. */
export function zonesOf(a: string, b: string): { a: string; b: string } | null {
  const A = findCity(a);
  const B = findCity(b);
  if (!A || !B) return null;
  return { a: A[2], b: B[2] };
}

/** "9:41 pm" in a zone (falls back to local time). */
export function timeIn(zone: string, at: Date): string {
  try {
    return at.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: zone });
  } catch {
    return at.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
  }
}

/** The hour (0–23) in a zone, for a sun or a moon next to the clock. */
export function hourIn(zone: string, at: Date): number {
  try {
    return Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: zone }).format(at));
  } catch {
    return at.getHours();
  }
}

/** A 3-letter "airport code" for the boarding pass: BLR-style for big cities, else the first letters. */
const CODES: Record<string, string> = {
  mumbai: "BOM", delhi: "DEL", bengaluru: "BLR", hyderabad: "HYD", chennai: "MAA", kolkata: "CCU", pune: "PNQ", ahmedabad: "AMD",
  jaipur: "JAI", lucknow: "LKO", goa: "GOI", kochi: "COK", chandigarh: "IXC", indore: "IDR", patna: "PAT", guwahati: "GAU",
  dubai: "DXB", singapore: "SIN", london: "LHR", "new york": "JFK", toronto: "YYZ", sydney: "SYD", melbourne: "MEL",
  "san francisco": "SFO", seattle: "SEA", chicago: "ORD", dallas: "DFW", "los angeles": "LAX", vancouver: "YVR",
  paris: "CDG", berlin: "BER", frankfurt: "FRA", amsterdam: "AMS", doha: "DOH", "abu dhabi": "AUH", tokyo: "HND", boston: "BOS",
};

export function cityCode(name: string): string {
  const k = key(name);
  const canon = C[k] ? k : ALIAS[k] ?? "";
  if (canon && CODES[canon]) return CODES[canon];
  const letters = k.replace(/[^a-z]/g, "");
  return (letters.slice(0, 3) || "???").toUpperCase().padEnd(3, "X");
}
