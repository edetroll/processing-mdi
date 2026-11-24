/* LaTeX mathematical formulas for the dynamically loaded Markdown chapters.
   Usage: place <script defer src="assets/js/math-support.js"></script>
   after <script src="assets/js/app.js"></script> in the existing index.html.
   Processing code blocks remain untouched. Requires online MathJax CDN.
*/
(() => {
  'use strict';

  const ownScript = document.currentScript;
  const baseUrl = ownScript && ownScript.src
    ? new URL('../css/math-support.css', ownScript.src).href
    : 'assets/css/math-support.css';
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = baseUrl;
  document.head.appendChild(css);

  // Script is deferred after app.js, but the view is fetched asynchronously.
  const root = document.getElementById('content');
  if (!root) return;

  window.MathJax = {
    tex: {
      inlineMath: [['\\(', '\\)']],
      displayMath: [['\\[', '\\]']]
    },
    options: {
      skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
    },
    startup: { typeset: false }
  };

  let queue = Promise.resolve();
  const update = () => {
    queue = queue.then(async () => {
      const mj = window.MathJax;
      if (!mj || typeof mj.typesetPromise !== 'function') return;
      await mj.startup.promise;
      if (typeof mj.typesetClear === 'function') mj.typesetClear();
      await mj.typesetPromise([root]);
    }).catch(error => console.warn('A képletek megjelenítése nem sikerült:', error));
  };

  // The app replaces #content children when the chapter changes.  Observing
  // only direct children avoids retriggering when MathJax edits formulas.
  new MutationObserver(update).observe(root, { childList: true });

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-chtml.js';
  script.async = true;
  script.onload = update;
  script.onerror = () => console.warn('MathJax nem érhető el: az oldal internetkapcsolatot igényel a képletek szedéséhez.');
  document.head.appendChild(script);
})();
