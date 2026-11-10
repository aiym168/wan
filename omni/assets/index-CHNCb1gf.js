import{a as g,r as d,j as t,B as c}from"./index-BU4HZ120.js";import{T as f}from"./ToolTextInput-DsyGN2G7.js";import{T}from"./ToolTextResult-BCDHIrPs.js";import{S as v}from"./SimpleRadio-VOFogqpa.js";import{T as x}from"./TextFieldWithDesc-BwhRJ_yB.js";import{T as S}from"./ToolContent-CjwoZU6G.js";import"./ContentPaste-DZwMmqju.js";import"./InputFooter-1OoUTJnY.js";import"./TextField-Bp_Vv8wg.js";import"./ResultFooter-CXZ4Ps21.js";import"./index-Djc6_I7M.js";import"./Radio-XgWKoFzL.js";import"./SwitchBase-CUrR9BO-.js";function j(l,e,p=`
`,r){let o=[];switch(l){case"symbol":o=r.split(e);break;case"regex":o=r.split(new RegExp(e)).filter(m=>m!=="");break}return o.reverse().join(p)}const O={splitOperatorType:"symbol",splitSeparator:",",joinSeparator:"\\n"},R=[{title:"Use a Symbol for Splitting",description:"Delimit input list items with a character.",type:"symbol"},{title:"Use a Regex for Splitting",type:"regex",description:"Delimit input list items with a regular expression."}],b=[{title:"Reverse a List of Digits",description:"In this example, we load a list of digits in the input. The digits are separated by a mix of dot, comma, and semicolon characters, so we use the regular expression split mode and enter a regular expression that matches all these characters as the input item separator. In the output, we get a reversed list of digits that all use the semicolon as a separator.",sampleText:"2, 9, 6; 3; 7. 4. 4. 2, 1; 4, 8. 4; 4. 8, 2, 5; 1; 7; 7. 0",sampleResult:"0; 7; 7; 1; 5; 2; 8; 4; 4; 8; 4; 1; 2; 4; 4; 7; 3; 6; 9; 2",sampleOptions:{splitOperatorType:"regex",splitSeparator:"[;,.]\\s*",joinSeparator:"; "}},{title:"Reverse a Column of Words",description:`This example reverses a column of twenty three-syllable nouns and prints all the words from the bottom to top. To separate the list items, it uses the 
 character as input item separator, which means that each item is on its own line..`,sampleText:`argument
pollution
emphasis
vehicle
family
property
preference
studio
suggestion
accident
analyst
permission
reaction
promotion
quantity
inspection
chemistry
conclusion
confusion
memory`,sampleResult:`memory
confusion
conclusion
chemistry
inspection
quantity
promotion
reaction
permission
analyst
accident
suggestion
studio
preference
property
family
vehicle
emphasis
pollution
argument`,sampleOptions:{splitOperatorType:"symbol",splitSeparator:"\\n",joinSeparator:"\\n"}},{title:"Reverse a Random List",description:"In this example, the list elements are random cities, zip codes, and weather conditions. To reverse list elements, we first need to identify them and separate them apart. The input list incorrectly uses the dash symbol to separate the elements but the output list fixes this and uses commas.",sampleText:"Hamburg-21334-Dhaka-Sunny-Managua-Rainy-Chongqing-95123-Oakland",sampleResult:"Oakland, 95123, Chongqing, Rainy, Managua, Sunny, Dhaka, 21334, Hamburg",sampleOptions:{splitOperatorType:"symbol",splitSeparator:"-",joinSeparator:", "}}];function $({title:l}){const{t:e}=g("list"),[p,r]=d.useState(""),[o,u]=d.useState(""),m=({values:a,updateField:n})=>[{title:e("reverse.splitterMode"),component:t.jsx(c,{children:R.map(({title:i,description:h,type:s})=>t.jsx(v,{onClick:()=>n("splitOperatorType",s),title:e(`reverse.splitOperators.${s}.title`),description:e(`reverse.splitOperators.${s}.description`),checked:a.splitOperatorType===s},s))})},{title:e("reverse.itemSeparator"),component:t.jsx(c,{children:t.jsx(x,{description:e("reverse.itemSeparatorDescription"),value:a.splitSeparator,onOwnChange:i=>n("splitSeparator",i)})})},{title:e("reverse.outputListOptions"),component:t.jsx(c,{children:t.jsx(x,{description:e("reverse.outputSeparatorDescription"),value:a.joinSeparator,onOwnChange:i=>n("joinSeparator",i)})})}],y=(a,n)=>{const{splitOperatorType:i,splitSeparator:h,joinSeparator:s}=a;u(j(i,h,s,n))};return t.jsx(S,{title:l,initialValues:O,getGroups:m,compute:y,input:p,setInput:r,inputComponent:t.jsx(f,{title:e("reverse.inputTitle"),value:p,onChange:r}),resultComponent:t.jsx(T,{title:e("reverse.resultTitle"),value:o}),toolInfo:{title:e("reverse.toolInfo.title"),description:e("reverse.toolInfo.description")},exampleCards:b})}export{$ as default};
