/* Processing tananyag – LaTeX kepletek (MathJax, helyi valtozat)
   Az index.html-ben az app.js utan egyetlen sort kell betenni:
   <script defer src="assets/js/math-support.js"></script>
   A szoveget az app.js tolti be dinamikusan; itt a tartalomcsere
   utan automatikusan megtortenik az uj kepletek tor delese.
*/
(() => {
  'use strict';
  if (window.__processingMathSupport) return;
  window.__processingMathSupport = true;

  const current = document.currentScript;
  const base = current && current.src
    ? new URL('.', current.src)
    : new URL('assets/js/', document.baseURI);
  const asset = relative => new URL(relative, base).href;

  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = asset('../css/math-support.css');
  document.head.appendChild(css);

  window.MathJax = {
    tex: {
      inlineMath: [['\\(', '\\)']],
      displayMath: [['\\[', '\\]']],
      processEscapes: true
    },
    svg: {fontCache: 'global'},
    options: {
      skipHtmlTags: ['script','noscript','style','textarea','pre','code']
    },
    startup: {typeset: false}
  };

  const container = document.getElementById('content');
  if (!container) {
    console.warn('MathJax: #content elem hianyzik.');
    return;
  }

  let scheduled = false;
  let promise = Promise.resolve();
  const typeset = () => {
    if (scheduled) return;
    scheduled = true;
    // Microtask: megvarjuk a DOM frissites vege t.
    Promise.resolve().then(() => {
      scheduled = false;
      promise = promise.then(async () => {
        const mj = window.MathJax;
        if (!mj || !mj.typesetPromise) return;
        await mj.startup.promise;
        if (mj.typesetClear) mj.typesetClear([container]);
        await mj.typesetPromise([container]);
      }).catch(error => console.error('MathJax: a kepletek nem jelenithetok meg:',error));
    });
  };

  // A tananyag az egesz tartalmi blokkot csereli, amikor fejezetet valtunk.
  // Csak a kozvetlen childList-et figyeljuk, igy a kepletek megjelenitesenek
  // belso DOM-valtozasai nem okoznak ismetelt teljes ujrarajzolast.
  const observer = new MutationObserver(typeset);
  observer.observe(container, {childList:true});

  const script = document.createElement('script');
  script.src = asset('../vendor/mathjax/tex-svg.js');
  script.async = true;
  script.addEventListener('load', typeset);
  script.addEventListener('error', () =>
    console.error('MathJax: a helyi fajl nem toltheto be: ',script.src));
  document.head.appendChild(script);
})();
