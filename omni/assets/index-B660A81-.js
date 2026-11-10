import{aJ as g,r as u,j as a,B as d}from"./index-BU4HZ120.js";import{T as C}from"./ToolContent-CjwoZU6G.js";import{T}from"./ToolTextInput-DsyGN2G7.js";import{T as w}from"./ToolTextResult-BCDHIrPs.js";import{C as f}from"./CheckboxWithDesc-fXp_lhhe.js";import{T as p}from"./TextFieldWithDesc-BwhRJ_yB.js";import"./TextField-Bp_Vv8wg.js";import"./ContentPaste-DZwMmqju.js";import"./InputFooter-1OoUTJnY.js";import"./ResultFooter-CXZ4Ps21.js";import"./index-Djc6_I7M.js";import"./FormControlLabel-DBjytcX7.js";import"./Checkbox-Dj5qpksk.js";import"./SwitchBase-CUrR9BO-.js";function x(i,l,s,n,h,c){if(!i)return"";const r=i.split(`
`);h||r.shift();const m=r.map(e=>{if(n&&e.startsWith(n))return"";const t=e.split(l);return t.forEach((o,y)=>{t[y]=g(o,s)}),t.join("	")});return c?m.filter(e=>e.trim()!=="").join(`
`):m.join(`
`)}const v={delimiter:",",quoteCharacter:'"',commentCharacter:"#",header:!0,emptyLines:!0},S=[{title:"Convert Game Data from the CSV Format to the TSV Format",description:`In this example, we transform a Comma Separated Values (CSV) file containing a leaderboard of gaming data into a Tab Separated Values (TSV) file. The input data shows the players' names, scores, times, and goals. We preserve the CSV column headers by enabling the "Preserve Headers" option and convert all data rows into TSV format. The resulting data is easier to work with as it's organized in neat columns`,sampleText:`player_name,score,time,goals
ToniJackson,2500,30:00,15
HenryDalton,1800,25:00,12
DavidLee,3200,40:00,20
EmmaJones,2100,35:00,17
KrisDavis,1500,20:00,10`,sampleResult:`player_name	score	time	goals
ToniJackson	2500	30:00	15
HenryDalton	1800	25:00	12
DavidLee	3200	40:00	20
EmmaJones	2100	35:00	17
KrisDavis	1500	20:00	10`,sampleOptions:{delimiter:",",quoteCharacter:'"',commentCharacter:"#",header:!0,emptyLines:!0}},{title:"Mythical Creatures",description:"In this example, we load a CSV file containing coffee varieties and their origins. The file is quite messy, with numerous empty lines and comments, and it is hard to work with. To clean up the file, we specify the comment pattern // in the options, and the program automatically removes the comment lines from the input. Also, the empty lines are automatically removed. Once the file is cleaned up, we transform the five clean rows into five columns, each having a height of two fields.",sampleText:`creature;origin;habitat;powers
Unicorn;Mythology;Forest;Magic horn
Mermaid;Mythology;Ocean;Hypnotic singing
Vampire;Mythology;Castles;Immortality
Phoenix;Mythology;Desert;Rebirth from ashes

#Dragon;Mythology;Mountains;Fire breathing
#Werewolf;Mythology;Forests;Shape shifting`,sampleResult:`Unicorn	Mythology	Forest	Magic horn
Mermaid	Mythology	Ocean	Hypnotic singing
Vampire	Mythology	Castles	Immortality
Phoenix	Mythology	Desert	Rebirth from ashes`,sampleOptions:{delimiter:";",quoteCharacter:'"',commentCharacter:"#",header:!1,emptyLines:!0}},{title:"Convert Fitness Tracker Data from CSV to TSV",description:'In this example, we swap rows and columns in CSV data about team sports, the equipment used, and the number of players. The input has 5 rows and 3 columns and once rows and columns have been swapped, the output has 3 rows and 5 columns. Also notice that in the last data record, for the "Baseball" game, the number of players is missing. To create a fully-filled CSV, we use a custom message "NA", specified in the options, and fill the missing CSV field with this value.',sampleText:`day,steps,distance,calories

Mon,7500,3.75,270
Tue,12000,6.00,420

Wed,8000,4.00,300
Thu,9500,4.75,330
Fri,10000,5.00,350`,sampleResult:`day	steps	distance	calories
Mon	7500	3.75	270
Tue	12000	6.00	420
Wed	8000	4.00	300
Thu	9500	4.75	330
Fri	10000	5.00	350`,sampleOptions:{delimiter:",",quoteCharacter:'"',commentCharacter:"#",header:!0,emptyLines:!0}}];function H({title:i,longDescription:l}){const[s,n]=u.useState(""),[h,c]=u.useState(""),r=(e,t)=>{c(x(t,e.delimiter,e.quoteCharacter,e.commentCharacter,e.header,e.emptyLines))},m=({values:e,updateField:t})=>[{title:"CSV Format Options",component:a.jsxs(d,{children:[a.jsx(p,{value:e.delimiter,onOwnChange:o=>t("delimiter",o),description:"Enter the character used to delimit columns in the CSV file."}),a.jsx(p,{value:e.quoteCharacter,onOwnChange:o=>t("quoteCharacter",o),description:"Enter the quote character used to quote the CSV fields."}),a.jsx(p,{value:e.commentCharacter,onOwnChange:o=>t("commentCharacter",o),description:"Enter the character indicating the start of a comment line. Lines starting with this symbol will be skipped."})]})},{title:"Conversion Options",component:a.jsxs(d,{children:[a.jsx(f,{checked:e.header,onChange:o=>t("header",o),title:"Use Headers",description:"Keep the first row as column names."}),a.jsx(f,{checked:e.emptyLines,onChange:o=>t("emptyLines",o),title:"Ignore Lines with No Data",description:"Enable to prevent the conversion of empty lines in the input CSV file."})]})}];return a.jsx(C,{title:i,input:s,inputComponent:a.jsx(T,{value:s,onChange:n}),resultComponent:a.jsx(w,{value:h}),initialValues:v,getGroups:m,setInput:n,compute:r,toolInfo:{title:`What is a ${i}?`,description:l},exampleCards:S})}export{H as default};
