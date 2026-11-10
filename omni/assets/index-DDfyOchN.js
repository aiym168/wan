import{aK as y,r as h,j as s,B as p}from"./index-BU4HZ120.js";import{T as m}from"./ToolContent-CjwoZU6G.js";import{T as f}from"./ToolTextInput-DsyGN2G7.js";import{T as x}from"./ToolTextResult-BCDHIrPs.js";import{C as v}from"./CheckboxWithDesc-fXp_lhhe.js";import{T as g}from"./TextFieldWithDesc-BwhRJ_yB.js";import"./TextField-Bp_Vv8wg.js";import"./ContentPaste-DZwMmqju.js";import"./InputFooter-1OoUTJnY.js";import"./ResultFooter-CXZ4Ps21.js";import"./index-Djc6_I7M.js";import"./FormControlLabel-DBjytcX7.js";import"./Checkbox-Dj5qpksk.js";import"./SwitchBase-CUrR9BO-.js";function T(e,o){if(!y(e))return"";const a=(parseFloat(e)/24).toFixed(o);return parseFloat(a)}function w(e,o,r){if(!y(o))throw new Error("Accuracy contains non digits.");const a=[];return e.split(`
`).forEach(i=>{const u=i.split(" ")[0],t=T(u,Number(o));a.push(r?`${t} days`:`${t}`)}),a.join(`
`)}const D={daysFlag:!1,accuracy:"1"},C=[{title:"Hours to Integer Days",description:'In this example, we convert ten hour values to ten day values. Each input hour is divisible by 24 without a remainder, so all converted output values are full days. To better communicate the time units, we use the word "hours" in the input data and also add the word "days" to the output data.',sampleText:`24 hours
48 hours
72 hours
96 hours
120 hours
144 hours
168 hours
192 hours
216 hours
240 hours`,sampleResult:`1 day
2 days
3 days
4 days
5 days
6 days
7 days
8 days
9 days
10 days`,sampleOptions:{daysFlag:!0,accuracy:"2"}},{title:"Decimal Days",description:'In this example, we convert five decimal fraction day values to hours. Conversion of partial days is similar to the conversion of full days – they are all multiplied by 24. We turn off the option that appends the "hours" string after the converted values and get only the numerical hour values in the output.',sampleText:`1 hr
100 hr
9999 hr
12345 hr
333333 hr`,sampleResult:`0.0417 days
4.1667 days
416.625 days
514.375 days
13888.875 days`,sampleOptions:{daysFlag:!0,accuracy:"4"}},{title:"Partial Hours",description:"In the modern Gregorian calendar, a common year has 365 days and a leap year has 366 days. This makes the true average length of a year to be 365.242199 days. In this example, we load this number in the input field and convert it to the hours. It turns out that there 8765.812776 hours in an average year.",sampleText:`0.5
0.01
0.99`,sampleResult:`0.02083333
0.00041667
0.04125`,sampleOptions:{daysFlag:!1,accuracy:"8"}}];function G({title:e,longDescription:o}){const[r,a]=h.useState(""),[c,i]=h.useState(""),d=(t,n)=>{i(w(n,t.accuracy,t.daysFlag))},u=({values:t,updateField:n})=>[{title:"Day Value Accuracy",component:s.jsx(p,{children:s.jsx(g,{description:"If the calculated days is a decimal number, then how many digits should be left after the decimal point?.",value:t.accuracy,onOwnChange:l=>n("accuracy",l),type:"text"})})},{title:"Days Postfix",component:s.jsx(p,{children:s.jsx(v,{onChange:l=>n("daysFlag",l),checked:t.daysFlag,title:"Append Days Postfix",description:'Display numeric day values with the postfix "days".'})})}];return s.jsx(m,{title:e,input:r,inputComponent:s.jsx(f,{value:r,onChange:a}),resultComponent:s.jsx(x,{value:c}),initialValues:D,getGroups:u,setInput:a,compute:d,toolInfo:{title:`What is a ${e}?`,description:o},exampleCards:C})}export{G as default};
