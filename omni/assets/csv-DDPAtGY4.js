function u(l,f=",",i='"'){const n=[];let e="",r=!1;for(let t=0;t<l.length;t++){const s=l[t],o=l[t+1];s===i?r&&o===i?(e+=i,t++):r=!r:s===f&&!r?(n.push(e.trim()),e=""):e+=s}return n.push(e.trim()),n}function c(l,f,i,n,e=",",r='"'){let t=l.split(`
`).map(s=>u(s,e,r));return f&&i&&(t=t.filter(s=>!s[0].trim().startsWith(i))),n&&(t=t.filter(s=>s.some(o=>o.trim()!==""))),t}function p(l,f=",",i='"',n){const e=l.split(`
`);for(const r of e){const t=r.trim();if(t===""||n&&t.startsWith(n))continue;return u(t,f,i).map(o=>o.replace(/^\uFEFF/,"").trim())}return[]}export{p as g,c as s};
