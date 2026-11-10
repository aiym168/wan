(function(){var C=window.AD_CONFIG||{},p=C.provider;if(!p)return;
function s(src,attrs){var e=document.createElement('script');e.async=true;e.src=src;for(var k in attrs||{})e.setAttribute(k,attrs[k]);document.head.appendChild(e)}
document.querySelectorAll('.ad[data-ad]').forEach(function(el){var k=el.getAttribute('data-ad');
 if(p==='baidu'&&C.baidu&&C.baidu[k]){var id=C.baidu[k];el.classList.add('on');var d=document.createElement('div');d.className='_'+Math.random().toString(36).slice(2);el.appendChild(d);
  (window.slotbydup=window.slotbydup||[]).push({id:id,container:d.className,async:true});if(!window.__bdu){window.__bdu=1;s('https://dup.baidustatic.com/js/dm.js')}}
 if(p==='adsense'&&C.adsense&&C.adsense.client&&C.adsense[k]){el.classList.add('on');var i=document.createElement('ins');i.className='adsbygoogle';i.style.display='block';i.setAttribute('data-ad-client',C.adsense.client);i.setAttribute('data-ad-slot',C.adsense[k]);i.setAttribute('data-ad-format','auto');i.setAttribute('data-full-width-responsive','true');el.appendChild(i);
  if(!window.__ads){window.__ads=1;s('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+C.adsense.client,{crossorigin:'anonymous'})}(window.adsbygoogle=window.adsbygoogle||[]).push({})}})})();
