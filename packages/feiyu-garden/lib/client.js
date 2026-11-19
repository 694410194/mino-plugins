window.__ModuleLoader__.load({id:"mino-feiyu-garden",factory:(require)=>{const module={exports:{}};const exports=module.exports;
var q=Object.create;var y=Object.defineProperty;var K=Object.getOwnPropertyDescriptor;var R=Object.getOwnPropertyNames;var ee=Object.getPrototypeOf,ae=Object.prototype.hasOwnProperty;var te=(e,a)=>{for(var r in a)y(e,r,{get:a[r],enumerable:!0})},j=(e,a,r,s)=>{if(a&&typeof a=="object"||typeof a=="function")for(let n of R(a))!ae.call(e,n)&&n!==r&&y(e,n,{get:()=>a[n],enumerable:!(s=K(a,n))||s.enumerable});return e};var w=(e,a,r)=>(r=e!=null?q(ee(e)):{},j(a||!e||!e.__esModule?y(r,"default",{value:e,enumerable:!0}):r,e)),re=e=>j(y({},"__esModule",{value:!0}),e);var ve={};te(ve,{apply:()=>ke,inject:()=>xe});module.exports=re(ve);var t=w(require("react"),1);var o=w(require("react"),1);function D(e){if(e&&e!=="auto")return e;let a=new Date().getHours();return a>=5&&a<11||a>=11&&a<17?"dawn":a>=17&&a<20?"dusk":"night"}var I=[{id:"auto",zh:"\u8DDF\u968F\u65F6\u95F4"},{id:"dawn",zh:"\u6D45\u6D77"},{id:"dusk",zh:"\u66AE\u8272"},{id:"night",zh:"\u661F\u6D77"},{id:"abyss",zh:"\u6DF1\u6E0A"}];function Z(e){let a=e>>>0;return()=>(a=a*1664525+1013904223>>>0)/4294967296}function C({kind:e,count:a=18,seed:r=7}){let s=o.default.useMemo(()=>{let n=Z(r);return Array.from({length:a},(d,l)=>({id:l,x:n()*100,y:n()*100,size:1.5+n()*4,delay:-n()*24,dur:12+n()*18,drift:(n()-.5)*40,o:.25+n()*.55}))},[a,r]);return o.default.createElement("div",{className:`fg-particles fg-particles-${e}`,"aria-hidden":"true"},s.map(n=>o.default.createElement("i",{key:n.id,style:{left:`${n.x}%`,top:`${n.y}%`,width:n.size,height:n.size,opacity:n.o,animationDelay:`${n.delay}s`,animationDuration:`${n.dur}s`,"--fg-drift":`${n.drift}px`}})))}function ne({count:e=10,seed:a=21}){let r=o.default.useMemo(()=>{let s=Z(a);return Array.from({length:e},(n,d)=>({id:d,x:8+s()*84,size:4+s()*10,delay:-s()*16,dur:7+s()*9,drift:(s()-.5)*30}))},[e,a]);return o.default.createElement("div",{className:"fg-bubbles","aria-hidden":"true"},r.map(s=>o.default.createElement("i",{key:s.id,style:{left:`${s.x}%`,width:s.size,height:s.size,animationDelay:`${s.delay}s`,animationDuration:`${s.dur}s`,"--fg-drift":`${s.drift}px`}})))}function ie({scene:e}){return o.default.createElement("svg",{className:"fg-plants",viewBox:"0 0 1200 220",preserveAspectRatio:"none","aria-hidden":"true"},o.default.createElement("g",{className:"fg-plant fg-plant-a"},o.default.createElement("path",{d:"M60 220 C50 170 70 140 58 96 C76 138 66 170 78 220 Z"}),o.default.createElement("path",{d:"M92 220 C88 180 102 150 96 118 C112 152 102 186 110 220 Z"})),o.default.createElement("g",{className:"fg-plant fg-plant-b"},o.default.createElement("path",{d:"M1060 220 C1052 168 1074 132 1062 84 C1082 128 1072 168 1084 220 Z"}),o.default.createElement("path",{d:"M1104 220 C1098 186 1112 158 1106 130 C1120 162 1112 190 1118 220 Z"}),o.default.createElement("path",{d:"M1032 220 C1030 196 1040 178 1036 160 C1048 180 1042 200 1046 220 Z"})),e==="dawn"&&o.default.createElement("g",{className:"fg-coral"},o.default.createElement("path",{d:"M180 220 C176 200 168 192 170 178 C182 188 182 200 186 210 C190 196 200 190 198 176 C208 190 200 208 204 220 Z"}),o.default.createElement("circle",{cx:"186",cy:"200",r:"5"})),e==="abyss"&&o.default.createElement("g",{className:"fg-glowplants"},o.default.createElement("ellipse",{cx:"1120",cy:"196",rx:"8",ry:"14"}),o.default.createElement("ellipse",{cx:"1140",cy:"204",rx:"6",ry:"10"}),o.default.createElement("ellipse",{cx:"80",cy:"206",rx:"7",ry:"11"})))}function E({scene:e}){return o.default.createElement("div",{className:`fg-ocean fg-scene-${e}`,"aria-hidden":"true"},o.default.createElement("div",{className:"fg-light"},e==="dawn"&&o.default.createElement("div",{className:"fg-sun"}),e==="dusk"&&o.default.createElement("div",{className:"fg-sun fg-sun-dusk"}),e==="night"&&o.default.createElement("div",{className:"fg-moon"}),e!=="abyss"&&o.default.createElement("div",{className:"fg-rays"},o.default.createElement("i",null),o.default.createElement("i",null),o.default.createElement("i",null)),e==="night"&&o.default.createElement(C,{kind:"stars",count:46,seed:11}),e==="abyss"&&o.default.createElement(C,{kind:"abyss",count:30,seed:13})),o.default.createElement(C,{kind:e==="night"||e==="abyss"?"glow":"motes",count:e==="abyss"?8:16,seed:e==="abyss"?29:17}),o.default.createElement(ne,{count:e==="abyss"?5:10}),e==="abyss"&&o.default.createElement("div",{className:"fg-jellies"},[0,1].map(a=>o.default.createElement("svg",{key:a,className:`fg-jelly fg-jelly-${a}`,viewBox:"0 0 60 90","aria-hidden":"true"},o.default.createElement("path",{d:"M8 34 C8 12 52 12 52 34 C52 42 44 46 30 46 C16 46 8 42 8 34 Z",fill:"rgba(140,220,255,.35)",stroke:"rgba(180,235,255,.7)",strokeWidth:"1.5"}),o.default.createElement("path",{d:"M16 46 C14 60 20 66 16 78 M26 46 C24 62 30 68 26 82 M36 46 C38 60 32 66 36 78 M44 46 C46 58 42 64 44 74",stroke:"rgba(170,225,255,.55)",strokeWidth:"1.6",fill:"none",strokeLinecap:"round"})))),o.default.createElement("div",{className:"fg-floor"}),o.default.createElement(ie,{scene:e}))}var i=w(require("react"),1);function O({mood:e=70,burst:a=null,scene:r="dawn",flipped:s=!1}){let n=e>=65,d=e<25,l=!n&&!d,b=(e-50)/50,u=Math.max(0,(e-55)/45),c=r==="abyss"||r==="night"?{main:"url(#fg-whale-body-night)",belly:"#9fc6de"}:{main:"url(#fg-whale-body)",belly:"#eef7fb"};return i.default.createElement("svg",{className:`fg-whale ${s?"is-flip":""}`,viewBox:"0 0 340 220","aria-hidden":"true"},i.default.createElement("defs",null,i.default.createElement("linearGradient",{id:"fg-whale-body",x1:"0",y1:"0",x2:"0",y2:"1"},i.default.createElement("stop",{offset:"0%",stopColor:"#8ec6e2"}),i.default.createElement("stop",{offset:"55%",stopColor:"#6ba9cf"}),i.default.createElement("stop",{offset:"100%",stopColor:"#4f8cb8"})),i.default.createElement("linearGradient",{id:"fg-whale-body-night",x1:"0",y1:"0",x2:"0",y2:"1"},i.default.createElement("stop",{offset:"0%",stopColor:"#5b7f9e"}),i.default.createElement("stop",{offset:"55%",stopColor:"#42648a"}),i.default.createElement("stop",{offset:"100%",stopColor:"#2f4a6c"})),i.default.createElement("radialGradient",{id:"fg-whale-glow",cx:"50%",cy:"42%",r:"60%"},i.default.createElement("stop",{offset:"0%",stopColor:"rgba(255,255,255,.55)"}),i.default.createElement("stop",{offset:"100%",stopColor:"rgba(255,255,255,0)"}))),i.default.createElement("ellipse",{className:"fg-whale-aura",cx:"170",cy:"118",rx:"150",ry:"92",fill:"url(#fg-whale-glow)"}),i.default.createElement("g",{className:"fg-whale-float"},i.default.createElement("g",{className:"fg-whale-tail",style:{transformOrigin:"66px 118px"}},i.default.createElement("path",{d:"M66 118 C40 96 22 94 12 104 C26 110 30 118 30 118 C30 118 26 126 12 132 C22 142 40 140 66 118 Z",fill:c.main})),i.default.createElement("path",{d:"M64 118 C64 76 110 44 172 44 C240 44 296 76 296 118 C296 156 244 178 178 178 C118 178 64 158 64 118 Z",fill:c.main}),i.default.createElement("path",{d:"M84 140 C110 162 150 172 184 172 C226 172 264 156 284 132 C272 158 226 178 178 178 C126 178 92 162 84 140 Z",fill:c.belly,opacity:".92"}),i.default.createElement("path",{d:"M176 46 C188 30 208 28 214 38 C204 42 196 50 192 58 Z",fill:c.main}),i.default.createElement("g",{className:"fg-whale-fin",style:{transformOrigin:"236px 138px"}},i.default.createElement("path",{d:"M238 136 C258 142 266 158 262 170 C246 168 234 156 230 142 Z",fill:c.main})),n?i.default.createElement(i.default.Fragment,null,i.default.createElement("path",{className:"fg-whale-eye",d:"M242 102 Q250 92 258 102",fill:"none",stroke:"#1d3140",strokeWidth:"5",strokeLinecap:"round"}),i.default.createElement("path",{className:"fg-whale-eye",d:"M272 102 Q280 92 288 102",fill:"none",stroke:"#1d3140",strokeWidth:"5",strokeLinecap:"round"})):l?i.default.createElement(i.default.Fragment,null,i.default.createElement("circle",{className:"fg-whale-eye",cx:"250",cy:"102",r:"6.5",fill:"#1d3140"}),i.default.createElement("circle",{cx:"252.5",cy:"100",r:"2",fill:"#fff"}),i.default.createElement("circle",{className:"fg-whale-eye",cx:"280",cy:"102",r:"6.5",fill:"#1d3140"}),i.default.createElement("circle",{cx:"282.5",cy:"100",r:"2",fill:"#fff"})):i.default.createElement(i.default.Fragment,null,i.default.createElement("ellipse",{className:"fg-whale-eye",cx:"250",cy:"106",rx:"6",ry:"7",fill:"#1d3140"}),i.default.createElement("ellipse",{className:"fg-whale-eye",cx:"280",cy:"106",rx:"6",ry:"7",fill:"#1d3140"}),i.default.createElement("path",{d:"M244 94 Q250 90 256 93",stroke:"#1d3140",strokeWidth:"3",fill:"none",strokeLinecap:"round",opacity:".7"}),i.default.createElement("path",{d:"M274 93 Q280 90 286 94",stroke:"#1d3140",strokeWidth:"3",fill:"none",strokeLinecap:"round",opacity:".7"})),i.default.createElement("path",{d:`M258 122 Q268 ${122+b*9} 278 122`,fill:"none",stroke:"#1d3140",strokeWidth:"4",strokeLinecap:"round"}),i.default.createElement("ellipse",{cx:"238",cy:"118",rx:"10",ry:"6",fill:"#ff9db0",opacity:.15+u*.55}),i.default.createElement("ellipse",{cx:"292",cy:"118",rx:"10",ry:"6",fill:"#ff9db0",opacity:.15+u*.55})),a==="pet"&&i.default.createElement("g",{className:"fg-burst"},[0,1,2].map(p=>i.default.createElement("path",{key:p,className:`fg-heart fg-heart-${p}`,d:"M0 4 C-4 -2 -12 1 -8 7 L0 12 L8 7 C12 1 4 -2 0 4 Z",transform:`translate(${240+p*30}, ${58-p*8})`,fill:"#ff7d95"}))),a==="feed"&&i.default.createElement("g",{className:"fg-burst"},[0,1,2,3].map(p=>i.default.createElement("circle",{key:p,className:`fg-token fg-token-${p}`,cx:210+p*26,cy:40+p%2*10,r:"6",fill:"#ffd77a",stroke:"#e8a93c",strokeWidth:"1.5"}))))}var Y=require("react"),oe={\u6D77\u8482\u82B1\u56ED:"Feiyu Garden","\u5979\u7684\u5C0F\u6D77\uFF0C\u4F60\u7684\u82B1\u56ED":"Her little sea, your garden",\u5FC3\u60C5:"Mood",\u9971\u98DF:"Fed",\u4EB2\u5BC6:"Bond",\u5582\u5979:"Feed her",\u6478\u5934:"Pat",\u65E5\u8BB0:"Diary",\u7EA7:"Lv.",\u5347\u7EA7\u8FDB\u5EA6:"Level progress",\u96C0\u8DC3:"Elated",\u5F00\u5FC3:"Happy",\u5E73\u9759:"Calm",\u852B\u852B:"Down",\u59D4\u5C48:"Upset",\u521A\u521A:"just now",\u5206\u949F\u524D:"m ago",\u5C0F\u65F6\u524D:"h ago",\u5929\u524D:"d ago",\u573A\u666F:"Scene",\u8DDF\u968F\u65F6\u95F4:"Follow time",\u6D45\u6D77:"Shallows",\u66AE\u8272:"Dusk",\u661F\u6D77:"Starry",\u6DF1\u6E0A:"Abyss",\u6539\u540D:"Rename",\u53EB\u5979\u4EC0\u4E48:"Her name",\u4FDD\u5B58:"Save",\u53D6\u6D88:"Cancel",\u51CF\u5F31\u52A8\u6548:"Reduce motion",\u58F0\u97F3:"Chime",\u8BBE\u7F6E:"Settings",\u7D2F\u8BA1\u5077\u5403:"Tokens nibbled",\u966A\u4F34\u5206\u949F:"minutes together",\u6B21\u4F1A\u8BDD:"sessions",\u5206\u949F:"min","\u6478\u5934 \xD7":"pats \xD7","\u5582\u98DF \xD7":"feeds \xD7",\u82B1\u56ED\u52A0\u8F7D\u4E2D:"Waking the sea\u2026",\u82B1\u56ED\u52A0\u8F7D\u5931\u8D25:"Failed to load the garden",\u91CD\u8BD5:"Retry",\u540C\u6B65\u4E2D:"syncing",\u79BB\u7EBF:"offline",\u6B63\u5728\u540C\u6B65:"Syncing state","\u540C\u6B65\u5931\u8D25\uFF0C\u4ECD\u5728\u91CD\u8BD5":"Sync failed, still retrying",\u6E05\u7A7A\u793A\u4F8B:""},T=new Set,P=se();function se(){try{return(document.documentElement.lang||navigator.language||"zh").toLowerCase().startsWith("zh")?"zh":"en"}catch{return"zh"}}function f(e,a){let r=P==="en"?oe[e]??e:e;if(a)for(let[s,n]of Object.entries(a))r=r.replace(`{${s}}`,n);return r}function W(){return(0,Y.useSyncExternalStore)(e=>(T.add(e),()=>T.delete(e)),()=>P)}var N=`/* \u6D77\u8482\u82B1\u56ED \u2014\u2014 \u56DB\u5883\u6D77\u6D0B + \u73BB\u7483\u680F\u3002\u5168\u90E8\u672C\u5730\u7ED8\u5236\uFF0C\u96F6\u5916\u90E8\u8D44\u6E90\u3002 */

.fg-root {
  /* \u9ED8\u8BA4\u6D45\u6D77\u6668\u5149 */
  --sea-top: #cdeefb;
  --sea-mid: #8fd4ec;
  --sea-low: #4ba9cf;
  --sea-deep: #2f7ba3;
  --light-core: rgba(255, 246, 214, .95);
  --light-glow: rgba(255, 236, 178, .5);
  --ray: rgba(255, 255, 255, .5);
  --mote: rgba(255, 255, 255, .75);
  --floor-a: #f0dcae;
  --floor-b: #d8b988;
  --plant: #2f7f8c;
  --ink: #0d2f42;
  --ink-soft: rgba(13, 47, 66, .62);
  --card: rgba(255, 255, 255, .42);
  --card-edge: rgba(255, 255, 255, .6);
  --card-ink: #0d2f42;
  --accent: #0e8ab5;
  --accent-ink: #fff;
  --ring-track: rgba(255, 255, 255, .4);
  --danger: #d95f6e;
}

.fg-scene-dusk {
  --sea-top: #ffcf9e;
  --sea-mid: #e8837f;
  --sea-low: #7a5f96;
  --sea-deep: #2e3560;
  --light-core: rgba(255, 178, 120, .95);
  --light-glow: rgba(255, 150, 110, .45);
  --ray: rgba(255, 210, 170, .38);
  --mote: rgba(255, 215, 190, .6);
  --floor-a: #4a3d63;
  --floor-b: #33284d;
  --plant: #241d38;
  --ink: #fff1e2;
  --ink-soft: rgba(255, 241, 226, .65);
  --card: rgba(46, 38, 70, .46);
  --card-edge: rgba(255, 220, 190, .28);
  --card-ink: #ffeedd;
  --accent: #ffb469;
  --accent-ink: #4a2c14;
  --ring-track: rgba(255, 255, 255, .18);
}

.fg-scene-night {
  --sea-top: #1b2b55;
  --sea-mid: #132145;
  --sea-low: #0b1630;
  --sea-deep: #050b1e;
  --light-core: rgba(232, 240, 255, .95);
  --light-glow: rgba(160, 190, 255, .35);
  --ray: rgba(180, 205, 255, .22);
  --mote: rgba(190, 220, 255, .7);
  --floor-a: #101a36;
  --floor-b: #080f22;
  --plant: #060b18;
  --ink: #dbe8ff;
  --ink-soft: rgba(219, 232, 255, .6);
  --card: rgba(13, 22, 44, .5);
  --card-edge: rgba(140, 170, 235, .22);
  --card-ink: #e4eeff;
  --accent: #7fb2ff;
  --accent-ink: #0a1630;
  --ring-track: rgba(255, 255, 255, .14);
}

.fg-scene-abyss {
  --sea-top: #04101e;
  --sea-mid: #071a2c;
  --sea-low: #061423;
  --sea-deep: #020810;
  --light-core: rgba(120, 230, 220, .8);
  --light-glow: rgba(70, 190, 200, .25);
  --ray: rgba(110, 200, 210, .12);
  --mote: rgba(120, 235, 220, .8);
  --floor-a: #051020;
  --floor-b: #02070f;
  --plant: #03121e;
  --ink: #bdf2ec;
  --ink-soft: rgba(189, 242, 236, .55);
  --card: rgba(5, 20, 32, .55);
  --card-edge: rgba(96, 210, 205, .2);
  --card-ink: #d4f7f1;
  --accent: #4fd8c8;
  --accent-ink: #03231e;
  --ring-track: rgba(255, 255, 255, .12);
}

.fg-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  font-family: "PingFang SC", "Microsoft YaHei", "Segoe UI", system-ui, -apple-system, sans-serif;
  color: var(--ink);
  background: linear-gradient(180deg, var(--sea-top) 0%, var(--sea-mid) 34%, var(--sea-low) 68%, var(--sea-deep) 100%);
  transition: background 1.2s ease;
  -webkit-font-smoothing: antialiased;
}

/* ---------------------------------------------------------------- \u6D77\u6D0B\u5C42 */

.fg-ocean { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }

.fg-sun, .fg-moon {
  position: absolute; top: -60px; left: 14%;
  width: 220px; height: 220px; border-radius: 50%;
  background: radial-gradient(circle, var(--light-core) 0%, var(--light-glow) 45%, transparent 72%);
  filter: blur(2px);
}
.fg-sun-dusk { top: 4%; left: 10%; width: 300px; height: 300px; }
.fg-moon { top: 6%; left: 76%; width: 120px; height: 120px; box-shadow: 0 0 80px 30px var(--light-glow); filter: none; }

.fg-rays { position: absolute; top: -12%; left: 6%; width: 55%; height: 130%; transform-origin: 20% 0; }
.fg-rays i {
  position: absolute; top: 0; height: 100%; width: 11%;
  background: linear-gradient(180deg, var(--ray) 0%, transparent 78%);
  transform: skewX(-16deg);
  animation: fg-ray-sway 11s ease-in-out infinite alternate;
}
.fg-rays i:nth-child(1) { left: 6%; }
.fg-rays i:nth-child(2) { left: 24%; width: 7%; animation-delay: -4s; opacity: .7; }
.fg-rays i:nth-child(3) { left: 40%; width: 15%; animation-delay: -8s; opacity: .5; }

@keyframes fg-ray-sway {
  from { transform: skewX(-16deg) translateX(0); opacity: 1; }
  to   { transform: skewX(-13deg) translateX(18px); opacity: .75; }
}

.fg-floor {
  position: absolute; left: -6%; right: -6%; bottom: -38px; height: 120px;
  background: radial-gradient(60% 100% at 50% 0%, var(--floor-a) 0%, var(--floor-b) 70%, transparent 100%);
  border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  opacity: .9;
  filter: blur(1px);
}

.fg-plants { position: absolute; bottom: 0; left: 0; width: 100%; height: 220px; }
.fg-plant { fill: var(--plant); opacity: .8; transform-box: fill-box; }
.fg-plant-a { transform-origin: 80px 220px; animation: fg-plant-sway 7s ease-in-out infinite alternate; }
.fg-plant-b { transform-origin: 1080px 220px; animation: fg-plant-sway 8.5s ease-in-out -3s infinite alternate; }
.fg-coral { fill: #ff8f9d; opacity: .85; }
.fg-glowplants { fill: #3ee6d2; opacity: .7; filter: drop-shadow(0 0 8px rgba(80, 235, 215, .8)); animation: fg-glow-pulse 4s ease-in-out infinite alternate; }

@keyframes fg-plant-sway { from { transform: rotate(-3.5deg); } to { transform: rotate(3.5deg); } }
@keyframes fg-glow-pulse { from { opacity: .45; } to { opacity: .9; } }

/* \u9897\u7C92\uFF1Amotes(\u767D)/glow(\u9752\u83B9)/stars(\u661F\u95EA)/abyss(\u6DF1\u6E0A\u751F\u7269\u5149) */
.fg-particles i {
  position: absolute; border-radius: 50%;
  background: var(--mote);
  animation: fg-mote-rise linear infinite;
}
.fg-particles-motes i { box-shadow: 0 0 6px rgba(255, 255, 255, .5); }
.fg-particles-glow i, .fg-particles-abyss i {
  background: var(--mote); box-shadow: 0 0 8px 2px rgba(110, 235, 215, .55);
  animation-name: fg-glow-rise;
}
.fg-particles-stars i {
  background: #fff; box-shadow: 0 0 4px rgba(200, 220, 255, .9);
  animation: fg-star-twinkle ease-in-out infinite;
}
.fg-particles-stars { height: 45%; }

@keyframes fg-mote-rise {
  0%   { transform: translate(0, 24vh); opacity: 0; }
  12%  { opacity: var(--p-o, .6); }
  88%  { opacity: var(--p-o, .6); }
  100% { transform: translate(var(--fg-drift, 0), -96vh); opacity: 0; }
}
@keyframes fg-glow-rise {
  0%   { transform: translate(0, 12vh) scale(.7); opacity: 0; }
  20%  { opacity: .85; }
  100% { transform: translate(var(--fg-drift, 0), -70vh) scale(1.05); opacity: 0; }
}
@keyframes fg-star-twinkle {
  0%, 100% { transform: scale(.6); opacity: .25; }
  50%      { transform: scale(1); opacity: .95; }
}

.fg-bubbles i {
  position: absolute; bottom: -20px; border-radius: 50%;
  border: 1.2px solid rgba(255, 255, 255, .55);
  background: radial-gradient(circle at 32% 30%, rgba(255, 255, 255, .5), rgba(255, 255, 255, .06) 60%);
  animation: fg-bubble-rise linear infinite;
}
@keyframes fg-bubble-rise {
  0%   { transform: translate(0, 0) scale(.6); opacity: 0; }
  10%  { opacity: .8; }
  100% { transform: translate(var(--fg-drift, 0), -105vh) scale(1); opacity: 0; }
}

.fg-jellies { position: absolute; inset: 0; }
.fg-jelly { position: absolute; width: 64px; opacity: .85; filter: drop-shadow(0 0 12px rgba(110, 225, 240, .55)); animation: fg-jelly-drift 16s ease-in-out infinite alternate; }
.fg-jelly-0 { top: 22%; left: 66%; }
.fg-jelly-1 { top: 48%; left: 12%; width: 48px; animation-delay: -8s; animation-duration: 20s; }
@keyframes fg-jelly-drift {
  from { transform: translate(0, 0) scaleY(1); }
  50%  { transform: translate(14px, -26px) scaleY(.94); }
  to   { transform: translate(-10px, -46px) scaleY(1.04); }
}

/* ---------------------------------------------------------------- \u9CB8\u9C7C */

.fg-stage {
  position: absolute;
  top: 46%; left: calc(50% - 210px);
  transform: translate(-50%, -50%);
  width: min(46vw, 560px);
  display: flex; flex-direction: column; align-items: center;
  pointer-events: none;
}
.fg-whale { width: 100%; overflow: visible; animation: fg-whale-bob 6.5s ease-in-out infinite; }
.fg-whale.is-flip { transform: scaleX(-1); }
.fg-whale-float { transform-origin: 50% 55%; animation: fg-whale-tilt 6.5s ease-in-out infinite; }
.fg-whale-tail { animation: fg-tail-swing 2.8s ease-in-out infinite; }
.fg-whale-fin  { animation: fg-fin-sway 4.2s ease-in-out infinite; }
.fg-whale-eye  { animation: fg-blink 5.6s infinite; transform-origin: center; transform-box: fill-box; }
.fg-whale-aura { opacity: .5; animation: fg-aura 6.5s ease-in-out infinite; }

@keyframes fg-whale-bob {
  0%, 100% { transform: translateY(0) scaleX(var(--flip, 1)); }
  50%      { transform: translateY(-16px) scaleX(var(--flip, 1)); }
}
.fg-whale.is-flip { --flip: -1; }
@keyframes fg-whale-tilt { 0%, 100% { transform: rotate(-1.6deg); } 50% { transform: rotate(1.6deg); } }
@keyframes fg-tail-swing { 0%, 100% { transform: rotate(-7deg); } 50% { transform: rotate(9deg); } }
@keyframes fg-fin-sway   { 0%, 100% { transform: rotate(6deg); } 50% { transform: rotate(-9deg); } }
@keyframes fg-blink { 0%, 93%, 100% { transform: scaleY(1); } 96% { transform: scaleY(.12); } }
@keyframes fg-aura { 0%, 100% { opacity: .34; } 50% { opacity: .6; } }

/* \u7206\u53D1\u7C92\u5B50 */
.fg-heart { opacity: 0; animation: fg-heart-pop 1.6s ease-out forwards; }
.fg-heart-1 { animation-delay: .18s; } .fg-heart-2 { animation-delay: .34s; }
@keyframes fg-heart-pop {
  0%   { opacity: 0; transform: translateY(8px) scale(.3); }
  25%  { opacity: 1; }
  100% { opacity: 0; transform: translateY(-44px) scale(1.15); }
}
.fg-token { opacity: 0; animation: fg-token-drop 1.3s ease-in forwards; }
.fg-token-1 { animation-delay: .12s; } .fg-token-2 { animation-delay: .24s; } .fg-token-3 { animation-delay: .36s; }
@keyframes fg-token-drop {
  0%   { opacity: 0; transform: translateY(-26px) scale(.4); }
  30%  { opacity: 1; }
  75%  { opacity: 1; }
  100% { opacity: 0; transform: translateY(56px) scale(1); }
}

.fg-stage-name {
  margin-top: -6px;
  display: flex; align-items: center; gap: 10px;
  padding: 8px 18px;
  border-radius: 999px;
  background: var(--card);
  border: 1px solid var(--card-edge);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 8px 28px rgba(4, 30, 46, .18);
  pointer-events: auto;
}
.fg-name { font-size: 17px; font-weight: 700; letter-spacing: .02em; }
.fg-lv {
  font-size: 12px; font-weight: 700; color: var(--accent-ink);
  background: var(--accent); border-radius: 999px; padding: 2px 9px;
}
.fg-moodchip { font-size: 12.5px; color: var(--ink-soft); letter-spacing: .06em; }

/* ---------------------------------------------------------------- \u53F3\u4FA7\u680F */

.fg-rail {
  position: absolute;
  top: 24px; right: 24px; bottom: 24px;
  width: 372px;
  display: flex; flex-direction: column; gap: 14px;
  padding: 22px 20px;
  border-radius: 24px;
  background: var(--card);
  border: 1px solid var(--card-edge);
  backdrop-filter: blur(22px) saturate(1.25);
  -webkit-backdrop-filter: blur(22px) saturate(1.25);
  box-shadow: 0 18px 60px rgba(4, 26, 40, .28), inset 0 1px 0 rgba(255, 255, 255, .35);
  overflow: hidden;
}

.fg-head { display: flex; align-items: flex-start; justify-content: space-between; }
.fg-head h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: .08em; color: var(--card-ink); }
.fg-head p { margin: 4px 0 0; font-size: 12.5px; color: var(--ink-soft); letter-spacing: .12em; }
.fg-gear {
  border: 0; background: transparent; color: var(--ink-soft); cursor: pointer;
  padding: 6px; border-radius: 10px; transition: all .25s;
}
.fg-gear:hover { color: var(--card-ink); background: rgba(255, 255, 255, .18); transform: rotate(40deg); }

/* \u540C\u6B65\u72B6\u6001\u5C0F\u80F6\u56CA\uFF1A\u9996\u6293\u672A\u843D\u5730/\u79BB\u7EBF\u91CD\u8BD5\u65F6\u51FA\u73B0\u5728\u6807\u9898\u65C1 */
.fg-sync {
  align-self: center; margin-left: auto; margin-right: 4px;
  font-size: 10.5px; letter-spacing: .14em; color: var(--ink-soft);
  padding: 3px 9px; border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, .3); background: rgba(255, 255, 255, .12);
  animation: fg-sync-pulse 1.8s ease-in-out infinite;
}
.fg-sync.is-lost { color: #b4543f; border-color: rgba(180, 84, 63, .4); animation: none; }
@keyframes fg-sync-pulse { 0%, 100% { opacity: .55 } 50% { opacity: 1 } }

.fg-card {
  border-radius: 18px;
  background: rgba(255, 255, 255, .16);
  border: 1px solid rgba(255, 255, 255, .22);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .2);
  padding: 14px 16px;
}
.fg-scene-night .fg-card, .fg-scene-abyss .fg-card, .fg-scene-dusk .fg-card {
  background: rgba(255, 255, 255, .07);
  border-color: rgba(255, 255, 255, .12);
}

.fg-loading { flex: 1; display: grid; place-items: center; color: var(--ink-soft); letter-spacing: .2em; font-size: 13px; }

/* \u4E09\u73AF */
.fg-rings { display: flex; justify-content: space-around; }
.fg-ring { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.fg-ring svg { width: 64px; height: 64px; }
.fg-ring-bg { fill: none; stroke: var(--ring-track); stroke-width: 6; }
.fg-ring-fg {
  fill: none; stroke-width: 6; stroke-linecap: round;
  transform: rotate(-90deg); transform-origin: center;
  transition: stroke-dashoffset .8s cubic-bezier(.3, 1, .4, 1);
}
.fg-tone-mood { stroke: #ff9db4; }
.fg-tone-food { stroke: #ffd37a; }
.fg-tone-bond { stroke: #7fd8e8; }
.fg-ring-num { font-size: 15px; font-weight: 700; fill: var(--card-ink); text-anchor: middle; }
.fg-ring span { font-size: 11.5px; color: var(--ink-soft); letter-spacing: .1em; }

/* \u52A8\u4F5C */
.fg-actions { display: flex; gap: 10px; }
.fg-btn {
  flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  border: 1px solid rgba(255, 255, 255, .28);
  background: rgba(255, 255, 255, .2);
  color: var(--card-ink);
  border-radius: 13px; padding: 11px 8px;
  font-size: 13.5px; font-weight: 600; font-family: inherit;
  cursor: pointer;
  transition: transform .18s cubic-bezier(.3, 1.4, .5, 1), box-shadow .2s, background .2s;
}
.fg-btn:hover { transform: translateY(-2px); background: rgba(255, 255, 255, .3); box-shadow: 0 8px 20px rgba(6, 30, 45, .18); }
.fg-btn:active { transform: translateY(0) scale(.97); }
.fg-btn.is-primary {
  background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 68%, #8be3ff));
  color: var(--accent-ink); border-color: transparent;
  box-shadow: 0 8px 22px color-mix(in srgb, var(--accent) 45%, transparent);
}
.fg-btn.is-primary:hover { filter: brightness(1.07); }
.fg-ic { font-style: normal; font-size: 14px; }

/* \u6570\u636E\u884C */
.fg-stats { display: flex; justify-content: space-between; text-align: center; }
.fg-stats b { display: block; font-size: 19px; font-weight: 800; color: var(--card-ink); font-variant-numeric: tabular-nums; }
.fg-stats span { font-size: 10.5px; color: var(--ink-soft); letter-spacing: .08em; }

/* \u65E5\u8BB0 */
.fg-diary { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.fg-diary h2 { margin: 0 0 10px; font-size: 12px; font-weight: 700; color: var(--ink-soft); letter-spacing: .3em; }
.fg-diary ul {
  flex: 1; min-height: 0; overflow-y: auto; margin: 0; padding: 0 4px 0 0;
  list-style: none; display: flex; flex-direction: column; gap: 9px;
  scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.35) transparent;
}
.fg-diary li {
  display: flex; align-items: baseline; gap: 8px;
  font-size: 12.5px; line-height: 1.55; color: var(--card-ink);
  padding-bottom: 9px; border-bottom: 1px dashed rgba(255, 255, 255, .14);
}
.fg-diary li i { font-style: normal; font-size: 13px; flex: none; }
.fg-log-text { flex: 1; }
.fg-diary time { flex: none; font-size: 10.5px; color: var(--ink-soft); font-variant-numeric: tabular-nums; }

/* \u573A\u666F\u9009\u62E9 */
.fg-scenepick { display: flex; justify-content: center; gap: 12px; padding-top: 2px; }
.fg-scenedot {
  width: 26px; height: 26px; border-radius: 50%; cursor: pointer;
  border: 2px solid transparent; outline: 2px solid transparent; outline-offset: 3px;
  transition: transform .2s, outline-color .2s;
}
.fg-scenedot:hover { transform: scale(1.18); }
.fg-scenedot.is-on { outline-color: var(--card-ink); }
.fg-dot-auto  { background: conic-gradient(#a8ddf0 0 25%, #f79d84 0 50%, #16244a 0 75%, #0b2138 0); }
.fg-dot-dawn  { background: linear-gradient(160deg, #cdeefb, #4ba9cf); }
.fg-dot-dusk  { background: linear-gradient(160deg, #ffcf9e, #7a5f96); }
.fg-dot-night { background: linear-gradient(160deg, #1b2b55, #050b1e); }
.fg-dot-abyss { background: linear-gradient(160deg, #0d3448, #02070f); box-shadow: inset 0 0 6px rgba(80, 235, 215, .7); }

/* \u8BBE\u7F6E */
.fg-settings { padding: 10px 16px; border-radius: 14px; background: rgba(0, 0, 0, .12); }
.fg-switchrow { display: flex; align-items: center; justify-content: space-between; font-size: 13px; color: var(--card-ink); }
.fg-switchrow input { accent-color: var(--accent); width: 16px; height: 16px; cursor: pointer; }

/* \u5F39\u5C42 */
.fg-modal-mask {
  position: absolute; inset: 0; z-index: 10;
  display: grid; place-items: center;
  background: rgba(4, 20, 32, .35); backdrop-filter: blur(3px);
  animation: fg-fade .2s ease;
}
.fg-modal {
  width: 300px; padding: 22px;
  border-radius: 20px;
  background: var(--card); border: 1px solid var(--card-edge);
  backdrop-filter: blur(26px); -webkit-backdrop-filter: blur(26px);
  box-shadow: 0 24px 70px rgba(3, 18, 30, .4);
  animation: fg-pop .28s cubic-bezier(.3, 1.5, .5, 1);
}
.fg-modal h3 { margin: 0 0 14px; font-size: 15px; color: var(--card-ink); letter-spacing: .06em; }
.fg-modal input {
  width: 100%; box-sizing: border-box;
  border: 1px solid rgba(255, 255, 255, .3); border-radius: 12px;
  background: rgba(255, 255, 255, .22); color: var(--card-ink);
  padding: 10px 13px; font-size: 14px; font-family: inherit;
  outline: none; transition: border-color .2s, box-shadow .2s;
}
.fg-modal input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 25%, transparent); }
.fg-modal-foot { display: flex; gap: 10px; margin-top: 16px; }

/* \u5931\u8D25\u9875 */
.fg-fail { position: absolute; inset: 0; display: grid; place-content: center; gap: 14px; justify-items: center; color: var(--ink); }

/* \u7A84\u5E03\u5C40\uFF1A\u53F3\u680F\u53D8\u5E95\u680F */
.fg-root.is-narrow .fg-rail {
  top: auto; left: 16px; right: 16px; bottom: 16px;
  width: auto; max-height: 52%;
}
.fg-root.is-narrow .fg-stage { left: 50%; top: 34%; width: min(72vw, 480px); }

/* \u51CF\u5F31\u52A8\u6548 */
.fg-reduce .fg-ocean *, .fg-reduce .fg-whale, .fg-reduce .fg-whale *, .fg-reduce .fg-burst *,
.fg-reduce .fg-gear:hover, .fg-reduce .fg-btn, .fg-reduce .fg-ring-fg, .fg-reduce .fg-modal,
.fg-reduce .fg-sync {
  animation: none !important; transition: none !important;
}

@keyframes fg-fade { from { opacity: 0; } }
@keyframes fg-pop { from { opacity: 0; transform: translateY(14px) scale(.94); } }
`;var F="feiyu-garden",fe="api/feiyu-garden",x=e=>Math.min(100,Math.max(0,e));function ge(e){let a=1;for(;e>=a*a*40;)a+=1;let r=(a-1)*(a-1)*40;return{level:a,into:e-r,span:a*a*40-r}}function G(e){return e>=85?"\u96C0\u8DC3":e>=65?"\u5F00\u5FC3":e>=45?"\u5E73\u9759":e>=25?"\u852B\u852B":"\u59D4\u5C48"}function de(){return{preview:!0,name:"\u5C0F\u80A5",createdAt:new Date().toISOString(),exp:0,level:1,levelInto:0,levelSpan:40,mood:72,moodLabel:"\u5F00\u5FC3",satiety:64,tokensFed:0,scene:"auto",settings:{reduceMotion:!1,chime:!0},stats:{pets:0,feeds:0,sessions:0,minutesTogether:0},log:[{id:"preview",at:new Date().toISOString(),kind:"born",text:"\u5979\u6E38\u8FDB\u4E86\u6D77\u8482\u82B1\u56ED"}]}}function B(e,a,r){return{...e,log:[{id:`opt_${Date.now().toString(36)}`,at:new Date().toISOString(),kind:a,text:r},...e.log]}}function X(e,a){let r=e.exp+a,s=ge(r);return{...e,exp:r,level:s.level,levelInto:s.into,levelSpan:s.span}}var pe={feed(e){let a=x(e.mood+6);return B(X({...e,mood:a,moodLabel:G(a),satiety:x(e.satiety+25),tokensFed:e.tokensFed+15,stats:{...e.stats,feeds:e.stats.feeds+1}},15),"feed","\u4F60\u5582\u4E86\u5979\u4E00\u628A\u9C7C\u7CAE")},pet(e){return B(X({...e,mood:x(e.mood+10),moodLabel:G(x(e.mood+10)),stats:{...e.stats,pets:e.stats.pets+1}},8),"pet","\u4F60\u6478\u4E86\u6478\u5979\u7684\u5934\uFF0C\u5979\u772F\u8D77\u4E86\u773C\u775B")},rename(e,a){return{...e,name:String(a.name??e.name).slice(0,12)}},scene(e,a){return{...e,scene:a.scene??e.scene}},settings(e,a){return{...e,settings:{...e.settings,...a}}}};async function A(e,a){let r=await fetch(`${fe}${e}`,a?{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(a)}:void 0);if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()}function ce(){let e=new Set,a={data:null,error:null,syncing:!0},r=null,s=0,n=()=>{a={...a},e.forEach(l=>l())},d=()=>r||(r=A("/state").then(l=>{a={data:l,error:null,syncing:!1}}).catch(l=>{a={...a,error:String(l?.message??l),syncing:!1},a.data||(s=setTimeout(()=>{s=0,d()},8e3))}).finally(()=>{r=null,n()}),r);return d(),{subscribe(l){return e.add(l),()=>e.delete(l)},get:()=>a,refresh:d,dispose(){clearTimeout(s),e.clear()},act(l,b={}){let u=pe[l];return u&&a.data&&(a={...a,data:u(a.data,b)},n()),A("/action",{type:l,...b}).then(c=>{c?.state&&(a={...a,data:c.state,error:null},n())}).catch(()=>{a={...a,error:"sync"},n()}),{burst:l==="feed"||l==="pet"?l:null}}}}function me(e){let[a,r]=t.default.useState(e.get());t.default.useEffect(()=>e.subscribe(()=>r(e.get())),[e]),t.default.useEffect(()=>{let n=setInterval(()=>{document.hidden||e.refresh()},45e3),d=()=>{document.hidden||e.refresh()};return document.addEventListener("visibilitychange",d),()=>{clearInterval(n),document.removeEventListener("visibilitychange",d)}},[e]);let s=t.default.useCallback((n,d={})=>e.act(n,d),[e]);return{data:a.data,error:a.error,syncing:a.syncing,load:e.refresh,act:s}}function S({value:e,label:a,tone:r}){let n=2*Math.PI*26;return t.default.createElement("div",{className:"fg-ring",title:a},t.default.createElement("svg",{viewBox:"0 0 64 64"},t.default.createElement("circle",{className:"fg-ring-bg",cx:"32",cy:"32",r:26}),t.default.createElement("circle",{className:`fg-ring-fg fg-tone-${r}`,cx:"32",cy:"32",r:26,strokeDasharray:n,strokeDashoffset:n*(1-Math.min(1,e/100))}),t.default.createElement("text",{x:"32",y:"37",className:"fg-ring-num"},Math.round(e))),t.default.createElement("span",null,a))}var ue={born:"\u{1F30A}",feed:"\u26A1",pet:"\u{1F497}",level:"\u2728",rename:"\u270F\uFE0F",companion:"\u{1F40B}"};function be(e){let a=Date.now()-new Date(e).getTime(),r=Math.floor(a/6e4);if(r<1)return f("\u521A\u521A");if(r<60)return`${r} ${f("\u5206\u949F\u524D")}`;let s=Math.floor(r/60);if(s<24)return`${s} ${f("\u5C0F\u65F6\u524D")}`;let n=Math.floor(s/24);if(n<7)return`${n} ${f("\u5929\u524D")}`;let d=new Date(e);return`${d.getMonth()+1}/${d.getDate()}`}function he({store:e}){W();let{data:a,error:r,syncing:s,load:n,act:d}=me(e),l=a??de(),[b,u]=t.default.useState(null),[c,p]=t.default.useState(!1),[_,h]=t.default.useState(!1),[M,z]=t.default.useState(""),[H,Q]=t.default.useState(!1),k=t.default.useRef(null),[U,J]=t.default.useState(1280);t.default.useEffect(()=>{let g=k.current;if(!g)return;let m=new ResizeObserver(([V])=>J(V.contentRect.width));return m.observe(g),()=>m.disconnect()},[]),t.default.useEffect(()=>{let g=setInterval(()=>p(m=>!m),14e3);return()=>clearInterval(g)},[]);let $=t.default.useCallback(g=>{let m=d(g);m.burst&&(u(m.burst),setTimeout(()=>u(null),1800))},[d]),v=D(l?.scene),L=!!l?.settings?.reduceMotion;return r&&!a&&r!=="sync"?t.default.createElement("div",{className:"fg-root",ref:k},t.default.createElement("style",null,N),t.default.createElement("div",{className:"fg-fail"},t.default.createElement("p",null,f("\u82B1\u56ED\u52A0\u8F7D\u5931\u8D25"),"\uFF1A",r),t.default.createElement("button",{type:"button",className:"fg-btn",onClick:n},f("\u91CD\u8BD5")))):t.default.createElement("div",{className:`fg-root fg-scene-${v} ${L?"fg-reduce":""} ${U<900?"is-narrow":""}`,ref:k},t.default.createElement("style",null,N),t.default.createElement(E,{scene:v}),t.default.createElement("div",{className:"fg-stage"},t.default.createElement(O,{mood:l.mood,burst:b,scene:v,flipped:c}),t.default.createElement("div",{className:"fg-stage-name"},t.default.createElement("span",{className:"fg-name"},l.name),t.default.createElement("span",{className:"fg-lv"},"Lv.",l.level),t.default.createElement("span",{className:`fg-moodchip fg-mood-${l.moodLabel}`},f(l.moodLabel)))),t.default.createElement("aside",{className:"fg-rail"},t.default.createElement("header",{className:"fg-head"},t.default.createElement("div",null,t.default.createElement("h1",null,f("\u6D77\u8482\u82B1\u56ED")),t.default.createElement("p",null,f("\u5979\u7684\u5C0F\u6D77\uFF0C\u4F60\u7684\u82B1\u56ED"))),(s||r==="sync")&&t.default.createElement("span",{className:`fg-sync ${r?"is-lost":""}`,title:f(r?"\u540C\u6B65\u5931\u8D25\uFF0C\u4ECD\u5728\u91CD\u8BD5":"\u6B63\u5728\u540C\u6B65")},f(r?"\u79BB\u7EBF":"\u540C\u6B65\u4E2D")),t.default.createElement("button",{type:"button",className:"fg-gear","aria-label":f("\u8BBE\u7F6E"),onClick:()=>Q(g=>!g)},t.default.createElement("svg",{viewBox:"0 0 20 20",width:"16",height:"16"},t.default.createElement("path",{fill:"currentColor",d:"M10 13.4a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8Zm8-2.1.9-.7a.6.6 0 0 0 .12-.78l-1.7-2.94a.6.6 0 0 0-.65-.27l-1.06.43a7.2 7.2 0 0 0-1.47-.85l-.16-1.13a.6.6 0 0 0-.6-.52h-3.4a.6.6 0 0 0-.6.52l-.16 1.13c-.52.21-1 .5-1.47.85l-1.06-.43a.6.6 0 0 0-.65.27L5.4 9.35a.6.6 0 0 0 .12.78l.9.7a7.4 7.4 0 0 0 0 1.7l-.9.7a.6.6 0 0 0-.12.78l1.7 2.94c.14.24.42.35.65.27l1.06-.43c.44.35.94.64 1.47.85l.16 1.13c.06.29.32.52.6.52h3.4c.3 0 .55-.23.6-.52l.16-1.13a7.2 7.2 0 0 0 1.47-.85l1.06.43c.24.1.51-.03.65-.27l1.7-2.94a.6.6 0 0 0-.12-.78l-.9-.7a7.4 7.4 0 0 0 0-1.7Z"})))),H&&l&&t.default.createElement("div",{className:"fg-settings"},t.default.createElement("label",{className:"fg-switchrow"},t.default.createElement("span",null,f("\u51CF\u5F31\u52A8\u6548")),t.default.createElement("input",{type:"checkbox",checked:L,onChange:g=>d("settings",{reduceMotion:g.target.checked})}))),t.default.createElement(t.default.Fragment,null,t.default.createElement("section",{className:"fg-card fg-rings"},t.default.createElement(S,{value:l.mood,label:f("\u5FC3\u60C5"),tone:"mood"}),t.default.createElement(S,{value:l.satiety,label:f("\u9971\u98DF"),tone:"food"}),t.default.createElement(S,{value:l.levelInto/l.levelSpan*100,label:`${f("\u4EB2\u5BC6")} Lv.${l.level}`,tone:"bond"})),t.default.createElement("section",{className:"fg-card fg-actions"},t.default.createElement("button",{type:"button",className:"fg-btn is-primary",onClick:()=>$("feed")},t.default.createElement("i",{className:"fg-ic"},"\u26A1"),f("\u5582\u5979")),t.default.createElement("button",{type:"button",className:"fg-btn",onClick:()=>$("pet")},t.default.createElement("i",{className:"fg-ic"},"\u{1F497}"),f("\u6478\u5934")),t.default.createElement("button",{type:"button",className:"fg-btn",onClick:()=>{z(l.name),h(!0)}},t.default.createElement("i",{className:"fg-ic"},"\u270F\uFE0F"),f("\u6539\u540D"))),t.default.createElement("section",{className:"fg-card fg-stats"},t.default.createElement("div",null,t.default.createElement("b",null,l.tokensFed),t.default.createElement("span",null,f("\u7D2F\u8BA1\u5077\u5403"))),t.default.createElement("div",null,t.default.createElement("b",null,l.stats.minutesTogether),t.default.createElement("span",null,f("\u966A\u4F34\u5206\u949F"))),t.default.createElement("div",null,t.default.createElement("b",null,l.stats.sessions),t.default.createElement("span",null,f("\u6B21\u4F1A\u8BDD")))),t.default.createElement("section",{className:"fg-card fg-diary"},t.default.createElement("h2",null,f("\u65E5\u8BB0")),t.default.createElement("ul",null,l.log.map(g=>t.default.createElement("li",{key:g.id},t.default.createElement("i",null,ue[g.kind]??"\xB7"),t.default.createElement("span",{className:"fg-log-text"},g.text),t.default.createElement("time",null,be(g.at)))))),t.default.createElement("section",{className:"fg-scenepick"},I.map(g=>t.default.createElement("button",{key:g.id,type:"button",title:f(g.zh),className:`fg-scenedot fg-dot-${g.id} ${l.scene===g.id?"is-on":""}`,onClick:()=>d("scene",{scene:g.id})}))))),_&&t.default.createElement("div",{className:"fg-modal-mask",onClick:()=>h(!1)},t.default.createElement("form",{className:"fg-modal",onClick:g=>g.stopPropagation(),onSubmit:async g=>{g.preventDefault();let m=M.trim();m&&(await d("rename",{name:m}),h(!1))}},t.default.createElement("h3",null,f("\u53EB\u5979\u4EC0\u4E48")),t.default.createElement("input",{autoFocus:!0,value:M,maxLength:12,onChange:g=>z(g.target.value)}),t.default.createElement("div",{className:"fg-modal-foot"},t.default.createElement("button",{type:"button",className:"fg-btn",onClick:()=>h(!1)},f("\u53D6\u6D88")),t.default.createElement("button",{type:"submit",className:"fg-btn is-primary"},f("\u4FDD\u5B58"))))))}function ye({size:e=18}){return t.default.createElement("svg",{viewBox:"0 0 24 24",width:e,height:e,"aria-hidden":"true"},t.default.createElement("path",{fill:"currentColor",d:"M4 13.5C4 9.4 8.2 6.5 13 6.5c3.6 0 7 1.9 7 5 0 2.6-2.7 4.5-6.3 4.5-1 0-2-.13-2.9-.4-.5 1.6-1.9 2.7-3.8 2.7-2.2 0-3-1.6-3-4.8Zm3.2-1a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",opacity:".95"}),t.default.createElement("path",{fill:"currentColor",d:"M15.5 4.6c.9-1.5 2.6-2 3.7-1.4-.7.6-1.2 1.4-1.4 2.3Z"}))}var xe=["slots"];function ke(e){let a=ce(),r=()=>t.default.createElement(he,{store:a});e.slots.inject("main",()=>e.slots.register({name:"main",key:F},r)),e.slots.inject("sidebar.panellist",()=>e.slots.register({name:"sidebar.panellist",id:F,order:6,label:()=>f("\u6D77\u8482\u82B1\u56ED")},ye))}
return module.exports}})
