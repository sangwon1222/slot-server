import{d as c,o as d,a,g as r,A as l,r as s,c as p,e as w,h,f as t}from"./index-250fa7a1.js";const u={class:"relative h-screen w-screen overflow-hidden bg-black"},_=t("div",{class:"m-auto flex h-full w-full flex-col flex-wrap items-center shadow-2xl shadow-slate-600"},[t("canvas",{id:"pixi-canvas",class:"relative z-[2]"})],-1),f=[_],x=c({__name:"game",setup(m){const{backgroundColor:n,width:o,height:i}=h;return d(async()=>{a.isLoading=!0,await r.getUser();const e=document.getElementById("pixi-canvas");window.app=new l({backgroundColor:n,width:o,height:i,view:e}),await window.app.init(),s(e),window.addEventListener("resize",()=>s(e)),a.isLoading=!1}),(e,v)=>(p(),w("div",u,f))}});export{x as default};
