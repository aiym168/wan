(function(){
if(window.__gz)return;window.__gz=1;
var EMB=false;try{EMB=window.self!==window.top}catch(e){EMB=true}
if(/[?&]embed=1/.test(location.search))EMB=true;
var S='https://wan.is-my.app';
function css(h){var l=document.createElement('link');l.rel='stylesheet';l.href=h;document.head.appendChild(l)}
css(S+'/design/tokens-v4.css');
var st=document.createElement('style');st.textContent=
'.gz-bar{position:relative;z-index:2147483000;display:flex;align-items:center;gap:14px;height:52px;padding:0 16px;background:#0f1113;border-bottom:1px solid #1d2024;font:14px/1 -apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK SC",system-ui,sans-serif;color:#f2f3ee;box-sizing:border-box}'+
'.gz-bar *{box-sizing:border-box}.gz-bar a{color:#b4b9b2;text-decoration:none}.gz-bar a:hover{color:#f2f3ee}'+
'.gz-logo{display:inline-flex;align-items:center;gap:8px;font-weight:900;font-size:17px;color:#f2f3ee!important;white-space:nowrap}.gz-logo i{width:28px;height:28px;border-radius:8px;background:#c8ff2e;display:inline-flex;align-items:center;justify-content:center}'+
'.gz-bar form{margin-left:auto;flex:0 1 280px}.gz-bar input{width:100%;height:34px;border-radius:999px;border:1px solid #2a2e33;background:#0a0b0c;color:#f2f3ee;padding:0 14px;font:inherit;outline:none}.gz-bar input:focus{border-color:#c8ff2e}'+
'.gz-back{white-space:nowrap}.gz-foot{padding:18px 16px 28px;border-top:1px solid #1d2024;background:#0a0b0c;color:#7d837c;font:13px/1.8 -apple-system,"PingFang SC","Microsoft YaHei",sans-serif;text-align:center}.gz-foot a{color:#b4b9b2;margin:0 8px;text-decoration:none}.gz-foot a:hover{color:#c8ff2e}'+
'@media(max-width:600px){.gz-back{display:none}.gz-bar form{flex:1 1 auto}}';
document.head.appendChild(st);
if(EMB)return;
var W='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#0a0b0c" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/></svg>';
function add(){
 if(document.querySelector('.gz-bar'))return;
 var b=document.createElement('div');b.className='gz-bar';
 b.innerHTML='<a class="gz-logo" href="'+S+'/gongju/"><i>'+W+'</i>工具站大全</a><a class="gz-back" href="'+S+'/gongju/">← 返回全部工具</a><form action="'+S+'/gongju/" method="get" role="search"><input name="q" type="search" placeholder="搜索 300+ 免费工具…" aria-label="搜索工具"></form>';
 document.body.insertBefore(b,document.body.firstChild);
 var f=document.createElement('div');f.className='gz-foot';
 f.innerHTML='<a href="'+S+'/gongju/">工具站大全</a><a href="'+S+'/sitemap.html">网站地图</a><a href="'+S+'/agent/">AI 助手接入</a><a href="https://hot.is-my.app/">今日热榜</a><br>全部工具免费使用 · 不用注册';
 document.body.appendChild(f);
}
if(document.body)add();else document.addEventListener('DOMContentLoaded',add);
})();