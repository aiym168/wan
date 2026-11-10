import{a as J,r as T,j as r,B as y}from"./index-CZybyyg9.js";import{T as v}from"./ToolContent-Bd6fLJl_.js";import{T as g}from"./ToolTextInput-CKsb_Rab.js";import{T as L}from"./ToolTextResult-CS8CdXTe.js";import{C as u}from"./CheckboxWithDesc-CCXkRjIT.js";import{T as d}from"./TextFieldWithDesc-aF9TFoAR.js";import"./TextField-BAaRYrNT.js";import"./ContentPaste-Buz3qiOw.js";import"./InputFooter-pt5Fl6zr.js";import"./ResultFooter-7IET4Cnp.js";import"./index-Djc6_I7M.js";import"./FormControlLabel-2LzZzeyg.js";import"./Checkbox-CSzIQgsq.js";import"./SwitchBase-BWXYtFov.js";const j={delimiter:",",quote:'"',comment:"#",useHeaders:!0,skipEmptyLines:!0,dynamicTypes:!0},k=(o,e={})=>{const s={...j,...e},a=o.split(`
`),m=[];let p=[];const c=a.filter(n=>{const i=n.trim();return i&&(!s.skipEmptyLines||!E(i,s.delimiter))&&!i.startsWith(s.comment)});if(c.length===0)return"[]";s.useHeaders&&(p=f(c[0],s),c.shift());for(const n of c){const i=f(n,s);if(s.useHeaders){const t={};p.forEach((C,x)=>{t[C]=h(i[x],s.dynamicTypes)}),m.push(t)}else m.push(i.map(t=>h(t,s.dynamicTypes)))}return JSON.stringify(m,null,2)},f=(o,e)=>{const s=[];let a="",m=!1;for(let p=0;p<o.length;p++){const c=o[p];c===e.quote?m=!m:c===e.delimiter&&!m?(s.push(a.trim()),a=""):a+=c}return s.push(a.trim()),s},h=(o,e)=>e?o.toLowerCase()==="true"?!0:o.toLowerCase()==="false"?!1:o==="null"?null:isNaN(Number(o))?o:Number(o):o;function E(o,e){return new RegExp(`^[${e}\\s]*$`).test(o)}const l={delimiter:",",quote:'"',comment:"#",useHeaders:!0,skipEmptyLines:!0,dynamicTypes:!0,indentationType:"space",spacesCount:2},S=[{title:"Basic CSV to JSON Array",description:"Convert a simple CSV file into a JSON array structure.",sampleText:`name,age,city
John,30,New York
Alice,25,London`,sampleResult:`[
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
]`,sampleOptions:{...l,useHeaders:!0,dynamicTypes:!0}},{title:"CSV with Custom Delimiter",description:"Convert a CSV file that uses semicolons as separators.",sampleText:`product;price;quantity
Apple;1.99;50
Banana;0.99;100`,sampleResult:`[
  {
    "product": "Apple",
    "price": 1.99,
    "quantity": 50
  },
  {
    "product": "Banana",
    "price": 0.99,
    "quantity": 100
  }
]`,sampleOptions:{...l,delimiter:";"}},{title:"CSV with Comments and Empty Lines",description:"Process CSV data while handling comments and empty lines.",sampleText:`# This is a comment
id,name,active
1,John,true

# Another comment
2,Jane,false

3,Bob,true`,sampleResult:`[
  {
    "id": 1,
    "name": "John",
    "active": true
  },
  {
    "id": 2,
    "name": "Jane",
    "active": false
  },
  {
    "id": 3,
    "name": "Bob",
    "active": true
  }
]`,sampleOptions:{...l,skipEmptyLines:!0,comment:"#"}}];function Q({title:o}){const{t:e}=J("csv"),[s,a]=T.useState(""),[m,p]=T.useState(""),c=(n,i)=>{if(i)try{const t=k(i,{delimiter:n.delimiter,quote:n.quote,comment:n.comment,useHeaders:n.useHeaders,skipEmptyLines:n.skipEmptyLines,dynamicTypes:n.dynamicTypes});p(t)}catch(t){p(`${e("csvToJson.error")}: ${t instanceof Error?t.message:e("csvToJson.invalidCsvFormat")}`)}};return r.jsx(v,{title:o,input:s,setInput:a,initialValues:l,compute:c,exampleCards:S,inputComponent:r.jsx(g,{title:e("csvToJson.inputTitle"),value:s,onChange:a}),resultComponent:r.jsx(L,{title:e("csvToJson.resultTitle"),value:m,extension:"json"}),getGroups:({values:n,updateField:i})=>[{title:e("csvToJson.inputCsvFormat"),component:r.jsxs(y,{children:[r.jsx(d,{description:e("csvToJson.columnSeparator"),value:n.delimiter,onOwnChange:t=>i("delimiter",t)}),r.jsx(d,{description:e("csvToJson.fieldQuote"),onOwnChange:t=>i("quote",t),value:n.quote}),r.jsx(d,{description:e("csvToJson.commentSymbol"),value:n.comment,onOwnChange:t=>i("comment",t)})]})},{title:e("csvToJson.conversionOptions"),component:r.jsxs(y,{children:[r.jsx(u,{checked:n.useHeaders,onChange:t=>i("useHeaders",t),title:e("csvToJson.useHeaders"),description:e("csvToJson.useHeadersDescription")}),r.jsx(u,{checked:n.skipEmptyLines,onChange:t=>i("skipEmptyLines",t),title:e("csvToJson.skipEmptyLines"),description:e("csvToJson.skipEmptyLinesDescription")}),r.jsx(u,{checked:n.dynamicTypes,onChange:t=>i("dynamicTypes",t),title:e("csvToJson.dynamicTypes"),description:e("csvToJson.dynamicTypesDescription")})]})}],toolInfo:{title:e("csvToJson.toolInfo.title"),description:e("csvToJson.toolInfo.description")}})}export{Q as default};
