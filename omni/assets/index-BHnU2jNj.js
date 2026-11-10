import{Y as j,a as X,r as d,j as c,B as y}from"./index-BU4HZ120.js";import{T as b}from"./ToolContent-CjwoZU6G.js";import{T as S}from"./ToolCodeInput-B4qd3B71.js";import{T as k}from"./ToolCodeResult-21JyRy_c.js";import{n as C}from"./xml-B1rHXEYJ.js";import{p as A}from"./json-BIklKqoc.js";import{C as I}from"./CheckboxWithDesc-fXp_lhhe.js";import{S as f}from"./SimpleRadio-VOFogqpa.js";import"./TextField-Bp_Vv8wg.js";import"./ContentPaste-DZwMmqju.js";import"./InputFooter-1OoUTJnY.js";import"./ResultFooter-CXZ4Ps21.js";import"./index-Djc6_I7M.js";import"./FormControlLabel-DBjytcX7.js";import"./Checkbox-Dj5qpksk.js";import"./SwitchBase-CUrR9BO-.js";import"./Radio-XgWKoFzL.js";const h=100,J=(s,t)=>{const{data:o,format:n}=A(s);if(typeof o!="object"||o===null)throw new Error("JSON root value must be an object or array.");const e=[],l=t.indentationType==="none"?"":`
`;return t.addMetaTag&&e.push(`<?xml version="1.0" encoding="UTF-8"?>${l}`),e.push(`<root>${l}`),Array.isArray(o)?o.forEach(r=>{e.push(M(r,t,1))}):e.push(T(o,t,1)),e.push("</root>"),{result:e.join(""),inputFormat:n}},M=(s,t,o)=>{const n=$(t,o),e=t.indentationType==="none"?"":`
`;return typeof s=="object"&&s!==null&&!Array.isArray(s)?`${n}<item>${e}${T(s,t,o+1)}${n}</item>${e}`:`${n}<item>${j(String(s))}</item>${e}`},T=(s,t,o)=>{if(o>h)throw new Error(`JSON nesting exceeds maximum depth of ${h}.`);const n=[],e=t.indentationType==="none"?"":`
`;for(const[l,r]of Object.entries(s)){const i=C(l),p=$(t,o);if(r===null){n.push(`${p}<${i}></${i}>${e}`);continue}if(Array.isArray(r)){r.forEach(a=>{n.push(`${p}<${i}>`),typeof a=="object"&&a!==null&&!Array.isArray(a)?(n.push(e),n.push(T(a,t,o+1)),n.push(p)):n.push(j(String(a))),n.push(`</${i}>${e}`)});continue}if(typeof r=="object"){n.push(`${p}<${i}>${e}`),n.push(T(r,t,o+1)),n.push(`${p}</${i}>${e}`);continue}n.push(`${p}<${i}>${j(String(r))}</${i}>${e}`)}return n.join("")},$=(s,t)=>{switch(s.indentationType){case"space":return"  ".repeat(t);case"tab":return"	".repeat(t);default:return""}},g={indentationType:"space",addMetaTag:!1},w=[{title:"Basic JSON to XML",description:"Convert a simple JSON object into an XML format.",sampleText:`
{
  "users": [
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
  ]
}`,sampleResult:`<root>
	<users>
		<name>John</name>
		<age>30</age>
		<city>New York</city>
	</users>
	<users>
		<name>Alice</name>
		<age>25</age>
		<city>London</city>
	</users>
</root>`,sampleOptions:{...g}}];function W({title:s}){const{t}=X("json"),[o,n]=d.useState(""),[e,l]=d.useState(""),[r,i]=d.useState("json"),p=(a,u)=>{if(u)try{const{result:m,inputFormat:x}=J(u,a);l(m),i(x)}catch(m){l(`${m instanceof Error?m.message:"Invalid Json format"}`)}};return c.jsx(b,{title:s,input:o,setInput:n,initialValues:g,compute:p,exampleCards:w,inputComponent:c.jsx(S,{title:t("jsonToXml.inputTitle"),value:o,onChange:n,language:r}),resultComponent:c.jsx(k,{title:t("jsonToXml.outputTitle"),value:e,language:"xml"}),getGroups:({values:a,updateField:u})=>[{title:"Output XML Indentation",component:c.jsxs(y,{children:[c.jsx(f,{checked:a.indentationType==="space",title:t("jsonToXml.options.useSpaceTitle"),description:t("jsonToXml.options.useSpaceDesc"),onClick:()=>u("indentationType","space")}),c.jsx(f,{checked:a.indentationType==="tab",title:t("jsonToXml.options.useTabTitle"),description:t("jsonToXml.options.useTabDesc"),onClick:()=>u("indentationType","tab")}),c.jsx(f,{checked:a.indentationType==="none",title:t("jsonToXml.options.noIdentTitle"),description:t("jsonToXml.options.noIdentDesc"),onClick:()=>u("indentationType","none")})]})},{title:t("jsonToXml.options.metaInfoTitle"),component:c.jsx(y,{children:c.jsx(I,{checked:a.addMetaTag,onChange:m=>u("addMetaTag",m),title:t("jsonToXml.options.addMetaTagTitle"),description:t("jsonToXml.options.addMetaTagDesc")})})}]})}export{W as default};
