"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import { GoogleG } from "../adminIcons";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ReferenceLine,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Users, Eye, FileText, TrendingUp, TrendingDown, BarChart3, MessageSquare, Star,
  Smartphone, Crown, Mail, CalendarDays, Sparkles, Globe2, Layers,
} from "lucide-react";

interface Series { date: string; count: number }
interface OverviewData {
  today?: string;
  period?: { from: string; to: string } | null;
  users: { total: number; today: number; yesterday?: number; thisWeek: number; thisMonth: number; inPeriod?: number };
  pageViews: { total: number; today: number; yesterday?: number; thisWeek: number; thisMonth: number; inPeriod?: number };
  last7?: { users: Series[]; views: Series[]; avgUsers: number; avgViews: number };
  pages: { totalCreated: number; totalPublished: number; totalDrafts?: number };
  templateStats: { type: string; label: string; slug?: string; live?: boolean; total: number; published: number }[];
  roleDistribution: { role: string; count: number }[];
  providerDistribution?: { provider: string; count: number }[];
  deviceBreakdown: { device: string; count: number }[];
}

type Period = "today" | "yesterday" | "7d" | "30d" | "90d" | "all" | "day";

const cB = "rgba(61,12,17,0.08)";
const t1 = "#2a0a0e";
const t2 = "#7f5f5f";
const tM = "#9a7070";
const g = "#c9a84c";
const gD = "#8b5a2b";
const bg = "#3d0c11";
const CC = ["#c9a84c","#8b5a2b","#a0522d","#7c3a2e","#5a2d1a","#b8860b","#d4a056","#6d4c2e","#9e7b4f","#4a2c17","#c5813a"];
const DC: Record<string,string> = { mobile: "#c9a84c", desktop: "#8b5a2b", tablet: "#a0522d", unknown: "#9a7070" };
const RC: Record<string,string> = { superadmin: "#b3261e", admin: "#c9a84c", member: "#8b5a2b", normal: "#9a7070" };
const TP_MAX = 10;
const tt: React.CSSProperties = { background:"#fff", border:`1px solid ${cB}`, borderRadius:10, color:t1, fontSize:11, boxShadow:"0 4px 16px rgba(0,0,0,0.06)" };

function fmt(n: number) { return n >= 1e6 ? (n/1e6).toFixed(1)+"M" : n >= 1e4 ? (n/1e3).toFixed(1)+"K" : n.toLocaleString("en-IN"); }

// Indian days: midnight to midnight IST, the same days the server counts.
const istDay = (offset = 0) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" })
    .format(new Date(Date.now() + offset * 86400000));
const pretty = (ymd: string, withYear = false) =>
  new Date(`${ymd}T12:00:00+05:30`).toLocaleDateString("en-IN", { day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}) });
const weekday = (ymd: string) => new Date(`${ymd}T12:00:00+05:30`).toLocaleDateString("en-IN", { weekday: "short" });

const PERIODS: { key: Period; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
  { key: "all", label: "Overall" },
];

/** Counts up to `value` when it changes. */
function useCountUp(value: number, ms = 700) {
  const [n, setN] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      setN(Math.round(a + (value - a) * e));
      if (p < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return n;
}

function Num({ value, style }: { value: number; style?: React.CSSProperties }) {
  const n = useCountUp(value);
  return <span style={style}>{fmt(n)}</span>;
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { accessToken, user } = useAppSelector((s) => s.auth);
  const [ov, setOv] = useState<OverviewData|null>(null);
  const [ug, setUg] = useState<Series[]>([]);
  const [vc, setVc] = useState<Series[]>([]);
  const [tp, setTp] = useState<{templateType:string;label:string;views:number}[]>([]);
  // The range whose data is on screen; loading/refreshing are derived from it.
  const [loadedKey, setLoadedKey] = useState<string|null>(null);
  const [period, setPeriod] = useState<Period>("today");
  const [day, setDay] = useState("");
  const [series, setSeries] = useState<"users"|"views">("users");
  const h = useCallback(()=>({Authorization:`Bearer ${accessToken}`,"Content-Type":"application/json"}),[accessToken]);

  // The period as ?from=&to= (IST days). Overall has no range; its chart shows
  // the last 90 days.
  const range = ((): { from: string; to: string } | null => {
    switch (period) {
      case "today": return { from: istDay(), to: istDay() };
      case "yesterday": return { from: istDay(-1), to: istDay(-1) };
      case "7d": return { from: istDay(-6), to: istDay() };
      case "30d": return { from: istDay(-29), to: istDay() };
      case "90d": return { from: istDay(-89), to: istDay() };
      case "day": return day ? { from: day, to: day } : null;
      default: return null;
    }
  })();
  const rFrom = range?.from ?? "", rTo = range?.to ?? "";
  const singleDay = !!range && rFrom === rTo;
  const periodLabel = !range ? "all time" : period === "today" ? "today" : period === "yesterday" ? "yesterday"
    : singleDay ? `on ${pretty(rFrom, true)}` : `${pretty(rFrom)} – ${pretty(rTo)}`;

  const key = `${rFrom}|${rTo}`;
  const loading = loadedKey === null;
  const refreshing = !loading && loadedKey !== key;

  useEffect(()=>{
    if(!accessToken)return;
    const q = rFrom ? `from=${rFrom}&to=${rTo}` : "days=90";
    const qp = rFrom ? `?from=${rFrom}&to=${rTo}` : "";
    Promise.all([
      fetch(`${API_URL}/admin/analytics/overview${qp}`,{headers:h()}).then(r=>r.json()),
      fetch(`${API_URL}/admin/analytics/user-growth?${q}`,{headers:h()}).then(r=>r.json()),
      fetch(`${API_URL}/admin/analytics/views?${q}`,{headers:h()}).then(r=>r.json()),
      fetch(`${API_URL}/admin/analytics/template-popularity${qp}`,{headers:h()}).then(r=>r.json()),
    ]).then(([o,u,v,t])=>{
      if(o.success)setOv(o.data); if(u.success)setUg(u.data); if(v.success)setVc(v.data); if(t.success)setTp(t.data);
    }).finally(()=>setLoadedKey(`${rFrom}|${rTo}`));
  },[accessToken,rFrom,rTo,h]);

  if(loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"#f5ede6"}}>
      <div className="text-center">
        <div style={{width:36,height:36,border:"3px solid rgba(61,12,17,0.1)",borderTopColor:g,borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto 10px"}}/>
        <p style={{color:tM,fontSize:12}}>Loading analytics...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  const avgU = ov?.last7?.avgUsers ?? 0;
  const todayU = ov?.users.today ?? 0;
  const delta = avgU > 0 ? Math.round(((todayU - avgU) / avgU) * 100) : null;
  const week = [...(ov?.last7?.users ?? []), { date: ov?.today ?? istDay(), count: todayU }];
  const weekMax = Math.max(1, ...week.map((d) => d.count), avgU);
  const inPeriodUsers = range ? (ov?.users.inPeriod ?? 0) : (ov?.users.total ?? 0);
  const inPeriodViews = range ? (ov?.pageViews.inPeriod ?? 0) : (ov?.pageViews.total ?? 0);
  const chartData = series === "users" ? ug : vc;
  const chartColor = series === "users" ? g : "#a0522d";
  const chartAvg = series === "users" ? avgU : (ov?.last7?.avgViews ?? 0);
  const tsMax = Math.max(1, ...(ov?.templateStats ?? []).map((t) => t.total));
  const provTotal = (ov?.providerDistribution ?? []).reduce((a, b) => a + b.count, 0) || 1;
  const roleTotal = (ov?.roleDistribution ?? []).reduce((a, b) => a + b.count, 0) || 1;

  const tab = (label: string, icon: React.ReactNode, href: string | null) => (
    <button key={label} onClick={href ? () => router.push(href) : undefined} style={{flex:"none",padding:"7px 13px",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",border:"none",
      background:href?"transparent":bg,color:href?t2:"#f5ede6",display:"inline-flex",alignItems:"center",gap:5,whiteSpace:"nowrap"}}>
      {icon}{label}
    </button>
  );

  return (
    <div className="min-h-screen md:pt-[88px]" style={{background:"linear-gradient(180deg,#faf3ee 0%,#f5ede6 50%,#efe3d3 100%)"}}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes an-pulse{0%{box-shadow:0 0 0 0 rgba(125,220,150,.7)}70%{box-shadow:0 0 0 8px rgba(125,220,150,0)}100%{box-shadow:0 0 0 0 rgba(125,220,150,0)}}
        @keyframes an-shine{from{transform:translateX(-120%) rotate(12deg)}to{transform:translateX(320%) rotate(12deg)}}
        .an-wrap{max-width:1280px;margin:0 auto;padding:14px 12px 110px}
        @media(min-width:768px){.an-wrap{padding:22px 24px 60px}}
        .an-scroll{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}
        .an-scroll::-webkit-scrollbar{display:none}
        .ac{background:rgba(255,255,255,0.7);border:1px solid ${cB};border-radius:16px;padding:14px;backdrop-filter:blur(8px);min-width:0}
        .an-kpi{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
        @media(min-width:900px){.an-kpi{grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}}
        .an-pulse{display:grid;grid-template-columns:minmax(0,1fr);gap:12px}
        @media(min-width:760px){.an-pulse{grid-template-columns:minmax(0,1.1fr) minmax(0,1fr)}}
        .ag2{display:grid;grid-template-columns:minmax(0,1fr);gap:10px}
        @media(min-width:900px){.ag2{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}}
        .an-chip:hover{transform:translateY(-1px)}
        .an-row:hover{background:rgba(201,168,76,.08)}
      `}</style>

      <div className="an-wrap">
        {/* Tabs */}
        <div className="an-scroll" style={{background:"rgba(255,255,255,0.6)",border:`1px solid ${cB}`,borderRadius:12,padding:3,marginBottom:12,width:"fit-content",maxWidth:"100%"}}>
          {tab("Analytics", <BarChart3 size={13}/>, null)}
          {tab("Users", <Users size={13}/>, "/admin/users")}
          {tab("Contacts", <MessageSquare size={13}/>, "/admin/contacts")}
          {isSuperAdmin(user?.role) && tab("Feedback", <Star size={13}/>, "/admin/feedback")}
          {isSuperAdmin(user?.role) && tab("Drafts", <FileText size={13}/>, "/admin/drafts")}
          {isSuperAdmin(user?.role) && tab("Conversations", <Mail size={13}/>, "/admin/threads")}
        </div>

        {/* ── Pulse: today, live ─────────────────────────────────────────── */}
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:.45}}
          style={{position:"relative",overflow:"hidden",borderRadius:20,padding:"16px 16px 14px",marginBottom:12,color:"#f5ede6",
            background:"radial-gradient(120% 140% at 0% 0%,#6b1a22 0%,#3d0c11 55%,#240609 100%)",boxShadow:"0 18px 40px -22px rgba(61,12,17,.8)"}}>
          <span aria-hidden style={{position:"absolute",top:-40,bottom:-40,width:60,background:"linear-gradient(90deg,transparent,rgba(255,236,190,.14),transparent)",animation:"an-shine 5s ease-in-out infinite"}}/>
          <div className="an-pulse" style={{position:"relative"}}>
            <div style={{display:"flex",flexWrap:"wrap",alignItems:"flex-end",gap:"10px 22px"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:7,fontSize:10.5,fontWeight:800,letterSpacing:".14em",textTransform:"uppercase",color:"#e9c98a"}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:"#7ddc96",animation:"an-pulse 1.8s infinite"}}/>
                  Today · {ov?.today ? pretty(ov.today) : ""} <span style={{opacity:.6,fontWeight:700,letterSpacing:".04em",textTransform:"none"}}>since 12 AM IST</span>
                </div>
                <div style={{display:"flex",alignItems:"baseline",gap:8,marginTop:6}}>
                  <Num value={todayU} style={{fontSize:44,fontWeight:800,lineHeight:1,fontFamily:"'Playfair Display',serif",color:"#ffe3a3"}}/>
                  <span style={{fontSize:13,fontWeight:700,opacity:.85}}>new users</span>
                </div>
                {delta !== null && (
                  <span style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:7,padding:"3px 9px",borderRadius:99,fontSize:11,fontWeight:800,
                    background:delta>=0?"rgba(125,220,150,.16)":"rgba(255,140,140,.16)",color:delta>=0?"#9ff0b4":"#ffb3b3"}}>
                    {delta>=0?<TrendingUp size={12}/>:<TrendingDown size={12}/>}{delta>=0?"+":""}{delta}% vs 7-day avg
                  </span>
                )}
              </div>
              <div style={{display:"flex",gap:18}}>
                {[
                  {l:"Yesterday",v:ov?.users.yesterday??0},
                  {l:"Avg / day",v:avgU,dec:true},
                  {l:"Views today",v:ov?.pageViews.today??0},
                ].map(s=>(
                  <div key={s.l}>
                    <div style={{fontSize:22,fontWeight:800,lineHeight:1,color:"#fff"}}>{s.dec?s.v.toFixed(1):<Num value={s.v}/>}</div>
                    <div style={{fontSize:10.5,opacity:.7,marginTop:3,fontWeight:600}}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Last 7 full days + today, against the average line */}
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",fontSize:10.5,fontWeight:700,opacity:.8,marginBottom:6}}>
                <span>Last 7 days · avg <b style={{color:"#ffe3a3"}}>{avgU.toFixed(1)}</b> users/day</span>
                <span style={{opacity:.7}}>{ov?.last7?.avgViews?.toFixed(0) ?? 0} views/day</span>
              </div>
              <div style={{position:"relative",height:108,display:"flex",alignItems:"flex-end",gap:6}}>
                <div aria-hidden style={{position:"absolute",left:0,right:0,bottom:`calc(${(avgU/weekMax)*72}px + 18px)`,borderTop:"1.5px dashed rgba(255,227,163,.55)"}}/>
                {week.map((d,i)=>{
                  const isToday = i === week.length-1;
                  return (
                    <div key={d.date} title={`${pretty(d.date)} · ${d.count} users`} style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                      <span style={{fontSize:10,fontWeight:800,color:isToday?"#ffe3a3":"rgba(255,255,255,.8)"}}>{d.count}</span>
                      <motion.div initial={{height:0}} animate={{height:Math.max(3,(d.count/weekMax)*72)}} transition={{delay:.1+i*.05,type:"spring",stiffness:160,damping:20}}
                        style={{width:"100%",maxWidth:34,borderRadius:"7px 7px 3px 3px",
                          background:isToday?"linear-gradient(180deg,#ffe3a3,#c9a84c)":"linear-gradient(180deg,rgba(255,255,255,.45),rgba(255,255,255,.14))",
                          boxShadow:isToday?"0 0 18px rgba(255,210,120,.45)":"none"}}/>
                      <span style={{fontSize:9.5,fontWeight:700,opacity:isToday?1:.6}}>{isToday?"Today":weekday(d.date)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Period picker ──────────────────────────────────────────────── */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}>
          <div className="an-scroll" style={{flex:"1 1 auto",minWidth:0}}>
            {PERIODS.map(p=>{
              const on = period===p.key;
              return (
                <button key={p.key} className="an-chip" onClick={()=>setPeriod(p.key)} style={{flex:"none",position:"relative",height:34,padding:"0 14px",borderRadius:99,fontSize:12,fontWeight:700,cursor:"pointer",
                  border:on?"none":`1px solid ${cB}`,background:on?"transparent":"rgba(255,255,255,.7)",color:on?"#f5ede6":t2,transition:"transform .15s"}}>
                  {on && <motion.span layoutId="an-period" transition={{type:"spring",stiffness:380,damping:30}} style={{position:"absolute",inset:0,borderRadius:99,background:bg,zIndex:0}}/>}
                  <span style={{position:"relative",zIndex:1}}>{p.label}</span>
                </button>
              );
            })}
            <label className="an-chip" style={{flex:"none",position:"relative",height:34,padding:"0 13px",borderRadius:99,fontSize:12,fontWeight:700,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:6,
              border:period==="day"?`1.5px solid ${g}`:`1px solid ${cB}`,background:period==="day"?`${g}22`:"rgba(255,255,255,.7)",color:period==="day"?gD:t2}}>
              <CalendarDays size={13}/>{period==="day"&&day?pretty(day,true):"Pick a day"}
              <input type="date" max={istDay()} value={day} aria-label="Pick a day"
                onChange={e=>{setDay(e.target.value);setPeriod(e.target.value?"day":"today");}}
                style={{position:"absolute",inset:0,opacity:0,cursor:"pointer",width:"100%"}}/>
            </label>
          </div>
          <span style={{fontSize:11.5,color:tM,fontWeight:600,display:"inline-flex",alignItems:"center",gap:5}}>
            {refreshing && <span style={{width:11,height:11,border:`2px solid ${cB}`,borderTopColor:g,borderRadius:"50%",animation:"spin .8s linear infinite"}}/>}
            Showing <b style={{color:t1}}>{periodLabel}</b>
          </span>
        </div>

        {/* ── KPIs for the period ────────────────────────────────────────── */}
        <div className="an-kpi" style={{marginBottom:10}}>
          {[
            {icon:<Users size={15}/>,label:"New users",value:inPeriodUsers,sub:`avg ${avgU.toFixed(1)}/day over 7 days`,accent:g},
            {icon:<Eye size={15}/>,label:"Page views",value:inPeriodViews,sub:`${fmt(ov?.pageViews.thisWeek??0)} in 7 days`,accent:"#a0522d"},
            {icon:<FileText size={15}/>,label:"Pages created",value:ov?.pages.totalCreated??0,sub:`${ov?.pages.totalPublished??0} published · ${ov?.pages.totalDrafts??0} draft`,accent:gD},
            {icon:<Sparkles size={15}/>,label:"Total users",value:ov?.users.total??0,sub:`+${fmt(ov?.users.thisMonth??0)} in 30 days`,accent:bg},
          ].map((k,i)=>(
            <motion.div key={k.label} className="ac" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.08+i*.05}}
              style={{padding:"11px 12px",position:"relative",overflow:"hidden"}}>
              <span aria-hidden style={{position:"absolute",right:-18,top:-18,width:64,height:64,borderRadius:"50%",background:`${k.accent}14`}}/>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <span style={{width:26,height:26,borderRadius:8,display:"grid",placeItems:"center",background:`${k.accent}18`,color:k.accent,flex:"none"}}>{k.icon}</span>
                <span style={{fontSize:10.5,color:tM,fontWeight:700,letterSpacing:".03em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{k.label}</span>
              </div>
              <div style={{marginTop:7,fontSize:"clamp(22px,5.4vw,28px)",fontWeight:800,color:t1,fontFamily:"'Playfair Display',serif",lineHeight:1}}>
                <Num value={k.value}/>
              </div>
              <div style={{marginTop:5,fontSize:10.5,color:k.accent,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{k.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Trend ─────────────────────────────────────────────────────── */}
        <div className="ac" style={{marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}>
            <TrendingUp size={15} color={g}/>
            <h2 style={{fontSize:13.5,fontWeight:800,color:t1,margin:0}}>
              {series==="users"?"New users":"Page views"} <span style={{color:tM,fontWeight:600,fontSize:12}}>· {singleDay?`by hour ${periodLabel}`:range?periodLabel:"last 90 days"}</span>
            </h2>
            <div style={{marginLeft:"auto",display:"flex",background:"rgba(61,12,17,.05)",borderRadius:99,padding:3}}>
              {(["users","views"] as const).map(s=>(
                <button key={s} onClick={()=>setSeries(s)} style={{position:"relative",border:"none",background:"transparent",padding:"5px 12px",borderRadius:99,fontSize:11.5,fontWeight:700,cursor:"pointer",color:series===s?"#fff":t2}}>
                  {series===s&&<motion.span layoutId="an-series" style={{position:"absolute",inset:0,borderRadius:99,background:s==="users"?g:"#a0522d"}}/>}
                  <span style={{position:"relative",textTransform:"capitalize"}}>{s}</span>
                </button>
              ))}
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={series+rFrom+rTo} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.25}} style={{width:"100%",height:"clamp(170px,26vw,240px)"}}>
              <ResponsiveContainer>
                {singleDay ? (
                  <BarChart data={chartData} margin={{top:6,right:6,left:-8,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,12,17,0.06)" vertical={false}/>
                    <XAxis dataKey="date" tick={{fill:tM,fontSize:9}} tickFormatter={v=>String(v).slice(0,2)} interval={2}/>
                    <YAxis tick={{fill:tM,fontSize:9}} width={30} allowDecimals={false}/>
                    <Tooltip contentStyle={tt} cursor={{fill:"rgba(201,168,76,.1)"}} labelFormatter={l=>`${l} IST`}/>
                    <Bar dataKey="count" name={series==="users"?"New users":"Views"} fill={chartColor} radius={[5,5,0,0]} animationDuration={600}/>
                  </BarChart>
                ) : (
                  <AreaChart data={chartData} margin={{top:6,right:6,left:-8,bottom:0}}>
                    <defs><linearGradient id="anG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={chartColor} stopOpacity={0.35}/><stop offset="100%" stopColor={chartColor} stopOpacity={0.02}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,12,17,0.06)" vertical={false}/>
                    <XAxis dataKey="date" tick={{fill:tM,fontSize:9}} tickFormatter={v=>pretty(String(v))} minTickGap={14}/>
                    <YAxis tick={{fill:tM,fontSize:9}} width={30} allowDecimals={false}/>
                    <Tooltip contentStyle={tt} labelFormatter={l=>pretty(String(l),true)}/>
                    {chartAvg>0 && <ReferenceLine y={chartAvg} stroke={bg} strokeDasharray="4 4" strokeOpacity={.45} label={{value:`7d avg ${chartAvg.toFixed(1)}`,position:"insideTopRight",fill:t2,fontSize:9}}/>}
                    <Area type="monotone" dataKey="count" stroke={chartColor} fill="url(#anG)" strokeWidth={2.2} name={series==="users"?"New users":"Views"} animationDuration={700}/>
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Templates ─────────────────────────────────────────────────── */}
        <div className="ag2" style={{marginBottom:10}}>
          <div className="ac">
            <CH icon={<Layers size={15} color={gD}/>} title="Pages created by template" note={`${periodLabel} · ${(ov?.templateStats??[]).filter(t=>t.live!==false).length} live`}/>
            {/* A hidden template also sits at zero, and the two mean opposite
                things: one nobody wanted, the other nobody could reach. */}
            <div style={{maxHeight:300,overflowY:"auto",marginRight:-6,paddingRight:6}}>
              {(ov?.templateStats??[]).filter(t=>t.total>0||!range).map((t,i)=>(
                <div key={t.type} className="an-row" style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) auto",gap:"3px 10px",alignItems:"center",padding:"6px 6px",borderRadius:9,opacity:t.total===0&&t.live!==false?0.5:1}}>
                  <span style={{fontSize:12,fontWeight:700,color:t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {t.label}
                    {t.live===false&&<span title="Switched off in Admin → Templates" style={{marginLeft:6,padding:"1px 5px",borderRadius:4,fontSize:8,fontWeight:800,letterSpacing:".04em",textTransform:"uppercase",background:"rgba(61,12,17,0.07)",color:tM}}>hidden</span>}
                  </span>
                  <span style={{fontSize:11,color:t2,fontWeight:700,whiteSpace:"nowrap"}}><b style={{color:t1}}>{t.total}</b> · <span style={{color:"#1e7a4b"}}>{t.published} live</span></span>
                  <div style={{gridColumn:"1/-1",height:5,borderRadius:99,background:"rgba(61,12,17,.05)",overflow:"hidden"}}>
                    <motion.div initial={{width:0}} animate={{width:`${(t.total/tsMax)*100}%`}} transition={{delay:.05+Math.min(i,12)*.03,duration:.6}}
                      style={{height:"100%",borderRadius:99,background:`linear-gradient(90deg,${CC[i%CC.length]},${g})`}}/>
                  </div>
                </div>
              ))}
              {range && !(ov?.templateStats??[]).some(t=>t.total>0) && <p style={{fontSize:12,color:tM,textAlign:"center",padding:20,margin:0}}>No pages created {periodLabel}.</p>}
            </div>
          </div>
          <div className="ac">
            <CH icon={<BarChart3 size={15} color="#a0522d"/>} title="Most viewed templates" note={tp.length>TP_MAX?`top ${TP_MAX} of ${tp.length}`:periodLabel}/>
            {tp.length ? (
              <div style={{width:"100%",height:Math.max(70,Math.min(tp.length,TP_MAX)*30+10)}}>
                <ResponsiveContainer>
                  <BarChart data={tp.slice(0,TP_MAX)} layout="vertical" margin={{left:0,right:10}}>
                    <XAxis type="number" hide/>
                    <YAxis type="category" dataKey="label" tick={{fill:t2,fontSize:9.5}} width={100}/>
                    <Tooltip contentStyle={tt} cursor={{fill:"rgba(201,168,76,.08)"}}/>
                    <Bar dataKey="views" name="Views" radius={[0,7,7,0]} barSize={14} label={{position:"right",fill:t2,fontSize:9.5}}>{tp.slice(0,TP_MAX).map((_,i)=><Cell key={i} fill={CC[i%CC.length]}/>)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <p style={{fontSize:12,color:tM,textAlign:"center",padding:30,margin:0}}>No views {periodLabel}.</p>}
          </div>
        </div>

        {/* ── Audience ──────────────────────────────────────────────────── */}
        <div className="ag2">
          <div className="ac">
            <CH icon={<Smartphone size={15} color={g}/>} title="Devices" note={periodLabel}/>
            {(ov?.deviceBreakdown??[]).length ? (
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:130,height:130,flex:"none"}}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={ov?.deviceBreakdown??[]} innerRadius="58%" outerRadius="92%" paddingAngle={3} dataKey="count" nameKey="device" stroke="none">
                        {(ov?.deviceBreakdown??[]).map((d,i)=><Cell key={i} fill={DC[d.device]||CC[i]}/>)}
                      </Pie>
                      <Tooltip contentStyle={tt}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{flex:1,minWidth:0,display:"grid",gap:6}}>
                  {(()=>{const tot=(ov?.deviceBreakdown??[]).reduce((a,b)=>a+b.count,0)||1;return (ov?.deviceBreakdown??[]).map((d,i)=>(
                    <div key={d.device} style={{display:"flex",alignItems:"center",gap:7,fontSize:12}}>
                      <span style={{width:9,height:9,borderRadius:3,background:DC[d.device]||CC[i],flex:"none"}}/>
                      <span style={{textTransform:"capitalize",fontWeight:700,color:t1}}>{d.device}</span>
                      <span style={{marginLeft:"auto",color:t2,fontWeight:700}}>{Math.round(d.count/tot*100)}%</span>
                      <span style={{color:tM,fontSize:10.5,minWidth:34,textAlign:"right"}}>{fmt(d.count)}</span>
                    </div>
                  ));})()}
                </div>
              </div>
            ) : <p style={{fontSize:12,color:tM,textAlign:"center",padding:24,margin:0}}>No views {periodLabel}.</p>}
          </div>
          <div className="ac">
            <CH icon={<Crown size={15} color={g}/>} title="Who signed up" note={periodLabel}/>
            <div style={{display:"grid",gap:8}}>
              {(ov?.providerDistribution??[]).map(p=>{
                const pct=Math.round(p.count/provTotal*100);
                const google=p.provider==="google";
                return (
                  <div key={p.provider} style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{width:22,height:22,borderRadius:7,display:"grid",placeItems:"center",background:"#fff",border:`1px solid ${cB}`,flex:"none"}}>
                      {google?<GoogleG size={12}/>:<Mail size={12} color={gD}/>}
                    </span>
                    <span style={{fontSize:12,fontWeight:700,color:t1,minWidth:58}}>{google?"Google":"Email"}</span>
                    <div style={{flex:1,height:7,borderRadius:99,background:"rgba(61,12,17,.05)",overflow:"hidden"}}>
                      <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:.6}} style={{height:"100%",borderRadius:99,background:google?"linear-gradient(90deg,#4285F4,#34A853)":`linear-gradient(90deg,${gD},${g})`}}/>
                    </div>
                    <span style={{fontSize:11,color:t2,fontWeight:700,minWidth:62,textAlign:"right"}}>{p.count} · {pct}%</span>
                  </div>
                );
              })}
              <div style={{height:1,background:cB,margin:"2px 0"}}/>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {(ov?.roleDistribution??[]).map(r=>(
                  <span key={r.role} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 9px",borderRadius:99,fontSize:11,fontWeight:700,textTransform:"capitalize",
                    background:`${RC[r.role]||tM}14`,color:RC[r.role]||tM,border:`1px solid ${RC[r.role]||tM}30`}}>
                    {r.role} · {r.count} <span style={{opacity:.6}}>({Math.round(r.count/roleTotal*100)}%)</span>
                  </span>
                ))}
                {!(ov?.roleDistribution??[]).length && <span style={{fontSize:12,color:tM}}>Nobody signed up {periodLabel}.</span>}
              </div>
            </div>
          </div>
        </div>
        <p style={{margin:"12px 2px 0",fontSize:10.5,color:tM,display:"flex",alignItems:"center",gap:5}}>
          <Globe2 size={11}/> Days run midnight to midnight, India time (IST).
        </p>
      </div>
    </div>
  );
}

function CH({icon,title,note}:{icon:React.ReactNode;title:string;note?:string}){
  return (
    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10,minWidth:0}}>
      {icon}
      <h2 style={{fontSize:13.5,fontWeight:800,color:t1,margin:0,whiteSpace:"nowrap"}}>{title}</h2>
      {note && <span style={{fontSize:11,color:tM,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>· {note}</span>}
    </div>
  );
}
