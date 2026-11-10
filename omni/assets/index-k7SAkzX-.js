import{aJ as f,r as C,j as s,B as d}from"./index-BU4HZ120.js";import{T as v}from"./ToolContent-CjwoZU6G.js";import{T as S}from"./ToolTextInput-DsyGN2G7.js";import{T as x}from"./ToolTextResult-BCDHIrPs.js";import{s as g,g as j}from"./csv-DDPAtGY4.js";import{T as m}from"./TextFieldWithDesc-BwhRJ_yB.js";import{C as y}from"./CheckboxWithDesc-fXp_lhhe.js";import"./TextField-Bp_Vv8wg.js";import"./ContentPaste-DZwMmqju.js";import"./InputFooter-1OoUTJnY.js";import"./ResultFooter-CXZ4Ps21.js";import"./index-Djc6_I7M.js";import"./FormControlLabel-DBjytcX7.js";import"./Checkbox-Dj5qpksk.js";import"./SwitchBase-CUrR9BO-.js";function w(t,e=2){if(e==0)throw new Error("Indent spaces must be greater than zero");const o=" ".repeat(e);return Array.isArray(t)&&t.length>0&&typeof t[0]=="object"&&!Array.isArray(t[0])?t.map(a=>`-
${Object.entries(a).map(([r,c])=>`${o}${r}: ${c}`).join(`
`)}`).join(`
`):Array.isArray(t)&&Array.isArray(t[0])?t.map(a=>`-
${a.map(r=>`${o}- ${r}`).join(`
`)}`).join(`
`):"invalid input"}function A(t,e){if(!t)return"";const o=g(t,!0,e.commentCharacter,e.emptyLines,e.csvSeparator,e.quoteCharacter);if(o.forEach(a=>{a.forEach((h,r)=>{a[r]=f(h,e.quoteCharacter)})}),e.headerRow){const a=j(t,e.csvSeparator,e.quoteCharacter,e.commentCharacter);a.forEach((r,c)=>{a[c]=f(r,e.quoteCharacter)});const h=o.slice(1).map(r=>{const c={};return a.forEach((u,i)=>{c[u]=r[i]??""}),c});return w(h,e.spaces)}return w(o,e.spaces)}const p={csvSeparator:",",quoteCharacter:'"',commentCharacter:"#",emptyLines:!0,headerRow:!0,spaces:2},k=[{title:"Convert Music Playlist CSV to YAML",description:'In this example, we transform a short CSV file containing a music playlist into structured YAML data. The input CSV contains five records with three columns each and the output YAML contains five lists of lists (one list for each CSV record). In YAML, lists start with the "-" symbol and the nested lists are indented with two spaces',sampleText:`The Beatles,"Yesterday",Pop Rock
Queen,"Bohemian Rhapsody",Rock
Nirvana,"Smells Like Teen Spirit",Grunge
Michael Jackson,"Billie Jean",Pop
Stevie Wonder,"Superstition",Funk`,sampleResult:`-
  - The Beatles
  - Yesterday
  - Pop Rock
- 
  - Queen
  - Bohemian Rhapsody
  - Rock
- 
  - Nirvana
  - Smells Like Teen Spirit
  - Grunge
- 
  - Michael Jackson
  - Billie Jean
  - Pop
-
  - Stevie Wonder
  - Superstition
  - Funk`,sampleOptions:{...p,headerRow:!1}},{title:"Planetary CSV Data",description:'In this example, we are working with CSV data that summarizes key properties of three planets in our solar system. The data consists of three columns with headers "planet", "relative mass" (with "1" being the mass of earth), and "satellites". To preserve the header names in the output YAML data, we enable the "Transform Headers" option, creating a YAML file that contains a list of YAML objects, where each object has three keys: "planet", "relative mass", and "satellites".',sampleText:`planet,relative mass,satellites
Venus,0.815,0
Earth,1.000,1
Mars,0.107,2`,sampleResult:`-
  planet: Venus
  relative mass: 0.815
  satellites: '0'
- 
  planet: Earth
  relative mass: 1.000
  satellites: '1'
- 
  planet: Mars
  relative mass: 0.107
  satellites: '2'`,sampleOptions:{...p}},{title:"Convert Non-standard CSV to YAML",description:'In this example, we convert a CSV file with non-standard formatting into a regular YAML file. The input data uses a semicolon as a separator for the "product", "quantity", and "price" fields. It also contains empty lines and lines that are commented out. To make the program work with this custom CSV file, we input the semicolon symbol in the CSV delimiter options. To skip comments, we specify "#" as the symbol that starts comments. And to remove empty lines, we activate the option for skipping blank lines (that do not contain any symbols). In the output, we obtain a YAML file that contains a list of three objects, which use CSV headers as keys. Additionally, the objects in the YAML file are indented with four spaces.',sampleText:`item;quantity;price
milk;2;3.50

#eggs;12;2.99
bread;1;4.25
#apples;4;1.99
cheese;1;8.99`,sampleResult:`-
  item: milk
  quantity: 2
  price: 3.50
-
  item: bread
  quantity: 1
  price: 4.25
-
  item: cheese
  quantity: 1
  price: 8.99`,sampleOptions:{...p,csvSeparator:";"}}];function N({title:t,longDescription:e}){const[o,a]=C.useState(""),[h,r]=C.useState(""),c=(i,l)=>{r(A(l,i))},u=({values:i,updateField:l})=>[{title:"Adjust CSV input",component:s.jsxs(d,{children:[s.jsx(m,{value:i.csvSeparator,onOwnChange:n=>l("csvSeparator",n),description:"Enter the character used to delimit columns in the CSV file."}),s.jsx(m,{value:i.quoteCharacter,onOwnChange:n=>l("quoteCharacter",n),description:"Enter the quote character used to quote the CSV fields."}),s.jsx(m,{value:i.commentCharacter,onOwnChange:n=>l("commentCharacter",n),description:"Enter the character indicating the start of a comment line. Lines starting with this symbol will be skipped."})]})},{title:"Conversion Options",component:s.jsxs(d,{children:[s.jsx(y,{checked:i.headerRow,onChange:n=>l("headerRow",n),title:"Use Headers",description:"Keep the first row as column names."}),s.jsx(y,{checked:i.emptyLines,onChange:n=>l("emptyLines",n),title:"Ignore Lines with No Data",description:"Enable to prevent the conversion of empty lines in the input CSV file."})]})},{title:"Adjust YAML indentation",component:s.jsx(d,{children:s.jsx(m,{value:i.spaces,type:"number",onOwnChange:n=>l("spaces",Number(n)),inputProps:{min:1},description:"Set the number of spaces to use for YAML indentation."})})}];return s.jsx(v,{title:t,input:o,inputComponent:s.jsx(S,{title:"Input CSV",value:o,onChange:a}),resultComponent:s.jsx(x,{title:"Output YAML",value:h}),initialValues:p,exampleCards:k,getGroups:u,setInput:a,compute:c,toolInfo:{title:`What is a ${t}?`,description:e}})}export{N as default};
