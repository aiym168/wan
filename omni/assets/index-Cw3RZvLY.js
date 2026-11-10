import{Y as g,r as f,j as m,B as h}from"./index-BU4HZ120.js";import{T}from"./ToolContent-CjwoZU6G.js";import{T as y}from"./ToolTextInput-DsyGN2G7.js";import{T as v}from"./ToolTextResult-BCDHIrPs.js";import{n as j}from"./xml-B1rHXEYJ.js";import{C as x}from"./CheckboxWithDesc-fXp_lhhe.js";import{T as c}from"./TextFieldWithDesc-BwhRJ_yB.js";import"./TextField-Bp_Vv8wg.js";import"./ContentPaste-DZwMmqju.js";import"./InputFooter-1OoUTJnY.js";import"./ResultFooter-CXZ4Ps21.js";import"./index-Djc6_I7M.js";import"./FormControlLabel-DBjytcX7.js";import"./Checkbox-Dj5qpksk.js";import"./SwitchBase-CUrR9BO-.js";const w=(l,o)=>{const a=l.split(`
`).map(e=>e.trim());let r=`<?xml version="1.0" encoding="UTF-8" ?>
<root>
`,i=[];const s=a.filter(e=>e&&!e.startsWith(o.comment)&&(!o.skipEmptyLines||e.trim()!==""));if(s.length===0)return`<?xml version="1.0" encoding="UTF-8" ?>
<root></root>`;if(o.useHeaders)i=u(s[0],o).map(j),s.shift();else{const e=u(s[0],o).length;i=Array.from({length:e},(n,t)=>`col${t+1}`)}return s.forEach((e,n)=>{const t=u(e,o);r+=`  <row id="${n}">
`,i.forEach((p,d)=>{r+=`    <${p}>${g(t[d]||"")}</${p}>
`}),r+=`  </row>
`}),r+="</root>",r},u=(l,o)=>{const a=[];let r="",i=!1;for(let s=0;s<l.length;s++){const e=l[s];i?e===o.quote?l[s+1]===o.quote?(r+=o.quote,s++):i=!1:r+=e:e===o.quote&&r===""?i=!0:e===o.delimiter?(a.push(r.trim()),r=""):r+=e}return a.push(r.trim()),a},C={delimiter:",",quote:'"',comment:"#",useHeaders:!0,skipEmptyLines:!0},L=[{title:"Basic CSV to XML",description:"Convert a simple CSV file into an XML format.",sampleText:`name,age,city
John,30,New York
Alice,25,London`,sampleResult:`<root>
  <row>
    <name>John</name>
    <age>30</age>
    <city>New York</city>
  </row>
  <row>
    <name>Alice</name>
    <age>25</age>
    <city>London</city>
  </row>
</root>`,sampleOptions:{...C,useHeaders:!0}}];function N({title:l}){const[o,a]=f.useState(""),[r,i]=f.useState(""),s=(e,n)=>{if(n)try{const t=w(n,e);i(t)}catch(t){i(`Error: ${t instanceof Error?t.message:"Invalid CSV format"}`)}};return m.jsx(T,{title:l,input:o,setInput:a,initialValues:C,compute:s,exampleCards:L,inputComponent:m.jsx(y,{title:"Input CSV",value:o,onChange:a}),resultComponent:m.jsx(v,{title:"Output XML",value:r,extension:"xml"}),getGroups:({values:e,updateField:n})=>[{title:"Input CSV Format",component:m.jsxs(h,{children:[m.jsx(c,{description:"Column Separator",value:e.delimiter,onOwnChange:t=>n("delimiter",t)}),m.jsx(c,{description:"Field Quote",onOwnChange:t=>n("quote",t),value:e.quote}),m.jsx(c,{description:"Comment Symbol",value:e.comment,onOwnChange:t=>n("comment",t)})]})},{title:"Conversion Options",component:m.jsxs(h,{children:[m.jsx(x,{checked:e.useHeaders,onChange:t=>n("useHeaders",t),title:"Use Headers",description:"First row is treated as column headers"}),m.jsx(x,{checked:e.skipEmptyLines,onChange:t=>n("skipEmptyLines",t),title:"Skip Empty Lines",description:"Don't process empty lines in the CSV"})]})}]})}export{N as default};
