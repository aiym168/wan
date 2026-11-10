import{a as C,r as p,j as a,B as g}from"./index-CZybyyg9.js";import{T}from"./ToolTextResult-CS8CdXTe.js";import{T as w}from"./service-CrQD3d6d.js";import{T as v}from"./ToolTextInput-CKsb_Rab.js";import{T as D}from"./ToolContent-Bd6fLJl_.js";import{T as y}from"./TextFieldWithDesc-aF9TFoAR.js";import{C as d}from"./CheckboxWithDesc-CCXkRjIT.js";import"./ContentPaste-Buz3qiOw.js";import"./ResultFooter-7IET4Cnp.js";import"./index-Djc6_I7M.js";import"./TextField-BAaRYrNT.js";import"./InputFooter-pt5Fl6zr.js";import"./FormControlLabel-2LzZzeyg.js";import"./Checkbox-CSzIQgsq.js";import"./SwitchBase-BWXYtFov.js";function b(e,s){return s.emptyLines?e.split(`
`).length:e.split(`
`).filter(n=>n.trim()!=="").length}function S(e){return e.length}function q(e,s){const t=s.sentenceDelimiters?s.sentenceDelimiters.split(",").map(i=>i.trim()):[".","!","?","..."],n=new RegExp(`[${t.join("")}]`,"g");return e.split(n).filter(i=>i.trim()!=="").length}function L(e,s){const n=s.wordDelimiters||'\\s.,;:!?"“”«»()…',l=new RegExp(`[${n}]`,"gu"),i=e.split(l).filter(h=>h.trim()!==""),u=w("regex","count","percentage","",i,!1,!0,!1);return s.wordCount?[i.length,u]:[i.length,""]}function j(e){return e.split(/\r?\n\s*\r?\n/).filter(s=>s.trim()!=="").length}function k(e,s){return s.characterCount?w("symbol","count","percentage","",e,!0,!0,!1):""}function F(e,s){if(!e)return"";const t=b(e,s),n=S(e),l=q(e,s),[i,u]=L(e,s),h=j(e),m=k(e,s),o=`Text Statistics
==================
Characters: ${n}
Words: ${i}
Lines: ${t}
Sentences: ${l}
Paragraphs: ${h}`,c=`Characters Frequency
==================
${m}`,r=`Words Frequency
==================
${u}`;let f=o;return s.wordCount&&(f+=`

${r}`),s.characterCount&&(f+=`

${c}`),f}const x={emptyLines:!1,sentenceDelimiters:"",wordDelimiters:"",characterCount:!1,wordCount:!1},$=[{title:"Text Statistics without any Flag",description:"This example shows basic text statistics without any additional flags.",sampleText:"Giraffes have long necks that can be up to 6 feet (1.8 meters) long, but they only have 7 neck vertebrae, the same as humans.",sampleResult:`Text Statistics
==================
Characters: 125
Words: 26
Lines: 1
Sentences: 1
Paragraphs: 1`,sampleOptions:x},{title:"Text Statistics with Characters Frequency",description:"This example shows basic text statistics with characters frequency.",sampleText:"The Great Barrier Reef is the world's largest coral reef system, located off the coast of Australia. It consists of over 2,900 individual reefs and 900 islands. The reef is home to thousands of species of marine life, including fish, sea turtles, sharks, and dolphins. It is also a popular tourist destination, attracting millions of visitors every year. However, the reef is facing many threats, including climate change, pollution, and overfishing. Conservation efforts are being made to protect this unique and valuable ecosystem for future generations.",sampleResult:`Text Statistics
==================
Characters: 556
Words: 87
Lines: 1
Sentences: 1
Paragraphs: 1

Characters Frequency
==================
0: 4 (0.72%)
2: 1 (0.18%)
9: 2 (0.36%)
␣: 85 (15.29%)
e: 51 (9.17%)
i: 40 (7.19%)
s: 40 (7.19%)
t: 39 (7.01%)
a: 37 (6.65%)
o: 34 (6.12%)
r: 33 (5.94%)
n: 29 (5.22%)
l: 21 (3.78%)
f: 20 (3.60%)
h: 15 (2.70%)
d: 15 (2.70%)
c: 14 (2.52%)
u: 14 (2.52%)
,: 11 (1.98%)
g: 10 (1.80%)
m: 8 (1.44%)
v: 8 (1.44%)
.: 6 (1.08%)
p: 6 (1.08%)
y: 5 (0.90%)
b: 3 (0.54%)
w: 2 (0.36%)
': 1 (0.18%)
k: 1 (0.18%)
q: 1 (0.18%)`,sampleOptions:{emptyLines:!1,sentenceDelimiters:"",wordDelimiters:"",characterCount:!0,wordCount:!1}},{title:"Text Statistics with Characters and Words Frequencies",description:"This example shows basic text statistics with characters and words frequencies.",sampleText:"The Great Barrier Reef is the world's largest coral reef system, located off the coast of Australia. It consists of over 2,900 individual reefs and 900 islands. The reef is home to thousands of species of marine life, including fish, sea turtles, sharks, and dolphins. It is also a popular tourist destination, attracting millions of visitors every year. However, the reef is facing many threats, including climate change, pollution, and overfishing. Conservation efforts are being made to protect this unique and valuable ecosystem for future generations.",sampleResult:`Text Statistics
==================
Characters: 556
Words: 87
Lines: 1
Sentences: 1
Paragraphs: 1

Words Frequency
==================
2: 1 (1.15%)
900: 2 (2.30%)
the: 5 (5.75%)
of: 5 (5.75%)
reef: 4 (4.60%)
is: 4 (4.60%)
and: 4 (4.60%)
it: 2 (2.30%)
to: 2 (2.30%)
including: 2 (2.30%)
great: 1 (1.15%)
barrier: 1 (1.15%)
world's: 1 (1.15%)
largest: 1 (1.15%)
coral: 1 (1.15%)
system: 1 (1.15%)
located: 1 (1.15%)
off: 1 (1.15%)
coast: 1 (1.15%)
australia: 1 (1.15%)
consists: 1 (1.15%)
over: 1 (1.15%)
individual: 1 (1.15%)
reefs: 1 (1.15%)
islands: 1 (1.15%)
home: 1 (1.15%)
thousands: 1 (1.15%)
species: 1 (1.15%)
marine: 1 (1.15%)
life: 1 (1.15%)
fish: 1 (1.15%)
sea: 1 (1.15%)
turtles: 1 (1.15%)
sharks: 1 (1.15%)
dolphins: 1 (1.15%)
also: 1 (1.15%)
a: 1 (1.15%)
popular: 1 (1.15%)
tourist: 1 (1.15%)
destination: 1 (1.15%)
attracting: 1 (1.15%)
millions: 1 (1.15%)
visitors: 1 (1.15%)
every: 1 (1.15%)
year: 1 (1.15%)
however: 1 (1.15%)
facing: 1 (1.15%)
many: 1 (1.15%)
threats: 1 (1.15%)
climate: 1 (1.15%)
change: 1 (1.15%)
pollution: 1 (1.15%)
overfishing: 1 (1.15%)
conservation: 1 (1.15%)
efforts: 1 (1.15%)
are: 1 (1.15%)
being: 1 (1.15%)
made: 1 (1.15%)
protect: 1 (1.15%)
this: 1 (1.15%)
unique: 1 (1.15%)
valuable: 1 (1.15%)
ecosystem: 1 (1.15%)
for: 1 (1.15%)
future: 1 (1.15%)
generations: 1 (1.15%)

Characters Frequency
==================
0: 4 (0.72%)
2: 1 (0.18%)
9: 2 (0.36%)
␣: 85 (15.29%)
e: 51 (9.17%)
i: 40 (7.19%)
s: 40 (7.19%)
t: 39 (7.01%)
a: 37 (6.65%)
o: 34 (6.12%)
r: 33 (5.94%)
n: 29 (5.22%)
l: 21 (3.78%)
f: 20 (3.60%)
h: 15 (2.70%)
d: 15 (2.70%)
c: 14 (2.52%)
u: 14 (2.52%)
,: 11 (1.98%)
g: 10 (1.80%)
m: 8 (1.44%)
v: 8 (1.44%)
.: 6 (1.08%)
p: 6 (1.08%)
y: 5 (0.90%)
b: 3 (0.54%)
w: 2 (0.36%)
': 1 (0.18%)
k: 1 (0.18%)
q: 1 (0.18%)`,sampleOptions:{emptyLines:!1,sentenceDelimiters:"",wordDelimiters:"",characterCount:!0,wordCount:!0}}];function N({title:e,longDescription:s}){const{t}=C("string"),[n,l]=p.useState(""),[i,u]=p.useState("");function h(o,c){u(F(c,o))}const m=({values:o,updateField:c})=>[{title:t("statistic.delimitersOptions"),component:a.jsxs(g,{children:[a.jsx(y,{value:o.sentenceDelimiters,onOwnChange:r=>c("sentenceDelimiters",r),placeholder:t("statistic.sentenceDelimitersPlaceholder"),description:t("statistic.sentenceDelimitersDescription")}),a.jsx(y,{value:o.wordDelimiters,onOwnChange:r=>c("wordDelimiters",r),placeholder:t("statistic.wordDelimitersPlaceholder"),description:t("statistic.wordDelimitersDescription")})]})},{title:t("statistic.statisticsOptions"),component:a.jsxs(g,{children:[a.jsx(d,{checked:o.wordCount,onChange:r=>c("wordCount",r),title:t("statistic.wordFrequencyAnalysis"),description:t("statistic.wordFrequencyAnalysisDescription")}),a.jsx(d,{checked:o.characterCount,onChange:r=>c("characterCount",r),title:t("statistic.characterFrequencyAnalysis"),description:t("statistic.characterFrequencyAnalysisDescription")}),a.jsx(d,{checked:o.emptyLines,onChange:r=>c("emptyLines",r),title:t("statistic.includeEmptyLines"),description:t("statistic.includeEmptyLinesDescription")})]})}];return a.jsx(D,{title:e,initialValues:x,getGroups:m,compute:h,input:n,setInput:l,inputComponent:a.jsx(v,{title:t("statistic.inputTitle"),value:n,onChange:l}),resultComponent:a.jsx(T,{title:t("statistic.resultTitle"),value:i}),toolInfo:{title:t("statistic.toolInfo.title",{title:e}),description:s},exampleCards:$})}export{N as default};
