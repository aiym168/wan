import{a as k,r as b,j as m,B as x}from"./index-BU4HZ120.js";import{T as O}from"./ToolCodeInput-B4qd3B71.js";import{T as C}from"./ToolCodeResult-21JyRy_c.js";import{p as A,g as T}from"./json-BIklKqoc.js";import{S as J}from"./SelectWithDesc-Df_1TatG.js";import{T as w}from"./ToolContent-CjwoZU6G.js";import"./ContentPaste-DZwMmqju.js";import"./InputFooter-1OoUTJnY.js";import"./ResultFooter-CXZ4Ps21.js";import"./index-Djc6_I7M.js";import"./TextField-Bp_Vv8wg.js";import"./MenuItem-qtntJzrn.js";const j=(a,p)=>{const e=Object.keys(a).sort((i,r)=>{const n=i.localeCompare(r);return p==="asc"?n:-n}),o={};for(const i of e)o[i]=a[i];return o},h=(a,p)=>p==="jsonl"&&Array.isArray(a)?a.map(e=>JSON.stringify(e)).join(`
`):JSON.stringify(a,null,2),N=(a,p)=>{const{mode:e,order:o,key:i}=p,{data:r,format:n}=A(a);if(e==="key"){if(Array.isArray(r)){if(r.length===0)throw new Error("Array is empty");const u=r.map(y=>j(y,o));return{result:h(u,n),format:n}}if(typeof r!="object"||r===null)throw new Error("Input must be a JSON object or array of objects");return{result:h(j(r,o),n),format:n}}if(!Array.isArray(r))throw new Error("Input must be a JSON array");if(r.length===0)throw new Error("Array is empty");const f=[...r].sort((u,y)=>{const d=u,g=y,c=d[i],t=g[i];if(c==null&&t==null)return 0;if(c==null)return 1;if(t==null)return-1;if(typeof c=="object"&&typeof t=="object"){const l=JSON.stringify(c),s=JSON.stringify(t);return l<s?o==="asc"?-1:1:l>s?o==="asc"?1:-1:0}return c<t?o==="asc"?-1:1:c>t?o==="asc"?1:-1:0});return{result:h(f,n),format:n}},v={mode:"value",key:"",order:"asc"},E=[{title:"Sort by name ascending",description:'Sort a JSON array of objects alphabetically by the "name" key.',sampleText:'[{"name":"Charlie","age":30},{"name":"Alice","age":25},{"name":"Bob","age":35}]',sampleResult:`[
  {
    "name": "Alice",
    "age": 25
  },
  {
    "name": "Bob",
    "age": 35
  },
  {
    "name": "Charlie",
    "age": 30
  }
]`,sampleOptions:{mode:"value",key:"name",order:"asc"}},{title:"Sort object keys alphabetically",description:"Sort the keys of a JSON object alphabetically in ascending order.",sampleText:'{"zebra":1,"apple":2,"mango":3}',sampleResult:`{
  "apple": 2,
  "mango": 3,
  "zebra": 1
}`,sampleOptions:{mode:"key",key:"",order:"asc"}}];function q({title:a,longDescription:p}){const{t:e}=k("json"),[o,i]=b.useState(""),[r,n]=b.useState(""),[f,u]=b.useState("json"),y=(t,l)=>{if(l)try{const{result:s,format:S}=N(l,t);n(s),u(S)}catch(s){n(` ${s instanceof Error?s.message:"Invalid JSON format"}`)}},d=T(o),g=d.length>0?d.map(t=>({label:t,value:t})):[],c=({values:t,updateField:l})=>[{title:e("sortJson.options.title"),component:m.jsxs(x,{children:[m.jsx(J,{selected:t.mode,options:[{label:e("sortJson.options.sortByValue"),value:"value"},{label:e("sortJson.options.sortByKey"),value:"key"}],onChange:s=>{l("mode",s),l("key","")},description:e("sortJson.options.modeDescription")}),t.mode==="value"&&m.jsx(J,{selected:t.key,options:[{label:"Please select a key",value:""},...g],onChange:s=>l("key",s),description:e("sortJson.options.keyDescription")}),m.jsx(J,{selected:t.order,options:[{label:e("sortJson.options.ascending"),value:"asc"},{label:e("sortJson.options.descending"),value:"desc"}],onChange:s=>l("order",s),description:e("sortJson.options.orderDescription")})]})}];return m.jsx(w,{title:a,inputComponent:m.jsx(O,{title:e("sortJson.inputTitle"),value:o,onChange:i,language:f}),resultComponent:m.jsx(C,{title:e("sortJson.resultTitle"),value:r,language:f}),initialValues:v,getGroups:c,compute:y,input:o,setInput:i,exampleCards:E,toolInfo:{title:`What is a ${a}?`,description:p}})}export{q as default};
