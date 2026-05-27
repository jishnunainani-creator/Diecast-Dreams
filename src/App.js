import { useState, useEffect, useRef } from "react";

// ══════════════ CONFIG ══════════════
const APP_NAME        = "Diecast Dreams";
const TAGLINE         = "Premium Diecast · Ahmedabad, Gujarat";
const WHATSAPP_NUMBER = "919999999999";
const WA_COMMUNITY    = "https://chat.whatsapp.com/Is8xqmmaGaoFfvIpyKzTRs";
const INSTAGRAM_URL   = "https://www.instagram.com/diecastsdreams";
const INSTAGRAM_HANDLE= "@diecastsdreams";
const ADMIN_PHONE     = "9999999999";
const ADMIN_PASSWORD  = "hotwheels123";
const FEEDBACK_FORM   = "https://forms.gle/nC6BnHPJc5kqfmFC9";
const LOGO_URL        = "https://i.ibb.co/TxBJ8SJj/logo.jpg";
// ════════════════════════════════════

const DEFAULT_CATEGORIES = [
  {id:"mainline",    label:"Mainlines",           icon:"🚗", color:"#e67e00"},
  {id:"premium",     label:"Premium",             icon:"⭐", color:"#0369a1"},
  {id:"muscle",      label:"Muscle Cars",         icon:"💪", color:"#be123c"},
  {id:"th",          label:"Treasure Hunts",      icon:"🔍", color:"#7c3aed"},
  {id:"sth",         label:"Super THs",           icon:"🌟", color:"#854d0e"},
  {id:"minigt",      label:"Mini GTs",            icon:"🏎️", color:"#065f46"},
  {id:"car_culture", label:"Car Culture",         icon:"🎨", color:"#0891b2"},
  {id:"retro",       label:"Retro Entertainment", icon:"🎬", color:"#9333ea"},
  {id:"rlc",         label:"RLC / Exclusives",    icon:"💎", color:"#b45309"},
  {id:"other",       label:"Other",               icon:"📦", color:"#6b7280"},
];

const DEFAULT_TAGS  = ["Hot Pick","Must Buy","Rare","Limited Edition","Exclusive","New Arrival","Sealed","Loose","TH","STH","Spectraflame","Real Riders","Treasure Hunt"];
const STOCK_OPTIONS = ["In Stock","Limited","Sold Out"];
const SS            = {"In Stock":{bg:"#dcfce7",c:"#166534"},"Limited":{bg:"#fef9c3",c:"#854d0e"},"Sold Out":{bg:"#fee2e2",c:"#991b1b"}};
const ICON_OPTIONS  = ["🚗","⭐","💪","🔍","🌟","🏎️","🎨","🎬","💎","📦","🚀","🏁","🔥","💥","🎯","🛻","🚙","🏆","🎪","🌈"];
const COLOR_OPTIONS = ["#e67e00","#0369a1","#be123c","#7c3aed","#854d0e","#065f46","#0891b2","#9333ea","#b45309","#6b7280","#dc2626","#166534","#1d4ed8","#9f1239","#92400e"];
const PHC           = ["c0392b","d35400","8e44ad","2471a3","1a5276","943126","784212","1f618d"];
const ph  = (n,i=0) => `https://placehold.co/400x260/${PHC[i%PHC.length]}/fff?text=${encodeURIComponent((n||"Car").slice(0,13))}`;
const BLANK_CAR = {name:"",categoryId:"mainline",price:"",stock:"In Stock",desc:"",images:[],year:new Date().getFullYear(),tags:[]};
const BLANK_CAT = {label:"",icon:"🚗",color:"#dc2626"};

function usePersist(key, init) {
  const [v,sv] = useState(() => { try { const s=localStorage.getItem(key); return s?JSON.parse(s):init; } catch { return init; } });
  useEffect(() => { try { localStorage.setItem(key,JSON.stringify(v)); } catch {} }, [v,key]);
  return [v,sv];
}

async function resizeImage(file, maxW=900, maxH=700, q=0.85) {
  return new Promise(res => {
    const r = new FileReader();
    r.onload = e => {
      const img = new Image();
      img.onload = () => {
        let {width:w, height:h} = img;
        const ratio = Math.min(maxW/w, maxH/h, 1);
        w=Math.round(w*ratio); h=Math.round(h*ratio);
        const c = document.createElement("canvas");
        c.width=w; c.height=h;
        c.getContext("2d").drawImage(img,0,0,w,h);
        res(c.toDataURL("image/jpeg",q));
      };
      img.src = e.target.result;
    };
    r.readAsDataURL(file);
  });
}

function generateOTP() { return String(Math.floor(100000+Math.random()*900000)); }

const Pill = ({label,bg,col}) => <span style={{background:bg,color:col,fontSize:11,padding:"3px 10px",borderRadius:20,fontWeight:600,whiteSpace:"nowrap"}}>{label}</span>;

function Toast({msg}) {
  return <div style={{position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:"#111",color:"#fff",padding:"10px 24px",borderRadius:30,fontSize:13,fontWeight:500,zIndex:9999,boxShadow:"0 4px 20px #0004",maxWidth:"88vw",textAlign:"center"}}>{msg}</div>;
}

export default function App() {
  const [categories,setCategories] = usePersist("dd3_cats", DEFAULT_CATEGORIES);
  const [allTags,setAllTags]       = usePersist("dd3_tags", DEFAULT_TAGS);
  const [cars,setCars]             = usePersist("dd3_cars", []);
  const [wish,setWish]             = usePersist("dd3_wish", []);
  const [cart,setCart]             = usePersist("dd3_cart", []);
  const [orders,setOrders]         = usePersist("dd3_orders", []);
  const [users,setUsers]           = usePersist("dd3_users", []);
  const [curUser,setCurUser]       = usePersist("dd3_cur", null);
  const [visitors,setVisitors]     = usePersist("dd3_visitors", 0);

  const [page,setPage]       = useState("home");
  const [prevPage,setPP]     = useState("home");
  const [sel,setSel]         = useState(null);
  const [activeCat,setActiveCat] = useState(null);
  const [search,setSearch]   = useState("");
  const [fStock,setFStock]   = useState("All");
  const [maxP,setMaxP]       = useState(5000);
  const [sort,setSort]       = useState("name");
  const [cartOpen,setCartOpen] = useState(false);
  const [toast,setToast]     = useState(null);

  // Auth
  const [authMode,setAuthMode]     = useState("login");
  const [authPhone,setAuthPhone]   = useState("");
  const [authName,setAuthName]     = useState("");
  const [authOtp,setAuthOtp]       = useState("");
  const [realOtp,setRealOtp]       = useState("");
  const [authErr,setAuthErr]       = useState("");
  const [otpTimer,setOtpTimer]     = useState(0);
  const [pwStep,setPwStep]         = useState(false);
  const [adminPw,setAdminPw]       = useState("");
  const [adminPwErr,setAdminPwErr] = useState(false);
  const [isAdminFlow,setIsAdminFlow] = useState(false);

  // Admin
  const [adminOk,setAdminOk]       = useState(false);
  const [carForm,setCarForm]       = useState(BLANK_CAR);
  const [editCarId,setEditCarId]   = useState(null);
  const [catForm,setCatForm]       = useState(BLANK_CAT);
  const [editCatId,setEditCatId]   = useState(null);
  const [tagInput,setTagInput]     = useState("");
  const [editTagIdx,setEditTagIdx] = useState(null);
  const [editTagVal,setEditTagVal] = useState("");
  const [imgLoading,setImgLoading] = useState(false);

  const fileRef  = useRef();
  const tRef     = useRef();
  const timerRef = useRef();

  const cartCount = cart.reduce((s,x) => s+x.qty, 0);
  const cartTotal = cart.reduce((s,x) => s+x.price*x.qty, 0);
  const realMax   = Math.max(...cars.map(c=>c.price), 2000);

  const toast_ = m => { setToast(m); clearTimeout(tRef.current); tRef.current=setTimeout(()=>setToast(null),2500); };
  const nav    = (p,opts={}) => { setPage(p); if(opts.cat!==undefined) setActiveCat(opts.cat); window.scrollTo({top:0,behavior:"smooth"}); setCartOpen(false); };

  // visitor counter
  useEffect(() => {
    if(!sessionStorage.getItem("dd3_visited")) {
      setVisitors(v => v+1);
      sessionStorage.setItem("dd3_visited","1");
    }
  }, []);

  useEffect(() => {
    if(otpTimer>0) { timerRef.current=setTimeout(()=>setOtpTimer(t=>t-1),1000); }
    return () => clearTimeout(timerRef.current);
  }, [otpTimer]);

  // ── Auth ──
  function sendOtp() {
    const p = authPhone.trim();
    if(!/^\d{10}$/.test(p)) { setAuthErr("Enter a valid 10-digit number"); return; }
    const isAdmin = p===ADMIN_PHONE;
    if(!isAdmin) {
      if(authMode==="register") { if(!authName.trim()){setAuthErr("Enter your name");return;} if(users.find(u=>u.phone===p)){setAuthErr("Account exists. Login.");return;} }
      else { if(!users.find(u=>u.phone===p)){setAuthErr("No account found. Register first.");return;} }
    }
    const code = generateOTP();
    setRealOtp(code); setAuthErr(""); setOtpTimer(30);
    setIsAdminFlow(isAdmin); setPwStep(false); setPage("otp");
    toast_("OTP sent! Demo OTP: "+code);
  }

  function verifyOtp() {
    if(authOtp.trim()!==realOtp) { setAuthErr("Incorrect OTP."); return; }
    setAuthErr("");
    if(isAdminFlow) { setPwStep(true); return; }
    const p = authPhone.trim();
    if(authMode==="register") {
      const nu = {id:Date.now(),name:authName.trim(),phone:p,joinedAt:new Date().toLocaleDateString("en-IN")};
      setUsers(u=>[...u,nu]); setCurUser(nu);
    } else { setCurUser(users.find(x=>x.phone===p)); }
    nav("home"); toast_("Welcome"+(authMode==="register"?", "+authName:" back")+"! 🎉");
  }

  function verifyAdminPassword() {
    if(adminPw===ADMIN_PASSWORD) { setAdminOk(true); setAdminPwErr(false); nav("admin"); toast_("Welcome to Admin Panel 🔥"); }
    else setAdminPwErr(true);
  }

  function logout() {
    setCurUser(null); setAdminOk(false); setAuthPhone(""); setAuthOtp(""); setAdminPw("");
    setPwStep(false); setIsAdminFlow(false); nav("home"); toast_("Logged out");
  }

  // ── Cart / Wish ──
  const toggleWish = id => { setWish(w=>w.includes(id)?w.filter(x=>x!==id):[...w,id]); toast_(wish.includes(id)?"Removed from wishlist":"Added to wishlist ❤️"); };
  const addCart    = car => { setCart(c=>{const ex=c.find(x=>x.id===car.id); return ex?c.map(x=>x.id===car.id?{...x,qty:x.qty+1}:x):[...c,{...car,qty:1}];}); toast_("Added to cart 🛒"); };
  const remCart    = id  => setCart(c=>c.filter(x=>x.id!==id));

  // ── ORDER via WhatsApp (v60 method — direct, clean) ──
  function waCart() {
    if(cart.length===0) { toast_("Your cart is empty!"); return; }
    let msg = `Hello! I want to order from *${APP_NAME}*:\n\n`;
    cart.forEach(item => { msg += `• ${item.name} ×${item.qty} = ₹${item.price*item.qty}\n`; });
    msg += `\n*Total: ₹${cartTotal.toLocaleString("en-IN")}*`;
    if(curUser?.name)  msg += `\nName: ${curUser.name}`;
    if(curUser?.phone) msg += `\nPhone: +91-${curUser.phone}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
    const order = {
      id: Date.now(),
      date: new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}),
      customerName: curUser?.name||"Guest",
      phone: curUser?.phone||"",
      items: cart.map(x=>({name:x.name,qty:x.qty,price:x.price})),
      total: cartTotal,
      status: "Ordered via WhatsApp"
    };
    setOrders(o=>[order,...o]);
    setCart([]);
    toast_("Order sent on WhatsApp! 💬");
  }

  const waMsg   = car => { const m=`Hi! I'm interested in *${car.name}* — ₹${car.price}. Is it available?`; window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(m)}`,"_blank"); };
  const shareItem = car => { const t=`Check out ${car.name} at ₹${car.price} — ${APP_NAME}`; if(navigator.share) navigator.share({title:car.name,text:t}); else { navigator.clipboard?.writeText(t); toast_("Copied!"); } };

  // ── Admin Cars ──
  function openCarForm(car) { setEditCarId(car?car.id:null); setCarForm(car?{...car}:BLANK_CAR); nav("admin_car_form"); }
  function saveCar() {
    if(!carForm.name.trim()||!carForm.price) { toast_("Name and price required"); return; }
    const saved = {...carForm, price:Number(carForm.price), id:editCarId||Date.now()};
    if(editCarId) setCars(c=>c.map(x=>x.id===editCarId?saved:x));
    else setCars(c=>[...c,saved]);
    nav("admin_cars"); toast_(editCarId?"Car updated ✅":"Car added 🚗");
  }
  function deleteCar(id) { if(window.confirm("Delete this car?")) { setCars(c=>c.filter(x=>x.id!==id)); toast_("Deleted"); } }
  async function handleImg(file) {
    if(!file) return;
    if((carForm.images||[]).length>=5) { toast_("Max 5 photos"); return; }
    setImgLoading(true);
    try { const r=await resizeImage(file); setCarForm(f=>({...f,images:[...(f.images||[]),r]})); toast_("Photo added ✅"); }
    catch { toast_("Upload failed"); }
    setImgLoading(false);
  }
  const toggleTag = tag => setCarForm(f => { const tags=f.tags||[]; return {...f,tags:tags.includes(tag)?tags.filter(t=>t!==tag):[...tags,tag]}; });

  // ── Admin Categories ──
  function openCatForm(cat) { setEditCatId(cat?cat.id:null); setCatForm(cat?{label:cat.label,icon:cat.icon,color:cat.color}:BLANK_CAT); nav("admin_cat_form"); }
  function saveCat() {
    if(!catForm.label.trim()) { toast_("Category name required"); return; }
    if(editCatId) setCategories(c=>c.map(x=>x.id===editCatId?{...x,...catForm}:x));
    else setCategories(c=>[...c,{id:catForm.label.toLowerCase().replace(/\s+/g,"_")+"_"+Date.now(),...catForm}]);
    nav("admin_cats"); toast_(editCatId?"Category updated ✅":"Category added ✅");
  }
  function deleteCat(id) { if(window.confirm("Delete this category?")) { setCategories(c=>c.filter(x=>x.id!==id)); toast_("Category deleted"); } }

  // ── Filter ──
  const filtered = cars.filter(c => {
    if(activeCat && c.categoryId!==activeCat) return false;
    if(fStock!=="All" && c.stock!==fStock) return false;
    if(c.price>maxP) return false;
    if(search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a,b) =>
    sort==="price_asc"?a.price-b.price:sort==="price_desc"?b.price-a.price:
    sort==="newest"?(b.tags?.includes("New Arrival")?1:0)-(a.tags?.includes("New Arrival")?1:0):
    sort==="hot"?(b.tags?.includes("Hot Pick")?1:0)-(a.tags?.includes("Hot Pick")?1:0):
    a.name.localeCompare(b.name)
  );

  const inp = {width:"100%",padding:"12px 14px",borderRadius:12,border:"1.5px solid #e0e0e0",fontSize:14,boxSizing:"border-box",background:"#fafafa",outline:"none"};
  const btn = (bg,col,mb=10) => ({background:bg,color:col,border:"none",borderRadius:12,padding:"13px 0",fontWeight:700,fontSize:15,cursor:"pointer",width:"100%",marginBottom:mb,display:"block"});
  const lbl = {fontSize:12,color:"#666",display:"block",marginBottom:5,fontWeight:600};

  // ── Visitor Counter ──
  const VisitorCounter = () => (
    <div style={{position:"fixed",bottom:20,left:16,background:"rgba(0,0,0,0.75)",color:"#fff",borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:600,zIndex:300,display:"flex",alignItems:"center",gap:6}}>
      <span style={{width:7,height:7,borderRadius:"50%",background:"#4ade80",display:"inline-block"}}/>
      {visitors.toLocaleString("en-IN")} visitors
    </div>
  );

  // ── HEADER ──
  const Header = () => (
    <header style={{background:"#111",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 16px #0006"}}>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:64}}>
        <div style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer"}} onClick={()=>nav("home")}>
          <img src={LOGO_URL} alt="logo" style={{width:42,height:42,borderRadius:"50%",objectFit:"cover",border:"2px solid #dc2626"}} onError={e=>{e.target.style.display="none";}}/>
          <div>
            <div style={{color:"#fff",fontWeight:800,fontSize:18}}>{APP_NAME}</div>
            <div style={{color:"#f87171",fontSize:10}}>{TAGLINE}</div>
          </div>
        </div>
        <nav style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>
          {[["home","Home"],["shop","Shop"],["policies","Policies"],["about","About"],["contact","Contact"]].map(([p,l])=>(
            <button key={p} onClick={()=>nav(p)} style={{background:page===p?"#dc2626":"transparent",color:page===p?"#fff":"#ccc",border:"none",borderRadius:8,padding:"8px 14px",cursor:"pointer",fontWeight:600,fontSize:13}}>{l}</button>
          ))}
          {curUser
            ?<button onClick={()=>nav("profile")} style={{background:page==="profile"?"#dc2626":"transparent",color:page==="profile"?"#fff":"#ccc",border:"none",borderRadius:8,padding:"8px 14px",cursor:"pointer",fontWeight:600,fontSize:13}}>👤 {curUser.name.split(" ")[0]}</button>
            :<button onClick={()=>{setAuthMode("login");nav("login");}} style={{background:"transparent",color:"#ccc",border:"1px solid #444",borderRadius:8,padding:"8px 14px",cursor:"pointer",fontWeight:600,fontSize:13}}>Login</button>
          }
          {adminOk&&<button onClick={()=>nav("admin")} style={{background:"#7c3aed",color:"#fff",border:"none",borderRadius:8,padding:"8px 14px",cursor:"pointer",fontWeight:600,fontSize:13}}>⚙️ Admin</button>}
          <div style={{position:"relative"}}>
            <button onClick={()=>setCartOpen(!cartOpen)} style={{background:"transparent",border:"1px solid #444",borderRadius:8,padding:"8px 14px",cursor:"pointer",color:"#fff",fontWeight:600,fontSize:13,position:"relative"}}>
              🛒{cartCount>0&&<span style={{position:"absolute",top:-6,right:-6,background:"#dc2626",color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{cartCount}</span>}
            </button>
            {cartOpen&&(
              <div style={{position:"absolute",right:0,top:46,background:"#fff",borderRadius:16,padding:"16px",width:300,boxShadow:"0 8px 32px #0003",zIndex:200}}>
                <div style={{fontWeight:700,fontSize:15,marginBottom:12}}>🛒 Cart ({cartCount})</div>
                {cart.length===0?<div style={{color:"#aaa",fontSize:13,textAlign:"center",padding:"16px 0"}}>Empty cart</div>:<>
                  {cart.map(item=>(
                    <div key={item.id} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f3f3f3"}}>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:600,fontSize:13}}>{item.name}</div>
                        <div style={{fontSize:12,color:"#888"}}>₹{item.price} × {item.qty}</div>
                      </div>
                      <div style={{fontWeight:700,color:"#dc2626",fontSize:13}}>₹{(item.price*item.qty).toLocaleString("en-IN")}</div>
                      <button onClick={()=>remCart(item.id)} style={{background:"none",border:"none",color:"#dc2626",cursor:"pointer",fontWeight:700,fontSize:15}}>✕</button>
                    </div>
                  ))}
                  <div style={{display:"flex",justifyContent:"space-between",margin:"12px 0 10px",fontWeight:700,fontSize:15}}>
                    <span>Total</span><span style={{color:"#dc2626"}}>₹{cartTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <button onClick={()=>{setCartOpen(false);nav("cart");}} style={{width:"100%",background:"#dc2626",color:"#fff",border:"none",borderRadius:10,padding:"11px 0",fontWeight:700,cursor:"pointer",fontSize:14,marginBottom:8}}>View Full Cart</button>
                  <button onClick={()=>{setCartOpen(false);waCart();}} style={{width:"100%",background:"#25d366",color:"#fff",border:"none",borderRadius:10,padding:"11px 0",fontWeight:700,cursor:"pointer",fontSize:14}}>💬 Order via WhatsApp</button>
                </>}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );

  // ── FOOTER ──
  const Footer = () => (
    <footer style={{background:"#111",color:"#aaa",padding:"40px 24px 24px",marginTop:60}}>
      <div style={{maxWidth:1200,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:32,marginBottom:32}}>
        <div>
          <div style={{color:"#fff",fontWeight:800,fontSize:18,marginBottom:8}}>{APP_NAME}</div>
          <div style={{fontSize:13,lineHeight:1.8}}>{TAGLINE}<br/>100% authentic Mattel products.<br/>Ships across India.</div>
        </div>
        <div>
          <div style={{color:"#fff",fontWeight:700,marginBottom:10}}>Quick Links</div>
          {[["home","Home"],["shop","Shop"],["about","About"],["contact","Contact"],["policies","Policies & Returns"]].map(([p,l])=>(
            <div key={p}><button onClick={()=>nav(p)} style={{background:"none",border:"none",color:"#aaa",cursor:"pointer",fontSize:13,padding:"3px 0",display:"block"}}>{l}</button></div>
          ))}
        </div>
        <div>
          <div style={{color:"#fff",fontWeight:700,marginBottom:10}}>Connect</div>
          <div style={{fontSize:13,lineHeight:2}}>
            <div>📸 <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" style={{color:"#aaa",textDecoration:"none"}}>{INSTAGRAM_HANDLE}</a></div>
            <div>💬 <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" style={{color:"#aaa",textDecoration:"none"}}>WhatsApp Us</a></div>
            <div>🏘️ <a href={WA_COMMUNITY} target="_blank" rel="noreferrer" style={{color:"#aaa",textDecoration:"none"}}>Join Community</a></div>
          </div>
        </div>
      </div>
      <div style={{borderTop:"1px solid #333",paddingTop:16,textAlign:"center",fontSize:12}}>© 2025 {APP_NAME} · All rights reserved · Ahmedabad, Gujarat</div>
    </footer>
  );

  // ── SHOP CARD ──
  const ShopCard = ({car,i}) => {
    const cat   = categories.find(c=>c.id===car.categoryId)||{label:"Other",color:"#6b7280",icon:"📦"};
    const st    = SS[car.stock]||SS["In Stock"];
    const imgs  = (car.images||[]).filter(Boolean);
    const thumb = imgs.length>0?imgs[0]:ph(car.name,i);
    const isHot = car.tags?.includes("Hot Pick");
    const isNew = car.tags?.includes("New Arrival");
    const wished= wish.includes(car.id);
    return (
      <div style={{background:"#fff",borderRadius:16,overflow:"hidden",boxShadow:"0 2px 12px #0001",transition:"transform 0.18s,box-shadow 0.18s"}}
        onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 8px 24px #0002";}}
        onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 2px 12px #0001";}}>
        <div style={{position:"relative",height:200,background:"#f3f3f3",overflow:"hidden",cursor:"pointer"}} onClick={()=>{setSel(car);setPP(page);nav("detail");}}>
          <img src={thumb} alt={car.name} style={{width:"100%",height:"100%",objectFit:"contain"}} onError={e=>e.target.src=ph(car.name,i)}/>
          {isHot&&<div style={{position:"absolute",top:10,left:10,background:"#dc2626",color:"#fff",fontSize:10,padding:"3px 9px",borderRadius:20,fontWeight:700}}>🔥 HOT</div>}
          {isNew&&<div style={{position:"absolute",top:isHot?32:10,left:10,background:"#0369a1",color:"#fff",fontSize:10,padding:"3px 9px",borderRadius:20,fontWeight:700}}>✨ NEW</div>}
          {imgs.length>1&&<div style={{position:"absolute",bottom:8,right:8,background:"rgba(0,0,0,0.55)",color:"#fff",fontSize:10,padding:"2px 8px",borderRadius:20,fontWeight:600}}>+{imgs.length-1} photos</div>}
          <button onClick={e=>{e.stopPropagation();toggleWish(car.id);}} style={{position:"absolute",top:10,right:10,background:"rgba(255,255,255,0.9)",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {wished?"❤️":"🤍"}
          </button>
        </div>
        <div style={{padding:"14px"}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:5,cursor:"pointer"}} onClick={()=>{setSel(car);setPP(page);nav("detail");}}>{car.name}</div>
          <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
            <span style={{background:cat.color+"22",color:cat.color,fontSize:11,padding:"3px 10px",borderRadius:20,fontWeight:600}}>{cat.icon} {cat.label}</span>
            <span style={{background:st.bg,color:st.c,fontSize:11,padding:"3px 10px",borderRadius:20,fontWeight:600}}>{car.stock}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <span style={{fontWeight:800,color:"#dc2626",fontSize:18}}>₹{Number(car.price).toLocaleString("en-IN")}</span>
            <span style={{fontSize:11,color:"#aaa"}}>{car.year}</span>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>car.stock!=="Sold Out"&&addCart(car)} disabled={car.stock==="Sold Out"}
              style={{flex:1,background:car.stock==="Sold Out"?"#f3f3f3":"#dc2626",color:car.stock==="Sold Out"?"#bbb":"#fff",border:"none",borderRadius:10,padding:"10px 0",fontWeight:700,cursor:car.stock==="Sold Out"?"not-allowed":"pointer",fontSize:13}}>
              {car.stock==="Sold Out"?"Sold Out":"🛒 Add to Cart"}
            </button>
            <button onClick={()=>waMsg(car)} style={{background:"#25d366",color:"#fff",border:"none",borderRadius:10,padding:"10px 12px",cursor:"pointer",fontSize:15}}>💬</button>
          </div>
        </div>
      </div>
    );
  };

  // ════ HOME ════
  if(page==="home") return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:"#f8f8f8",minHeight:"100vh"}}>
      {toast&&<Toast msg={toast}/>}<VisitorCounter/><Header/>
      {/* Hero */}
      <div style={{background:"linear-gradient(135deg,#0f0f0f 0%,#1a0000 50%,#2d0a0a 100%)",padding:"90px 24px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 50% 50%,#dc262620,transparent 70%)"}}/>
        <div style={{position:"relative",zIndex:1}}>
          <img src={LOGO_URL} alt="logo" style={{width:110,height:110,borderRadius:"50%",objectFit:"cover",border:"3px solid #dc2626",marginBottom:18,boxShadow:"0 0 40px #dc262680"}} onError={e=>e.target.style.display="none"}/>
          <div style={{fontSize:13,color:"#f87171",fontWeight:600,letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>Premium 1:64 Diecast · Ahmedabad, Gujarat</div>
          <h1 style={{color:"#fff",fontSize:52,fontWeight:900,margin:"0 0 14px",lineHeight:1.1}}>{APP_NAME} <span style={{color:"#dc2626"}}>🔥</span></h1>
          <p style={{color:"#ccc",fontSize:18,maxWidth:520,margin:"0 auto 36px",lineHeight:1.7}}>India's trusted Hot Wheels seller. Mainlines, Premium, Super Treasure Hunts & more — all 100% authentic.</p>
          <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={()=>nav("shop")} style={{background:"#dc2626",color:"#fff",border:"none",borderRadius:12,padding:"15px 36px",fontWeight:700,fontSize:16,cursor:"pointer"}}>Browse Collection →</button>
            <button onClick={()=>window.open(WA_COMMUNITY,"_blank")} style={{background:"#25d366",color:"#fff",border:"none",borderRadius:12,padding:"15px 28px",fontWeight:700,fontSize:16,cursor:"pointer"}}>💬 Join Community</button>
          </div>
        </div>
      </div>
      {/* Stats */}
      <div style={{background:"#dc2626",padding:"22px 24px"}}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"flex",justifyContent:"center",gap:48,flexWrap:"wrap"}}>
          {[[cars.length+"+ Cars","Listed"],[cars.filter(c=>c.stock==="In Stock").length+"","In Stock"],["100%","Authentic Mattel"],["Pan India","Shipping"]].map(([v,l])=>(
            <div key={l} style={{textAlign:"center",color:"#fff"}}>
              <div style={{fontWeight:800,fontSize:22}}>{v}</div>
              <div style={{fontSize:12,opacity:0.85}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Who Is This For */}
      <div style={{maxWidth:1100,margin:"0 auto",padding:"56px 24px 0"}}>
        <h2 style={{fontSize:24,fontWeight:800,marginBottom:6,textAlign:"center"}}>Who Is This For?</h2>
        <p style={{color:"#888",fontSize:14,textAlign:"center",marginBottom:28}}>Whether you're buying for yourself or someone special — we've got you covered.</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:18}}>
          {[{icon:"👨‍👧",title:"Parents",desc:"Your child has a passion for collecting Hot Wheels? We help you find exactly what they've been looking for — from everyday Mainlines to rare finds that'll make their day.",color:"#0369a1"},
            {icon:"🧑‍🎨",title:"Adult Collectors",desc:"A serious hobby deserves serious sourcing. We specialize in Premium, Car Culture, Treasure Hunts, and Super THs — the ones that are nearly impossible to find at retail.",color:"#7c3aed"},
            {icon:"🎁",title:"Gift Givers",desc:"Looking for a unique, thoughtful gift? A rare Hot Wheels car is a collectible that lasts forever. Perfect for birthdays, anniversaries, or just because.",color:"#dc2626"}
          ].map(({icon,title,desc,color})=>(
            <div key={title} style={{background:"#fff",borderRadius:18,padding:"24px 20px",boxShadow:"0 2px 12px #0001",borderTop:`4px solid ${color}`,textAlign:"center"}}>
              <div style={{fontSize:40,marginBottom:12}}>{icon}</div>
              <div style={{fontWeight:800,fontSize:17,marginBottom:8,color}}>{title}</div>
              <div style={{fontSize:13,color:"#666",lineHeight:1.8}}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Categories */}
      <div style={{maxWidth:1200,margin:"0 auto",padding:"48px 24px 0"}}>
        <h2 style={{fontSize:28,fontWeight:800,marginBottom:6}}>Browse by Category</h2>
        <p style={{color:"#888",marginBottom:28,fontSize:15}}>Find exactly what you're looking for</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:14}}>
          {categories.map(cat=>{
            const cnt=cars.filter(c=>c.categoryId===cat.id).length;
            return(
              <button key={cat.id} onClick={()=>{setActiveCat(cat.id);nav("shop");}}
                style={{background:"#fff",borderRadius:16,padding:"18px 10px",border:`2px solid ${cat.color}33`,cursor:"pointer",textAlign:"center",transition:"transform 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"}
                onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                <div style={{fontSize:28,marginBottom:6}}>{cat.icon}</div>
                <div style={{fontSize:12,fontWeight:700,color:cat.color,lineHeight:1.3}}>{cat.label}</div>
                <div style={{fontSize:11,color:"#aaa",marginTop:3}}>{cnt} car{cnt!==1?"s":""}</div>
              </button>
            );
          })}
        </div>
      </div>
      {/* Hot Picks */}
      {cars.filter(c=>c.tags?.includes("Hot Pick")).length>0&&(
        <div style={{maxWidth:1200,margin:"0 auto",padding:"48px 24px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <h2 style={{fontSize:24,fontWeight:800,margin:0}}>🔥 Hot Picks</h2>
            <button onClick={()=>{setSort("hot");nav("shop");}} style={{background:"none",border:"none",color:"#dc2626",fontWeight:700,cursor:"pointer",fontSize:14}}>View All →</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:18}}>
            {cars.filter(c=>c.tags?.includes("Hot Pick")).slice(0,4).map((car,i)=><ShopCard key={car.id} car={car} i={i}/>)}
          </div>
        </div>
      )}
      {/* New Arrivals */}
      {cars.filter(c=>c.tags?.includes("New Arrival")).length>0&&(
        <div style={{maxWidth:1200,margin:"0 auto",padding:"48px 24px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <h2 style={{fontSize:24,fontWeight:800,margin:0}}>✨ New Arrivals</h2>
            <button onClick={()=>{setSort("newest");nav("shop");}} style={{background:"none",border:"none",color:"#dc2626",fontWeight:700,cursor:"pointer",fontSize:14}}>View All →</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:18}}>
            {cars.filter(c=>c.tags?.includes("New Arrival")).slice(0,4).map((car,i)=><ShopCard key={car.id} car={car} i={i}/>)}
          </div>
        </div>
      )}
      {/* All cars fallback */}
      {cars.filter(c=>c.tags?.includes("Hot Pick")).length===0&&cars.length>0&&(
        <div style={{maxWidth:1200,margin:"0 auto",padding:"48px 24px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <h2 style={{fontSize:24,fontWeight:800,margin:0}}>🚗 Our Collection</h2>
            <button onClick={()=>nav("shop")} style={{background:"none",border:"none",color:"#dc2626",fontWeight:700,cursor:"pointer",fontSize:14}}>View All →</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:18}}>
            {cars.slice(0,8).map((car,i)=><ShopCard key={car.id} car={car} i={i}/>)}
          </div>
        </div>
      )}
      {/* 50+ badge */}
      <div style={{maxWidth:1200,margin:"48px auto 0",padding:"0 24px"}}>
        <div style={{background:"linear-gradient(135deg,#dc2626,#7c3aed)",borderRadius:18,padding:"24px 32px",display:"flex",alignItems:"center",justifyContent:"center",gap:20,flexWrap:"wrap",textAlign:"center"}}>
          <div style={{fontSize:48}}>🏆</div>
          <div>
            <div style={{color:"#fff",fontWeight:900,fontSize:32}}>50+ Happy Customers</div>
            <div style={{color:"rgba(255,255,255,0.85)",fontSize:14,marginTop:4}}>And growing every day — join our community of passionate collectors across India!</div>
          </div>
          <button onClick={()=>window.open(WA_COMMUNITY,"_blank")} style={{background:"#fff",color:"#dc2626",border:"none",borderRadius:12,padding:"12px 22px",fontWeight:700,fontSize:14,cursor:"pointer",whiteSpace:"nowrap"}}>💬 Join Community</button>
        </div>
      </div>
      {/* Trust strip */}
      <div style={{maxWidth:1200,margin:"32px auto 0",padding:"0 24px"}}>
        <div style={{background:"#fff",borderRadius:20,padding:"32px 24px",display:"flex",gap:24,flexWrap:"wrap",justifyContent:"center"}}>
          {[["✅","100% Authentic","All Mattel official products"],["🚚","Pan-India Shipping","Speed Post & Courier"],["📦","Secure Packaging","Bubble wrap on every order"],["💬","WhatsApp Support","Reply within 24 hours"]].map(([icon,title,sub])=>(
            <div key={title} style={{textAlign:"center",flex:"1 1 160px"}}>
              <div style={{fontSize:28,marginBottom:8}}>{icon}</div>
              <div style={{fontWeight:700,fontSize:14}}>{title}</div>
              <div style={{fontSize:12,color:"#888",marginTop:3}}>{sub}</div>
            </div>
          ))}
        </div>
      </div>
      <Footer/>
    </div>
  );

  // ════ SHOP ════
  if(page==="shop") return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:"#f8f8f8",minHeight:"100vh"}}>
      {toast&&<Toast msg={toast}/>}<VisitorCounter/><Header/>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"32px 24px"}}>
        <h1 style={{fontSize:30,fontWeight:800,marginBottom:4}}>{activeCat?(categories.find(c=>c.id===activeCat)?.label||"")+" Collection":"Full Collection"}</h1>
        <p style={{color:"#888",marginBottom:24,fontSize:14}}>{filtered.length} car{filtered.length!==1?"s":""} available</p>
        <div style={{background:"#fff",borderRadius:16,padding:"18px 20px",marginBottom:20,display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search cars..." style={{flex:1,minWidth:180,padding:"10px 14px",borderRadius:10,border:"1.5px solid #e5e5e5",fontSize:14,background:"#fafafa"}}/>
          <select value={fStock} onChange={e=>setFStock(e.target.value)} style={{padding:"10px 12px",borderRadius:10,border:"1.5px solid #e5e5e5",fontSize:13,background:"#fafafa"}}>
            <option value="All">All Availability</option>
            <option>In Stock</option><option>Limited</option><option>Sold Out</option>
          </select>
          <select value={sort} onChange={e=>setSort(e.target.value)} style={{padding:"10px 12px",borderRadius:10,border:"1.5px solid #e5e5e5",fontSize:13,background:"#fafafa"}}>
            <option value="name">A–Z</option><option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option><option value="newest">New Arrivals</option><option value="hot">Hot Picks</option>
          </select>
          <div style={{display:"flex",alignItems:"center",gap:8,flex:"1 1 180px"}}>
            <span style={{fontSize:12,color:"#888",whiteSpace:"nowrap"}}>Max: <b style={{color:"#dc2626"}}>₹{maxP.toLocaleString("en-IN")}</b></span>
            <input type="range" min={50} max={realMax} step={50} value={maxP} onChange={e=>setMaxP(+e.target.value)} style={{flex:1,accentColor:"#dc2626"}}/>
          </div>
          {activeCat&&<button onClick={()=>setActiveCat(null)} style={{background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:8,padding:"8px 14px",cursor:"pointer",fontWeight:600,fontSize:13}}>✕ Clear</button>}
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:24}}>
          {[{id:null,label:"All",icon:"🏷️",color:"#111"},...categories].map(cat=>{
            const isAll=cat.id===null; const activeCheck=isAll?activeCat===null:activeCat===cat.id;
            const cnt=isAll?cars.length:cars.filter(c=>c.categoryId===cat.id).length;
            return(
              <button key={cat.id??"all"} onClick={()=>setActiveCat(isAll?null:cat.id)}
                style={{background:activeCheck?cat.color:cat.color+"18",color:activeCheck?"#fff":cat.color,border:"none",borderRadius:20,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:700}}>
                {cat.icon} {cat.label} ({cnt})
              </button>
            );
          })}
        </div>
        {filtered.length===0&&<div style={{textAlign:"center",color:"#ccc",padding:"60px 0",fontSize:18}}>No cars found 🚗</div>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:20}}>
          {filtered.map((car,i)=><ShopCard key={car.id} car={car} i={i}/>)}
        </div>
      </div>
      <Footer/>
    </div>
  );

  // ════ DETAIL ════
  if(page==="detail"&&sel) return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:"#f8f8f8",minHeight:"100vh"}}>
      {toast&&<Toast msg={toast}/>}<Header/>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"32px 24px"}}>
        <button onClick={()=>nav(prevPage)} style={{background:"none",border:"none",color:"#dc2626",fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:20,padding:0}}>← Back</button>
        <DetailView sel={sel} wish={wish} categories={categories} SS={SS} onCart={()=>addCart(sel)} onWish={()=>toggleWish(sel.id)} onWa={()=>waMsg(sel)} onShare={()=>shareItem(sel)}/>
      </div>
      <Footer/>
    </div>
  );

  // ════ CART ════
  if(page==="cart") return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:"#f8f8f8",minHeight:"100vh"}}>
      {toast&&<Toast msg={toast}/>}<VisitorCounter/><Header/>
      <div style={{maxWidth:900,margin:"0 auto",padding:"32px 24px"}}>
        <h1 style={{fontSize:28,fontWeight:800,marginBottom:24}}>🛒 My Cart ({cartCount})</h1>
        {cart.length===0?(
          <div style={{textAlign:"center",padding:"60px 0",color:"#bbb"}}>
            <div style={{fontSize:60,marginBottom:14}}>🛒</div>
            <div style={{fontSize:18,marginBottom:20}}>Your cart is empty</div>
            <button onClick={()=>nav("shop")} style={{background:"#dc2626",color:"#fff",border:"none",borderRadius:12,padding:"13px 32px",fontWeight:700,cursor:"pointer",fontSize:15}}>Browse Shop</button>
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:24,alignItems:"start"}}>
            <div style={{background:"#fff",borderRadius:16,overflow:"hidden"}}>
              {cart.map((item,i)=>(
                <div key={item.id} style={{display:"flex",gap:14,padding:"16px 18px",borderBottom:i<cart.length-1?"1px solid #f3f3f3":"none",alignItems:"center"}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>{item.name}</div>
                    <div style={{fontSize:13,color:"#666",display:"flex",gap:12,marginTop:6}}>
                      <span>Qty: {item.qty}</span><span>×</span><span>₹{item.price.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:800,color:"#dc2626",fontSize:16,marginBottom:8}}>₹{(item.price*item.qty).toLocaleString("en-IN")}</div>
                    <button onClick={()=>remCart(item.id)} style={{background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:8,padding:"5px 12px",cursor:"pointer",fontWeight:700,fontSize:13}}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:"#fff",borderRadius:16,padding:"20px"}}>
              <div style={{fontWeight:700,fontSize:16,marginBottom:14}}>Price Details</div>
              <div style={{display:"flex",flexDirection:"column",gap:10,paddingBottom:14,borderBottom:"1px dashed #e0e0e0",marginBottom:14}}>
                {[["Price ("+cartCount+" items)","₹"+cartTotal.toLocaleString("en-IN")],["Delivery","To be confirmed"],["Packaging","Included ✅"]].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:14,color:"#555"}}>
                    <span>{l}</span><span style={{color:v.startsWith("₹")?"#111":"#166534",fontWeight:v.startsWith("₹")?400:600}}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontWeight:800,fontSize:17,marginBottom:4}}>
                <span>Total</span><span style={{color:"#dc2626"}}>₹{cartTotal.toLocaleString("en-IN")}</span>
              </div>
              <div style={{fontSize:11,color:"#aaa",marginBottom:14}}>* Delivery charges confirmed on WhatsApp</div>
              <div style={{background:"#f8f8f8",borderRadius:12,padding:"12px 14px",marginBottom:16,border:"1px solid #e8e8e8"}}>
                <div style={{fontWeight:700,fontSize:13,marginBottom:6}}>📋 Order Policies</div>
                <div style={{fontSize:12,color:"#666",lineHeight:1.8}}>
                  • <b>Online payments only</b> — UPI / Bank Transfer. No cash.<br/>
                  • <b>Cancel before shipping only.</b> No cancellations after dispatch.<br/>
                  • Returns for <b>damaged/wrong items within 48hrs</b> with video proof.
                </div>
                <button onClick={()=>nav("policies")} style={{background:"none",border:"none",color:"#dc2626",fontWeight:700,fontSize:12,cursor:"pointer",padding:"6px 0 0",display:"block"}}>Read full policies →</button>
              </div>
              <button onClick={waCart} style={{width:"100%",background:"#25d366",color:"#fff",border:"none",borderRadius:12,padding:"14px 0",fontWeight:700,cursor:"pointer",fontSize:15,marginBottom:10}}>💬 Order via WhatsApp</button>
              <button onClick={()=>{setCart([]);toast_("Cart cleared");}} style={{width:"100%",background:"#f3f3f3",color:"#666",border:"none",borderRadius:12,padding:"12px 0",fontWeight:700,cursor:"pointer",fontSize:14}}>Clear Cart</button>
            </div>
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );

  // ════ ABOUT ════
  if(page==="about") return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:"#f8f8f8",minHeight:"100vh"}}>
      {toast&&<Toast msg={toast}/>}<Header/>
      <div style={{maxWidth:900,margin:"0 auto",padding:"48px 24px"}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <img src={LOGO_URL} alt="logo" style={{width:90,height:90,borderRadius:"50%",objectFit:"cover",border:"3px solid #dc2626",margin:"0 auto 16px",display:"block"}} onError={e=>e.target.style.display="none"}/>
          <h1 style={{fontSize:34,fontWeight:800,marginBottom:8}}>{APP_NAME}</h1>
          <div style={{fontSize:16,color:"#888"}}>{TAGLINE}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginBottom:40}}>
          {[["🚗","Total Listings",cars.length],["✅","In Stock",cars.filter(c=>c.stock==="In Stock").length],["🌟","Super THs",cars.filter(c=>c.categoryId==="sth").length],["💎","Exclusives",cars.filter(c=>c.categoryId==="rlc").length]].map(([icon,label,val])=>(
            <div key={label} style={{background:"#fff",borderRadius:16,padding:"24px",textAlign:"center"}}>
              <div style={{fontSize:30,marginBottom:8}}>{icon}</div>
              <div style={{fontWeight:800,fontSize:28,color:"#dc2626"}}>{val}</div>
              <div style={{fontSize:13,color:"#888"}}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{background:"#fff",borderRadius:16,padding:"28px",marginBottom:20}}>
          <h2 style={{fontSize:20,fontWeight:700,marginBottom:12}}>Our Story</h2>
          <p style={{fontSize:15,color:"#555",lineHeight:1.9}}>Passionate Hot Wheels collector and seller based in Ahmedabad, Gujarat. We specialize in Mainlines, Premium, Car Culture, and Super Treasure Hunts. Every car is 100% authentic Mattel and shipped with care across India.</p>
          <p style={{fontSize:14,color:"#888",lineHeight:1.8,marginTop:10,padding:"12px 16px",background:"#fff8f3",borderRadius:10,borderLeft:"3px solid #e67e00"}}>We are a <b style={{color:"#e67e00"}}>hobby shop</b> — we curate and sell rare, limited, and premium Hot Wheels that are typically hard to find at retail. Please note that our prices may be above MRP, reflecting the rarity, demand, and effort that goes into sourcing these collectibles.</p>
          <p style={{fontSize:15,color:"#111",fontWeight:700,marginTop:16,marginBottom:8}}>Why Choose Us?</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {["✅ Ships across India via Speed Post & Courier","✅ 100% authentic Mattel products","✅ Secure bubble-wrapped packaging","✅ DM for bulk orders & special requests"].map(l=>(
              <div key={l} style={{background:"#f0fdf4",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#166534",fontWeight:500}}>{l}</div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
          <button onClick={()=>window.open(INSTAGRAM_URL,"_blank")} style={{flex:1,minWidth:200,background:"linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",color:"#fff",border:"none",borderRadius:12,padding:"14px 0",fontWeight:700,cursor:"pointer",fontSize:15}}>📸 Follow on Instagram</button>
          <button onClick={()=>window.open(WA_COMMUNITY,"_blank")} style={{flex:1,minWidth:200,background:"#25d366",color:"#fff",border:"none",borderRadius:12,padding:"14px 0",fontWeight:700,cursor:"pointer",fontSize:15}}>💬 Join WhatsApp Community</button>
        </div>
      </div>
      <Footer/>
    </div>
  );

  // ════ CONTACT ════
  if(page==="contact") return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:"#f8f8f8",minHeight:"100vh"}}>
      {toast&&<Toast msg={toast}/>}<Header/>
      <div style={{maxWidth:700,margin:"0 auto",padding:"48px 24px"}}>
        <h1 style={{fontSize:30,fontWeight:800,marginBottom:8}}>Contact Us</h1>
        <p style={{color:"#888",marginBottom:28}}>We're always happy to help with orders, queries, or bulk requests.</p>
        <div style={{background:"#fff",borderRadius:16,overflow:"hidden",marginBottom:20}}>
          {[["📍","Location","Ahmedabad, Gujarat, India"],["📱","WhatsApp","+91-"+WHATSAPP_NUMBER.slice(2)],["📸","Instagram",INSTAGRAM_HANDLE],["🕐","Hours","Mon–Sat · 10am–8pm"]].map(([icon,label,val])=>(
            <div key={label} style={{display:"flex",gap:16,alignItems:"center",padding:"18px 20px",borderBottom:"1px solid #f3f3f3"}}>
              <span style={{fontSize:24,width:36,textAlign:"center"}}>{icon}</span>
              <div>
                <div style={{fontSize:11,color:"#aaa",fontWeight:600}}>{label}</div>
                <div style={{fontWeight:600,fontSize:15}}>{val}</div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={()=>window.open(`https://wa.me/${WHATSAPP_NUMBER}`,"_blank")} style={{width:"100%",background:"#25d366",color:"#fff",border:"none",borderRadius:12,padding:"15px 0",fontWeight:700,cursor:"pointer",fontSize:16}}>💬 Chat on WhatsApp Now</button>
      </div>
      <Footer/>
    </div>
  );

  // ════ POLICIES ════
  if(page==="policies") return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:"#f8f8f8",minHeight:"100vh"}}>
      {toast&&<Toast msg={toast}/>}<Header/>
      <div style={{maxWidth:800,margin:"0 auto",padding:"48px 24px"}}>
        <h1 style={{fontSize:30,fontWeight:800,marginBottom:6}}>Policies & Returns</h1>
        <p style={{color:"#888",fontSize:14,marginBottom:36}}>Please read our policies carefully before placing an order.</p>
        {[
          {icon:"❌",title:"Cancellation Policy",color:"#dc2626",bg:"#fee2e2",body:["Orders can be cancelled only before the item has been shipped. Once the shipment is dispatched and a tracking ID has been shared with you, the order cannot be cancelled under any circumstances.","To request a cancellation, contact us immediately via WhatsApp. Once confirmed, any advance payment made will be refunded within 3–5 business days."],note:{bg:"#fff8f3",border:"#e67e00",col:"#92400e",text:"⚠️ No cancellations will be accepted after shipping."}},
          {icon:"🔄",title:"Returns Policy",color:"#0369a1",bg:"#dbeafe",body:["Returns are accepted only in the case of a damaged or incorrect item being delivered. You must contact us within 48 hours of delivery with unboxing video proof.","Items must be in original condition. A replacement or store credit will be issued. We do not offer cash refunds for change-of-mind returns."],note:{bg:"#f0fdf4",border:"#166534",col:"#166534",text:"✅ Returns accepted only for damaged or wrong items within 48 hours with video proof."}},
          {icon:"💳",title:"Payment Policy",color:"#166534",bg:"#dcfce7",body:["All payments are processed strictly via online modes only — UPI, bank transfer, and other digital methods. Cash on Delivery and cash payments are not accepted under any circumstances.","Full payment must be made before dispatch. Please save your UTR / transaction ID and share it on WhatsApp for faster order confirmation."],note:{bg:"#f0fdf4",border:"#166534",col:"#166534",text:"💳 Online payments only — UPI / Bank Transfer. No cash accepted."}}
        ].map(({icon,title,color,bg,body,note})=>(
          <div key={title} style={{background:"#fff",borderRadius:16,padding:"28px",marginBottom:20,boxShadow:"0 1px 6px #0001"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
              <div style={{width:44,height:44,borderRadius:12,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{icon}</div>
              <h2 style={{fontSize:20,fontWeight:800,margin:0,color}}>{title}</h2>
            </div>
            {body.map((p,i)=><p key={i} style={{fontSize:14,color:"#555",lineHeight:1.9,marginBottom:i<body.length-1?12:0}}>{p}</p>)}
            <div style={{marginTop:16,background:note.bg,borderRadius:10,padding:"12px 16px",borderLeft:`3px solid ${note.border}`,fontSize:13,color:note.col,fontWeight:500}}>{note.text}</div>
          </div>
        ))}
        <div style={{background:"#111",borderRadius:16,padding:"20px 24px",textAlign:"center"}}>
          <div style={{color:"#fff",fontWeight:700,fontSize:15,marginBottom:6}}>Have questions about our policies?</div>
          <div style={{color:"#aaa",fontSize:13,marginBottom:14}}>We're happy to clarify anything before you place your order.</div>
          <button onClick={()=>window.open(`https://wa.me/${WHATSAPP_NUMBER}`,"_blank")} style={{background:"#25d366",color:"#fff",border:"none",borderRadius:10,padding:"11px 24px",fontWeight:700,cursor:"pointer",fontSize:14}}>💬 Chat with Us</button>
        </div>
      </div>
      <Footer/>
    </div>
  );

  // ════ LOGIN / OTP ════
  if(page==="login"||page==="otp") return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:"#f8f8f8",minHeight:"100vh"}}>
      {toast&&<Toast msg={toast}/>}<Header/>
      <div style={{maxWidth:440,margin:"60px auto",padding:"0 24px"}}>
        <div style={{background:"#fff",borderRadius:20,padding:"32px",boxShadow:"0 4px 24px #0001"}}>
          <div style={{textAlign:"center",marginBottom:24}}>
            <img src={LOGO_URL} alt="logo" style={{width:60,height:60,borderRadius:"50%",objectFit:"cover",border:"2px solid #dc2626",margin:"0 auto 12px",display:"block"}} onError={e=>e.target.style.display="none"}/>
            <div style={{fontWeight:800,fontSize:20}}>{page==="otp"?(pwStep?"Admin Password":"Verify OTP"):authMode==="login"?"Welcome Back":"Create Account"}</div>
          </div>
          {page==="login"&&(
            <>
              <div style={{display:"flex",background:"#f3f3f3",borderRadius:12,padding:4,marginBottom:20}}>
                {["login","register"].map(m=>(
                  <button key={m} onClick={()=>{setAuthMode(m);setAuthErr("");}} style={{flex:1,background:authMode===m?"#dc2626":"transparent",color:authMode===m?"#fff":"#888",border:"none",borderRadius:9,padding:"10px 0",fontWeight:700,cursor:"pointer",fontSize:14}}>
                    {m==="login"?"Login":"Register"}
                  </button>
                ))}
              </div>
              {authMode==="register"&&<div style={{marginBottom:14}}><label style={lbl}>Full Name</label><input value={authName} onChange={e=>setAuthName(e.target.value)} placeholder="Your name" style={inp}/></div>}
              <div style={{marginBottom:14}}>
                <label style={lbl}>Mobile Number</label>
                <div style={{display:"flex",gap:8}}>
                  <div style={{background:"#f3f3f3",borderRadius:12,padding:"12px",fontWeight:600,fontSize:14,color:"#555"}}>🇮🇳 +91</div>
                  <input value={authPhone} onChange={e=>setAuthPhone(e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="10-digit number" style={{...inp,flex:1}} type="tel" maxLength={10}/>
                </div>
              </div>
              {authErr&&<div style={{color:"#dc2626",fontSize:13,marginBottom:10,background:"#fee2e2",borderRadius:8,padding:"8px 12px"}}>{authErr}</div>}
              <button onClick={sendOtp} style={btn("linear-gradient(135deg,#dc2626,#7c3aed)","#fff")}>{authMode==="login"?"Send OTP":"Register & Send OTP"}</button>
              <div style={{textAlign:"center",fontSize:12,color:"#bbb"}}>Admin? Enter the admin number to get admin access.</div>
            </>
          )}
          {page==="otp"&&!pwStep&&(
            <>
              <div style={{textAlign:"center",marginBottom:20,color:"#888",fontSize:14}}>OTP sent to +91-{authPhone}</div>
              <label style={lbl}>6-Digit OTP</label>
              <input value={authOtp} onChange={e=>setAuthOtp(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="Enter OTP" style={{...inp,textAlign:"center",fontSize:22,letterSpacing:10,fontWeight:700,marginBottom:12}} type="tel" maxLength={6}/>
              {authErr&&<div style={{color:"#dc2626",fontSize:13,marginBottom:10,background:"#fee2e2",borderRadius:8,padding:"8px 12px"}}>{authErr}</div>}
              <button onClick={verifyOtp} disabled={authOtp.length!==6} style={btn(authOtp.length===6?"linear-gradient(135deg,#dc2626,#7c3aed)":"#e0e0e0",authOtp.length===6?"#fff":"#aaa")}>Verify OTP</button>
              <div style={{textAlign:"center"}}>{otpTimer>0?<span style={{fontSize:13,color:"#888"}}>Resend in {otpTimer}s</span>:<button onClick={()=>{setPage("login");setAuthOtp("");setAuthErr("");}} style={{background:"none",border:"none",color:"#dc2626",fontWeight:700,cursor:"pointer",fontSize:13}}>← Change number</button>}</div>
            </>
          )}
          {page==="otp"&&pwStep&&(
            <>
              <div style={{textAlign:"center",marginBottom:20}}><div style={{fontSize:32,marginBottom:8}}>🔐</div><div style={{color:"#888",fontSize:14}}>OTP verified! Enter admin password.</div></div>
              <label style={lbl}>Admin Password</label>
              <input type="password" value={adminPw} onChange={e=>{setAdminPw(e.target.value);setAdminPwErr(false);}} placeholder="Enter admin password" style={{...inp,marginBottom:12}} onKeyDown={e=>e.key==="Enter"&&verifyAdminPassword()}/>
              {adminPwErr&&<div style={{color:"#dc2626",fontSize:13,marginBottom:10,background:"#fee2e2",borderRadius:8,padding:"8px 12px"}}>Incorrect password.</div>}
              <button onClick={verifyAdminPassword} style={btn("linear-gradient(135deg,#dc2626,#7c3aed)","#fff")}>🔓 Enter Admin Panel</button>
            </>
          )}
        </div>
      </div>
      <Footer/>
    </div>
  );

  // ════ PROFILE ════
  if(page==="profile") return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:"#f8f8f8",minHeight:"100vh"}}>
      {toast&&<Toast msg={toast}/>}<Header/>
      <div style={{maxWidth:800,margin:"0 auto",padding:"32px 24px"}}>
        <div style={{background:"#fff",borderRadius:16,padding:"28px",marginBottom:20,display:"flex",gap:20,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#dc2626,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,color:"#fff",fontWeight:800,flexShrink:0}}>{curUser?.name?.[0]?.toUpperCase()||"?"}</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,fontSize:20}}>{curUser?.name}</div>
            <div style={{color:"#888",fontSize:14}}>+91-{curUser?.phone} · Member since {curUser?.joinedAt}</div>
          </div>
          <button onClick={logout} style={{background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:10,padding:"10px 20px",fontWeight:700,cursor:"pointer",fontSize:14}}>Logout</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
          {[["🛒","Cart",cartCount],["❤️","Wishlist",wish.length],["📦","Orders",orders.filter(o=>o.phone===curUser?.phone).length]].map(([icon,label,val])=>(
            <div key={label} style={{background:"#fff",borderRadius:14,padding:"20px",textAlign:"center"}}>
              <div style={{fontSize:24}}>{icon}</div>
              <div style={{fontWeight:800,fontSize:24,color:"#dc2626"}}>{val}</div>
              <div style={{fontSize:12,color:"#888"}}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{background:"#fff",borderRadius:16,padding:"20px"}}>
          <div style={{fontWeight:700,fontSize:16,marginBottom:14}}>📦 Past Orders</div>
          {orders.filter(o=>o.phone===curUser?.phone).length===0
            ?<div style={{textAlign:"center",color:"#ccc",padding:"20px",fontSize:14}}>No orders yet</div>
            :orders.filter(o=>o.phone===curUser?.phone).map(o=>(
              <div key={o.id} style={{background:"#f8f8f8",borderRadius:12,padding:"14px",marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontSize:13,color:"#888"}}>{o.date}</span>
                  <span style={{fontSize:11,background:"#dcfce7",color:"#166534",borderRadius:20,padding:"2px 10px",fontWeight:600}}>{o.status}</span>
                </div>
                {o.items.map((it,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:14,color:"#444",marginBottom:3}}>
                    <span>• {it.name} ×{it.qty}</span>
                    <span style={{fontWeight:600}}>₹{(it.price*it.qty).toLocaleString("en-IN")}</span>
                  </div>
                ))}
                <div style={{borderTop:"1px dashed #e0e0e0",marginTop:8,paddingTop:8,display:"flex",justifyContent:"space-between",fontWeight:700,fontSize:14}}>
                  <span>Total</span><span style={{color:"#dc2626"}}>₹{o.total.toLocaleString("en-IN")}</span>
                </div>
              </div>
            ))
          }
        </div>
      </div>
      <Footer/>
    </div>
  );

  // ════ ADMIN DASHBOARD ════
  if(page==="admin"&&adminOk) return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:"#f2f2f7",minHeight:"100vh"}}>
      {toast&&<Toast msg={toast}/>}<Header/>
      <div style={{maxWidth:900,margin:"0 auto",padding:"28px 20px"}}>
        <h1 style={{fontSize:26,fontWeight:800,marginBottom:24}}>⚙️ Admin Dashboard</h1>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:28}}>
          {[["🚗","Total Cars",cars.length],["✅","In Stock",cars.filter(c=>c.stock==="In Stock").length],["🗂️","Categories",categories.length]].map(([icon,label,val])=>(
            <div key={label} style={{background:"#fff",borderRadius:14,padding:"18px",textAlign:"center",boxShadow:"0 1px 6px #0001"}}>
              <div style={{fontSize:26}}>{icon}</div>
              <div style={{fontWeight:800,fontSize:26,color:"#dc2626"}}>{val}</div>
              <div style={{fontSize:12,color:"#888"}}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:28}}>
          {[
            {label:"Manage Cars",icon:"🚗",sub:cars.length+" cars",bg:"linear-gradient(135deg,#dc2626,#be123c)",target:"admin_cars"},
            {label:"Manage Categories",icon:"🗂️",sub:categories.length+" categories",bg:"linear-gradient(135deg,#7c3aed,#6d28d9)",target:"admin_cats"},
            {label:"Manage Tags",icon:"🏷️",sub:allTags.length+" tags",bg:"linear-gradient(135deg,#0891b2,#0369a1)",target:"admin_tags"},
          ].map(({label,icon,sub,bg,target})=>(
            <button key={target} onClick={()=>nav(target)} style={{background:bg,color:"#fff",border:"none",borderRadius:14,padding:"22px",cursor:"pointer",textAlign:"left"}}>
              <div style={{fontSize:30,marginBottom:8}}>{icon}</div>
              <div style={{fontWeight:700,fontSize:16}}>{label}</div>
              <div style={{fontSize:12,opacity:0.8,marginTop:4}}>{sub}</div>
            </button>
          ))}
        </div>
        <div style={{background:"#fff",borderRadius:16,padding:"20px",boxShadow:"0 1px 6px #0001"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:15}}>Recent Cars</div>
            <button onClick={()=>nav("admin_cars")} style={{background:"none",border:"none",color:"#dc2626",fontWeight:600,cursor:"pointer",fontSize:13}}>View All →</button>
          </div>
          {cars.length===0?<div style={{textAlign:"center",color:"#ccc",padding:"20px 0",fontSize:14}}>No cars yet.</div>
          :cars.slice(-5).reverse().map((car,i)=>{
            const cat=categories.find(c=>c.id===car.categoryId)||{label:"Other",color:"#6b7280",icon:"📦"};
            const st=SS[car.stock]||SS["In Stock"];
            return(
              <div key={car.id} style={{display:"flex",gap:12,alignItems:"center",padding:"10px 0",borderBottom:i<Math.min(cars.length,5)-1?"1px solid #f3f3f3":"none"}}>
                <div style={{width:52,height:42,borderRadius:8,background:"#f3f3f3",overflow:"hidden",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {(car.images||[]).length>0?<img src={car.images[0]} alt={car.name} style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<span style={{fontSize:20}}>🚗</span>}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:13}}>{car.name}</div>
                  <div style={{display:"flex",gap:4,marginTop:2}}>
                    <Pill label={cat.icon+" "+cat.label} bg={cat.color+"22"} col={cat.color}/>
                    <Pill label={car.stock} bg={st.bg} col={st.c}/>
                  </div>
                </div>
                <div style={{fontWeight:700,color:"#dc2626",fontSize:14}}>₹{Number(car.price).toLocaleString("en-IN")}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ════ ADMIN CARS ════
  if(page==="admin_cars"&&adminOk) return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:"#f2f2f7",minHeight:"100vh"}}>
      {toast&&<Toast msg={toast}/>}<Header/>
      <div style={{maxWidth:900,margin:"0 auto",padding:"28px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <button onClick={()=>nav("admin")} style={{background:"none",border:"none",color:"#dc2626",fontWeight:700,fontSize:13,cursor:"pointer",padding:0,marginBottom:4}}>← Dashboard</button>
            <h1 style={{fontSize:24,fontWeight:800,margin:0}}>🚗 Manage Cars ({cars.length})</h1>
          </div>
          <button onClick={()=>openCarForm(null)} style={{background:"#dc2626",color:"#fff",border:"none",borderRadius:12,padding:"12px 22px",fontWeight:700,cursor:"pointer",fontSize:14}}>+ Add Car</button>
        </div>
        {cars.length===0?<div style={{textAlign:"center",color:"#ccc",padding:"60px 0",fontSize:16}}>No cars yet!</div>
        :cars.map((car,i)=>{
          const cat=categories.find(c=>c.id===car.categoryId)||{label:"Other",color:"#6b7280",icon:"📦"};
          const st=SS[car.stock]||SS["In Stock"];
          return(
            <div key={car.id} style={{background:"#fff",borderRadius:14,padding:"14px 16px",marginBottom:10,display:"flex",gap:14,alignItems:"center",boxShadow:"0 1px 4px #0001"}}>
              <div style={{width:70,height:54,borderRadius:10,background:"#f3f3f3",overflow:"hidden",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {(car.images||[]).length>0?<img src={car.images[0]} alt={car.name} style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<span style={{fontSize:26}}>🚗</span>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>{car.name}{car.tags?.includes("Hot Pick")?" 🔥":""}{car.tags?.includes("New Arrival")?" ✨":""}</div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  <Pill label={cat.icon+" "+cat.label} bg={cat.color+"22"} col={cat.color}/>
                  <Pill label={car.stock} bg={st.bg} col={st.c}/>
                </div>
              </div>
              <div style={{fontWeight:800,color:"#dc2626",fontSize:15,marginRight:8,flexShrink:0}}>₹{Number(car.price).toLocaleString("en-IN")}</div>
              <div style={{display:"flex",gap:8,flexShrink:0}}>
                {/* Quick stock toggle */}
                <button onClick={()=>{
                  const next = car.stock==="Sold Out" ? "In Stock" : "Sold Out";
                  setCars(c=>c.map(x=>x.id===car.id?{...x,stock:next}:x));
                  toast_(car.stock==="Sold Out"?"Marked as In Stock ✅":"Marked as Sold Out 🚫");
                }} style={{background:car.stock==="Sold Out"?"#dcfce7":"#fee2e2",color:car.stock==="Sold Out"?"#166534":"#991b1b",border:`1px solid ${car.stock==="Sold Out"?"#86efac":"#fca5a5"}`,borderRadius:8,padding:"7px 12px",cursor:"pointer",fontSize:12,fontWeight:600,whiteSpace:"nowrap"}}>
                  {car.stock==="Sold Out"?"✅ Mark In Stock":"🚫 Mark Sold Out"}
                </button>
                <button onClick={()=>openCarForm(car)} style={{background:"#fffbeb",color:"#92400e",border:"1px solid #fcd34d",borderRadius:8,padding:"7px 16px",cursor:"pointer",fontSize:13,fontWeight:600}}>Edit</button>
                <button onClick={()=>deleteCar(car.id)} style={{background:"#fef2f2",color:"#991b1b",border:"1px solid #fca5a5",borderRadius:8,padding:"7px 16px",cursor:"pointer",fontSize:13,fontWeight:600}}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ════ ADMIN CAR FORM ════
  if(page==="admin_car_form"&&adminOk) return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:"#f2f2f7",minHeight:"100vh"}}>
      {toast&&<Toast msg={toast}/>}<Header/>
      <div style={{maxWidth:680,margin:"0 auto",padding:"28px 20px"}}>
        <button onClick={()=>nav("admin_cars")} style={{background:"none",border:"none",color:"#dc2626",fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:16,padding:0}}>← Back to Cars</button>
        <div style={{background:"#fff",borderRadius:16,padding:"24px",boxShadow:"0 1px 6px #0001"}}>
          <h2 style={{fontSize:20,fontWeight:800,marginBottom:20}}>{editCarId?"Edit Car":"Add New Car"}</h2>
          <div style={{marginBottom:18}}>
            <label style={lbl}>Car Photos (up to 5) <span style={{color:"#aaa",fontWeight:400}}>— first = main display</span></label>
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{if(e.target.files[0]){await handleImg(e.target.files[0]);e.target.value="";}}}/>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:8}}>
              {(carForm.images||[]).map((img,i)=>(
                <div key={i} style={{position:"relative",width:90,height:72,borderRadius:10,overflow:"hidden",background:"#f3f3f3",border:"2px solid #e0e0e0"}}>
                  <img src={img} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}}/>
                  <button onClick={()=>setCarForm(f=>({...f,images:(f.images||[]).filter((_,j)=>j!==i)}))} style={{position:"absolute",top:3,right:3,background:"rgba(0,0,0,0.65)",color:"#fff",border:"none",borderRadius:"50%",width:20,height:20,cursor:"pointer",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                  {i===0&&<div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(220,38,38,0.85)",color:"#fff",fontSize:9,textAlign:"center",fontWeight:700,padding:"2px 0"}}>MAIN</div>}
                </div>
              ))}
              {(carForm.images||[]).length<5&&(
                <button onClick={()=>fileRef.current.click()} style={{width:90,height:72,border:"2px dashed #dc2626",borderRadius:10,background:"#fff8f8",cursor:"pointer",color:"#dc2626",fontWeight:700,fontSize:22,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:2}}>
                  <span>{imgLoading?"⏳":"+"}</span><span style={{fontSize:9,fontWeight:600}}>Upload</span>
                </button>
              )}
            </div>
          </div>
          <div style={{marginBottom:14}}><label style={lbl}>Car Name *</label><input value={carForm.name} onChange={e=>setCarForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Bone Shaker" style={inp}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <div><label style={lbl}>Year</label><input type="number" value={carForm.year} onChange={e=>setCarForm(f=>({...f,year:e.target.value}))} style={inp}/></div>
            <div><label style={lbl}>Price ₹ *</label><input type="number" value={carForm.price} onChange={e=>setCarForm(f=>({...f,price:e.target.value}))} placeholder="e.g. 150" style={inp}/></div>
          </div>
          <div style={{marginBottom:14}}>
            <label style={lbl}>Category</label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8}}>
              {categories.map(cat=>(
                <button key={cat.id} onClick={()=>setCarForm(f=>({...f,categoryId:cat.id}))}
                  style={{background:carForm.categoryId===cat.id?cat.color:"#f8f8f8",color:carForm.categoryId===cat.id?"#fff":cat.color,border:`1.5px solid ${cat.color}55`,borderRadius:10,padding:"9px 8px",cursor:"pointer",fontWeight:600,fontSize:12,display:"flex",alignItems:"center",gap:6}}>
                  <span>{cat.icon}</span>{cat.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <label style={lbl}>Availability</label>
            <div style={{display:"flex",gap:10}}>
              {STOCK_OPTIONS.map(s=>{const st=SS[s];const active=carForm.stock===s;return(
                <button key={s} onClick={()=>setCarForm(f=>({...f,stock:s}))} style={{flex:1,background:active?st.c:"#f8f8f8",color:active?"#fff":st.c,border:`1.5px solid ${st.c}55`,borderRadius:10,padding:"11px 0",cursor:"pointer",fontWeight:600,fontSize:13}}>{s}</button>
              );})}
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <label style={lbl}>Tags</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {allTags.map(tag=>{const active=(carForm.tags||[]).includes(tag);return(
                <button key={tag} onClick={()=>toggleTag(tag)} style={{background:active?"#dc2626":"#f3f3f3",color:active?"#fff":"#555",border:"none",borderRadius:20,padding:"6px 14px",cursor:"pointer",fontWeight:600,fontSize:12}}>{tag}</button>
              );})}
            </div>
          </div>
          <div style={{marginBottom:20}}><label style={lbl}>Description</label><textarea value={carForm.desc} onChange={e=>setCarForm(f=>({...f,desc:e.target.value}))} rows={3} placeholder="Condition, special features..." style={{...inp,resize:"vertical"}}/></div>
          <button onClick={saveCar} style={btn("linear-gradient(135deg,#dc2626,#7c3aed)","#fff")}>💾 Save Car</button>
          <button onClick={()=>nav("admin_cars")} style={btn("#f3f3f3","#666",0)}>Cancel</button>
        </div>
      </div>
    </div>
  );

  // ════ ADMIN CATEGORIES ════
  if(page==="admin_cats"&&adminOk) return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:"#f2f2f7",minHeight:"100vh"}}>
      {toast&&<Toast msg={toast}/>}<Header/>
      <div style={{maxWidth:700,margin:"0 auto",padding:"28px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <button onClick={()=>nav("admin")} style={{background:"none",border:"none",color:"#dc2626",fontWeight:700,fontSize:13,cursor:"pointer",padding:0,marginBottom:4}}>← Dashboard</button>
            <h1 style={{fontSize:24,fontWeight:800,margin:0}}>🗂️ Manage Categories</h1>
          </div>
          <button onClick={()=>openCatForm(null)} style={{background:"#7c3aed",color:"#fff",border:"none",borderRadius:12,padding:"12px 22px",fontWeight:700,cursor:"pointer",fontSize:14}}>+ Add</button>
        </div>
        {categories.map(cat=>(
          <div key={cat.id} style={{background:"#fff",borderRadius:14,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:14,boxShadow:"0 1px 4px #0001"}}>
            <div style={{width:48,height:48,borderRadius:12,background:cat.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{cat.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:15,color:cat.color}}>{cat.label}</div>
              <div style={{fontSize:12,color:"#aaa",marginTop:2}}>{cars.filter(c=>c.categoryId===cat.id).length} cars</div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>openCatForm(cat)} style={{background:"#fffbeb",color:"#92400e",border:"1px solid #fcd34d",borderRadius:8,padding:"7px 16px",cursor:"pointer",fontSize:13,fontWeight:600}}>Edit</button>
              <button onClick={()=>deleteCat(cat.id)} style={{background:"#fef2f2",color:"#991b1b",border:"1px solid #fca5a5",borderRadius:8,padding:"7px 16px",cursor:"pointer",fontSize:13,fontWeight:600}}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ════ ADMIN CATEGORY FORM ════
  if(page==="admin_cat_form"&&adminOk) return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:"#f2f2f7",minHeight:"100vh"}}>
      {toast&&<Toast msg={toast}/>}<Header/>
      <div style={{maxWidth:500,margin:"0 auto",padding:"28px 20px"}}>
        <button onClick={()=>nav("admin_cats")} style={{background:"none",border:"none",color:"#dc2626",fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:16,padding:0}}>← Back</button>
        <div style={{background:"#fff",borderRadius:16,padding:"24px",boxShadow:"0 1px 6px #0001"}}>
          <h2 style={{fontSize:20,fontWeight:800,marginBottom:20}}>{editCatId?"Edit Category":"Add Category"}</h2>
          <div style={{textAlign:"center",marginBottom:20,padding:"16px",background:"#f8f8f8",borderRadius:12}}>
            <div style={{width:60,height:60,borderRadius:16,background:catForm.color+"22",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:28,border:`2px solid ${catForm.color}44`,marginBottom:8}}>{catForm.icon}</div>
            <div style={{fontWeight:700,fontSize:16,color:catForm.color}}>{catForm.label||"Preview"}</div>
          </div>
          <div style={{marginBottom:16}}><label style={lbl}>Category Name *</label><input value={catForm.label} onChange={e=>setCatForm(f=>({...f,label:e.target.value}))} placeholder="e.g. Muscle Cars" style={inp}/></div>
          <div style={{marginBottom:16}}>
            <label style={lbl}>Icon</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {ICON_OPTIONS.map(ic=>(
                <button key={ic} onClick={()=>setCatForm(f=>({...f,icon:ic}))} style={{width:42,height:42,fontSize:20,borderRadius:10,border:`2px solid ${catForm.icon===ic?catForm.color:"#e0e0e0"}`,background:catForm.icon===ic?catForm.color+"22":"#fff",cursor:"pointer"}}>{ic}</button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:24}}>
            <label style={lbl}>Color</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {COLOR_OPTIONS.map(col=>(
                <button key={col} onClick={()=>setCatForm(f=>({...f,color:col}))} style={{width:34,height:34,borderRadius:"50%",background:col,border:catForm.color===col?"3px solid #111":"3px solid transparent",cursor:"pointer"}}/>
              ))}
            </div>
          </div>
          <button onClick={saveCat} style={btn("linear-gradient(135deg,#7c3aed,#6d28d9)","#fff")}>💾 Save Category</button>
          <button onClick={()=>nav("admin_cats")} style={btn("#f3f3f3","#666",0)}>Cancel</button>
        </div>
      </div>
    </div>
  );

  // ════ ADMIN TAGS ════
  if(page==="admin_tags") return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:"#f2f2f7",minHeight:"100vh"}}>
      {toast&&<Toast msg={toast}/>}<Header/>
      <div style={{maxWidth:700,margin:"0 auto",padding:"28px 20px"}}>
        <button onClick={()=>nav("admin")} style={{background:"none",border:"none",color:"#dc2626",fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:8,padding:0}}>← Dashboard</button>
        <h1 style={{fontSize:24,fontWeight:800,marginBottom:6}}>🏷️ Manage Tags ({allTags.length})</h1>
        <p style={{color:"#888",fontSize:13,marginBottom:20}}>Add, edit or delete tags. Changes reflect on all car listings.</p>
        <div style={{background:"#fff",borderRadius:16,padding:"20px",marginBottom:16,boxShadow:"0 1px 4px #0001"}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:12}}>➕ Add New Tag</div>
          <div style={{display:"flex",gap:10}}>
            <input value={tagInput} onChange={e=>setTagInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"){const t=tagInput.trim();if(!t)return;if(allTags.includes(t)){toast_("Already exists");return;}setAllTags(p=>[...p,t]);setTagInput("");toast_("Tag added ✅");}}}
              placeholder="Type tag name and press Enter..." style={{flex:1,padding:"11px 14px",borderRadius:12,border:"1.5px solid #e0e0e0",fontSize:14,outline:"none"}}/>
            <button onClick={()=>{const t=tagInput.trim();if(!t){toast_("Enter tag name");return;}if(allTags.includes(t)){toast_("Already exists");return;}setAllTags(p=>[...p,t]);setTagInput("");toast_("Tag added ✅");}}
              style={{background:"#0891b2",color:"#fff",border:"none",borderRadius:12,padding:"11px 22px",fontWeight:700,cursor:"pointer",fontSize:14,whiteSpace:"nowrap"}}>+ Add</button>
          </div>
        </div>
        <div style={{background:"#fff",borderRadius:16,overflow:"hidden",boxShadow:"0 1px 4px #0001"}}>
          {allTags.length===0&&<div style={{textAlign:"center",padding:"30px",color:"#ccc",fontSize:14}}>No tags yet.</div>}
          {allTags.map((tag,i)=>{
            const count=cars.filter(c=>(c.tags||[]).includes(tag)).length;
            const isEditing=editTagIdx===i;
            return(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderBottom:i<allTags.length-1?"1px solid #f3f3f3":"none",background:isEditing?"#f0f9ff":"#fff"}}>
                <div style={{flex:1}}>
                  {isEditing ? (
                    <input autoFocus value={editTagVal} onChange={e=>setEditTagVal(e.target.value)}
                      onKeyDown={e=>{
                        if(e.key==="Enter"){const v=editTagVal.trim();if(!v)return;setAllTags(p=>p.map((x,j)=>j===i?v:x));setCars(p=>p.map(c=>({...c,tags:(c.tags||[]).map(t=>t===tag?v:t)})));setEditTagIdx(null);toast_("Updated ✅");}
                        if(e.key==="Escape")setEditTagIdx(null);
                      }}
                      style={{width:"100%",padding:"8px 12px",borderRadius:10,border:"1.5px solid #0891b2",fontSize:14,outline:"none"}}/>
                  ) : (
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{background:"#f0f9ff",color:"#0369a1",fontSize:12,padding:"4px 12px",borderRadius:20,fontWeight:600}}>🏷️ {tag}</span>
                      <span style={{fontSize:11,color:"#aaa"}}>{count} car{count!==1?"s":""}</span>
                    </div>
                  )}
                </div>
                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  {isEditing ? (
                    <>
                      <button onClick={()=>{const v=editTagVal.trim();if(!v)return;setAllTags(p=>p.map((x,j)=>j===i?v:x));setCars(p=>p.map(c=>({...c,tags:(c.tags||[]).map(t=>t===tag?v:t)})));setEditTagIdx(null);toast_("Updated ✅");}}
                        style={{background:"#dcfce7",color:"#166534",border:"1px solid #86efac",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:600}}>Save</button>
                      <button onClick={()=>setEditTagIdx(null)} style={{background:"#f3f3f3",color:"#666",border:"1px solid #e0e0e0",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12,fontWeight:600}}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={()=>{setEditTagIdx(i);setEditTagVal(tag);}} style={{background:"#fffbeb",color:"#92400e",border:"1px solid #fcd34d",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:600}}>Edit</button>
                      <button onClick={()=>{if(window.confirm(`Delete "${tag}"?`)){setAllTags(p=>p.filter((_,j)=>j!==i));setCars(p=>p.map(c=>({...c,tags:(c.tags||[]).filter(t=>t!==tag)})));toast_("Deleted");}}}
                        style={{background:"#fef2f2",color:"#991b1b",border:"1px solid #fca5a5",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:600}}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return null;
}

function DetailView({sel,wish,categories,SS,onCart,onWish,onWa,onShare}){
  const imgs=(sel.images||[]).filter(Boolean);
  const [activeImg,setActiveImg]=useState(imgs.length>0?imgs[0]:null);
  const PHD=["c0392b","d35400","8e44ad","2471a3","1a5276","943126","784212","1f618d"];
  const phD=(n,i=0)=>`https://placehold.co/500x340/${PHD[i%PHD.length]}/fff?text=${encodeURIComponent((n||"Car").slice(0,13))}`;
  const cat=categories.find(c=>c.id===sel.categoryId)||{label:"Other",color:"#6b7280",icon:"📦"};
  const st=SS[sel.stock]||SS["In Stock"];
  const wished=wish.includes(sel.id);
  const isHot=sel.tags?.includes("Hot Pick");
  const isNew=sel.tags?.includes("New Arrival");
  const displayImg=activeImg||phD(sel.name,0);
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 400px",gap:36,alignItems:"start"}}>
      <div>
        <div style={{background:"#f3f3f3",borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",minHeight:320,marginBottom:12}}>
          <img src={displayImg} alt={sel.name} style={{width:"100%",maxHeight:500,objectFit:"contain"}} onError={e=>e.target.src=phD(sel.name,0)}/>
        </div>
        {imgs.length>1&&(
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:8}}>
            {imgs.map((img,i)=>(
              <div key={i} onClick={()=>setActiveImg(img)} style={{width:76,height:76,borderRadius:10,overflow:"hidden",cursor:"pointer",border:activeImg===img?"3px solid #dc2626":"2px solid transparent",opacity:activeImg===img?1:0.6,background:"#f3f3f3",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}>
                <img src={img} alt={`v${i}`} style={{width:"100%",height:"100%",objectFit:"contain"}} onError={e=>e.target.src=phD(sel.name,i)}/>
              </div>
            ))}
          </div>
        )}
        {imgs.length>1&&<div style={{fontSize:12,color:"#aaa"}}>{imgs.indexOf(activeImg)+1} / {imgs.length} — click to switch view</div>}
      </div>
      <div>
        <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
          {isHot&&<span style={{background:"#fee2e2",color:"#dc2626",fontSize:11,padding:"3px 10px",borderRadius:20,fontWeight:700}}>🔥 HOT PICK</span>}
          {isNew&&<span style={{background:"#dbeafe",color:"#0369a1",fontSize:11,padding:"3px 10px",borderRadius:20,fontWeight:700}}>✨ NEW ARRIVAL</span>}
        </div>
        <h2 style={{fontSize:28,fontWeight:800,margin:"0 0 10px"}}>{sel.name}</h2>
        <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
          <span style={{background:cat.color+"22",color:cat.color,fontSize:12,padding:"4px 12px",borderRadius:20,fontWeight:600}}>{cat.icon} {cat.label}</span>
          <span style={{background:st.bg,color:st.c,fontSize:12,padding:"4px 12px",borderRadius:20,fontWeight:600}}>{sel.stock}</span>
          {(sel.tags||[]).filter(t=>t!=="Hot Pick"&&t!=="New Arrival").map(t=><span key={t} style={{background:"#f3f4f6",color:"#374151",fontSize:11,padding:"4px 10px",borderRadius:20,fontWeight:600}}>{t}</span>)}
        </div>
        <div style={{fontSize:34,fontWeight:900,color:"#dc2626",marginBottom:6}}>₹{Number(sel.price).toLocaleString("en-IN")}</div>
        <div style={{fontSize:13,color:"#aaa",marginBottom:14}}>Year: {sel.year}</div>
        <div style={{fontSize:15,color:"#444",lineHeight:1.8,marginBottom:24}}>{sel.desc}</div>
        <button onClick={onCart} disabled={sel.stock==="Sold Out"} style={{width:"100%",background:sel.stock==="Sold Out"?"#f3f3f3":"#dc2626",color:sel.stock==="Sold Out"?"#bbb":"#fff",border:"none",borderRadius:12,padding:"14px 0",fontWeight:700,fontSize:16,cursor:sel.stock==="Sold Out"?"not-allowed":"pointer",marginBottom:12,display:"block"}}>
          {sel.stock==="Sold Out"?"Sold Out":"🛒 Add to Cart"}
        </button>
        <button onClick={onWa} style={{width:"100%",background:"#25d366",color:"#fff",border:"none",borderRadius:12,padding:"14px 0",fontWeight:700,fontSize:16,cursor:"pointer",marginBottom:12,display:"block"}}>💬 Ask on WhatsApp</button>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onWish} style={{flex:1,background:wished?"#fee2e2":"#f3f3f3",color:wished?"#dc2626":"#555",border:"none",borderRadius:12,padding:"13px 0",fontWeight:700,cursor:"pointer",fontSize:14}}>{wished?"❤️ Wishlisted":"🤍 Wishlist"}</button>
          <button onClick={onShare} style={{flex:1,background:"#f3f3f3",color:"#444",border:"none",borderRadius:12,padding:"13px 0",fontWeight:700,cursor:"pointer",fontSize:14}}>🔗 Share</button>
        </div>
      </div>
    </div>
  );
}