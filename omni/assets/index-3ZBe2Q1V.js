import{aK as h,a as g,r as m,j as a,B as f}from"./index-CZybyyg9.js";import{T}from"./ToolContent-Bd6fLJl_.js";import{T as x}from"./ToolTextInput-CKsb_Rab.js";import{T as S}from"./ToolTextResult-CS8CdXTe.js";import{C as j}from"./CheckboxWithDesc-CCXkRjIT.js";import"./TextField-BAaRYrNT.js";import"./ContentPaste-Buz3qiOw.js";import"./InputFooter-pt5Fl6zr.js";import"./ResultFooter-7IET4Cnp.js";import"./index-Djc6_I7M.js";import"./FormControlLabel-2LzZzeyg.js";import"./Checkbox-CSzIQgsq.js";import"./SwitchBase-BWXYtFov.js";function v(e,s){if(!h(e))return"";const t=Math.floor(Number(e)/3600),n=Math.floor(Number(e)%3600/60),o=Number(e)%60;return s?[t,n,o].map(i=>String(i).padStart(2,"0")).join(":"):[t,n,o].join(":")}function C(e,s){const t=[];return e.split(`
`).forEach(o=>{const i=o.trim(),r=v(i,s);t.push(r)}),t.join(`
`)}const M={paddingFlag:!1},b=[{title:"1 Second, 1 Minute, 1 Hour",description:"In this example, we convert 1 second, 60 seconds, and 3600 seconds to clock format. We don't use the zero-padding option and get three simple output values – 0:0:1 for 1 second, 0:1:0 for 60 seconds (1 minute), and 1:0:0 for 3600 seconds (1 hour).",sampleText:`1
60
3600`,sampleResult:`0:0:1
0:1:0
1:0:0`,sampleOptions:{paddingFlag:!1}},{title:"HH:MM:SS Digital Clock",description:"In this example, we enable the padding option and output digital clock time in the format HH:MM:SS. The first two integer timestamps don't contain a full minute and the third timestamp doesn't contain a full hour, there we get zeros in the minutes or hours positions in output.",sampleText:`0
46
890
18305
40271
86399`,sampleResult:`00:00:00
00:00:46
00:14:50
05:05:05
11:11:11
23:59:59`,sampleOptions:{paddingFlag:!0}},{title:"More Than a Day",description:"The values of all input seconds in this example are greater than the number of seconds in a day (86400 seconds). As our algorithm doesn't limit the time to just 23:59:59 hours, it can find the exact number of hours in large inputs.",sampleText:`86401
123456
2159999

3600000
101010101`,sampleResult:`24:00:01
34:17:36
599:59:59

1000:00:00
28058:21:41`,sampleOptions:{paddingFlag:!0}}];function B({title:e,longDescription:s}){const{t}=g("time"),[n,o]=m.useState(""),[i,r]=m.useState(""),d=(l,p)=>{r(C(p,l.paddingFlag))},u=({values:l,updateField:p})=>[{title:t("convertSecondsToTime.timePadding"),component:a.jsx(f,{children:a.jsx(j,{onChange:c=>p("paddingFlag",c),checked:l.paddingFlag,title:t("convertSecondsToTime.addPadding"),description:t("convertSecondsToTime.addPaddingDescription")})})}];return a.jsx(T,{title:e,input:n,inputComponent:a.jsx(x,{value:n,onChange:o}),resultComponent:a.jsx(S,{value:i}),initialValues:M,getGroups:u,setInput:o,compute:d,toolInfo:{title:t("convertSecondsToTime.toolInfo.title",{title:e}),description:s},exampleCards:b})}export{B as default};
