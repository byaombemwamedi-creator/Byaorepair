/* On-screen error box for phones without dev tools. Enable: add ?debug=1 to the address once (it is remembered), disable with ?debug=0 */
(function(){try{var q=location.search.match(/debug=(\d)/);if(q)localStorage.setItem('byao_debug',q[1]);if(localStorage.getItem('byao_debug')!=='1')return;
var box;function show(m){if(!box){box=document.createElement('pre');box.style.cssText='position:fixed;left:0;right:0;bottom:0;max-height:35vh;overflow:auto;margin:0;padding:8px;background:#7f1d1dee;color:#fff;font:11px monospace;z-index:2147483647;white-space:pre-wrap';box.onclick=function(){box.remove();box=null};(document.body||document.documentElement).appendChild(box)}box.textContent+=m+'\n'}
window.addEventListener('error',function(e){show('ERROR: '+e.message+' @'+(e.filename||'').split('/').pop()+':'+e.lineno)});
window.addEventListener('unhandledrejection',function(e){show('PROMISE: '+(e.reason&&e.reason.message||e.reason))});
window.addEventListener('DOMContentLoaded',function(){show('debug on: '+location.pathname)})}catch(x){}})();
