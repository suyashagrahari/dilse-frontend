export type TabId = "home" | "wish" | "greetings" | "playlist" | "dua";
export type EditMode = null | "choose" | "ai" | "manual" | "preview" | "password";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
  shareUrl?: string;
}

export const TABS: { id: TabId; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "wish", label: "Wish" },
  { id: "greetings", label: "Greetings" },
  { id: "playlist", label: "Playlist" },
  { id: "dua", label: "Dua" },
];

export interface GreetingCard {
  urdu: string;
  english: string;
  title: string;
  emoji: string;
  image: string;
  accent: string;
  paragraph: string;
  paragraphEn: string;
}

export interface DuaItem {
  title: string;
  titleEn: string;
  arabic: string;
  urdu: string;
  english: string;
  emoji: string;
}

export interface Track {
  title: string;
  artist: string;
  duration: string;
  src?: string;
}

export interface FamilyMember {
  name: string;
  relation: string;
}

export interface EidData {
  senderName: string;
  senderFamily: string;
  senderMembers: FamilyMember[];
  senderPhoto: string;
  recipientName: string;
  congratsMessage: string;
  eidDate: string;
  heroImage: string;
  urduTitle: string;
  urduSubtitle: string;
  englishSubtitle: string;
  greetings: GreetingCard[];
  duas: DuaItem[];
  playlist: Track[];
}

export const DEMO_DATA: EidData = {
  senderName: "Ahmed Khan",
  senderFamily: "Khan Family",
  senderMembers: [
    { name: "Fatima", relation: "Wife" },
    { name: "Ali", relation: "Son" },
  ],
  senderPhoto: "",
  recipientName: "",
  congratsMessage: "Wishing you and your family a very blessed Eid! May this Eid bring joy, happiness, and prosperity to your life. Eid Mubarak from our family to yours!",
  eidDate: "2026-03-20T00:00:00",
  heroImage: "/assets/Eid/hero_eid.jpeg",
  urduTitle: "عید مبارک",
  urduSubtitle: "آپ کو اور آپ کے خاندان کو عید الفطر مبارک ہو",
  englishSubtitle: "Wishing you joy, peace, and countless blessings this Eid",
  greetings: [
    {
      title: "Blessed Night",
      urdu: "عید کی خوشیاں آپ پر نچھاور ہوں",
      english: "May Eid's happiness shower upon you",
      emoji: "🕌",
      image: "/assets/Eid/eid_mubarak.jpeg",
      accent: "#3A8F7D",
      paragraph: "عید الفطر کا یہ مبارک موقع آپ کی زندگی میں بے شمار خوشیاں، برکتیں اور سکون لائے۔ اللہ تعالیٰ آپ کی تمام دعائیں قبول فرمائے۔",
      paragraphEn: "May this blessed occasion of Eid al-Fitr bring countless happiness, blessings and peace to your life. May Allah accept all your prayers.",
    },
    {
      title: "Crescent Moon",
      urdu: "اللہ آپ کی زندگی کو خوشیوں سے بھر دے",
      english: "May Allah fill your life with happiness",
      emoji: "🌙",
      image: "/assets/Eid/eid_mubarak.jpeg",
      accent: "#C5A03F",
      paragraph: "رمضان کی عبادات کا ثمرہ عید کی صورت میں سامنے آیا ہے۔ اللہ پاک آپ کے گھر کو خوشیوں سے بھر دے۔",
      paragraphEn: "The fruit of Ramadan's worship has come in the form of Eid. May Allah fill your home with happiness and grant you health.",
    },
    {
      title: "Golden Star",
      urdu: "عید کا یہ خوبصورت دن مبارک ہو",
      english: "Blessed be this beautiful day of Eid",
      emoji: "⭐",
      image: "/assets/Eid/eid_mubarak.jpeg",
      accent: "#E0C96E",
      paragraph: "آج کا دن خوشیوں کا دن ہے، محبت بانٹنے کا دن ہے۔ آئیے مل کر اس خوبصورت دن کو یادگار بنائیں۔",
      paragraphEn: "Today is a day of joy, a day of sharing love. Let us make this beautiful day memorable together.",
    },
    {
      title: "Sacred Prayer",
      urdu: "آپ کی دعائیں قبول ہوں",
      english: "May your prayers be accepted",
      emoji: "🤲",
      image: "/assets/Eid/eid_mubarak.jpeg",
      accent: "#7BBFB3",
      paragraph: "رمضان المبارک کی عبادات، روزے اور تراویح کا اجر اللہ تعالیٰ آپ کو عطا فرمائے۔ آپ کی ہر دعا قبول ہو۔",
      paragraphEn: "May Allah grant you the reward for your worship, fasting, and Taraweeh prayers during Ramadan.",
    },
    {
      title: "Warm Hearth",
      urdu: "عید کی رونقیں آپ کے گھر میں ہمیشہ رہیں",
      english: "May Eid's joy always remain in your home",
      emoji: "🏡",
      image: "/assets/Eid/eid_mubarak.jpeg",
      accent: "#5A9E8F",
      paragraph: "عید کی یہ رونقیں، خوشیاں اور مسرتیں آپ کے گھر میں ہمیشہ قائم رہیں۔",
      paragraphEn: "May the festivities, happiness, and joy of Eid always remain in your home.",
    },
    {
      title: "Pure Love",
      urdu: "محبت، سکون اور برکتوں کی عید مبارک",
      english: "Eid Mubarak with love, peace, and blessings",
      emoji: "💛",
      image: "/assets/Eid/eid_mubarak.jpeg",
      accent: "#D4A855",
      paragraph: "اس عید پر آپ کو اور آپ کے پورے خاندان کو ڈھیروں مبارکباد۔ اللہ تعالیٰ آپ سب پر اپنی رحمتیں نازل فرمائے۔",
      paragraphEn: "Congratulations to you and your entire family on this Eid. May Allah shower His blessings upon all of you.",
    },
    {
      title: "Divine Light",
      urdu: "اللہ کا نور آپ کی راہوں کو روشن کرے",
      english: "May Allah's light brighten your path",
      emoji: "✨",
      image: "/assets/Eid/eid_mubarak.jpeg",
      accent: "#8FD4C7",
      paragraph: "عید کی یہ روشنی آپ کی زندگی کے ہر لمحے کو منور کرے۔ اللہ آپ کو ہمیشہ سیدھے راستے پر چلائے۔",
      paragraphEn: "May the light of Eid illuminate every moment of your life. May Allah always guide you on the straight path.",
    },
    {
      title: "Eternal Peace",
      urdu: "آپ کو ہمیشہ سکون اور خوشی ملے",
      english: "May you always find peace and happiness",
      emoji: "🕊️",
      image: "/assets/Eid/eid_mubarak.jpeg",
      accent: "#B8965A",
      paragraph: "اللہ تعالیٰ آپ کے دل میں ہمیشہ سکون رکھے اور آپ کی زندگی کو خوشیوں سے بھر دے۔ عید مبارک۔",
      paragraphEn: "May Allah always keep peace in your heart and fill your life with happiness. Eid Mubarak.",
    },
  ],
  duas: [
    {
      title: "قبولیتِ عبادات",
      titleEn: "Acceptance of Worship",
      arabic: "تَقَبَّلَ اللَّهُ مِنَّا وَمِنْكُمْ",
      urdu: "اللہ ہماری اور آپ کی عبادات قبول فرمائے",
      english: "May Allah accept (good deeds) from us and from you.",
      emoji: "🤲",
    },
    {
      title: "ذکر و شکر",
      titleEn: "Remembrance & Gratitude",
      arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
      urdu: "اے اللہ! مجھے اپنے ذکر، شکر اور حسنِ عبادت میں مدد فرما",
      english: "O Allah, help me to remember You, to thank You, and to worship You well.",
      emoji: "📿",
    },
    {
      title: "دنیا و آخرت",
      titleEn: "This World & Hereafter",
      arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
      urdu: "اے ہمارے رب! ہمیں دنیا میں بھلائی دے اور آخرت میں بھلائی دے",
      english: "Our Lord, give us good in this world and in the Hereafter, and protect us from the Fire.",
      emoji: "🌟",
    },
    {
      title: "تقویٰ",
      titleEn: "Righteousness",
      arabic: "اللَّهُمَّ اجْعَلْنَا مِنَ الْمُتَّقِينَ",
      urdu: "اے اللہ! ہمیں پرہیزگاروں میں سے بنا دے",
      english: "O Allah, make us among the righteous.",
      emoji: "🕌",
    },
  ],
  playlist: [
    { title: "Eid Mubarak", artist: "Sami Yusuf", duration: "4:32", src: "/assets/Eid/music/eidmubarak.mp3" },
    { title: "Tala Al Badru Alayna", artist: "Traditional", duration: "3:45", src: "/assets/Eid/music/talaalbadaru.mp3" },
    { title: "Ya Mustafa", artist: "Maher Zain", duration: "5:01", src: "/assets/Eid/music/yamustafa.mp3" },
    { title: "Ramadan", artist: "Maher Zain", duration: "4:18", src: "/assets/Eid/music/ramadan.mp3" },
    { title: "Eid Ki Raat", artist: "Traditional", duration: "3:55", src: "/assets/Eid/music/eidkiraat2.mp3" },
    { title: "Hasbi Rabbi", artist: "Sami Yusuf", duration: "4:47", src: "/assets/Eid/music/hasbirabbi.mp3" },
  ],
};
