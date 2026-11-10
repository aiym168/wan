import{a as C,r as g,j as o,B as f}from"./index-CZybyyg9.js";import{T as y}from"./ToolContent-Bd6fLJl_.js";import{T as v}from"./ToolTextInput-CKsb_Rab.js";import{T}from"./ToolTextResult-CS8CdXTe.js";import{s as x}from"./csv-DDPAtGY4.js";import{T as u}from"./TextFieldWithDesc-aF9TFoAR.js";import{C as h}from"./CheckboxWithDesc-CCXkRjIT.js";import"./TextField-BAaRYrNT.js";import"./ContentPaste-Buz3qiOw.js";import"./InputFooter-pt5Fl6zr.js";import"./ResultFooter-7IET4Cnp.js";import"./index-Djc6_I7M.js";import"./FormControlLabel-2LzZzeyg.js";import"./Checkbox-CSzIQgsq.js";import"./SwitchBase-BWXYtFov.js";function b(i,s,e,l,r){const t=s+1;if(!l&&i.length===1&&i[0]==="")return{title:"Missing Line",message:`Line ${t} is empty.`};if(i.length<e)return{title:`Found missing column(s) on line ${t}`,message:`Line ${t} has ${e-i.length} missing column(s).`};if(i.length==e&&r){let c=!1,p=`Empty values on line ${t}: `;if(i.forEach((d,a)=>{d.trim()===""&&(c=!0,p+=`column ${a+1}, `)}),c)return{title:`Found missing values on line ${t}`,message:p.slice(0,-2)+"."}}return null}function L(i,s){if(!i)return"";if(s.messageLimit&&s.messageNumber<=0)throw new Error("Message number must be greater than 0");const e=x(i,!0,s.commentCharacter,s.emptyLines,s.csvSeparator,s.quoteCharacter),l=Math.max(...e.map(t=>t.length)),r=e.map((t,c)=>b(t,c,l,s.emptyLines,s.emptyValues)).filter(Boolean).map(t=>`Title: ${t.title}
Message: ${t.message}`);return r.length>0?s.messageLimit?r.slice(0,s.messageNumber).join(`

`):r.join(`

`):"The Csv input is complete."}const S={csvSeparator:",",quoteCharacter:'"',commentCharacter:"#",emptyLines:!0,emptyValues:!0,messageLimit:!1,messageNumber:10},I=[{title:"CSV Completeness Check",description:'In this example, we upload a simple CSV file containing names, surnames, and dates of birth. The tool analyzes the data and displays a green "Complete CSV" badge as it finds that there are no missing values or empty records. To say it differently, this check confirms that all rows and columns have the expected number of values in the data and the file is ready for use in any software that imports CSV files without hiccups.',sampleText:`name,surname,dob
John,Warner,1990-05-15
Lily,Meadows,1985-12-20
Jaime,Crane,1993-01-23
Jeri,Carroll,2000-11-07
Simon,Harper,2013-04-10`,sampleResult:"The Csv input is complete.",sampleOptions:{csvSeparator:",",quoteCharacter:'"',commentCharacter:"#",emptyLines:!0,emptyValues:!0,messageLimit:!1,messageNumber:10}},{title:"Find Missing Fields in Broken CSV",description:"In this example, we find the missing fields in a CSV file containing city names, time zones, and standard time information. As a result of the analysis, we see a red badge in the output and a text list of missing values in the dataset. The file has missing values on two rows: row 3 lacks standard time data (column 3), and row 5 lacks time zone and standard time data (columns 2 and 3).",sampleText:`City,Time Zone,Standard Time
London,UTC+00:00,GMT
Chicago,UTC-06:00
Tokyo,UTC+09:00,JST
Sydney
Berlin,UTC+01:00,CET`,sampleResult:`Title: Found missing column(s) on line 3
Message: Line 3 has 1 missing column(s).

Title: Found missing column(s) on line 5
Message: Line 5 has 2 missing column(s).`,sampleOptions:{csvSeparator:",",quoteCharacter:'"',commentCharacter:"#",emptyLines:!0,emptyValues:!1,messageLimit:!0,messageNumber:10}},{title:"Detect Empty and Missing Values",description:'This example checks a data file containing information astronomical data about constellations. Not only does it find incomplete records but also detects all empty fields by activating the "Find Empty Values" checkbox. The empty fields are those that have zero length or contain just whitespace. Such fields contain no information. Additionally, since this file uses semicolons instead of commas for separators, we specify the ";" symbol in the options to make the program work with SSV (Semicolon-Separated Values) data. As a result, the program identifies three empty fields and one row with missing data.',sampleText:`Abbreviation;Constellation;Main stars

Cas;Cassiopeia;5
Cep;Cepheus;7
;Andromeda;16

Cyg;;
Del;Delphinus`,sampleResult:`Title: Found missing values on line 4
Message: Empty values on line 4: column 1.

Title: Found missing values on line 5
Message: Empty values on line 5: column 2, column 3.

Title: Found missing column(s) on line 6
Message: Line 6 has 1 missing column(s).`,sampleOptions:{csvSeparator:";",quoteCharacter:'"',commentCharacter:"#",emptyLines:!0,emptyValues:!0,messageLimit:!0,messageNumber:10}}];function W({title:i,longDescription:s}){const{t:e}=C("csv"),[l,r]=g.useState(""),[t,c]=g.useState(""),p=(a,m)=>{c(L(m,a))},d=({values:a,updateField:m})=>[{title:e("findIncompleteCsvRecords.csvInputOptions"),component:o.jsxs(f,{children:[o.jsx(u,{value:a.csvSeparator,onOwnChange:n=>m("csvSeparator",n),description:e("findIncompleteCsvRecords.csvSeparatorDescription")}),o.jsx(u,{value:a.quoteCharacter,onOwnChange:n=>m("quoteCharacter",n),description:e("findIncompleteCsvRecords.quoteCharacterDescription")}),o.jsx(u,{value:a.commentCharacter,onOwnChange:n=>m("commentCharacter",n),description:e("findIncompleteCsvRecords.commentCharacterDescription")})]})},{title:e("findIncompleteCsvRecords.checkingOptions"),component:o.jsxs(f,{children:[o.jsx(h,{checked:a.emptyLines,onChange:n=>m("emptyLines",n),title:e("findIncompleteCsvRecords.deleteLinesWithNoData"),description:e("findIncompleteCsvRecords.deleteLinesWithNoDataDescription")}),o.jsx(h,{checked:a.emptyValues,onChange:n=>m("emptyValues",n),title:e("findIncompleteCsvRecords.findEmptyValues"),description:e("findIncompleteCsvRecords.findEmptyValuesDescription")}),o.jsx(h,{checked:a.messageLimit,onChange:n=>m("messageLimit",n),title:e("findIncompleteCsvRecords.limitNumberOfMessages")}),a.messageLimit&&o.jsx(u,{value:a.messageNumber,onOwnChange:n=>m("messageNumber",Number(n)),type:"number",inputProps:{min:1},description:e("findIncompleteCsvRecords.messageLimitDescription")})]})}];return o.jsx(y,{title:i,input:l,inputComponent:o.jsx(v,{title:e("findIncompleteCsvRecords.inputTitle"),value:l,onChange:r}),resultComponent:o.jsx(T,{title:e("findIncompleteCsvRecords.resultTitle"),value:t}),initialValues:S,exampleCards:I,getGroups:d,setInput:r,compute:p,toolInfo:{title:e("findIncompleteCsvRecords.toolInfo.title",{title:i}),description:s}})}export{W as default};
