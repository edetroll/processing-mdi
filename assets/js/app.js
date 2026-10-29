const state = {
  manifest: null,
  chapters: [],
  currentId: null,
  currentSection: null,
  outlines: new Map(),
  theme: localStorage.getItem('processing-theme') || null,
  sidebarCollapsed: localStorage.getItem('processing-sidebar-collapsed') === 'true'
};

const contentEl = document.getElementById('content');
const navEl = document.getElementById('chapterNav');
const pagerEl = document.getElementById('chapterPager');
const menuButton = document.getElementById('menuButton');
const sidebarClose = document.getElementById('sidebarClose');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');
const themeToggle = document.getElementById('themeToggle');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function slugify(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'szakasz';
}

function uniqueSlug(base, used) {
  let slug = base;
  let n = 2;
  while (used.has(slug)) {
    slug = `${base}-${n++}`;
  }
  used.add(slug);
  return slug;
}


function preferredTheme() {
  if (state.theme) return state.theme;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('processing-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀' : '◐';
  themeToggle.title = theme === 'dark' ? 'Világos mód' : 'Sötét mód';
}

function applySidebarState() {
  document.body.classList.toggle('sidebar-collapsed', state.sidebarCollapsed);
}

function isMobileLayout() {
  return window.matchMedia('(max-width: 980px)').matches;
}

function setupUiControls() {
  menuButton.addEventListener('click', () => {
    if (isMobileLayout()) {
      document.body.classList.toggle('sidebar-open');
    } else {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      localStorage.setItem('processing-sidebar-collapsed', String(state.sidebarCollapsed));
      applySidebarState();
    }
  });

  sidebarClose.addEventListener('click', () => {
    if (isMobileLayout()) {
      document.body.classList.remove('sidebar-open');
    } else {
      state.sidebarCollapsed = true;
      localStorage.setItem('processing-sidebar-collapsed', 'true');
      applySidebarState();
    }
  });

  sidebarBackdrop.addEventListener('click', () => document.body.classList.remove('sidebar-open'));

  themeToggle.addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeLightbox();
      document.body.classList.remove('sidebar-open');
    }
  });
}

function openLightbox(img) {
  lightboxImage.src = img.src;
  lightboxImage.alt = img.alt || '';
  lightboxCaption.textContent = img.dataset.caption || img.alt || '';
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImage.src = '';
}

async function loadManifest() {
  const response = await fetch('content/manifest.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('A manifest.json nem tölthető be.');
  state.manifest = await response.json();
  state.chapters = [...state.manifest.chapters].sort((a, b) => a.order - b.order);
}

function extractOutline(source) {
  const used = new Set();
  const outline = [];

  for (const line of source.split(/\r?\n/)) {
    const match = line.trim().match(/^(#{2,3})\s+(.+)$/);
    if (!match) continue;

    const level = match[1].length;
    let title = match[2].trim();
    let explicitId = null;

    const idMatch = title.match(/\s*\{#([^}]+)\}\s*$/);
    if (idMatch) {
      explicitId = idMatch[1];
      title = title.replace(/\s*\{#[^}]+\}\s*$/, '').trim();
    }

    const id = uniqueSlug(explicitId || slugify(title), used);
    outline.push({ level, title, id });
  }

  return outline;
}

async function loadOutlines() {
  await Promise.all(state.chapters.map(async chapter => {
    try {
      const response = await fetch(chapter.file, { cache: 'no-store' });
      if (!response.ok) return;
      const source = await response.text();
      state.outlines.set(chapter.id, extractOutline(source));
    } catch {
      state.outlines.set(chapter.id, []);
    }
  }));
}

function buildSidebar() {
  const groups = new Map();

  for (const chapter of state.chapters) {
    const group = chapter.group || 'Témakörök';
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(chapter);
  }

  navEl.innerHTML = '';

  for (const [groupName, chapters] of groups.entries()) {
    const group = document.createElement('section');
    group.className = 'nav-group';

    const title = document.createElement('div');
    title.className = 'nav-group-title';
    title.textContent = groupName;
    group.appendChild(title);

    for (const chapter of chapters) {
      const wrap = document.createElement('div');
      wrap.className = 'nav-chapter-wrap';
      wrap.dataset.chapterId = chapter.id;

      const link = document.createElement('a');
      link.href = `#/${chapter.id}`;
      link.className = 'nav-link';
      link.dataset.chapterId = chapter.id;
      link.innerHTML = `
        <span class="nav-number">${escapeHtml(chapter.navNumber || String(chapter.order).padStart(2, '0'))}</span>
        <span>${escapeHtml(chapter.title)}</span>`;
      wrap.appendChild(link);

      const outline = state.outlines.get(chapter.id) || [];
      if (outline.length) {
        const subnav = document.createElement('div');
        subnav.className = 'nav-subsections';

        for (const section of outline) {
          const sublink = document.createElement('a');
          sublink.href = `#/${chapter.id}/${section.id}`;
          sublink.className = `nav-sub-link level-${section.level}`;
          sublink.dataset.chapterId = chapter.id;
          sublink.dataset.sectionId = section.id;
          sublink.textContent = section.title;
          subnav.appendChild(sublink);
        }

        wrap.appendChild(subnav);
      }

      group.appendChild(wrap);
    }

    navEl.appendChild(group);
  }
}

function parseRoute() {
  const raw = location.hash.replace(/^#\/?/, '').trim();
  const [chapterId, sectionId] = raw.split('/');
  const chapter = state.chapters.find(c => c.id === chapterId) || state.chapters[0];
  return {
    chapter,
    sectionId: chapter && chapter.id === chapterId ? (sectionId || null) : null
  };
}

function updateActiveNav(chapterId, sectionId = null) {
  document.querySelectorAll('.nav-chapter-wrap').forEach(wrap => {
    wrap.classList.toggle('active', wrap.dataset.chapterId === chapterId);
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.chapterId === chapterId);
  });

  document.querySelectorAll('.nav-sub-link').forEach(link => {
    link.classList.toggle(
      'active',
      link.dataset.chapterId === chapterId && link.dataset.sectionId === sectionId
    );
  });
}

function resolveAssetPath(markdownFile, assetPath) {
  if (/^(https?:|data:|\/)/i.test(assetPath)) return assetPath;

  const baseParts = markdownFile.split('/');
  baseParts.pop();
  const combined = [...baseParts, ...assetPath.split('/')];
  const normalized = [];

  for (const part of combined) {
    if (!part || part === '.') continue;
    if (part === '..') normalized.pop();
    else normalized.push(part);
  }

  return normalized.join('/');
}

function inlineMarkdown(text) {
  let out = escapeHtml(text);
  const codeTokens = [];

  out = out.replace(/`([^`]+)`/g, (_, code) => {
    codeTokens.push(`<code>${code}</code>`);
    return `@@CODE${codeTokens.length - 1}@@`;
  });

  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  out = out.replace(/@@CODE(\d+)@@/g, (_, i) => codeTokens[Number(i)]);

  return out;
}

function highlightProcessing(rawCode) {
  let s = escapeHtml(rawCode);
  const protectedTokens = [];

  function tokenKey(index) {
    let n = index + 1;
    let out = '';
    while (n > 0) {
      n--;
      out = String.fromCharCode(65 + (n % 26)) + out;
      n = Math.floor(n / 26);
    }
    return out;
  }

  function tokenIndex(key) {
    let n = 0;
    for (const ch of key) {
      n = n * 26 + (ch.charCodeAt(0) - 64);
    }
    return n - 1;
  }

  function protect(regex, className) {
    s = s.replace(regex, match => {
      protectedTokens.push(`<span class="${className}">${match}</span>`);
      return `@@TOK_${tokenKey(protectedTokens.length - 1)}@@`;
    });
  }

  protect(/\/\*[\s\S]*?\*\//g, 'tok-comment');
  protect(/\/\/[^\n]*/g, 'tok-comment');
  protect(/"(?:\\.|[^"\\])*"/g, 'tok-string');
  protect(/'(?:\\.|[^'\\])'/g, 'tok-string');

  s = s.replace(
    /\b(void|if|else|for|while|do|switch|case|break|continue|return|class|new|extends|this|super|public|private|protected|static|final|import)\b/g,
    '<span class="tok-keyword">$1</span>'
  );

  s = s.replace(
    /\b(int|float|boolean|char|byte|color|String|PVector|PImage|PFont)\b/g,
    '<span class="tok-type">$1</span>'
  );

  s = s.replace(
    /\b(true|false|null|PI|TWO_PI|HALF_PI|QUARTER_PI|CENTER|CORNER|CORNERS|RADIUS|RGB|HSB|CLOSE)\b/g,
    '<span class="tok-literal">$1</span>'
  );

  s = s.replace(
    /\b(width|height|mouseX|mouseY|pmouseX|pmouseY|mousePressed|keyPressed|key|keyCode|frameCount)\b/g,
    '<span class="tok-builtin">$1</span>'
  );

  s = s.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="tok-number">$1</span>');

  s = s.replace(
    /\b(size|fullScreen|background|stroke|strokeWeight|noStroke|fill|noFill|point|line|rect|square|ellipse|circle|triangle|quad|arc|beginShape|vertex|endShape|bezier|curve|text|textSize|image|loadImage|colorMode|frameRate|random|noise|map|dist|sin|cos|tan|radians|degrees|translate|rotate|scale|pushMatrix|popMatrix|save|saveFrame|setup|draw)\b(?=\s*\()/g,
    '<span class="tok-builtin">$1</span>'
  );

  s = s.replace(/@@TOK_([A-Z]+)@@/g, (_, key) => protectedTokens[tokenIndex(key)]);
  return s;
}

function renderCodeBlock(language, code) {
  const requested = (language || 'processing').toLowerCase();
  const isProcessing = ['processing', 'pde', 'java'].includes(requested);
  const label = isProcessing ? 'Processing' : requested;
  const highlighted = isProcessing ? highlightProcessing(code) : escapeHtml(code);

  return `
    <div class="code-block">
      <div class="code-toolbar">
        <div class="code-label">${escapeHtml(label)}</div>
        <button class="copy-code" type="button">Másolás</button>
      </div>
      <pre><code data-raw="${escapeHtml(code)}">${highlighted}</code></pre>
    </div>`;
}

function renderProcessingExample(block, markdownFile) {
  const open = block.match(/^:::processing-example(?:\s+title="([^"]*)")?(?:\s+image="([^"]*)")?\s*\n/);
  if (!open) return null;

  const title = open[1] || 'Processing-példa';
  const image = open[2] || '';
  const body = block.slice(open[0].length).replace(/\n:::\s*$/, '');
  const codeMatch = body.match(/```([^\n]*)\n([\s\S]*?)```/);

  const codeHtml = codeMatch
    ? renderCodeBlock(codeMatch[1].trim() || 'processing', codeMatch[2].replace(/\n$/, ''))
    : '';

  const noteSource = codeMatch ? body.replace(codeMatch[0], '').trim() : body.trim();
  const note = noteSource
    ? `<div class="processing-example-note">${inlineMarkdown(noteSource)}</div>`
    : '';

  let output = '<div class="empty-state">Ide kerül a program eredményét bemutató kép.</div>';

  if (image) {
    const src = resolveAssetPath(markdownFile, image);
    output = `<img loading="lazy" src="${escapeHtml(src)}" alt="${escapeHtml(title)}" data-caption="${escapeHtml(title)}">`;
  }

  return `
    <section class="processing-example">
      <div class="processing-example-header">${escapeHtml(title)}</div>
      <div class="processing-example-grid">
        <div class="processing-example-code">${codeHtml}</div>
        <div class="processing-example-output">${output}</div>
      </div>
      ${note}
    </section>`;
}


function renderDescriptionBlock(title, body) {
  const lines = body.split(/\r?\n/);
  const html = [];
  let paragraph = [];
  let listType = null;
  let listItems = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length || !listType) return;
    html.push(`<${listType}>${listItems.map(item => `<li>${inlineMarkdown(item)}</li>`).join('')}</${listType}>`);
    listItems = [];
    listType = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const ordered = trimmed.match(/^\d+\.\s+(.+)$/);
    const unordered = trimmed.match(/^[-*]\s+(.+)$/);

    if (ordered || unordered) {
      flushParagraph();
      const wanted = ordered ? 'ol' : 'ul';
      if (listType && listType !== wanted) flushList();
      listType = wanted;
      listItems.push((ordered || unordered)[1]);
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();

  return `
    <aside class="description-block">
      ${title ? `<div class="description-title">${escapeHtml(title)}</div>` : ''}
      ${html.join('\n')}
    </aside>`;
}

function renderMarkdown(source, markdownFile) {
  if (!source.trim()) {
    return '<div class="empty-state">A fejezet tartalma még nincs elkészítve.</div>';
  }

  const descriptionBlocks = [];
  source = source.replace(/:::leiras(?:\s+title="([^"]*)")?\s*\n([\s\S]*?)\n:::/g, (_, title, body) => {
    descriptionBlocks.push(renderDescriptionBlock(title || '', body.trim()));
    return `\n@@DESCRIPTION${descriptionBlocks.length - 1}@@\n`;
  });

  const specialBlocks = [];
  source = source.replace(/:::processing-example[^\n]*\n[\s\S]*?\n:::/g, block => {
    const html = renderProcessingExample(block, markdownFile);
    if (!html) return block;
    specialBlocks.push(html);
    return `\n@@SPECIAL${specialBlocks.length - 1}@@\n`;
  });

  const fencedBlocks = [];
  source = source.replace(/```([^\n]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    fencedBlocks.push(renderCodeBlock(lang.trim(), code.replace(/\n$/, '')));
    return `\n@@FENCE${fencedBlocks.length - 1}@@\n`;
  });

  const imageBlocks = [];
  source = source.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, path) => {
    const src = resolveAssetPath(markdownFile, path);
    imageBlocks.push(`
      <figure class="figure">
        <img loading="lazy" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" data-caption="${escapeHtml(alt)}">
        ${alt ? `<figcaption>${escapeHtml(alt)}</figcaption>` : ''}
      </figure>`);
    return `\n@@IMAGE${imageBlocks.length - 1}@@\n`;
  });

  const lines = source.split(/\r?\n/);
  const html = [];
  const usedHeadingIds = new Set();
  let paragraph = [];
  let listType = null;
  let listItems = [];
  let quote = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length || !listType) return;
    html.push(`<${listType}>${listItems.map(x => `<li>${inlineMarkdown(x)}</li>`).join('')}</${listType}>`);
    listItems = [];
    listType = null;
  };

  const flushQuote = () => {
    if (!quote.length) return;
    html.push(`<blockquote>${inlineMarkdown(quote.join(' '))}</blockquote>`);
    quote = [];
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
    flushQuote();
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushAll();
      continue;
    }

    const description = trimmed.match(/^@@DESCRIPTION(\d+)@@$/);
    const special = trimmed.match(/^@@SPECIAL(\d+)@@$/);
    const fence = trimmed.match(/^@@FENCE(\d+)@@$/);
    const image = trimmed.match(/^@@IMAGE(\d+)@@$/);

    if (description || special || fence || image) {
      flushAll();
      if (description) html.push(descriptionBlocks[Number(description[1])]);
      if (special) html.push(specialBlocks[Number(special[1])]);
      if (fence) html.push(fencedBlocks[Number(fence[1])]);
      if (image) html.push(imageBlocks[Number(image[1])]);
      continue;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);

    if (heading) {
      flushAll();

      const level = heading[1].length;
      let text = heading[2].trim();
      let explicitId = null;

      const idMatch = text.match(/\s*\{#([^}]+)\}\s*$/);
      if (idMatch) {
        explicitId = idMatch[1];
        text = text.replace(/\s*\{#[^}]+\}\s*$/, '').trim();
      }

      if (level === 1) continue;

      const id = uniqueSlug(explicitId || slugify(text), usedHeadingIds);
      html.push(`<h${level} id="${escapeHtml(id)}">${inlineMarkdown(text)}</h${level}>`);
      continue;
    }

    const unordered = trimmed.match(/^[-*]\s+(.+)$/);
    const ordered = trimmed.match(/^\d+\.\s+(.+)$/);

    if (unordered || ordered) {
      flushParagraph();
      flushQuote();

      const wanted = unordered ? 'ul' : 'ol';
      if (listType && listType !== wanted) flushList();

      listType = wanted;
      listItems.push((unordered || ordered)[1]);
      continue;
    }

    if (trimmed.startsWith('>')) {
      flushParagraph();
      flushList();
      quote.push(trimmed.replace(/^>\s?/, ''));
      continue;
    }

    paragraph.push(trimmed);
  }

  flushAll();
  return html.join('\n');
}

function setupRenderedContent() {
  document.querySelectorAll('.copy-code').forEach(button => {
    button.addEventListener('click', async () => {
      const code = button.closest('.code-block').querySelector('code');
      const raw = code.dataset.raw || code.textContent;

      try {
        await navigator.clipboard.writeText(raw);
        button.textContent = 'Másolva';
        setTimeout(() => button.textContent = 'Másolás', 1200);
      } catch {
        button.textContent = 'Jelöld ki';
      }
    });
  });

  document.querySelectorAll('.figure img, .processing-example-output img').forEach(img => {
    img.addEventListener('click', () => openLightbox(img));
  });
}

function buildPager(chapter) {
  if (chapter.hidePager) {
    pagerEl.innerHTML = '';
    return;
  }

  const index = state.chapters.findIndex(c => c.id === chapter.id);
  const prev = index > 0 ? state.chapters[index - 1] : null;
  const next = index < state.chapters.length - 1 ? state.chapters[index + 1] : null;

  const showPrev = prev && !chapter.hidePrevious;
  const showNext = next && !chapter.hideNext;

  pagerEl.innerHTML = `
    ${showPrev ? `
      <a class="pager-link" href="#/${prev.id}">
        <span class="pager-label">← Előző</span>
        <span class="pager-title">${escapeHtml(prev.title)}</span>
      </a>` : '<span></span>'}
    ${showNext ? `
      <a class="pager-link next" href="#/${next.id}">
        <span class="pager-label">Következő →</span>
        <span class="pager-title">${escapeHtml(next.title)}</span>
      </a>` : '<span></span>'}
  `;
}

function scrollToSection(sectionId) {
  if (!sectionId) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    return;
  }

  requestAnimationFrame(() => {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  });
}

async function showChapter(chapter, sectionId = null) {
  state.currentId = chapter.id;
  state.currentSection = sectionId;
  updateActiveNav(chapter.id, sectionId);
  document.body.classList.remove('sidebar-open');
  document.title = `${chapter.title} – Processing`;

  contentEl.innerHTML = `
    <header class="chapter-header">
      <h1>${escapeHtml(chapter.title)}</h1>
      ${chapter.description ? `<p class="chapter-description">${escapeHtml(chapter.description)}</p>` : ''}
    </header>
    <div class="loading-state">Fejezet betöltése…</div>`;

  try {
    const response = await fetch(chapter.file, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Nem tölthető be: ${chapter.file}`);

    const source = await response.text();
    const body = renderMarkdown(source, chapter.file);

    contentEl.innerHTML = `
      <header class="chapter-header">
        <h1>${escapeHtml(chapter.title)}</h1>
        ${chapter.description ? `<p class="chapter-description">${escapeHtml(chapter.description)}</p>` : ''}
      </header>
      <div class="markdown-body">${body}</div>`;

    setupRenderedContent();
    buildPager(chapter);
    updateActiveNav(chapter.id, sectionId);
    scrollToSection(sectionId);
  } catch (error) {
    contentEl.innerHTML += `
      <div class="error-state">
        ${escapeHtml(error.message)}<br><br>
        Helyi előnézethez indíts egyszerű webszervert; részletek a README-ben.
      </div>`;
  }
}

async function route() {
  if (!state.chapters.length) return;

  const { chapter, sectionId } = parseRoute();

  if (!location.hash) {
    history.replaceState(null, '', `#/${chapter.id}`);
  }

  await showChapter(chapter, sectionId);
}

async function init() {
  applyTheme(preferredTheme());
  applySidebarState();
  setupUiControls();

  try {
    await loadManifest();
    await loadOutlines();
    buildSidebar();
    await route();
    window.addEventListener('hashchange', route);
  } catch (error) {
    contentEl.innerHTML = `
      <div class="error-state">
        <strong>Nem sikerült betölteni a weboldalt.</strong><br>
        ${escapeHtml(error.message)}
      </div>`;
  }
}

init();
