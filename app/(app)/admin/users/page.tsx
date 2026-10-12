"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import { AnimatePresence, motion } from "framer-motion";
import {
  Users, Crown, UserCheck, User as UserIcon,
  ChevronLeft, ChevronRight, Eye, FileText, Calendar, Mail,
  X, ExternalLink, Trash2, Loader2, Star, LayoutTemplate, CalendarDays, Clock3, Coins,
} from "lucide-react";
import { ROLE_META, RoleIcon, ProviderIcon } from "../adminIcons";
import { AdminPage, Panel, Hero, ChipGroup, SearchBox, Loading, EmptyState, Tag, Num, rise } from "../adminKit";

const ago=(d:Date)=>{
  const m=Math.max(0,Math.round((Date.now()-d.getTime())/60000));
  if(m<1)return "just now"; if(m<60)return `${m}m ago`;
  const h=Math.round(m/60); if(h<24)return `${h}h ago`;
  const dd=Math.round(h/24); if(dd<30)return `${dd}d ago`;
  const mo=Math.round(dd/30); return mo<12?`${mo}mo ago`:`${Math.round(mo/12)}y ago`;
};

interface UserItem {
  _id:string; name:string; email:string; avatar?:string; provider:string;
  role:string; status?:string; statusReason?:string; points:number; isVerified:boolean; createdAt:string;
  feedback?:{count:number;avg:number;templates:number}|null;
  templatePages?:number; templateLastAt?:string;
}
interface TplCount { type:string; label:string; users:number; pages:number }
type DateMode = ""|"today"|"yesterday"|"week"|"custom";

// Days are Indian days: "today" at 11pm IST is still today, not tomorrow in UTC.
const istDay=(offset=0)=>{
  const d=new Date(Date.now()+offset*86400000);
  return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(d);
};
const prettyDay=(ymd:string)=>new Date(`${ymd}T12:00:00+05:30`).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
interface UserDetailData {
  user: UserItem & { totalPointsEarned:number; referralCode:string; subdomain?:string; updatedAt:string };
  pages: { _id:string; templateType:string; templateLabel:string; shareId?:string; isPublished:boolean; viewCount?:number; installCount?:number; createdAt:string }[];
  stats: { totalPagesCreated:number; totalPagesPublished:number; totalViews:number };
}
interface Pg { page:number; limit:number; total:number; totalPages:number }

const cB="rgba(61,12,17,0.08)";
const t1="#2a0a0e";
const t2="#7f5f5f";
const tM="#9a7070";
const g="#c9a84c";
const gD="#8b5a2b";
const bg="#3d0c11";
const RC:Record<string,string>={superadmin:"#b3261e",admin:g,member:gD,normal:tM};
const SC:Record<string,string>={active:"#1e7a4b",suspended:gD,banned:"#b3261e",closed:"#6b6470"};

export default function AdminUsersPage(){
  const router=useRouter();
  const {accessToken,user:me}=useAppSelector(s=>s.auth);
  const superAdmin=isSuperAdmin(me?.role);
  const [users,setUsers]=useState<UserItem[]>([]);
  const [pg,setPg]=useState<Pg>({page:1,limit:20,total:0,totalPages:0});
  const [search,setSearch]=useState("");
  const [rf,setRf]=useState("");
  const [sf,setSf]=useState("");
  const [loading,setLoading]=useState(true);
  const [sel,setSel]=useState<UserDetailData|null>(null);
  const [dLoading,setDLoading]=useState(false);
  const [rc,setRc]=useState<string|null>(null);
  const [pageConfirm,setPageConfirm]=useState<string|null>(null);
  const [pageDeleting,setPageDeleting]=useState<string|null>(null);
  const [dateMode,setDateMode]=useState<DateMode>("");
  const [customDay,setCustomDay]=useState("");
  const [tpl,setTpl]=useState("");
  const [tplCounts,setTplCounts]=useState<TplCount[]>([]);
  const [tplSummary,setTplSummary]=useState<{label:string;pages:number}|null>(null);

  // The day range the chips and the calendar describe, as ?from=&to=.
  const range=((): {from:string;to:string}|null=>{
    if(dateMode==="today")return {from:istDay(),to:istDay()};
    if(dateMode==="yesterday")return {from:istDay(-1),to:istDay(-1)};
    if(dateMode==="week")return {from:istDay(-6),to:istDay()};
    if(dateMode==="custom"&&customDay)return {from:customDay,to:customDay};
    return null;
  })();
  const rangeFrom=range?.from??"", rangeTo=range?.to??"";
  const rangeLabel=!range?"":dateMode==="today"?"today":dateMode==="yesterday"?"yesterday":dateMode==="week"?"in the last 7 days":`on ${prettyDay(range.from)}`;

  const hdr=useCallback(()=>({Authorization:`Bearer ${accessToken}`,"Content-Type":"application/json"}),[accessToken]);

  const fetchUsers=useCallback(async(page=1)=>{
    if(!accessToken)return;
    setLoading(true);
    try{
      const p=new URLSearchParams({page:String(page),limit:"20"});
      if(search)p.set("search",search); if(rf)p.set("role",rf); if(sf)p.set("status",sf);
      if(rangeFrom){p.set("from",rangeFrom);p.set("to",rangeTo);}
      if(tpl)p.set("template",tpl);
      const res=await fetch(`${API_URL}/admin/users?${p}`,{headers:hdr()});
      const data=await res.json();
      if(data.success){setUsers(data.data.users);setPg(data.data.pagination);setTplSummary(data.data.template??null);}
    }finally{setLoading(false);}
  },[accessToken,search,rf,sf,rangeFrom,rangeTo,tpl,hdr]);

  useEffect(()=>{fetchUsers(1);},[fetchUsers]);

  // Template picker counts follow the chosen day, so "Kundli Milan · 4" means
  // four people made one in that range.
  useEffect(()=>{
    if(!accessToken)return;
    const p=new URLSearchParams();
    if(rangeFrom){p.set("from",rangeFrom);p.set("to",rangeTo);}
    let live=true;
    fetch(`${API_URL}/admin/users/template-counts?${p}`,{headers:hdr()})
      .then(r=>r.json()).then(d=>{if(live&&d.success)setTplCounts(d.data);}).catch(()=>{});
    return()=>{live=false;};
  },[accessToken,rangeFrom,rangeTo,hdr]);

  const chip=(on:boolean)=>({
    flex:"none" as const,height:32,padding:"0 12px",borderRadius:99,fontSize:12,fontWeight:700,cursor:"pointer",
    display:"inline-flex",alignItems:"center",gap:5,whiteSpace:"nowrap" as const,
    border:on?"1px solid transparent":`1px solid ${cB}`,
    background:on?bg:"rgba(255,255,255,0.72)",
    color:on?"#fff6e6":t2,
  });
  const activeTpl=tplCounts.find(t=>t.type===tpl);

  const openUser=(id:string)=>{
    if(superAdmin){router.push(`/admin/users/${id}`);return;}
    fetchDetail(id);
  };

  const fetchDetail=async(id:string)=>{
    setDLoading(true);
    try{
      const res=await fetch(`${API_URL}/admin/users/${id}`,{headers:hdr()});
      const data=await res.json();
      if(data.success)setSel(data.data);
    }finally{setDLoading(false);}
  };

  const changeRole=async(id:string,role:string)=>{
    setRc(id);
    try{
      const res=await fetch(`${API_URL}/admin/users/${id}/role`,{method:"PATCH",headers:hdr(),body:JSON.stringify({role})});
      const data=await res.json();
      if(data.success){
        setUsers(prev=>prev.map(u=>(u._id===id?{...u,role}:u)));
        if(sel?.user._id===id)setSel(prev=>prev?{...prev,user:{...prev.user,role}}:null);
      }else alert(data.error||"Failed");
    }finally{setRc(null);}
  };

  const deletePage=async(pageId:string,templateType:string)=>{
    setPageDeleting(pageId);
    try{
      const res=await fetch(`${API_URL}/admin/pages/${pageId}?templateType=${encodeURIComponent(templateType)}`,{method:"DELETE",headers:hdr()});
      const data=await res.json().catch(()=>({}));
      if(res.ok&&data.success!==false){
        // Page is gone on the server, so its shared link now 404s for everyone.
        setSel(prev=>{
          if(!prev)return prev;
          const pages=prev.pages.filter(p=>p._id!==pageId);
          return {...prev,pages,stats:{...prev.stats,
            totalPagesCreated:Math.max(0,prev.stats.totalPagesCreated-1),
            totalPagesPublished:pages.filter(p=>p.isPublished).length}};
        });
        setPageConfirm(null);
      }else alert(data.error||"Failed to delete page");
    }catch{alert("Failed to delete page. Please try again.");}
    finally{setPageDeleting(null);}
  };

  // Only rendered when the account is NOT active: a pill on every row would be
  // noise, and the whole point is that a suspended, banned or closed account
  // stands out.
  const StatusPill=({status}:{status?:string})=>{
    if(!status||status==="active")return null;
    return(
      <span style={{display:"inline-flex",alignItems:"center",padding:"3px 8px",borderRadius:6,
        fontSize:10,fontWeight:700,textTransform:"capitalize",marginLeft:4,
        background:`${SC[status]}15`,color:SC[status],border:`1px solid ${SC[status]}30`}}>
        {status}
      </span>
    );
  };

  const Badge=({role}:{role:string})=>{
    const Icon=role==="admin"||role==="superadmin"?Crown:role==="member"?UserCheck:UserIcon;
    return(
      <span style={{display:"inline-flex",alignItems:"center",gap:3,padding:"3px 8px",borderRadius:6,
        fontSize:10,fontWeight:700,textTransform:"capitalize",
        background:`${RC[role]}15`,color:RC[role],border:`1px solid ${RC[role]}30`}}>
        <Icon size={11}/> {role}
      </span>
    );
  };

  const filtered=!!(tpl||range);
  const closeSel=()=>{if(!dLoading){setSel(null);setPageConfirm(null);}};

  return(
    <AdminPage title="Users" subtitle="Everyone who signed up — filter by day, template, role or status." icon={<Users size={18}/>}>
      <style>{`
        .uCard:active{transform:scale(.99)}
        .uCard:focus-visible{outline:2px solid ${g};outline-offset:2px}
        @keyframes uIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .u-row{display:flex;align-items:center;gap:6px;min-width:0}
        .u-lbl{flex:none;display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:${tM};margin-right:2px}
        .u-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:8px}
        .u-filters{display:flex;flex-direction:column;gap:8px}
        .u-ov{position:fixed;inset:0;z-index:189;background:rgba(42,10,14,.32);backdrop-filter:blur(4px)}
        .u-wrap{position:fixed;inset:0;z-index:190;display:flex;align-items:flex-end;justify-content:center;pointer-events:none}
        @media(min-width:640px){.u-wrap{align-items:center;padding:16px}}
        .u-modal{position:relative;pointer-events:auto;width:100%;max-height:92dvh;overflow-y:auto;overscroll-behavior:contain;
          background:linear-gradient(180deg,#fffdfb 0%,#f7efe6 100%);border:1px solid ${cB};border-radius:22px 22px 0 0;
          padding:18px 14px calc(22px + env(safe-area-inset-bottom));box-shadow:0 -20px 60px -20px rgba(42,10,14,.45)}
        @media(min-width:640px){.u-modal{width:min(92vw,540px);max-height:86vh;border-radius:22px;padding:20px 18px 22px;box-shadow:0 30px 70px -24px rgba(42,10,14,.5)}}
        .u-mstats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:12px}
        .u-mstat{padding:9px 10px;border-radius:12px;background:#fff;border:1px solid ${cB};min-width:0}
        .u-info{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 10px;margin-bottom:14px;font-size:11.5px;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.6);border:1px solid ${cB}}
      `}</style>

      {/* What the filters add up to */}
      <Hero style={{padding:"13px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
          <div style={{fontSize:34,fontWeight:800,lineHeight:1,color:"#ffe3a3",fontFamily:"'Playfair Display',serif"}}>
            {loading&&!pg.total?"…":<Num value={pg.total}/>}
          </div>
          <div style={{fontSize:13,fontWeight:600,lineHeight:1.4,minWidth:0,flex:"1 1 180px",overflowWrap:"anywhere"}}>
            {tpl
              ? <>{pg.total===1?"person":"people"} created <b style={{color:"#ffe3a3"}}>{tplSummary?.label||activeTpl?.label||tpl}</b>{rangeLabel?` ${rangeLabel}`:""}{tplSummary?` · ${tplSummary.pages} ${tplSummary.pages===1?"page":"pages"}`:""}</>
              : range
                ? <>{pg.total===1?"person":"people"} signed up {rangeLabel}</>
                : <>users in total</>}
          </div>
          {filtered&&(
            <button type="button" onClick={()=>{setTpl("");setDateMode("");setCustomDay("");}}
              style={{flex:"none",display:"inline-flex",alignItems:"center",gap:4,height:30,padding:"0 11px",borderRadius:99,fontSize:11.5,fontWeight:800,cursor:"pointer",
                background:"rgba(255,255,255,.12)",color:"#fff6e6",border:"1px solid rgba(255,227,163,.35)"}}>
              <X size={12}/> Clear
            </button>
          )}
        </div>
      </Hero>

      <Panel pad={12} delay={0.05} style={{marginBottom:12}}>
        <div className="u-filters">
          <SearchBox value={search} onChange={setSearch} onEnter={()=>fetchUsers(1)} placeholder="Search by name or email..."/>

          {/* When: chips for the usual days, the calendar for any other */}
          <div className="u-row">
            <span className="u-lbl"><CalendarDays size={12}/> When</span>
            <div className="adk-chips" style={{flex:1}}>
              <ChipGroup<DateMode> id="u-when" value={dateMode} onChange={setDateMode} style={{overflow:"visible",padding:0,flex:"none"}}
                options={[{value:"",label:"All time"},{value:"today",label:"Today"},{value:"yesterday",label:"Yesterday"},{value:"week",label:"Last 7 days"}]}/>
              <label style={{...chip(dateMode==="custom"),position:"relative"}}>
                <Calendar size={12}/>{dateMode==="custom"&&customDay?prettyDay(customDay):"Pick a day"}
                <input type="date" max={istDay()} value={customDay}
                  onChange={e=>{setCustomDay(e.target.value);setDateMode(e.target.value?"custom":"");}}
                  aria-label="Pick a day"
                  style={{position:"absolute",inset:0,opacity:0,cursor:"pointer",width:"100%"}}/>
              </label>
            </div>
          </div>

          {/* Which template they made */}
          <div className="u-row">
            <span className="u-lbl"><LayoutTemplate size={12}/> Template</span>
            <select value={tpl} onChange={e=>setTpl(e.target.value)} aria-label="Filter by template" className="adk-input"
              style={{flex:"1 1 200px",minWidth:0,maxWidth:380,height:34,padding:"0 10px",fontSize:12.5,fontWeight:700,
                background:tpl?`${g}14`:"#fff",borderColor:tpl?g:undefined}}>
              <option value="">Any template</option>
              {tplCounts.map(t=>(
                <option key={t.type} value={t.type} disabled={!t.users&&t.type!==tpl}>
                  {t.label} · {t.users} {t.users===1?"user":"users"}
                </option>
              ))}
            </select>
          </div>

          {/* Role + status */}
          <div className="adk-chips" style={{alignItems:"center"}}>
            <ChipGroup id="u-role" value={rf} onChange={setRf} style={{overflow:"visible",padding:0,flex:"none"}}
              options={["","normal","member","admin","superadmin"].map(r=>({value:r,label:r?<span style={{textTransform:"capitalize"}}>{r}</span>:"All roles",tone:r?RC[r]:undefined}))}/>
            <span style={{flex:"none",width:1,height:20,background:cB}}/>
            <ChipGroup id="u-status" value={sf} onChange={setSf} style={{overflow:"visible",padding:0,flex:"none"}}
              options={["","active","suspended","banned","closed"].map(st=>({value:st,label:st?<span style={{textTransform:"capitalize"}}>{st}</span>:"Any status",tone:SC[st]}))}/>
          </div>
        </div>
      </Panel>

      {loading?<Loading label="Loading users…"/>:(
        <>
          {/*
            One card grid at every width.

            This used to be a desktop <table> plus a separate mobile
            list — two markups to keep in step, and the table squeezed
            role, provider, points and joined date into columns narrow
            enough to truncate. Cards show the same fields with room to
            read them, and the grid reflows to one column on a phone
            without a horizontal scrollbar.
          */}
          {!users.length?(
            <EmptyState icon={<Users size={20}/>} title={filtered?"Nobody matches these filters":"No users found"} note={filtered?"Try another day or template.":undefined}/>
          ):(
            <div className="u-grid">
                  {users.map((u,i)=>{
                    const fb=u.feedback;
                    const tone=!fb?tM:fb.avg>=4?"#1e7a4b":fb.avg>=3?"#b7791f":"#b3261e";
                    const rm=ROLE_META[u.role]||ROLE_META.normal;
                    const joined=new Date(u.createdAt);
                    return(
                    // The whole card is the way in: a super admin lands on the
                    // profile (where the role is changed), an admin gets the
                    // quick-look modal.
                    <button key={u._id} type="button" onClick={()=>openUser(u._id)} className="adk-card uCard"
                      aria-label={`Open ${u.name}'s profile`}
                      style={{padding:"10px 11px",animation:`uIn .35s ${Math.min(i,12)*0.03}s both`}}>
                      <span aria-hidden style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:rm.color,opacity:.85}}/>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        {/* Avatar, with how they sign in pinned to its corner */}
                        <div style={{position:"relative",flex:"none"}}>
                          {u.avatar?<img src={u.avatar} alt="" style={{width:40,height:40,borderRadius:12,objectFit:"cover",display:"block"}}/>:
                          <div style={{width:40,height:40,borderRadius:12,background:`linear-gradient(135deg,${g},${gD})`,color:"#fff",display:"grid",placeItems:"center",fontSize:16,fontWeight:800}}>{u.name[0]?.toUpperCase()}</div>}
                          <span title={u.provider==="google"?"Signed up with Google":"Signed up with email"} style={{position:"absolute",right:-4,bottom:-4,width:18,height:18,borderRadius:"50%",background:"#fff",display:"grid",placeItems:"center",boxShadow:"0 1px 4px rgba(61,12,17,.25)"}}>
                            <ProviderIcon provider={u.provider} size={10}/>
                          </span>
                        </div>

                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:5,minWidth:0}}>
                            <span title={rm.label} style={{flex:"none",width:18,height:18,borderRadius:6,display:"grid",placeItems:"center",background:`${rm.color}16`}}>
                              <RoleIcon role={u.role} size={11}/>
                            </span>
                            <span style={{fontSize:13.5,fontWeight:800,color:t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.name}</span>
                            {!u.isVerified&&<span title="Email not verified" style={{flex:"none",width:6,height:6,borderRadius:"50%",background:"#d97706"}}/>}
                            <StatusPill status={u.status}/>
                          </div>
                          <div style={{fontSize:11,color:tM,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginTop:1}}>{u.email}</div>
                        </div>

                        {/* Their average rating across everything they rated */}
                        <div title={fb?`${fb.count} rating${fb.count>1?"s":""}${fb.templates>1?` across ${fb.templates} templates`:""}`:"No feedback yet"}
                          style={{flex:"none",textAlign:"center",padding:"4px 7px",borderRadius:10,minWidth:44,
                            background:fb?`${tone}12`:"#f6f1ea",border:`1px solid ${fb?`${tone}30`:cB}`}}>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:2,fontSize:13,fontWeight:800,color:fb?tone:"rgba(61,12,17,.28)",lineHeight:1.1}}>
                            <Star size={11} fill={fb?"#e0a526":"none"} color={fb?"#e0a526":"rgba(61,12,17,.28)"}/>{fb?fb.avg.toFixed(1):"–"}
                          </div>
                          <div style={{fontSize:8.5,fontWeight:700,color:tM,marginTop:1,whiteSpace:"nowrap"}}>{fb?`${fb.count} rated`:"no rating"}</div>
                        </div>
                      </div>

                      <div style={{display:"flex",alignItems:"center",gap:"4px 10px",flexWrap:"wrap",marginTop:8,paddingTop:7,borderTop:`1px dashed ${cB}`,fontSize:10.5,color:t2,fontWeight:600}}>
                        <span title="Joined SubhSandesh" style={{display:"inline-flex",alignItems:"center",gap:4,whiteSpace:"nowrap"}}>
                          <Clock3 size={11} color={gD}/>
                          {joined.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric",timeZone:"Asia/Kolkata"})}, {joined.toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit",timeZone:"Asia/Kolkata"})}
                          <span style={{color:tM,fontWeight:500}}>· {ago(joined)}</span>
                        </span>
                        <span style={{display:"inline-flex",alignItems:"center",gap:3,whiteSpace:"nowrap",color:gD}}><Coins size={11}/>{u.points}</span>
                        {tpl&&(
                          <span style={{display:"inline-flex",alignItems:"center",gap:3,whiteSpace:"nowrap",color:bg,fontWeight:800}}>
                            <LayoutTemplate size={11}/>{u.templatePages??0}×{u.templateLastAt?` · ${new Date(u.templateLastAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",timeZone:"Asia/Kolkata"})}`:""}
                          </span>
                        )}
                        <ChevronRight size={14} color={tM} style={{marginLeft:"auto"}}/>
                      </div>
                    </button>
                    );
                  })}
            </div>
          )}

          {/* Pagination */}
          {pg.totalPages>1&&(
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"14px 0 4px"}}>
              <button className="adk-btn" onClick={()=>fetchUsers(pg.page-1)} disabled={pg.page<=1} aria-label="Previous page" style={{width:36,padding:0}}>
                <ChevronLeft size={15}/>
              </button>
              <span style={{fontSize:12,color:tM,fontWeight:700}}>{pg.page} / {pg.totalPages}</span>
              <button className="adk-btn" onClick={()=>fetchUsers(pg.page+1)} disabled={pg.page>=pg.totalPages} aria-label="Next page" style={{width:36,padding:0}}>
                <ChevronRight size={15}/>
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Detail modal (admins; a super admin goes to the full profile) ── */}
      <AnimatePresence>
        {(sel||dLoading)&&<motion.div key="ov" className="u-ov" onClick={closeSel} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}/>}
        {(sel||dLoading)&&(
            <div key="wrap" className="u-wrap">
            <motion.div className="u-modal" role="dialog" aria-modal="true"
              initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} exit={{opacity:0,y:40}} transition={{duration:.28,ease:[0.22,1,0.36,1]}}>
              {dLoading?<Loading h={160}/>:sel?(
                <>
                  <button onClick={()=>{setSel(null);setPageConfirm(null);}} aria-label="Close" className="adk-btn" style={{position:"absolute",top:12,right:12,width:32,height:32,padding:0}}><X size={15}/></button>

                  {/* User header */}
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14,paddingRight:40}}>
                    {sel.user.avatar?<img src={sel.user.avatar} alt="" style={{width:52,height:52,borderRadius:15,objectFit:"cover",flex:"none",boxShadow:"0 8px 18px -10px rgba(61,12,17,.6)"}}/>:
                    <div style={{width:52,height:52,borderRadius:15,flex:"none",background:`linear-gradient(135deg,${g},${gD})`,display:"grid",placeItems:"center",color:"#fff",fontSize:21,fontWeight:800,boxShadow:"0 8px 18px -10px rgba(61,12,17,.6)"}}>{sel.user.name[0]?.toUpperCase()}</div>}
                    <div style={{flex:1,minWidth:0}}>
                      <h2 style={{fontSize:18,fontWeight:800,color:t1,margin:0,fontFamily:"'Playfair Display',serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sel.user.name}</h2>
                      <div style={{display:"flex",alignItems:"center",gap:4,marginTop:3,minWidth:0}}>
                        <Mail size={11} color={tM} style={{flex:"none"}}/>
                        <span style={{fontSize:11.5,color:t2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sel.user.email}</span>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginTop:6,flexWrap:"wrap"}}>
                        <Badge role={sel.user.role}/>
                        <select value={sel.user.role} onChange={e=>changeRole(sel.user._id,e.target.value)} disabled={rc===sel.user._id} aria-label="Change role"
                          style={{height:26,padding:"0 8px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",background:"#fff",color:t1,border:`1px solid ${cB}`}}>
                          <option value="normal">Normal</option><option value="member">Member</option><option value="admin">Admin</option>
                        </select>
                        {rc===sel.user._id&&<Loader2 size={13} color={g} style={{animation:"spin .8s linear infinite"}}/>}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="u-mstats">
                    {[
                      {icon:<FileText size={13}/>,label:"Pages",value:<Num value={sel.stats.totalPagesCreated}/>,color:g},
                      {icon:<Eye size={13}/>,label:"Views",value:<Num value={sel.stats.totalViews}/>,color:gD},
                      {icon:<Calendar size={13}/>,label:"Joined",value:new Date(sel.user.createdAt).toLocaleDateString(),color:"#a0522d"},
                    ].map((s,i)=>(
                      <motion.div key={s.label} className="u-mstat" {...rise(i)}>
                        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
                          <span style={{color:s.color,display:"grid"}}>{s.icon}</span>
                          <span style={{fontSize:10,color:tM,fontWeight:700,letterSpacing:"0.04em"}}>{s.label}</span>
                        </div>
                        <div style={{fontSize:s.label==="Joined"?13:19,fontWeight:800,color:t1,fontFamily:s.label==="Joined"?undefined:"'Playfair Display',serif",lineHeight:1.15,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.value}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Info grid */}
                  <div className="u-info">
                    <div style={{color:tM,minWidth:0}}>Provider: <span style={{color:t1,fontWeight:700,textTransform:"capitalize"}}>{sel.user.provider}</span></div>
                    <div style={{color:tM,minWidth:0}}>Points: <span style={{color:gD,fontWeight:800}}>{sel.user.points}</span></div>
                    <div style={{color:tM,minWidth:0,overflowWrap:"anywhere"}}>Referral: <span style={{color:t1,fontWeight:700}}>{sel.user.referralCode||"—"}</span></div>
                    <div style={{color:tM,minWidth:0}}>Verified: <span style={{color:sel.user.isVerified?"#1e7a4b":"#b3261e",fontWeight:700}}>{sel.user.isVerified?"Yes":"No"}</span></div>
                  </div>

                  {/* Pages */}
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                    <FileText size={13} color={g}/>
                    <h3 style={{fontSize:13.5,fontWeight:800,color:t1,margin:0}}>Pages</h3>
                    <Tag>{sel.pages.length}</Tag>
                  </div>
                  {!sel.pages.length?<p style={{fontSize:12,color:tM,textAlign:"center",padding:16,margin:0,borderRadius:12,border:"1px dashed rgba(61,12,17,.14)"}}>No pages created</p>:(
                    <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:260,overflowY:"auto"}}>
                      {sel.pages.map((p,i)=>(
                        <motion.div key={p._id} {...rise(i)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:11,flexWrap:"wrap",background:"#fff",border:`1px solid ${cB}`,minWidth:0}}>
                          <Tag style={{maxWidth:"55%",overflow:"hidden",textOverflow:"ellipsis"}}>{p.templateLabel}</Tag>
                          <span style={{fontSize:10.5,color:p.isPublished?"#1e7a4b":tM,fontWeight:700}}>{p.isPublished?"Published":"Draft"}</span>
                          {p.shareId&&<a href={`/${p.shareId}`} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} aria-label="Open shared page" style={{color:gD,display:"grid"}}><ExternalLink size={12}/></a>}
                          <span style={{marginLeft:"auto",fontSize:10,color:tM,fontWeight:600}}>{p.viewCount??0} views</span>
                          <span style={{fontSize:10,color:tM}}>{new Date(p.createdAt).toLocaleDateString()}</span>
                          {pageConfirm===p._id?(
                            <div style={{display:"flex",alignItems:"center",gap:6,width:"100%",marginTop:6,paddingTop:6,borderTop:`1px dashed ${cB}`,flexWrap:"wrap"}}>
                              <span style={{flex:"1 1 180px",fontSize:10.5,color:"#b3261e",fontWeight:600,lineHeight:1.4}}>Delete permanently? The shared link stops working for everyone and can&apos;t be recovered.</span>
                              <button className="adk-btn" onClick={()=>setPageConfirm(null)} disabled={pageDeleting===p._id} style={{height:28,padding:"0 10px",fontSize:11}}>Cancel</button>
                              <button className="adk-btn" onClick={()=>deletePage(p._id,p.templateType)} disabled={pageDeleting===p._id}
                                style={{height:28,padding:"0 10px",fontSize:11,background:"#b3261e",color:"#fff",border:"none"}}>
                                {pageDeleting===p._id?<Loader2 size={11} style={{animation:"spin .8s linear infinite"}}/>:<Trash2 size={11}/>}
                                {pageDeleting===p._id?"Deleting…":"Delete"}
                              </button>
                            </div>
                          ):(
                            <button onClick={()=>setPageConfirm(p._id)} title="Delete this page" aria-label="Delete this page" className="adk-btn" data-v="danger" style={{width:26,height:26,padding:0,borderRadius:8}}>
                              <Trash2 size={12}/>
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              ):null}
            </motion.div>
            </div>
        )}
      </AnimatePresence>
    </AdminPage>
  );
}
