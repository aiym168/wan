import{a as f,r as d,j as a}from"./index-BU4HZ120.js";import{c as j,a as m,b as g}from"./index.esm-LbmVZgAU.js";import{T as x}from"./ToolTextInput-DsyGN2G7.js";import{T as k}from"./ToolTextResult-BCDHIrPs.js";import{T as C}from"./ToolContent-CjwoZU6G.js";import{T as b}from"./TextFieldWithDesc-BwhRJ_yB.js";import{C as y}from"./CheckboxWithDesc-fXp_lhhe.js";import"./ContentPaste-DZwMmqju.js";import"./InputFooter-1OoUTJnY.js";import"./TextField-Bp_Vv8wg.js";import"./ResultFooter-CXZ4Ps21.js";import"./index-Djc6_I7M.js";import"./FormControlLabel-DBjytcX7.js";import"./Checkbox-Dj5qpksk.js";import"./SwitchBase-CUrR9BO-.js";function w(c,e=!0,r=!0,n=""){let o=c.split(`
`);return r&&(o=o.map(i=>i.trimEnd())),e&&(o=o.filter(i=>i.trim())),o.join(n)}const D={joinCharacter:"",deleteBlank:!0,deleteTrailing:!0};j().shape({joinCharacter:g().required("Join character is required"),deleteBlank:m().required("Delete blank is required"),deleteTrailing:m().required("Delete trailing is required")});const v={accessor:"joinCharacter"},B=[{title:"Delete Blank Lines",description:`Delete lines that don't have
 text symbols.
`,accessor:"deleteBlank"},{title:"Delete Trailing Spaces",description:`Remove spaces and tabs at
 the end of the lines.
`,accessor:"deleteTrailing"}],I=[{title:"Merge a To-Do List",description:"In this example, we merge a bullet point list into one sentence, separating each item by the word 'and'. We also remove all empty lines and trailing spaces. If we didn't remove the empty lines, then they'd be joined with the separator word, making the separator word appear multiple times. If we didn't remove the trailing tabs and spaces, then they'd create extra spacing in the joined text and it wouldn't look nice.",sampleText:`clean the house

go shopping
feed the cat

make dinner
build a rocket ship and fly away`,sampleResult:"clean the house and go shopping and feed the cat and make dinner and build a rocket ship and fly away",sampleOptions:{joinCharacter:"and",deleteBlank:!0,deleteTrailing:!0}},{title:"Comma Separated List",description:"This example joins a column of words into a comma separated list of words.",sampleText:`computer
memory
processor
mouse
keyboard`,sampleResult:"computer, memory, processor, mouse, keyboard",sampleOptions:{joinCharacter:",",deleteBlank:!1,deleteTrailing:!1}},{title:"Vertical Word to Horizontal",description:"This example rotates words from a vertical position to horizontal. An empty separator is used for this purpose.",sampleText:`T
e
x
t
a
b
u
l
o
u
s
!`,sampleResult:"Textabulous!",sampleOptions:{joinCharacter:"",deleteBlank:!1,deleteTrailing:!1}}];function P({title:c}){const{t:e}=f("string"),[r,n]=d.useState(""),[o,i]=d.useState(""),u=(s,l)=>{const{joinCharacter:t,deleteBlank:p,deleteTrailing:T}=s;i(w(l,p,T,t))},h=({values:s,updateField:l})=>[{title:e("join.textMergedOptions"),component:a.jsx(b,{placeholder:e("join.joinCharacterPlaceholder"),value:s.joinCharacter,onOwnChange:t=>l(v.accessor,t),description:e("join.joinCharacterDescription")})},{title:e("join.blankLinesAndTrailingSpaces"),component:B.map(t=>a.jsx(y,{title:e(`join.${t.accessor}Title`),checked:!!s[t.accessor],onChange:p=>l(t.accessor,p),description:e(`join.${t.accessor}Description`)},t.accessor))}];return a.jsx(C,{title:c,initialValues:D,compute:u,input:r,setInput:n,inputComponent:a.jsx(x,{title:e("join.inputTitle"),value:r,onChange:n}),resultComponent:a.jsx(k,{title:e("join.resultTitle"),value:o}),getGroups:h,toolInfo:{title:e("join.toolInfo.title"),description:e("join.toolInfo.description")},exampleCards:I})}export{P as default};
