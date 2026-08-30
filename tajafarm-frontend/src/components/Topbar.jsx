import {useEffect,useState} from "react";
import {SearchIcon,CartIcon,BellIcon,ChevronDownIcon} from "./Icons.jsx";
import {t} from "../i18n.js";
import {api} from "../api.js";
import LanguageToggle from "./LanguageToggle.jsx";

export default function Topbar({cartCount,onNavigate,user,searchValue,onSearchChange,onSearchSubmit}){
  const[notes,setNotes]=useState([]);
  const[open,setOpen]=useState(false);
  const searchable=typeof onSearchSubmit==="function";

  useEffect(()=>{
    if(!user){setNotes([]);return;}
    const load=()=>api.getNotifications().then(setNotes).catch(()=>{});
    load();
    const i=setInterval(load,5000);
    return()=>clearInterval(i);
  },[user]);

  function submit(e){e.preventDefault();if(searchable)onSearchSubmit();}
  function handleAuth(){onNavigate(user?"logout":"login");}

  return <header className="topbar">
    <div className="brand" onClick={()=>onNavigate("dashboard")}>
      <div className="mark"><img src="/logo.png" alt="Taja Farm"/></div>
      <div><h1>{t.brandName}</h1><small>{t.brandTagline}</small></div>
    </div>

    <LanguageToggle compact />
    <form className="search" onSubmit={submit}>
      <SearchIcon/>
      <input placeholder={t.searchPlaceholder} value={searchable?searchValue:""} onChange={searchable?e=>onSearchChange(e.target.value):undefined} readOnly={!searchable}/>
      <button type="submit"><SearchIcon size={14} color="#fff"/></button>
    </form>

    <div className="icons">
      <a className="icon-btn" href="#" onClick={e=>{e.preventDefault();onNavigate("cart")}}><CartIcon size={20}/><span className="badge">{cartCount}</span></a>

      {user&&<div className="notification-wrap">
        <button className="icon-btn" onClick={()=>setOpen(!open)}><BellIcon/><span className="badge">{notes.filter(n=>!n.isRead).length}</span></button>
        {open&&<div className="notification-panel"><div className="np-head"><b>{t.notifications}</b><button onClick={()=>api.markAllNotificationsRead().then(()=>setNotes(n=>n.map(x=>({...x,isRead:true}))))}>{t.markAllRead}</button></div>{notes.length===0?<p>{t.noNotifications}</p>:notes.slice(0,10).map(n=><div className={`notification ${n.isRead?"read":""}`} key={n.id} onClick={()=>api.markNotificationRead(n.id).then(()=>{setNotes(x=>x.map(a=>a.id===n.id?{...a,isRead:true}:a));setOpen(false);if(n.type==="new_food"&&n.relatedId)onNavigate(`product:${n.relatedId}`);else if(["order_status","new_order"].includes(n.type))onNavigate("orders");else onNavigate("notifications")})}><b>{n.title}</b><span>{n.message}</span><small>{new Date(n.createdAt).toLocaleString("ne-NP")}</small></div>)}</div>}
      </div>}

      {user&&<div className="user" onClick={()=>onNavigate("profile")}><div className="avatar">{user.profileImage?<img src={user.profileImage} alt="profile"/>:(user.name?.[0]||"G")}</div>{user.name}<ChevronDownIcon/></div>}

      <button type="button" className={user?"auth-side-btn logout-btn":"auth-side-btn"} onClick={handleAuth}>{user?t.navLogout:t.login}</button>
    </div>
  </header>
}
