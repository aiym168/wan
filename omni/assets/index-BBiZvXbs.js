import{a as y,r as n,j as r}from"./index-CZybyyg9.js";import{T as m}from"./ToolContent-Bd6fLJl_.js";import{T as c}from"./ToolTextInput-CKsb_Rab.js";import{T as h}from"./ToolTextResult-CS8CdXTe.js";import"./TextField-BAaRYrNT.js";import"./ContentPaste-Buz3qiOw.js";import"./InputFooter-pt5Fl6zr.js";import"./ResultFooter-7IET4Cnp.js";import"./index-Djc6_I7M.js";function f(a){return a%4===0&&a%100!==0||a%400===0}function d(a){return a?a.split(`
`).map(e=>e.trim()).filter(e=>e!=="").map(e=>{if(!/^\d{1,4}$/.test(e))return`${e}: Invalid year`;const t=Number(e);return`${t} ${f(t)?"is a leap year.":"is not a leap year."}`}).join(`
`):""}const x={},T=[{title:"Find Birthdays on February 29",description:"One of our friends was born on a leap year on February 29th and as a consequence, she has a birthday only once every 4 years. As we can never really remember when her birthday is, we are using our program to create a reminder list of the upcoming leap years. To create a list of her next birthdays, we load a sequence of years from 2025 to 2040 into the input and get the status of each year. If the program says that it's a leap year, then we know that we'll be invited to a birthday party on February 29th.",sampleText:`2025
2026
2027
2028
2029
2030
2031
2032
2033
2034
2035
2036
2037
2038
2039
2040`,sampleResult:`2025 is not a leap year.
2026 is not a leap year.
2027 is not a leap year.
2028 is a leap year.
2029 is not a leap year.
2030 is not a leap year.
2031 is not a leap year.
2032 is a leap year.
2033 is not a leap year.
2034 is not a leap year.
2035 is not a leap year.
2036 is a leap year.
2037 is not a leap year.
2038 is not a leap year.
2039 is not a leap year.
2040 is a leap year.`,sampleOptions:{}}];function L({title:a,longDescription:o}){const{t:s}=y("time"),[e,t]=n.useState(""),[i,p]=n.useState(""),l=(g,u)=>{p(d(u))};return r.jsx(m,{title:a,input:e,inputComponent:r.jsx(c,{value:e,onChange:t}),resultComponent:r.jsx(h,{value:i}),initialValues:x,getGroups:null,setInput:t,compute:l,toolInfo:{title:s("checkLeapYears.toolInfo.title",{title:a}),description:o},exampleCards:T})}export{L as default};
