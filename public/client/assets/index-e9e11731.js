import{d as b,i as v,c,e as f,t as m,n as x,w as $,j as T,k as h,f as y,l as V,m as O,o as A,p as _,a as I,q as D,v as E,_ as q,u as L,x as U,y as j,z as F,B as P,C as B}from"./index-bb38ed25.js";const z=["type","aria-label"],S=b({__name:"aButton",props:{defaultStyle:{default:""},validateStyle:{default:""},label:{default:""},type:{default:"button"}},emits:["onClick"],setup(r,{emit:p}){const s=r,e=v(()=>`${s.defaultStyle} ${s.validateStyle} select-none`);return(t,o)=>(c(),f("button",{class:x(["flex items-center justify-center",e.value]),type:s.type,role:"button","aria-label":`${s.label}-Aria`,onClick:o[0]||(o[0]=$(l=>t.$emit("onClick"),["prevent"]))},m(s.label),11,z))}}),K={class:"flex flex-col"},M={class:"flex flex-wrap items-center px-[6px]"},R={key:0,class:"pr-6"},J=["type","placeholder","value","required","readonly"],C=b({__name:"aInput",props:{label:{default:""},validateStyle:{default:""},useValidate:{type:Boolean,default:!1},defaultStyle:{default:""},autocomplete:{default:"on"},placeholder:{default:""},errorText:{default:""},required:{type:Boolean,default:!1},type:{default:"text"},initValue:{default:""},readonly:{type:Boolean,default:!1},modelValue:{default:""},dataBinding:{default:""}},emits:["update:model-value","keydownEnter"],setup(r,{expose:p,emit:s}){const e=r,t=T({inputValue:e.initValue?e.initValue:e.modelValue,errorText:""}),o=v(()=>`${e.useValidate?` ${e.defaultStyle} ${e.validateStyle}`:`${e.defaultStyle}`} ${e.readonly?"cursor-pointer":""}`),l=h(null),i=a=>{const u=a.currentTarget;e.type==="number"&&(u.value=`${+u.value}`),n(u.value)},n=a=>{if(t.errorText="",e.dataBinding.includes("not-symbol")){const u=/[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi,g=a.replace(u,"");a!=g&&(t.errorText="특수 기호는 입력할 수 없습니다."),a=g}e.dataBinding.includes("upper")&&(a=a.toUpperCase()),e.dataBinding.includes("lower")&&(a=a.toLowerCase()),t.inputValue=a,l.value.value=t.inputValue,N("update:model-value",t.inputValue)};p({focus:()=>{var a;return(a=l==null?void 0:l.value)==null?void 0:a.focus()},select:()=>{var a;return(a=l==null?void 0:l.value)==null?void 0:a.select()},blur:()=>{var a;return(a=l==null?void 0:l.value)==null?void 0:a.blur()},typing:n,reset:()=>n(""),trim:()=>t.inputValue=t.inputValue.trim()});const N=s;return(a,u)=>(c(),f("div",K,[y("div",M,[e.label?(c(),f("label",R,m(e.label)+" :",1)):V("",!0),y("input",{ref_key:"refInput",ref:l,type:e.type,placeholder:e.placeholder,class:x([o.value,"focus:border-sky-300"]),value:e.readonly?e.initValue:t.inputValue,required:e.required,readonly:e.readonly,onInput:i,onKeydown:u[0]||(u[0]=O($(g=>a.$emit("keydownEnter"),["self"]),["enter"]))},null,42,J)]),e.useValidate?(c(),f("p",{key:0,class:x([e.errorText?"opacity-100":"opacity-0","h-[18px] text-red-400"])},m(e.errorText),3)):V("",!0),y("p",{class:x([t.errorText?"opacity-100":"opacity-0","h-[18px] text-red-400"])},m(t.errorText),3)]))}}),W=b({__name:"tSignInForm",emits:["sign-in"],setup(r,{emit:p}){const s=h(null),e=h(null),t=T({id:"",pw:"",error:{id:v(()=>!t.id),pw:v(()=>!t.pw)}});A(()=>{var i;return(i=s.value)==null?void 0:i.focus()});const o=async()=>{const{id:i,pw:n}=t;if(!i)return s.value.focus();if(!n)return e.value.focus();I.isLoading=!0;try{const d=D(JSON.stringify({userID:i,pwd:n}),"login-info"),{ok:w,msg:k}=await E.signIn({l:d});l("sign-in",w,k),w||s.value.select()}catch(d){console.log(d)}finally{I.isLoading=!1}},l=p;return(i,n)=>(c(),f("form",{class:"user-info-box gap-[20px]",onSubmit:$(o,["prevent"])},[_(C,{ref_key:"refIdinput",ref:s,"model-value":t.id,"onUpdate:modelValue":n[0]||(n[0]=d=>t.id=d),"validate-style":t.error.id?"border-red-400":"border-black","error-text":t.id?"":"아이디를 입력해주세요.",class:"!w-full max-w-[500px]","default-style":"!w-full",placeholder:"아이디",label:"ID","use-validate":"",required:""},null,8,["model-value","validate-style","error-text"]),_(C,{ref_key:"refPwinput",ref:e,"model-value":t.pw,"onUpdate:modelValue":n[1]||(n[1]=d=>t.pw=d),"validate-style":t.error.pw?"border-red-400":"border-black","error-text":t.pw?"":"비밀번호를 입력해주세요.",class:"!w-full max-w-[500px]","default-style":"!w-full",placeholder:"비밀번호",autocomplete:"off",label:"PASSWORD",type:"password","use-validate":"",required:""},null,8,["model-value","validate-style","error-text"]),_(S,{type:"submit","default-style":"w-full max-w-[500px] rounded p-[10px] duration-300 ","validate-style":t.id&&t.pw?"bg-main-1 text-white":"bg-main-3",label:"로그인",onOnClick:o},null,8,["validate-style"])],32))}});const G=q(W,[["__scopeId","data-v-5111650a"]]),H=r=>(F("data-v-a6b3ae44"),r=r(),P(),r),Q={class:"sign-in-wrap gap-[20px] p-[20px]"},X=j('<div class="logo-wrap py-[20px] pt-[40px]" data-v-a6b3ae44><div class="relative flex h-[60px] w-[60px] animate-[spin_8s_linear_forwards] items-center justify-center" data-v-a6b3ae44><div class="absolute h-[50px] w-[50px] rotate-[85deg] rounded-md bg-main-1" alt="로그인_로고" data-v-a6b3ae44></div><div class="absolute h-[42px] w-[42px] rotate-[65deg] rounded-md bg-main-2" alt="로그인_로고" data-v-a6b3ae44></div><div class="absolute h-[36px] w-[36px] rotate-45 rounded-md bg-main-3" alt="로그인_로고" data-v-a6b3ae44></div></div><p class="block w-full py-[20px] text-center text-[20px] font-black" data-v-a6b3ae44>로그인</p></div>',1),Y={class:"flex w-full max-w-[500px] flex-col flex-wrap"},Z={class:"flex h-[50px] w-full items-center border-b"},ee=H(()=>y("hr",{class:"h-[20px] w-[1px] bg-gray-300"},null,-1)),te=b({__name:"index",setup(r){const p=L(),s=async(t,o)=>{t?p.push({name:"game"}):B.error(o)},e=()=>B.error("준비중입니다.");return(t,o)=>(c(),f("div",Q,[X,_(G,{onSignIn:s}),y("div",Y,[y("div",Z,[_(S,{"default-style":"flex-1",label:"아이디 / 비밀번호 찾기",onOnClick:e}),ee,_(S,{"default-style":"flex-1",label:"회원가입",onOnClick:o[0]||(o[0]=l=>U(p).push({name:"signUp"}))})])])]))}});const oe=q(te,[["__scopeId","data-v-a6b3ae44"]]);export{oe as default};
