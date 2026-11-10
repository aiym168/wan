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
'@media(max-width:600px){.gz-back{display:none}.gz-bar{height:56px;gap:10px;padding:0 12px}.gz-logo{font-size:15px}.gz-bar form{flex:1 1 auto;min-width:0}.gz-bar input{height:44px!important;font-size:16px!important}.gz-foot a{display:inline-block;padding:12px 6px;margin:0}}'+
'@media(max-width:820px){html,body{max-width:100%;overflow-x:hidden}img,video,canvas,svg,iframe{max-width:100%}table{display:block;max-width:100%;overflow-x:auto}pre,code{white-space:pre-wrap;word-break:break-word}}'+
'@media(pointer:coarse){.gz-bar input{height:44px!important}}'+
'@media(pointer:coarse),(max-width:600px){button,[role=button],select,input[type=button],input[type=submit],input[type=file],.gz-hit{min-height:44px}input[type=text],input[type=search],input[type=number],textarea,select{font-size:16px}}';
document.head.appendChild(st);
var P=location.pathname,X='';
if(/^\/tools\//.test(P))X='@media(max-width:640px){.gz-embed{padding:8px!important}.c-card{padding:12px!important}.flex,.flex-row,.n-space{flex-wrap:wrap!important}.c-input-text,.c-select,.n-form-item{min-width:0;max-width:100%}'+
 '.c-input-text>.label,.c-select>.label,.c-input-text>label,.c-select>label{flex:0 0 100%!important;width:auto!important;text-align:left!important;margin:0 0 4px!important}'+
 '.c-input-text.label-left,.c-select.label-left,.label-left{display:flex!important;flex-wrap:wrap!important}.label-left>.feedback-wrapper,.label-left>.c-select-input,.label-left>div:not(.label){flex:1 1 100%!important;min-width:0;width:100%}'+
 '.n-form-item.n-form-item--left-labelled{display:block!important}.n-form-item--left-labelled .n-form-item-label{width:auto!important;justify-content:flex-start;text-align:left}'+
 '.c-input-text input,.c-input-text .input-wrapper,.c-select .c-select-input,.n-base-selection,.n-input:not(.n-input--textarea),.n-button,.c-button,.n-input-number,.n-input__input-el{min-height:44px!important}'+
 '.c-input-text input,.n-input__input-el,.n-input__textarea-el,textarea{font-size:16px!important}.n-switch{flex:0 0 auto}.flex>*,.flex-row>*,.flex-col>*{min-width:0}.c-input-text,.c-select{flex-shrink:1}.c-select-input{max-width:100%}.c-button{max-width:100%;white-space:normal;height:auto!important}}';
if(/^\/omni\//.test(P))X='@media(max-width:640px){.MuiBox-root,.MuiStack-root,.MuiGrid-root{min-width:0!important;max-width:100%}.MuiBox-root{flex-wrap:wrap}'+
 '.MuiTypography-root{overflow-wrap:anywhere}.MuiFormControlLabel-root{margin-right:0;max-width:100%}.MuiInputBase-root:not(.MuiInputBase-multiline),.MuiButton-root,.MuiIconButton-root,.MuiSelect-select{min-height:44px!important}'+
 '.MuiInputBase-input{font-size:16px!important}input.MuiInputBase-input{min-height:44px!important;box-sizing:border-box!important}.MuiFormControl-root,.MuiInputBase-root,.MuiAutocomplete-root{min-width:0!important;max-width:100%!important}.MuiBox-root>*,.MuiStack-root>*{min-width:0}}';
if(X){var s2=document.createElement('style');s2.textContent=X;document.head.appendChild(s2)}
if(EMB)return;
var W='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#0a0b0c" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/></svg>';
function add(){
 if(document.querySelector('.gz-bar'))return;
 var b=document.createElement('div');b.className='gz-bar';
 b.innerHTML='<a class="gz-logo" href="'+S+'/gongju/"><i>'+W+'</i>工具站大全</a><a class="gz-back" href="'+S+'/gongju/">← 返回全部工具</a><form action="'+S+'/gongju/" method="get" role="search"><input name="q" type="search" placeholder="搜索 500+ 免费工具…" aria-label="搜索工具"></form>';
 document.body.insertBefore(b,document.body.firstChild);
 var f=document.createElement('div');f.className='gz-foot';
 f.innerHTML='<a href="'+S+'/gongju/">工具站大全</a><a href="'+S+'/sitemap.html">网站地图</a><a href="'+S+'/agent/">AI 助手接入</a><a href="https://hot.is-my.app/">今日热榜</a><br>全部工具免费使用 · 不用注册';
 document.body.appendChild(f);
}
if(document.body)add();else document.addEventListener('DOMContentLoaded',add);
})();