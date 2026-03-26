"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import AuthModal from "@/components/AuthModal";
import { AnimatePresence } from "framer-motion";

const CURSIVE = "'Dancing Script', 'Brush Script MT', cursive";
const WARM = "rgb(108, 74, 46)";
const WARM_MID = "rgba(108, 74, 46, 0.55)";

interface LoveGfData {
  recipientName: string;
  senderName: string;
  personalMessage: string;
  wishMessage: string;
  loveDate: string;
  galleryPhotos: string[];
}

const TABS = [
  { id: "home", label: "Home", icon: "♡" },
  { id: "message", label: "Message", icon: "✦" },
  { id: "photos", label: "Photos", icon: "📷" },
  { id: "wish", label: "Wish", icon: "✿" },
];

function ScrapbookCanvas({ data }: { data: LoveGfData }) {
  const photos = data.galleryPhotos || [];
  const p = (i: number) => photos[i] || "";

  const polStyle = (extra: React.CSSProperties = {}): React.CSSProperties => ({
    position: "absolute",
    background: "#faf8f2",
    boxShadow: "3px 6px 22px rgba(0,0,0,0.28), 0 1px 6px rgba(0,0,0,0.13)",
    ...extra,
  });

  const photoInner = (src: string, idx: number) => (
    <div style={{ position: "absolute", inset: "5% 6% 21% 10%", background: "#e8e0d5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : (
        <span style={{ fontFamily: CURSIVE, fontSize: "clamp(9px,2.5vw,12px)", color: WARM, opacity: 0.45 }}>photo {idx}</span>
      )}
    </div>
  );

  return (
    <div style={{
      position: "relative",
      width: "100%",
      maxWidth: "min(100vw, calc((100svh - 120px) * 2 / 3))",
      aspectRatio: "2 / 3",
      background: "transparent",
      overflow: "hidden",
      flexShrink: 0,
    }}>
      <div className="hidden sm:block" style={{ position: "absolute", inset: 0 }} aria-hidden>
        <Image src="/love/image18.webp" alt="" fill style={{ objectFit: "cover" }} />
      </div>

      {/* Torn paper left */}
      <div style={{ position:"absolute",left:"-33.8%",top:"14.1%",width:"87.6%",height:"21.0%",transform:"rotate(92.09deg)",zIndex:1,opacity:0.9,mixBlendMode:"multiply" }}>
        <Image src="/love/image17.webp" alt="" width={1600} height={577} style={{ width:"100%",height:"100%",display:"block",objectFit:"fill" }} />
      </div>
      {/* Sticky note */}
      <div style={{ position:"absolute",left:"43.9%",top:"7.0%",width:"47.2%",transform:"rotate(8deg)",zIndex:2 }}>
        <Image src="/love/image16.webp" alt="" width={780} height={605} style={{ width:"100%",height:"auto",display:"block" }} />
      </div>
      {/* Torn paper right */}
      <div style={{ position:"absolute",left:"46.2%",top:"73.8%",width:"87.6%",height:"21.0%",transform:"rotate(-83.58deg)",zIndex:3,opacity:0.9,mixBlendMode:"multiply" }}>
        <Image src="/love/image15.webp" alt="" width={1600} height={577} style={{ width:"100%",height:"100%",display:"block",objectFit:"fill" }} />
      </div>
      {/* Photo 2 */}
      <div style={polStyle({ left:"49.3%",top:"22.5%",width:"40.3%",height:"28.2%",transform:"rotate(15deg)",zIndex:4 })}>
        {photoInner(p(1), 2)}
      </div>
      {/* Photo 4 */}
      <div style={polStyle({ left:"44.6%",top:"51.8%",width:"43.9%",height:"41.3%",transform:"rotate(8deg)",zIndex:5 })}>
        {photoInner(p(3), 4)}
      </div>
      {/* Photo 3 */}
      <div style={polStyle({ left:"7.3%",top:"57.1%",width:"40.3%",height:"28.2%",transform:"rotate(-9deg)",zIndex:6 })}>
        {photoInner(p(2), 3)}
      </div>
      {/* Botanicals */}
      <div style={{ position:"absolute",left:"67.6%",top:"25.9%",width:"41.3%",transform:"rotate(8deg)",zIndex:7,mixBlendMode:"multiply" }}>
        <Image src="/love/image11.webp" alt="" width={312} height={508} style={{ width:"100%",height:"auto",display:"block" }} />
      </div>
      <div style={{ position:"absolute",left:"72.7%",top:"21.4%",width:"6.9%",transform:"rotate(15deg)",zIndex:8,mixBlendMode:"multiply" }}>
        <Image src="/love/image9.webp" alt="" width={200} height={200} style={{ width:"100%",height:"auto",display:"block" }} />
      </div>
      <div style={{ position:"absolute",left:"21.1%",top:"55.5%",width:"6.9%",transform:"rotate(-9deg)",zIndex:9,mixBlendMode:"multiply" }}>
        <Image src="/love/image10.webp" alt="" width={200} height={200} style={{ width:"100%",height:"auto",display:"block" }} />
      </div>
      <div style={{ position:"absolute",left:"16.7%",top:"83.5%",width:"25.0%",transform:"rotate(12deg)",zIndex:10,mixBlendMode:"multiply" }}>
        <Image src="/love/image8.webp" alt="" width={240} height={360} style={{ width:"100%",height:"auto",display:"block" }} />
      </div>
      <div style={{ position:"absolute",left:"4.2%",top:"72.3%",width:"23.0%",transform:"rotate(-30deg)",zIndex:11,mixBlendMode:"multiply" }}>
        <Image src="/love/image7.webp" alt="" width={174} height={459} style={{ width:"100%",height:"auto",display:"block" }} />
      </div>
      <div style={{ position:"absolute",left:"80.4%",top:"-3.3%",width:"27.8%",transform:"rotate(26.17deg)",zIndex:12,mixBlendMode:"multiply" }}>
        <Image src="/love/image6.webp" alt="" width={210} height={228} style={{ width:"100%",height:"auto",display:"block" }} />
      </div>
      {/* Love you text */}
      <div style={{ position:"absolute",left:"51.6%",top:"10.1%",width:"37.3%",transform:"rotate(8deg)",zIndex:13 }}>
        <span style={{ display:"block", fontFamily:CURSIVE, fontSize:"clamp(24px,12.5vw,54px)", color:"rgb(158,126,97)", fontWeight:700, whiteSpace:"nowrap" }}>
          {data.recipientName ? `for ${data.recipientName}` : "love you!"}
        </span>
      </div>
      {/* Photo 1 main */}
      <div style={polStyle({ left:"10.6%",top:"14.1%",width:"43.9%",height:"41.3%",transform:"rotate(-6deg)",zIndex:14 })}>
        {photoInner(p(0), 1)}
      </div>
      {/* Yarrow */}
      <div style={{ position:"absolute",left:"-6.8%",top:"-0.4%",width:"28.5%",transform:"rotate(18.83deg)",zIndex:15,mixBlendMode:"multiply" }}>
        <Image src="/love/image4.webp" alt="" width={215} height={355} style={{ width:"100%",height:"auto",display:"block" }} />
      </div>
      {/* Center flower */}
      <div style={{ position:"absolute",left:"43.8%",top:"44.2%",width:"16.1%",zIndex:16,mixBlendMode:"multiply" }}>
        <Image src="/love/image3.webp" alt="" width={122} height={121} style={{ width:"100%",height:"auto",display:"block" }} />
      </div>
    </div>
  );
}

function PaperSection({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: "100svh", width: "100%", position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "60px 20px 100px",
      background: `radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(28,15,6,0.28) 100%), url(/love/image18.webp) center/cover no-repeat`,
    }}>
      {/* botanical corners */}
      {[
        { src: "/love/image4.webp", w: 215, h: 355, style: { top:"-2%", left:"-4%", width:"clamp(70px,18vw,150px)", transform:"rotate(18deg)" } },
        { src: "/love/image6.webp", w: 210, h: 228, style: { top:"-2%", right:"-3%", width:"clamp(60px,15vw,130px)", transform:"rotate(-20deg) scaleX(-1)" } },
        { src: "/love/image7.webp", w: 174, h: 459, style: { bottom:"-2%", left:"-2%", width:"clamp(60px,14vw,120px)", transform:"rotate(-25deg)" } },
        { src: "/love/image8.webp", w: 240, h: 360, style: { bottom:"-1%", right:"-1%", width:"clamp(55px,12vw,100px)", transform:"rotate(15deg) scaleX(-1)" } },
      ].map((b, i) => (
        <div key={i} aria-hidden style={{ position:"absolute", pointerEvents:"none", mixBlendMode:"multiply", opacity:0.65, zIndex:1, ...b.style }}>
          <Image src={b.src} alt="" width={b.w} height={b.h} style={{ width:"100%", height:"auto", display:"block" }} />
        </div>
      ))}
      <div style={{ position: "relative", zIndex: 2, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {children}
      </div>
    </div>
  );
}

interface ViewerProps {
  data: LoveGfData;
  shareId: string;
  hasPassword: boolean;
}

export default function LoveGfViewer({ data, shareId, hasPassword }: ViewerProps) {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const [tab, setTab] = useState("home");
  const [showAuth, setShowAuth] = useState(false);

  const handleCreateClick = useCallback(() => {
    if (!isAuthenticated) { setShowAuth(true); return; }
    router.push("/love-gf");
  }, [isAuthenticated, router]);

  const onAuthSuccess = useCallback(() => {
    setShowAuth(false);
    sessionStorage.setItem("love_gf_prefill", JSON.stringify({
      recipientName: data.recipientName,
      senderName: data.senderName,
    }));
    router.push("/love-gf");
  }, [router, data]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #faf6f0; }
      `}</style>

      {/* Tab content */}
      {tab === "home" && (
        <div style={{
          minHeight: "100svh", width: "100%",
          background: `radial-gradient(ellipse at 50% 50%, transparent 22%, rgba(28,15,6,0.32) 100%), url(/love/image18.webp) center/cover no-repeat`,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "0 0 100px",
        }}>
          <p style={{ fontFamily:CURSIVE, fontSize:"clamp(15px,4.2vw,21px)", fontWeight:600, color:WARM, opacity:0.88, letterSpacing:"0.04em", textAlign:"center", padding:"22px 24px 10px" }}>
            every love story is beautiful
          </p>
          <ScrapbookCanvas data={data} />
          {data.senderName && (
            <p style={{ fontFamily:CURSIVE, fontSize:"clamp(13px,3.5vw,17px)", color:WARM, opacity:0.7, textAlign:"center", padding:"10px 24px 4px", letterSpacing:"0.06em" }}>
              — from {data.senderName} ♡
            </p>
          )}
          <button onClick={handleCreateClick} style={{
            margin:"16px 0 0", padding:"10px 28px", borderRadius:50,
            border:`1.5px solid ${WARM_MID}`, background:"rgba(158,126,97,0.12)",
            fontFamily:CURSIVE, fontSize:"clamp(14px,3.8vw,17px)", fontWeight:600, color:WARM,
            cursor:"pointer", letterSpacing:"0.04em",
          }}>
            ✦ Create your own ✦
          </button>
        </div>
      )}

      {tab === "message" && (
        <PaperSection>
          <div style={{ width:"100%", maxWidth:440, background:"rgba(250,248,242,0.90)", borderRadius:8, padding:"36px 28px", boxShadow:"0 20px 60px rgba(80,50,20,0.18),0 4px 16px rgba(80,50,20,0.10)" }}>
            <p style={{ fontFamily:CURSIVE, fontSize:"clamp(11px,3vw,14px)", color:WARM, opacity:0.6, letterSpacing:"0.14em", textAlign:"center", marginBottom:20, textTransform:"uppercase" }}>
              a letter to you
            </p>
            <p style={{ fontFamily:CURSIVE, fontSize:"clamp(17px,4.8vw,24px)", color:"rgb(90,60,35)", lineHeight:1.8, textAlign:"center" }}>
              {data.personalMessage}
            </p>
            <p style={{ fontFamily:CURSIVE, fontSize:"clamp(15px,4vw,20px)", color:WARM, opacity:0.75, textAlign:"right", marginTop:24 }}>
              — {data.senderName || "Always Yours"} ♡
            </p>
          </div>
        </PaperSection>
      )}

      {tab === "photos" && (
        <PaperSection>
          <p style={{ fontFamily:CURSIVE, fontSize:"clamp(18px,5vw,26px)", fontWeight:700, color:WARM, opacity:0.88, marginBottom:20 }}>
            our moments ♡
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, width:"calc(100% - 40px)", maxWidth:380 }}>
            {[0,1,2,3].map((i) => (
              <div key={i} style={{ aspectRatio:"3/4", borderRadius:4, overflow:"hidden", background:"#faf8f2", boxShadow:"3px 6px 22px rgba(0,0,0,0.25)" }}>
                {data.galleryPhotos?.[i] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.galleryPhotos[i]} alt="" style={{ width:"100%",height:"100%",objectFit:"cover",display:"block" }} />
                ) : (
                  <div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#ede8df,#d9d0c3)" }}>
                    <span style={{ fontFamily:CURSIVE, fontSize:"clamp(10px,3vw,14px)", color:WARM, opacity:0.45 }}>photo {i+1}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </PaperSection>
      )}

      {tab === "wish" && (
        <PaperSection>
          <div style={{ width:"calc(100% - 40px)", maxWidth:420, position:"relative", background:"rgba(250,248,242,0.90)", borderRadius:8, padding:"36px 28px 44px", boxShadow:"0 20px 60px rgba(80,50,20,0.18),0 4px 16px rgba(80,50,20,0.10),0 0 0 1px rgba(158,126,97,0.15)" }}>
            <div style={{ position:"absolute",top:0,left:"10%",right:"10%",height:3,background:"linear-gradient(90deg,transparent,rgba(158,126,97,0.5),transparent)",borderRadius:2 }} />
            <div style={{ position:"absolute",bottom:0,left:"10%",right:"10%",height:3,background:"linear-gradient(90deg,transparent,rgba(158,126,97,0.5),transparent)",borderRadius:2 }} />
            <p style={{ fontFamily:CURSIVE, fontSize:"clamp(11px,3vw,14px)", color:WARM, opacity:0.6, letterSpacing:"0.14em", textAlign:"center", marginBottom:20, textTransform:"uppercase" }}>
              a little note for you
            </p>
            {data.recipientName && (
              <p style={{ fontFamily:CURSIVE, fontSize:"clamp(18px,5vw,26px)", fontWeight:600, color:WARM, textAlign:"center", marginBottom:20 }}>
                dear {data.recipientName},
              </p>
            )}
            <p style={{ fontFamily:CURSIVE, fontSize:"clamp(16px,4.5vw,22px)", color:"rgb(90,60,35)", lineHeight:1.8, textAlign:"center" }}>
              {data.wishMessage}
            </p>
            <p style={{ fontFamily:CURSIVE, fontSize:"clamp(14px,3.8vw,19px)", color:WARM, opacity:0.75, textAlign:"right", marginTop:24 }}>
              — {data.senderName || "Always Yours"} ♡
            </p>
          </div>
          <button onClick={handleCreateClick} style={{
            marginTop:24, padding:"10px 28px", borderRadius:50,
            border:`1.5px solid ${WARM_MID}`, background:"rgba(158,126,97,0.12)",
            fontFamily:CURSIVE, fontSize:"clamp(14px,3.8vw,17px)", fontWeight:600, color:WARM,
            cursor:"pointer", letterSpacing:"0.04em",
          }}>
            ✦ Create yours ✦
          </button>
        </PaperSection>
      )}

      {/* Bottom navbar */}
      <nav style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:100,
        background:"rgba(250,246,240,0.94)", backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)",
        borderTop:"1px solid rgba(158,126,97,0.22)",
        display:"flex", justifyContent:"space-around", alignItems:"center",
        padding:"5px 0 calc(6px + env(safe-area-inset-bottom,0px))",
      }}>
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display:"flex", flexDirection:"column", alignItems:"center", gap:2,
              border:"none", background:"transparent", cursor:"pointer", flex:1, padding:"3px 4px",
              opacity: active ? 1 : 0.50,
            }}>
              <span style={{ fontSize:"clamp(13px,3.8vw,16px)" }}>{t.icon}</span>
              <span style={{ fontFamily:CURSIVE, fontSize:"clamp(9px,2.3vw,11px)", fontWeight:active?700:400, color:active?WARM:"rgb(140,105,75)", letterSpacing:"0.04em" }}>
                {t.label}
              </span>
              {active && <div style={{ width:14, height:2, borderRadius:1, background:"linear-gradient(90deg,rgba(158,126,97,0.4),rgb(158,126,97),rgba(158,126,97,0.4))" }} />}
            </button>
          );
        })}
      </nav>

      <AnimatePresence>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={onAuthSuccess} />}
      </AnimatePresence>
    </>
  );
}
