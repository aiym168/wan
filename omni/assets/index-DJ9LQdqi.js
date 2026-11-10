import{a as T,r as h,j as m}from"./index-BU4HZ120.js";import{T as g}from"./ToolTextInput-DsyGN2G7.js";import{T as f}from"./ToolTextResult-BCDHIrPs.js";import{R as S}from"./RadioWithTextField-YaNdRKuD.js";import{S as R}from"./SimpleRadio-VOFogqpa.js";import{C as b}from"./CheckboxWithDesc-fXp_lhhe.js";import{T as y}from"./ToolContent-CjwoZU6G.js";import"./ContentPaste-DZwMmqju.js";import"./InputFooter-1OoUTJnY.js";import"./TextField-Bp_Vv8wg.js";import"./ResultFooter-CXZ4Ps21.js";import"./index-Djc6_I7M.js";import"./TextFieldWithDesc-BwhRJ_yB.js";import"./Radio-XgWKoFzL.js";import"./SwitchBase-CUrR9BO-.js";import"./FormControlLabel-DBjytcX7.js";import"./Checkbox-Dj5qpksk.js";function w(i){const t=i.match(/-?\d+(?:\.\d+)?/g);return t?t.map(Number):[]}function C(i,t){const r=t.replace(/\\n/g,`
`).trim(),s=r?new RegExp(r.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\s*"):/\s+/;return i.split(s).map(n=>n.trim()).filter(n=>n!==""&&!Number.isNaN(Number(n))).map(Number)}const N=(i,t,r,s)=>{const n=t==="smart"?w(i):C(i,s);if(r){let p=0;return n.map(u=>p+=u).join(`
`)+(n.length?`
`:"")}return n.reduce((p,u)=>p+u,0).toString()},k={extractionType:"smart",separator:"\\n",printRunningSum:!1},I=[{title:"Smart sum",description:"Auto detect numbers in the input.",type:"smart",withTextField:!1},{title:"Number Delimiter",type:"delimiter",description:"Input SeparatorCustomize the number separator here. (By default a line break.)",withTextField:!0,textValueAccessor:"separator"}],j=[{title:"Sum of Ten Positive Numbers",description:"In this example, we calculate the sum of ten positive integers. These integers are listed as a column and their total sum equals 19494.",sampleText:`0
1
20
33
400
505
660
777
8008
9090`,sampleResult:"19494",sampleOptions:{extractionType:"delimiter",separator:"\\n",printRunningSum:!1}},{title:"Count Trees in the Park",description:`This example reverses a column of twenty three-syllable nouns and prints all the words from the bottom to top. To separate the list items, it uses the 
 character as input item separator, which means that each item is on its own line..`,sampleText:"This year gardeners have planted 20 red maples, 35 sweetgum, 13 quaking aspen, and 7 white oaks in the central park of the city.",sampleResult:"75",sampleOptions:{extractionType:"smart",separator:"\\n",printRunningSum:!1}},{title:"Sum of Integers and Decimals",description:"In this example, we add together ninety different values – positive numbers, negative numbers, integers and decimal fractions. We set the input separator to a comma and after adding all of them together, we get 0 as output.",sampleText:"1, 2, 3, 4, 5, 6, 7, 8, 9, -1.1, -2.1, -3.1, -4.1, -5.1, -6.1, -7.1, -8.1, -9.1, 10, 20, 30, 40, 50, 60, 70, 80, 90, -10.2, -20.2, -30.2, -40.2, -50.2, -60.2, -70.2, -80.2, -90.2, 100, 200, 300, 400, 500, 600, 700, 800, 900, -100.3, -200.3, -300.3, -400.3, -500.3, -600.3, -700.3, -800.3, -900.3, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, -1000.4, -2000.4, -3000.4, -4000.4, -5000.4, -6000.4, -7000.4, -8000.4, -9000.4, 10001, 20001, 30001, 40001, 50001, 60001, 70001, 80001, 90001, -10000, -20000, -30000, -40000, -50000, -60000, -70000, -80000, -90000",sampleResult:"0",sampleOptions:{extractionType:"delimiter",separator:", ",printRunningSum:!1}},{title:"Running Sum of Numbers",description:'In this example, we calculate the sum of all ten digits and enable the option "Print Running Sum". We get the intermediate values of the sum in the process of addition. Thus, we have the following sequence in the output: 0, 1 (0 + 1), 3 (0 + 1 + 2), 6 (0 + 1 + 2 + 3), 10 (0 + 1 + 2 + 3 + 4), and so on.',sampleText:`0
1
2
3
4
5
6
7
8
9`,sampleResult:`0
1
3
6
10
15
21
28
36
45`,sampleOptions:{extractionType:"delimiter",separator:"\\n",printRunningSum:!0}}];function M({title:i}){const{t}=T("number"),[r,s]=h.useState(""),[n,p]=h.useState(""),u=({values:o,updateField:a})=>[{title:t("sum.numberExtraction"),component:I.map(({title:l,type:e,withTextField:d,textValueAccessor:c})=>d?m.jsx(S,{checked:e===o.extractionType,title:t(`sum.extractionTypes.${e}.title`),fieldName:"extractionType",description:t(`sum.extractionTypes.${e}.description`),value:c?o[c].toString():"",onRadioClick:()=>a("extractionType",e),onTextChange:x=>c?a(c,x):null},e):m.jsx(R,{onClick:()=>a("extractionType",e),checked:o.extractionType===e,description:t(`sum.extractionTypes.${e}.description`),title:t(`sum.extractionTypes.${e}.title`)},l))},{title:t("sum.runningSum"),component:m.jsx(b,{title:t("sum.printRunningSum"),description:t("sum.printRunningSumDescription"),checked:o.printRunningSum,onChange:l=>a("printRunningSum",l)})}];return m.jsx(y,{title:i,input:r,inputComponent:m.jsx(g,{title:t("sum.inputTitle"),value:r,onChange:s}),resultComponent:m.jsx(f,{title:t("sum.resultTitle"),value:n}),initialValues:k,getGroups:u,compute:(o,a)=>{const{extractionType:l,printRunningSum:e,separator:d}=o;p(N(a,l,e,d))},setInput:s,toolInfo:{title:t("sum.toolInfo.title"),description:t("sum.toolInfo.description")},exampleCards:j})}export{M as default};
