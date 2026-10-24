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

export const REVIEWS_ROW1 = [
  { name: 'Rahul Sharma', city: 'New Delhi', tag: 'Diwali', review: 'Created a Diwali page for my family and everyone was moved to tears. The mandala animations felt so authentic — like a digital rangoli!' },
  { name: 'Aisha Khan', city: 'Lucknow, UP', tag: 'Eid Mubarak', review: 'Our Eid Mubarak page was shared by 200+ family members across 3 countries. The calligraphy style was absolutely beautiful.' },
  { name: 'Gurpreet Singh', city: 'Amritsar, Punjab', tag: 'Wedding', review: 'Used SubhSandesh for our wedding invitation. The golden aesthetic and blessings wall were perfect for our Punjabi wedding celebration!' },
  { name: "Maria D'Souza", city: 'Panaji, Goa', tag: 'Birthday', review: "My father's 60th birthday page had everyone emotional. The music playlist made it feel like a real celebration online." },
  { name: 'Sneha Patel', city: 'Ahmedabad, Gujarat', tag: 'Festival', review: 'The festival page we created was so serene and elegant. The countdown timer and heartfelt messages were a beautiful touch.' },
  { name: 'Ravi Kumar', city: 'Bengaluru, Karnataka', tag: 'Reception', review: 'Our reception page got 500+ blessings from guests! The AI-generated message for our parents was poetic and perfect.' },
];

export const REVIEWS_ROW2 = [
  { name: 'Fatima Shaikh', city: 'Mumbai, Maharashtra', tag: 'Wedding', review: "The AI wrote our wedding invitation in such beautiful poetic language. Our families couldn't believe it was AI — truly magical!" },
  { name: 'Lakshmi Iyer', city: 'Chennai, Tamil Nadu', tag: 'Pongal', review: 'Made a Pongal greeting page for our extended family in Tamil Nadu. The regional aesthetic felt so homely and warm. Pure magic!' },
  { name: 'Thomas George', city: 'Kochi, Kerala', tag: 'Christmas', review: "Our Christmas page with carols playlist and midnight countdown was the most unique thing we've ever done. Loved it!" },
  { name: 'Preethi Nair', city: 'Thiruvananthapuram', tag: 'Birthday', review: "My husband's birthday surprise page left him speechless. The animated card and music — completely exceeded expectations!" },
  { name: 'Arjun Mehta', city: 'Jaipur, Rajasthan', tag: 'Anniversary', review: 'Created an anniversary page for my parents. They kept it open all day playing the songs and reading messages. Priceless.' },
  { name: 'Deepa Krishnan', city: 'Hyderabad, Telangana', tag: 'Festival', review: 'Used it for Ugadi greetings across the family. The warm aesthetic and personalized touch made it feel truly special!' },
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
