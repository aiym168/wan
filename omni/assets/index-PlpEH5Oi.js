import{aK as m,a as y,r as h,j as o,B as f}from"./index-BU4HZ120.js";import{T as v}from"./ToolContent-CjwoZU6G.js";import{T as x}from"./ToolTextInput-DsyGN2G7.js";import{T}from"./ToolTextResult-BCDHIrPs.js";import{C as g}from"./CheckboxWithDesc-fXp_lhhe.js";import"./TextField-Bp_Vv8wg.js";import"./ContentPaste-DZwMmqju.js";import"./InputFooter-1OoUTJnY.js";import"./ResultFooter-CXZ4Ps21.js";import"./index-Djc6_I7M.js";import"./FormControlLabel-DBjytcX7.js";import"./Checkbox-Dj5qpksk.js";import"./SwitchBase-CUrR9BO-.js";function D(e){if(!m(e))return"";const t=(parseFloat(e)*24).toFixed(6);return parseFloat(t)}function F(e,r){const t=[];return e.split(`
`).forEach(s=>{const i=s.split(" ")[0],a=D(i);t.push(r?`${a} hours`:`${a}`)}),t.join(`
`)}const H={hoursFlag:!1},C=[{title:"Full Days to Hours",description:'This example calculates how many hours there are in 1 day, in one week (7 days), in one month (30 days), and in even longer time periods. To see all the results at once, we enter each individual day value on a new line. We also use the "days" suffix in the input and add the "hours" suffix to the output.',sampleText:`1 day
7 days
30 days
90 days
125 days
500 days`,sampleResult:`24 hours
168 hours
720 hours
2160 hours
3000 hours
12000 hours`,sampleOptions:{hoursFlag:!0}},{title:"Fractional Days to Hours",description:'In this example, we convert five decimal fraction day values to hours. Conversion of partial days is similar to the conversion of full days – they are all multiplied by 24. We turn off the option that appends the "hours" string after the converted values and get only the numerical hour values in the output.',sampleText:`0.2 d
1.5 days
25.25
9.999
350.401`,sampleResult:`4.8
36
606
239.976
8409.624`,sampleOptions:{hoursFlag:!1}},{title:"Number of Hours in a Year",description:"In the modern Gregorian calendar, a common year has 365 days and a leap year has 366 days. This makes the true average length of a year to be 365.242199 days. In this example, we load this number in the input field and convert it to the hours. It turns out that there 8765.812776 hours in an average year.",sampleText:"365.242199 days",sampleResult:"8765.812776 hours",sampleOptions:{hoursFlag:!0}}];function $({title:e,longDescription:r}){const{t}=y("time"),[n,s]=h.useState(""),[p,i]=h.useState(""),a=(u,l)=>{i(F(l,u.hoursFlag))},c=({values:u,updateField:l})=>[{title:t("convertDaysToHours.hoursName"),component:o.jsx(f,{children:o.jsx(g,{onChange:d=>l("hoursFlag",d),checked:u.hoursFlag,title:t("convertDaysToHours.addHoursName"),description:t("convertDaysToHours.addHoursNameDescription")})})}];return o.jsx(v,{title:e,input:n,inputComponent:o.jsx(x,{value:n,onChange:s}),resultComponent:o.jsx(T,{value:p}),initialValues:H,getGroups:c,setInput:s,compute:a,toolInfo:{title:t("convertDaysToHours.toolInfo.title"),description:t("convertDaysToHours.toolInfo.description")},exampleCards:C})}export{$ as default};
