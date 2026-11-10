import{r as T,j as i,B as d,a0 as S}from"./index-BU4HZ120.js";import{T as g}from"./ToolContent-CjwoZU6G.js";import{T as O}from"./ToolCodeInput-B4qd3B71.js";import{T as b}from"./ToolTextResult-BCDHIrPs.js";import{b as j}from"./service-dhi07ImW.js";import{m as N}from"./service-_vDI-PNv.js";import{S as f}from"./SimpleRadio-VOFogqpa.js";import{C as h}from"./CheckboxWithDesc-fXp_lhhe.js";import{T as y}from"./TextFieldWithDesc-BwhRJ_yB.js";import"./TextField-Bp_Vv8wg.js";import"./ContentPaste-DZwMmqju.js";import"./InputFooter-1OoUTJnY.js";import"./ResultFooter-CXZ4Ps21.js";import"./index-Djc6_I7M.js";import"./json-BIklKqoc.js";import"./Radio-XgWKoFzL.js";import"./SwitchBase-CUrR9BO-.js";import"./FormControlLabel-DBjytcX7.js";import"./Checkbox-Dj5qpksk.js";function k(t,e){if(!t)return"";const m=t.split(`
`),s=[];let c=[];const a=m.filter(l=>{const u=l.trim();return u&&(!e.skipEmptyLines||!J(u,e.delimiter))&&!u.startsWith(e.comment)});if(a.length===0)return"[]";e.useHeaders&&(c=C(a[0],e),a.shift());for(const l of a){const u=C(l,e);if(e.useHeaders){const n={};c.forEach((o,r)=>{n[o]=x(u[r],e.dynamicTypes)}),s.push(n)}else s.push(u.map(n=>x(n,e.dynamicTypes)))}return e.indentationType==="none"?N(JSON.stringify(s)).result:j(JSON.stringify(s),e)}const C=(t,e)=>{const m=[];let s="",c=!1;for(let a=0;a<t.length;a++){const l=t[a];l===e.quote?c=!c:l===e.delimiter&&!c?(m.push(s.trim()),s=""):s+=l}return m.push(s.trim()),m},x=(t,e)=>e?t.toLowerCase()==="true"?!0:t.toLowerCase()==="false"?!1:t==="null"?null:isNaN(Number(t))?t:Number(t):t;function J(t,e){return new RegExp(`^[${e}\\s]*$`).test(t)}const p={delimiter:"	",quote:'"',comment:"#",useHeaders:!0,skipEmptyLines:!0,dynamicTypes:!0,indentationType:"space",spacesCount:2},q=[{title:"Basic TSV to JSON Array",description:"Convert a simple TSV file into a JSON array structure by using spaces as formatting indentation.",sampleText:`name	age	city
John	30	New York
Alice	25	London`,sampleResult:`[
  {
    "name": "John",
    "age": 30,
    "city": "New York"
  },
  {
    "name": "Alice",
    "age": 25,
    "city": "London"
  }
]`,sampleOptions:{...p,useHeaders:!0,dynamicTypes:!0}},{title:"Turn TSV to JSON without Headers",description:"Convert a TSV file in minified JSON file.",sampleText:`Square	Triangle	Circle
Cube	Cone	Sphere
#Oval`,sampleResult:'[["Square","Triangle","Circle"],["Cube","Cone","Sphere"]]',sampleOptions:{...p,useHeaders:!1,indentationType:"none"}},{title:"Transform TSV to JSON with Headers",description:"Convert a TSV file with headers into a JSON file.",sampleText:`item	material	quantity


Hat	Wool	3
Gloves	Leather	5
Candle	Wax	4
Vase	Glass	2

Sculpture	Bronze	1
Table	Wood	1

Bookshelf	Wood	2`,sampleResult:`[
  {
    "item": "Hat",
    "material": "Wool",
    "quantity": 3
  },
  {
    "item": "Gloves",
    "material": "Leather",
    "quantity": 5
  },
  {
    "item": "Candle",
    "material": "Wax",
    "quantity": 4
  },
  {
    "item": "Vase",
    "material": "Glass",
    "quantity": 2
  },
  {
    "item": "Sculpture",
    "material": "Bronze",
    "quantity": 1
  },
  {
    "item": "Table",
    "material": "Wood",
    "quantity": 1
  },
  {
    "item": "Bookshelf",
    "material": "Wood",
    "quantity": 2
  }
]`,sampleOptions:{...p}}];function K({title:t,longDescription:e}){const[m,s]=T.useState(""),[c,a]=T.useState(""),l=(n,o)=>{a(k(o,n))},u=({values:n,updateField:o})=>[{title:"Input CSV Format",component:i.jsxs(d,{children:[i.jsx(y,{description:"Character used to qutoe tsv values",onOwnChange:r=>o("quote",r),value:n.quote}),i.jsx(y,{description:"Symbol use to mark comments in the TSV",value:n.comment,onOwnChange:r=>o("comment",r)})]})},{title:"Conversion Options",component:i.jsxs(d,{children:[i.jsx(h,{checked:n.useHeaders,onChange:r=>o("useHeaders",r),title:"Use Headers",description:"First row is treated as column headers"}),i.jsx(h,{checked:n.dynamicTypes,onChange:r=>o("dynamicTypes",r),title:"Dynamic Types",description:"Convert numbers and booleans to their proper types"})]})},{title:"Output Formatting",component:i.jsxs(d,{children:[i.jsx(f,{onClick:()=>o("indentationType","space"),checked:n.indentationType==="space",title:"Use Spaces for indentation"}),n.indentationType==="space"&&i.jsx(y,{description:"Number of spaces for indentation",value:n.spacesCount,onOwnChange:r=>S(r,"spacesCount",o),type:"number"}),i.jsx(f,{onClick:()=>o("indentationType","tab"),checked:n.indentationType==="tab",title:"Use Tabs for indentation"}),i.jsx(f,{onClick:()=>o("indentationType","none"),checked:n.indentationType==="none",title:"Minify JSON"})]})}];return i.jsx(g,{title:t,input:m,setInput:s,initialValues:p,compute:l,exampleCards:q,getGroups:u,inputComponent:i.jsx(O,{title:"Input TSV",value:m,onChange:s,language:"tsv"}),resultComponent:i.jsx(b,{title:"Output JSON",value:c,extension:"json"}),toolInfo:{title:`What is a ${t}?`,description:e}})}export{K as default};
