import{a as f,r as o,j as a}from"./index-CZybyyg9.js";import{T as h}from"./ToolCodeInput-BhAE93l-.js";import{T as v}from"./ToolTextResult-CS8CdXTe.js";import{p as g}from"./json-BIklKqoc.js";import{T as x}from"./ToolContent-Bd6fLJl_.js";import"./ContentPaste-Buz3qiOw.js";import"./InputFooter-pt5Fl6zr.js";import"./ResultFooter-7IET4Cnp.js";import"./index-Djc6_I7M.js";import"./TextField-BAaRYrNT.js";const T=t=>{try{const{format:e}=g(t);return{valid:!0,format:e}}catch(e){return e instanceof Error?{valid:!1,error:e.message}:{valid:!1,error:"Unknown error occurred"}}},y=[{title:"Valid JSON Object",description:"This example shows a correctly formatted JSON object. All property names and string values are enclosed in double quotes, and the overall structure is properly balanced with opening and closing braces.",sampleText:`{
  "name": "John",
  "age": 30,
  "city": "New York"
}`,sampleResult:"✅ Valid JSON",sampleOptions:{}},{title:"Invalid JSON Missing Quotes",description:"This example demonstrates an invalid JSON object where the property names are not enclosed in double quotes. According to the JSON standard, property names must always be enclosed in double quotes. Omitting the quotes will result in a syntax error.",sampleText:`{
  name: "John",
  age: 30,
  city: "New York"
}`,sampleResult:"❌ Error: Expected property name or '}' in JSON",sampleOptions:{}},{title:"Invalid JSON with Trailing Comma",description:"This example shows an invalid JSON object with a trailing comma after the last key-value pair. In JSON, trailing commas are not allowed because they create ambiguity when parsing the data structure.",sampleText:`{
  "name": "John",
  "age": 30,
  "city": "New York",
}`,sampleResult:"❌ Error: Expected double-quoted property name",sampleOptions:{}}];function q({title:t}){const{t:e}=f("json"),[s,r]=o.useState(""),[p,n]=o.useState(""),[i,m]=o.useState("json"),u=(O,l)=>{if(l){const{valid:d,error:c,format:J}=T(l);d?(n(e("validateJson.validJson")),m(J)):n(e("validateJson.invalidJson",{error:c}))}};return a.jsx(x,{title:t,inputComponent:a.jsx(h,{title:e("validateJson.inputTitle"),value:s,onChange:r,language:i||"json"}),resultComponent:a.jsx(v,{title:e("validateJson.resultTitle"),value:p}),initialValues:{},getGroups:null,toolInfo:{title:e("validateJson.toolInfo.title"),description:e("validateJson.toolInfo.description")},exampleCards:y,input:s,setInput:r,compute:u})}export{q as default};
