(function () {
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const normalize = (p) => {
    if (!p) return '/';
    try {
      const u = new URL(p, location.origin);
      const n = u.pathname.replace(/\/+$/, '');
      return n || '/';
    } catch {
      return p.length > 1 ? p.replace(/\/+$/, '') : '/';
    }
  };

  const routes = {
    '/ru'            : { file: null,                      selector: '#home' },
    '/ru/citizenship': { file: '/pages/citizenship.html', selector: '#citizenship' },
  };

  const setActiveLink = (activePath) => {
    $$('.nav-link').forEach(a => {
      const same = normalize(a.getAttribute('href')) === normalize(activePath);
      a.classList.toggle('text-blue-400', same);
      a.classList.toggle('border-blue-400', same);
    });
  };

  const showOnly = (selector) => {
    $$('#content .page').forEach(s => s.classList.remove('is-active'));
    const el = $(selector);
    if (el) el.classList.add('is-active');
  };

  const loadPartial = async (file, selector) => {
    const html = await fetch(file, { cache: 'no-cache' }).then(r => r.text());
    const doc  = new DOMParser().parseFromString(html, 'text/html');
    const frag = doc.querySelector(selector) || doc.body;
    $('#content').innerHTML = frag.outerHTML;
  };

  const navigateTo = async (path, push = true) => {
    const key = normalize(path);
    const r = routes[key];
    if (!r) return;

    if (r.file) {
      await loadPartial(r.file, r.selector);
    } else {
      showOnly(r.selector); 
    }

    if (push) history.pushState({ path: key }, '', key);
    setActiveLink(key);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a.nav-link');
    if (!a) return;
    const href = normalize(a.getAttribute('href'));
    if (routes[href]) {
      e.preventDefault();
      navigateTo(href);
    }
  });

  window.addEventListener('popstate', () => {
    const path = normalize(location.pathname);
    if (routes[path]) navigateTo(path, false);
  });

  window.addEventListener('DOMContentLoaded', () => {
    const path = normalize(location.pathname);
    navigateTo(routes[path] ? path : '/ru', false);
  });
})();

const burger      = document.getElementById('burger');
const mobilePanel = document.getElementById('mobilePanel');
const langBtn     = document.getElementById('langBtn');
const langDrop    = document.getElementById('langDrop');
const langMenu    = document.getElementById('langMenu');

burger?.addEventListener('click', () => {
  const open = mobilePanel.classList.toggle('open');
  mobilePanel.setAttribute('aria-hidden', String(!open));
});
langBtn?.addEventListener('click', e => {
  e.stopPropagation();
  langDrop?.classList.toggle('open');
  langMenu?.setAttribute('aria-hidden', String(!langDrop?.classList.contains('open')));
});
document.addEventListener('click', () => {
  langDrop?.classList.remove('open');
  langMenu?.setAttribute('aria-hidden', 'true');
});

const normalize = (p) => {
  try {
    const u = new URL(p, location.origin);
    let n = u.pathname.replace(/\/+$/, '');
    return n || '/';
  } catch {
    return p && p.length > 1 ? p.replace(/\/+$/, '') : '/';
  }
};

function ensureOutlet() {
  let outlet = document.getElementById('spa-outlet');
  if (!outlet) {
    outlet = document.createElement('div');
    outlet.id = 'spa-outlet';
    const footer = document.querySelector('footer') || document.body.lastElementChild;
    document.body.insertBefore(outlet, footer);
  }
  return outlet;
}
const outlet = ensureOutlet();

const header = document.querySelector('header');
const footer = document.querySelector('footer') || null;
const homeNodes = [];
if (header && footer) {
  for (let n = header.nextElementSibling; n && n !== footer; n = n.nextElementSibling) {
    if (n.id !== 'spa-outlet') homeNodes.push(n);
  }
}

function showHome() {
  outlet.innerHTML = '';
  homeNodes.forEach(n => (n.style.display = ''));
  window.scrollTo({ top: 0, behavior: 'instant' });
}
function hideHome() {
  homeNodes.forEach(n => (n.style.display = 'none'));
}

const pagesMap = {
  '/ru'                                 : null, 
  '/ru/citizenship'                     : 'citizenship.html',
  '/ru/residence'                       : 'residence.html',
  '/ru/comparison-of-the-investment-programs-of-the-eu' : 'comparison.html',
  '/ru/real-estate'                     : 'real-estate.html',
  '/ru/cases'                           : 'cases.html',
  '/ru/about-us'                        : 'about-us.html'
};

async function loadPage(fileName) {
  const url = `/pages/${fileName}`;
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Не вдалося завантажити ${url}`);
  const html = await res.text();
  outlet.innerHTML = html;
  window.scrollTo({ top: 0, behavior: 'instant' });
}

async function navigateTo(path, push = true) {
  const key = normalize(path);
  const file = pagesMap[key];

  if (!file) { 
    showHome();
  } else {
    hideHome();
    try { await loadPage(file); } catch (e) { console.error(e); }
  }

  document.querySelectorAll('a.nav-link').forEach(a => {
    const same = normalize(a.getAttribute('href')) === key;
    a.classList.toggle('text-blue-400', same);
    a.classList.toggle('border-blue-400', same);
  });

  if (push) history.pushState({ path: key }, '', key);
}

document.addEventListener('click', (e) => {
  const a = e.target.closest('a.nav-link');
  if (!a) return;
  const href = normalize(a.getAttribute('href'));
  const file = a.dataset.page; 
  if (href in pagesMap || file) {
    if (file) pagesMap[href] = file;
    e.preventDefault();
    navigateTo(href);
  }
});

window.addEventListener('popstate', () => {
  navigateTo(normalize(location.pathname), false);
});

window.addEventListener('DOMContentLoaded', () => {
  navigateTo(normalize(location.pathname), false);
});
