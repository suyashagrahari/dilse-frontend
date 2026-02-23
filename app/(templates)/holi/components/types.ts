export type TabId = "home" | "wish" | "greetings" | "playlist" | "more";
export type EditMode = null | "choose" | "ai" | "ai-edit" | "manual" | "preview" | "password";

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
  { id: "more", label: "More" },
];

export interface GreetingCard {
  hindi: string;
  english: string;
  title: string;
  emoji: string;
  accent: string;
  gradient: string;
  pattern: string;
  paragraph: string;
  paragraphEn: string;
  shayri?: string;
}

export interface Track {
  title: string;
  artist: string;
  duration: string;
  color: string;
  src?: string;
}

export interface ColorMeaning {
  color: string;
  emoji: string;
  name: string;
  hindi: string;
  meaning: string;
}

export interface FamilyMember {
  name: string;
  relation: string;
}

export interface HoliData {
  senderName: string;
  senderFamily: string;
  senderMembers: FamilyMember[];
  senderPhoto: string;
  recipientName: string;
  homeWishMessage: string;   // shown on Home page as a personal wish card
  congratsMessage: string;   // shown on Wish page as the family wish card
  holiDate: string;
  heroImage: string;
  hindiTitle: string;
  hindiSubtitle: string;
  englishSubtitle: string;
  greetings: GreetingCard[];
  playlist: Track[];
  colorMeanings: ColorMeaning[];
}

export const DEMO_DATA: HoliData = {
  senderName: "Your Name",
  senderFamily: "Family",
  senderMembers: [],
  senderPhoto: "",
  recipientName: "",
  homeWishMessage: "Wishing you a Holi filled with vibrant colors, laughter, and the warmth of loved ones! 🌈",
  congratsMessage:
    "Wishing you and your family a very colorful and joyful Holi! May this festival bring happiness, love, and prosperity to your life. Happy Holi from our family to yours!",
  holiDate: "2026-03-14T00:00:00",
  heroImage: "/assets/Holi/hero_holi.png",
  hindiTitle: "होली है!",
  hindiSubtitle: "आपको और आपके परिवार को होली की हार्दिक शुभकामनाएं",
  englishSubtitle: "Wishing you joy, colors, and countless blessings this Holi",
  greetings: [
    {
      title: "Color Burst",
      hindi: "रंगों का त्योहार मुबारक हो!",
      english: "May the burst of colors fill your life with happiness and love!",
      emoji: "🎨",
      accent: "#E91E63",
      gradient: "linear-gradient(135deg, hsl(340 80% 30%), hsl(270 60% 25%), hsl(25 80% 35%))",
      pattern: "radial-gradient(circle at 30% 70%, rgba(233,30,99,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255,152,0,0.3) 0%, transparent 50%)",
      shayri: "रंगों की बहार आई,\nहोली का त्योहार आई,\nप्यार की फुहार लाई,\nखुशियों की बौछार लाई।",
      paragraph: "होली का यह रंगीन त्योहार आपके जीवन में ढेरों खुशियां, प्यार और समृद्धि लाए। हर रंग आपकी जिंदगी को और भी खूबसूरत बनाए।",
      paragraphEn: "May this colorful festival of Holi bring lots of happiness, love and prosperity to your life. May every color make your life even more beautiful.",
    },
    {
      title: "Floral Holi",
      hindi: "फूलों से भरी होली मुबारक!",
      english: "Wishing you a Holi as beautiful and fragrant as blooming flowers!",
      emoji: "🌸",
      accent: "#FF5252",
      gradient: "linear-gradient(135deg, hsl(340 60% 28%), hsl(350 50% 32%), hsl(30 70% 35%))",
      pattern: "radial-gradient(circle at 80% 20%, rgba(255,82,82,0.2) 0%, transparent 40%)",
      shayri: "फूलों जैसे खिलो यारो,\nरंगों में डूबो यारो,\nहोली की खुशबू में,\nदिल को सजाओ यारो।",
      paragraph: "जैसे फूल बगीचे में खिलते हैं, वैसे ही आपकी जिंदगी में खुशियां खिलें। होली की शुभकामनाएं!",
      paragraphEn: "Just as flowers bloom in a garden, may happiness bloom in your life. Happy Holi!",
    },
    {
      title: "Rangoli Dreams",
      hindi: "रंगोली जैसा सुंदर जीवन हो!",
      english: "May your life be as beautiful and intricate as a vibrant rangoli!",
      emoji: "🔴",
      accent: "#FFEB3B",
      gradient: "linear-gradient(135deg, hsl(0 70% 28%), hsl(45 80% 35%), hsl(150 60% 28%))",
      pattern: "radial-gradient(circle at 50% 50%, rgba(255,235,59,0.15) 0%, transparent 50%)",
      shayri: "रंगोली जैसा जीवन हो,\nहर रंग में नया सपन हो,\nहोली में मिल-जुल कर सब,\nखुशियों का हर क्षण हो।",
      paragraph: "रंगोली के हर रंग की तरह, आपकी जिंदगी में भी हर रंग की खुशी भरी रहे। होली मुबारक!",
      paragraphEn: "Like every color of rangoli, may your life be filled with every shade of happiness. Happy Holi!",
    },
    {
      title: "Pichkari Fun",
      hindi: "पिचकारी से रंगों की बौछार!",
      english: "Get ready for a splash of joy, laughter, and colors!",
      emoji: "💦",
      accent: "#03A9F4",
      gradient: "linear-gradient(135deg, hsl(195 70% 22%), hsl(210 60% 28%), hsl(270 60% 30%))",
      pattern: "radial-gradient(circle at 20% 80%, rgba(3,169,244,0.2) 0%, transparent 50%)",
      shayri: "पिचकारी उठाओ भाई,\nरंगों की बौछार लाई,\nहोली के त्योहार में,\nसबने खुशी मनाई।",
      paragraph: "पिचकारी की हर धार से रंगों की बौछार हो, हर चेहरे पर मुस्कान हो। होली की ढेर सारी शुभकामनाएं!",
      paragraphEn: "May every spray of the pichkari bring a shower of colors and a smile on every face. Happy Holi!",
    },
    {
      title: "Golden Holi",
      hindi: "सुनहरी होली की शुभकामनाएं!",
      english: "Wishing you a golden, warm, and joyful Holi celebration!",
      emoji: "✨",
      accent: "#FF9800",
      gradient: "linear-gradient(135deg, hsl(45 60% 25%), hsl(25 70% 30%), hsl(340 50% 28%))",
      pattern: "radial-gradient(circle at 60% 40%, rgba(255,152,0,0.2) 0%, transparent 50%)",
      shayri: "सोने जैसी हो तेरी होली,\nचाँदी जैसी हर बोली,\nहर पल हो मुबारक तेरा,\nजीवन की हर डोली।",
      paragraph: "होली का यह सुनहरा त्योहार आपके जीवन में खुशियों का सुनहरा दौर लाए। हैप्पी होली!",
      paragraphEn: "May this golden festival of Holi bring a golden era of happiness to your life. Happy Holi!",
    },
    {
      title: "Neon Night",
      hindi: "नीयन रंगों से भरी रात मुबारक!",
      english: "Let the neon lights color your night with magic and wonder!",
      emoji: "🌙",
      accent: "#9C27B0",
      gradient: "linear-gradient(135deg, hsl(270 60% 12%), hsl(340 70% 25%), hsl(195 80% 30%))",
      pattern: "radial-gradient(circle at 50% 30%, rgba(233,30,99,0.3) 0%, transparent 40%), radial-gradient(circle at 30% 80%, rgba(3,169,244,0.2) 0%, transparent 40%)",
      shayri: "रातों को रंग दो प्यारे,\nसितारों को संग दो सारे,\nहोली की इस शाम में,\nदिल को उमंग दो न्यारे।",
      paragraph: "नीयन रोशनी जैसा चमकदार और जादुई हो आपकी होली का उत्सव। होली की बहुत बहुत बधाई!",
      paragraphEn: "May your Holi celebration be as bright and magical as neon lights. Many congratulations on Holi!",
    },
    {
      title: "Sacred Colors",
      hindi: "पवित्र रंगों का आशीर्वाद!",
      english: "May sacred colors bless your path with love and peace!",
      emoji: "🙏",
      accent: "#4CAF50",
      gradient: "linear-gradient(135deg, hsl(120 40% 20%), hsl(45 60% 30%), hsl(340 50% 25%))",
      pattern: "radial-gradient(circle at 40% 60%, rgba(76,175,80,0.2) 0%, transparent 50%)",
      shayri: "पवित्र ये रंग हैं सारे,\nभगवान के हैं ये दुलारे,\nहोली में इनसे मिलकर,\nजीवन को करें उजियारे।",
      paragraph: "होली के पवित्र रंग आपके जीवन में शांति, प्रेम और आशीर्वाद लेकर आएं। शुभ होली!",
      paragraphEn: "May the sacred colors of Holi bring peace, love and blessings to your life. Happy Holi!",
    },
    {
      title: "Eternal Joy",
      hindi: "अनंत खुशियों की होली मुबारक!",
      english: "May you always find eternal joy and happiness!",
      emoji: "🎊",
      accent: "#FF5722",
      gradient: "linear-gradient(135deg, hsl(14 80% 28%), hsl(340 70% 30%), hsl(45 70% 35%))",
      pattern: "radial-gradient(circle at 70% 40%, rgba(255,87,34,0.2) 0%, transparent 50%)",
      shayri: "खुशी हो अनंत अपार,\nप्यार हो सदा बेशुमार,\nहोली का यह प्यारा दिन,\nलाए नया जीवन संसार।",
      paragraph: "होली के हर रंग में खुशी हो, हर पल में प्यार हो। यही दुआ है कि आपकी जिंदगी हमेशा रंगों से भरी रहे।",
      paragraphEn: "May there be happiness in every color and love in every moment. Our prayer is that your life is always full of colors.",
    },
  ],
  playlist: [
    { title: "Rang Barse", artist: "Amitabh Bachchan", duration: "4:32", color: "#E91E63", src: "/assets/Holi/music/rangbarse.mp3" },
    { title: "Balam Pichkari", artist: "Vishal Dadlani", duration: "4:45", color: "#03A9F4", src: "/assets/Holi/music/balampichkari.mp3" },
    { title: "Holi Ke Din", artist: "Kishore Kumar", duration: "5:10", color: "#FFEB3B", src: "/assets/Holi/music/holikedin2.mp3" },
    { title: "Jai Jai Shiv Shankar", artist: "Kishore Kumar", duration: "6:02", color: "#9C27B0", src: "/assets/Holi/music/jaijaishivshankar.mp3" },
    { title: "Holi Khele Raghuveera", artist: "Amitabh Bachchan", duration: "5:48", color: "#FF5252", src: "/assets/Holi/music/holikheleraghuvira2.mp3" },
    { title: "Aaj Na Chhodenge", artist: "R.D. Burman", duration: "5:35", color: "#E91E63", src: "/assets/Holi/music/aajnachhodengye.mp3" },
  ],
  colorMeanings: [
    { color: "#FF5252", emoji: "🔴", name: "Red", hindi: "लाल", meaning: "Love & Fertility" },
    { color: "#FFEB3B", emoji: "🟡", name: "Yellow", hindi: "पीला", meaning: "Happiness & Knowledge" },
    { color: "#4CAF50", emoji: "🟢", name: "Green", hindi: "हरा", meaning: "New Beginnings" },
    { color: "#03A9F4", emoji: "🔵", name: "Blue", hindi: "नीला", meaning: "Calm & Lord Krishna" },
    { color: "#FF9800", emoji: "🟠", name: "Orange", hindi: "नारंगी", meaning: "Courage & Success" },
    { color: "#E91E63", emoji: "🩷", name: "Pink", hindi: "गुलाबी", meaning: "Playfulness & Joy" },
  ],
};
