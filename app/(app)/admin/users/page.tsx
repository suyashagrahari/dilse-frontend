"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import {
  Search, Users, Crown, UserCheck, User as UserIcon, MessageSquare,
  ChevronLeft, ChevronRight, Eye, FileText, Calendar, Mail,
  X, ExternalLink, BarChart3, Trash2, Loader2,
} from "lucide-react";

interface UserItem {
  _id:string; name:string; email:string; avatar?:string; provider:string;
  role:string; status?:string; statusReason?:string; points:number; isVerified:boolean; createdAt:string;
}
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
const SC:Record<string,string>={active:"#1e7a4b",suspended:gD,banned:"#b3261e"};

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

  const hdr=useCallback(()=>({Authorization:`Bearer ${accessToken}`,"Content-Type":"application/json"}),[accessToken]);

  const fetchUsers=useCallback(async(page=1)=>{
    if(!accessToken)return;
    setLoading(true);
    try{
      const p=new URLSearchParams({page:String(page),limit:"20"});
      if(search)p.set("search",search); if(rf)p.set("role",rf); if(sf)p.set("status",sf);
      const res=await fetch(`${API_URL}/admin/users?${p}`,{headers:hdr()});
      const data=await res.json();
      if(data.success){setUsers(data.data.users);setPg(data.data.pagination);}
    }finally{setLoading(false);}
  },[accessToken,search,rf,sf,hdr]);

  useEffect(()=>{fetchUsers(1);},[fetchUsers]);

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
  // noise, and the whole point is that a suspended or banned account stands out.
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

  return(
    <div className="min-h-screen md:pt-[88px]" style={{background:"linear-gradient(180deg,#faf3ee 0%,#f5ede6 50%,#efe3d3 100%)"}}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .uw{max-width:1320px;margin:0 auto;display:flex;flex-direction:column;height:calc(100vh - 0px)}
        @media(min-width:768px){.uw{height:calc(100vh - 88px)}}
        .u-sticky{flex-shrink:0;padding:16px 14px 0;position:sticky;top:0;z-index:10;background:linear-gradient(180deg,#faf3ee 0%,#f5ede6 100%)}
        @media(min-width:768px){.u-sticky{padding:24px 24px 0}}
        @media(min-width:1024px){.u-sticky{padding:24px 40px 0}}
        .u-body{flex:1;overflow-y:auto;padding:0 14px 110px;-webkit-overflow-scrolling:touch}
        @media(min-width:768px){.u-body{padding:0 24px 60px}}
        @media(min-width:1024px){.u-body{padding:0 40px 60px}}
        .uc{background:rgba(255,255,255,0.65);border:1px solid ${cB};border-radius:14px;backdrop-filter:blur(8px)}
        @media(min-width:768px){.uc{border-radius:16px}}
        .uCard:hover{box-shadow:0 10px 26px -14px rgba(61,12,17,.35);transform:translateY(-1px)}
      `}</style>

      <div className="uw">
        {/* ── Sticky: tabs + search + filters ── */}
        <div className="u-sticky">
          {/* Tab switcher */}
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",background:"rgba(255,255,255,0.6)",border:`1px solid ${cB}`,borderRadius:12,padding:3,gap:2}}>
              <button onClick={()=>router.push("/admin/analytics")} style={{padding:"7px 16px",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",border:"none",background:"transparent",color:t2,letterSpacing:"0.02em"}}>
                <BarChart3 size={13} style={{verticalAlign:"middle",marginRight:5}}/>Analytics
              </button>
              <button style={{padding:"7px 16px",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",border:"none",background:bg,color:"#f5ede6",letterSpacing:"0.02em"}}>
                <Users size={13} style={{verticalAlign:"middle",marginRight:5}}/>Users
              </button>
              <button onClick={()=>router.push("/admin/contacts")} style={{padding:"7px 16px",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",border:"none",background:"transparent",color:t2,letterSpacing:"0.02em"}}>
                <MessageSquare size={13} style={{verticalAlign:"middle",marginRight:5}}/>Contacts
              </button>
            </div>
          </div>
          {/* Search */}
          <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:180,display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.6)",border:`1px solid ${cB}`,borderRadius:11,padding:"0 12px"}}>
              <Search size={14} color={tM}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&fetchUsers(1)}
                placeholder="Search by name or email..."
                style={{flex:1,background:"transparent",border:"none",outline:"none",color:t1,fontSize:12,padding:"10px 0"}}/>
              {search&&<button onClick={()=>setSearch("")} style={{background:"none",border:"none",cursor:"pointer",color:tM,padding:2}}><X size={13}/></button>}
            </div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {["","normal","member","admin","superadmin"].map(r=>(
                <button key={r} onClick={()=>setRf(r)} style={{
                  padding:"6px 12px",borderRadius:8,fontSize:10,fontWeight:700,cursor:"pointer",textTransform:"capitalize",
                  border:rf===r?`1.5px solid ${g}`:`1px solid ${cB}`,
                  background:rf===r?`${g}15`:"rgba(255,255,255,0.5)",
                  color:rf===r?gD:tM,
                }}>{r||"All"}</button>
              ))}
            </div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {["","active","suspended","banned"].map(st=>(
                <button key={st} onClick={()=>setSf(st)} style={{
                  padding:"6px 12px",borderRadius:8,fontSize:10,fontWeight:700,cursor:"pointer",textTransform:"capitalize",
                  border:sf===st?`1.5px solid ${SC[st]||g}`:`1px solid ${cB}`,
                  background:sf===st?`${SC[st]||g}15`:"rgba(255,255,255,0.5)",
                  color:sf===st?(SC[st]||gD):tM,
                }}>{st||"Any status"}</button>
              ))}
            </div>
          </div>
          {/* Count + divider */}
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:8,background:"rgba(255,255,255,0.55)",border:`1px solid ${cB}`,fontSize:11,fontWeight:700,color:t2}}>
              <Users size={12} color={g}/> {pg.total} users
            </span>
          </div>
          <div style={{height:1,background:cB}}/>
        </div>

        {/* ── Scrollable user list ── */}
        <div className="u-body">
          <div className="uc" style={{padding:0,overflow:"hidden",marginTop:14}}>
            {loading?(
              <div style={{padding:40,textAlign:"center"}}>
                <div style={{width:28,height:28,border:`2px solid rgba(61,12,17,0.08)`,borderTopColor:g,borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto"}}/>
              </div>
            ):(
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
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,290px),1fr))",
                  gap: 10, padding: 12,
                }}>
                  {users.map(u=>(
                    <div key={u._id} onClick={()=>openUser(u._id)} className="uCard" style={{
                      border:`1px solid ${cB}`, borderRadius:14, background:"#fffdfb",
                      padding:13, cursor:"pointer", transition:"box-shadow .15s, transform .15s",
                    }}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        {u.avatar?<img src={u.avatar} alt="" style={{width:38,height:38,borderRadius:11,objectFit:"cover",flexShrink:0}}/>:
                        <div style={{width:38,height:38,borderRadius:11,flexShrink:0,background:`${g}1f`,color:gD,display:"grid",placeItems:"center",fontSize:15,fontWeight:800}}>{u.name[0]?.toUpperCase()}</div>}
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13.5,fontWeight:800,color:t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.name}</div>
                          <div style={{fontSize:11,color:tM,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.email}</div>
                        </div>
                      </div>

                      <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:9}}>
                        <Badge role={u.role}/><StatusPill status={u.status}/>
                        <span style={{fontSize:10,fontWeight:600,padding:"3px 7px",borderRadius:7,background:"#f6f1ea",color:t2,textTransform:"capitalize"}}>{u.provider}</span>
                        {!u.isVerified&&<span style={{fontSize:10,fontWeight:700,padding:"3px 7px",borderRadius:7,background:"#fff4f4",color:"#b3261e"}}>unverified</span>}
                      </div>

                      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6,marginTop:11,paddingTop:10,borderTop:`1px solid ${cB}`}}>
                        <div>
                          <div style={{fontSize:9,color:tM,fontWeight:700,letterSpacing:".05em",textTransform:"uppercase"}}>Points</div>
                          <div style={{fontSize:12.5,fontWeight:800,color:gD,marginTop:1}}>{u.points}</div>
                        </div>
                        <div>
                          <div style={{fontSize:9,color:tM,fontWeight:700,letterSpacing:".05em",textTransform:"uppercase"}}>Joined</div>
                          <div style={{fontSize:12.5,fontWeight:700,color:t1,marginTop:1}}>{new Date(u.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div>
                        </div>
                      </div>

                      <div style={{marginTop:10,paddingTop:9,borderTop:`1px solid ${cB}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                        <select value={u.role} onClick={e=>e.stopPropagation()} onChange={e=>changeRole(u._id,e.target.value)} disabled={rc===u._id}
                          style={{padding:"5px 7px",borderRadius:8,fontSize:10.5,fontWeight:700,cursor:"pointer",background:"#fff",color:t1,border:`1px solid ${cB}`}}>
                          <option value="normal">Normal</option><option value="member">Member</option><option value="admin">Admin</option>
                        </select>
                        <span style={{display:"inline-flex",alignItems:"center",gap:3,color:bg,fontWeight:700,fontSize:11.5}}>
                          Open <Eye size={13}/>
                        </span>
                      </div>
                    </div>
                  ))}
                  {!users.length&&<p style={{gridColumn:"1/-1",textAlign:"center",color:tM,fontSize:12,padding:30}}>No users found</p>}
                </div>

                {/* Pagination */}
                {pg.totalPages>1&&(
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:12,borderTop:`1px solid ${cB}`}}>
                    <button onClick={()=>fetchUsers(pg.page-1)} disabled={pg.page<=1}
                      style={{width:30,height:30,borderRadius:8,border:`1px solid ${cB}`,background:"transparent",color:pg.page<=1?"rgba(61,12,17,0.15)":t1,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <ChevronLeft size={15}/>
                    </button>
                    <span style={{fontSize:11,color:tM,fontWeight:600}}>{pg.page} / {pg.totalPages}</span>
                    <button onClick={()=>fetchUsers(pg.page+1)} disabled={pg.page>=pg.totalPages}
                      style={{width:30,height:30,borderRadius:8,border:`1px solid ${cB}`,background:"transparent",color:pg.page>=pg.totalPages?"rgba(61,12,17,0.15)":t1,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <ChevronRight size={15}/>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Centered Detail Modal ── */}
      {(sel||dLoading)&&(
        <>
          <div onClick={()=>{if(!dLoading){setSel(null);setPageConfirm(null);}}} style={{position:"fixed",inset:0,background:"rgba(42,10,14,0.22)",zIndex:100,backdropFilter:"blur(4px)"}}/>
          <div style={{
            position:"fixed",zIndex:101,
            top:"50%",left:"50%",transform:"translate(-50%,-50%)",
            width:"min(92vw, 520px)",maxHeight:"85vh",overflowY:"auto",
            background:"linear-gradient(180deg,#faf3ee 0%,#f5ede6 100%)",
            border:`1px solid ${cB}`,borderRadius:20,padding:"22px 18px 28px",
            boxShadow:"0 20px 60px rgba(0,0,0,0.12)",
          }}>
            {dLoading?(
              <div style={{padding:40,textAlign:"center"}}>
                <div style={{width:28,height:28,border:`2px solid rgba(61,12,17,0.08)`,borderTopColor:g,borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto"}}/>
              </div>
            ):sel?(
              <>
                <button onClick={()=>{setSel(null);setPageConfirm(null);}} style={{position:"absolute",top:14,right:14,width:30,height:30,borderRadius:8,border:`1px solid ${cB}`,background:"rgba(255,255,255,0.6)",color:t1,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={15}/></button>

                {/* User header */}
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
                  {sel.user.avatar?<img src={sel.user.avatar} alt="" style={{width:48,height:48,borderRadius:12,objectFit:"cover",border:`2px solid ${cB}`}}/>:
                  <div style={{width:48,height:48,borderRadius:12,background:`${g}15`,display:"flex",alignItems:"center",justifyContent:"center",color:gD,fontSize:20,fontWeight:700,border:`2px solid ${cB}`}}>{sel.user.name[0]?.toUpperCase()}</div>}
                  <div style={{flex:1,minWidth:0}}>
                    <h2 style={{fontSize:17,fontWeight:800,color:t1,margin:0,fontFamily:"'Playfair Display',serif"}}>{sel.user.name}</h2>
                    <div style={{display:"flex",alignItems:"center",gap:4,marginTop:3}}>
                      <Mail size={10} color={tM}/>
                      <span style={{fontSize:11,color:t2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sel.user.email}</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginTop:5,flexWrap:"wrap"}}>
                      <Badge role={sel.user.role}/>
                      <select value={sel.user.role} onChange={e=>changeRole(sel.user._id,e.target.value)} disabled={rc===sel.user._id}
                        style={{padding:"3px 6px",borderRadius:6,fontSize:10,fontWeight:600,cursor:"pointer",background:"rgba(255,255,255,0.8)",color:t1,border:`1px solid ${cB}`}}>
                        <option value="normal">Normal</option><option value="member">Member</option><option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
                  {[
                    {icon:<FileText size={14}/>,label:"Pages",value:String(sel.stats.totalPagesCreated),color:g},
                    {icon:<Eye size={14}/>,label:"Views",value:String(sel.stats.totalViews),color:gD},
                    {icon:<Calendar size={14}/>,label:"Joined",value:new Date(sel.user.createdAt).toLocaleDateString(),color:"#a0522d"},
                  ].map(s=>(
                    <div key={s.label} style={{padding:10,borderRadius:11,background:"rgba(255,255,255,0.55)",border:`1px solid ${cB}`}}>
                      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
                        <span style={{color:s.color}}>{s.icon}</span>
                        <span style={{fontSize:9,color:tM,fontWeight:600,letterSpacing:"0.04em"}}>{s.label}</span>
                      </div>
                      <div style={{fontSize:17,fontWeight:800,color:t1}}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Info grid */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:16,fontSize:11}}>
                  <div style={{color:tM}}>Provider: <span style={{color:t1,fontWeight:600,textTransform:"capitalize"}}>{sel.user.provider}</span></div>
                  <div style={{color:tM}}>Points: <span style={{color:gD,fontWeight:700}}>{sel.user.points}</span></div>
                  <div style={{color:tM}}>Referral: <span style={{color:t1,fontWeight:600}}>{sel.user.referralCode||"—"}</span></div>
                  <div style={{color:tM}}>Verified: <span style={{color:sel.user.isVerified?"#16a34a":"#dc2626",fontWeight:600}}>{sel.user.isVerified?"Yes":"No"}</span></div>
                </div>

                {/* Pages */}
                <h3 style={{fontSize:13,fontWeight:700,color:t1,marginBottom:8}}>Pages ({sel.pages.length})</h3>
                {!sel.pages.length?<p style={{fontSize:11,color:tM,textAlign:"center",padding:16}}>No pages created</p>:(
                  <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:200,overflowY:"auto"}}>
                    {sel.pages.map(p=>(
                      <div key={p._id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:10,flexWrap:"wrap",background:"rgba(255,255,255,0.45)",border:`1px solid ${cB}`}}>
                        <span style={{padding:"2px 7px",borderRadius:5,fontSize:8,fontWeight:700,background:`${g}12`,color:gD,border:`1px solid ${g}25`,textTransform:"uppercase",letterSpacing:"0.04em"}}>{p.templateLabel}</span>
                        <span style={{fontSize:10,color:p.isPublished?"#16a34a":tM,fontWeight:600}}>{p.isPublished?"Published":"Draft"}</span>
                        {p.shareId&&<a href={`/${p.shareId}`} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{color:tM}}><ExternalLink size={11}/></a>}
                        <span style={{marginLeft:"auto",fontSize:9,color:tM}}>{p.viewCount??0} views</span>
                        <span style={{fontSize:9,color:tM}}>{new Date(p.createdAt).toLocaleDateString()}</span>
                        {pageConfirm===p._id?(
                          <div style={{display:"flex",alignItems:"center",gap:6,width:"100%",marginTop:6,paddingTop:6,borderTop:`1px solid ${cB}`}}>
                            <span style={{flex:1,fontSize:9.5,color:"#b91c1c",fontWeight:600}}>Delete permanently? The shared link stops working for everyone and can&apos;t be recovered.</span>
                            <button onClick={()=>setPageConfirm(null)} disabled={pageDeleting===p._id}
                              style={{padding:"4px 10px",borderRadius:6,fontSize:10,fontWeight:700,cursor:"pointer",background:"rgba(255,255,255,0.8)",color:t2,border:`1px solid ${cB}`}}>Cancel</button>
                            <button onClick={()=>deletePage(p._id,p.templateType)} disabled={pageDeleting===p._id}
                              style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:6,fontSize:10,fontWeight:700,cursor:"pointer",background:"#dc2626",color:"#fff",border:"none",opacity:pageDeleting===p._id?0.6:1}}>
                              {pageDeleting===p._id?<Loader2 size={11} style={{animation:"spin .8s linear infinite"}}/>:<Trash2 size={11}/>}
                              {pageDeleting===p._id?"Deleting…":"Delete"}
                            </button>
                          </div>
                        ):(
                          <button onClick={()=>setPageConfirm(p._id)} title="Delete this page"
                            style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:24,height:24,borderRadius:6,cursor:"pointer",background:"rgba(220,38,38,0.08)",color:"#dc2626",border:"1px solid rgba(220,38,38,0.2)"}}>
                            <Trash2 size={12}/>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ):null}
          </div>
        </>
      )}
    </div>
  );
}
