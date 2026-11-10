import{r as p,j as e,B as c}from"./index-BU4HZ120.js";import{T as d}from"./ToolContent-CjwoZU6G.js";import{T as g}from"./ToolTextInput-DsyGN2G7.js";import{T as x}from"./ToolTextResult-BCDHIrPs.js";import{n as u,t as S}from"./array-DpzUVg7q.js";import{s as w}from"./csv-DDPAtGY4.js";import{T as l}from"./TextFieldWithDesc-BwhRJ_yB.js";import{S as T}from"./SelectWithDesc-Df_1TatG.js";import"./TextField-Bp_Vv8wg.js";import"./ContentPaste-DZwMmqju.js";import"./InputFooter-1OoUTJnY.js";import"./ResultFooter-CXZ4Ps21.js";import"./index-Djc6_I7M.js";import"./MenuItem-qtntJzrn.js";function V(i,a){if(!i)return"";const r=w(i,!0,a.commentCharacter,!0,a.separator,a.quoteChar),n=a.customFill?u(r,a.customFillValue):u(r,"");return S(n).map(m=>m.join(a.separator)).join(`
`)}const v={separator:",",commentCharacter:"#",customFill:!1,customFillValue:"x",quoteChar:'"'},y=[{title:"Transpose a 2x3 CSV",description:"This example transposes a CSV with 2 rows and 3 columns. The tool splits the input data by the comma character, creating a 2 by 3 matrix. It then exchanges elements, turning columns into rows and vice versa. The output is a transposed CSV with flipped dimensions",sampleText:`foo,bar,baz
val1,val2,val3`,sampleResult:`foo,val1
bar,val2
baz,val3`,sampleOptions:{separator:",",commentCharacter:"#",customFill:!1,customFillValue:"x",quoteChar:'"'}},{title:"Transpose a Long CSV",description:"In this example, we flip a vertical single-column CSV file containing a list of our favorite fruits and their emojis. This single column is transformed into a single-row CSV file and the rows length matches the height of the original CSV.",sampleText:`Tasty Fruit
🍑 peaches
🍒 cherries
🥝 kiwis
🍓 strawberries
🍎 apples
🍐 pears
🥭 mangos
🍍 pineapples
🍌 bananas
🍊 tangerines
🍉 watermelons
🍇 grapes`,sampleResult:"fTasty Fruit,🍑 peaches,🍒 cherries,🥝 kiwis,🍓 strawberries,🍎 apples,🍐 pears,🥭 mangos,🍍 pineapples,🍌 bananas,🍊 tangerines,🍉 watermelons,🍇 grapes",sampleOptions:{separator:",",commentCharacter:"#",customFill:!1,customFillValue:"x",quoteChar:'"'}},{title:"Clean and Transpose CSV Data",description:'In this example, we perform three tasks simultaneously: transpose a CSV file, remove comments and empty lines, and fix missing data. The transposition operation is the same as flipping a matrix across its diagonal and it is done automatically by the program. Additionally, the program automatically removes all empty lines as they cannot be transposed. The comments are removed by specifying the "#" symbol in the options. The program also fixes missing data using a custom bullet symbol "•", which is specified in the options.',sampleText:`Fish Type,Color,Habitat
Goldfish,Gold,Freshwater

#Clownfish,Orange,Coral Reefs
Tuna,Silver,Saltwater

Shark,Grey,Saltwater
Salmon,Silver`,sampleResult:`Fish Type,Goldfish,Tuna,Shark,Salmon
Color,Gold,Silver,Grey,Silver
Habitat,Freshwater,Saltwater,Saltwater,•`,sampleOptions:{separator:",",commentCharacter:"#",customFill:!0,customFillValue:"•",quoteChar:'"'}}];function B({title:i,longDescription:a}){const[r,n]=p.useState(""),[m,h]=p.useState(""),C=(s,o)=>{h(V(o,s))},f=({values:s,updateField:o})=>[{title:"Csv input Options",component:e.jsxs(c,{children:[e.jsx(l,{value:s.separator,onOwnChange:t=>o("separator",t),description:"Enter the character used to delimit columns in the CSV input file."}),e.jsx(l,{value:s.quoteChar,onOwnChange:t=>o("quoteChar",t),description:"Enter the quote character used to quote the CSV input fields."}),e.jsx(l,{value:s.commentCharacter,onOwnChange:t=>o("commentCharacter",t),description:"Enter the character indicating the start of a comment line. Lines starting with this symbol will be skipped."})]})},{title:"Fixing CSV Options",component:e.jsxs(c,{children:[e.jsx(T,{selected:s.customFill,options:[{label:"Fill With Empty Values",value:!1},{label:"Fill with Custom Values",value:!0}],onChange:t=>o("customFill",t),description:"Insert empty fields or custom values where the CSV data is missing (not empty)."}),s.customFill&&e.jsx(l,{value:s.customFillValue,onOwnChange:t=>o("customFillValue",t),description:"Enter the character used to fill missing values in the CSV input file."})]})}];return e.jsx(d,{title:i,input:r,inputComponent:e.jsx(g,{title:"Input CSV",value:r,onChange:n}),resultComponent:e.jsx(x,{title:"Transposed CSV",value:m}),initialValues:v,exampleCards:y,getGroups:f,setInput:n,compute:C,toolInfo:{title:`What is a ${i}?`,description:a}})}export{B as default};
