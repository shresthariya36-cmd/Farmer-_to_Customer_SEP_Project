import {HomeIcon,CartIcon,HeartIcon,UserIcon,MessageIcon} from "./Icons.jsx";
import {t} from "../i18n.js";

const items=[
  {key:"dashboard",label:t.navHome,icon:HomeIcon},
  {key:"orders",label:t.navOrders,icon:CartIcon},
  {key:"wishlist",label:t.navWishlist,icon:HeartIcon},
  {key:"profile",label:t.navProfile,icon:UserIcon},
  {key:"messages",label:t.navMessages,icon:MessageIcon}
];

export default function Sidebar({active,onNavigate,user}){
  const visibleItems=(user?.role==="farmer"||user?.role==="admin")
    ? items.filter(x=>["dashboard","profile","messages"].includes(x.key))
    : items;

  return <aside className="sidebar">
    <nav>
      {visibleItems.map(({key,label,icon:Icon})=><a key={key} className={active===key?"active":""} href="#" onClick={e=>{e.preventDefault();onNavigate(key)}}><Icon/> {label}</a>)}
    </nav>
  </aside>
}
