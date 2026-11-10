const i=(t,e)=>{const{indentationType:r,spacesCount:s}=e;let n;try{n=JSON.parse(t)}catch{throw new Error("Invalid JSON string")}return JSON.stringify(n,null,r==="tab"?"	":s)};export{i as b};
