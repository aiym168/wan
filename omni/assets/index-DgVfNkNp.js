import{a as T,r as h,j as c,B as f}from"./index-BU4HZ120.js";import{T as b}from"./ToolContent-CjwoZU6G.js";import{T as w}from"./ToolCodeInput-B4qd3B71.js";import{T as S}from"./ToolTextResult-BCDHIrPs.js";import{p as k,g as x}from"./json-BIklKqoc.js";import{C as J}from"./CheckboxWithDesc-fXp_lhhe.js";import{T as N}from"./TextFieldWithDesc-BwhRJ_yB.js";import{S as C}from"./SimpleRadio-VOFogqpa.js";import"./TextField-Bp_Vv8wg.js";import"./ContentPaste-DZwMmqju.js";import"./InputFooter-1OoUTJnY.js";import"./ResultFooter-CXZ4Ps21.js";import"./index-Djc6_I7M.js";import"./FormControlLabel-DBjytcX7.js";import"./Checkbox-Dj5qpksk.js";import"./SwitchBase-CUrR9BO-.js";import"./Radio-XgWKoFzL.js";function g(e,t="",o={}){if(e==null)return t&&(o[t]=""),o;if(typeof e!="object")return t&&(o[t]=String(e)),o;if(Array.isArray(e))return e.forEach((s,i)=>{const r=t?`${t}[${i}]`:`[${i}]`;g(s,r,o)}),o;for(const[s,i]of Object.entries(e)){const r=t?`${t}.${s}`:s;g(i,r,o)}return o}function v(e){if(Array.isArray(e))return e.map(t=>g(t));if(typeof e=="object"&&e!==null)return[g(e)];throw new Error("JSON input must be an object or array of objects, not a bare primitive.")}function j(e,t){const{delimiter:o,quoteStrings:s}=t,i=e.replace(/"/g,'""'),r=e.includes(o)||e.includes('"')||e.includes(`
`)||e.includes("\r");return s==="always"?`"${i}"`:r?`"${i}"`:e}function O(e,t){const{delimiter:o,includeHeaders:s}=t;if(!o)throw new Error("No CSV delimiter.");const{data:i,format:r}=k(e),m=v(i).filter(n=>Object.keys(n).length>0);if(m.length===0)throw new Error("No data found in the provided JSON.");const d=x(m),p=[];s&&p.push(d.map(n=>j(n,t)).join(o));for(const n of m){const l=d.map(a=>j(n[a]??"",t)).join(o);p.push(l)}return{result:p.join(`\r
`),inputFormat:r}}const u={delimiter:",",includeHeaders:!0,quoteStrings:"auto"},R=[{title:"Array of objects",description:"Convert multiple JSON objects into CSV rows, one row per object.",sampleText:`[
  { "name": "John Doe", "age": 25, "city": "New York" },
  { "name": "Jane Doe", "age": 30, "city": "Los Angeles" },
  { "name": "Bob Smith", "age": 22, "city": "Chicago" }
]`,sampleResult:`name,age,city
John Doe,25,New York
Jane Doe,30,Los Angeles
Bob Smith,22,Chicago`,sampleOptions:{...u}},{title:"Nested object (dot notation)",description:"Nested keys are flattened using dot notation (e.g. address.city).",sampleText:`[
  {
    "name": "John Doe",
    "age": 25,
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001"
    },
    "hobbies": ["reading", "running"]
  }
]`,sampleResult:`name,age,address.street,address.city,address.state,address.postalCode,hobbies[0],hobbies[1]
John Doe,25,123 Main St,New York,NY,10001,reading,running`,sampleOptions:{...u}},{title:"Sparse rows",description:"Missing keys are filled with empty values to keep columns aligned.",sampleText:`[
  { "name": "Alice", "age": 30 },
  { "name": "Bob", "city": "Paris" },
  { "name": "Carol", "age": 25, "city": "Rome" }
]`,sampleResult:`name,age,city
Alice,30,
Bob,,Paris
Carol,25,Rome`,sampleOptions:{...u}}];function G({title:e}){const{t}=T("json"),[o,s]=h.useState(""),[i,r]=h.useState(""),[m,d]=h.useState("json"),p=(n,l)=>{if(l)try{const{result:a,inputFormat:y}=O(l,n);r(a),d(y)}catch(a){r(` ${a instanceof Error?a.message:"Invalid JSON format"}`)}};return c.jsx(b,{title:e,input:o,setInput:s,initialValues:u,compute:p,exampleCards:R,inputComponent:c.jsx(w,{title:t("jsonToCsv.inputTitle"),value:o,onChange:s,language:m}),resultComponent:c.jsx(S,{title:t("jsonToCsv.outputTitle"),value:i,extension:"csv"}),getGroups:({values:n,updateField:l})=>[{title:t("jsonToCsv.delimiterOption"),component:c.jsx(f,{children:c.jsx(N,{description:t("jsonToCsv.options.delimiter"),value:n.delimiter,onOwnChange:a=>l("delimiter",a)})})},{title:t("jsonToCsv.quotingOption"),component:c.jsxs(f,{children:[c.jsx(C,{checked:n.quoteStrings==="auto",title:t("jsonToCsv.options.autoQuote.label"),description:t("jsonToCsv.options.autoQuote.description"),onClick:()=>l("quoteStrings","auto")}),c.jsx(C,{checked:n.quoteStrings==="always",title:t("jsonToCsv.options.alwaysQuote.label"),description:t("jsonToCsv.options.alwaysQuote.description"),onClick:()=>l("quoteStrings","always")})]})},{title:t("jsonToCsv.headerOption"),component:c.jsx(f,{children:c.jsx(J,{checked:n.includeHeaders,onChange:a=>l("includeHeaders",a),title:t("jsonToCsv.options.header.label"),description:t("jsonToCsv.options.header.description")})})}]})}export{G as default};
