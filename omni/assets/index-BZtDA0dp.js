import{a as d,r as s,j as a,B as u,a0 as h}from"./index-CZybyyg9.js";import{T as f}from"./ToolCodeInput-BhAE93l-.js";import{T as y}from"./ToolCodeResult-Bej2mKUQ.js";import{b as g}from"./service-dhi07ImW.js";import{R as T}from"./RadioWithTextField-BwSkDwWI.js";import{S as x}from"./SimpleRadio-BHRHnp7x.js";import{T as b}from"./ToolContent-Bd6fLJl_.js";import"./ContentPaste-Buz3qiOw.js";import"./InputFooter-pt5Fl6zr.js";import"./ResultFooter-7IET4Cnp.js";import"./index-Djc6_I7M.js";import"./TextFieldWithDesc-aF9TFoAR.js";import"./TextField-BAaRYrNT.js";import"./Radio-Bf4WGGQP.js";import"./SwitchBase-BWXYtFov.js";const j={indentationType:"space",spacesCount:2},w=[{title:"Beautify an Ugly JSON Array",description:"In this example, we prettify an ugly JSON array. The input data is a one-dimensional array of numbers [1,2,3] but they are all over the place. This array gets cleaned up and transformed into a more readable format where each element is on a new line with an appropriate indentation using four spaces.",sampleText:`[
 1,
2,3
]`,sampleResult:`[
    1,
    2,
    3
]`,sampleOptions:{indentationType:"space",spacesCount:4}},{title:"Prettify a Complex JSON Object",description:"In this example, we prettify a complex JSON data structure consisting of arrays and objects. The input data is a minified JSON object with multiple data structure depth levels. To make it neat and readable, we add two spaces for indentation to each depth level, making the JSON structure clear and easy to understand.",sampleText:'{"names":["jack","john","alex"],"hobbies":{"jack":["programming","rock climbing"],"john":["running","racing"],"alex":["dancing","fencing"]}}',sampleResult:`{
  "names": [
    "jack",
    "john",
    "alex"
  ],
  "hobbies": {
    "jack": [
      "programming",
      "rock climbing"
    ],
    "john": [
      "running",
      "racing"
    ],
    "alex": [
      "dancing",
      "fencing"
    ]
  }
}`,sampleOptions:{indentationType:"space",spacesCount:2}},{title:"Beautify a JSON with Excessive Whitespace",description:"In this example, we show how the JSON prettify tool can handle code with excessive whitespace. The input file has many leading and trailing spaces as well as spaces within the objects. The excessive whitespace makes the file bulky and hard to read and leads to a bad impression of the programmer who wrote it. The program removes all these unnecessary spaces and creates a proper data hierarchy that's easy to work with by adding indentation via tabs.",sampleText:`
{
     "name":  "The Name of the Wind",
 "author"  : "Patrick Rothfuss",
     "genre"  :  "Fantasy",
     "published"   : 2007,
   "rating"    :  {
 "average"   :   4.6,
 "goodreads"         :   4.58,
      "amazon"   :  4.4
 },
      "is_fiction" : true
    }


`,sampleResult:`{
	"name": "The Name of the Wind",
	"author": "Patrick Rothfuss",
	"genre": "Fantasy",
	"published": 2007,
	"rating": {
		"average": 4.6,
		"goodreads": 4.58,
		"amazon": 4.4
	},
	"is_fiction": true
}`,sampleOptions:{indentationType:"tab",spacesCount:0}}];function F({title:r}){const{t:e}=d("json"),[n,o]=s.useState(""),[p,l]=s.useState(""),c=(i,t)=>{t&&l(g(t,i))};return a.jsx(b,{title:r,input:n,inputComponent:a.jsx(f,{title:e("prettify.inputTitle"),value:n,onChange:o,language:"json"}),resultComponent:a.jsx(y,{title:e("prettify.resultTitle"),value:p,language:"json"}),initialValues:j,getGroups:({values:i,updateField:t})=>[{title:e("prettify.indentation"),component:a.jsxs(u,{children:[a.jsx(T,{checked:i.indentationType==="space",title:e("prettify.useSpaces"),fieldName:"indentationType",description:e("prettify.useSpacesDescription"),value:i.spacesCount.toString(),onRadioClick:()=>t("indentationType","space"),onTextChange:m=>h(m,"spacesCount",t)}),a.jsx(x,{onClick:()=>t("indentationType","tab"),checked:i.indentationType==="tab",description:e("prettify.useTabsDescription"),title:e("prettify.useTabs")})]})}],compute:c,setInput:o,exampleCards:w,toolInfo:{title:e("prettify.toolInfo.title"),description:e("prettify.toolInfo.description")}})}export{F as default};
