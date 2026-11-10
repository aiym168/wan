import{a as x,r as g,j as n,B as v}from"./index-BU4HZ120.js";import{T as N}from"./ToolContent-CjwoZU6G.js";import{T as P}from"./ToolTextInput-DsyGN2G7.js";import{T as y}from"./ToolTextResult-BCDHIrPs.js";import{s as b,g as I}from"./csv-DDPAtGY4.js";import{n as u,t as f}from"./array-DpzUVg7q.js";import{T as c}from"./TextFieldWithDesc-BwhRJ_yB.js";import{S as h}from"./SelectWithDesc-Df_1TatG.js";import"./TextField-Bp_Vv8wg.js";import"./ContentPaste-DZwMmqju.js";import"./InputFooter-1OoUTJnY.js";import"./ResultFooter-CXZ4Ps21.js";import"./index-Djc6_I7M.js";import"./MenuItem-qtntJzrn.js";function M(d,o){if(!d||!o.csvToInsert)return"";const e=b(d,!0,o.commentCharacter,!0,o.separator,o.quoteChar),l=o.customFill?u(e,o.customFillValue):u(e,"");let r=f(l);const p=b(o.csvToInsert,!0,o.commentCharacter,!0,o.separator,o.quoteChar),w=o.customFill?u(p,o.customFillValue):u(p,""),m=f(w);switch(o.insertingPosition){case"prepend":r=[...m,...r];break;case"append":r=[...r,...m];break;case"custom":if(o.customPostionOptions==="headerName"){const i=o.headerName,t=l[0].indexOf(i);t!==-1&&(r=[...r.slice(0,t+1),...m,...r.slice(t+1)])}else if(o.customPostionOptions==="rowNumber"){const i=o.rowNumber;i>=0&&i<=r.length&&(r=[...r.slice(0,i),...m,...r.slice(i)])}break}const C=u(r,o.customFillValue);return f(C).map(i=>i.join(o.separator)).join(`
`)}const O={csvToInsert:"",commentCharacter:"#",separator:",",quoteChar:'"',insertingPosition:"append",customFill:!1,customFillValue:"",customPostionOptions:"headerName",headerName:"",rowNumber:1},V=[{title:"Insert a single column by position",description:'In this example, we insert a single column "city" at position 1 in the CSV data. The input CSV has data about cars, including the "Brand" and "Model" of the car. We now add a "city" column at position 1. To do this, we enter the city data in the comma-separated format in the "New Column" option, and to quickly add the new column at position 1, then we specify the position number.',sampleText:`Brand,Model
Toyota,Camry
Ford,Mustang
Honda,Accord
Chevrolet,Malibu`,sampleResult:`city,Brand,Model
dallas,Toyota,Camry
houston,Ford,Mustang
dallas,Honda,Accord
houston,Chevrolet,Malibu`,sampleOptions:{csvToInsert:`city
dallas
houston`,commentCharacter:"#",separator:",",quoteChar:'"',insertingPosition:"custom",customFill:!0,customFillValue:"k",customPostionOptions:"rowNumber",headerName:"",rowNumber:1}},{title:"Append Multiple columns by header Name",description:'In this example, we append two data columns to the end of CSV data. The input CSV has data about cars, including the "Brand" and "Model" of the car. We now add two more columns at the end: "Year" and "Price". To do this, we enter these two data columns in the comma-separated format in the "New Column" option, and to quickly add the new columns to the end of the CSV, then we specify the name of the header they should be put after.',sampleText:`Brand,Model
Toyota,Camry
Ford,Mustang
Honda,Accord
Chevrolet,Malibu`,sampleResult:`Brand,Model,Year,Price
Toyota,Camry,2022,25000
Ford,Mustang,2021,35000
Honda,Accord,2022,27000
Chevrolet,Malibu,2021,28000`,sampleOptions:{csvToInsert:`Year,Price
2022,25000
2021,35000
2022,27000
2021,28000`,commentCharacter:"#",separator:",",quoteChar:'"',insertingPosition:"custom",customFill:!1,customFillValue:"x",customPostionOptions:"headerName",headerName:"Model",rowNumber:1}},{title:"Append Multiple columns",description:'In this example, we append two data columns to the end of CSV data. The input CSV has data about cars, including the "Brand" and "Model" of the car. We now add two more columns at the end: "Year" and "Price". To do this, we enter these two data columns in the comma-separated format in the "New Column" option, and to quickly add the new columns to the end of the CSV, then we select append.',sampleText:`Brand,Model
Toyota,Camry
Ford,Mustang
Honda,Accord
Chevrolet,Malibu`,sampleResult:`Brand,Model,Year,Price
Toyota,Camry,2022,25000
Ford,Mustang,2021,35000
Honda,Accord,2022,27000
Chevrolet,Malibu,2021,28000`,sampleOptions:{csvToInsert:`Year,Price
2022,25000
2021,35000
2022,27000
2021,28000`,commentCharacter:"#",separator:",",quoteChar:'"',insertingPosition:"append",customFill:!1,customFillValue:"x",customPostionOptions:"rowNumber",headerName:"",rowNumber:1}}];function G({title:d,longDescription:o}){const{t:e}=x("csv"),[l,r]=g.useState(""),[p,w]=g.useState(""),m=(t,a)=>{w(M(a,t))},C=I(l),T=C.length>0?C.map(t=>({label:`${t}`,value:t})):[],i=({values:t,updateField:a})=>[{title:e("insertCsvColumns.csvToInsert"),component:n.jsx(v,{children:n.jsx(c,{multiline:!0,rows:3,value:t.csvToInsert,onOwnChange:s=>a("csvToInsert",s),title:e("insertCsvColumns.csvSeparator"),description:e("insertCsvColumns.csvToInsertDescription")})})},{title:e("insertCsvColumns.csvOptions"),component:n.jsxs(v,{children:[n.jsx(c,{value:t.separator,onOwnChange:s=>a("separator",s),description:e("insertCsvColumns.separatorDescription")}),n.jsx(c,{value:t.quoteChar,onOwnChange:s=>a("quoteChar",s),description:e("insertCsvColumns.quoteCharDescription")}),n.jsx(c,{value:t.commentCharacter,onOwnChange:s=>a("commentCharacter",s),description:e("insertCsvColumns.commentCharacterDescription")}),n.jsx(h,{selected:t.customFill,options:[{label:e("insertCsvColumns.fillWithEmptyValues"),value:!1},{label:e("insertCsvColumns.fillWithCustomValues"),value:!0}],onChange:s=>{a("customFill",s),s||a("customFillValue","")},description:e("insertCsvColumns.customFillDescription")}),t.customFill&&n.jsx(c,{value:t.customFillValue,onOwnChange:s=>a("customFillValue",s),description:e("insertCsvColumns.customFillValueDescription")})]})},{title:e("insertCsvColumns.positionOptions"),component:n.jsxs(v,{children:[n.jsx(h,{selected:t.insertingPosition,options:[{label:e("insertCsvColumns.prependColumns"),value:"prepend"},{label:e("insertCsvColumns.appendColumns"),value:"append"},{label:e("insertCsvColumns.customPosition"),value:"custom"}],onChange:s=>a("insertingPosition",s),description:e("insertCsvColumns.insertingPositionDescription")}),t.insertingPosition==="custom"&&n.jsx(h,{selected:t.customPostionOptions,options:[{label:e("insertCsvColumns.headerName"),value:"headerName"},{label:e("insertCsvColumns.position"),value:"rowNumber"}],onChange:s=>a("customPostionOptions",s),description:e("insertCsvColumns.customPositionOptionsDescription")}),t.insertingPosition==="custom"&&t.customPostionOptions==="headerName"&&n.jsx(h,{selected:t.headerName,options:T,onChange:s=>a("headerName",s),description:e("insertCsvColumns.headerNameDescription")}),t.insertingPosition==="custom"&&t.customPostionOptions==="rowNumber"&&n.jsx(c,{value:t.rowNumber.toString(),onOwnChange:s=>a("rowNumber",parseInt(s)||0),description:e("insertCsvColumns.rowNumberDescription"),type:"number"})]})}];return n.jsx(N,{title:d,inputComponent:n.jsx(P,{title:e("insertCsvColumns.inputTitle"),value:l,onChange:r}),resultComponent:n.jsx(y,{title:e("insertCsvColumns.resultTitle"),value:p,extension:"csv"}),initialValues:O,getGroups:i,compute:m,input:l,setInput:r,toolInfo:{title:e("insertCsvColumns.toolInfo.title"),description:e("insertCsvColumns.toolInfo.description")},exampleCards:V})}export{G as default};
