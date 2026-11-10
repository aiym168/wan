window.$=function(s,r){return (r||document).querySelector(s)};
window.MOB=/Android|iPhone|iPad|iPod|Mobile|HarmonyOS/i.test(navigator.userAgent)||matchMedia('(pointer:coarse)').matches;
window.INAPP=/MicroMessenger|QQ\/|Weibo|DingTalk|Lark|aweme|NewsArticle/i.test(navigator.userAgent);
document.addEventListener('DOMContentLoaded',function(){
 if(INAPP){var w=document.createElement('div');w.className='wxtip';w.textContent='当前在 App 内置浏览器中，可能无法下载或保存文件：请点右上角「···」→「在浏览器打开」';document.body.insertBefore(w,document.body.firstChild)}
 if(MOB)$$('.drop b').forEach(function(b){b.textContent=b.textContent.replace(/点击选择、拖入或粘贴|点击选择或拖入/,'点击从相册、相机或文件选择')});
});window.$$=function(s,r){return Array.from((r||document).querySelectorAll(s))};
window.T={
 drop:function(el,input,cb){el.addEventListener('click',function(){input.click()});
  ['dragenter','dragover'].forEach(function(e){el.addEventListener(e,function(v){v.preventDefault();el.classList.add('on')})});
  ['dragleave','drop'].forEach(function(e){el.addEventListener(e,function(v){v.preventDefault();el.classList.remove('on')})});
  el.addEventListener('drop',function(v){cb(Array.from(v.dataTransfer.files))});input.addEventListener('change',function(){cb(Array.from(input.files));input.value=''})},
 dl:function(blob,name){var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},2000)},
 copy:function(t,btn){(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).catch(function(){var x=document.createElement('textarea');x.value=t;document.body.appendChild(x);x.select();document.execCommand('copy');x.remove()}).then(function(){if(btn){var o=btn.textContent;btn.textContent='已复制';setTimeout(function(){btn.textContent=o},1200)}})},
 size:function(n){return n<1024?n+' B':n<1048576?(n/1024).toFixed(1)+' KB':(n/1048576).toFixed(2)+' MB'},
 img:function(file){return new Promise(function(ok,no){var i=new Image();i.onload=function(){ok(i)};i.onerror=no;i.src=URL.createObjectURL(file)})},
 base:function(n){return n.replace(/\.[^.]+$/,'')},
 fmt:function(n,d){return Number(n).toLocaleString('zh-CN',{minimumFractionDigits:d==null?2:d,maximumFractionDigits:d==null?2:d})}
};
(function(){var h=document.querySelector('.gzh');if(!h||h.__ok)return;h.__ok=1;
function closeAll(x){h.querySelectorAll('.gzh-dd.open').forEach(function(d){if(d!==x){d.classList.remove('open');d.querySelector('button').setAttribute('aria-expanded','false')}})}
h.querySelectorAll('.gzh-dd>button').forEach(function(b){var d=b.parentNode,t;
 b.addEventListener('click',function(e){e.stopPropagation();var o=!d.classList.contains('open')||Date.now()-(d._h||0)<500;closeAll(d);d.classList.toggle('open',o);b.setAttribute('aria-expanded',o)});
 if(matchMedia('(hover:hover)').matches){d.addEventListener('mouseenter',function(){clearTimeout(t);if(!d.classList.contains('open'))d._h=Date.now();closeAll(d);d.classList.add('open');b.setAttribute('aria-expanded','true')});d.addEventListener('mouseleave',function(){t=setTimeout(function(){d.classList.remove('open');b.setAttribute('aria-expanded','false')},180)})}});
document.addEventListener('click',function(e){if(!h.contains(e.target))closeAll()});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeAll();dr(false)}});
var sb=h.querySelector('.gzh-sbar'),dw=h.querySelector('.gzh-drawer');if(dw)document.body.appendChild(dw);
h.querySelector('.gzh-s').addEventListener('click',function(){if(innerWidth<=900){dr(true);var i=dw.querySelector('input');setTimeout(function(){i&&i.focus()},50);return}sb.classList.toggle('open');if(sb.classList.contains('open'))sb.querySelector('input').focus()});
function dr(o){if(!dw)return;dw.classList.toggle('open',o);document.documentElement.classList.toggle('gzh-lock',o);h.querySelector('.gzh-burger').setAttribute('aria-expanded',o)}
h.querySelector('.gzh-burger').addEventListener('click',function(){dr(true)});
dw.querySelectorAll('[data-close]').forEach(function(x){x.addEventListener('click',function(){dr(false)})});
})();
