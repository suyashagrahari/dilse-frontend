"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Users, Eye, FileText, TrendingUp, BarChart3, MessageSquare, Star,
  Smartphone, Activity, Crown, UserCheck, UserX,
} from "lucide-react";

interface OverviewData {
  users: { total: number; today: number; thisWeek: number; thisMonth: number };
  pageViews: { total: number; today: number; thisWeek: number; thisMonth: number };
  pages: { totalCreated: number; totalPublished: number; totalDrafts?: number };
  templateStats: { type: string; label: string; slug?: string; live?: boolean; total: number; published: number }[];
  roleDistribution: { role: string; count: number }[];
  deviceBreakdown: { device: string; count: number }[];
}

const cB = "rgba(61,12,17,0.08)";
const t1 = "#2a0a0e";
const t2 = "#7f5f5f";
const tM = "#9a7070";
const g = "#c9a84c";
const gD = "#8b5a2b";
const bg = "#3d0c11";
const CC = ["#c9a84c","#8b5a2b","#a0522d","#7c3a2e","#5a2d1a","#b8860b","#d4a056","#6d4c2e","#9e7b4f","#4a2c17","#c5813a"];
const DC: Record<string,string> = { mobile: "#c9a84c", desktop: "#8b5a2b", tablet: "#a0522d", unknown: "#9a7070" };
const RC: Record<string,string> = { admin: "#c9a84c", member: "#8b5a2b", normal: "#9a7070" };
const TP_MAX = 12;
function fmt(n: number) { return n >= 1e6 ? (n/1e6).toFixed(1)+"M" : n >= 1e3 ? (n/1e3).toFixed(1)+"K" : String(n); }
const tt: React.CSSProperties = { background:"#fff", border:`1px solid ${cB}`, borderRadius:10, color:t1, fontSize:11, boxShadow:"0 4px 16px rgba(0,0,0,0.06)" };

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { accessToken, user } = useAppSelector((s) => s.auth);
  const [ov, setOv] = useState<OverviewData|null>(null);
  const [ug, setUg] = useState<{date:string;count:number}[]>([]);
  const [vc, setVc] = useState<{date:string;count:number}[]>([]);
  const [tp, setTp] = useState<{templateType:string;label:string;views:number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const h = useCallback(()=>({Authorization:`Bearer ${accessToken}`,"Content-Type":"application/json"}),[accessToken]);

  useEffect(()=>{
    if(!accessToken)return;
    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/admin/analytics/overview`,{headers:h()}).then(r=>r.json()),
      fetch(`${API_URL}/admin/analytics/user-growth?days=${days}`,{headers:h()}).then(r=>r.json()),
      fetch(`${API_URL}/admin/analytics/views?days=${days}`,{headers:h()}).then(r=>r.json()),
      fetch(`${API_URL}/admin/analytics/template-popularity`,{headers:h()}).then(r=>r.json()),
    ]).then(([o,u,v,t])=>{
      if(o.success)setOv(o.data); if(u.success)setUg(u.data); if(v.success)setVc(v.data); if(t.success)setTp(t.data);
    }).finally(()=>setLoading(false));
  },[accessToken,days,h]);

  if(loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"#f5ede6"}}>
      <div className="text-center">
        <div style={{width:36,height:36,border:"3px solid rgba(61,12,17,0.1)",borderTopColor:g,borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto 10px"}}/>
        <p style={{color:tM,fontSize:12}}>Loading analytics...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen md:pt-[88px]" style={{background:"linear-gradient(180deg,#faf3ee 0%,#f5ede6 50%,#efe3d3 100%)"}}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .aw{max-width:1320px;margin:0 auto;display:flex;flex-direction:column;height:calc(100vh - 0px)}
        @media(min-width:768px){.aw{height:calc(100vh - 88px)}}
        .a-sticky{flex-shrink:0;padding:16px 14px 0;position:sticky;top:0;z-index:10;background:linear-gradient(180deg,#faf3ee 0%,#f5ede6 100%)}
        @media(min-width:768px){.a-sticky{padding:24px 24px 0}}
        @media(min-width:1024px){.a-sticky{padding:24px 40px 0}}
        .a-scroll{flex:1;overflow-y:auto;padding:14px 14px 110px;-webkit-overflow-scrolling:touch}
        @media(min-width:768px){.a-scroll{padding:16px 24px 60px}}
        @media(min-width:1024px){.a-scroll{padding:16px 40px 60px}}
        .ac{background:rgba(255,255,255,0.65);border:1px solid ${cB};border-radius:14px;padding:14px;backdrop-filter:blur(8px)}
        @media(min-width:768px){.ac{padding:20px;border-radius:16px}}
        .asg{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
        @media(min-width:640px){.asg{grid-template-columns:repeat(4,1fr);gap:12px}}
        .ag2{display:grid;grid-template-columns:1fr;gap:12px}
        @media(min-width:768px){.ag2{grid-template-columns:1fr 1fr;gap:16px}}
      `}</style>

      <div className="aw">
        {/* ── Sticky header ── */}
        <div className="a-sticky">
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",background:"rgba(255,255,255,0.6)",border:`1px solid ${cB}`,borderRadius:12,padding:3,gap:2}}>
              <button style={{padding:"7px 16px",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",border:"none",background:bg,color:"#f5ede6",letterSpacing:"0.02em"}}>
                <BarChart3 size={13} style={{verticalAlign:"middle",marginRight:5}}/>Analytics
              </button>
              <button onClick={()=>router.push("/admin/users")} style={{padding:"7px 16px",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",border:"none",background:"transparent",color:t2,letterSpacing:"0.02em"}}>
                <Users size={13} style={{verticalAlign:"middle",marginRight:5}}/>Users
              </button>
              <button onClick={()=>router.push("/admin/contacts")} style={{padding:"7px 16px",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",border:"none",background:"transparent",color:t2,letterSpacing:"0.02em"}}>
                <MessageSquare size={13} style={{verticalAlign:"middle",marginRight:5}}/>Contacts
              </button>
              {/* Super admin only — /admin/feedback bounces anybody else, so
                  showing the tab to an admin would be a dead end. */}
              {isSuperAdmin(user?.role) && (
                <button onClick={()=>router.push("/admin/feedback")} style={{padding:"7px 16px",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",border:"none",background:"transparent",color:t2,letterSpacing:"0.02em"}}>
                  <Star size={13} style={{verticalAlign:"middle",marginRight:5}}/>Feedback
                </button>
              )}
            </div>
            <div style={{marginLeft:"auto",display:"flex",gap:4}}>
              {[7,30,90].map(d=>(
                <button key={d} onClick={()=>setDays(d)} style={{
                  padding:"6px 14px",borderRadius:9,fontSize:11,fontWeight:700,cursor:"pointer",letterSpacing:"0.03em",
                  border:days===d?`1.5px solid ${g}`:`1px solid ${cB}`,
                  background:days===d?`${g}15`:"rgba(255,255,255,0.55)",
                  color:days===d?gD:tM,
                }}>{d}D</button>
              ))}
            </div>
          </div>
          {/* Stat cards in sticky */}
          <div className="asg" style={{marginBottom:14}}>
            <SC icon={<Users size={17}/>} label="Total Users" value={ov?.users.total??0} sub={`+${ov?.users.today??0} today`} accent={g}/>
            <SC icon={<Eye size={17}/>} label="Page Views" value={ov?.pageViews.total??0} sub={`+${ov?.pageViews.today??0} today`} accent={gD}/>
            {/* Drafts are the drop-off number: a page somebody built and did not
                publish — because they abandoned the login, closed the paywall, or
                simply have not come back. `?? subtraction` so this still reads
                correctly against a server that predates `totalDrafts`. */}
            <SC icon={<FileText size={17}/>} label="Pages Created" value={ov?.pages.totalCreated??0} sub={`${ov?.pages.totalPublished??0} published · ${ov?.pages.totalDrafts ?? Math.max(0,(ov?.pages.totalCreated??0)-(ov?.pages.totalPublished??0))} draft`} accent="#a0522d"/>
            <SC icon={<TrendingUp size={17}/>} label="This Week" value={ov?.users.thisWeek??0} sub={`${ov?.pageViews.thisWeek??0} views`} accent={bg}/>
          </div>
          <div style={{height:1,background:cB}}/>
        </div>

        {/* ── Scrollable charts ── */}
        <div className="a-scroll">
          <div className="ac" style={{marginBottom:14}}>
            <CH icon={<Activity size={15} color={g}/>} title="User Growth"/>
            <div style={{width:"100%",height:"clamp(180px,28vw,260px)"}}>
              <ResponsiveContainer>
                <AreaChart data={ug}>
                  <defs><linearGradient id="gG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={g} stopOpacity={0.3}/><stop offset="100%" stopColor={g} stopOpacity={0.02}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,12,17,0.06)"/>
                  <XAxis dataKey="date" tick={{fill:tM,fontSize:9}} tickFormatter={v=>v.slice(5)}/>
                  <YAxis tick={{fill:tM,fontSize:9}} width={28}/>
                  <Tooltip contentStyle={tt} labelFormatter={l=>`Date: ${l}`}/>
                  <Area type="monotone" dataKey="count" stroke={g} fill="url(#gG)" strokeWidth={2} name="New Users"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="ac" style={{marginBottom:14}}>
            <CH icon={<Eye size={15} color={gD}/>} title="Page Views"/>
            <div style={{width:"100%",height:"clamp(180px,28vw,260px)"}}>
              <ResponsiveContainer>
                <AreaChart data={vc}>
                  <defs><linearGradient id="vG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={gD} stopOpacity={0.3}/><stop offset="100%" stopColor={gD} stopOpacity={0.02}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,12,17,0.06)"/>
                  <XAxis dataKey="date" tick={{fill:tM,fontSize:9}} tickFormatter={v=>v.slice(5)}/>
                  <YAxis tick={{fill:tM,fontSize:9}} width={28}/>
                  <Tooltip contentStyle={tt} labelFormatter={l=>`Date: ${l}`}/>
                  <Area type="monotone" dataKey="count" stroke={gD} fill="url(#vG)" strokeWidth={2} name="Views"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="ag2" style={{marginBottom:14}}>
            <div className="ac">
              <CH icon={<BarChart3 size={15} color="#a0522d"/>} title={tp.length>TP_MAX?`Template Popularity · top ${TP_MAX} of ${tp.length}`:"Template Popularity"}/>
              {/* Every template that has ever been viewed now reaches this
                  endpoint, not the fourteen the label map used to cover. Forty
                  bars in a 260px box is an unreadable smear, so the chart takes
                  the busiest few and the full picture lives in the table below
                  — truncation stated in the heading rather than implied. */}
              <div style={{width:"100%",height:Math.max(200,Math.min(tp.length,TP_MAX)*24)}}>
                <ResponsiveContainer>
                  <BarChart data={tp.slice(0,TP_MAX)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,12,17,0.06)"/>
                    <XAxis type="number" tick={{fill:tM,fontSize:9}}/>
                    <YAxis type="category" dataKey="label" tick={{fill:t2,fontSize:9}} width={92}/>
                    <Tooltip contentStyle={tt}/>
                    <Bar dataKey="views" name="Views" radius={[0,6,6,0]}>{tp.slice(0,TP_MAX).map((_,i)=><Cell key={i} fill={CC[i%CC.length]}/>)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="ac">
              <CH icon={<Smartphone size={15} color={g}/>} title="Devices"/>
              <div style={{width:"100%",height:"clamp(200px,28vw,260px)"}}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={ov?.deviceBreakdown??[]} cx="50%" cy="50%" innerRadius="38%" outerRadius="62%" paddingAngle={4} dataKey="count" nameKey="device"
                      label={({name,percent}:{name?:string;percent?:number})=>`${name||""} ${((percent||0)*100).toFixed(0)}%`}
                      labelLine={{stroke:tM,strokeWidth:0.5}}>
                      {(ov?.deviceBreakdown??[]).map((d,i)=><Cell key={i} fill={DC[d.device]||CC[i]}/>)}
                    </Pie>
                    <Tooltip contentStyle={tt}/>
                    <Legend wrapperStyle={{fontSize:10}} formatter={v=><span style={{color:t2}}>{v}</span>}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="ag2">
            <div className="ac">
              <CH icon={<Crown size={15} color={g}/>} title="User Roles"/>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {(ov?.roleDistribution??[]).map(r=>{
                  const total=ov?.users.total||1; const pct=((r.count/total)*100).toFixed(1);
                  const Icon=r.role==="admin"||r.role==="superadmin"?Crown:r.role==="member"?UserCheck:UserX;
                  return(
                    <div key={r.role} style={{display:"flex",alignItems:"center",gap:8}}>
                      <Icon size={13} color={RC[r.role]}/>
                      <span style={{fontSize:11,color:t1,fontWeight:600,textTransform:"capitalize",minWidth:48}}>{r.role}</span>
                      <div style={{flex:1,height:6,borderRadius:3,background:"rgba(61,12,17,0.04)",overflow:"hidden"}}>
                        <div style={{width:`${pct}%`,height:"100%",borderRadius:3,background:RC[r.role],transition:"width 0.6s"}}/>
                      </div>
                      <span style={{fontSize:10,color:tM,minWidth:55,textAlign:"right"}}>{r.count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="ac">
              <CH icon={<FileText size={15} color={gD}/>} title={`Template Stats · ${(ov?.templateStats??[]).length} templates · ${(ov?.templateStats??[]).filter(t=>t.live!==false).length} live`}/>
              {/* Busiest first, from the server. Templates nobody has used yet
                  stay in the list at zero — an admin deciding what to promote
                  needs to see the ones going nowhere.

                  A hidden template also sits at zero, and the two mean opposite
                  things: one nobody wanted, the other nobody could reach. Most
                  of this table is currently switched off, so the row says which
                  it is instead of leaving a zero to be misread. */}
              <div style={{overflowX:"auto",maxHeight:320,overflowY:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>
                    {["Template","Created","Published"].map(h=>(
                      <th key={h} style={{padding:"6px 8px",fontSize:9,fontWeight:700,color:tM,textAlign:"left",borderBottom:`1px solid ${cB}`,letterSpacing:"0.06em",textTransform:"uppercase"}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {(ov?.templateStats??[]).map((t,i)=>(
                      <tr key={t.type} style={{background:i%2===0?"transparent":"rgba(61,12,17,0.015)",opacity:t.total===0&&t.live!==false?0.5:1}}>
                        <td style={{padding:"6px 8px",fontSize:11,color:t1,fontWeight:600}}>
                          {t.label}
                          {t.live===false&&(
                            <span title="Switched off in Admin → Templates, so nobody can reach it" style={{marginLeft:6,padding:"1px 5px",borderRadius:4,fontSize:8,fontWeight:700,letterSpacing:"0.04em",textTransform:"uppercase",background:"rgba(61,12,17,0.07)",color:tM,border:`1px solid ${cB}`,verticalAlign:"middle"}}>hidden</span>
                          )}
                        </td>
                        <td style={{padding:"6px 8px",fontSize:11,color:t2}}>{t.total}</td>
                        <td style={{padding:"6px 8px",fontSize:11,color:t2}}>{t.published}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CH({icon,title}:{icon:React.ReactNode;title:string}){
  return <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:12}}>{icon}<h2 style={{fontSize:"clamp(12px,2.8vw,14px)",fontWeight:700,color:t1,margin:0}}>{title}</h2></div>;
}
function SC({icon,label,value,sub,accent}:{icon:React.ReactNode;label:string;value:number;sub:string;accent:string}){
  return(
    <div className="ac" style={{display:"flex",flexDirection:"column",gap:5}}>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <div style={{width:"clamp(28px,6vw,34px)",height:"clamp(28px,6vw,34px)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",background:`${accent}12`,border:`1px solid ${accent}22`,color:accent}}>{icon}</div>
        <span style={{fontSize:"clamp(9px,2vw,10px)",color:tM,fontWeight:600,letterSpacing:"0.04em"}}>{label}</span>
      </div>
      <div style={{fontSize:"clamp(20px,5vw,28px)",fontWeight:800,color:t1,fontFamily:"'Playfair Display',serif",lineHeight:1}}>{fmt(value)}</div>
      <span style={{fontSize:"clamp(9px,2vw,10px)",color:accent,fontWeight:600}}>{sub}</span>
    </div>
  );
}
