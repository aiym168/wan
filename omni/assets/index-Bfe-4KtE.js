import{aK as C,a as g,r as h,j as o,B as u}from"./index-BU4HZ120.js";import{T as x}from"./ToolContent-CjwoZU6G.js";import{T as S}from"./ToolTextInput-DsyGN2G7.js";import{T as k}from"./ToolTextResult-BCDHIrPs.js";import{C as f}from"./CheckboxWithDesc-fXp_lhhe.js";import{S as T}from"./SimpleRadio-VOFogqpa.js";import"./TextField-Bp_Vv8wg.js";import"./ContentPaste-DZwMmqju.js";import"./InputFooter-1OoUTJnY.js";import"./ResultFooter-CXZ4Ps21.js";import"./index-Djc6_I7M.js";import"./FormControlLabel-DBjytcX7.js";import"./Checkbox-Dj5qpksk.js";import"./SwitchBase-CUrR9BO-.js";import"./Radio-XgWKoFzL.js";function z(e,c,t,a,i){if(e[0]=="")return"";if(e.length>3)throw new Error(`Time contains more than 3 parts on line ${c}`);[...e,"0","0"].forEach((s,d)=>{if(!C(s))throw new Error(`Time doesn't contain valid ${["hours","minutes","seconds"][d]} on line ${c}`)});const r=t?e.slice(0,2):e.slice(0,1);return a&&(t?r.push("0"):r.push("0","0")),i?r.map(s=>String(s).padStart(2,"0")).join(":"):r.join(":")}function P(e,c,t,a){const i=[];return e.split(`
`).forEach((s,d)=>{const m=s.split(":"),n=z(m,d+1,c,t,a);i.push(n)}),i.join(`
`)}const j={onlySecond:!0,zeroPrint:!1,zeroPadding:!0},y=[{title:"Truncate Seconds",description:'In this example, we get rid of the seconds part from several timer values. We select the "Truncate Only Seconds" mode and get a list of timer values consisting only of hours and minutes in format "hh:mm" (the ":ss" part is removed).',sampleText:`01:28:06
07:39:56
02:12:41
10:10:38`,sampleResult:`01:28
07:39
02:12
10:10`,sampleOptions:{onlySecond:!0,zeroPrint:!1,zeroPadding:!0}},{title:"Truncate Minutes and Seconds",description:"This example truncates five clock times to an hour. It drops the minutes and seconds parts and only outputs the hours with zero padding.",sampleText:`04:42:03
07:09:59
11:29:16
21:30:45
13:03:09`,sampleResult:`04
07
11
21
13`,sampleOptions:{onlySecond:!1,zeroPrint:!1,zeroPadding:!0}},{title:"Set Seconds to Zero",description:'In this example, we set the seconds part of each time to zero by first truncating the time to minutes and then appending a zero at the end in place of the truncated seconds. To do this, we switch on the seconds-truncation mode and activate the option to print-zero-time-parts. We also turn off the padding option and get the output time in format "h:m:s", where the seconds are always zero so the final format is "h:m:0".',sampleText:`17:25:55
10:16:07
12:02:09
06:05:11`,sampleResult:`17:25:0
10:16:0
12:2:0
6:5:0`,sampleOptions:{onlySecond:!0,zeroPrint:!0,zeroPadding:!0}}];function q({title:e,longDescription:c}){const{t}=g("time"),[a,i]=h.useState(""),[r,s]=h.useState(""),d=(n,l)=>{s(P(l,n.onlySecond,n.zeroPrint,n.zeroPadding))},m=({values:n,updateField:l})=>[{title:t("truncateClockTime.truncationSide"),component:o.jsxs(u,{children:[o.jsx(T,{onClick:()=>l("onlySecond",!0),checked:n.onlySecond,title:t("truncateClockTime.truncateOnlySeconds"),description:t("truncateClockTime.truncateOnlySecondsDescription")}),o.jsx(T,{onClick:()=>l("onlySecond",!1),checked:!n.onlySecond,title:t("truncateClockTime.truncateMinutesAndSeconds"),description:t("truncateClockTime.truncateMinutesAndSecondsDescription")})]})},{title:t("truncateClockTime.printDroppedComponents"),component:o.jsx(u,{children:o.jsx(f,{onChange:p=>l("zeroPrint",p),checked:n.zeroPrint,title:t("truncateClockTime.zeroPrintTruncatedParts"),description:t("truncateClockTime.zeroPrintDescription")})})},{title:t("truncateClockTime.timePadding"),component:o.jsx(u,{children:o.jsx(f,{onChange:p=>l("zeroPadding",p),checked:n.zeroPadding,title:t("truncateClockTime.useZeroPadding"),description:t("truncateClockTime.zeroPaddingDescription")})})}];return o.jsx(x,{title:e,input:a,inputComponent:o.jsx(S,{value:a,onChange:i}),resultComponent:o.jsx(k,{value:r}),initialValues:j,getGroups:m,setInput:i,compute:d,toolInfo:{title:t("truncateClockTime.toolInfo.title",{title:e}),description:c},exampleCards:y})}export{q as default};
