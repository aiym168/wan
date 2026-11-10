import{r as p,j as t,B as m}from"./index-CZybyyg9.js";import{T as f}from"./ToolContent-Bd6fLJl_.js";import{T as S}from"./ToolTextInput-CKsb_Rab.js";import{T as g}from"./ToolTextResult-CS8CdXTe.js";import{s as b}from"./csv-DDPAtGY4.js";import{T as n}from"./TextFieldWithDesc-aF9TFoAR.js";import{C as h}from"./CheckboxWithDesc-CCXkRjIT.js";import"./TextField-BAaRYrNT.js";import"./ContentPaste-Buz3qiOw.js";import"./InputFooter-pt5Fl6zr.js";import"./ResultFooter-7IET4Cnp.js";import"./index-Djc6_I7M.js";import"./FormControlLabel-2LzZzeyg.js";import"./Checkbox-CSzIQgsq.js";import"./SwitchBase-BWXYtFov.js";function v(r,a){return r?b(r,!0,a.commentCharacter,a.emptyLines,a.inputSeparator,a.inputQuoteCharacter).map(s=>s.map(l=>a.outputQuoteAll?`${a.OutputQuoteCharacter}${l}${a.OutputQuoteCharacter}`:l).join(a.outputSeparator)).join(`
`):""}const w={inputSeparator:",",inputQuoteCharacter:'"',commentCharacter:"#",emptyLines:!1,outputSeparator:";",outputQuoteAll:!1,OutputQuoteCharacter:'"'},L=[{title:"Change the CSV Delimiter to a Semicolon",description:'In this example, we change the column separator to the semicolon separator in a CSV file containing data about countries, their populations, and population densities. As you can see, the input CSV file uses the standard commas as separators. After specifying this delimiter in the source CSV options, we set a new CSV delimiter for the output file to a semicolon, resulting in a new CSV file that now uses semicolons ";" in the output. Such CSV files with semicolons are called SSV files (semicolon-separated values files)',sampleText:`country,population,density
China,1412,152
India,1408,428
United States,331,37
Indonesia,273,145
Pakistan,231,232
Brazil,214,26`,sampleResult:`country;population;density
China;1412;152
India;1408;428
United States;331;37
Indonesia;273;145
Pakistan;231;232
Brazil;214;26`,sampleOptions:{inputSeparator:",",inputQuoteCharacter:'"',commentCharacter:"#",emptyLines:!1,outputSeparator:";",outputQuoteAll:!1,OutputQuoteCharacter:'"'}},{title:"Restore a CSV File to the Standard Format",description:'In this example, a data scientist working with flowers was given an unusual CSV file that uses the vertical bar symbol as the field separator (such files are called PSV files – pipe-separated values files). To transform the file back to the standard comma-separated values (CSV) file, in the options, she set the input delimiter to "|" and the new delimiter to ",". She also wrapped the output fields in single quotes, enabled the option to remove empty lines from the input, and discarded comment lines starting with the "#" symbol.',sampleText:`species|height|days|temperature

Sunflower|50cm|30|25°C
Rose|40cm|25|22°C
Tulip|35cm|20|18°C
Daffodil|30cm|15|20°C

Lily|45cm|28|23°C
#pumpkin
Brazil,214,26`,sampleResult:`'species','height','days','temperature'
'Sunflower','50cm','30','25°C'
'Rose','40cm','25','22°C'
'Tulip','35cm','20','18°C'
'Daffodil','30cm','15','20°C'
'Lily','45cm','28','23°C'`,sampleOptions:{inputSeparator:"|",inputQuoteCharacter:'"',commentCharacter:"#",emptyLines:!0,outputSeparator:",",outputQuoteAll:!0,OutputQuoteCharacter:"'"}},{title:"Plants vs. Zombies CSV",description:"In this example, we import CSV data with zombie characters from the game Plants vs. Zombies. The data includes zombies names, the level at which they first appear in the game, their health, damage, and speed. The data follows the standard CSV format, with commas serving as field separators. To change the readability of the file, we replace the usual comma delimiter with a slash symbol, creating a slash-separated values file.",sampleText:`zombie_name,first_seen,health,damage,speed
Normal Zombie,Level 1-1,181,100,4.7
Conehead Zombie,Level 1-3,551,100,4.7
Buckethead Zombi,Level 1-8,1281,100,4.7
Newspaper Zombie,Level 2-1,331,100,4.7
Football Zombie,Level 2-6,1581,100,2.5
Dancing Zombie,Level 2-8,335,100,1.5
Zomboni,Level 3-6,1151,Instant-kill,varies
Catapult Zombie,Level 5-6,651,75,2.5
Gargantuar,Level 5-8,3000,Instant-kill,4.7`,sampleResult:`zombie_name/first_seen/health/damage/speed
Normal Zombie/Level 1-1/181/100/4.7
Conehead Zombie/Level 1-3/551/100/4.7
Buckethead Zombi/Level 1-8/1281/100/4.7
Newspaper Zombie/Level 2-1/331/100/4.7
Football Zombie/Level 2-6/1581/100/2.5
Dancing Zombie/Level 2-8/335/100/1.5
Zomboni/Level 3-6/1151/Instant-kill/varies
Catapult Zombie/Level 5-6/651/75/2.5
Gargantuar/Level 5-8/3000/Instant-kill/4.7`,sampleOptions:{inputSeparator:",",inputQuoteCharacter:'"',commentCharacter:"#",emptyLines:!0,outputSeparator:"/",outputQuoteAll:!1,OutputQuoteCharacter:"'"}}];function E({title:r,longDescription:a}){const[u,s]=p.useState(""),[l,c]=p.useState(""),d=(o,i)=>{c(v(i,o))},C=({values:o,updateField:i})=>[{title:"Adjust CSV input options",component:t.jsxs(m,{children:[t.jsx(n,{value:o.inputSeparator,onOwnChange:e=>i("inputSeparator",e),description:"Enter the character used to delimit columns in the CSV input file."}),t.jsx(n,{value:o.inputQuoteCharacter,onOwnChange:e=>i("inputQuoteCharacter",e),description:"Enter the quote character used to quote the CSV input fields."}),t.jsx(n,{value:o.commentCharacter,onOwnChange:e=>i("commentCharacter",e),description:"Enter the character indicating the start of a comment line. Lines starting with this symbol will be skipped."}),t.jsx(h,{checked:o.emptyLines,onChange:e=>i("emptyLines",e),title:"Delete Lines with No Data",description:"Remove empty lines from CSV input file."})]})},{title:"Output options",component:t.jsxs(m,{children:[t.jsx(n,{value:o.outputSeparator,onOwnChange:e=>i("outputSeparator",e),description:"Enter the character used to delimit columns in the CSV output file."}),t.jsx(h,{checked:o.outputQuoteAll,onChange:e=>i("outputQuoteAll",e),title:"Quote All Output Fields",description:"Wrap all fields of the output CSV file in quotes"}),o.outputQuoteAll&&t.jsx(n,{value:o.OutputQuoteCharacter,onOwnChange:e=>i("OutputQuoteCharacter",e),description:"Enter the quote character used to quote the CSV output fields."})]})}];return t.jsx(f,{title:r,input:u,inputComponent:t.jsx(S,{title:"Input CSV",value:u,onChange:s}),resultComponent:t.jsx(g,{title:"Output CSV",value:l}),initialValues:w,exampleCards:L,getGroups:C,setInput:s,compute:d,toolInfo:{title:`What is a ${r}?`,description:a}})}export{E as default};
