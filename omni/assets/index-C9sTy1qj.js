import{a as d,r as o,j as i}from"./index-BU4HZ120.js";import{T as g}from"./ToolContent-CjwoZU6G.js";import{T as y}from"./ToolCodeInput-B4qd3B71.js";import{T as b}from"./ToolCodeResult-21JyRy_c.js";import{m as h}from"./service-_vDI-PNv.js";import"./TextField-Bp_Vv8wg.js";import"./ContentPaste-DZwMmqju.js";import"./InputFooter-1OoUTJnY.js";import"./ResultFooter-CXZ4Ps21.js";import"./index-Djc6_I7M.js";import"./json-BIklKqoc.js";const x={},T=[{title:"Minify a Simple JSON Object",description:"This example shows how to minify a simple JSON object by removing all unnecessary whitespace.",sampleText:`{
  "name": "John Doe",
  "age": 30,
  "city": "New York"
}`,sampleResult:'{"name":"John Doe","age":30,"city":"New York"}',sampleOptions:{}},{title:"Minify a Nested JSON Structure",description:"This example demonstrates minification of a complex nested JSON structure with arrays and objects.",sampleText:`{
  "users": [
    {
      "id": 1,
      "name": "Alice",
      "hobbies": ["reading", "gaming"]
    },
    {
      "id": 2,
      "name": "Bob",
      "hobbies": ["swimming", "coding"]
    }
  ]
}`,sampleResult:'{"users":[{"id":1,"name":"Alice","hobbies":["reading","gaming"]},{"id":2,"name":"Bob","hobbies":["swimming","coding"]}]}',sampleOptions:{}}];function k({title:l}){const{t:e}=d("json"),[s,n]=o.useState(""),[p,a]=o.useState(""),[r,u]=o.useState("json"),c=(j,m)=>{if(m)try{const{result:t,format:f}=h(m);a(t),u(f)}catch(t){a(` ${t instanceof Error?t.message:"Invalid JSON format"}`)}};return i.jsx(g,{title:l,inputComponent:i.jsx(y,{title:e("minify.inputTitle"),value:s,onChange:n,language:r}),resultComponent:i.jsx(b,{title:e("minify.resultTitle"),value:p,language:r}),initialValues:x,getGroups:null,toolInfo:{title:e("minify.toolInfo.title"),description:e("minify.toolInfo.description")},exampleCards:T,input:s,setInput:n,compute:c})}export{k as default};
