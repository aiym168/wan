import{A as N,E as z,r as E,F as U,_ as q,J as c,j as t,K as H,M as d,N as K,s as x,av as b,aw as M,i as B,k as V,a as W,S as A,h as S}from"./index-CZybyyg9.js";import{d as G}from"./ContentPaste-Buz3qiOw.js";function J(r){return N("MuiCircularProgress",r)}z("MuiCircularProgress",["root","determinate","indeterminate","colorPrimary","colorSecondary","svg","circle","circleDeterminate","circleIndeterminate","circleDisableShrink"]);const L=["className","color","disableShrink","size","style","thickness","value","variant"];let f=r=>r,_,j,D,R;const a=44,O=M(_||(_=f`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`)),T=M(j||(j=f`
  0% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -15px;
  }

  100% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -125px;
  }
`)),Z=r=>{const{classes:e,variant:s,color:o,disableShrink:n}=r,i={root:["root",s,`color${d(o)}`],svg:["svg"],circle:["circle",`circle${d(s)}`,n&&"circleDisableShrink"]};return K(i,J,e)},Q=x("span",{name:"MuiCircularProgress",slot:"Root",overridesResolver:(r,e)=>{const{ownerState:s}=r;return[e.root,e[s.variant],e[`color${d(s.color)}`]]}})(({ownerState:r,theme:e})=>c({display:"inline-block"},r.variant==="determinate"&&{transition:e.transitions.create("transform")},r.color!=="inherit"&&{color:(e.vars||e).palette[r.color].main}),({ownerState:r})=>r.variant==="indeterminate"&&b(D||(D=f`
      animation: ${0} 1.4s linear infinite;
    `),O)),X=x("svg",{name:"MuiCircularProgress",slot:"Svg",overridesResolver:(r,e)=>e.svg})({display:"block"}),Y=x("circle",{name:"MuiCircularProgress",slot:"Circle",overridesResolver:(r,e)=>{const{ownerState:s}=r;return[e.circle,e[`circle${d(s.variant)}`],s.disableShrink&&e.circleDisableShrink]}})(({ownerState:r,theme:e})=>c({stroke:"currentColor"},r.variant==="determinate"&&{transition:e.transitions.create("stroke-dashoffset")},r.variant==="indeterminate"&&{strokeDasharray:"80px, 200px",strokeDashoffset:0}),({ownerState:r})=>r.variant==="indeterminate"&&!r.disableShrink&&b(R||(R=f`
      animation: ${0} 1.4s ease-in-out infinite;
    `),T)),or=E.forwardRef(function(e,s){const o=U({props:e,name:"MuiCircularProgress"}),{className:n,color:i="primary",disableShrink:w=!1,size:p=40,style:I,thickness:l=3.6,value:v=0,variant:k="indeterminate"}=o,F=q(o,L),u=c({},o,{color:i,disableShrink:w,size:p,thickness:l,value:v,variant:k}),m=Z(u),h={},C={},y={};if(k==="determinate"){const P=2*Math.PI*((a-l)/2);h.strokeDasharray=P.toFixed(3),y["aria-valuenow"]=Math.round(v),h.strokeDashoffset=`${((100-v)/100*P).toFixed(3)}px`,C.transform="rotate(-90deg)"}return t.jsx(Q,c({className:H(m.root,n),style:c({width:p,height:p},C,I),ownerState:u,ref:s,role:"progressbar"},y,F,{children:t.jsx(X,{className:m.svg,ownerState:u,viewBox:`${a/2} ${a/2} ${a} ${a}`,children:t.jsx(Y,{className:m.circle,style:h,ownerState:u,cx:a,cy:a,r:(a-l)/2,fill:"none",strokeWidth:l})})}))});var g={},rr=V;Object.defineProperty(g,"__esModule",{value:!0});var $=g.default=void 0,er=rr(B()),sr=t;$=g.default=(0,er.default)((0,sr.jsx)("path",{d:"M5 20h14v-2H5zM19 9h-4V3H9v6H5l7 7z"}),"Download");function ir({handleDownload:r,handleCopy:e,disabled:s,hideCopy:o,downloadLabel:n}){const{t:i}=W();return t.jsxs(A,{mt:1,direction:"row",spacing:2,children:[t.jsx(S,{disabled:s,onClick:r,startIcon:t.jsx($,{}),children:n||i("resultFooter.download")}),!o&&t.jsx(S,{disabled:s,onClick:e,startIcon:t.jsx(G,{}),children:i("resultFooter.copy")})]})}export{or as C,ir as R};
