import{p as i}from"./json-BIklKqoc.js";const a=s=>{const{data:r,format:n}=i(s);return n==="jsonl"&&Array.isArray(r)?{result:r.map(t=>JSON.stringify(t)).join(`
`),format:n}:{result:JSON.stringify(r),format:n}};export{a as m};
