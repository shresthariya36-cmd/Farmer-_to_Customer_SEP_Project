const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5006/api";
export function getToken(){return localStorage.getItem("taja_token");}
async function request(path,{method="GET",body,auth=false}={}){
 const headers={"Content-Type":"application/json"}; if(auth){const token=getToken();if(token)headers.Authorization=`Bearer ${token}`;}
 const res=await fetch(`${BASE_URL}${path}`,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
 if(res.status===204)return null; const data=await res.json().catch(()=>null); if(!res.ok)throw new Error(data?.error||data?.message||`Request failed (${res.status})`); return data;
}
export const api={
 register:p=>request("/auth/register",{method:"POST",body:p}),login:p=>request("/auth/login",{method:"POST",body:p}),forgotPassword:email=>request("/auth/forgot-password",{method:"POST",body:{email}}),resetPassword:(email,code,newPassword)=>request("/auth/reset-password",{method:"POST",body:{email,code,newPassword}}),me:()=>request("/auth/me",{auth:true}),
 getCategories:()=>request("/categories"),getProducts:(p={})=>{const q=new URLSearchParams(p).toString();return request(`/products${q?`?${q}`:""}`)},getProduct:id=>request(`/products/${id}`),getMyProducts:()=>request("/products/mine",{auth:true}),
 createProduct:p=>request("/products",{method:"POST",body:p,auth:true}),updateProduct:(id,p)=>request(`/products/${id}`,{method:"PUT",body:p,auth:true}),deleteProduct:id=>request(`/products/${id}`,{method:"DELETE",auth:true}),
 getCart:()=>request("/cart",{auth:true}),addToCart:(productId,qty=1)=>request("/cart/add",{method:"POST",body:{productId,qty},auth:true}),removeCart:productId=>request(`/cart/${productId}`,{method:"DELETE",auth:true}),
 getFarmer:id=>request(`/farmers/${id}`),searchFarmers:p=>{const q=new URLSearchParams(p||{}).toString();return request(`/farmers${q?`?${q}`:""}`)},
 sendMessage:(productId,text)=>request("/messages",{method:"POST",body:{productId,text},auth:true}),replyToMessage:(toUserId,productId,text)=>request("/messages/reply",{method:"POST",body:{toUserId,productId,text},auth:true}),getInbox:()=>request("/messages/inbox",{auth:true}),getSentMessages:()=>request("/messages/sent",{auth:true}),getMyMessages:()=>request("/messages/mine",{auth:true}),
 getWishlist:()=>request("/wishlist",{auth:true}),toggleWishlist:productId=>request("/wishlist/toggle",{method:"POST",body:{productId},auth:true}),
 checkout:paymentMethod=>request("/orders/checkout",{method:"POST",body:{paymentMethod},auth:true}),buyNow:(productId,qty=1,paymentMethod="cod")=>request("/orders/buy-now",{method:"POST",body:{productId,qty,paymentMethod},auth:true}),getMyOrders:()=>request("/orders/mine",{auth:true}),getOrder:id=>request(`/orders/${id}`,{auth:true}),getFarmerOrders:()=>request("/orders/farmer/mine",{auth:true}),confirmOrder:id=>request(`/orders/${id}/confirm`,{method:"POST",auth:true}),
 getFarmerSales:()=>request("/farmer/sales-summary",{auth:true}),updateProfile:p=>request("/users/me",{method:"PUT",body:p,auth:true}),
 getAdminStats:()=>request("/admin/stats",{auth:true}),getAdminUsers:()=>request("/admin/users",{auth:true}),getPendingFarmers:()=>request("/admin/pending-farmers",{auth:true}),approveFarmer:(id,approved=true)=>request(`/admin/farmers/${id}/approval`,{method:"PUT",body:{approved},auth:true}),getAdminProducts:()=>request("/admin/products",{auth:true}),deleteAdminProduct:id=>request(`/admin/products/${id}`,{method:"DELETE",auth:true}),getAdminOrders:()=>request("/admin/orders",{auth:true}),setOrderStatus:(id,stage)=>request(`/admin/orders/${id}/status`,{method:"PUT",body:{stage},auth:true}),
 getNotifications:()=>request("/notifications",{auth:true}),markNotificationRead:id=>request(`/notifications/${id}/read`,{method:"PUT",auth:true}),markAllNotificationsRead:()=>request("/notifications/read-all",{method:"PUT",auth:true}),
 submitReview:p=>request("/reviews",{method:"POST",body:p,auth:true}),getProductReviews:id=>request(`/reviews/product/${id}`),getFarmerReviews:id=>request(`/reviews/farmer/${id}`)
};
export function saveSession(token,user){localStorage.setItem("taja_token",token);localStorage.setItem("taja_user",JSON.stringify(user));}
export function loadSession(){const token=localStorage.getItem("taja_token"),raw=localStorage.getItem("taja_user");if(!token||!raw)return null;try{return{token,user:JSON.parse(raw)}}catch{return null}}
export function clearSession(){localStorage.removeItem("taja_token");localStorage.removeItem("taja_user");}
