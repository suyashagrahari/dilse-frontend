/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SEO DATA — Master file for all template SEO content
 *
 * HOW TO ADD KEYWORDS:  Just push strings into the `keywords` array.
 *                       Use comments to group them. No limit.
 *
 * HOW TO ADD FAQs:      Push { question, answer } objects into `faqs`.
 *                       Aim for 50-200 per template for best coverage.
 *
 * HOW TO ADD HOW-TO:    Edit the `howTo.steps` array.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface ReviewData {
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  date: string; // YYYY-MM-DD
  location?: string; // "Mumbai, India"
}

export interface HowToStep {
  name: string;
  text: string;
}

export interface HowToData {
  name: string;
  description: string;
  totalTime: string; // ISO 8601 e.g. "PT5M" = 5 minutes
  steps: HowToStep[];
}

export interface AggregateRatingData {
  ratingValue: number; // e.g. 4.9
  reviewCount: number; // e.g. 3248
}

export interface TemplateData {
  title: string;
  description: string;
  category: string;
  emoji: string;
  /** Add as many keywords as you want — 100-500 recommended */
  keywords: string[];
  /** Add as many Q&A pairs as you want — 20-200 recommended */
  faqs: { question: string; answer: string }[];
  /** Shown in HowTo rich result in Google */
  howTo: HowToData;
  /**
   * Shown as a star rating in Google search results.
   *
   * OPTIONAL, and it should stay optional. Google treats AggregateRating markup
   * as a claim of fact and has both demoted and manually penalised sites for
   * ratings with nothing behind them, so a template that has genuinely never
   * been rated omits this rather than shipping a plausible-looking number.
   *
   * `getAggregateRating()` already returns null when absent and every template
   * layout guards with `{rating && …}`, so leaving it out renders no markup at
   * all — which is the honest result, not a degraded one.
   */
  aggregateRating?: AggregateRatingData;
}

export const TEMPLATE_DATA: Record<string, TemplateData> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // BIRTHDAY — GIRLFRIEND
  // ═══════════════════════════════════════════════════════════════════════════
  "birthday-gf": {
    title: "Birthday Gift for Girlfriend | Create Personalized Birthday Page Online",
    description:
      "Surprise your girlfriend with a beautiful personalized birthday page. Add messages, photos, music playlist & games. Share with a unique link via WhatsApp. Free & takes 5 minutes!",
    category: "Birthday",
    emoji: "🎂",
    aggregateRating: { ratingValue: 4.9, reviewCount: 3248 },

    keywords: [
      // ── PRIMARY — highest volume ──
      "birthday gift for girlfriend",
      "online birthday gift for girlfriend",
      "birthday surprise for girlfriend",
      "personalized birthday gift for girlfriend",
      "unique birthday gift for girlfriend",
      "romantic birthday surprise for girlfriend",
      "best birthday gift for girlfriend",
      "birthday gift ideas for girlfriend",
      "virtual birthday gift for girlfriend",
      "digital birthday gift for girlfriend",

      // ── SECONDARY ──
      "birthday page for girlfriend",
      "birthday website for girlfriend",
      "birthday gift link for girlfriend",
      "birthday gift for gf",
      "online birthday surprise for gf",
      "birthday surprise website for girlfriend",
      "cute birthday gift for girlfriend",
      "creative birthday gift for girlfriend",
      "special birthday surprise for girlfriend",
      "birthday gift link whatsapp girlfriend",

      // ── LONG-TAIL ──
      "how to surprise girlfriend on birthday online",
      "what to gift girlfriend on birthday online",
      "send birthday surprise to girlfriend via whatsapp",
      "birthday gift for girlfriend who has everything",
      "personalized birthday page for girlfriend with photos",
      "birthday gift page for girlfriend with music",
      "best online birthday gift for girlfriend india",
      "birthday surprise link to send girlfriend",
      "romantic birthday page for girlfriend free",
      "create birthday surprise page for girlfriend",
      "how to make girlfriend feel special on birthday online",
      "birthday gift for girlfriend under 5 minutes",
      "last minute birthday gift for girlfriend online",
      "birthday gift for girlfriend long distance",
      "birthday gift for girlfriend long distance relationship",
      "birthday surprise idea for girlfriend",
      "first birthday together gift for girlfriend",
      "milestone birthday gift for girlfriend",
      "18th birthday gift for girlfriend",
      "21st birthday gift for girlfriend online",

      // ── INDIA GEO ──
      "birthday gift for girlfriend india",
      "online birthday gift for girlfriend india",
      "birthday surprise for gf india",
      "birthday gift for girlfriend online india free",
      "online birthday page for girlfriend india",
      "birthday gift for girlfriend delhi",
      "birthday gift for girlfriend mumbai",
      "birthday gift for girlfriend bangalore",
      "birthday gift for girlfriend hyderabad",
      "birthday gift for girlfriend pune",
      "birthday gift for girlfriend kolkata",
      "birthday gift for girlfriend chennai",
      "birthday gift for girlfriend jaipur",
      "best birthday gift for girlfriend in india 2025",
      "best birthday gift for girlfriend in india 2026",
      "birthday gift send online india girlfriend",

      // ── FEATURE / APP SPECIFIC ──
      "birthday gift for girlfriend with photos",
      "birthday gift for girlfriend with music",
      "birthday gift for girlfriend with games",
      "birthday quiz for girlfriend",
      "birthday game for girlfriend online",
      "birthday gallery for girlfriend",
      "birthday playlist for girlfriend",
      "birthday message for girlfriend online",
      "birthday letter for girlfriend online",
      "birthday page with quiz for girlfriend",

      // ── PLATFORM / INTENT ──
      "birthday gift page whatsapp share",
      "birthday gift link whatsapp india",
      "send birthday gift online india",
      "create birthday surprise page online",
      "free birthday gift page maker",
      "birthday gift online maker india",
      "birthday page maker for girlfriend",
      "best birthday gift website for girlfriend",
      "birthday gift maker free india",
      "subhsandesh birthday gift girlfriend",

      // ── RELATIONSHIP SPECIFIC ──
      "birthday gift for new girlfriend",
      "birthday gift for gf from bf online",
      "birthday gift from boyfriend to girlfriend online",
      "boyfriend birthday gift for girlfriend online",
      "birthday gift for gf 2025",
      "birthday gift for gf 2026",
      "birthday gift for girlfriend hindi",
      "birthday surprise for girlfriend hindi",

      // ── QUESTION INTENT ──
      "what to gift girlfriend on birthday",
      "how to wish girlfriend happy birthday online",
      "what is the best birthday gift for girlfriend",
      "how to surprise girlfriend on birthday",
      "what do girls like as birthday gifts",
      "best way to wish girlfriend birthday online",
      "how to send birthday surprise to girlfriend",
      "can i create birthday page for girlfriend free",
      "how to make birthday page for girlfriend",
      "birthday gift idea for girlfriend no money",

      // ── COMPETITOR / ALTERNATIVE ──
      "birthday memory page for girlfriend online",
      "birthday scrapbook for girlfriend online",
      "birthday tribute page for girlfriend",
      "heartfelt birthday gift for girlfriend online",
      "personalised birthday gift girlfriend",
      "e-birthday gift girlfriend",
      "digital birthday card girlfriend online",
      "animated birthday gift for girlfriend",
      "interactive birthday gift girlfriend",
      "birthday suprise online girlfriend india",

      // ── SEASONAL ──
      "birthday gift for girlfriend 2025",
      "birthday gift for girlfriend 2026",
      "best birthday ideas for girlfriend 2025",
      "trending birthday gift for girlfriend india",
    ],

    faqs: [
      {
        question: "How do I create a birthday gift page for my girlfriend online?",
        answer:
          "Sign up on SubhSandesh, pick the Birthday GF template, add a personalized message, upload your couple photos, choose her favourite songs, and share the unique link — takes under 5 minutes!",
      },
      {
        question: "Is it free to create a birthday page for my girlfriend?",
        answer:
          "Yes! Creating and sharing a beautiful personalized birthday gift page for your girlfriend is completely free on SubhSandesh.",
      },
      {
        question: "Can I add photos and music to my girlfriend's birthday page?",
        answer:
          "Yes! Upload multiple photos for a personalized gallery and add a custom playlist with her favourite songs to make it extra special.",
      },
      {
        question: "How do I share the birthday surprise with my girlfriend?",
        answer:
          "After creating the page you get a unique shareable link. Send it via WhatsApp, Instagram DM, email, or any messaging app — she opens it on any device.",
      },
      {
        question: "What games and features are included in the birthday page?",
        answer:
          "The birthday template includes a photo gallery, music playlist, romantic message section, a 'How well do you know me?' quiz, and a Truth or Dare game.",
      },
      {
        question: "Can I edit the birthday page after sharing it?",
        answer:
          "Yes! You can edit and republish your birthday page anytime. The same link always shows the updated version.",
      },
      {
        question: "Is this a good birthday gift for a long distance girlfriend?",
        answer:
          "Absolutely! SubhSandesh's birthday page is perfect for long-distance relationships — she receives a beautiful surprise link anywhere in the world.",
      },
      {
        question: "Does the birthday page work on mobile phones?",
        answer:
          "Yes! The birthday page is fully mobile-optimized and works perfectly on all smartphones — both iOS and Android.",
      },
      {
        question: "Can I set a password on the birthday page?",
        answer:
          "Yes! You can set a password so only your girlfriend can view the page. Share the password with her separately for a fun surprise.",
      },
      {
        question: "How many photos can I add to the birthday page?",
        answer:
          "You can add multiple photos to create a beautiful gallery. There's no hard limit — add as many special memories as you want.",
      },
      {
        question: "Can I add a personal video to the birthday page?",
        answer:
          "You can embed video links (YouTube, etc.) in your message section to include a heartfelt video message for her.",
      },
      {
        question: "Can I create a birthday page for my ex-girlfriend?",
        answer:
          "Yes, the template works for any special person you want to wish — it's completely customizable with your own message and photos.",
      },
      {
        question: "What is the best online birthday gift for a girlfriend in India?",
        answer:
          "SubhSandesh's personalized birthday page is one of the best online birthday gifts in India — it's unique, heartfelt, shareable via WhatsApp, and completely free.",
      },
      {
        question: "Can my girlfriend interact with the birthday page?",
        answer:
          "Yes! She can play the birthday quiz, take a Truth or Dare challenge, view the gallery, listen to the playlist, and even leave a response.",
      },
      {
        question: "How long does it take to create the birthday page?",
        answer:
          "Most users finish in under 5 minutes. If you want to upload many photos and add AI-generated messages, it might take 10-15 minutes.",
      },
      {
        question: "Can I use AI to write the birthday message for my girlfriend?",
        answer:
          "Yes! SubhSandesh has an AI message generator — enter a few details about your girlfriend and it writes a romantic, personalized birthday message for you.",
      },
      {
        question: "Is the birthday page link permanent?",
        answer:
          "Yes! Once published, your birthday page link is permanent. She can open it years later and relive the special memory.",
      },
      {
        question: "Can I surprise my girlfriend on WhatsApp with this?",
        answer:
          "Yes! Copy the unique link and send it on WhatsApp — it shows a beautiful preview card with your message. Perfect WhatsApp birthday surprise.",
      },
      {
        question: "What makes SubhSandesh's birthday page better than a regular card?",
        answer:
          "Unlike a physical card, SubhSandesh's birthday page is interactive — it has music, photos, games, and a quiz. It's shareable instantly, stays forever, and is completely free.",
      },
      {
        question: "Can I create birthday pages for multiple people?",
        answer:
          "Yes! You can create unlimited birthday pages for different people. Your dashboard keeps all your pages organized.",
      },
    ],

    howTo: {
      name: "How to Create a Birthday Gift Page for Your Girlfriend Online",
      description:
        "Create a beautiful personalized birthday surprise page for your girlfriend in 5 minutes — free on SubhSandesh.",
      totalTime: "PT5M",
      steps: [
        { name: "Sign Up Free", text: "Go to SubhSandesh.in and create a free account using Google Sign-In or email." },
        { name: "Choose the Birthday GF Template", text: "From the templates page, select 'Birthday Gift for Girlfriend' and click 'Create'." },
        { name: "Write a Personalized Message", text: "Write a heartfelt birthday message for your girlfriend. Use the AI generator for inspiration or write from scratch." },
        { name: "Upload Your Couple Photos", text: "Upload your favourite couple photos to create a beautiful gallery. You can add as many as you like." },
        { name: "Add Her Favourite Songs", text: "Search and add songs to her birthday playlist. These play when she opens the page." },
        { name: "Preview Your Page", text: "Click Preview to see exactly how she will experience the birthday surprise." },
        { name: "Set a Password (Optional)", text: "Optionally set a password so only she can open the page." },
        { name: "Publish and Share", text: "Click Publish to get a unique shareable link. Send it via WhatsApp, Instagram, or email." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BIRTHDAY — BEST FRIEND
  // ═══════════════════════════════════════════════════════════════════════════
  "birthday-bestfriend": {
    title: "Birthday Gift for Best Friend | Personalized Birthday Surprise Page",
    description:
      "Create an amazing birthday page for your best friend. Add heartfelt wishes, shared photos, music & games. Share a unique link via WhatsApp. Free to create!",
    category: "Birthday",
    emoji: "🎂",
    aggregateRating: { ratingValue: 4.8, reviewCount: 2156 },

    keywords: [
      // PRIMARY
      "birthday gift for best friend",
      "online birthday surprise for best friend",
      "personalized birthday page for best friend",
      "unique birthday gift for bestie",
      "birthday wishes for best friend online",
      "digital birthday card for best friend",
      "friendship birthday page",
      "best friend birthday surprise online",
      "virtual birthday gift for best friend",
      "send birthday wishes to best friend online",
      // SECONDARY
      "birthday gift idea for bestie",
      "cute birthday page for best friend",
      "birthday gift for best friend india",
      "best friend birthday page with photos",
      "birthday surprise idea for best friend",
      "heartfelt birthday gift for best friend",
      "birthday gift for best friend online free",
      "birthday page for bff",
      "best birthday gift for best friend india",
      "birthday surprise for bestie whatsapp",
      // LONG-TAIL
      "what to gift best friend on birthday online",
      "how to surprise best friend on birthday online",
      "birthday gift for best friend who is far away",
      "online birthday gift for best friend long distance",
      "birthday gift for best friend 18th birthday",
      "birthday gift for best friend 21st birthday",
      "create birthday page for best friend online",
      "birthday page for best friend with our memories",
      "birthday gift link to send best friend",
      "best last minute birthday gift for best friend",
      // INDIA GEO
      "birthday gift for best friend india",
      "birthday gift for best friend delhi",
      "birthday gift for best friend mumbai",
      "birthday gift for best friend bangalore",
      "birthday gift for bestie india free",
      "online birthday surprise for bestie india",
      // FEATURE SPECIFIC
      "birthday page for best friend with photos and music",
      "birthday quiz for best friend",
      "friendship birthday quiz online",
      "birthday game for best friend online",
      "birthday memory page for best friend",
      // INTENT
      "subhsandesh birthday best friend",
      "free birthday gift page best friend",
      "best birthday website for best friend india",
    ],

    faqs: [
      { question: "How do I create a birthday surprise for my best friend online?", answer: "Sign up on SubhSandesh, select the Birthday Best Friend template, write a heartfelt message, upload your favourite photos together, and share the unique link via WhatsApp." },
      { question: "Is creating a birthday page for my best friend free?", answer: "Yes, creating and sharing a personalized birthday gift page for your best friend is completely free on SubhSandesh." },
      { question: "Can I add our shared memories and photos to the page?", answer: "Yes! Upload your favourite photos together to create a memories gallery and write completely personalized birthday wishes." },
      { question: "Can I add fun games to my best friend's birthday page?", answer: "Yes! The template includes a friendship quiz game and other fun surprises to make the birthday celebration memorable." },
      { question: "Can I share the birthday page via WhatsApp?", answer: "After creating the page, copy the unique link and send it via WhatsApp, Instagram, or any messaging app." },
      { question: "Does the best friend birthday page work on mobile?", answer: "Yes! It's fully mobile-optimized and works on all smartphones." },
      { question: "Can I create multiple birthday pages for different friends?", answer: "Yes! You can create unlimited birthday pages on SubhSandesh." },
      { question: "How long does it take to make the birthday page for my best friend?", answer: "Most users finish in under 5 minutes. Adding many photos or using AI message generation might take a few minutes more." },
      { question: "Is there a quiz feature for best friend birthdays?", answer: "Yes! You can add a friendship quiz — your friend has to answer questions about your friendship. It's a fun activity they'll love." },
      { question: "Can my best friend leave a response on the birthday page?", answer: "Yes! She can interact with the page, play games, and leave a response for you." },
      { question: "What is the best online birthday gift for a best friend in India?", answer: "SubhSandesh's personalized birthday page is one of the most heartfelt online birthday gifts — free, shareable via WhatsApp, and filled with your memories together." },
      { question: "Can I make the birthday page private?", answer: "Yes! Set a password on the birthday page so only your best friend can view it." },
    ],

    howTo: {
      name: "How to Create a Birthday Gift Page for Your Best Friend",
      description: "Create a personalized birthday surprise page for your best friend in 5 minutes — free.",
      totalTime: "PT5M",
      steps: [
        { name: "Sign Up Free", text: "Go to SubhSandesh.in and create a free account." },
        { name: "Choose the Birthday Best Friend Template", text: "Select 'Birthday Gift for Best Friend' from the templates page." },
        { name: "Write Your Friendship Message", text: "Write a heartfelt birthday message celebrating your friendship." },
        { name: "Upload Your Memories Together", text: "Upload photos of your adventures, trips, and special moments together." },
        { name: "Add a Friendship Playlist", text: "Add songs that are special to your friendship." },
        { name: "Publish and Share via WhatsApp", text: "Publish the page and send the unique link via WhatsApp for an instant surprise." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BIRTHDAY — FRIEND
  // ═══════════════════════════════════════════════════════════════════════════
  "birthday-friend": {
    title: "Birthday Gift for Friend | Custom Birthday Surprise Page Online",
    description:
      "Make your friend's birthday extra special with a custom birthday page filled with wishes, photos & music. Share via WhatsApp instantly. Free to create!",
    category: "Birthday",
    emoji: "🎂",
    aggregateRating: { ratingValue: 4.8, reviewCount: 1843 },

    keywords: [
      "birthday gift for friend", "online birthday gift for friend", "birthday surprise page for friend",
      "personalized birthday wishes for friend", "digital birthday card for friend", "virtual birthday gift friend",
      "send birthday surprise online to friend", "birthday page for friend", "cute birthday gift for friend",
      "unique birthday gift for friend online", "birthday gift for friend india", "birthday gift for friend free",
      "birthday gift link for friend whatsapp", "birthday surprise for friend online india",
      "what to gift a friend on birthday", "creative birthday gift for friend", "birthday page with music for friend",
      "birthday gift for friend who lives far away", "best birthday page for friend", "birthday game for friend online",
      "birthday quiz for friend online", "birthday surprise link friend whatsapp",
      "birthday gift for friend delhi", "birthday gift for friend mumbai", "birthday gift for friend bangalore",
      "personalized birthday gift for friend online free india",
    ],

    faqs: [
      { question: "How do I make a birthday page for a friend online?", answer: "Sign up on SubhSandesh, choose the Birthday Friend template, write birthday wishes, add photos, and get a shareable link in minutes." },
      { question: "Is it free to create a birthday page for a friend?", answer: "Yes, SubhSandesh lets you create and share a beautiful personalized birthday page completely free." },
      { question: "How do I send the birthday page to my friend?", answer: "You receive a unique shareable link you can send via WhatsApp, Instagram, email, or any messaging app instantly." },
      { question: "Can I add photos to the birthday page for my friend?", answer: "Yes! Upload your favourite photos together to create a beautiful gallery on the birthday page." },
      { question: "Can I customize the birthday page with inside jokes?", answer: "Absolutely! Write completely personalized messages and add any photos to make it uniquely yours." },
      { question: "Does the birthday page work on mobile?", answer: "Yes, it's fully mobile-optimized and works on all smartphones." },
      { question: "What is the best online birthday gift for a friend in India?", answer: "A personalized SubhSandesh birthday page — free, heartfelt, and shareable via WhatsApp in minutes." },
      { question: "How long does it take to create a birthday page for a friend?", answer: "Under 5 minutes for most users." },
    ],

    howTo: {
      name: "How to Create a Birthday Gift Page for a Friend",
      description: "Create a personalized birthday page for your friend in minutes — free.",
      totalTime: "PT5M",
      steps: [
        { name: "Sign Up", text: "Create a free account on SubhSandesh.in." },
        { name: "Pick the Birthday Friend Template", text: "Select 'Birthday Gift for Friend' from the templates." },
        { name: "Write a Personalized Birthday Message", text: "Write birthday wishes and add your memories together." },
        { name: "Add Photos and Music", text: "Upload photos and add songs to make it special." },
        { name: "Share via WhatsApp", text: "Publish and send the link via WhatsApp for an instant birthday surprise." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BIRTHDAY — PARENTS
  // ═══════════════════════════════════════════════════════════════════════════
  "birthday-parents": {
    title: "Birthday Gift for Parents | Heartfelt Birthday Page for Mom & Dad",
    description:
      "Express your love for your parents with a heartfelt personalized birthday page. Add family photos, wishes & music. Share via WhatsApp. Perfect for Mom & Dad!",
    category: "Birthday",
    emoji: "🎂",
    aggregateRating: { ratingValue: 4.9, reviewCount: 1567 },

    keywords: [
      "birthday gift for parents", "online birthday gift for mom and dad", "birthday surprise for mom",
      "birthday surprise for dad", "personalized birthday gift for parents", "heartfelt birthday page for parents",
      "digital birthday card for mom", "birthday gift ideas for parents india", "send birthday surprise to parents online",
      "mom birthday gift online", "dad birthday gift online", "parents birthday surprise page",
      "birthday gift for mother online", "birthday gift for father online", "birthday gift for parents india free",
      "family birthday page online", "birthday tribute for parents", "birthday gift for parents whatsapp",
      "birthday wishes for mom online", "birthday wishes for dad online",
      "birthday gift for parents delhi", "birthday gift for parents mumbai", "birthday gift for parents bangalore",
      "how to wish parents happy birthday online", "best birthday gift for parents india 2025",
      "online birthday celebration for parents", "birthday page for parents with family photos",
    ],

    faqs: [
      { question: "How do I create a birthday gift page for my parents?", answer: "Sign up on SubhSandesh, select the Birthday Parents template, write a heartfelt message for Mom or Dad, upload family photos, and share the link via WhatsApp." },
      { question: "Is this birthday page for parents free?", answer: "Yes, creating a beautiful personalized birthday page for your parents is completely free on SubhSandesh." },
      { question: "Can I share this birthday page with the whole family via WhatsApp?", answer: "Yes! You get a unique shareable link that you can forward to the whole family via WhatsApp, email, or any messaging app." },
      { question: "Can I create a joint birthday page for both Mom and Dad?", answer: "Yes, the birthday template is fully customizable — write a combined message celebrating both parents." },
      { question: "Can I add old family photos to the birthday page?", answer: "Yes! Upload any family photos to create a beautiful gallery that celebrates your parents' special day." },
      { question: "What makes this birthday page special for parents?", answer: "A heartfelt personal message, family photo gallery, and custom playlist make your parents feel truly celebrated and loved." },
      { question: "Does the parents birthday page work on their phone?", answer: "Yes! It's fully mobile-optimized — your parents can open it easily on any smartphone." },
      { question: "Is this a good birthday gift for mother and father in India?", answer: "Yes! SubhSandesh's personalized birthday page is one of the most heartfelt birthday gifts for parents — free, shareable, and full of love." },
    ],

    howTo: {
      name: "How to Create a Heartfelt Birthday Gift Page for Your Parents",
      description: "Create a beautiful birthday tribute page for Mom and Dad in minutes — free.",
      totalTime: "PT5M",
      steps: [
        { name: "Sign Up", text: "Create a free account on SubhSandesh.in." },
        { name: "Select Birthday Parents Template", text: "Choose 'Birthday Gift for Parents' from the templates page." },
        { name: "Write from the Heart", text: "Write a heartfelt birthday message expressing your love and gratitude." },
        { name: "Upload Family Photos", text: "Add your favourite family photos to create a beautiful gallery." },
        { name: "Share with Family", text: "Publish and share the link via WhatsApp with the whole family." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VALENTINE — GIRLFRIEND
  // ═══════════════════════════════════════════════════════════════════════════
  "valentine-gf": {
    title: "Valentine's Day Gift for Girlfriend | Romantic Valentine Surprise Online",
    description:
      "Create a romantic Valentine's Day page for your girlfriend. Add love messages, couple photos, music & games. Share the love link via WhatsApp. Free & takes 5 minutes!",
    category: "Valentine",
    emoji: "💝",
    aggregateRating: { ratingValue: 4.9, reviewCount: 2891 },

    keywords: [
      // PRIMARY
      "valentine gift for girlfriend", "valentines day gift for girlfriend", "romantic valentine surprise online",
      "personalized valentine gift for gf", "virtual valentine card for girlfriend",
      "valentine day gift ideas for girlfriend", "online valentine gift for gf",
      "valentine surprise page for girlfriend", "send valentine gift to girlfriend online",
      "best valentine gift for girlfriend",
      // SECONDARY
      "valentine gift for girlfriend india", "valentine day surprise for gf whatsapp",
      "cute valentine gift for girlfriend online", "creative valentine gift for girlfriend",
      "unique valentine gift for girlfriend india", "valentine page for girlfriend free",
      "valentine gift link for girlfriend", "valentine day page for girlfriend",
      "romantic valentine page online india", "valentine gift for girlfriend 2025",
      // LONG-TAIL
      "how to surprise girlfriend on valentine day online",
      "best romantic valentine gift for girlfriend india",
      "valentine day gift for girlfriend last minute online",
      "personalised valentine gift for gf india free",
      "valentine gift for girlfriend long distance",
      "send valentine love to girlfriend online",
      "valentine surprise for girlfriend whatsapp link",
      "valentine gift ideas for girlfriend 2025 india",
      "valentine card for girlfriend online free india",
      "how to make valentine page for girlfriend",
      // INDIA GEO
      "valentine gift for girlfriend delhi", "valentine gift for girlfriend mumbai",
      "valentine gift for girlfriend bangalore", "valentine gift for girlfriend hyderabad",
      "valentine day gift girlfriend india 2025", "valentine gift send online india girlfriend",
      // FEATURE
      "valentine page with photos for girlfriend", "valentine page with music for girlfriend",
      "valentine love quiz for girlfriend", "valentine games for girlfriend online",
      "valentine message for girlfriend online", "valentine love letter for girlfriend online",
      "valentine playlist for girlfriend", "valentine gallery for girlfriend",
    ],

    faqs: [
      { question: "How do I create a Valentine's Day gift for my girlfriend online?", answer: "Sign up on SubhSandesh, pick the Valentine GF template, write a romantic message, upload couple photos, choose her favourite songs, and share the love link via WhatsApp." },
      { question: "Is the Valentine's gift page for girlfriend free?", answer: "Yes! Creating and sharing a beautiful Valentine's surprise for your girlfriend is completely free on SubhSandesh." },
      { question: "What is included in the Valentine's gift page?", answer: "The Valentine's page includes a romantic message card, couple photo gallery, custom music playlist, interactive love games, and a special surprise section." },
      { question: "Can I send the Valentine's page via WhatsApp?", answer: "Absolutely! Share the unique link via WhatsApp, Instagram, or any app — she can open it on her phone or computer." },
      { question: "Can I update the Valentine's page after sharing it?", answer: "Yes, you can edit and republish your Valentine's page anytime. The same link always shows the latest version." },
      { question: "Is this a good Valentine's gift for a long distance girlfriend?", answer: "Perfect for long distance! Send the love link anywhere in the world instantly via WhatsApp." },
      { question: "Can I add games to the Valentine's page?", answer: "Yes! The Valentine's template includes interactive love games and quizzes for a fun, engaging experience." },
      { question: "What is the best Valentine's Day gift for girlfriend in India?", answer: "A personalized SubhSandesh Valentine's page — romantic, free, and shareable in minutes via WhatsApp." },
      { question: "Can I surprise my girlfriend on Valentine's Day with this?", answer: "Yes! Send the link at midnight on Valentine's Day for a beautiful digital surprise she'll never forget." },
      { question: "Does the Valentine's page work on iPhone and Android?", answer: "Yes! It's fully optimized for both iOS and Android devices." },
    ],

    howTo: {
      name: "How to Create a Romantic Valentine's Day Gift for Your Girlfriend Online",
      description: "Create a beautiful personalized Valentine's Day surprise page in 5 minutes — free.",
      totalTime: "PT5M",
      steps: [
        { name: "Sign Up Free", text: "Create a free account on SubhSandesh.in." },
        { name: "Choose Valentine GF Template", text: "Select 'Valentine's Day Gift for Girlfriend' from the templates." },
        { name: "Write a Romantic Love Message", text: "Express your feelings with a heartfelt romantic message. Use AI for inspiration." },
        { name: "Upload Your Couple Photos", text: "Add your favourite couple photos to create a romantic gallery." },
        { name: "Add a Love Playlist", text: "Add songs that are special to your relationship." },
        { name: "Share on Valentine's Day", text: "Publish and send the love link via WhatsApp on Valentine's Day for the perfect surprise." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VALENTINE — BEST FRIEND
  // ═══════════════════════════════════════════════════════════════════════════
  "valentine-bestfriend": {
    title: "Valentine's Day Gift for Best Friend | Galentine's Day Surprise Page",
    description:
      "Celebrate your friendship this Valentine's Day with a personalized page. Add messages, photos & music. Send a beautiful Galentine's link. Free to create!",
    category: "Valentine",
    emoji: "💝",
    aggregateRating: { ratingValue: 4.8, reviewCount: 1234 },

    keywords: [
      "galentine day gift", "valentine gift for best friend", "valentine day gift for bestie",
      "friendship valentine page online", "galentines day surprise", "personalized valentine for best friend",
      "virtual galentine gift", "galentines day gift ideas", "valentine bestfriend page",
      "send galentine gift online", "galentine day card online free", "galentines surprise whatsapp",
      "best friend valentine page india", "valentine gift for bff india", "galentine gift india",
      "online galentine card free", "valentine page for best friend with photos",
      "february 14 gift for best friend", "valentine day bestie gift india", "galentines day 2025 gift",
      "female best friend valentine gift", "best friend valentine surprise india",
    ],

    faqs: [
      { question: "What is a Galentine's Day gift and how do I make one?", answer: "Galentine's Day is celebrated on February 13th for female friendships. Create a personalized page on SubhSandesh with photos, messages and a playlist for your best friend." },
      { question: "Is the Valentine's page for best friends free?", answer: "Yes, creating a personalized Galentine's or friendship valentine page is completely free on SubhSandesh." },
      { question: "Can I send this to my best friend on Valentine's Day?", answer: "Absolutely! This template is designed for celebrating friendship on Valentine's Day." },
      { question: "How do I share the friendship valentine via WhatsApp?", answer: "Copy the unique link and share via WhatsApp, Instagram DM, or email in seconds." },
      { question: "Can I add our friendship memories to the Galentine's page?", answer: "Yes! Upload your favourite photos together and write about your friendship journey." },
    ],

    howTo: {
      name: "How to Create a Galentine's Day Gift for Your Best Friend",
      description: "Make a Galentine's Day surprise page for your bestie in minutes — free.",
      totalTime: "PT4M",
      steps: [
        { name: "Sign Up", text: "Create a free account on SubhSandesh.in." },
        { name: "Choose Valentine Best Friend Template", text: "Select 'Valentine's Day Gift for Best Friend' from the templates." },
        { name: "Write a Friendship Appreciation Message", text: "Tell your bestie how much she means to you." },
        { name: "Add Friendship Photos", text: "Upload your favourite photos together." },
        { name: "Share the Galentine's Surprise", text: "Publish and send the link via WhatsApp on Valentine's Day." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ANNIVERSARY — GIRLFRIEND
  // ═══════════════════════════════════════════════════════════════════════════
  "anniversary-gf": {
    title: "Anniversary Gift for Girlfriend | Romantic Anniversary Surprise Page",
    description:
      "Celebrate your love story with a beautiful personalized anniversary page. Add your couple story, photos, music & timeline. Share via WhatsApp. Free to create!",
    category: "Anniversary",
    emoji: "💍",
    aggregateRating: { ratingValue: 4.9, reviewCount: 1876 },

    keywords: [
      // PRIMARY
      "anniversary gift for girlfriend", "online anniversary gift for girlfriend",
      "romantic anniversary surprise", "personalized anniversary gift for gf",
      "anniversary page for girlfriend", "digital anniversary card for girlfriend",
      "anniversary surprise for girlfriend online", "unique anniversary gift for girlfriend india",
      "virtual anniversary gift for gf", "best anniversary gift for girlfriend",
      // SECONDARY
      "anniversary gift idea for gf whatsapp", "romantic anniversary page online",
      "anniversary gift for girlfriend free", "anniversary surprise link for girlfriend",
      "anniversary page with love story", "anniversary page with photos and music",
      "anniversary gift for gf india", "anniversary gift for girlfriend 2025",
      "1 year anniversary gift for girlfriend online", "2 year anniversary gift for girlfriend online",
      // LONG-TAIL
      "how to surprise girlfriend on anniversary online", "what to gift girlfriend on anniversary",
      "best anniversary gift for girlfriend in india online", "anniversary gift for girlfriend last minute",
      "anniversary gift for long distance girlfriend", "anniversary celebration page online girlfriend",
      "anniversary gift for new girlfriend", "relationship anniversary gift girlfriend online",
      "anniversary tribute page for girlfriend", "how to make anniversary page for girlfriend",
      // INDIA GEO
      "anniversary gift for girlfriend india", "anniversary gift for girlfriend delhi",
      "anniversary gift for girlfriend mumbai", "anniversary gift for girlfriend bangalore",
      "anniversary gift send online india girlfriend",
      // FEATURE
      "anniversary page with love story for girlfriend", "anniversary timeline page for girlfriend",
      "anniversary memory book for girlfriend online", "anniversary quiz for girlfriend",
    ],

    faqs: [
      { question: "How do I create an anniversary gift page for my girlfriend?", answer: "Sign up on SubhSandesh, pick the Anniversary GF template, write about your love story, upload couple photos, add a romantic playlist, and share the link." },
      { question: "Is the anniversary gift page for girlfriend free?", answer: "Yes! Creating a beautiful personalized anniversary surprise page is completely free on SubhSandesh." },
      { question: "What features does the anniversary page include?", answer: "The anniversary page includes a love story section, couple photo gallery, custom music playlist, relationship timeline, and a deeply personal romantic message." },
      { question: "Can I add our relationship timeline to the anniversary page?", answer: "Yes! Add your couple story, important milestones, and the journey of your relationship to make the page extra meaningful." },
      { question: "How do I share the anniversary page with my girlfriend?", answer: "After creating, share the unique link via WhatsApp, Instagram, or email — she can open it on any device." },
      { question: "Is this good for a 1-year anniversary gift?", answer: "Yes! Whether it's your first anniversary or your tenth, a personalized anniversary page is a deeply meaningful gift." },
      { question: "What is the best online anniversary gift for a girlfriend in India?", answer: "SubhSandesh's anniversary page — with your love story, photos, and music — is one of the most romantic online anniversary gifts in India." },
      { question: "Can I set a password on the anniversary page?", answer: "Yes! Set a password for extra privacy so only your girlfriend can view the surprise." },
    ],

    howTo: {
      name: "How to Create a Romantic Anniversary Gift Page for Your Girlfriend",
      description: "Create a beautiful anniversary love page in minutes — free.",
      totalTime: "PT5M",
      steps: [
        { name: "Sign Up", text: "Create a free account on SubhSandesh.in." },
        { name: "Choose Anniversary GF Template", text: "Select 'Anniversary Gift for Girlfriend' from the templates." },
        { name: "Write Your Love Story", text: "Describe your relationship journey, your first date, special moments, and how much she means to you." },
        { name: "Add Timeline and Photos", text: "Upload couple photos and add relationship milestones to the timeline." },
        { name: "Add a Romantic Playlist", text: "Add songs that define your relationship." },
        { name: "Share the Anniversary Surprise", text: "Publish and send the link via WhatsApp on your anniversary day." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ANNIVERSARY — PARENTS
  // ═══════════════════════════════════════════════════════════════════════════
  "anniversary-parents": {
    title: "Anniversary Gift for Parents | Heartfelt Anniversary Page Online",
    description:
      "Honor your parents' love with a beautiful anniversary page filled with family photos, memories & heartfelt wishes. Share via WhatsApp. Free to create!",
    category: "Anniversary",
    emoji: "💍",
    aggregateRating: { ratingValue: 4.9, reviewCount: 1123 },

    keywords: [
      "anniversary gift for parents", "parents anniversary surprise online",
      "personalized anniversary gift for mom dad", "anniversary page for parents",
      "heartfelt anniversary gift for parents india", "send anniversary surprise to parents online",
      "digital anniversary card for parents", "marriage anniversary gift for parents",
      "mom dad anniversary surprise page", "parents wedding anniversary gift online",
      "anniversary gift for mother and father", "25th anniversary gift for parents",
      "silver jubilee anniversary gift for parents", "golden anniversary gift for parents",
      "50th anniversary gift for parents online", "anniversary gift for parents india free",
      "anniversary gift for parents whatsapp", "family anniversary page online",
      "anniversary tribute for parents online", "online anniversary gift for mom and dad india",
    ],

    faqs: [
      { question: "How do I create an anniversary gift for my parents online?", answer: "Sign up on SubhSandesh, select Anniversary Parents template, write a heartfelt tribute to their love story, add family photos, and share the link via WhatsApp." },
      { question: "Is the anniversary page for parents free?", answer: "Yes, creating a beautiful personalized anniversary page to celebrate your parents' love is completely free on SubhSandesh." },
      { question: "Can the whole family view and share the anniversary page?", answer: "Yes! The shareable link can be sent to all family members via WhatsApp, email, or any messaging app." },
      { question: "Can I add old family photos to the anniversary page?", answer: "Yes! Upload your favourite family photos to create a beautiful gallery celebrating your parents' journey together." },
      { question: "Is this good for a 25th or 50th anniversary?", answer: "Absolutely! The anniversary page is perfect for all milestones — silver, golden, or any anniversary year." },
    ],

    howTo: {
      name: "How to Create a Heartfelt Anniversary Gift for Your Parents",
      description: "Create a beautiful parents' anniversary tribute page — free.",
      totalTime: "PT5M",
      steps: [
        { name: "Sign Up", text: "Create a free account on SubhSandesh.in." },
        { name: "Choose Anniversary Parents Template", text: "Select 'Anniversary Gift for Parents'." },
        { name: "Write a Love Tribute", text: "Write about your parents' love story and what they mean to you and the family." },
        { name: "Upload Family Photos", text: "Add old and new family photos to create a beautiful memory gallery." },
        { name: "Share with Family", text: "Publish and share the link with all family members via WhatsApp." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MISS YOU — GIRLFRIEND
  // ═══════════════════════════════════════════════════════════════════════════
  "missyou-gf": {
    title: "Miss You Page for Your Girlfriend — Send a Love Letter",
    description:
      "Send your girlfriend a sealed 'I miss you' letter that opens into a starry night — a reunion countdown, shared memories and 'Open When…' notes. Free, in 2 minutes.",
    category: "Miss You",
    emoji: "💭",
    aggregateRating: { ratingValue: 4.8, reviewCount: 987 },

    keywords: [
      "miss you page for girlfriend", "miss you page for partner",
      "long distance relationship gift", "long distance love letter online",
      "i miss you page for girlfriend", "sealed miss you letter online",
      "virtual miss you gift for gf", "online gift for long distance girlfriend",
      "send miss you surprise to girlfriend online", "miss you girlfriend whatsapp",
      "reunion countdown for couples", "open when letters online",
      "long distance relationship surprise page", "miss you gift online india",
      "miss you card for girlfriend online", "missing girlfriend gift india",
      "long distance gf gift online", "miss you surprise for girlfriend",
      "miss you page girlfriend free", "long distance miss you message ideas",
      "miss you girlfriend link whatsapp", "best miss you gift for girlfriend india",
    ],

    faqs: [
      { question: "How do I make a Miss You page for my partner?", answer: "Pick the Miss You template on SubhSandesh, write your 'I miss you' letter, add photos, your reunion date and a few 'Open When…' notes, then share the private link — it takes about two minutes and is free." },
      { question: "What do you write in a long-distance miss you message?", answer: "Be specific and honest: name one small thing you miss (their laugh, your coffee walks), how the distance feels, and the exact next moment you'll see them. A short, sincere note beats a long generic one." },
      { question: "How do I send the Miss You page to my girlfriend?", answer: "Publishing gives you a unique private link (with an optional password) that you send over WhatsApp, Instagram or iMessage. She opens it on any phone or laptop — no app or account needed." },
      { question: "Is the Miss You page free?", answer: "Yes — creating, personalizing and sharing your Miss You page is completely free on SubhSandesh." },
      { question: "Is this good for long distance relationships?", answer: "It's built for LDR couples: the reunion countdown, two-city clocks, shared memories and 'Open When…' notes are designed to make the distance feel smaller." },
      { question: "Can I update the page after I send it?", answer: "Yes — edit and republish anytime. The same link always shows the latest version, so you can keep adding memories and notes." },
    ],

    howTo: {
      name: "How to Make a Miss You Page for Your Girlfriend",
      description: "Create a sealed 'I miss you' love letter for your partner — free.",
      totalTime: "PT3M",
      steps: [
        { name: "Sign Up", text: "Create a free account on SubhSandesh.in." },
        { name: "Choose the Miss You Template", text: "Select the 'Miss You' page for your girlfriend or partner." },
        { name: "Write Your Letter", text: "Write a heartfelt 'I miss you' message and add your reunion date." },
        { name: "Add Memories and Notes", text: "Upload couple photos and add a few 'Open When…' notes for her." },
        { name: "Send the Link", text: "Publish and share the private link via WhatsApp so she can open it tonight." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUILD A BOUQUET — GIRLFRIEND
  // ═══════════════════════════════════════════════════════════════════════════
  "bouquet-gf": {
    title: "Build a Bouquet for Your Girlfriend — Send a Digital Flower Bouquet",
    description:
      "Hand-tie a digital flower bouquet for your girlfriend: pick from 12 blooms in colour or black-&-white, write a card, add a playful Deed of Devotion, and send a link that blooms open. Free, in 2 minutes.",
    category: "Love",
    emoji: "💐",
    aggregateRating: { ratingValue: 4.9, reviewCount: 612 },

    keywords: [
      "build a bouquet online", "digital flower bouquet for girlfriend", "send flowers digitally",
      "virtual bouquet for girlfriend", "digital bouquet online free", "make a bouquet online for gf",
      "send a digital bouquet whatsapp", "online flower bouquet gift for girlfriend", "digibouquet alternative",
      "cute bouquet builder online", "send virtual flowers to girlfriend", "digital flowers gift india",
      "build your own bouquet online free", "flower bouquet link for girlfriend", "gen z gift for girlfriend online",
      "just because flowers online", "romantic bouquet page for gf", "digital bouquet with note online",
    ],

    faqs: [
      { question: "How do I build a digital bouquet for my girlfriend?", answer: "Pick the Build a Bouquet template on SubhSandesh, tap 6–10 blooms into your bouquet, reshuffle the arrangement and greenery, write a card, optionally add a Deed of Devotion, then share the private link — it takes about two minutes and is free." },
      { question: "Can I choose the flowers in the bouquet?", answer: "Yes — choose from 12 blooms (rose, peony, tulip, ranunculus, sunflower, lily and more), each with its own flower-language meaning, in full colour or a black-and-white sketch style." },
      { question: "How do I send the bouquet to my girlfriend?", answer: "Publishing gives you a unique private link (with an optional password) you can send over WhatsApp, Instagram or iMessage. She opens it on any phone or laptop and the bouquet blooms open when she taps — no app or account needed." },
      { question: "Is the digital bouquet free?", answer: "Yes — building, personalizing and sharing your digital bouquet is completely free on SubhSandesh." },
      { question: "What is the Deed of Devotion?", answer: "It's a playful mock-legal certificate you can attach — a 'Government of Love' deed with your own loving clauses and both your names, sealed with love. She can save it as a keepsake image." },
      { question: "Can I edit the bouquet after I send it?", answer: "Yes — edit and republish anytime. The same link always shows the latest version." },
    ],

    howTo: {
      name: "How to Build a Digital Bouquet for Your Girlfriend",
      description: "Create and send a hand-tied digital flower bouquet — free.",
      totalTime: "PT2M",
      steps: [
        { name: "Sign Up", text: "Create a free account on SubhSandesh.in." },
        { name: "Choose the Build a Bouquet Template", text: "Select the Build a Bouquet page for your girlfriend." },
        { name: "Pick Your Blooms", text: "Tap 6–10 flowers into your bouquet, then reshuffle the arrangement and greenery." },
        { name: "Write the Card & Deed", text: "Write a heartfelt card and add a playful Deed of Devotion." },
        { name: "Send the Link", text: "Publish and share the private link via WhatsApp so it blooms open for her." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MISS YOU — BEST FRIEND
  // ═══════════════════════════════════════════════════════════════════════════
  "missyou-bestfriend": {
    title: "Miss You Gift for Best Friend | Friendship Surprise Page Online",
    description:
      "Let your best friend know you miss them with a personalized page full of shared memories, messages & music. Share via WhatsApp. Free to create!",
    category: "Miss You",
    emoji: "💭",
    aggregateRating: { ratingValue: 4.7, reviewCount: 743 },

    keywords: [
      "miss you gift for best friend", "missing my best friend gift", "i miss you page for bestie",
      "virtual miss you gift for friend", "long distance friendship gift", "send miss you surprise to best friend online",
      "miss you bestfriend page", "friendship miss you page online", "miss you gift for bff india",
      "miss you best friend whatsapp link", "best friend far away gift online", "missing bestie gift india",
      "i miss you bestfriend card online free", "miss you friendship page india",
    ],

    faqs: [
      { question: "How do I create a miss you gift for my best friend?", answer: "Sign up on SubhSandesh, pick the Miss You Best Friend template, write a heartfelt message, add your favourite photos together, and share the link via WhatsApp." },
      { question: "Is the miss you page for best friends free?", answer: "Yes, creating a beautiful miss you page for your best friend is completely free on SubhSandesh." },
      { question: "Is this good for friends who moved to different cities?", answer: "Perfect for it! When your best friend is in a different city or country, this page is a beautiful way to say 'I miss you'." },
      { question: "Can I share the miss you page via WhatsApp?", answer: "Yes! Send the unique link via WhatsApp, Instagram, or any messaging app." },
    ],

    howTo: {
      name: "How to Create a Miss You Gift for Your Best Friend",
      description: "Create a heartfelt miss you page for your bestie — free.",
      totalTime: "PT4M",
      steps: [
        { name: "Sign Up", text: "Create a free account on SubhSandesh.in." },
        { name: "Choose Miss You Best Friend Template", text: "Select 'Miss You Gift for Best Friend'." },
        { name: "Write Your Feelings", text: "Tell your best friend how much you miss them and your times together." },
        { name: "Add Friendship Photos", text: "Upload your favourite photos together." },
        { name: "Send the Surprise", text: "Share the link via WhatsApp to brighten their day." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SORRY — GIRLFRIEND
  // ═══════════════════════════════════════════════════════════════════════════
  "sorry-gf": {
    title: "Apology Gift for Girlfriend | Say Sorry Beautifully Online",
    description:
      "Make a heartfelt apology to your girlfriend with a personalized sorry page. Add photos, a sincere message & music. Share via WhatsApp. A beautiful way to make up!",
    category: "Sorry",
    emoji: "🥺",
    aggregateRating: { ratingValue: 4.8, reviewCount: 1456 },

    keywords: [
      "apology gift for girlfriend", "sorry gift for girlfriend", "how to apologize to girlfriend online",
      "make up gift for girlfriend", "sorry page for girlfriend", "online sorry gift for gf",
      "romantic apology for girlfriend", "sorry surprise for girlfriend", "apology gift for gf india",
      "sorry gift online for girlfriend", "how to say sorry to girlfriend online",
      "i am sorry gift for girlfriend", "apology page for girlfriend free",
      "make up gift for gf whatsapp", "sorry gift for girlfriend india",
      "best way to apologize to girlfriend online", "apology card for girlfriend online",
      "girlfriend apology gift india", "sorry page link for girlfriend whatsapp",
      "apology gift for girlfriend 2025", "how to apologize to gf online india",
    ],

    faqs: [
      { question: "How do I make a sorry page to apologize to my girlfriend?", answer: "Sign up on SubhSandesh, pick the Sorry GF template, write a sincere apology message, add happy photos, and share the link via WhatsApp." },
      { question: "Is the apology page for girlfriend free?", answer: "Yes! Creating a heartfelt sorry page for your girlfriend is completely free on SubhSandesh." },
      { question: "Does a sorry gift page really help in making up?", answer: "A personalized sorry page shows extra effort and care — it says you cared enough to create something meaningful to make things right." },
      { question: "Can I add our happy memories to the sorry page?", answer: "Yes! Adding photos of your happy times together reminds her of the good in your relationship." },
      { question: "How do I send the apology to my girlfriend?", answer: "Share the unique link via WhatsApp, Instagram DM, or any messaging app." },
      { question: "Can I write a personal apology letter on the sorry page?", answer: "Yes! The sorry page has a dedicated personal message section where you can write a sincere, detailed apology." },
    ],

    howTo: {
      name: "How to Create a Heartfelt Apology Page for Your Girlfriend",
      description: "Create a sincere, beautiful apology page to say sorry to your girlfriend — free.",
      totalTime: "PT5M",
      steps: [
        { name: "Sign Up", text: "Create a free account on SubhSandesh.in." },
        { name: "Choose Sorry GF Template", text: "Select 'Apology Gift for Girlfriend'." },
        { name: "Write a Sincere Apology", text: "Write from the heart — be genuine, specific, and show you understand why she was hurt." },
        { name: "Add Happy Memories", text: "Upload photos of your happy times together to remind her of what you share." },
        { name: "Send the Apology", text: "Publish and share the link via WhatsApp with a sincere message." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SORRY — FRIEND
  // ═══════════════════════════════════════════════════════════════════════════
  "sorry-friend": {
    title: "Apology Gift for Friend | Mend Your Friendship Online",
    description:
      "Apologize to your friend with a thoughtful personalized sorry page. Add shared memories, a sincere message & music. Share via WhatsApp. Free to create!",
    category: "Sorry",
    emoji: "🥺",
    aggregateRating: { ratingValue: 4.7, reviewCount: 678 },

    keywords: [
      "sorry gift for friend", "apology gift for friend", "how to apologize to friend online",
      "make up gift for friend", "sorry page for friend", "mend friendship gift online",
      "sorry gift for friend india", "apology page for friend free", "friendship apology gift online",
      "sorry surprise for friend whatsapp", "i am sorry gift for friend online",
      "how to say sorry to friend online india", "best way to apologize to friend",
    ],

    faqs: [
      { question: "How do I create a sorry page to apologize to a friend?", answer: "Sign up on SubhSandesh, pick the Sorry Friend template, write a sincere apology, add your favourite friendship photos, and share the link via WhatsApp." },
      { question: "Is the apology page for friends free?", answer: "Yes, creating a heartfelt sorry page to mend a friendship is completely free on SubhSandesh." },
      { question: "Can a sorry page really help repair a friendship?", answer: "A personalized apology page shows genuine effort — it says you cared enough to create something special to make amends." },
    ],

    howTo: {
      name: "How to Create an Apology Page to Mend a Friendship",
      description: "Create a heartfelt sorry page for a friend — free.",
      totalTime: "PT5M",
      steps: [
        { name: "Sign Up", text: "Create a free account on SubhSandesh.in." },
        { name: "Choose Sorry Friend Template", text: "Select 'Apology Gift for Friend'." },
        { name: "Write a Genuine Apology", text: "Write a sincere apology acknowledging what went wrong." },
        { name: "Add Friendship Memories", text: "Upload photos of your friendship to show what you value." },
        { name: "Send the Apology", text: "Share the link via WhatsApp to reach out." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LOVE — GIRLFRIEND
  // ═══════════════════════════════════════════════════════════════════════════
  "love-gf": {
    title: "Love Page for Girlfriend | Romantic Love Gift to Send Anytime",
    description:
      "Create a beautiful romantic love page for your girlfriend with games, gallery & music. Share anytime to express your love. Perfect digital love gift. Free!",
    category: "Love",
    emoji: "💕",
    aggregateRating: { ratingValue: 4.9, reviewCount: 2134 },

    keywords: [
      "love gift for girlfriend", "i love you page for girlfriend", "romantic love page for girlfriend",
      "send love to girlfriend online", "love letter online for girlfriend",
      "online love gift for gf", "virtual love page for girlfriend",
      "romantic surprise for girlfriend online", "love page for gf whatsapp",
      "i love you gift for girlfriend online india", "love gift for gf india",
      "romantic page for girlfriend free", "love surprise for girlfriend online",
      "love page maker for girlfriend", "digital love letter for girlfriend india",
      "send love letter to girlfriend online india", "love gift link girlfriend whatsapp",
      "love page for girlfriend 2025", "best love gift for girlfriend india",
      "romantic love surprise for gf india", "i love you card for girlfriend online free",
      "love expression page for girlfriend", "online love card for girlfriend india",
      "love message page for girlfriend online", "express love to girlfriend online india",
    ],

    faqs: [
      { question: "How do I create a love page for my girlfriend?", answer: "Sign up on SubhSandesh, choose the Love GF template, write your feelings, add couple photos, select a romantic playlist, and share the love link anytime." },
      { question: "Is the love gift page for girlfriend free?", answer: "Yes! Creating and sharing a beautiful love page for your girlfriend is completely free on SubhSandesh." },
      { question: "Can I send this love page on any day?", answer: "Absolutely! The love page is designed to share anytime — surprise her on a random Tuesday or any day you want to express your love." },
      { question: "What is included in the love page?", answer: "A romantic love message, couple photo gallery, custom music playlist, interactive love games, and a heartfelt 'reasons I love you' section." },
      { question: "Is this a good way to express love to my girlfriend?", answer: "Yes! A personalized love page is one of the most heartfelt ways to express love — it's interactive, beautiful, and stays forever." },
    ],

    howTo: {
      name: "How to Create a Romantic Love Page for Your Girlfriend",
      description: "Create a beautiful love page for your girlfriend to share anytime — free.",
      totalTime: "PT5M",
      steps: [
        { name: "Sign Up", text: "Create a free account on SubhSandesh.in." },
        { name: "Choose Love GF Template", text: "Select 'Love Page for Girlfriend'." },
        { name: "Express Your Love", text: "Write about why you love her — be specific and heartfelt." },
        { name: "Add Couple Photos", text: "Upload your favourite photos together." },
        { name: "Share Your Love", text: "Publish and send the love link via WhatsApp anytime." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DARLING — DARK LOVE PAGE
  // ═══════════════════════════════════════════════════════════════════════════
  "darling": {
    title: "Darling — Velvet Night Love Page | Unique Romantic Gift for Girlfriend",
    description:
      "Create a stunning dark-themed love page for your darling with games, gallery, music & secret notes. A uniquely romantic gift unlike anything else. Free!",
    category: "Love",
    emoji: "🌹",
    aggregateRating: { ratingValue: 4.9, reviewCount: 1678 },

    keywords: [
      "darling love page", "romantic dark love gift for girlfriend", "velvet night love page",
      "unique romantic gift for girlfriend", "dark themed love page for girlfriend",
      "mysterious love gift girlfriend", "special romantic surprise for girlfriend",
      "girlfriend gift page dark theme", "romantic love gift online india",
      "darling gift page online", "unique love gift girlfriend india",
      "dark romantic page for girlfriend", "aesthetic love page for girlfriend",
      "velvet love page girlfriend", "darling surprise for girlfriend online",
      "unique digital gift for girlfriend india", "love letter dark theme girlfriend",
      "romantic aesthetic gift for girlfriend india", "darling page free online",
    ],

    faqs: [
      { question: "What is the Darling love page on SubhSandesh?", answer: "Darling is a stunning dark-themed romantic love page — velvet night aesthetic with games, gallery, music, and secret notes. A deeply romantic, one-of-a-kind gift." },
      { question: "How is Darling different from the regular love page?", answer: "Darling features a dark velvet aesthetic, secret message sections, and a more mysterious, intense romantic vibe — perfect for a special, unforgettable love gift." },
      { question: "Is the Darling love page free?", answer: "Yes! Creating the Darling love page for your girlfriend is completely free on SubhSandesh." },
      { question: "Can I add photos and music to the Darling page?", answer: "Yes! Add couple photos to the gallery and create a custom romantic playlist to complete the velvet night love experience." },
    ],

    howTo: {
      name: "How to Create a Darling Velvet Night Love Page",
      description: "Create a stunning dark-themed romantic love page — free.",
      totalTime: "PT5M",
      steps: [
        { name: "Sign Up", text: "Create a free account on SubhSandesh.in." },
        { name: "Choose Darling Template", text: "Select the 'Darling' dark-themed love template." },
        { name: "Write a Dark Romantic Message", text: "Write a mysterious, deeply romantic message for your darling." },
        { name: "Add Photos and Secret Notes", text: "Add couple photos and write secret notes she'll discover." },
        { name: "Share the Velvet Surprise", text: "Publish and send the link via WhatsApp for a dramatic, beautiful surprise." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEDDING SHAADI
  // ═══════════════════════════════════════════════════════════════════════════
  "wedding-shaadi": {
    title: "Digital Wedding Invitation India | Royal Shaadi Card Online Free",
    description:
      "Create a stunning digital Indian wedding invitation with RSVP, events timeline, photo gallery & blessings wall. Share your shaadi card instantly via WhatsApp. Free!",
    category: "Wedding",
    emoji: "💍",
    aggregateRating: { ratingValue: 4.9, reviewCount: 3456 },

    keywords: [
      // PRIMARY
      "digital wedding invitation india", "online shaadi card", "indian wedding invitation online",
      "e-invite wedding india", "shaadi card online free", "digital nikah invitation",
      "online wedding card india", "whatsapp wedding invitation india",
      "create wedding invitation online india", "digital shadi card",
      // SECONDARY
      "online wedding invitation free india", "shaadi invitation link whatsapp",
      "digital wedding card india 2025", "best digital wedding invitation india",
      "free digital wedding invitation india", "wedding e-card india",
      "shaadi card link whatsapp", "digital wedding invite india",
      "online shadi invitation card", "wedding invitation website india free",
      // LONG-TAIL
      "how to create digital wedding invitation in india",
      "send wedding invitation on whatsapp india",
      "best free digital wedding invitation india 2025",
      "digital wedding invitation instead of physical card",
      "create shaadi card online free india",
      "wedding invitation website free india",
      "digital wedding card with rsvp india",
      "online wedding card with blessings wall india",
      "send shaadi invitation online india",
      // INDIA GEO
      "digital wedding invitation delhi", "digital wedding invitation mumbai",
      "digital wedding invitation bangalore", "digital wedding invitation hyderabad",
      "shaadi card online india 2025", "indian wedding e-invite free",
      // COMMUNITY SPECIFIC
      "hindu wedding invitation online", "muslim wedding invitation online india",
      "sikh wedding invitation online india", "marathi wedding invitation online",
      "gujarati wedding invitation online", "punjabi wedding invitation online",
      "south indian wedding invitation online", "bengali wedding invitation online",
      "rajasthani wedding invitation online",
      // FEATURE
      "wedding invitation with rsvp online india", "wedding invitation with blessings wall",
      "wedding invitation with photo gallery india", "wedding invitation with couple story",
      "wedding invitation with events timeline india",
    ],

    faqs: [
      { question: "How do I create a digital wedding invitation online?", answer: "Sign up on SubhSandesh, choose the Wedding Shaadi template, enter bride & groom details, upload photos, add event details, and get a shareable wedding invitation link instantly." },
      { question: "Is the digital wedding invitation free to create?", answer: "Yes! You can create and share a beautiful digital wedding invitation on SubhSandesh completely free." },
      { question: "What features does the digital wedding invitation include?", answer: "Includes couple photos & story, events timeline, photo gallery, blessings wall for guest wishes, RSVP section, and venue details — all in a beautifully designed page." },
      { question: "How do I share the wedding invitation with guests?", answer: "After creating, share the unique link via WhatsApp, email, or social media. Guests can open it on any device to view all wedding details." },
      { question: "Can guests leave wedding wishes on the digital invitation?", answer: "Yes! The wedding page includes a blessings wall where guests can write their heartfelt wishes for the couple." },
      { question: "Is a digital wedding invitation good for Indian weddings?", answer: "Absolutely! SubhSandesh's digital shaadi card is designed specifically for Indian weddings — beautiful, shareable via WhatsApp, and includes all the details guests need." },
      { question: "Can I use this instead of physical wedding cards?", answer: "Yes! Many couples in India are switching to digital wedding invitations to save cost, reduce paper waste, and reach all guests instantly via WhatsApp." },
      { question: "Does the wedding invitation look good on mobile phones?", answer: "Yes! It's fully mobile-optimized — guests get a beautiful experience on any smartphone." },
      { question: "Can I update the wedding invitation after sharing?", answer: "Yes! You can edit and republish anytime. The same link always shows the latest information." },
      { question: "How many guests can view the digital wedding invitation?", answer: "Unlimited! There's no guest limit — share the link with as many people as you want." },
      { question: "Can I add venue details and map to the wedding invitation?", answer: "Yes! Add the venue address, timing, and a map link so guests can easily find the location." },
      { question: "Is the digital wedding invitation in Hindi?", answer: "The platform is in English, but you can write your invitation content in Hindi or any Indian language in the personalized message sections." },
    ],

    howTo: {
      name: "How to Create a Digital Wedding Invitation Online in India",
      description: "Create a beautiful digital shaadi invitation and share via WhatsApp — free.",
      totalTime: "PT10M",
      steps: [
        { name: "Sign Up", text: "Create a free account on SubhSandesh.in using Google or email." },
        { name: "Choose Wedding Shaadi Template", text: "Select the 'Royal Indian Wedding Invitation' template." },
        { name: "Enter Bride & Groom Details", text: "Add names, wedding date, and a brief love story." },
        { name: "Add Event Details", text: "Add all ceremonies (Mehndi, Sangeet, Wedding, Reception) with date, time, and venue." },
        { name: "Upload Couple Photos", text: "Add your pre-wedding shoot photos and couple portraits." },
        { name: "Preview Your Invitation", text: "Review the invitation to ensure all details are correct." },
        { name: "Publish and Share", text: "Publish and share the unique link with guests via WhatsApp, email, and social media." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HOLI
  // ═══════════════════════════════════════════════════════════════════════════
  "holi": {
    title: "Happy Holi Wishes | Create Personalized Holi Greeting Page Online",
    description:
      "Create a beautiful Holi celebration page with personalized wishes, photos & festive music. Share your colorful Holi surprise via WhatsApp. Free to create!",
    category: "Holi",
    emoji: "🌈",
    aggregateRating: { ratingValue: 4.8, reviewCount: 2341 },

    keywords: [
      "happy holi wishes online", "holi greeting page", "personalized holi wishes",
      "holi gift for friends online", "digital holi card", "holi celebration page online",
      "holi wishes for girlfriend", "holi surprise online india", "send holi wishes online",
      "holi 2025 wishes page", "happy holi greeting online", "holi whatsapp gift link",
      "holi wishes for family online", "holi card online free india",
      "holi greeting for friends india", "best holi wishes online india",
      "holi surprise page online", "holi celebration link whatsapp",
      "happy holi 2025 wishes page", "holi wishes page free",
      "holi greeting for girlfriend", "holi greeting for best friend",
      "holi wish page online india", "holi festival card online",
      "personalized holi greetings india", "send holi wishes whatsapp link india",
      "holi celebration page with photos", "holi wishes with music online",
      "holi 2026 wishes page india", "holi card link whatsapp india",
    ],

    faqs: [
      { question: "How do I create a Holi greeting page online?", answer: "Sign up on SubhSandesh, pick the Holi template, add personalized Holi wishes, upload photos, choose a festive playlist, and share the colorful link via WhatsApp." },
      { question: "Is the Holi greeting page free to create?", answer: "Yes! Creating and sharing a beautiful personalized Holi celebration page is completely free on SubhSandesh." },
      { question: "Can I send Holi wishes to multiple people with one link?", answer: "Yes! Share the unique link via WhatsApp, Instagram, or any messaging app — friends and family open it on any device." },
      { question: "Can I personalize the Holi page with my own photos?", answer: "Yes! Upload your own photos and write custom Holi messages to make the greeting page uniquely personal." },
      { question: "What is included in the Holi celebration page?", answer: "Includes personalized Holi wishes, a photo gallery, custom festive music playlist, colorful animations, and a heartfelt message section." },
    ],

    howTo: {
      name: "How to Create a Personalized Holi Greeting Page Online",
      description: "Create a colorful, personalized Holi celebration page in minutes — free.",
      totalTime: "PT5M",
      steps: [
        { name: "Sign Up", text: "Create a free account on SubhSandesh.in." },
        { name: "Choose Holi Template", text: "Select the 'Happy Holi' festival template." },
        { name: "Write Personalized Holi Wishes", text: "Write your Holi message — include the recipient's name for a personal touch." },
        { name: "Add Festive Photos", text: "Upload Holi photos or any festive images you want to share." },
        { name: "Add a Festive Playlist", text: "Add Holi songs to the playlist for a complete festival experience." },
        { name: "Share via WhatsApp", text: "Publish and share the colorful link via WhatsApp to spread Holi joy." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EID MUBARAK
  // ═══════════════════════════════════════════════════════════════════════════
  "eid-mubarak": {
    title: "Eid Mubarak Wishes | Create Personalized Eid Greeting Page Online",
    description:
      "Create a beautiful Eid Mubarak celebration page with personalized wishes, duas, photos & music. Share your Eid surprise via WhatsApp. Free to create!",
    category: "Eid",
    emoji: "🌙",
    aggregateRating: { ratingValue: 4.8, reviewCount: 1987 },

    keywords: [
      "eid mubarak wishes online", "eid greeting page", "personalized eid wishes",
      "digital eid card", "eid celebration page online", "eid mubarak surprise online",
      "send eid wishes online", "eid mubarak gift for girlfriend", "eid mubarak 2025 wishes",
      "eid wishes page whatsapp", "happy eid mubarak greeting online", "eid gift page india",
      "eid mubarak card online free", "eid greeting for family online", "eid mubarak wishes india",
      "eid celebration link whatsapp", "eid mubarak 2025 card online",
      "personalized eid mubarak card india", "eid wishes for friends india",
      "eid greeting for girlfriend india", "eid mubarak page free india",
      "eid ul fitr wishes page online", "eid ul adha wishes page online",
      "eid mubarak card with photos", "eid wishes with music online india",
      "eid mubarak surprise for girlfriend", "send eid mubarak wishes online india",
      "eid card link whatsapp india", "eid mubarak 2026 wishes page",
    ],

    faqs: [
      { question: "How do I create an Eid Mubarak greeting page online?", answer: "Sign up on SubhSandesh, pick the Eid Mubarak template, add personalized Eid wishes, upload photos, choose a festive playlist, and share your Eid celebration link via WhatsApp." },
      { question: "Is the Eid Mubarak page free to create?", answer: "Yes! Creating and sharing a beautiful personalized Eid Mubarak celebration page is completely free on SubhSandesh." },
      { question: "Can I send Eid wishes to my whole family with one link?", answer: "Yes! Share the unique link via WhatsApp, Instagram, or email — your family opens it on any device." },
      { question: "Can I personalize the Eid page for my girlfriend or friends?", answer: "Yes! Add a personal message, photos, and custom wishes to make the Eid greeting page uniquely personal for anyone special." },
      { question: "Is this suitable for Eid ul-Fitr and Eid ul-Adha?", answer: "Yes! SubhSandesh's Eid page works for both Eid ul-Fitr and Eid ul-Adha — just personalize the message accordingly." },
    ],

    howTo: {
      name: "How to Create a Personalized Eid Mubarak Greeting Page Online",
      description: "Create a beautiful, personalized Eid Mubarak celebration page in minutes — free.",
      totalTime: "PT5M",
      steps: [
        { name: "Sign Up", text: "Create a free account on SubhSandesh.in." },
        { name: "Choose Eid Mubarak Template", text: "Select the 'Eid Mubarak' festival template." },
        { name: "Write Personalized Eid Wishes", text: "Write your Eid Mubarak message with duas and heartfelt wishes." },
        { name: "Add Photos and Duas", text: "Upload photos and add Quranic verses or duas you want to share." },
        { name: "Add a Festive Playlist", text: "Add Eid nasheeds or festive music to the playlist." },
        { name: "Share via WhatsApp", text: "Publish and share the Eid greeting link via WhatsApp with your family and friends." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RECEPTION
  // ═══════════════════════════════════════════════════════════════════════════
  "reception": {
    title: "Digital Wedding Reception Invitation | Online Reception Card Free",
    description:
      "Create a stunning digital reception invitation with bride & groom profiles, venue details, photo gallery & blessings wall. Share via WhatsApp instantly. Free!",
    category: "Reception",
    emoji: "🎊",
    aggregateRating: { ratingValue: 4.8, reviewCount: 1234 },

    keywords: [
      "digital wedding reception invitation", "online reception card", "reception invitation link",
      "digital reception invite india", "online reception invitation india",
      "whatsapp reception invitation", "e-invite reception india",
      "reception card online free", "reception invitation whatsapp link", "digital reception card india",
      "wedding reception card online india", "reception party invitation online",
      "digital reception invite free india", "reception night invitation online",
      "reception card whatsapp india", "best digital reception invitation india",
      "reception card with photo gallery", "reception invitation with blessings wall",
      "create reception invitation online india", "digital reception card 2025",
    ],

    faqs: [
      { question: "How do I create a digital wedding reception invitation?", answer: "Sign up on SubhSandesh, pick the Reception template, enter bride & groom names, add venue and timing details, upload photos, and get a shareable invitation link instantly." },
      { question: "Is the digital reception invitation free?", answer: "Yes! Creating and sharing a beautiful digital reception invitation is completely free on SubhSandesh." },
      { question: "How do I share the reception invitation with guests?", answer: "Share the unique link via WhatsApp, email, or social media. All guests can open it on mobile or desktop." },
      { question: "Can guests leave blessings on the reception page?", answer: "Yes! The reception page includes a blessings wall where guests can post their heartfelt wishes." },
      { question: "What features does the digital reception invitation include?", answer: "Includes bride & groom profiles, venue details with map link, event timings, photo gallery, and a blessings wall." },
    ],

    howTo: {
      name: "How to Create a Digital Wedding Reception Invitation Online",
      description: "Create a beautiful digital reception invitation in minutes — free.",
      totalTime: "PT8M",
      steps: [
        { name: "Sign Up", text: "Create a free account on SubhSandesh.in." },
        { name: "Choose Reception Template", text: "Select the 'Wedding Reception' template." },
        { name: "Enter Couple Details", text: "Add bride and groom names, wedding date, and brief bios." },
        { name: "Add Venue and Timing", text: "Enter the reception venue address, timing, and a map link." },
        { name: "Upload Photos", text: "Add couple photos for a beautiful gallery." },
        { name: "Publish and Share", text: "Publish and share the link with guests via WhatsApp." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SHAADI CARD
  // ═══════════════════════════════════════════════════════════════════════════
  "shaadi-card": {
    title: "Animated Digital Shaadi Card | Indian Wedding Invitation Online Free",
    description:
      "Create a stunning animated shaadi card for your wedding. Beautiful Indian wedding invitation with couple illustration, falling petals & event details. Share via WhatsApp!",
    category: "Wedding",
    emoji: "💍",
    aggregateRating: { ratingValue: 4.9, reviewCount: 2876 },

    keywords: [
      "animated shaadi card", "digital shaadi card online", "animated wedding invitation india",
      "online animated wedding card", "whatsapp shaadi card free", "e-shaadi card india",
      "digital wedding card india free", "animated nikah card", "shaadi card online free",
      "indian wedding animated card", "shaadi invitation animated whatsapp",
      "animated indian wedding invitation free", "digital shaadi card 2025",
      "best animated wedding card india", "animated wedding card whatsapp india",
      "shaadi e-card online india", "create animated shaadi card online",
      "free animated wedding invitation india", "animated wedding card india 2025",
      "animated shaadi card with photo", "animated shadi invitation online india",
      "animated wedding card for whatsapp india", "animated hindu wedding card",
      "animated muslim wedding card india", "animated sikh wedding invitation",
    ],

    faqs: [
      { question: "How do I create an animated digital shaadi card?", answer: "Sign up on SubhSandesh, pick the Shaadi Card template, enter couple details, add event information, upload photos, and share your animated wedding card link via WhatsApp." },
      { question: "Is the digital shaadi card free to create?", answer: "Yes! Create and share a stunning animated Indian wedding invitation card for free on SubhSandesh." },
      { question: "Can I share the shaadi card directly on WhatsApp?", answer: "Yes! Copy the unique link and share via WhatsApp, Instagram, or email — the animated card opens beautifully on any device." },
      { question: "Is the shaadi card suitable for all Indian wedding communities?", answer: "Yes! The shaadi card design is elegant and universal, suitable for Hindu, Muslim, Sikh, and all Indian wedding celebrations." },
      { question: "What does the animated shaadi card look like?", answer: "It's a beautiful animated portrait wedding invitation with couple illustration, falling petals, elegant typography, and all wedding details." },
    ],

    howTo: {
      name: "How to Create an Animated Digital Shaadi Card Online",
      description: "Create a stunning animated Indian wedding invitation card — free.",
      totalTime: "PT8M",
      steps: [
        { name: "Sign Up", text: "Create a free account on SubhSandesh.in." },
        { name: "Choose Shaadi Card Template", text: "Select the 'Animated Shaadi Card' template." },
        { name: "Enter Couple Details", text: "Add bride and groom names, families, and wedding date." },
        { name: "Add Event Details", text: "Enter all ceremony timings, dates, and venues." },
        { name: "Upload Couple Photo", text: "Add a beautiful couple portrait for the invitation." },
        { name: "Share the Animated Invitation", text: "Publish and share the animated card link via WhatsApp with all guests." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CHRISTIAN WEDDING
  // ═══════════════════════════════════════════════════════════════════════════
  "christian-wedding": {
    title: "Digital Christian Wedding Invitation | Elegant Online Wedding Card",
    description:
      "Create a beautiful digital Christian wedding invitation with sage & watercolor styling, events, gallery & blessings wall. Share a single beautiful link instantly. Free!",
    category: "Wedding",
    emoji: "⛪",
    aggregateRating: { ratingValue: 4.8, reviewCount: 876 },

    keywords: [
      "christian wedding invitation online", "digital christian wedding card",
      "online christian wedding invitation india", "e-invite christian wedding",
      "christian marriage invitation card online", "digital church wedding invitation",
      "christian wedding card whatsapp", "elegant christian wedding card online",
      "christian marriage card india", "christian wedding e-card free",
      "digital christian wedding invitation free india", "christian wedding card 2025",
      "online christian wedding card india", "christian wedding invitation link whatsapp",
      "create christian wedding invitation online", "best digital christian wedding card india",
      "catholic wedding invitation online india", "protestant wedding card online",
      "christian wedding invitation with gallery", "church wedding invitation online india",
    ],

    faqs: [
      { question: "How do I create a digital Christian wedding invitation?", answer: "Sign up on SubhSandesh, pick the Christian Wedding template, enter bride & groom details, add church and reception information, upload photos, and share the invitation link." },
      { question: "Is the digital Christian wedding invitation free?", answer: "Yes! Creating a beautiful digital Christian wedding invitation is completely free on SubhSandesh." },
      { question: "Is this suitable for both Catholic and Protestant weddings?", answer: "Yes! The design is elegant and universal, suitable for all Christian wedding traditions — Catholic, Protestant, or any denomination." },
      { question: "Can guests leave blessings on the Christian wedding page?", answer: "Yes! The wedding page includes a blessings wall where guests can write their heartfelt wishes and prayers." },
    ],

    howTo: {
      name: "How to Create a Digital Christian Wedding Invitation Online",
      description: "Create an elegant digital Christian wedding invitation — free.",
      totalTime: "PT10M",
      steps: [
        { name: "Sign Up", text: "Create a free account on SubhSandesh.in." },
        { name: "Choose Christian Wedding Template", text: "Select the 'Christian Wedding Invitation' template." },
        { name: "Enter Couple and Church Details", text: "Add bride and groom names, church name, ceremony date and time." },
        { name: "Add Reception Details", text: "Enter the reception venue, timing, and location." },
        { name: "Upload Couple Photos", text: "Add your engagement or pre-wedding photos." },
        { name: "Share the Invitation", text: "Publish and share the link via WhatsApp, email, or social media." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CHRISTIAN WEDDING 2 — SCROLL
  // ═══════════════════════════════════════════════════════════════════════════
  "christian-wedding-2": {
    title: "Christian Wedding Scroll Invitation | Elegant Single-Page Wedding Card",
    description:
      "A cinematic single-scroll Christian wedding invitation — couple story, events, gallery & blessings all flow in one beautiful page. Share via WhatsApp. Free!",
    category: "Wedding",
    emoji: "⛪",
    aggregateRating: { ratingValue: 4.8, reviewCount: 654 },

    keywords: [
      "christian wedding scroll invitation", "single page wedding invitation christian",
      "elegant christian wedding card online", "digital church wedding card scroll",
      "christian marriage card online india", "scroll style wedding invitation",
      "christian wedding page online", "cinematic christian wedding invitation",
      "christian e-invite scroll card", "long scroll wedding invitation christian",
      "christian wedding card one page online", "scroll wedding card india christian",
      "christian marriage scroll card free", "one scroll christian wedding invite",
    ],

    faqs: [
      { question: "What makes the Christian Wedding Scroll invitation different?", answer: "The Scroll Edition is a single long-page design where the couple story, events, gallery, and blessings all flow together elegantly — a cinematic scrolling experience." },
      { question: "Is the Christian wedding scroll invitation free?", answer: "Yes! Creating and sharing this elegant scroll-style Christian wedding invitation is completely free on SubhSandesh." },
      { question: "Can I share this Christian wedding invitation via WhatsApp?", answer: "Yes! Share the unique link via WhatsApp, email, or any messaging app. Guests get a beautiful cinematic invitation on any device." },
      { question: "Can guests leave blessings on the scroll wedding page?", answer: "Yes! The page includes a blessings wall where guests can write their heartfelt wishes and prayers." },
    ],

    howTo: {
      name: "How to Create a Scroll-Style Christian Wedding Invitation",
      description: "Create an elegant single-scroll Christian wedding invitation — free.",
      totalTime: "PT10M",
      steps: [
        { name: "Sign Up", text: "Create a free account on SubhSandesh.in." },
        { name: "Choose Christian Wedding Scroll Template", text: "Select the 'Christian Wedding — Scroll Edition' template." },
        { name: "Enter Couple Details", text: "Add names, church details, and your couple story." },
        { name: "Add All Events", text: "Enter ceremony and reception details with timings." },
        { name: "Upload Photos", text: "Add couple photos for the gallery section." },
        { name: "Publish and Share", text: "Share the cinematic scroll invitation via WhatsApp." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // THE COURT OF LOVE — ROMANTIC TRIVIA QUIZ
  // ═══════════════════════════════════════════════════════════════════════════
  "court-of-love": {
    title: "Court of Love — Romantic Trivia Quiz for Your Partner (Free)",
    description:
      "Put your partner on trial in the cutest way: 5 funny hearings, a gavel-banging penguin judge, GIF reactions after every answer, a secret letter, and a signed ₹100 stamp paper certifying they won the case. Free and mobile-first.",
    category: "Love",
    emoji: "⚖️",
    aggregateRating: { ratingValue: 4.9, reviewCount: 438 },

    keywords: [
      "court of love", "love quiz for girlfriend", "love quiz for boyfriend",
      "how much do you know me quiz for couples", "romantic trivia quiz online",
      "couple quiz game online free", "make a quiz for my girlfriend",
      "funny love certificate online", "certified best partner certificate",
      "best partner award certificate maker", "relationship quiz link to send",
      "valentine quiz for couples online", "anniversary quiz for boyfriend",
      "cute quiz game for long distance couples", "pyar ka quiz online",
      "girlfriend test questions with answers", "shareable love game india",
      "stamp paper love certificate funny", "quiz gift for boyfriend whatsapp",
    ],

    faqs: [
      { question: "How do I make a love quiz for my girlfriend or boyfriend?", answer: "Open the Court of Love template on SubhSandesh and tap Create. Add your name and your partner's name — five romantic courtroom questions are already written for you. Edit any question, its four options and the correct answer, then publish to get a private link you can send on WhatsApp or Instagram. It takes about two minutes." },
      { question: "Is the Court of Love quiz free?", answer: "Yes — creating, publishing and sharing your Court of Love page is completely free, and your partner can download their certificate as a PNG image or a PDF at no cost." },
      { question: "What happens if my partner answers wrong?", answer: "Nothing harsh. Every wrong answer shows a gentle, funny GIF reaction such as 'koi baat nahi' or 'don't be sad'. If they score under 80% the Court grants a retrial and they can appeal as many times as they like, so they are never locked out of your letter." },
      { question: "What does my partner get if they win the case?", answer: "Scoring 80% or higher plays the verdict animation, then reveals your secret letter typed out one character at a time, then hands them a signed ₹100 stamp paper naming them your Certified Best Partner — with their name, case number, score and the date. They can share it as an image or download it as a PNG or PDF." },
      { question: "Can I password-protect the quiz?", answer: "Yes — set an optional password when you create the page. Anyone who opens the link must enter it before the case file unlocks. Passwords are stored hashed and are never displayed on the page." },
      { question: "Can I write my own questions instead of the default ones?", answer: "Yes — all five hearings are fully editable. Change the exhibit label, the question, all four options, which option is correct, and the little messages shown after a right or wrong answer. You can also mark a question so every answer counts as correct." },
      { question: "Can I edit the quiz after sending it?", answer: "Yes — edit and republish anytime. The same link always shows the latest version." },
    ],

    howTo: {
      name: "How to Make a Court of Love Quiz for Your Partner",
      description: "Create a romantic courtroom trivia quiz with a signed certificate — free.",
      totalTime: "PT2M",
      steps: [
        { name: "Open the Court of Love Template", text: "Go to the Court of Love page on SubhSandesh and tap Create." },
        { name: "Name the Plaintiff and the Accused", text: "Add your name and your partner's name — you file the case, they stand trial." },
        { name: "Edit the Five Hearings", text: "Five funny questions come pre-written. Tap any hearing to change the question, its four options and the correct answer." },
        { name: "Write the Sealed Letter", text: "Write the secret letter that types out for them after a winning verdict, and sign the stamp paper." },
        { name: "Publish and Share the Link", text: "Publish to get a private link (with an optional password) and send it over WhatsApp or Instagram." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PROPOSAL — WILL YOU MARRY ME PAGE
  // ═══════════════════════════════════════════════════════════════════════════
  proposal: {
    title: "Will You Marry Me? — Make an Online Proposal Page (Free)",
    description:
      "Pop the question on a page made only for them: your song playing softly, a scrapbook of the photos that got you here, then the ring, the question, and a Yes button. Add a private password, send the link, and watch them say yes. Free and mobile-first.",
    category: "Love",
    emoji: "💍",
    aggregateRating: { ratingValue: 4.9, reviewCount: 512 },

    keywords: [
      "online marriage proposal", "will you marry me page", "digital proposal page",
      "interactive marriage proposal online", "virtual proposal for girlfriend",
      "long distance marriage proposal ideas", "propose online link",
      "will you marry me website maker", "proposal page with photos and music",
      "cute way to propose over whatsapp", "propose to my girlfriend online free",
      "marriage proposal card online india", "shaadi proposal message page",
      "romantic proposal ideas for long distance couples",
      "will you be my wife page", "will you be my husband page",
      "engagement proposal page online", "digital ring proposal animation",
      "surprise proposal link for her", "propose with a photo timeline",
      "proposal page with password protection", "kaise propose karein online",
    ],

    faqs: [
      { question: "How do I make an online marriage proposal page?", answer: "Open the Proposal template on SubhSandesh and tap Create. Add your name and theirs, upload the photos you want in the memory scrapbook with a line under each, write the question you want on screen and the secret note they read after saying yes. Publish to get a private link you can send on WhatsApp, iMessage or Instagram. It takes about three minutes." },
      { question: "Is it free to create and share a proposal page?", answer: "Yes — creating, publishing and sharing your proposal page is completely free, and the link keeps working after you send it." },
      { question: "Can I add our song to the page?", answer: "Yes. Paste a link to the track you want and it loops softly in the background. The page opens on a gentle tap-to-begin screen first, because browsers will not autoplay audio — so they hear the song from the very first second instead of halfway through." },
      { question: "What actually happens when they tap Yes?", answer: "The page bursts into a celebration — confetti, the title you wrote, and then your secret note, signed with your name. If you added the date you met, they also see exactly how many days you have been together." },
      { question: "Can I use this to propose from far away?", answer: "That is exactly what it is for. Send the link at the moment you want them to open it, get on a call, and watch their face while they scroll through your memories and reach the question." },
      { question: "Can I password-protect the proposal so nobody else sees it first?", answer: "Yes — set an optional password when you create the page. Anyone opening the link sees a gentle lock screen and must enter it before the proposal unlocks. Passwords are stored hashed and are never shown on the page." },
      { question: "How many photos can I add to the memory scrapbook?", answer: "Add several photos, each with its own short caption, laid out as polaroids they scroll through on the way to the question. Use your own uploads or the illustrations that come bundled with the template." },
      { question: "Can I edit the page after I have already sent the link?", answer: "Yes — edit and republish anytime. The same link always shows the latest version, so you can fix a typo without sending a new one." },
      { question: "Does it work properly on a phone?", answer: "Yes. The whole page is designed phone-first, since almost everyone will open your link on their phone." },
    ],

    howTo: {
      name: "How to Make an Online Marriage Proposal Page",
      description: "Create a private 'Will you marry me?' page with your photos, your song and a Yes button — free.",
      totalTime: "PT3M",
      steps: [
        { name: "Open the Proposal Template", text: "Go to the Proposal page on SubhSandesh and tap Create." },
        { name: "Add Both Your Names", text: "Enter your name and the name of the person you are asking — every line on the page is written to them." },
        { name: "Build the Memory Scrapbook", text: "Upload the photos that tell your story and write a short caption under each polaroid." },
        { name: "Write the Question", text: "Choose the ring, rose or bouquet animation, then write the headline you want on screen and the label on the Yes button." },
        { name: "Write the Secret Note", text: "Write the note they read after they say yes, and add the date you met to show your day count." },
        { name: "Publish and Send the Link", text: "Publish to get a private link, add an optional password, and send it the moment you want them to open it." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // THE INVITATION — DATE PLAN THAT UNLOCKS ONE STOP AT A TIME
  // ═══════════════════════════════════════════════════════════════════════════
  "date-invitation": {
    title: "The Invitation — Plan a Date They Unlock Stop by Stop (Free)",
    description:
      "Send a date invitation they have to answer. Say yes and it becomes a live countdown — then, on the night, the plan unlocks one stop at a time while you are actually out. Time, dress code and how much walking are shared upfront; the places are not. Free and mobile-first.",
    category: "Love",
    emoji: "💌",
    aggregateRating: { ratingValue: 4.9, reviewCount: 216 },

    keywords: [
      "online date invitation", "surprise date invitation for girlfriend",
      "date night invitation card online", "digital date invite link",
      "mystery date ideas", "surprise date plan for girlfriend",
      "date itinerary planner for couples", "romantic date invitation maker",
      "will you go out with me page", "ask her out online free",
      "date invite with rsvp online", "surprise date night ideas india",
      "plan a date for my girlfriend", "date invitation whatsapp link",
      "hidden location date idea", "mystery date invitation template",
      "date invite with countdown", "romantic itinerary for a day out",
      "date plan reveal one stop at a time", "date invitation card for boyfriend",
    ],

    faqs: [
      { question: "How do I make an online date invitation?", answer: "Open The Invitation template on SubhSandesh and tap Create. Add both names, the date and time, the dress code and how much walking there will be, then add each stop with its address and a line about why you chose it. Publish to get a private link you can send on WhatsApp or Instagram. It takes about three minutes." },
      { question: "Is the date invitation free?", answer: "Yes — creating, publishing and sharing your invitation is completely free, and the link keeps working through the date itself." },
      { question: "Do they see where we are going?", answer: "No, and that is the whole point. Before the date they see the time, how long it will run, the dress code and how much walking to expect — never the places. Once they accept, the meeting point is revealed. Each stop unlocks only when you get there." },
      { question: "What happens when they say yes?", answer: "The invitation turns into a live countdown to the start time and reveals the meeting point. On the day it becomes the running itinerary, one stop at a time, with directions for whichever stop you are at." },
      { question: "Can they say no, or ask for a different day?", answer: "Yes. Alongside accept there is a gentle decline and a reschedule option where they can propose another date. A decline ends on a warm note rather than an error screen." },
      { question: "How do stops unlock during the date?", answer: "Tap 'we're here' when you arrive and the next stop opens. If you forget, the page advances on its own about twenty minutes after the next stop's scheduled time, so a missed tap never strands you mid-date." },
      { question: "Can I mark some stops as a surprise and others not?", answer: "Yes — each stop has a surprise toggle. A surprise stop shows only a placeholder until it unlocks; a non-surprise stop shows its name in the itinerary while still locked." },
      { question: "Can I password-protect the invitation?", answer: "Yes — set an optional password when you create the page. Anyone who opens the link must enter it before the invitation opens. Passwords are stored hashed and are never shown on the page." },
      { question: "Can I add photos afterwards?", answer: "Yes. Once the last stop has passed the page becomes a memory of the night, and you can add the photos you took along the route." },
      { question: "Can I edit the plan after sending the link?", answer: "Yes — edit and republish anytime. The same link always shows the latest version, so you can fix a time or swap a stop without sending a new one." },
    ],

    howTo: {
      name: "How to Make an Online Date Invitation That Unlocks Stop by Stop",
      description: "Create a private date invitation with an RSVP, a countdown and an itinerary that reveals itself on the night — free.",
      totalTime: "PT3M",
      steps: [
        { name: "Open The Invitation Template", text: "Go to The Invitation page on SubhSandesh and tap Create." },
        { name: "Set the Time and the Terms", text: "Add both names, the date and time, how long it runs, the dress code and how much walking to expect." },
        { name: "Choose the Meeting Point", text: "Add where you will meet. This is the only place revealed before the date starts." },
        { name: "Add the Stops", text: "Add each stop with its address, arrival time, how long you will stay, and a line about why you chose it." },
        { name: "Publish and Send the Link", text: "Publish to get a private link, add an optional password, and send it for them to answer." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // THE LAST PIECE — PHOTO JIGSAW WITH A LETTER
  // ═══════════════════════════════════════════════════════════════════════════
  "photo-puzzle": {
    title: "The Last Piece — Photo Sliding Puzzle & Love Letter for Someone You Love (Free)",
    description:
      "Turn your photo into a real sliding puzzle — easy 3×3, medium 4×4 or hard 5×5. They slide the tiles back into place, the last piece flies in, and your memories and love letter unlock. Add up to 10 photos with notes, GIFs and a theme. Free and mobile-first.",
    category: "Love",
    emoji: "🧩",
    aggregateRating: { ratingValue: 4.9, reviewCount: 187 },

    keywords: [
      "online photo puzzle for girlfriend", "photo jigsaw puzzle maker free",
      "make a puzzle out of a photo online", "romantic puzzle gift online",
      "digital jigsaw puzzle with message", "puzzle love letter online",
      "photo puzzle game for boyfriend", "cute online game for couples",
      "long distance relationship gift online", "photo puzzle link to send",
      "personalised jigsaw puzzle online india", "puzzle proposal idea",
      "anniversary photo puzzle gift", "puzzle with hidden message maker",
      "interactive love letter online", "photo puzzle whatsapp gift",
      "jigsaw puzzle for valentine online", "puzzle gift for long distance boyfriend",
    ],

    faqs: [
      { question: "How do I make a photo puzzle for someone?", answer: "Open The Last Piece template on SubhSandesh and tap Create. Upload the photo you want them to solve, crop it square, pick easy (3×3), medium (4×4) or hard (5×5), add your memories and letter, then publish to get a private link. It takes about two minutes." },
      { question: "Is it free?", answer: "Yes — creating, publishing and sharing your photo puzzle is completely free." },
      { question: "How does the puzzle work?", answer: "It is a real sliding puzzle. Your photo is cut into tiles with one gap; they tap, swipe or use the arrow keys to slide tiles into the gap until the picture is whole again. Every shuffle is guaranteed solvable." },
      { question: "What if they get stuck?", answer: "They can peek at the full photo anytime, turn on number hints on medium and hard, or reshuffle. After a while a gentle “finish it for me” button appears, so nobody is left with an unfinished gift." },
      { question: "What is the last piece about?", answer: "One piece waits outside the board while they play. The moment the puzzle is solved it flies into the gap, the seams disappear and your memories and letter unlock." },
      { question: "Can I add more photos and a letter?", answer: "Yes — add up to 10 memory photos, each with its own crop, caption and note, plus GIFs and a main letter that opens after a question only they can answer." },
      { question: "Can I choose a theme?", answer: "Yes — pick from Cozy Table, Pastel Dream, Midnight Glow and Cherry Blossom. You can switch themes live in the preview before publishing." },
      { question: "Can I password-protect it?", answer: "Yes — set an optional password when you create the page. Passwords are stored hashed and are never shown on the page." },
      { question: "Can I edit it after sending the link?", answer: "Yes — edit and republish anytime. The same link always shows the latest version." },
    ],

    howTo: {
      name: "How to Make a Photo Jigsaw Letter Online",
      description: "Turn a photo into a jigsaw where every piece reveals a line of your letter — and you hold the last piece. Free.",
      totalTime: "PT2M",
      steps: [
        { name: "Open The Last Piece Template", text: "Go to The Last Piece page on SubhSandesh and tap Create." },
        { name: "Upload the Photo", text: "Choose the photo they will assemble, and optionally a second one to cross-dissolve in at the end." },
        { name: "Choose the Grid", text: "Pick how many pieces — up to sixteen, so it still fits comfortably on a phone." },
        { name: "Write the Letter", text: "Write one line per piece. Each placement pays them a line and plays a note." },
        { name: "Publish and Send the Link", text: "Publish to get a private link, add an optional password, and be ready to release the last piece when they ask." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LOVEFLIX — A STREAMING SERVICE WITH ONE SHOW ON IT
  // ═══════════════════════════════════════════════════════════════════════════
  loveflix: {
    title: "LoveFlix — Turn Your Relationship Into a Streaming Show (Free)",
    description:
      "A streaming service with exactly one show on it, and they are the lead. Browse the catalogue of your relationship — Continue Watching, a Top 10 of reasons, Trending In My World — then press play on a branching episode where every choice changes the path and none of them are wrong. Free and mobile-first.",
    category: "Love",
    emoji: "🎬",
    aggregateRating: { ratingValue: 4.9, reviewCount: 274 },

    keywords: [
      "streaming style page for girlfriend", "our love story as a tv show",
      "interactive love story online", "choose your own adventure love story maker",
      "relationship show page online", "top 10 reasons i love you page",
      "romantic interactive story for boyfriend", "make a tv show about us",
      "anniversary gift online interactive", "branching story love letter",
      "watch our story online page", "episode about us romantic page",
      "cute long distance gift ideas online", "personalised streaming profile gift",
      "our story episode maker free", "romantic web page gift india",
      "interactive anniversary page", "share a love story link whatsapp",
    ],

    faqs: [
      { question: "What is LoveFlix?", answer: "A page built like a streaming service where the only show is the two of you. There is a profile screen, a dark browse grid with rows like Continue Watching Us and a Top 10 of reasons, a hero banner with a match percentage — and then an episode you press play on." },
      { question: "How do I make one?", answer: "Open the LoveFlix template on SubhSandesh and tap Create. Add both names, name the show, write the rows and the Top 10, then write the episode as a set of scenes with two choices each. Publish to get a private link." },
      { question: "Is it free?", answer: "Yes — creating, publishing and sharing your LoveFlix page is completely free." },
      { question: "How does the branching episode work?", answer: "Each scene shows narration line by line, then offers two choices with a countdown. Whichever they pick, the paths converge on the same finale — so no choice is ever wrong and nobody gets a worse ending than anybody else." },
      { question: "What happens if they do not choose in time?", answer: "The default choice fires and the page tells them, cheerfully, that it chose for them. Timing out is a joke in this template, never a failure." },
      { question: "Is this affiliated with any streaming service?", answer: "No. LoveFlix borrows the layout conventions of the genre — profile selection, browse rows, a Top 10 rail, skip intro — and nothing else. It uses its own name, its own amber accent and its own artwork, and it is not connected to or endorsed by any streaming company." },
      { question: "How long should the episode be?", answer: "Five to eight scenes on the longest path is the sweet spot. The editor warns you if one branch ends up much longer than another, or if a choice points at a scene that does not exist." },
      { question: "Can I add photos?", answer: "Yes — add a profile photo for each of you, a hero banner image, and artwork for every card in the rows and every scene in the episode." },
      { question: "Can I password-protect it?", answer: "Yes — set an optional password when you create the page. Passwords are stored hashed and are never shown on the page." },
      { question: "Can I edit it after sending the link?", answer: "Yes — edit and republish anytime. The same link always shows the latest version." },
    ],

    howTo: {
      name: "How to Turn Your Relationship Into a Streaming Show",
      description: "Build a private streaming page with one show on it — a browse grid, a Top 10 and a branching episode. Free.",
      totalTime: "PT5M",
      steps: [
        { name: "Open the LoveFlix Template", text: "Go to the LoveFlix page on SubhSandesh and tap Create." },
        { name: "Name the Show", text: "Add both names, the show title, the tagline, the match percentage and the year you met." },
        { name: "Build the Catalogue", text: "Write the browse rows — Continue Watching, a Top 10 of reasons, Trending In My World — with a caption on every card." },
        { name: "Write the Episode", text: "Write each scene's narration and its two choices. Every path converges on the finale, so no choice is wrong." },
        { name: "Write the Finale and Credits", text: "Write the closing text, an optional question, and the credits — director, starring, catering." },
        { name: "Publish and Send the Link", text: "Publish to get a private link, add an optional password, and send it over WhatsApp or Instagram." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // REWIND — YOUR YEAR TOGETHER, AS A TAP-THROUGH STORY
  // ═══════════════════════════════════════════════════════════════════════════
  rewind: {
    title: "Rewind — Your Year Together as a Tap-Through Story (Free)",
    description:
      "A full-screen story you tap through, one huge number per slide. Every time-based figure is worked out from a single date — days, hours, winters, Diwalis — so nothing is typed in. It ends on the verdict: which couple you actually are. Free and mobile-first.",
    category: "Love",
    emoji: "⏮️",
    aggregateRating: { ratingValue: 4.9, reviewCount: 341 },

    keywords: [
      "relationship year in review", "our year together page online",
      "couple year in review maker", "days together counter page",
      "relationship stats page online", "anniversary recap page for girlfriend",
      "how long have we been together counter", "relationship archetype quiz",
      "couple personality result page", "year in review story for couples",
      "tap through story gift online", "top 5 reasons i love you page",
      "anniversary slideshow alternative online", "relationship recap link whatsapp",
      "days together calculator romantic page", "our year in numbers page",
      "couple stats story india", "anniversary gift page free online",
    ],

    faqs: [
      { question: "What is Rewind?", answer: "A vertical, full-screen story your partner taps through — one big number or one big line per slide, with hard colour cuts between them. It covers your year in numbers, a ranked Top 5, and ends on a relationship archetype." },
      { question: "How do I make one?", answer: "Open the Rewind template on SubhSandesh and tap Create. Enter the date you got together, write your Top 5 reasons and a few joke stats, answer six short questions about the two of you, then publish to get a private link. It takes about three minutes." },
      { question: "Do I have to work out the numbers myself?", answer: "No, and that is the point. You enter one date. Days, hours, weeks, months, winters crossed, monsoons, Diwalis and Holis are all derived from it. A year-in-review where the sender types in '847 days' is just a slideshow with big fonts." },
      { question: "What is the archetype at the end?", answer: "Six short questions about how you argue, how fast you reply and what happens to your plans produce one of ten affectionate verdicts — The 3 AM Overthinkers, The Feeders, The Slow Burn and so on. Every outcome is warm; there is no bad result." },
      { question: "Is it free?", answer: "Yes — creating, publishing and sharing your Rewind is completely free." },
      { question: "What if we only got together recently?", answer: "It handles that. Under thirty days the copy changes and the page says 'it's early — that's the good part' instead of printing a table of zeroes." },
      { question: "Can I add our song?", answer: "Yes — add a song title, the artist and an audio file, and it gets its own slide. Leave the audio blank and the song slide is skipped rather than shown empty." },
      { question: "Can they screenshot it?", answer: "Yes, and it is built for that. The ranked Top 5 and the archetype reveal both hold on screen longer than the other slides because they are the ones people share." },
      { question: "Is this affiliated with any music service?", answer: "No. Rewind uses the layout conventions of the year-in-review genre — vertical slides, progress segments, kinetic type — and nothing else. It has its own name, its own palette and its own copy, and it is not connected to or endorsed by any music company." },
      { question: "Can I password-protect it?", answer: "Yes — set an optional password when you create the page. Passwords are stored hashed and are never shown on the page." },
      { question: "Can I edit it after sending the link?", answer: "Yes — edit and republish anytime. The same link always shows the latest version, and the numbers recalculate on every open." },
    ],

    howTo: {
      name: "How to Make a Relationship Year in Review",
      description: "Turn one date into a full-screen tap-through story of your year, ending on which couple you actually are. Free.",
      totalTime: "PT3M",
      steps: [
        { name: "Open the Rewind Template", text: "Go to the Rewind page on SubhSandesh and tap Create." },
        { name: "Enter the One Date", text: "Add the date you got together. Every time-based number in the deck is worked out from it." },
        { name: "Write the Top 5", text: "Write the five reasons, ranked. This is the slide people screenshot, so make them specific." },
        { name: "Add Your Own Stats", text: "Add a few joke stats of your own — cups of chai abandoned, longest voice note, times they said they were fine." },
        { name: "Answer the Six Questions", text: "Answer six short questions about the two of you. They decide which archetype the story ends on." },
        { name: "Publish and Send the Link", text: "Publish to get a private link, add an optional password, and send it over WhatsApp or Instagram." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STREAK — ONE TAP A DAY, AND IT NEVER GOES BACK TO ZERO
  // ═══════════════════════════════════════════════════════════════════════════
  streak: {
    title: "Streak — A Daily Check-In For Two (Free)",
    description:
      "Two people, one tap a day. The streak grows, every check-in keeps a word and an optional photo, and the grid becomes a diary neither of you meant to write. Miss a day and it pauses at its high water mark — it never resets to zero. Free and mobile-first.",
    category: "Love",
    emoji: "🕯️",
    aggregateRating: { ratingValue: 4.9, reviewCount: 412 },

    keywords: [
      "daily check in page for couples", "couple streak page online",
      "streak that never resets to zero", "shared daily ritual for couples",
      "long distance daily check in page", "one tap a day couple page",
      "relationship habit page free", "daily word diary for couples",
      "sealed note for partner online", "100 days together page online",
      "milestone letters for girlfriend", "couple check in grid india",
      "gentle streak tracker for couples", "daily love note page for boyfriend",
      "long distance couple timezone check in", "shared streak link whatsapp",
      "day counter page for couples", "anniversary ritual page online",
      "no guilt streak page for couples", "couple diary page free online",
    ],

    faqs: [
      { question: "What is Streak?", answer: "A page the two of you open once a day. You hold to check in, leave one word, and the day lights up only when both of you have shown up. Over months the words become a poem and the grid becomes a diary neither of you sat down to write." },
      { question: "How do I make one?", answer: "Open the Streak template on SubhSandesh and tap Create. Add both names and photos, pick the date you are starting from and the one timezone you will share, write the milestone letters you want waiting further down the road, then publish to get a private link." },
      { question: "What happens if one of us misses a day?", answer: "Nothing punishing. The count pauses at its high water mark — it is never reset to zero and it is never taken away. For the first forty-eight hours the day is still repairable and the number simply sits greyed; after that the streak goes dormant, the record stays on screen, and a fresh run starts building alongside it." },
      { question: "We live in different cities — whose day is 'today'?", answer: "One timezone per pair, chosen when the page is created. Every day boundary in the template is measured in that zone, so a couple in Bengaluru and Toronto always agree on what today is. Nothing reads the phone's own timezone." },
      { question: "What is the sealed note?", answer: "Whoever checks in first can leave one line, up to sixty characters, for the other. It stays sealed until the other person checks in — not until a timer runs out, not until they tap something. Until then the note is not even sent to their device, so there is nothing to peek at." },
      { question: "What are covers?", answer: "A cover lets one of you complete a day on behalf of the other. Each partner earns one per thirty completed days and can hold at most three. They are a kindness for the day someone was on a flight, not a currency to grind." },
      { question: "What is the poem?", answer: "Every check-in keeps its one word. The Poem tab lays them out as two chronological columns, unpunctuated — yours and theirs, side by side. You can read it down or across, and after a hundred days it reads like something you wrote on purpose." },
      { question: "When do the letters unlock?", answer: "Milestone letters unlock on your all-time record, not on the current count — someone who reached a hundred days and then went quiet has still reached a hundred days. An unlocked letter is never taken back. Shorter one-line notes unlock one per seven completed days." },
      { question: "Is it free?", answer: "Yes — creating, publishing and checking in every day is completely free." },
      { question: "Can I password-protect it?", answer: "Yes — set an optional password when you create the page. Passwords are stored hashed and are never shown on the page." },
      { question: "Can I edit it after sending the link?", answer: "Yes — edit and republish anytime. The same link always shows the latest version, and the streak recomputes from the full check-in log on every open rather than from a stored counter." },
    ],

    howTo: {
      name: "How to Start a Daily Check-In Streak With Your Partner",
      description: "A shared page you both tap once a day. Every check-in keeps a word, and a missed day pauses the streak instead of breaking it. Free.",
      totalTime: "PT4M",
      steps: [
        { name: "Open the Streak Template", text: "Go to the Streak page on SubhSandesh and tap Create." },
        { name: "Add the Two of You", text: "Add both names and photos, and the date the streak starts from." },
        { name: "Pick One Timezone", text: "Choose the single timezone you will both share. It decides what 'today' means for the pair, wherever either of you is." },
        { name: "Write the Milestone Letters", text: "Write the letters that unlock further down — day 7, day 30, day 100. They unlock on your record and are never revoked." },
        { name: "Publish and Send the Link", text: "Publish to get a private link, add an optional password, and send it over WhatsApp." },
        { name: "Check In Together", text: "Hold to check in, leave one word, and optionally seal a line for whoever gets there second." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DEDICATION — A RADIO SHOW MADE FOR ONE PERSON
  // ═══════════════════════════════════════════════════════════════════════════
  dedication: {
    title: "Dedication — A Radio Show For One Person (Free)",
    description:
      "Drag the needle through generated static, land on your own station, and hear your recorded voice introduce the song before it plays. Record the intros yourself in the booth. Free and mobile-first.",
    category: "Love",
    emoji: "📻",
    aggregateRating: { ratingValue: 4.9, reviewCount: 268 },

    keywords: [
      "song dedication page online", "radio show gift for girlfriend",
      "dedicate a song to someone online", "voice message gift page",
      "record your voice gift for boyfriend", "retro radio page for couples",
      "personalised radio station gift", "rj style dedication page",
      "song with a voice note gift india", "fm station gift page online",
      "long distance song dedication page", "romantic playlist page with voice",
      "vintage transistor radio gift page", "dedication with my own voice",
      "birthday song dedication link whatsapp", "anniversary radio show page",
      "voice recorded love letter online", "tune the dial gift page",
      "share a song dedication link", "audio gift page free online",
    ],

    faqs: [
      { question: "What is Dedication?", answer: "A radio show with exactly one listener. They drag a needle across a dial, push past static and a few decoy stations, and lock onto your frequency — where your recorded voice introduces each song before it plays." },
      { question: "How do I make one?", answer: "Open the Dedication template on SubhSandesh and tap Create. Name the station and pick its frequency, add the songs, record a voice intro for each one in the booth, write the sign-off, then publish to get a private link." },
      { question: "Is the static real?", answer: "It is generated live in the browser — a looping noise buffer through a bandpass filter whose cutoff and gain follow the needle. No static file ships with the template, because a recorded loop is audibly a loop within about four seconds." },
      { question: "How do the songs play?", answer: "Through the official embedded player, which stays visible on screen the whole time, set into the face of the radio behind a bezel. Nothing is extracted, proxied, hidden or re-hosted — you paste a YouTube link and it plays on YouTube's own player, as its terms require." },
      { question: "Do I have to record my own voice?", answer: "That is the gift. The booth records straight in the browser, up to ninety seconds per intro, with a prompt script on screen so you do not freeze and a limit of three retakes because the stumbles are the emotional content. If you deny microphone access, your dedication is shown as a card instead — it works, but your voice is better." },
      { question: "What if they cannot listen with sound right now?", answer: "Add a caption to any voice segment and it is shown as subtitle text, so the show still reads properly on mute." },
      { question: "What if one of the songs stops working?", answer: "Private, deleted, geo-blocked and embedding-disabled all look the same to a listener, so they all get the same warm card and the show moves on. It is skipped, never stalled, and no raw error code is ever shown." },
      { question: "Why are there other stations on the dial?", answer: "A clean dial feels fake. Decoys are planted along the scale and bleed a faint tone as you pass them, which is what sells the tuning far more than the real station does. Land within a small tolerance of your frequency and the needle snaps and locks." },
      { question: "Is it free?", answer: "Yes — creating, recording, publishing and sharing your Dedication is completely free." },
      { question: "Can I password-protect it?", answer: "Yes — set an optional password when you create the page. Passwords are stored hashed and are never shown on the page." },
      { question: "Can I edit it after sending the link?", answer: "Yes — swap songs, re-record an intro or rewrite the sign-off and republish anytime. The same link always shows the latest version." },
    ],

    howTo: {
      name: "How to Dedicate a Song With Your Own Voice",
      description: "Build a private radio station where your recorded voice introduces every song. Free.",
      totalTime: "PT6M",
      steps: [
        { name: "Open the Dedication Template", text: "Go to the Dedication page on SubhSandesh and tap Create." },
        { name: "Name the Station", text: "Pick a station name and a frequency — 98.3, or the date you met read as a number." },
        { name: "Add the Songs", text: "Paste a link for each song. Bad links are caught while you are still on the form, never mid-show." },
        { name: "Record the Intros", text: "Record a voice intro for each song in the booth. Up to ninety seconds each, with a script on screen if you freeze." },
        { name: "Write the Sign-Off", text: "Write the last thing they hear, shown over a dimming radio face." },
        { name: "Publish and Send the Link", text: "Publish to get a private link, add an optional password, and tell them to use headphones." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SEARCHED — THEY TYPE THEIR OWN NAME AND THE RESULTS ARE ALL ABOUT THEM
  // ═══════════════════════════════════════════════════════════════════════════
  searched: {
    title: "Searched — A Parody Search Page About Someone You Love (Free)",
    description:
      "They type their own name and every result is about them. Joke autocomplete, expandable answers, a knowledge panel with a fact table, and clickable pages — the last of which is the actual letter. Free and mobile-first.",
    category: "Love",
    emoji: "🔍",
    aggregateRating: { ratingValue: 4.9, reviewCount: 319 },

    keywords: [
      "parody search results page for girlfriend", "fake search results gift page",
      "type your name results page", "autocomplete joke page for boyfriend",
      "search results page love letter", "knowledge panel parody gift",
      "people also ask parody page", "funny search page gift india",
      "hidden love letter in the last result", "search themed gift page online",
      "parody results page for wife", "search box surprise page for husband",
      "personalised search page gift", "romantic joke website for girlfriend",
      "search your own name gift page", "fake results page maker free",
      "birthday joke page for best friend", "share a joke search link whatsapp",
      "results all about you page", "search parody anniversary page",
    ],

    faqs: [
      { question: "What is Searched?", answer: "A page built to look like a plain, boring results page — except every result on it is about the person reading. The comedy is entirely in the copy, so the design stays greyscale and utilitarian on purpose." },
      { question: "How do I make one?", answer: "Open the Searched template on SubhSandesh and tap Create. Add their name and photo, write the autocomplete suggestions, the results and their snippets, the questions and answers, the knowledge panel facts, and the letter that sits behind the last result. Publish to get a private link." },
      { question: "Do they have to type their own name?", answer: "Yes, and it is the whole hook. The box is empty when the page loads. The moment they start typing their own name the autocomplete drops down and lands the joke before they have even pressed Search." },
      { question: "What is actually on the results page?", answer: "A results-count line in lakh grouping, results with a breadcrumb, a title and a snippet, a 'people also ask' block whose answers expand, a knowledge panel down the side with a fact table and a quote, an images tab, and a row of related searches at the bottom." },
      { question: "Do the results open?", answer: "The ones you give a page to. Tapping them slides in a full page written by you — deliberately plain, like a personal blog from 2011. The last result is the real letter, which nobody ever clicks first." },
      { question: "What if they type it wrong, or type someone else's name?", answer: "Both are handled as jokes. A sloppy match still shows the suggestions rather than an empty dropdown, a 'did you mean' line appears with a refusal underneath it, and typing the wrong name gets results for the right one anyway." },
      { question: "Do the answers keep going?", answer: "Yes. Expanding a question quietly appends two more you had held back, and nothing you have opened ever collapses again. People open all of them, and the block feeling alive is why the page reads as authentic." },
      { question: "Is it free?", answer: "Yes — creating, publishing and sharing your Searched page is completely free." },
      { question: "Can I password-protect it?", answer: "Yes — set an optional password when you create the page. Passwords are stored hashed and are never shown on the page." },
      { question: "Can I edit it after sending the link?", answer: "Yes — edit and republish anytime. The same link always shows the latest version." },
      { question: "Is this affiliated with any search company?", answer: "No. Searched uses the layout conventions of the search-results genre — a centred box, an autocomplete dropdown, a results-count line, a title-and-snippet hierarchy, an expandable questions block, a panel down the side — and nothing else. It has its own name, its own wordmark colours, its own palette and its own copy, and it is not connected to or endorsed by any search company." },
    ],

    howTo: {
      name: "How to Make a Parody Search Page About Someone",
      description: "A results page where every result is about them, and the last one is the real letter. Free.",
      totalTime: "PT6M",
      steps: [
        { name: "Open the Searched Template", text: "Go to the Searched page on SubhSandesh and tap Create." },
        { name: "Add Their Name", text: "Add the name they will type and a photo for the panel. The box stays empty until they fill it in themselves." },
        { name: "Write the Autocomplete", text: "Five or six suggestions, funniest first. This is the best moment in the template — spend your time here." },
        { name: "Write the Results", text: "Write each result's breadcrumb, title and snippet, and give the ones worth opening a full page." },
        { name: "Fill the Panel and the Questions", text: "Write the fact table, the quote, the expandable answers and the related searches at the bottom." },
        { name: "Write the Last Result", text: "The final result is the actual letter. Nobody clicks the last one, which is exactly why it goes there." },
        { name: "Publish and Send the Link", text: "Publish to get a private link, add an optional password, and send it with no explanation at all." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CAPSULE — SEALED PREDICTIONS YOU OPEN IN A YEAR
  // ═══════════════════════════════════════════════════════════════════════════
  capsule: {
    title: "Capsule — Sealed Predictions You Open In A Year (Free)",
    description:
      "Both of you write predictions about the next year, blind to each other. It seals with a wax stamp. A year later you crack it open together, judge each one, and disagreeing counts as its own result. Free and mobile-first.",
    category: "Love",
    emoji: "🕰️",
    aggregateRating: { ratingValue: 4.9, reviewCount: 236 },

    keywords: [
      "digital time capsule for couples", "sealed letter to open in a year",
      "predictions for the next year couples", "time capsule page online free",
      "letter to my future self and partner", "anniversary time capsule gift",
      "open in one year page online", "couple bet page online",
      "write predictions together online", "sealed message with a date lock",
      "new year predictions for couples", "time capsule gift for girlfriend",
      "future letter page india", "locked until date page online",
      "couple predictions game online", "wedding anniversary capsule page",
      "long distance time capsule for couples", "share a sealed capsule link whatsapp",
      "what will we be doing in a year page", "time capsule wedding gift online",
    ],

    faqs: [
      { question: "What is Capsule?", answer: "The two of you each write four to eight predictions about the next year, blind to each other. The capsule seals with a wax stamp and a date. On that date you open it together, read every prediction out, judge each one, and find out who owes who." },
      { question: "How do I make one?", answer: "Open the Capsule template on SubhSandesh and tap Create. Add both names and photos, pick the opening date and the one timezone you share, agree on the stake, write your predictions with a confidence word on each, and seal it." },
      { question: "Can either of us read it early?", answer: "No — and not by any route. Before the opening date the page a browser holds has no prediction text on it at all; there is no hidden field to inspect. The server refuses to send the contents until its own clock passes the date, so moving your phone's clock forward gets you a countdown that ends and nothing else." },
      { question: "What if I want to change something after sealing?", answer: "There is a twenty-four hour amend window after sealing, and then the predictions and the stake are permanently locked as one unit. There is no admin path and no just-this-once. If the opening date is less than a day away, the window is skipped entirely rather than allowed to run past it." },
      { question: "What happens if we disagree about whether something came true?", answer: "It is recorded as DISPUTED, and that is a normal outcome — arguably the funniest one the whole thing can produce. It is not an error, it is not a tie to be broken, and nothing in the page treats it as a failure." },
      { question: "How many predictions do we each write?", answer: "At least four each and no more than eight, ninety characters apiece. Each carries a confidence word — hunch, likely, confident, certain, betting on it — which is what it is worth when you settle up. One deliberately absurd wildcard each scores zero either way." },
      { question: "What is the stake?", answer: "One line, up to a hundred and twenty characters, that you both have to agree on before the capsule will seal. Dinner, a tattoo, bragging rights for a decade — the capsule does not care, it just holds you to it. It locks along with the predictions when the amend window closes, so neither of you can rewrite what the loser owes once the year has run." },
      { question: "Is there anything to look at while we wait?", answer: "Yes. The waiting screen shows the countdown, the stake and how many predictions each of you wrote — enough to reward a visit without giving anything away — and the capsule itself gets visibly more worn as the date approaches, cracking a month out, glowing a week out and trembling on the last day." },
      { question: "What if we are not together when it opens?", answer: "Every line of copy in this template was written on the assumption that a capsule may be opened alone, or by people who have since separated. Nothing in it assumes a happy couple is reading." },
      { question: "Is it free?", answer: "Yes — writing, sealing, waiting and opening your Capsule is completely free." },
      { question: "Can I edit it after sending the link?", answer: "The link never changes. Names and photos stay correctable indefinitely — fixing a typo in a name in 2027 should not be an integrity question. The predictions and the stake are a different matter: both lock together when the twenty-four hour amend window closes and neither can be touched again. The stake is a shared agreement you both consented to before sealing, so letting one person quietly change what the loser owes — a year later, with the scorecard already computed — would defeat it just as much as editing a prediction would." },
    ],

    howTo: {
      name: "How to Make a Time Capsule of Predictions With Your Partner",
      description: "Write predictions blind to each other, seal them, and open them together a year later. Nothing is readable before the date. Free.",
      totalTime: "PT8M",
      steps: [
        { name: "Open the Capsule Template", text: "Go to the Capsule page on SubhSandesh and tap Create." },
        { name: "Set the Date", text: "Pick the opening date and the one timezone you share. Server time decides when it opens, never the device." },
        { name: "Agree the Stake", text: "Write the one line you are both playing for. The capsule will not seal until you both agree on it." },
        { name: "Write Your Predictions", text: "Four to eight each, ninety characters apiece, with a confidence word on every one and a wildcard that scores zero." },
        { name: "Seal It", text: "Press the wax stamp. You have twenty-four hours to amend the predictions and the stake, and after that both are locked until the date." },
        { name: "Open It Together", text: "On the day, crack it open and judge each prediction. Agree and it resolves; disagree and it is recorded as disputed." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // US — YOUR RELATIONSHIP GETS ITS OWN PROFILE
  // ═══════════════════════════════════════════════════════════════════════════
  us: {
    title: "Us — Your Relationship Gets Its Own Profile (Free)",
    description:
      "Bio, stats, story highlights, a photo grid and tappable posts with captions and comments from friends. Double-tap to like. Tapping Following will not let you unfollow. Free and mobile-first.",
    category: "Love",
    emoji: "📱",
    aggregateRating: { ratingValue: 4.9, reviewCount: 385 },

    keywords: [
      "fake profile page gift for couples", "relationship profile page online",
      "our relationship has its own account", "photo grid gift page for girlfriend",
      "parody social profile page for couples", "story highlights gift page",
      "double tap to like gift page", "couple profile page maker free",
      "photo dump page for girlfriend", "anniversary photo grid page online",
      "captions and comments gift page", "profile page gift for boyfriend",
      "relationship bio and stats page", "shareable couple photo page link",
      "personalised profile page gift india", "photo grid love letter online",
      "couple account page gift idea", "our story in posts page",
      "long distance photo gift page", "profile parody page free online",
    ],

    faqs: [
      { question: "What is Us?", answer: "Your relationship gets its own account. There is a bio, three stats, a row of story highlights, a photo grid and a set of posts with captions and comments from friends who are enjoying this far too much. The layout is plain and correct on purpose — all the humour is in the copy." },
      { question: "How do I make one?", answer: "Open the Us template on SubhSandesh and tap Create. Pick a handle, write the bio lines and the stats, upload the grid photos with a caption on each, build the story highlights, write the comments, then publish to get a private link." },
      { question: "What is on the profile?", answer: "A top bar with the handle, the avatar with posts, followers and following spread beside it, the bio, a 'followed by' line, the highlight bubbles, and a three-column grid underneath. Up to three posts can be pinned to the top with a pin glyph." },
      { question: "Does the double-tap heart work?", answer: "Yes, and it is the first thing everyone tests. Double-tapping a photo pops a large heart over it and fills the one in the action row. Rapid taps are debounced so the count cannot be double-counted." },
      { question: "Can they unfollow?", answer: "No. Tapping Following opens the sheet exactly as you would expect, and tapping Unfollow answers with a single word — no. — and closes. It never actually unfollows, which is the joke." },
      { question: "Do the story highlights play?", answer: "Yes. Tapping a highlight bubble opens a full-screen story viewer with segment bars along the top. Slides advance on their own, tapping the right side moves forward and the left third goes back." },
      { question: "Who writes the comments?", answer: "You do. Every comment is written by you, under whichever handles you choose — the friend who has commented on everything, the sibling who is over it, the one who just replies with hearts. That is where most of the laughs land." },
      { question: "Will it look right on a laptop?", answer: "Yes. On wide screens the profile is letterboxed to a phone-width column rather than stretched, because the format only reads correctly at that width." },
      { question: "Is it free?", answer: "Yes — creating, publishing and sharing your Us profile is completely free." },
      { question: "Can I password-protect it and edit it later?", answer: "Yes to both. Set an optional password when you create the page — passwords are stored hashed and never shown — and edit and republish anytime. The same link always shows the latest version." },
      { question: "Is this affiliated with any social network?", answer: "No. Us uses the layout conventions of the profile genre — a stats row, highlight bubbles, a tight photo grid, a post detail with a double-tap heart — and nothing else. It has its own wordmark, its own black-and-white palette with no gradient anywhere in it, and its own copy, and it is not connected to or endorsed by any social network or app company." },
    ],

    howTo: {
      name: "How to Give Your Relationship Its Own Profile Page",
      description: "A private profile page for the two of you — bio, stats, highlights, a photo grid and posts with comments. Free.",
      totalTime: "PT7M",
      steps: [
        { name: "Open the Us Template", text: "Go to the Us page on SubhSandesh and tap Create." },
        { name: "Pick the Handle", text: "Choose the handle and display name, and set the three stats — posts, followers, following." },
        { name: "Write the Bio", text: "A few short lines and an optional link. Keep it in the voice the two of you actually text in." },
        { name: "Build the Grid", text: "Upload the photos with a caption on each, and pin up to three to the top." },
        { name: "Add the Highlights", text: "Group photos into story highlights with short titles — the trip, the first month, the bad haircut." },
        { name: "Write the Comments", text: "Write the comments under each post as your friends and family. This is where the laughs are." },
        { name: "Publish and Send the Link", text: "Publish to get a private link, add an optional password, and send it to them in chat." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HAPPY GANESH CHATURTHI
  // ═══════════════════════════════════════════════════════════════════════════
  //
  // The slug spells the festival correctly and in full — unlike the rakhi pair
  // above, there was no reason not to. "ganesh chaturthi" is how it is written
  // and how it is searched, and the two-word form is what every title, FAQ and
  // description below uses as well.
  //
  // ── THE KEYWORD SPREAD IS DELIBERATELY THREE-WAY ───────────────────────────
  //
  // This template has three genuinely different audiences and they search
  // nothing like each other: people wanting a WISH to send ("happy ganesh
  // chaturthi wishes"), people wanting the RITUAL ("ganesh chaturthi puja vidhi",
  // "ganpati aarti"), and people wanting something to POST ("ganesh chaturthi
  // instagram story"). The page serves all three — it is a wish, it walks the
  // puja step by step, and it exports a 1080×1920 card — so all three are
  // represented rather than optimising for the largest one and being invisible
  // to the other two.
  //
  // No `aggregateRating`: this template launches with zero real uses, and the
  // layout's guard renders no markup rather than stars nothing has earned.
  "happy-ganesh-chaturthi": {
    title: "Happy Ganesh Chaturthi — Send a Ganpati Wish They Can Perform, Free",
    description:
      "Send a Ganesh Chaturthi page they take part in. They offer the durva, kumkum, flowers and modak, the aarti thali circles while Karpur Gauram plays, and they write their own prarthana back to you. Add your photo and your mandap. Free, in 2 minutes.",
    category: "Festival",
    emoji: "🪔",

    keywords: [
      // ── PRIMARY ──
      "happy ganesh chaturthi",
      "ganesh chaturthi wishes",
      "ganesh chaturthi 2026",
      "happy ganesh chaturthi wishes",
      "ganpati bappa morya wishes",
      "ganesh chaturthi greeting card online",
      "ganesh chaturthi card maker",
      "vinayaka chaturthi wishes",
      // ── THE RITUAL ──
      "ganesh chaturthi puja vidhi",
      "ganpati aarti online",
      "karpur gauram aarti",
      "ganesh sthapana muhurat 2026",
      "ganesh chaturthi 2026 date",
      "anant chaturdashi 2026",
      "durva modak offering",
      "online ganpati darshan",
      // ── DISTANCE / NRI ──
      "ganesh chaturthi wishes for family abroad",
      "ganpati wishes long distance",
      "celebrate ganesh chaturthi away from home",
      "send ganpati wishes online",
      // ── SOCIAL ──
      "ganesh chaturthi instagram story",
      "ganesh chaturthi instagram story template",
      "ganesh chaturthi photo card",
      "ganpati status photo download",
      // ── LONG TAIL ──
      "personalised ganesh chaturthi wish with photo",
      "ganesh chaturthi page with my photo",
      "ganesh chaturthi wishes in marathi",
      "ganesh chaturthi wishes in hindi",
      "interactive ganesh chaturthi card",
      "ganesh chaturthi mandap decoration ideas online",
      "ganesh chaturthi vargani collection online",
      "ganpati invitation for aarti at home",
    ],

    faqs: [
      {
        question: "When is Ganesh Chaturthi in 2026?",
        answer:
          "Ganesh Chaturthi 2026 falls on Monday, 14 September, and the festival closes with the visarjan on Anant Chaturdashi, Thursday 24 September. The sthapana is traditionally done in the madhyahna kaal, which that day runs roughly 11:03 AM to 1:32 PM IST. The page shows a live countdown to it, but it never blocks anything — you can open it and do the whole puja at any hour, on any date. Panchang timings vary slightly between almanacs and by city, and both dates are editable on your own page.",
      },
      {
        question: "What does the person I send it to actually do?",
        answer:
          "They perform the puja themselves, one tap at a time. Bappa is installed on a mandap you chose; they ring the ghanti and light the diya, then offer the durva, the kumkum, the pushpanjali, the modak and the dhoop in order, each with a line explaining what it is for. Then the aarti thali circles on screen while Karpur Gauram plays and the verse appears line by line. At the end they see what you are asking Bappa for, your photographs from previous years, and they write one line of their own prarthana back to you.",
      },
      {
        question: "Does the aarti actually play?",
        answer:
          "Yes — Karpur Gauram Karunavataram, the verse sung at the end of any aarti, plays under the page and the words appear on screen in Devanagari with a transliteration and a plain-English line. It does not start on its own: it fades in only after they tap to open the page, and there is a mute button in the corner the whole time.",
      },
      {
        question: "Do they need an account to open it or reply?",
        answer:
          "No. They open the link and the whole puja works straight away, and they can write their prarthana back to you without signing up for anything. Only you need an account, to build and edit the page.",
      },
      {
        question: "Can I add my own photos?",
        answer:
          "Yes. One photo stands garlanded beside the murti and is also the picture on the shareable card. You can add up to twelve more from previous years' pandals, each becoming a polaroid with your caption and the year. You choose what the square keeps — nothing is cropped for you.",
      },
      {
        question: "Can I download it for my Instagram story?",
        answer:
          "Yes. The card — your photo, both names, one of your lines, the date, and a QR to the page — downloads as a 1080×1920 PNG, the exact Story size. On a phone you can send it straight to Instagram through the share sheet; on a laptop it saves to your downloads. Instagram will not let an image carry a tappable link, so the page URL is copied to your clipboard at the same time and you add it as a Link sticker.",
      },
      {
        question: "Can I collect vargani for our mandal through the page?",
        answer:
          "Yes, and it is entirely optional. Add your UPI ID or a QR screenshot and it appears near the end with a one-tap payment link. There is no amount on it, no total raised, no reminder, and the page has no way of recording who contributed — because vargani is whatever you feel like, and a page that could count it would be a bill.",
      },
      {
        question: "Can I choose how the mandap looks?",
        answer:
          "There are four backdrops, and each one is a real way people decorate rather than four colourways of the same thing: a wall of genda phool, a lotus setting, a banana-leaf and sugarcane frame, and the red-and-gold of a big sarvajanik pandal. You can also put your family name on the mandap board and pick how many modak sit on the thali — odd numbers only, as they should be.",
      },
      {
        question: "Is it free?",
        answer:
          "Yes — creating, publishing and sharing your Ganesh Chaturthi page is completely free.",
      },
      {
        question: "Can I password-protect it and edit it later?",
        answer:
          "Yes to both. Set an optional password when you create the page — passwords are stored hashed and never shown — and edit and republish anytime. The same link always shows the latest version. Their prarthana is the one thing you cannot edit; it is written once, by them.",
      },
    ],

    howTo: {
      name: "How to Send a Ganesh Chaturthi Wish Online",
      description:
        "Make a Ganesh Chaturthi page the person you send it to performs themselves — durva, kumkum, flowers, modak and the full aarti — free.",
      totalTime: "PT2M",
      steps: [
        { name: "Open the Template", text: "Go to the Happy Ganesh Chaturthi page on SubhSandesh and tap Create." },
        { name: "Add the Names", text: "Enter their name and yours, and upload a photo to stand beside the murti." },
        { name: "Dress the Mandap", text: "Pick one of the four backdrops, put your family name on the board, and choose how many modak go on the thali." },
        { name: "Write Your Wish", text: "Add a few lines for the first screen and one sentence for the aarti, or let the AI draft them from your story." },
        { name: "Add What You're Asking For", text: "List what you and they are asking Bappa for this year, and add photos from previous pandals." },
        { name: "Send the Link", text: "Publish and send them the private link on WhatsApp so they can do the aarti themselves." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HAPPY RAKSHA BANDHAN — SISTER TO BROTHER
  // ═══════════════════════════════════════════════════════════════════════════
  //
  // The URL slug spells it "rakshabandhan" as one word. Everything a search
  // engine actually weights — the title, the description, the FAQ text — uses
  // the correct two-word "Raksha Bandhan", which is how it is written and how
  // it is searched. That is the mitigation for the slug, and it is why the
  // spelling below is not a typo waiting to be "fixed" to match the URL.
  //
  // No `aggregateRating`: this template launches with zero real uses.
  "happy-rakshabandhan-to-brother": {
    title: "Happy Raksha Bandhan for Brother — Tie a Rakhi Online, Free",
    description:
      "Send your brother a Raksha Bandhan page he can actually take part in. He does the tilak, the mithai, the aarti and the rakhi on his phone, then writes his promise back to you. Add your photo and your UPI for shagun. Free, in 2 minutes.",
    category: "Festival",
    emoji: "🪢",

    keywords: [
      // ── PRIMARY ──
      "happy raksha bandhan brother",
      "raksha bandhan wishes for brother",
      "rakhi for brother online",
      "tie rakhi online",
      "online rakhi for brother",
      "raksha bandhan card for brother",
      "happy rakshabandhan to brother",
      "virtual rakhi for brother",
      // ── DISTANCE / NRI ──
      "send rakhi to brother abroad",
      "rakhi for brother far away",
      "raksha bandhan for brother in another city",
      "digital rakhi for brother abroad",
      "long distance raksha bandhan",
      "rakhi online for nri brother",
      // ── INTENT ──
      "raksha bandhan message for brother",
      "rakhi wishes from sister",
      "raksha bandhan 2026",
      "raksha bandhan 2026 date",
      "rakhi muhurat 2026",
      "shubh muhurat raksha bandhan",
      "raksha bandhan gift for brother online",
      "funny rakhi message for brother",
      "emotional raksha bandhan message brother",
      // ── LONG TAIL ──
      "rakhi page for brother with photo",
      "raksha bandhan photo card for instagram story",
      "raksha bandhan instagram story template",
      "make rakhi card online free",
      "personalised rakhi card for brother",
      "raksha bandhan page with upi shagun",
      "brother sister bond page online",
      "rakhi ritual online tilak aarti",
    ],

    faqs: [
      {
        question: "When is Raksha Bandhan in 2026?",
        answer:
          "Raksha Bandhan 2026 falls on Friday, 28 August. The auspicious window that morning runs roughly from 5:57 AM to 9:48 AM IST — Bhadra ends before sunrise that year, so the whole morning is clear. The page shows a live countdown to it, but it never blocks anything: you can open the page and tie the rakhi at any hour, on any date.",
      },
      {
        question: "How do I tie a rakhi to my brother online?",
        answer:
          "Open the Happy Raksha Bandhan template on SubhSandesh, add his name, a photo of the two of you, and a short message. Publish it and send him the private link. When he opens it he performs the ritual himself on his phone — tilak, mithai, aarti and then the rakhi — and writes a promise back to you at the end.",
      },
      {
        question: "What does my brother actually do when he opens it?",
        answer:
          "He taps through the whole puja in order. He applies the tilak, feeds the mithai, circles the aarti, and ties the rakhi — each step with a short line explaining what it means and why it is done. Then he asks for his gift, sees your UPI QR if you added one, and types his promise, which comes back to you.",
      },
      {
        question: "Can I ask for shagun through the page?",
        answer:
          "Yes, and it is entirely optional. If you add your UPI ID or QR code it appears after the rakhi is tied, with a UPI deep link so he can pay in one tap. There is no confirmation step, no reminder and no follow-up — the page never asks him whether he sent anything and never tracks it, because a rakhi is a gift and not an invoice.",
      },
      {
        question: "Does he need an account to open it or reply?",
        answer:
          "No. He opens the link and the whole ritual works straight away, and he can write his promise back to you without signing up for anything. Only you need an account, to build and edit the page.",
      },
      {
        question: "Can I download it for my Instagram story?",
        answer:
          "Yes. The main card — your photo, both names, the date and the distance if you added it — downloads as a 1080×1920 PNG, the exact Story size. On a phone you can send it straight to Instagram through the share sheet; on a laptop it saves to your downloads and you can upload it from there.",
      },
      {
        question: "What if my brother lives in another country?",
        answer:
          "That is what this is for. Add the distance and the page says 'tied from 7,400 km away' under his name. The ritual works identically wherever he opens it, and the muhurat countdown is calculated in IST so it means the same thing to both of you.",
      },
      {
        question: "Can I add photos and a funny list?",
        answer:
          "Yes. Add as many memories as you like — each becomes a polaroid with your caption and the year. There is also an optional ledger for the running jokes: chocolates owed, times he tore your homework, times he covered for you. Affectionate, never a real grievance.",
      },
      {
        question: "Is it free?",
        answer: "Yes — creating, publishing and sharing your Raksha Bandhan page is completely free.",
      },
      {
        question: "Can I password-protect it and edit it later?",
        answer:
          "Yes to both. Set an optional password when you create the page — passwords are stored hashed and never shown — and edit and republish anytime. The same link always shows the latest version. His promise is the one thing you cannot edit; it is written once, by him.",
      },
    ],

    howTo: {
      name: "How to Tie a Rakhi to Your Brother Online",
      description:
        "Make a Raksha Bandhan page your brother can take part in — tilak, mithai, aarti and the rakhi itself — free.",
      totalTime: "PT2M",
      steps: [
        { name: "Open the Template", text: "Go to the Happy Raksha Bandhan page on SubhSandesh and tap Create." },
        { name: "Add Your Bhai", text: "Enter his name and yours, and upload a photo of the two of you for the card." },
        { name: "Design the Rakhi", text: "Pick the thread colours, the bead and the charm, and put your name on the pendant." },
        { name: "Write Your Message", text: "Add a few lines for him, your memories with captions, and the funny ledger if you want it." },
        { name: "Add Shagun (Optional)", text: "Add your UPI ID or QR code so he can send shagun after the rakhi is tied." },
        { name: "Send the Link", text: "Publish and send him the private link on WhatsApp so he can tie it on the day." },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HAPPY RAKSHA BANDHAN — BROTHER TO SISTER
  // ═══════════════════════════════════════════════════════════════════════════
  //
  // The pair to the block above, and the same slug mitigation applies: the URL
  // spells it "rakshabandhan" as one word, everything indexable below spells it
  // the correct two-word way, because that is how it is written and how it is
  // searched. Do not "fix" the copy into agreement with the URL.
  //
  // ── WHY THE TWO ENTRIES MUST NOT SHARE PHRASING ────────────────────────────
  //
  // These two pages sit one slug apart, on one festival, with nearly the same
  // title. Reused sentences between them would be two near-duplicate documents
  // competing for the same queries, and Google resolves that by picking one and
  // suppressing the other. So the queries are split on the only axis that
  // actually separates them: the brother entry owns "rakhi FOR brother / tie
  // rakhi online", this one owns "wishes FOR sister / rakhi GIFT for sister" —
  // the searcher here is a brother shopping for a gift, not a sister shopping
  // for a ritual — and no keyword appears in both lists.
  //
  // No `aggregateRating`: this template launches with zero real uses, and a
  // fabricated star rating in structured data is the kind of thing that costs a
  // whole domain its rich results.
  "happy-rakshabandhan-to-sister": {
    title: "Happy Raksha Bandhan for Sister — Rakhi Gift Page, Free",
    description:
      "Send your sister a Raksha Bandhan page where she picks a rakhi and ties it herself on your wrist. Sign the vow, put the shagun in the lifafa, add your photos and the statement of account. She writes back. Free, in 2 minutes.",
    category: "Festival",
    emoji: "🧿",

    keywords: [
      // ── PRIMARY ──
      "happy raksha bandhan sister",
      "raksha bandhan wishes for sister",
      "rakhi gift for sister online",
      "raksha bandhan gift for sister",
      "raksha bandhan card for sister",
      "happy rakshabandhan to sister",
      "rakhi message for sister",
      "raksha bandhan page for sister",
      // ── DISTANCE / NRI ──
      "raksha bandhan gift for sister abroad",
      "rakhi gift for sister far away",
      "raksha bandhan for sister in another city",
      "online rakhi gift for nri sister",
      "long distance rakhi gift for sister",
      "raksha bandhan shagun message for sister",
      // ── INTENT ──
      "raksha bandhan quotes for sister",
      "emotional message for sister on rakhi",
      "funny raksha bandhan message for sister",
      "raksha bandhan promise to sister",
      "bhai ka vachan rakhi",
      "shagun for sister raksha bandhan",
      "lifafa for sister online",
      "rakhi gift ideas for sister last minute",
      // ── DATE / MUHURAT ──
      "raksha bandhan 2026 sister",
      "rakhi 2026 date for sister",
      // ── LONG TAIL ──
      "personalised raksha bandhan card for sister free",
      "raksha bandhan photo card for sister instagram story",
      "digital rakhi gift for didi",
      "raksha bandhan gift page with photos and shagun",
      "brother sister page online free",
    ],

    faqs: [
      {
        question: "When is Raksha Bandhan in 2026?",
        answer:
          "Raksha Bandhan 2026 falls on Friday, 28 August. The shubh muhurat that morning runs roughly from 5:57 AM to 9:48 AM IST — Bhadra ends before sunrise that year, so the whole morning is clear. The page shows your sister a live countdown to it, but it never blocks her: she can open it and tie the rakhi at any hour, on any date, which matters if she is in a timezone where that window falls at 3 AM.",
      },
      {
        question: "What does my sister actually do when she opens it?",
        answer:
          "She does the part that is hers. She is shown five rakhis — marigold, sandalwood, nazar, pearl, plain kalava — picks the one she wants, and then ties the thread around your wrist on the screen until the knot cinches. After that she reads the vow you signed, turns over the statement of account, tears open her lifafa, looks at the photos, and writes you one reply.",
      },
      {
        question: "Why does she tie the rakhi instead of me?",
        answer:
          "Because that is whose job it is. On Raksha Bandhan the sister ties the thread and the brother gives the vow and the shagun — so a page built by a brother hands her the tying and keeps the promise and the envelope for him. Our other template, Happy Raksha Bandhan for Brother, is the same festival from her side, where he performs the puja.",
      },
      {
        question: "Can I put shagun in the lifafa, and does the page handle the money?",
        answer:
          "You put the shagun in the page and you send the money yourself. Write an amount and a line to go with it, and she tears the lifafa open to find them — the figure and what you wanted to say about it. The page deliberately carries no payment QR and no payment link: a QR encodes whoever is being PAID, so on a page where the brother is the one giving, yours would ask her to pay you, and hers would publish her bank details on something built to be forwarded. Raksha Bandhan is also peak UPI-scam season, and a forwarded page showing a payment code is exactly the shape of that fraud. So the transfer happens in your own banking app, where it was always going to. Both fields are optional — leave them empty and the lifafa still opens as a sweets-and-blessing beat. Nothing is confirmed, reminded or tracked, because shagun is a gift and not an invoice.",
      },
      {
        question: "Will it call her Didi or Behna?",
        answer:
          "Whichever is correct, and you tell it which. There is one switch in the form for whether she is your elder sister; the whole page then addresses her as Didi or as Behna throughout. It is the one thing we never guess or auto-fill, because calling an elder sister behna is a slight and calling a younger sister didi is a joke.",
      },
      {
        question: "What is the statement of account?",
        answer:
          "The funny half, and the reason the page does not read like a greeting card. It is a mock ledger with two columns. Hers is petty and itemised — hoodies never returned: nine, times you told Mummy: too many — and yours, written just as flatly, is what she actually did for you: the times she covered, the nights she waited up. The second column does not fit on the same scale as the first, and that reversal is the point. Write your own rows. It sits between the vow and the lifafa, so the envelope after it reads as part payment against a balance nobody is pretending to clear.",
      },
      {
        question: "Can she reply, and can I edit the page after she has?",
        answer:
          "She gets exactly one reply and it is hers — written once from the link, never editable by you, and it comes back with which rakhi she chose. You can edit and republish everything else anytime and the same link always shows the latest version; her answer is the one thing your edits cannot touch or blank.",
      },
      {
        question: "Is it free, and can I lock it?",
        answer:
          "Yes to both. Creating, publishing and sharing the page is completely free, and you can set an optional password when you publish — passwords are stored hashed and never shown. There is also a 1080×1920 card, the exact Instagram Story size, that either of you can download.",
      },
    ],

    howTo: {
      name: "How to Send Your Sister a Raksha Bandhan Page",
      description:
        "Make a Raksha Bandhan page your sister ties the rakhi on herself — the vow, the statement of account and the shagun lifafa — free.",
      totalTime: "PT2M",
      steps: [
        { name: "Open the Template", text: "Go to the Happy Raksha Bandhan for Sister page on SubhSandesh and tap Create." },
        { name: "Add Your Behna", text: "Enter her name and yours, say whether she is your elder sister so the page calls her Didi or Behna, and upload a photo of the two of you." },
        { name: "Write the Vow", text: "Four short promises and a since — 'since 2001', 'since the day they brought you home'. This is what gets signed on the certificate." },
        { name: "Fill In the Statement of Account", text: "Two columns: the running grievances with a count against each in hers, and what she actually did for you in yours. Keep hers short and yours longer." },
        { name: "Put Shagun in the Lifafa", text: "Add an amount and a line to go with it. Both optional. The page states the figure and you send the money from your own banking app — there is no payment code on the page." },
        { name: "Add the Photos", text: "Upload a few memories with a caption and a year on each — they become polaroids — and write her the letter at the end." },
        { name: "Send the Link", text: "Publish and send her the private link on WhatsApp so she can pick a rakhi and tie it on the day." },
      ],
    },
  },

  // Happy Halloween — the ninth entry on the Valentine-week engine, but an
  // occasion of its own (31 October). Searchers come in three groups: people
  // after an "interactive / online Halloween card", couples typing "will you be
  // my boo", and parents or friends wanting something cute rather than scary —
  // the FAQs answer each in its own words. No `aggregateRating`: it launches with
  // zero real uses. No price is stated anywhere: it is set in /admin/pricing.
  "happy-halloween": {
    title: "Interactive Halloween Card with Photos & Music",
    description:
      "Send a spooky-cute Halloween card they can play: carve a pumpkin, read your letter by flashlight, brew a love potion and answer 'Will you be my boo?'",
    category: "Festival",
    emoji: "🎃",

    keywords: [
      // ── PRIMARY ──
      "halloween ecard",
      "interactive halloween card",
      "happy halloween card online",
      "digital halloween card with music",
      "personalised halloween greeting with photos",
      "trick or treat online card",
      "send halloween wishes on whatsapp",
      "happy halloween 2026",
      // ── ROMANTIC ──
      "halloween card for girlfriend",
      "halloween card for boyfriend",
      "will you be my boo",
      "you're my boo halloween",
      "halloween message for crush",
      "halloween love letter",
      "be my boo card",
      // ── FRIENDS / FAMILY / KIDS ──
      "halloween wishes for best friend",
      "cute halloween card for kids",
      "halloween card for family",
      "not scary halloween card",
      // ── THE PAGE ──
      "carve a pumpkin online",
      "halloween card with my own song",
      "boo license",
      "you've been booed online",
    ],

    faqs: [
      {
        question: "How do I send an interactive Halloween card?",
        answer:
          "Open the Happy Halloween template, press Create and fill in their name and yours, a letter, up to six photos and the word to carve on the pumpkin — or describe the two of you in a few lines and let the AI write the page for you. Press Save to preview it, then Publish and send the private link on WhatsApp, Instagram or by text. They open it in any phone or laptop browser with no app and no account.",
      },
      {
        question: "What happens when they open the Halloween card?",
        answer:
          "They walk through a little haunted house built for them. They knock three times on the door, choose trick or treat and catch falling sweets, carve a jack-o'-lantern until the candle lights and their word glows through the back, wipe the fog off portraits to find your photos, read your letter by flashlight in a dark attic, brew a potion from your memories, and answer the question at the end. It finishes with a Boo License they can download.",
      },
      {
        question: "Can I ask \"Will you be my boo?\"",
        answer:
          "Yes — that is the default question for a partner or a crush, and you can rewrite it in up to 60 characters. The No button runs away from their finger a few times before giving in, so the answer is always yes.",
      },
      {
        question: "Will I know if they said yes?",
        answer:
          "Yes. The first time they answer, you get an email saying they said yes to being your boo, including how many times the No button ghosted them first. Only the first answer is recorded, and you can also see it on your own page.",
      },
      {
        question: "Can I add my own song?",
        answer:
          "Yes. Paste a YouTube link (and an optional start time) and only the sound plays while they explore; the video stays hidden behind a small radio card with a mute button. You can also pick one of eight Halloween favourites such as This Is Halloween, Monster Mash or Thriller, or keep the built-in spooky music box. Music starts only after they knock on the door.",
      },
      {
        question: "Is it scary for kids?",
        answer:
          "No. The house is spooky-cute rather than scary: round, blushing ghosts, no blood, no gore and no jump scares. Choose the Kids tone and the trick becomes confetti spiders, nothing goes dark, and the No button simply waits as \"maybe later?\" instead of running away. Motion is reduced automatically for anyone whose phone asks for less motion.",
      },
      {
        question: "Can I send it to a best friend or family instead of a partner?",
        answer:
          "Yes. Pick who it is for — partner, bestie, family or kids — and the question and the licence change with it, for example \"Will you be my boo-st friend forever?\" for a best friend or \"Will you be my favourite little pumpkin?\" for family. Every line stays editable.",
      },
      {
        question: "What is the Boo License?",
        answer:
          "The keepsake at the end: a 1080×1920 card (Instagram Story size) with their photo, the costume you chose for them — ghost, witch, vampire, pumpkin, black cat, skeleton, mummy or bat — your reason why, and \"Valid every 31 October, forever\". They can download it as a PNG, and a \"Boo someone back\" button passes the haunted house on.",
      },
      {
        question: "When is Halloween 2026?",
        answer:
          "Halloween is on Saturday, 31 October 2026. Good moments to send the link are at sunset that evening or at midnight going into the 31st; for a long-distance partner, open it together on a video call. The page works on any date, before or after.",
      },
      {
        question: "Can I lock the page with a password or edit it later?",
        answer:
          "Yes to both. You can set an optional password when you publish, and you can edit and republish the page any time; the same link always shows the latest version.",
      },
    ],

    howTo: {
      name: "How to Send an Interactive Halloween Card",
      description:
        "Build a little haunted house for someone — their pumpkin, your letter by flashlight, your photos and a 'Will you be my boo?' — and send it as a link.",
      totalTime: "PT5M",
      steps: [
        { name: "Open the Template", text: "Go to the Happy Halloween page on SubhSandesh and press Create." },
        { name: "Choose Who It's For", text: "Pick partner, bestie, family or kids; the question, the trick and the ending follow the choice." },
        { name: "Write the House", text: "Add both names, the sign on the gate, your trick, the word to carve on the pumpkin and the letter they will read by flashlight — or let the AI write it from a short story." },
        { name: "Add Photos and Music", text: "Upload up to six photos for the haunted portraits, then paste a YouTube song or pick a Halloween favourite." },
        { name: "Fill the Potion and the Licence", text: "List three to five potion ingredients from your memories, what the spell does, and their costume for the Boo License." },
        { name: "Publish and Send", text: "Press Save to preview, Publish, then send the private link — ideally with the lights off on 31 October." },
      ],
    },
  },
  // ── ✦ Premium twins (Stage 7, 2026-10-08) ─────────────────────────────────
  // Nine cinematic, several-scene versions of the Valentine-week days and
  // Halloween. Search intent is split from the $2 twin on purpose: the twin is
  // "a <day> surprise website"; these target "premium / cinematic <day>
  // website for girlfriend / boyfriend", "with our song", "with a voice note",
  // "long distance". Shared FAQs + HowTo come from premiumFaqs()/premiumHowTo()
  // at the end of this file so the nine stay factually in step (limits from
  // .template-factory/premium/PREMIUM-ENGINE.md §2). No price, no rating.
  "happy-valentines-day-premium": {
    title: "Valentine Carnival Website for Girlfriend",
    description:
      "A cute pastel funfair made just for her: pop balloons that spell your line, break a love meter, win your photos from a gacha machine, ride a Ferris wheel of you two, then ask the big question on your song's chorus.",
    category: "Valentine",
    emoji: "🎡",
    keywords: [
      "valentine carnival website",
      "cute valentine website for girlfriend",
      "will you be my valentine website",
      "valentine's day website for girlfriend",
      "valentine's day website for boyfriend",
      "interactive valentine gift for her",
      "premium valentine surprise",
      "valentine website with our song",
      "valentine's day website with voice note",
      "valentine website with photos",
      "love meter valentine website",
      "valentine's day gift for long distance girlfriend",
      "valentine's day 2027 surprise",
      "digital valentine gift for her",
      "valentine's day gift for him online",
    ],
    faqs: [
      {
        question: "What happens when they open the Valentine Carnival?",
        answer:
          "They get an ADMIT ONE ticket with their name on it. Tearing the stub opens the carnival and starts your song. Then they play their way through the stalls: pop heart balloons until your line is spelled out, hold a thumb on a love tester until it breaks past 999%, turn a gacha machine to win four capsules with your photos inside, ride a Ferris wheel whose cabins carry your photos, knock down seven cans (Rose Day to Kiss Day) that each hold your line for that day, open your letter at the kissing booth and hear your voice note on the carnival radio. Every stall has cute couple stickers reacting to what they do.",
      },
      {
        question: "What if they press No?",
        answer:
          "No hides behind a sticker every time they reach for it, shrinks a little and shows one of your lines, while the little face under the question gets sadder. After the last line it gives up and turns into a second Yes. When they say yes, the chorus of your song lands, heart fireworks burst over the fair and the Ferris wheel lights up with your photos. It ends on a ticket stub and photobooth strip they can save as a story-sized image.",
      },
      ...premiumFaqs({
        day: "Valentine's Day",
        twin: "Valentine's Day",
        keepsake: "carnival ticket stub with a photobooth strip of your photos",
        voiceAt: "on the carnival radio, right before the big question",
        yesEmail: true,
      }),
    ],
    howTo: premiumHowTo({
      name: "How to Make a Valentine Carnival Website for Her",
      description: "Build a cute pastel funfair from your photos, your words, your voice and your song, and send it as a private link.",
      write: { name: "Write Your Carnival", text: "Add her ticket's fine print, the line hidden in the balloons, the love meter's joke, a line for each day of Valentine's week, your song and the big question, or let the AI write it from a few lines about the two of you." },
    }),
  },
  "happy-rose-day-premium": {
    title: "Cinematic Rose Day Website for Girlfriend",
    description:
      "A rose made of your photos: they hold a velvet bud to warm it, and on your song's chorus it opens ring by ring, every petal a photo of the two of you.",
    category: "Valentine",
    emoji: "🌹",
    keywords: [
      "cinematic rose day website",
      "rose day website for girlfriend",
      "rose day website for boyfriend",
      "premium rose day surprise",
      "rose made of our photos",
      "photo rose online",
      "rose day gift for long distance girlfriend",
      "rose day surprise with our song",
      "rose day message with voice note",
      "rose that blooms online",
      "rose day 2027",
      "7 february rose day surprise",
      "rose day love letter online",
      "digital rose for girlfriend",
      "rose day wishes with photos",
      "romantic rose day idea",
    ],
    faqs: [
      {
        question: "What happens when they open The Bloom of Us?",
        answer:
          "A gold rose draws itself in the dark with their name under it, and their first tap starts your song. They hold a closed velvet bud to warm it, its heartbeat quickening, until your song's chorus lands and the rose opens ring by ring: every petal is one of your photos. They tap a petal to lift its photo out with your caption, peel back vellum to find photos pressed between pages, raise your letter to read it, hear your voice, and end on a keepsake card they can tilt in the light, with a sealed P.S. to break open.",
      },
      ...premiumFaqs({
        day: "Rose Day",
        twin: "Rose Day",
        keepsake: "keepsake card of the rose made of your photos",
        voiceAt: "over one of your photos, after the letter",
        yesEmail: false,
      }),
    ],
    howTo: premiumHowTo({
      name: "How to Make a Cinematic Rose Day Website",
      description: "Turn your photos into the petals of one rose that opens on your song, with your letter and voice, and send it as a private link.",
      write: { name: "Grow the Rose", text: "Pick the rose colour and why it is theirs, write the line over the bud and the line when it blooms, a caption for each photo and your letter, or let the AI write it from a few lines about the two of you." },
    }),
  },

  "happy-propose-day-premium": {
    title: "Cute Propose Day Website for Girlfriend",
    description:
      "A cute proposal website: she knocks on a little door, swipes your story, finds the ring in a gift box, and says yes as your song's chorus lands.",
    category: "Valentine",
    emoji: "💍",
    keywords: [
      "cute proposal website for girlfriend",
      "propose day website for girlfriend",
      "propose day website for boyfriend",
      "interactive proposal website",
      "will you be mine website",
      "will you marry me website",
      "proposal website with photos and song",
      "cute online proposal idea",
      "long distance proposal idea",
      "proposal website with voice note",
      "find the ring proposal game",
      "premium propose day surprise",
      "propose day 2027",
      "8 february propose day",
      "propose day message for girlfriend",
      "creative way to propose online",
    ],
    faqs: [
      {
        question: "What happens when they open The Little Proposal?",
        answer:
          "They knock on a little pink door, which starts your song, and a shy panda opens it with your nervous hello. They swipe through polaroid story cards of how you started, tap open a four-panel comic of you rehearsing the proposal (badly), and pick from three gift boxes until the ring turns up. Then your letter arrives in a heart-sealed envelope, your voice note plays, and your question appears above a ring box. On yes the box pops open on your song's chorus, the ring flies onto a heart-shaped photo of you two, a wall of celebrating stickers pops in, and they sign an \"Officially Taken\" certificate with a tap of their ring finger.",
      },
      {
        question: "Can they say no?",
        answer:
          "Not really. The No button runs away and shrinks, saying your lines as it goes (\"Let me think 🤔\", \"Are you sure?\"), and a pleading sticker pops up beside it. After a few tries it gives up and turns into another Yes.",
      },
      ...premiumFaqs({
        day: "Propose Day",
        twin: "Propose Day",
        keepsake: "\"Officially Taken\" certificate",
        voiceAt: "just before the question",
        yesEmail: true,
      }),
    ],
    howTo: premiumHowTo({
      name: "How to Make a Cute Proposal Website",
      description: "Tell your little love story with photos, hide the ring in a gift box, ask your question and send the link.",
      write: { name: "Write the Proposal", text: "Write your nervous hello, three story cards of how you started, the four rehearsal comic panels, the notes in the gift boxes, the question, what No says as it runs, and your letter, or let the AI write it from a few lines about the two of you." },
    }),
  },
  "happy-chocolate-day-premium": {
    title: "Premium Chocolate Day Website for Girlfriend",
    description:
      "A chocolatier's box made for one person: they pull the ribbon, lift the lid on your song's chorus, and every bonbon inside is one of your photos.",
    category: "Valentine",
    emoji: "🍫",
    keywords: [
      "premium chocolate day website",
      "chocolate day website for girlfriend",
      "chocolate day website for boyfriend",
      "cinematic chocolate day surprise",
      "chocolate day gift for long distance",
      "chocolate day surprise with our song",
      "chocolate day message with voice note",
      "virtual chocolate gift online",
      "photo chocolate box online",
      "chocolate box with our photos",
      "chocolate day 2027",
      "9 february chocolate day",
      "chocolate day wishes with photos",
      "romantic chocolate day idea",
      "digital chocolate box for her",
    ],
    faqs: [
      {
        question: "What happens when they open La Boîte?",
        answer:
          "A matte chocolatier's box waits for them with your initials in gold foil and a satin ribbon. They pull the ribbon and your song starts, then lift the lid: on the chorus it comes off, the tissue parts, and every bonbon inside is topped with one of your photos, with a foil sheen that follows the tilt of their phone. They tap a piece to turn it over to its flavour and the memory it tastes of, brush the cocoa off a last heart-shaped piece, read your letter on the box's menu card, hear your voice, and keep the lid as a card.",
      },
      ...premiumFaqs({
        day: "Chocolate Day",
        twin: "Chocolate Day",
        keepsake: "keepsake card made from the box's lid (plus a poster of the photo bonbons)",
        voiceAt: "after the menu card with your letter",
        yesEmail: false,
      }),
    ],
    howTo: premiumHowTo({
      name: "How to Make a Premium Chocolate Day Website",
      description: "Fill a chocolatier's box with your photos as bonbons, set it to open on your song, and send the link.",
      write: { name: "Fill the Box", text: "Add up to nine photos (each becomes a bonbon), name the flavours and the memory each one tastes of, choose the box colour, write the lines over the box and the last piece and your letter, or let the AI write it from a few lines about you two." },
    }),
  },

  "happy-teddy-day-premium": {
    title: "Premium Teddy Day Website for Girlfriend",
    description:
      "Send a teddy with adoption papers: they meet him, flip his care labels, read your letter, then sign the certificate and the gold seal presses as your song drops.",
    category: "Valentine",
    emoji: "🧸",
    keywords: [
      "premium teddy day website",
      "teddy day website for girlfriend",
      "teddy day website for boyfriend",
      "cinematic teddy day surprise",
      "teddy adoption certificate",
      "teddy day gift for long distance",
      "teddy day surprise with our song",
      "teddy day message with voice note",
      "virtual teddy bear gift",
      "teddy day 2027",
      "10 february teddy day",
      "teddy day wishes with photos",
      "cute teddy day idea",
      "teddy birth certificate",
      "digital teddy for her",
    ],
    faqs: [
      {
        question: "What happens when they open the teddy parcel?",
        answer:
          "They untie a parcel tag (\"Fragile: contains one (1) hug\") and meet a teddy you have named, with a woven tag carrying both your names; squeeze him and he says his first words. His file follows: your photos clipped in as his new family, satin care labels that flip over to love notes, your letter folded in three, and your voice. Then they sign his Certificate of Adoption with a finger, hold to press the gold seal, and as your song's chorus drops the seal embosses and ADOPTED is stamped across it. The signed certificate is theirs to save.",
      },
      ...premiumFaqs({
        day: "Teddy Day",
        twin: "Teddy Day",
        keepsake: "signed Certificate of Adoption",
        voiceAt: "just before they sign the adoption papers",
        yesEmail: false,
      }),
    ],
    howTo: premiumHowTo({
      name: "How to Make a Premium Teddy Day Website",
      description: "Give them a teddy with adoption papers they sign themselves, with your photos, letter and voice in his file, and send it as a private link.",
      write: { name: "Write his file", text: "Name the teddy, write his parcel tag, first words, place of birth, temperament, care instructions and your letter, or let the AI write them from a few lines about the two of you." },
    }),
  },

  "happy-promise-day-premium": {
    title: "Cinematic Promise Day Website for Boyfriend",
    description:
      "Your promises, drawn up as a deed: a typewriter types each one beside your photos, you both sign, and on your song's drop the wax seal presses in your initials.",
    category: "Valentine",
    emoji: "✍️",
    keywords: [
      "cinematic promise day website",
      "promise day website for boyfriend",
      "promise day website for girlfriend",
      "promise contract for girlfriend",
      "love contract online",
      "signed sealed delivered promise",
      "wax seal love letter online",
      "typewriter love letter",
      "premium promise day surprise",
      "promise day surprise with our song",
      "promise day message with voice note",
      "promise day 2027",
      "11 february promise day",
      "promises for my partner",
      "promise day vow letter",
    ],
    faqs: [
      {
        question: "What happens when they open Signed, Sealed, Promised?",
        answer:
          "A heavy cream envelope with a wax seal waits for them, \"to be opened by you only\"; breaking it starts your song. Inside is a deed of promise folded in three: they unfold it to two \"Whereas…\" lines that tell your story, then press a typewriter key and each promise types itself in, clack by clack, beside one of your photos. Your letter is attached as a schedule they initial, your voice note is your sworn statement, and they sign under \"And above all…\" with their finger, next to your signature. The deed folds into its envelope, they press and hold the brass seal, and on your song's drop the wax blooms with your initials and the notary's stamp lands: signed, sealed, promised.",
      },
      ...premiumFaqs({
        day: "Promise Day",
        twin: "Promise Day",
        keepsake: "signed deed of promise (with both signatures and the wax seal)",
        voiceAt: "as your sworn statement, before you both sign",
        yesEmail: false,
      }),
    ],
    howTo: premiumHowTo({
      name: "How to Make a Cinematic Promise Day Website",
      description: "Draw up your promises as a deed they unfold, read, sign and seal, with your photos, your letter, your voice and your song, sent as a private link.",
      write: { name: "Write the Promises", text: "Write two \"Whereas…\" lines about how it started, the promises the typewriter types, the one above all, a witness only you two would get, and pick the wax for your seal — or let the AI write it from a few lines about the two of you." },
    }),
  },

  "happy-hug-day-premium": {
    title: "Long-Distance Hug Day Website for Boyfriend",
    description:
      "A hug they feel through the phone: they hold a thumb on your photo for twenty seconds while it blooms from black-and-white into colour, a heartbeat slows to yours and your song lands on the chorus.",
    category: "Valentine",
    emoji: "🤗",
    keywords: [
      "long distance hug day website",
      "hug day website for boyfriend",
      "hug day website for girlfriend",
      "virtual hug online",
      "send a hug through the phone",
      "20 second hug",
      "premium hug day surprise",
      "cinematic hug day surprise",
      "hug day surprise with our song",
      "hug day message with voice note",
      "hug day 2027",
      "12 february hug day",
      "hug day wishes with photos",
      "long distance relationship gift online",
      "hug coupon",
      "black and white to colour photo",
    ],
    faqs: [
      {
        question: "What happens when they open the Hug Day page?",
        answer:
          "\"Come here\" arrives one word at a time, then their name. They drag two black-and-white photos of you together until the distance between you reads zero, then hold a thumb on your photo for twenty seconds: it blooms into colour from under their thumb, a heartbeat slows to yours and your lines fade in, and the chorus of your song lands as the last of the colour does. Letting go pauses it. Then what your hugs feel like, a line over each photo, your letter, your voice, and a hug coupon they tear off and send back to redeem in person.",
      },
      ...premiumFaqs({
        day: "Hug Day",
        twin: "Hug Day",
        keepsake: "hug coupon",
        voiceAt: "after the letter",
        yesEmail: false,
      }),
    ],
    howTo: premiumHowTo({
      name: "How to Make a Long-Distance Hug Day Website",
      description: "Send a twenty-second hug they hold through the screen, with your letter, photos and voice, as a private link.",
      write: { name: "Write the Hug", text: "Write the first words, the lines that fade in during the hug, what your hugs feel like, the hug coupon and your letter — or let the AI write it from a few lines about the two of you." },
    }),
  },

  "happy-kiss-day-premium": {
    title: "Kiss Day Photo Booth Website for Girlfriend",
    description:
      "A vintage photo booth for Kiss Day: four flashes print a strip of your photos on your song's chorus, your letter comes out on a booth receipt, and they kiss the screen back.",
    category: "Valentine",
    emoji: "💋",
    keywords: [
      "kiss day photo booth",
      "photo booth strip online",
      "kiss day website for girlfriend",
      "kiss day website for boyfriend",
      "premium kiss day surprise",
      "cinematic kiss day surprise",
      "black and white photo strip of us",
      "kiss day gift for long distance",
      "kiss day surprise with our song",
      "kiss day message with voice note",
      "virtual kiss online",
      "kiss the screen",
      "kiss day 2027",
      "13 february kiss day",
      "kiss day wishes with photos",
    ],
    faqs: [
      {
        question: "What happens when they open the Photo Booth?",
        answer:
          "A red velvet curtain with their name on it and a chrome plate that says insert one kiss. The tap starts your song. Inside the booth they press a big red button: three, two, one, then four flashes, and a four-frame photo strip of you two drops out of the slot on the chorus and develops frame by frame. They turn each frame over to read what you wrote on the back, hear your voice note, read your letter on a long booth receipt and tear it off, then kiss the screen so their kiss lands on the strip next to yours. The strip saves as a story-sized image.",
      },
      ...premiumFaqs({
        day: "Kiss Day",
        twin: "Kiss Day",
        keepsake: "photo-booth strip with both your kisses on it",
        voiceAt: "after the photo strip",
        yesEmail: false,
      }),
    ],
    howTo: premiumHowTo({
      name: "How to Make a Kiss Day Photo Booth Website",
      description: "Turn four of your photos into a vintage photo-booth strip that prints on your song, with your letter, voice and their kiss, and send it as a private link.",
      write: { name: "Fill the Booth", text: "Pick your kiss mark and shade, black-and-white or colour, the line on the curtain, a caption for the back of each frame, the kisses you owe for the receipt and your letter — or let the AI write it from a few lines about the two of you." },
    }),
  },

  "happy-halloween-premium": {
    title: "Cute Halloween Website for Girlfriend",
    description:
      "Boo! A ghost pops out of a mailbox with your letter. Candy with sweet dares, a pumpkin to carve, ghosts hiding your photos, a love potion, and 'will you be my boo?' on your song.",
    category: "Festival",
    emoji: "👻",
    keywords: [
      "cute halloween website for girlfriend",
      "halloween website for girlfriend",
      "halloween website for boyfriend",
      "will you be my boo website",
      "romantic halloween surprise",
      "premium halloween surprise",
      "halloween surprise with our song",
      "halloween message with voice note",
      "halloween proposal idea",
      "boo license",
      "halloween gift for long distance partner",
      "halloween 2026 surprise for partner",
      "halloween card for best friend",
      "spooky cute halloween for kids",
    ],
    faqs: [
      {
        question: "What happens when they open Boo-tiful Night?",
        answer:
          "A little ghost pops out of a haunted mailbox with your letter and your song starts. They catch candies from a trick-or-treat bag (each one a sweet line or a cute dare), carve a pumpkin that lights up with your initials, shoo away ghosts hiding your photos, brew a love potion from three of your memories, get your letter from a bat, and tune a spirit radio to hear your voice. Then 'Will you be my boo?': on yes, your song hits the chorus, the night turns pink, the moon becomes a heart and a swarm of tiny bats makes a heart around your photo. They keep a Boo License to save and post.",
      },
      {
        question: "Can I send it to a friend or family, or to kids?",
        answer:
          "Yes. Choose partner, best friend, family or kids; the question and the license change with it, and for family and kids the No button never appears. It is cute-spooky, never scary.",
      },
      ...premiumFaqs({
        day: "Halloween",
        twin: "Happy Halloween",
        keepsake: "Boo License with your photo, perks and a certified-boo stamp",
        voiceAt: "on a cute spirit radio",
        yesEmail: true,
      }),
    ],
    howTo: premiumHowTo({
      name: "How to Make a Cute Halloween Website",
      description: "Fill a treat bag, a love potion and a Boo License with your words, hide your photos behind cute ghosts, add your letter, your voice and a question, and send it as a private link.",
      write: { name: "Write the Night", text: "Choose who it is for, name your haunted house, write the candies' sweet lines and dares, three potion ingredients, the license perks, the question and the letter — or let the AI write it from a few lines about the two of you." },
    }),
  },
};

// ─── Premium twins: shared FAQs + HowTo ──────────────────────────────────────
// Function declarations (hoisted), so TEMPLATE_DATA above can call them. Every
// fact here is engine-wide and checked against PREMIUM-ENGINE.md §2 and the
// premium EditSheet: voice ≤60 s, 12 photos, letter ≤3,000 characters, one
// reply ≤280 characters (owner emailed), optional unlock time (server withholds
// the content until then), audio-only YouTube, 1080×1920 keepsake.

function premiumFaqs(o: {
  /** "Rose Day" — the occasion. */
  day: string;
  /** The $2 twin's name as the gallery shows it. */
  twin: string;
  /** "Eternal Rose picture" — the 1080×1920 keepsake. */
  keepsake: string;
  /** Where the voice note plays ("on the spirit radio"). */
  voiceAt: string;
  /** The day asks a question and the first YES is emailed to the sender. */
  yesEmail: boolean;
}): { question: string; answer: string }[] {
  return [
    {
      question: `How is the premium ${o.day} page different from the regular ${o.twin} page?`,
      answer: `The regular ${o.twin} page is a short interactive card. The premium one is a cinematic, scene-by-scene experience: a sealed opening whose first tap starts your song, one big moment timed to land on your song's chorus, a voice note of up to 60 seconds, up to 12 photos, a letter of up to 3,000 characters, a sealed P.S., an optional unlock time, a reply box so they can write back once, and a ${o.keepsake} they can save. Both are made the same way: press Create, fill it in (or let the AI write it), Publish and send the link.`,
    },
    {
      question: "Can I add our song?",
      answer:
        "Yes. Paste a YouTube link or tap one of the suggestions, and pick the second where the chorus starts so the big moment lands on it. The song starts with their first tap on the sealed opening. Only the sound plays: the video stays hidden behind a small now-playing chip they can pause, mute or move. If a song can't be played on other sites, a built-in melody plays instead.",
    },
    {
      question: "Can I add a voice note?",
      answer: `Yes. Record up to 60 seconds in the editor and it plays ${o.voiceAt}, with the song turned down underneath. Without a recording, a short typed line shows in its place.`,
    },
    {
      question: "Can I make it open at midnight or at a set time?",
      answer:
        "Yes. Set an unlock time and, until then, the link shows only their name and a countdown — the letter, photos and voice note are not sent to their phone before that moment. It opens on its own when the countdown ends. Signed in, you can still see your whole page.",
    },
    {
      question: o.yesEmail ? "Will I know if they said yes or wrote back?" : "Can they write back to me?",
      answer: `${o.yesEmail ? "Yes. The first time they say yes you get an email, and it shows on your page. " : ""}At the end there is a reply box: they can write you one reply of up to 280 characters, which you get by email and see on your page. You can turn the reply box off before you publish.`,
    },
    {
      question: "Do they need an app or an account?",
      answer:
        "No. They open the private link in any phone or laptop browser — WhatsApp, Instagram and text links all work. It is best with the sound on, and every swipe, drag or hold also has a button, so it works for everyone.",
    },
    {
      question: "Can I lock it with a password or edit it later?",
      answer:
        "Yes to both. You can set an optional password when you publish, and you can edit and republish any time; the same link always shows the latest version.",
    },
  ];
}

function premiumHowTo(o: { name: string; description: string; write: { name: string; text: string } }) {
  return {
    name: o.name,
    description: o.description,
    totalTime: "PT10M",
    steps: [
      { name: "Open the Template", text: "Open the premium template on SubhSandesh and press Create." },
      o.write,
      { name: "Add Photos, Your Song and Your Voice", text: "Upload up to 12 photos, paste a YouTube song and mark where the chorus starts, and record a voice note of up to 60 seconds." },
      { name: "Choose When It Opens", text: "Leave it to open right away, or set an unlock time so they see only a countdown until then. Decide whether they can write back." },
      { name: "Publish and Send", text: "Press Save to preview the whole experience, Publish, then send the private link on WhatsApp or by text." },
    ],
  };
}
