(() => {
"use strict";
const KEY="miListaMercadoV3";
const $=id=>document.getElementById(id);
const state={items:[],budget:0,catalog:[],simple:false};

function parsePrice(value){
  let s=String(value??"").trim().replace(/[^\d,.-]/g,"");
  if(!s)return 0;
  const negative=s.startsWith("-");
  s=s.replace(/-/g,"");
  if(s.includes(",")){
    const p=s.split(",");
    const last=p.pop();
    const whole=p.join("").replace(/\./g,"");
    const n=Number(whole+"."+last);
    return negative?-n:n;
  }
  const dots=(s.match(/\./g)||[]).length;
  if(dots===1){
    const [a,b]=s.split(".");
    if(/^\d{3}$/.test(b)) return (negative?-1:1)*Number(a+b);
  }
  const n=Number(s.replace(/\./g,""));
  return negative?-n:n;
}
function money(n){return new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:2}).format(Number(n)||0)}
function uid(){return crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random()}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function load(){try{const x=JSON.parse(localStorage.getItem(KEY));if(x){Object.assign(state,x)}}catch{}}
function total(){return state.items.reduce((s,i)=>s+(Number(i.quantity)||0)*(Number(i.price)||0),0)}
function remaining(){return state.budget-total()}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function compressImage(file){
  return new Promise((resolve,reject)=>{
    if(!file)return resolve("");
    const reader=new FileReader();
    reader.onload=()=>{const img=new Image();img.onload=()=>{
      const max=1000, scale=Math.min(1,max/Math.max(img.width,img.height));
      const c=document.createElement("canvas");c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));
      c.getContext("2d").drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL("image/jpeg",.72));
    };img.onerror=reject;img.src=reader.result};reader.onerror=reject;reader.readAsDataURL(file);
  });
}
function render(){
  $("budgetText").textContent=money(state.budget);
  $("totalText").textContent=money(total());
  $("remainingText").textContent=money(remaining());
  $("remainingText").style.fontWeight="800";
  $("budgetHint").textContent=state.budget?`Disponible después de la lista: ${money(remaining())}`:"Define cuánto quieres gastar.";
  $("empty").style.display=state.items.length?"none":"block";
  $("list").innerHTML=state.items.map(i=>{
    const sub=(Number(i.quantity)||0)*(Number(i.price)||0);
    return `<div class="item">
      ${i.photo?`<img class="thumb" src="${i.photo}" alt="">`:`<div class="thumb" aria-hidden="true"></div>`}
      <div class="${i.isBought?"bought":""}">
        <h3>${escapeHtml(i.name)} <span class="pill">${escapeHtml(i.category)}</span></h3>
        <p>${i.quantity} × ${money(i.price)} = <strong>${money(sub)}</strong>${i.supermarket?" · "+escapeHtml(i.supermarket):""}</p>
        ${i.barcode?`<p>Código: ${escapeHtml(i.barcode)}</p>`:""}
      </div>
      <div class="right">
        <button class="secondary" data-buy="${i.id}" aria-label="${i.isBought?"Marcar pendiente":"Marcar comprado"}">${i.isBought?"✓":"Comprar"}</button>
        <button class="danger" data-del="${i.id}" aria-label="Eliminar ${escapeHtml(i.name)}">×</button>
      </div>
    </div>`;
  }).join("");
  $("simpleToggle").setAttribute("aria-pressed",String(state.simple));
  $("simpleToggle").textContent=state.simple?"Modo normal":"Modo sencillo";
  document.body.classList.toggle("simple",state.simple);
}
function addItem(){
  const name=$("name").value.trim(); if(!name){alert("Escribe el nombre del producto.");return}
  const quantity=parsePrice($("quantity").value)||1, price=parsePrice($("price").value);
  const barcode=$("barcode").value.trim();
  const existing=barcode&&state.catalog.find(c=>c.barcode===barcode);
  const item={id:uid(),name,quantity,price,category:$("category").value,supermarket:$("supermarket").value.trim(),barcode,isBought:false,photo:"",priceHistory:[{date:new Date().toISOString(),price}]};
  compressImage($("photo").files[0]).then(photo=>{
    item.photo=photo;
    state.items.push(item);
    if(barcode){
      const c=existing||{id:uid(),barcode,name,category:item.category,defaultPrice:price,history:[]};
      c.name=name;c.category=item.category;c.defaultPrice=price;c.history=[...(c.history||[]),{date:new Date().toISOString(),price}];
      if(!existing)state.catalog.push(c);
    }
    save();clearForm();render();
  }).catch(()=>{state.items.push(item);save();clearForm();render()});
}
function clearForm(){["name","price","supermarket","barcode"].forEach(id=>$(id).value="");$("quantity").value="1";$("photo").value=""}
function openCatalog(){
  $("catalogList").innerHTML=state.catalog.length?state.catalog.map(c=>`<div class="catalog-row"><strong>${escapeHtml(c.name)}</strong><br>Código: ${escapeHtml(c.barcode)} · Precio: ${money(c.defaultPrice)}<br><small>${escapeHtml(c.category)}</small></div>`).join(""):"<p class='muted'>El catálogo está vacío. Al agregar un código de barras se aprende localmente.</p>";
  $("catalogDialog").showModal();
}
function share(){
  const text=["🛒 Mi Lista de Mercado",...state.items.map(i=>`${i.isBought?"✓ ":""}${i.name}: ${i.quantity} × ${money(i.price)} = ${money(i.quantity*i.price)}`),`TOTAL: ${money(total())}`,`PRESUPUESTO: ${money(state.budget)}`,`TE QUEDA: ${money(remaining())}`].join("\n");
  if(navigator.share) navigator.share({title:"Mi Lista de Mercado",text}).catch(()=>{});
  else navigator.clipboard?.writeText(text).then(()=>alert("Lista copiada para compartir."));
}
function exportData(){
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="mi-lista-de-mercado-respaldo.json";a.click();URL.revokeObjectURL(a.href);
}
function importData(file){
  const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!Array.isArray(x.items)||!Array.isArray(x.catalog))throw Error();Object.assign(state,x);save();render();alert("Respaldo importado.");}catch{alert("El archivo no tiene un formato válido.");}};r.readAsText(file);
}
document.addEventListener("click",e=>{
  const buy=e.target.closest("[data-buy]"), del=e.target.closest("[data-del]");
  if(buy){const i=state.items.find(x=>x.id===buy.dataset.buy);if(i)i.isBought=!i.isBought;save();render()}
  if(del){state.items=state.items.filter(x=>x.id!==del.dataset.del);save();render()}
});
$("addBtn").onclick=addItem;
$("catalogBtn").onclick=openCatalog;
$("closeCatalog").onclick=()=>$("catalogDialog").close();
$("shareBtn").onclick=share;
$("budgetBtn").onclick=()=>{$("budgetInput").value=state.budget||"";$("budgetDialog").showModal();setTimeout(()=>$("budgetInput").focus(),50)};
$("saveBudget").onclick=e=>{state.budget=parsePrice($("budgetInput").value);save();render()};
$("clearBtn").onclick=()=>{if(confirm("¿Borrar todos los productos de la lista?")){state.items=[];save();render()}};
$("exportBtn").onclick=exportData;
$("importBtn").onclick=()=>$("importFile").click();
$("importFile").onchange=e=>e.target.files[0]&&importData(e.target.files[0]);
$("simpleToggle").onclick=()=>{state.simple=!state.simple;save();render()};
$("barcode").addEventListener("change",()=>{const code=$("barcode").value.trim();const c=state.catalog.find(x=>x.barcode===code);if(c){$("name").value=c.name;$("category").value=c.category;$("price").value=String(c.defaultPrice)}});
$("lookupBtn").onclick=()=>{const code=$("lookupBarcode").value.trim(),c=state.catalog.find(x=>x.barcode===code);$("barcode").value=code;if(c){$("name").value=c.name;$("category").value=c.category;$("price").value=String(c.defaultPrice);alert("Producto encontrado en el catálogo local.");}else alert("Código no encontrado. Puedes agregarlo y quedará aprendido localmente.");$("barcodeDialog").close()};
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
load();render();
window.MiListaMercado={parsePrice,total,remaining,state};
})();