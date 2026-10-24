// SubhSandesh Landing Page Data Constants

/** Icon keys match OccasionsSection / OccIcon (`ring` | `cake` | `heart` | `palette` | `moon` | `spark`). */
export const SHOWCASE_ITEMS = [
  {
    id: "holi",
    title: "Holi",
    img: "https://cdn.subhsandesh.in/gifts-media/homePage/holi.webp",
    href: "/holi",
    accent: "#d95f76",
    icon: "palette" as const,
    tag: "HOLI",
    headline: "Holi Rangotsav",
    subtitle: "Rang, dhoom and joyful memories",
    pillLabel: "Holi",
    deckKicker: "HOLI",
    deckTitle: "Rangotsav",
  },
  {
    id: "eid",
    title: "Eid Mubarak",
    img: "https://cdn.subhsandesh.in/gifts-media/homePage/eid.webp",
    href: "/eid-mubarak",
    accent: "#4d8f6f",
    icon: "moon" as const,
    tag: "EID",
    headline: "Eid Mubarak",
    subtitle: "Dua, family and heartfelt blessings",
    pillLabel: "Eid",
    deckKicker: "EID",
    deckTitle: "Chand raat",
  },
  {
    id: "wedding",
    title: "Wedding",
    img: "https://cdn.subhsandesh.in/gifts-media/homePage/wedding.webp",
    href: "/wedding-shaadi",
    accent: "#c98b4a",
    icon: "ring" as const,
    tag: "WEDDING",
    headline: "Shaadi Celebration",
    subtitle: "Traditional elegance, modern page",
    pillLabel: "Wedding",
    deckKicker: "WEDDING",
    deckTitle: "Shaadi",
  },
  {
    id: "anniversary",
    title: "Anniversary",
    img: "https://cdn.subhsandesh.in/gifts-media/homePage/anniversary.webp",
    href: "/anniversary-gf",
    accent: "#b56a75",
    icon: "ring" as const,
    tag: "ANNIVERSARY",
    headline: "Anniversary Bliss",
    subtitle: "Moments captured forever in a page",
    pillLabel: "Anniversary",
    deckKicker: "ANNIVERSARY",
    deckTitle: "Saal girah",
  },
  {
    id: "birthday",
    title: "Birthday",
    img: "https://cdn.subhsandesh.in/gifts-media/homePage/happyBirthday.webp",
    href: "/birthday-gf",
    accent: "#7e5cc7",
    icon: "cake" as const,
    tag: "BIRTHDAY",
    headline: "Birthday Surprise",
    subtitle: "Personal wishes with love and music",
    pillLabel: "Birthday",
    deckKicker: "BIRTHDAY",
    deckTitle: "Janam din",
  },
  {
    id: "valentine",
    title: "Valentine",
    img: "https://cdn.subhsandesh.in/gifts-media/homePage/valentine.webp",
    href: "/valentine-gf",
    accent: "#e91e8c",
    icon: "heart" as const,
    tag: "VALENTINE",
    headline: "Valentine’s Day",
    subtitle: "Hearts, roses and a page made for them",
    pillLabel: "Valentine",
    deckKicker: "VALENTINE",
    deckTitle: "Ishq",
  },
  {
    id: "love",
    title: "Love",
    img: "https://cdn.subhsandesh.in/gifts-media/homePage/loveyou.webp",
    href: "/love-gf",
    accent: "#e27d60",
    icon: "heart" as const,
    tag: "LOVE",
    headline: "Love Letter",
    subtitle: "Say it beautifully — photos, music & heart",
    pillLabel: "Love",
    deckKicker: "LOVE",
    deckTitle: "Dil se",
  },
  {
    id: "sorry",
    title: "Sorry",
    img: "https://cdn.subhsandesh.in/gifts-media/homePage/sorry.webp",
    href: "/sorry-gf",
    accent: "#9b7b9d",
    icon: "spark" as const,
    tag: "SORRY",
    headline: "From the Heart",
    subtitle: "A gentle sorry they’ll truly feel",
    pillLabel: "Sorry",
    deckKicker: "SORRY",
    deckTitle: "Maafi",
  },
  {
    id: "missyou",
    title: "Miss you",
    img: "https://cdn.subhsandesh.in/gifts-media/homePage/missyou.webp",
    href: "/missyou-gf",
    accent: "#6b8cce",
    icon: "spark" as const,
    tag: "MISS YOU",
    headline: "Miss You",
    subtitle: "Close the distance with warmth & music",
    pillLabel: "Miss you",
    deckKicker: "MISS YOU",
    deckTitle: "Yaad",
  },
] as const;

/** Occasions carousel — same 9 templates as hero; used by OccasionsSection. */
export const OCCASIONS = SHOWCASE_ITEMS.map((s) => ({
  name: s.title,
  icon: s.icon,
  img: s.img,
  href: s.href,
}));

export const TEMPLATE_ITEMS = [
  { id: 'holi', label: 'Holi', emoji: '🎨', tag: 'Festival', color: '#E91E63', bg: 'linear-gradient(145deg,#3d0c11,#1a0505)', accent: '#FF6090', imgSrc: null, desc: 'Rang Barse vibes', pattern: 'radial-gradient(circle at 30% 40%, rgba(233,30,99,0.18) 0%, transparent 55%), radial-gradient(circle at 70% 70%, rgba(255,152,0,0.12) 0%, transparent 50%)' },
  { id: 'wedding', label: 'Wedding', emoji: '💍', tag: 'Shaadi', color: '#c9a84c', bg: 'linear-gradient(145deg,#2a1500,#140a00)', accent: '#f0c060', imgSrc: null, desc: 'Eternal celebrations', pattern: 'radial-gradient(circle at 60% 30%, rgba(201,168,76,0.18) 0%, transparent 55%)' },
  { id: 'eid', label: 'Eid Mubarak', emoji: '🌙', tag: 'Festival', color: '#4FC3F7', bg: 'linear-gradient(145deg,#001a2c,#000d18)', accent: '#7ee0ff', imgSrc: null, desc: 'Chand raat magic', pattern: 'radial-gradient(circle at 40% 60%, rgba(79,195,247,0.15) 0%, transparent 55%)' },
  { id: 'diwali', label: 'Diwali', emoji: '🪔', tag: 'Festival', color: '#FF9800', bg: 'linear-gradient(145deg,#1a0a00,#0d0400)', accent: '#ffb74d', imgSrc: null, desc: 'Festival of lights', pattern: 'radial-gradient(circle at 50% 35%, rgba(255,152,0,0.2) 0%, transparent 55%)' },
  { id: 'reception', label: 'Reception', emoji: '🥂', tag: 'Celebration', color: '#CE93D8', bg: 'linear-gradient(145deg,#1a001f,#0d0010)', accent: '#e8b4f8', imgSrc: null, desc: 'Grand evening affair', pattern: 'radial-gradient(circle at 65% 45%, rgba(206,147,216,0.15) 0%, transparent 55%)' },
  { id: 'birthday', label: 'Birthday', emoji: '🎂', tag: 'Celebration', color: '#F48FB1', bg: 'linear-gradient(145deg,#1f0012,#100009)', accent: '#ffaed4', imgSrc: null, desc: 'Celebrate every year', pattern: 'radial-gradient(circle at 35% 55%, rgba(244,143,177,0.15) 0%, transparent 55%)' },
];

export const FEATURES = [
  { id: 'ai', title: 'AI-Generated Messages', desc: 'Let AI craft beautiful, heartfelt wishes in seconds — personalised just for them.', tags: ['Smart AI', 'Any Language', 'Instant'], accent: '#c9a84c', metric: '98%', label: 'Accuracy' },
  { id: 'templates', title: 'Stunning Templates', desc: 'Choose from beautifully designed celebration themes for every Indian occasion.', tags: ['Indian Themes', 'Festive', 'Authentic'], accent: '#e27d60', metric: '500+', label: 'Styles' },
  { id: 'photos', title: 'Photo Memories', desc: 'Upload precious photos and build a gallery that tells your unique love story.', tags: ['Gallery View', 'Gold Frames', 'Indian Vibe'], accent: '#85dcba', metric: '4K', label: 'Quality' },
  { id: 'music', title: 'Music & Playlists', desc: 'Embed your favourite Bollywood, devotional or personal tracks to set the mood.', tags: ['Bollywood', 'Devotional', 'Playlists'], accent: '#e8a87c', metric: 'Hi-Fi', label: 'Audio' },
  { id: 'timer', title: 'Countdown Timers', desc: 'Build excitement with a live ticking clock right up to the big moment.', tags: ['Live Ticker', 'Precision', 'Flip-Clock'], accent: '#c38d9e', metric: 'Real-Time', label: 'Sync' },
  { id: 'security', title: 'Password Protection', desc: 'Keep your celebration page private — only your loved ones can unlock it.', tags: ['Encrypted', 'Passcode', 'Family Only'], accent: '#c9a84c', metric: 'AES-256', label: 'Shield' },
  { id: 'sharing', title: 'Instant Sharing', desc: 'Share your page anywhere — WhatsApp, Instagram, Email — in one tap.', tags: ['WhatsApp', 'Email', 'One Link'], accent: '#9eb5e8', metric: '1-Tap', label: 'Share' },
  { id: 'blessings', title: 'Blessings Wall', desc: 'Let family and friends send heartfelt duas, blessings and wishes back to you.', tags: ['Duas & Prayers', 'Community', 'Live Wall'], accent: '#e8a87c', metric: '24+', label: 'Blessings' },
];

/**
 * Example celebrations for the home page's "around the world" strip. These are
 * illustrations of how the product is used, NOT customer reviews: no names, no
 * star ratings, and the section labels them as examples. Swap in real,
 * permission-given reviews only with the person's consent.
 */
export const CELEBRATION_STORIES = [
  { tag: 'Wedding', title: 'One invite, three continents', story: 'A wedding invitation with RSVPs for every function, opened by family in Delhi, London and Toronto from a single WhatsApp link.', places: 'Delhi · London · Toronto' },
  { tag: 'Birthday', title: "Dad's 60th, from five time zones", story: 'Siblings in Sydney, Dubai and New Jersey each add photos and a voice note to one birthday page, with a countdown that shows everyone their local time.', places: 'Sydney · Dubai · New Jersey' },
  { tag: 'Christmas', title: 'Carols and a midnight countdown', story: 'A Christmas page with a carols playlist, family photos and a countdown to midnight, shared across the family chat.', places: 'Kochi · Manchester' },
  { tag: 'Eid Mubarak', title: 'Eid wishes for family near and far', story: 'An Eid page in elegant calligraphy, sent to relatives in Lucknow, Doha and Chicago before the morning prayer.', places: 'Lucknow · Doha · Chicago' },
  { tag: 'Anniversary', title: "Our parents' 30 years", story: 'A surprise anniversary page with their wedding photos, their song and messages from grandchildren abroad.', places: 'Singapore · Pune' },
  { tag: 'Diwali', title: 'Lighting a diya together', story: 'A Diwali page with animated diyas and rangoli, sent to friends who cannot fly home this year.', places: 'Jaipur · San Francisco' },
  { tag: 'Reception', title: 'Blessings from every guest', story: 'A reception page where guests who could not travel leave blessings on the wall, read aloud at the party.', places: 'Hyderabad · Melbourne' },
  { tag: 'Valentine', title: 'A love letter across the miles', story: 'A long-distance Valentine page that works out the distance between two cities and plays their first song.', places: 'Berlin · Mumbai' },
  { tag: 'Holi', title: 'Colours over video call', story: 'A Holi page full of colour, photos and a playlist, shared with cousins celebrating in another country.', places: 'Leicester · Ahmedabad' },
  { tag: 'Baby Shower', title: 'A baby shower everyone can join', story: 'A baby shower page with the date, the venue map and a wishes wall for family who join online.', places: 'Austin · Chennai' },
  { tag: 'Christian Wedding', title: 'Join us at the altar', story: 'A church wedding invitation with the ceremony, reception and a livestream link for grandparents overseas.', places: 'Goa · Toronto' },
  { tag: 'Thank You', title: 'Saying thank you properly', story: 'A thank-you page for the teacher, the mentor or the friend who showed up, with photos and a message they can keep.', places: 'Anywhere' },
];

export const SECURITY_CARDS = [
  { title: 'Your Content Belongs to You', desc: 'All photos, messages, and pages you create belong only to you. We never read, review, or use your personal content for any purpose.' },
  { title: 'Secure Page Access', desc: 'Protect your celebration pages with password protection, so only the people you share it with can view your precious moments.' },
  { title: 'Encrypted Connections', desc: 'All pages and data are protected using secure HTTPS encryption, ensuring safe communication between you and the platform at all times.' },
  { title: 'No Unwanted Access', desc: 'We never access or share your private celebration pages unless explicitly requested for technical support with your permission.' },
  { title: 'Safe & Reliable Hosting', desc: 'Your pages are hosted on secure cloud infrastructure, ensuring they remain safe, stable, and always available when your loved ones visit.' },
  { title: 'Built With Trust', desc: 'SubhSandesh is designed to help you share joyful moments with love. We take the responsibility of protecting your memories with utmost care.' },
];

export const HOW_IT_WORKS_STEPS = [
  { num: '01', icon: 'calendar', title: 'Choose Your Occasion', desc: "Pick from birthdays, weddings, Holi, Eid, Valentine's Day and more festive occasions.", tag: 'STEP ONE', delay: 0 },
  { num: '02', icon: 'edit', title: 'Customize Your Page', desc: 'Add photos, music, heartfelt messages, and a live countdown timer to make it truly special.', tag: 'STEP TWO', delay: 0.14 },
  { num: '03', icon: 'share', title: 'Share the Surprise', desc: 'Publish your page and send the magical link to loved ones — ready in under 2 minutes.', tag: 'STEP THREE', delay: 0.28 },
];

export const PHONE_DEMO_TABS = [
  { id: 'wedding', tabIcon: 'ring', tabLabel: 'Wedding', bg: '#3d0c11', name: 'Rahul & Priya', subtitle: 'शादी मुबारक', meta: '12 February 2026', img: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=200&h=200&fit=crop&crop=faces', items: [{ icon: 'pin', text: 'Grand Hyatt, Jaipur · Feb 12' }, { icon: 'music', text: '12 songs · Arijit Singh, Kumar Sanu' }, { icon: 'blessing', text: '24 blessings received' }], badge: { icon: 'share', title: 'Instant Share', sub: 'WhatsApp ready' }, pills: [{ icon: 'pin', label: 'Venue' }, { icon: 'music', label: 'Playlist' }] },
  { id: 'birthday', tabIcon: 'cake', tabLabel: 'Birthday', bg: '#1a2a4a', name: 'Happy Birthday\nPriya!', subtitle: 'जन्मदिन मुबारक', meta: '15 March 2026', img: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=200&h=200&fit=crop', items: [{ icon: 'cake', text: '25th Birthday Celebration' }, { icon: 'music', text: '8 songs · Personal Playlist' }, { icon: 'gallery', text: '32 photos shared' }], badge: { icon: 'ai', title: 'AI Message', sub: 'Heartfelt & personal' }, pills: [{ icon: 'celebrate', label: 'Celebrate' }, { icon: 'gallery', label: 'Gallery' }] },
  { id: 'eid', tabIcon: 'moon', tabLabel: 'Eid', bg: '#0d2a1a', name: 'Eid Mubarak', subtitle: 'عید مبارک', meta: 'From the Khan Family', img: 'https://images.unsplash.com/photo-1561625116-5f8675632053?w=200&h=200&fit=crop', items: [{ icon: 'moon', text: 'Eid ul-Fitr 2026' }, { icon: 'music', text: 'Beautiful Nasheeds' }, { icon: 'blessing', text: '56 duas sent' }], badge: { icon: 'lock', title: 'Password Protected', sub: 'Private & secure' }, pills: [{ icon: 'dua', label: 'Send Dua' }, { icon: 'music', label: 'Playlist' }] },
];

export const DEMO_STATS = [
  { num: '50,000+', label: 'Pages Created' },
  { num: '4.9 ★', label: 'Avg. Rating' },
  { num: '12+', label: 'Occasions' },
  { num: '2 min', label: 'To Create' },
];

export const WHY_LOVE_FEATURES = [
  { title: 'Pure Emotion, Every Time', desc: 'Make someone ugly cry in the best way. Birthday, anniversary, miss you — every page hits different.' },
  { title: 'Works for Every Occasion', desc: "Valentine's Day, Teddy Day, Chocolate Day, Miss You, Get Well Soon — one platform handles it all." },
  { title: 'Loved in 50+ Countries', desc: 'From Mumbai to Manhattan, Dubai to Sydney — Indian families abroad use SubhSandesh to stay connected.' },
  { title: 'AI Writes the Perfect Words', desc: "Can't find the right words? Our AI crafts heartfelt messages so beautiful, people won't believe it's AI." },
  { title: 'Password Protected Privacy', desc: 'Only people you share with can see your page. Completely private, completely yours — always.' },
  { title: 'Instant Worldwide Delivery', desc: 'Share via WhatsApp, email, or a link — delivered anywhere in the world in seconds, any time.' },
];
