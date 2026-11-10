import{a as d,r as o,j as i}from"./index-CZybyyg9.js";import{T as g}from"./ToolContent-Bd6fLJl_.js";import{T as y}from"./ToolCodeInput-BhAE93l-.js";import{T as b}from"./ToolCodeResult-Bej2mKUQ.js";import{m as h}from"./service-_vDI-PNv.js";import"./TextField-BAaRYrNT.js";import"./ContentPaste-Buz3qiOw.js";import"./InputFooter-pt5Fl6zr.js";import"./ResultFooter-7IET4Cnp.js";import"./index-Djc6_I7M.js";import"./json-BIklKqoc.js";const x={},T=[{title:"Minify a Simple JSON Object",description:"This example shows how to minify a simple JSON object by removing all unnecessary whitespace.",sampleText:`{
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
