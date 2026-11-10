import{r as C,j as e,B as u}from"./index-BU4HZ120.js";import{T as P}from"./ToolContent-CjwoZU6G.js";import{T as b}from"./ToolTextInput-DsyGN2G7.js";import{T as x}from"./ToolTextResult-BCDHIrPs.js";import{S as d}from"./SelectWithDesc-Df_1TatG.js";import{C as y}from"./CheckboxWithDesc-fXp_lhhe.js";import{S as p}from"./SimpleRadio-VOFogqpa.js";import{T as h}from"./TextFieldWithDesc-BwhRJ_yB.js";import{s as w,g as F}from"./csv-DDPAtGY4.js";import"./TextField-Bp_Vv8wg.js";import"./ContentPaste-DZwMmqju.js";import"./InputFooter-1OoUTJnY.js";import"./ResultFooter-CXZ4Ps21.js";import"./index-Djc6_I7M.js";import"./MenuItem-qtntJzrn.js";import"./FormControlLabel-DBjytcX7.js";import"./Checkbox-Dj5qpksk.js";import"./SwitchBase-CUrR9BO-.js";import"./Radio-XgWKoFzL.js";function k(r,o){const n=o.fromPositionStatus?Number(o.fromPosition):r.findIndex(a=>a===o.fromHeader)+1,l=o.toPositionStatus?Number(o.toPosition):r.findIndex(a=>a===o.toHeader)+1;if(n<=0||l<=0)throw new Error("Invalid column positions. Check headers or positions.");if(n>r.length||l>r.length)throw new Error(`There are only ${r.length} columns`);return[n,l]}function V(r,o,n){if(o<=0||n<=0)throw new Error("Columns position must be greater than zero ");return r.map(l=>{const a=[...l];return[a[o-1],a[n-1]]=[a[n-1],a[o-1]],a})}function j(r,o){if(!r)return"";const n=w(r,o.deleteComment,o.commentCharacter,o.emptyLines),l=Math.max(...n.map(m=>m.length));for(let m=0;m<n.length;m++)for(let c=0;c<l;c++)n[m][c]||(n[m][c]=o.emptyValuesFilling?"":o.customFiller);const a=k(n[0],o);return V(n,a[0],a[1]).join(`
`)}const T={fromPositionStatus:!0,toPositionStatus:!0,fromPosition:"1",toPosition:"2",fromHeader:"",toHeader:"",emptyValuesFilling:!0,customFiller:"",deleteComment:!0,commentCharacter:"#",emptyLines:!0},W=[{title:"Move the Key Column to the First Position",description:'In this example, we use our CSV column swapping tool to bring the most important information to the first column. As we are planning to go on vacation soon, in the input of the tool, we load data about national parks that include their names and locations. To decide, which is the closest park to us, we need to see the parks location first, therefore, we swap the first and second data columns so that the "location" column is at the beginning of the CSV data.',sampleText:`park_name,location
Yellowstone,Wyoming
Yosemite,California
Grand Canyon,Arizona
Rocky Mountain,Colorado
Zion Park,Utah`,sampleResult:`location,park_name
Wyoming,Yellowstone
California,Yosemite
Arizona,Grand Canyon
Colorado,Rocky Mountain
Utah,Zion Park`,sampleOptions:{fromPositionStatus:!0,toPositionStatus:!0,fromPosition:"1",toPosition:"2",fromHeader:"park_name",toHeader:"location",emptyValuesFilling:!1,customFiller:"*",deleteComment:!1,commentCharacter:"",emptyLines:!1}},{title:"Reorganize Columns in Vitamins CSV",description:'In this example, a lab intern made a mistake and created a corrupted CSV file with mixed-up columns and missing data. To fix the file, we swap the columns based on the headers "Vitamin" and "Function" so that the "Vitamin" column becomes the first in the output data. We also fill the incomplete CSV data by adding a custom asterisk "*" symbol in place of missing values.',sampleText:`Function,Fat-Soluble,Vitamin,Sources
Supports vision,Fat-Soluble,A,Carrots
Immune function,Water-Soluble,C,Citrus fruits
Bone health,Fat-Soluble,D,Fatty fish
Antioxidant,Fat-Soluble,E,Nuts
Blood clotting,Fat-Soluble,K,Leafy greens
Energy production,Water-Soluble,B1
Energy production,Water-Soluble,B2
Energy production,Water-Soluble,B3,Meat
Protein metabolism,Water-Soluble,B6,Poultry
Nervous system,Water-Soluble,B12,Meat`,sampleResult:`Vitamin,Fat-Soluble,Function,Sources
A,Fat-Soluble,Supports vision,Carrots
C,Water-Soluble,Immune function,Citrus fruits
D,Fat-Soluble,Bone health,Fatty fish
E,Fat-Soluble,Antioxidant,Nuts
K,Fat-Soluble,Blood clotting,Leafy greens
B1,Water-Soluble,Energy production,*
B2,Water-Soluble,Energy production,*
B3,Water-Soluble,Energy production,Meat
B6,Water-Soluble,Protein metabolism,Poultry
B12,Water-Soluble,Nervous system,Meat`,sampleOptions:{fromPositionStatus:!1,toPositionStatus:!1,fromPosition:"1",toPosition:"2",fromHeader:"Vitamin",toHeader:"Function",emptyValuesFilling:!1,customFiller:"*",deleteComment:!1,commentCharacter:"",emptyLines:!1}},{title:"Place Columns Side by Side for Analysis",description:'In this example, we change the order of columns in a CSV dataset to have the columns essential for analysis adjacent to each other. We match the "ScreenSize" column by its name and place it in the second-to-last position "-2". This groups the "ScreenSize" and "Price" columns together, allowing us to easily compare and choose the phone we want to buy. We also remove empty lines and specify that lines starting with the "#" symbol are comments and should be left as is.',sampleText:`Brand,Model,ScreenSize,OS,Price

Apple,iPhone 15 Pro Max,6.7″,iOS,$1299
Samsung,Galaxy S23 Ultra,6.8″,Android,$1199
Google,Pixel 7 Pro,6.4″,Android,$899

#OnePlus,11 Pro,6.7″,Android,$949
Xiaomi,13 Ultra,6.6″,Android,$849`,sampleResult:`Brand,Model,OS,ScreenSize,Price
Apple,iPhone 15 Pro Max,iOS,6.7″,$1299
Samsung,Galaxy S23 Ultra,Android,6.8″,$1199
Google,Pixel 7 Pro,Android,6.4″,$899
Xiaomi,13 Ultra,Android,6.6″,$849`,sampleOptions:{fromPositionStatus:!1,toPositionStatus:!0,fromPosition:"1",toPosition:"4",fromHeader:"ScreenSize",toHeader:"OS",emptyValuesFilling:!0,customFiller:"x",deleteComment:!0,commentCharacter:"#",emptyLines:!0}}];function X({title:r,longDescription:o}){const[n,l]=C.useState(""),[a,f]=C.useState(""),m=(t,s)=>{f(j(s,t))},c=F(n),S=c.map(t=>({label:`${t}`,value:t})),g=({values:t,updateField:s})=>[{title:"Swap-From Column",component:e.jsxs(u,{children:[e.jsx(p,{onClick:()=>s("fromPositionStatus",!0),title:"Set Column-From position",checked:t.fromPositionStatus}),t.fromPositionStatus&&e.jsx(h,{description:"Position of the first column you want to swap",value:t.fromPosition,onOwnChange:i=>s("fromPosition",i),type:"number",inputProps:{min:1,max:c.length}}),e.jsx(p,{onClick:()=>s("fromPositionStatus",!1),title:"Set Column-From Header",checked:!t.fromPositionStatus}),!t.fromPositionStatus&&e.jsx(d,{selected:t.fromHeader,options:S,onChange:i=>s("fromHeader",i),description:"Header of the first column you want to swap."})]})},{title:"Swap-to Column",component:e.jsxs(u,{children:[e.jsx(p,{onClick:()=>s("toPositionStatus",!0),title:"Set Column-To position",checked:t.toPositionStatus}),t.toPositionStatus&&e.jsx(h,{description:"Position of the second column you want to swap",value:t.toPosition,onOwnChange:i=>s("toPosition",i),type:"number",inputProps:{min:1,max:c.length}}),e.jsx(p,{onClick:()=>s("toPositionStatus",!1),title:"Set Column-To Header",checked:!t.toPositionStatus}),!t.toPositionStatus&&e.jsx(d,{selected:t.toHeader,options:S,onChange:i=>s("toHeader",i),description:"Header of the second column you want to swap.."})]})},{title:"Incomplete Data",component:e.jsxs(u,{children:[e.jsx(d,{selected:t.emptyValuesFilling,options:[{label:"Fill With Empty Values",value:!0},{label:"Fill with Custom Values",value:!1}],onChange:i=>s("emptyValuesFilling",i),description:"Fill incomplete CSV data with empty symbols or a custom symbol."}),!t.emptyValuesFilling&&e.jsx(h,{description:"Specify a custom symbol to fill incomplete CSV data with",value:t.customFiller,onOwnChange:i=>s("customFiller",i)})]})},{title:"Comments and Empty Lines",component:e.jsxs(u,{children:[e.jsx(y,{checked:t.deleteComment,onChange:i=>s("deleteComment",i),title:"Delete Comments",description:"if checked, comments given by the following character will be deleted"}),t.deleteComment&&e.jsx(h,{description:"Specify the character used to start comments in the input CSV (and if needed remove them via checkbox above)",value:t.commentCharacter,onOwnChange:i=>s("commentCharacter",i)}),e.jsx(y,{checked:t.emptyLines,onChange:i=>s("emptyLines",i),title:"Delete Empty Lines",description:"Do not include empty lines in the output data."})]})}];return e.jsx(P,{title:r,input:n,inputComponent:e.jsx(b,{value:n,onChange:l}),resultComponent:e.jsx(x,{value:a}),initialValues:T,getGroups:g,setInput:l,compute:m,toolInfo:{title:`What is a ${r}?`,description:o},exampleCards:W})}export{X as default};
