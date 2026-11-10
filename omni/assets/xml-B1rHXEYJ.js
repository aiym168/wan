const n=a=>{const t=(a!==""&&!isNaN(Number(a))?`row-${a}`:a).replace(/[^a-zA-Z0-9_.-]/g,"_");return/^[a-zA-Z_]/.test(t)?t:`_${t}`};export{n};
