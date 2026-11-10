import{a as b,r as u,j as r,B as T}from"./index-BU4HZ120.js";import{T as y}from"./ToolContent-CjwoZU6G.js";import{T as v}from"./ToolTextInput-DsyGN2G7.js";import{T as d}from"./ToolTextResult-BCDHIrPs.js";import{S as c}from"./SelectWithDesc-Df_1TatG.js";import{T as x}from"./TextFieldWithDesc-BwhRJ_yB.js";import"./TextField-Bp_Vv8wg.js";import"./ContentPaste-DZwMmqju.js";import"./InputFooter-1OoUTJnY.js";import"./ResultFooter-CXZ4Ps21.js";import"./index-Djc6_I7M.js";import"./MenuItem-qtntJzrn.js";const B=["b","B","KB","MB","GB","TB","PB","EB"],C=["b","B","KiB","MiB","GiB","TiB","PiB","EiB"],f=[...B,...C.filter(s=>!B.includes(s))],h={b:1/8,B:1,KB:1e3,MB:1e6,GB:1e9,TB:1e12,PB:1e15,EB:1e18,KiB:1024,MiB:1024**2,GiB:1024**3,TiB:1024**4,PiB:1024**5,EiB:1024**6};function G(s,e,p,i){if(i<0||s<0)return 0;const a=s*h[e]/h[p];return Number(a.toFixed(i))}function g(s,e){if(!s)return"";const p=s.split(`
`),i=[],{fromUnit:m,toUnit:a,precision:l}=e;for(const n of p){const o=n.trim();if(!o){i.push("");continue}const t=G(Number(o),m,a,l);i.push(String(t))}return i.join(`
`)}const U={fromUnit:"GB",toUnit:"KB",precision:2},S=[{title:"Convert Gigabytes to Megabytes",description:"This example converts a list of storage values in Gigabytes (GB) into Megabytes (MB) using the SI system. Each line represents a different storage size. The output shows the same values converted to MB with the specified precision.",sampleText:`1
2.5
10
0.75
50`,sampleResult:`1000
2500
10000
750
50000`,sampleOptions:{fromUnit:"GB",toUnit:"MB",precision:0}},{title:"Convert MiB to GiB (IEC System)",description:"This example converts values in Mebibytes (MiB) to Gibibytes (GiB) using the IEC binary system. Each line of input represents a different memory size, and the output shows the conversion rounded to 2 decimal places.",sampleText:`1024
2048
5120
256
8192`,sampleResult:`1
2
5
0.25
8`,sampleOptions:{fromUnit:"MiB",toUnit:"GiB",precision:2}},{title:"Cross-System Conversion: GB to GiB",description:"This example demonstrates a cross-system conversion from SI units (GB) to IEC units (GiB). Since GB and GiB are slightly different, the output shows fractional values with high precision. This is useful when comparing storage reported by operating systems vs manufacturers.",sampleText:`1
5
10
50
100`,sampleResult:`0.931
4.655
9.313
46.566
93.132`,sampleOptions:{fromUnit:"GB",toUnit:"GiB",precision:3}},{title:"Convert Bytes to Bits",description:"This example converts values from Bytes (B) to Bits (b). Since 1 Byte = 8 Bits, each input value is multiplied by 8. The precision is set to 0 because the result is always an integer.",sampleText:`1
5
10
50
100`,sampleResult:`8
40
80
400
800`,sampleOptions:{fromUnit:"B",toUnit:"b",precision:0}}];function D({title:s}){const{t:e}=b("number"),[p,i]=u.useState(""),[m,a]=u.useState(""),l=(n,o)=>{a(g(o,n))};return r.jsx(y,{title:s,input:p,setInput:i,exampleCards:S,initialValues:U,inputComponent:r.jsx(v,{title:e("byteConverter.inputTitle"),value:p,onChange:i}),resultComponent:r.jsx(d,{title:e("byteConverter.outputTitle"),value:m}),getGroups:({values:n,updateField:o})=>[{title:e("byteConverter.unit.title"),component:r.jsxs(T,{children:[r.jsx(c,{selected:n.fromUnit,options:f.map(t=>({label:t,value:t})),onChange:t=>o("fromUnit",t),description:e("byteConverter.unit.from")}),r.jsx(c,{selected:n.toUnit,options:f.map(t=>({label:t,value:t})),onChange:t=>o("toUnit",t),description:e("byteConverter.unit.to")}),r.jsx(x,{description:e("byteConverter.unit.precision"),value:n.precision,onOwnChange:t=>o("precision",Number(t)),type:"number"})]})}],compute:l})}export{D as default,S as exampleCards};
