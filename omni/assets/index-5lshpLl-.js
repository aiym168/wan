import{aK as m,a as d,r as a,j as l}from"./index-BU4HZ120.js";import{T as h}from"./ToolContent-CjwoZU6G.js";import{T}from"./ToolTextInput-DsyGN2G7.js";import{T as f}from"./ToolTextResult-BCDHIrPs.js";import"./TextField-Bp_Vv8wg.js";import"./ContentPaste-DZwMmqju.js";import"./InputFooter-1OoUTJnY.js";import"./ResultFooter-CXZ4Ps21.js";import"./index-Djc6_I7M.js";function c(t,e=0){if(e>=t.length)return 0;const s=[3600,60,1];return Number(t[e])*s[e]+c(t,e+1)}function x(t,e){if(t[0]=="")return"";if(t.length>3)throw new Error(`Time contains more than 3 parts on line ${e}`);return[...t,"0","0"].forEach((o,n)=>{if(!m(o))throw new Error(`Time doesn't contain valid ${["hours","minutes","seconds"][n]} on line ${e}`)}),c(t).toString()}function w(t){const e=[];return t.split(`
`).forEach((o,n)=>{const i=o.split(":"),r=x(i,n+1);e.push(r)}),e.join(`
`)}const g={},v=[{title:"Multiple Clock Times",description:"In this example, we convert multiple clock times to seconds. Each clock time is listed on a new line and the spacing between input times is preserved in the output.",sampleText:`00:00:00

00:00:01
00:01:00
01:00:00
01:59:59
12:00:00
18:30:30
23:59:59

24:00:00`,sampleResult:`0

1
60
3600
7199
43200
66630
86399

86400`,sampleOptions:{}},{title:"Partial Clock Times",description:"This example finds how many seconds there are in clock times that are partially written. Some of the clock times contain just the hours and some others contain just hours and minutes.",sampleText:`1
1:10
14:44
23`,sampleResult:`3600
4200
53040
82800`,sampleOptions:{}},{title:"Time Beyond 24 Hours",description:"In this example, we go beyond the regular 24-hour clock. In fact, we even go beyond 60 minutes and 60 seconds.",sampleText:`24:00:01
48:00:00
72

00:100:00
100:100:100`,sampleResult:`86401
172800
259200

6000
366100`,sampleOptions:{}}];function $({title:t,longDescription:e}){const{t:s}=d("time"),[o,n]=a.useState(""),[i,r]=a.useState(""),p=(j,u)=>{r(w(u))};return l.jsx(h,{title:t,input:o,inputComponent:l.jsx(T,{value:o,onChange:n}),resultComponent:l.jsx(f,{value:i}),initialValues:g,getGroups:null,setInput:n,compute:p,toolInfo:{title:s("convertTimeToSeconds.toolInfo.title",{title:t}),description:e},exampleCards:v})}export{$ as default};
