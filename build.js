// Static site generator for shastilawfirm.com  ->  node build.js
const fs = require('fs');
const path = require('path');
const { SITE, GROUPS, SERVICES, POSTS, FAQS_HOME, NEW_CODES_NOTE, COURTS: ALL_COURTS, COURT_NOTICE, COURT_SOURCES } = require('./data');
const COURTS = ALL_COURTS.filter((c) => !c.hold); // set hold:true on a court to keep it out of the build

const DIST = path.join(__dirname, 'dist');
const ICON_DIR = path.join(__dirname, 'node_modules/lucide-static/icons');

// ---------- helpers ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonLd = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
const abs = (p) => SITE.url + p;
const WA_TEXT = encodeURIComponent('Hello Shasti Law Firm, I would like to enquire about a legal consultation.');
const WA = `https://wa.me/${SITE.waNumber}?text=${WA_TEXT}`;
const TEL = `tel:${SITE.phone}`;

const iconCache = {};
function icon(name, cls = 'w-5 h-5') {
  if (!iconCache[name]) {
    const file = path.join(ICON_DIR, name + '.svg');
    if (!fs.existsSync(file)) throw new Error('Missing icon: ' + name);
    iconCache[name] = fs.readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, '').trim();
  }
  return iconCache[name].replace(/<svg[^>]*>/, `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}" aria-hidden="true" focusable="false">`);
}

// Anchor id for a practice group on the home page, used by the footer "Practice Areas" links
const groupAnchor = (g) => 'practice-' + g.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const svcByGroup = (g) => SERVICES.filter((s) => s.group === g && !s.hideFromLists);
const svcUrl = (slug) => `/services/${slug}/`;
const postUrl = (slug) => `/insights/${slug}/`;
const courtUrl = (slug) => `/courts/${slug}/`;
const HUB = 'chennai-courts-guide';
// Four display groups for the dedicated practice-area pages (cheque bounce, group B, sits inside Civil Litigation & Recovery).
const PAGE_GROUPS = [
  { slug: 'matrimonial-family-law', name: 'Matrimonial & Family Law', ids: ['C'], icon: 'users' },
  { slug: 'criminal-law', name: 'Criminal Law', ids: ['A'], icon: 'shield' },
  { slug: 'civil-litigation-recovery', name: 'Civil Litigation & Recovery', ids: ['D', 'B'], icon: 'landmark' },
  { slug: 'corporate-commercial-law', name: 'Corporate & Commercial Law', ids: ['E'], icon: 'briefcase' },
];
const groupPageUrl = (slug) => `/practice-areas/${slug}/`;
const pageGroupOf = (id) => PAGE_GROUPS.find((x) => x.ids.includes(id));
// Dropdown / drawer heading links: each registry group opens its dedicated page (cheque bounce opens its block on the Civil page).
const groupHref = (g) => g.id === 'B' ? groupPageUrl('civil-litigation-recovery') + '#cheque-bounce-section-138' : groupPageUrl(pageGroupOf(g.id).slug);

function write(rel, content) {
  const out = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, content);
}

// ---------- shared chrome ----------
function head({ title, desc, path: p, schema = [], noindex = false, ogType = 'website', ogImage = null, ogAlt = '', social = false }) {
  const canonical = abs(p);
  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
${noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<meta name="theme-color" content="#101C35">
<meta property="og:locale" content="en_IN">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
${social ? `<meta name="twitter:title" content="${esc(title)}">\n<meta name="twitter:description" content="${esc(desc)}">\n` : ''}${ogImage ? `<meta property="og:image" content="${abs(ogImage)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(ogAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${abs(ogImage)}">` : '<meta name="twitter:card" content="summary">'}
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/playfair-display-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/styles.css">
<script>try{var h=location.hash;if(h.length>1&&h.indexOf("#/")!==0)document.documentElement.style.scrollBehavior="auto"}catch(e){}</script>
${schema.map(jsonLd).join('\n')}
</head>`;
}

function navDropdown() {
  return GROUPS.map((g) => `
        <div class="p-2">
          <a href="${groupHref(g)}" class="block px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gold-400 hover:text-gold-200">${esc(g.name)}</a>
          ${svcByGroup(g.id).map((s) => `<a href="${svcUrl(s.slug)}" class="block px-3 py-1.5 rounded text-sm text-slate-200 hover:bg-navy-800 hover:text-gold-300">${esc(s.short)}</a>`).join('')}
        </div>`).join('') + `
        <a href="/practice-areas/" class="col-span-2 mx-2 mb-1 mt-1 px-3 py-2 rounded text-sm font-semibold text-gold-300 hover:bg-navy-800 border-t border-navy-800">View all practice areas &rarr;</a>`;
}

function header() {
  const navLink = 'py-2 border-b-2 border-transparent hover:border-gold-400 hover:text-gold-300 transition-colors';
  return `<body class="pb-20 md:pb-0">
<a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:bg-gold-500 focus:text-navy-950 focus:rounded">Skip to content</a>
<div class="bg-navy-950 text-slate-300 text-xs py-2 px-4 border-b border-navy-800">
  <div class="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5">
    <span class="flex items-center gap-1.5">${icon('map-pin', 'w-3.5 h-3.5 text-gold-400')} ${SITE.locality}, ${SITE.city}, ${SITE.region}</span>
    <a href="${TEL}" class="flex items-center gap-1.5 text-gold-300 font-semibold hover:text-gold-200">${icon('phone', 'w-3.5 h-3.5')} ${SITE.phoneDisplay}</a>
  </div>
</div>
<header class="sticky top-0 z-40 bg-navy-900/95 backdrop-blur border-b border-gold-500/20 text-white shadow-lg">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
    <a href="/" class="flex items-center gap-3" aria-label="${SITE.name} home">
      <span class="w-11 h-11 rounded-full border border-gold-500/60 flex items-center justify-center bg-navy-950">${icon('scale', 'w-6 h-6 text-gold-400')}</span>
      <span class="flex flex-col leading-tight">
        <span class="font-heading font-bold text-xl sm:text-2xl">${SITE.name}</span>
        <span class="text-[11px] uppercase tracking-widest text-gold-400 font-semibold">Advocates · ${SITE.city}</span>
      </span>
    </a>
    <nav aria-label="Main" class="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-100">
      <a href="/" class="${navLink}">Home</a>
      <a href="/about-us/" class="${navLink}">About</a>
      <div class="dd relative flex items-center gap-1">
        <a href="/practice-areas/" class="${navLink}">Practice areas</a>
        <button type="button" aria-expanded="false" aria-haspopup="true" aria-label="Show practice area groups" class="p-1 hover:text-gold-300">${icon('chevron-down', 'w-4 h-4 text-gold-400')}</button>
        <div class="dd-panel absolute left-1/2 -translate-x-1/2 top-full mt-1 w-[40rem] bg-navy-950 border border-gold-500/30 rounded-xl shadow-2xl p-2 grid grid-cols-2 z-50">${navDropdown()}</div>
      </div>
      <a href="${courtUrl(HUB)}" class="${navLink}">Court guides</a>
      <a href="/insights/" class="${navLink}">Insights</a>
      <a href="/faqs/" class="${navLink}">FAQ</a>
      <a href="/contact-us/" class="${navLink}">Contact</a>
    </nav>
    <div class="flex items-center gap-3">
      <a href="/contact-us/#appointment" class="hidden md:inline-flex btn-gold">${icon('calendar', 'w-4 h-4')} Book consultation</a>
      <button id="menu-open" type="button" class="lg:hidden p-2 text-gold-300 hover:text-white" aria-label="Open menu" aria-expanded="false" aria-controls="drawer">${icon('menu', 'w-7 h-7')}</button>
    </div>
  </div>
</header>

<div id="drawer" hidden class="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
  <div class="absolute inset-0 bg-black/70" data-drawer-close></div>
  <div class="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-navy-950 border-l border-gold-500/30 p-6 overflow-y-auto text-white">
    <div class="flex items-center justify-between pb-4 border-b border-navy-800">
      <span class="font-heading font-bold text-lg">${SITE.name}</span>
      <button type="button" data-drawer-close class="p-2 text-slate-300 hover:text-white" aria-label="Close menu">${icon('x', 'w-6 h-6')}</button>
    </div>
    <nav aria-label="Mobile" class="mt-4 text-base">
      <a href="/" class="block py-3 border-b border-navy-900">Home</a>
      <a href="/about-us/" class="block py-3 border-b border-navy-900">About</a>
      <a href="/practice-areas/" class="block py-3 border-b border-navy-900">Practice areas</a>
      <a href="${courtUrl(HUB)}" class="block py-3 border-b border-navy-900">Court guides</a>
      <a href="/insights/" class="block py-3 border-b border-navy-900">Insights</a>
      <a href="/faqs/" class="block py-3 border-b border-navy-900">FAQ</a>
      <a href="/contact-us/" class="block py-3 border-b border-navy-900">Contact</a>
      <div class="mt-5 text-xs font-semibold uppercase tracking-wider text-gold-400">Services by practice group</div>
      ${GROUPS.map((g) => `<a href="${groupHref(g)}" class="block mt-3 text-sm font-semibold text-white hover:text-gold-300">${esc(g.name)}</a>${svcByGroup(g.id).map((s) => `<a href="${svcUrl(s.slug)}" class="block py-1.5 pl-3 text-sm text-slate-300 hover:text-gold-300">${esc(s.short)}</a>`).join('')}`).join('')}
    </nav>
    <div class="mt-6 pt-5 border-t border-navy-800 space-y-3">
      <a href="${TEL}" class="btn-ghost w-full">${icon('phone', 'w-4 h-4 text-gold-400')} Call ${SITE.phoneDisplay}</a>
      <a href="/contact-us/#appointment" class="btn-gold w-full">${icon('calendar', 'w-4 h-4')} Book consultation</a>
    </div>
  </div>
</div>
<main id="main">`;
}

function footer() {
  return `</main>
<footer class="bg-navy-950 text-slate-300 border-t border-navy-800 pt-14 pb-10">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-navy-800 text-sm">
      <div class="space-y-3">
        <div class="flex items-center gap-3"><span class="w-10 h-10 rounded-full border border-gold-500 flex items-center justify-center bg-navy-900">${icon('scale', 'w-5 h-5 text-gold-400')}</span><span class="font-heading font-bold text-xl text-white">${SITE.name}</span></div>
        <p class="text-slate-300 leading-relaxed">Advocates practising in criminal, family, cheque dishonour, civil and commercial matters in Chennai.</p>
        <p class="text-gold-300 font-medium">${SITE.locality}, ${SITE.city}, ${SITE.region}</p>
      </div>
      <div>
        <div>
        <h2 class="text-sm font-semibold uppercase tracking-wider text-white border-l-2 border-gold-500 pl-2.5">Site</h2>
        <ul class="mt-3 space-y-2">
          <li><a class="hover:text-gold-300" href="/">Home</a></li>
          <li><a class="hover:text-gold-300" href="/about-us/">About us</a></li>
          <li><a class="hover:text-gold-300" href="/practice-areas/">Practice areas</a></li>
          <li><a class="hover:text-gold-300" href="/contact-us/">Contact us</a></li>
          <li><a class="hover:text-gold-300" href="/consultation-process/">Consultation process</a></li>
          <li><a class="hover:text-gold-300" href="${courtUrl(HUB)}">Chennai courts guide</a></li>
          <li><a class="hover:text-gold-300" href="/insights/">Legal insights</a></li>
          <li><a class="hover:text-gold-300" href="/faqs/">FAQs</a></li>
          <li><a class="hover:text-gold-300" href="/contact-us/#appointment">Request a consultation</a></li>
        </ul>
        </div>
        <div class="mt-8">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-white border-l-2 border-gold-500 pl-2.5">Practice Areas</h2>
          <ul class="mt-3 space-y-2">${PAGE_GROUPS.map((g) => `<li><a class="hover:text-gold-300" href="${groupPageUrl(g.slug)}">${esc(g.name)}</a></li>`).join('')}</ul>
        </div>
      </div>
      <div>
        <h2 class="text-sm font-semibold uppercase tracking-wider text-white border-l-2 border-gold-500 pl-2.5">Legal Services</h2>
        <ul class="mt-3 space-y-2">${SERVICES.filter((s) => !s.hideFromLists).map((s) => `<li><a class="hover:text-gold-300" href="${svcUrl(s.slug)}">${esc(s.short)}</a></li>`).join('')}</ul>
      </div>
      <div>
        <h2 class="text-sm font-semibold uppercase tracking-wider text-white border-l-2 border-gold-500 pl-2.5">Contact</h2>
        <div class="mt-3 space-y-3">
          <p><strong class="block text-white">Office</strong>${SITE.locality}, ${SITE.city}, ${SITE.region}</p>
          <p><strong class="block text-white">Phone</strong><a href="${TEL}" class="text-gold-300 font-semibold hover:underline">${SITE.phoneDisplay}</a></p>
          <p><strong class="block text-white">WhatsApp</strong><a href="${WA}" target="_blank" rel="noopener noreferrer" class="text-emerald-300 hover:underline">Message the firm</a></p>
          <p class="text-slate-400">Consultations are by prior appointment.</p>
        </div>
      </div>
    </div>
    <section aria-labelledby="footer-locations" class="py-8 border-b border-navy-800 text-sm">
      <h2 id="footer-locations" class="text-sm font-semibold uppercase tracking-wider text-white border-l-2 border-gold-500 pl-2.5">Courts &amp; Locations</h2>
      <p class="mt-2 text-slate-400 max-w-3xl">Court information and location pages. The firm’s only office is at ${SITE.locality}, ${SITE.city}. A court or locality named here is not an office.</p>
      <div class="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-6">${COURT_LOCATIONS.map((l) => `<div><h3 class="font-semibold text-gold-300">${esc(l.name)}</h3><ul class="mt-2 space-y-1.5"><li><a class="hover:text-gold-300" href="${courtUrl(l.guide)}">${esc(l.guideLabel || 'Courts guide')}</a></li>${l.pages.map(([slug, label]) => `<li><a class="hover:text-gold-300" href="${svcUrl(slug)}">${esc(label)}</a></li>`).join('')}</ul></div>`).join('')}</div>
    </section>
    <div class="pt-8 space-y-5 text-sm">
      <div class="p-4 rounded-lg bg-navy-900/60 border border-navy-800 text-slate-300 leading-relaxed">
        <strong class="text-gold-300 block mb-1">Disclaimer</strong>
        The Bar Council of India Rules do not permit advocates to advertise or solicit work. This website is provided only to give information about the firm and about the law, at the visitor’s own request. It is not legal advice, does not create an advocate-client relationship, and nothing on it is a guarantee of any result. <a class="underline hover:text-gold-300" href="/disclaimer/">Read the full disclaimer</a>.
      </div>
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400">
        <div>© <span id="year">2026</span> ${SITE.name}, ${SITE.locality}, ${SITE.city}.</div>
        <div class="flex items-center gap-4"><a class="hover:text-gold-300 underline" href="/disclaimer/">Disclaimer</a><a class="hover:text-gold-300 underline" href="/privacy/">Privacy</a><a class="hover:text-gold-300 underline" href="/terms/">Terms</a></div>
      </div>
    </div>
  </div>
</footer>

<div class="hidden md:flex fixed bottom-6 right-6 z-40 flex-col items-end gap-3">
  <a href="${WA}" target="_blank" rel="noopener noreferrer" class="group flex items-center bg-[#117A40] text-white p-3.5 rounded-full shadow-2xl hover:bg-[#0E7A3F] transition-colors" aria-label="Message on WhatsApp">${icon('message-circle', 'w-6 h-6')}<span class="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-focus-visible:max-w-xs transition-all duration-300 text-sm font-semibold group-hover:pl-2 group-focus-visible:pl-2">WhatsApp</span></a>
  <a href="${TEL}" class="group flex items-center bg-navy-900 border-2 border-gold-500 text-white p-3.5 rounded-full shadow-2xl hover:bg-navy-800 transition-colors" aria-label="Call the firm">${icon('phone', 'w-6 h-6 text-gold-400')}<span class="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-focus-visible:max-w-xs transition-all duration-300 text-sm font-semibold group-hover:pl-2 group-focus-visible:pl-2">Call</span></a>
</div>

<nav aria-label="Quick actions" class="md:hidden fixed bottom-0 inset-x-0 z-40 bg-navy-950 border-t border-gold-500/30 pb-[env(safe-area-inset-bottom)]">
  <div class="grid grid-cols-5 text-center">
    <a href="/" class="flex flex-col items-center justify-center py-2 text-slate-200 hover:text-gold-300">${icon('home', 'w-5 h-5 text-gold-400')}<span class="text-xs mt-0.5">Home</span></a>
    <a href="/practice-areas/" class="flex flex-col items-center justify-center py-2 text-slate-200 hover:text-gold-300">${icon('briefcase', 'w-5 h-5 text-gold-400')}<span class="text-xs mt-0.5">Services</span></a>
    <a href="${TEL}" class="flex flex-col items-center justify-center py-2 text-gold-300 font-semibold">${icon('phone', 'w-5 h-5')}<span class="text-xs mt-0.5">Call</span></a>
    <a href="${WA}" target="_blank" rel="noopener noreferrer" class="flex flex-col items-center justify-center py-2 text-emerald-300 font-semibold">${icon('message-circle', 'w-5 h-5')}<span class="text-xs mt-0.5">WhatsApp</span></a>
    <a href="/contact-us/" class="flex flex-col items-center justify-center py-2 text-slate-200 hover:text-gold-300">${icon('map-pin', 'w-5 h-5 text-gold-400')}<span class="text-xs mt-0.5">Contact</span></a>
  </div>
</nav>
<script src="/assets/site.js" defer></script>
</body>
</html>
`;
}

const page = (meta, body) => head(meta) + header() + body + footer();

const firmSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'LegalService',
  '@id': SITE.url + '/#firm',
  name: SITE.name,
  url: SITE.url + '/',
  telephone: SITE.phone,
  address: {
    '@type': 'PostalAddress',
    addressLocality: SITE.city,
    addressRegion: SITE.region,
    postalCode: SITE.postalCode,
    addressCountry: 'IN',
  },
  areaServed: { '@type': 'City', name: SITE.city },
  description: 'Law firm in West Mambalam, Chennai practising in criminal law, cheque dishonour under Section 138 NI Act, matrimonial and family law, civil recovery and commercial disputes.',
});

const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': SITE.url + '/#website',
  url: SITE.url + '/',
  name: SITE.name,
  inLanguage: 'en-IN',
  publisher: { '@id': SITE.url + '/#firm' },
});

const breadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it[0], item: abs(it[1]) })),
});

const faqSchema = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

const faqList = (faqs) => faqs.map((f) => `
  <details class="faq bg-white rounded-xl border border-slate-200 shadow-sm">
    <summary class="cursor-pointer px-5 py-4 flex items-center justify-between gap-4 font-heading font-semibold text-navy-900 text-base">
      <span>${esc(f.q)}</span>${icon('plus', 'faq-icon w-5 h-5 text-gold-700 shrink-0 transition-transform')}
    </summary>
    <div class="px-5 pb-5 pt-1 text-sm text-charcoal-700 leading-relaxed">${esc(f.a)}</div>
  </details>`).join('');

const crumbs = (items) => `<nav aria-label="Breadcrumb" class="text-sm text-charcoal-600 mb-6"><ol class="flex flex-wrap items-center gap-2">${items.map((it, i) => i === items.length - 1
  ? `<li aria-current="page" class="font-semibold text-navy-900">${esc(it[0])}</li>`
  : `<li><a href="${it[1]}" class="hover:text-gold-700 underline-offset-2 hover:underline">${esc(it[0])}</a></li><li aria-hidden="true">/</li>`).join('')}</ol></nav>`;

function consultationForm(compact) {
  const inputCls = 'w-full px-4 py-3 rounded-lg bg-navy-900 border border-navy-600 text-white placeholder-slate-400 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/40 text-sm';
  const labelCls = 'block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2';
  const html = `
<form id="consultation-form" data-wa="${SITE.waNumber}" class="space-y-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div><label for="f-name" class="${labelCls}">Full name *</label><input id="f-name" name="name" type="text" required autocomplete="name" class="${inputCls}"></div>
          <div><label for="f-phone" class="${labelCls}">Mobile number *</label><input id="f-phone" name="phone" type="tel" required inputmode="numeric" pattern="[0-9]{10}" maxlength="10" autocomplete="tel-national" placeholder="10 digits" class="${inputCls}"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div><label for="f-email" class="${labelCls}">Email (optional)</label><input id="f-email" name="email" type="email" autocomplete="email" class="${inputCls}"></div>
          <div><label for="f-service" class="${labelCls}">Type of matter *</label>
            <select id="f-service" name="service" required class="${inputCls}">
              <option value="" disabled selected>Select a service</option>
              ${GROUPS.map((g) => `<optgroup label="${esc(g.name)}">${svcByGroup(g.id).map((s) => `<option value="${esc(s.short)}">${esc(s.short)}</option>`).join('')}</optgroup>`).join('')}
              <option value="Not sure / other">Not sure / other</option>
            </select></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div><label for="f-date" class="${labelCls}">Preferred date *</label><input id="f-date" name="date" type="date" required class="${inputCls}"></div>
          <div><label for="f-time" class="${labelCls}">Preferred consultation time slot *</label>
            <select id="f-time" name="time" required class="${inputCls}"><option value="" disabled selected>Select a preferred time slot</option><option>Morning, 10:00 AM to 12:30 PM</option><option>Afternoon, 2:00 PM to 4:30 PM</option><option>Evening, 5:30 PM to 8:00 PM</option></select>
            <p class="text-xs text-slate-300 leading-relaxed mt-1.5">Preferred slots only, subject to appointment confirmation. They are not office hours.</p></div>
        </div>
        <div><label for="f-summary" class="${labelCls}">Brief note *</label><textarea id="f-summary" name="summary" required rows="3" maxlength="400" placeholder="For example: notice received on a date, court involved, or a deadline coming up" class="${inputCls}"></textarea></div>
        <div class="flex items-start gap-3">
          <input id="f-consent" type="checkbox" required class="mt-1 w-4 h-4 accent-gold-500">
          <label for="f-consent" class="text-sm text-slate-200 leading-relaxed">I understand that sending this request does not create an advocate-client relationship, which begins only when the firm accepts the engagement and a Vakalatnama is signed.</label>
        </div>
        <button type="submit" class="btn-gold w-full py-4 text-base">${icon('send', 'w-5 h-5')} Continue on WhatsApp</button>
        <p id="form-status" role="status" aria-live="polite" hidden class="text-sm text-gold-200 bg-navy-900 border border-gold-500/30 rounded-lg p-3"></p>
        <a id="form-fallback" hidden target="_blank" rel="noopener noreferrer" class="btn-ghost w-full">Open WhatsApp</a>
</form>`;
  // compact: single-column fields, shorter note box, for the side panel on location pages
  return compact ? html
    .replace('grid grid-cols-1 sm:grid-cols-2 gap-5', 'grid grid-cols-1 gap-3').replace('grid grid-cols-1 sm:grid-cols-2 gap-5', 'grid grid-cols-1 gap-3').replace('grid grid-cols-1 sm:grid-cols-2 gap-5', 'grid grid-cols-2 gap-3')
    .replace('class="space-y-5"', 'class="space-y-3"')
    .replace(/py-3 rounded-lg/g, 'py-2 rounded-lg')
    .replace(/uppercase tracking-wider mb-2/g, 'uppercase tracking-wider mb-1')
    .replace('rows="3"', 'rows="2"')
    .replace('py-4 text-base', 'py-3 text-sm')
    .replace('text-sm text-slate-200 leading-relaxed">I understand', 'text-xs text-slate-200 leading-relaxed">I understand') : html;
}

// Courts & Locations: footer group and cross-links. Each entry: a court guide plus the location pages that use it.
// A listed locality is NOT an office. The firm's only office is West Mambalam, Chennai.
const COURT_LOCATIONS = [
  { name: 'Egmore', guide: 'egmore-courts-guide', pages: [['criminal-lawyer-egmore', 'Criminal lawyer'], ['bail-lawyer-egmore', 'Bail lawyer']] },
  { name: 'Tambaram', guide: 'tambaram-courts-guide', pages: [['criminal-lawyer-tambaram', 'Criminal lawyer'], ['divorce-lawyer-tambaram', 'Divorce lawyer'], ['family-court-lawyer-tambaram', 'Family court lawyer'], ['domestic-violence-lawyer-tambaram', 'Domestic violence lawyer']] },
  { name: 'Saidapet', guide: 'saidapet-courts-guide', pages: [['criminal-lawyer-saidapet', 'Criminal lawyer'], ['family-court-lawyer-saidapet', 'Family court lawyer']] },
  { name: 'Alandur', guide: 'alandur-courts-guide', pages: [['criminal-lawyer-alandur', 'Criminal lawyer'], ['divorce-lawyer-alandur', 'Divorce lawyer']] },
  { name: 'Chengalpattu', guide: 'chengalpattu-courts-guide', pages: [['criminal-lawyer-chengalpattu', 'Criminal lawyer'], ['family-court-lawyer-chengalpattu', 'Family court lawyer'], ['anticipatory-bail-lawyer-chengalpattu', 'Anticipatory bail lawyer']] },
  { name: 'Poonamallee', guide: 'poonamallee-courts-guide', pages: [['criminal-lawyer-poonamallee', 'Criminal lawyer'], ['bail-lawyer-poonamallee', 'Bail lawyer'], ['anticipatory-bail-lawyer-poonamallee', 'Anticipatory bail lawyer'], ['divorce-lawyer-poonamallee', 'Divorce lawyer'], ['domestic-violence-lawyer-poonamallee', 'Domestic violence lawyer']] },
  { name: 'Pallavaram', guide: 'pallavaram-courts-guide', pages: [['criminal-lawyer-pallavaram', 'Criminal lawyer'], ['divorce-lawyer-pallavaram', 'Divorce lawyer'], ['domestic-violence-lawyer-pallavaram', 'Domestic violence lawyer']] },
  { name: 'Kanchipuram', guide: 'kanchipuram-courts-guide', pages: [['criminal-lawyer-kanchipuram', 'Criminal lawyer'], ['bail-lawyer-kanchipuram', 'Bail lawyer'], ['anticipatory-bail-lawyer-kanchipuram', 'Anticipatory bail lawyer'], ['divorce-lawyer-kanchipuram', 'Divorce lawyer'], ['domestic-violence-lawyer-kanchipuram', 'Domestic violence lawyer']] },
  { name: 'Madras High Court', guide: 'george-town-courts-guide', guideLabel: 'George Town and Parrys guide', pages: [
      ['high-court-criminal-lawyer-chennai', 'Criminal lawyer'],
      ['high-court-bail-lawyer-chennai', 'Bail lawyer'],
      ['family-court-appeal-lawyer-madras-high-court', 'Family Court appeal lawyer'],
      ['divorce-appeal-lawyer-madras-high-court', 'Divorce and matrimonial appeal lawyer'],
      ['civil-appeal-lawyer-madras-high-court', 'Civil appeal and writ lawyer'],
      ['corporate-commercial-lawyer-madras-high-court', 'Corporate and commercial lawyer'],
    ] },
];
COURT_LOCATIONS.forEach((l) => {
  if (!COURTS.find((c) => c.slug === l.guide)) throw new Error('COURT_LOCATIONS: unknown court guide ' + l.guide);
  l.pages.forEach(([slug]) => { if (!SERVICES.find((x) => x.slug === slug)) throw new Error('COURT_LOCATIONS: unknown service ' + slug); });
});

const PROCESS_STEPS = [
  ['Request', 'Send a request through the form or call the office to arrange a confidential appointment.'],
  ['Initial briefing', 'A short briefing to identify urgent dates, notices received, FIR apprehensions or the key facts of the dispute.'],
  ['Document review', 'Review of cheques and bank memos, marriage records, agreements, police notices or earlier court papers.'],
  ['Options and advice', 'The available remedies, forum, risks, likely timeline and next steps are explained. No result can be guaranteed.'],
  ['Filing and appearance', 'If you decide to proceed, a Vakalatnama is signed and papers are drafted, verified and filed before the right court or forum.'],
];

const HOW_ITEMS = [
  ['file-text', 'Documents first', 'Each consultation starts with the facts and documents, so advice rests on the record and not on assumptions.'],
  ['message-circle', 'Plain explanations', 'Procedure, deadlines and risks under the BNSS, Hindu Marriage Act, NI Act and other laws are explained without needless jargon.'],
  ['lock', 'Confidentiality', 'Communications between an advocate and client are protected by law (Section 132 BSA, earlier Section 126 of the Evidence Act), subject to its exceptions.'],
  ['file-check', 'Careful drafting', 'Petitions, notices, affidavits and pleadings are prepared with attention to limitation periods and court requirements.'],
  ['map-pin', 'Chennai practice', 'Appearances before the Madras High Court and courts in Chennai, including Sessions, Family, Magistrate and civil courts.'],
  ['shield', 'No promises', 'Outcomes depend on facts, evidence and the court’s discretion. We do not guarantee results.'],
];

// ---------- HOME ----------
function homePage() {
  // Homepage display groups (display only; navigation, footer and form dropdown keep the GROUPS registry).
  // Group B (cheque bounce) is shown inside "Civil Litigation & Recovery"; its footer anchor is kept on a marker so existing links still scroll.
  const byId = (id) => GROUPS.find((x) => x.id === id);
  const HOME_GROUPS = [
    { name: 'Matrimonial & Family Law', ids: ['C'], cols: 'xl:grid-cols-3',
      box: 'bg-[#F8F5EF] border-[#D9C27A]', chipBg: 'bg-[#12213F] text-[#C9A227]', cards: ['bg-white', 'bg-[#F6EED8]'], edge: 'border-[#D9C27A] hover:border-[#C9A227]' },
    { name: 'Criminal Law', ids: ['A'], cols: 'xl:grid-cols-2',
      box: 'bg-[#EEF2F7] border-[#12213F]', chipBg: 'bg-[#12213F] text-[#C9A227]', cards: ['bg-white', 'bg-[#F8F5EF]'], edge: 'border-[#12213F] hover:border-[#C9A227]' },
    { name: 'Civil Litigation & Recovery', ids: ['D', 'B'], cols: 'xl:grid-cols-3',
      box: 'bg-white border-[#243B64]', chipBg: 'bg-[#12213F] text-[#C9A227]', cards: ['bg-[#EEF2F7]', 'bg-[#F8F5EF]'], edge: 'border-[#243B64] hover:border-[#C9A227]' },
    { name: 'Corporate & Commercial Law', ids: ['E'], cols: 'xl:grid-cols-2',
      box: 'bg-[#F4F6F9] border-[#12213F]', chipBg: 'bg-[#12213F] text-[#C9A227]', cards: ['bg-white', 'bg-[#F6EED8]'], edge: 'border-[#12213F] hover:border-[#C9A227]' },
  ];
  // Muted accent bar per card so neighbouring services are told apart at a glance.
  const ACCENTS = ['border-t-[#C9A227]', 'border-t-[#2E4C80]', 'border-t-[#3F6B73]', 'border-t-[#7A3E48]', 'border-t-[#8A6A0F]', 'border-t-[#5B6B8C]'];
  const groupCards = HOME_GROUPS.map((hg, gi) => {
    const first = byId(hg.ids[0]);
    const list = [];
    hg.ids.forEach((id, bi) => svcByGroup(id).forEach((s, i) => list.push({ s, anchor: bi > 0 && i === 0 ? groupAnchor(byId(id)) : '' })));
    const hid = `pg-h-${gi + 1}`;
    const fade = hg.box.match(/bg-\[(#[0-9A-Fa-f]{6})\]/) ? hg.box.match(/bg-\[(#[0-9A-Fa-f]{6})\]/)[1] : '#FFFFFF';
    const cards = list.map(({ s, anchor }, i) => `
        <li ${anchor ? `id="${anchor}" ` : ''}class="pg-card snap-start shrink-0 flex basis-[calc(100vw_-_6.5rem)] max-w-[20rem] sm:max-w-none sm:basis-[calc((100%_-_1rem)/2.2)] lg:basis-[calc((100%_-_2rem)/3.2)] xl:basis-[calc((100%_-_3rem)/3.4)] scroll-mt-24">
          <a href="${svcUrl(s.slug)}" class="group relative w-full p-5 sm:p-6 rounded-2xl ${hg.cards[i % hg.cards.length]} border-2 border-t-4 ${hg.edge} ${ACCENTS[i % ACCENTS.length]} shadow-sm hover:shadow-lg hover:-translate-y-1 motion-reduce:transform-none transition duration-200 flex flex-col justify-between focus-visible:ring-4 focus-visible:ring-[#C9A227]/50">
            <div><h4 class="font-heading text-xl font-bold text-navy-900 group-hover:text-gold-700">${esc(s.short)}</h4><p class="mt-3 text-sm text-charcoal-700 leading-relaxed">${esc(s.card)}</p></div>
            <div class="mt-5 pt-3 border-t-2 border-black/5 flex items-center justify-between gap-3 text-sm"><span class="font-semibold text-navy-900 group-hover:text-gold-700 flex items-center gap-1.5 whitespace-nowrap shrink-0">Read more <span class="w-6 h-6 rounded-full bg-[#12213F] text-[#C9A227] flex items-center justify-center group-hover:bg-gold-500 group-hover:text-navy-900 transition-colors">${icon('arrow-right', 'w-3.5 h-3.5')}</span></span><span class="text-xs text-charcoal-600 text-right">${esc(s.chip)}</span></div>
          </a>
        </li>`).join('');
    const ctl = (dir) => `<button type="button" data-dir="${dir}" class="w-11 h-11 rounded-full border-2 border-[#12213F] bg-white text-[#12213F] items-center justify-center hover:bg-[#12213F] hover:text-[#C9A227] disabled:opacity-35 disabled:pointer-events-none transition-colors focus-visible:ring-4 focus-visible:ring-[#C9A227]/50" aria-label="${dir < 0 ? 'Previous' : 'Next'} ${esc(hg.name)} services" aria-controls="pg-t-${gi + 1}">${icon(dir < 0 ? 'arrow-left' : 'arrow-right', 'w-5 h-5')}</button>`;
    return `
    <section id="${groupAnchor(first)}" aria-labelledby="${hid}" data-reveal class="pg-section ${hg.box} rounded-2xl border-2 p-5 sm:p-8 shadow-sm scroll-mt-24">
      <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5">
        <div class="flex items-center gap-4">
          <span class="w-12 h-12 rounded-xl ${hg.chipBg} flex items-center justify-center shrink-0">${icon(first.icon, 'w-6 h-6')}</span>
          <div><div class="text-xs font-bold uppercase tracking-widest text-gold-700">Practice group ${gi + 1}</div><h3 id="${hid}" class="font-heading text-2xl sm:text-3xl font-bold text-navy-900">${esc(hg.name)}</h3><span class="mt-2 block h-1 w-16 rounded bg-[#C9A227]" aria-hidden="true"></span></div>
        </div>
        <p class="text-sm text-charcoal-700 max-w-md">${esc(hg.ids.map((id) => byId(id).blurb).join(' '))}</p>
      </div>
      <div class="flex items-center justify-between gap-3 mb-3">
        <p class="text-xs font-semibold text-charcoal-600"><span class="md:hidden">Swipe to see all ${list.length} services</span><span class="hidden md:inline">${list.length} services</span></p>
        <div class="pg-ctl" data-ctl>${ctl(-1)}${ctl(1)}</div>
      </div>
      <div class="pg-wrap relative -mx-5 sm:-mx-8" style="--fade:${fade}">
        <ul id="pg-t-${gi + 1}" role="list" aria-label="${esc(hg.name)} services" class="pg-track flex gap-4 overflow-x-auto snap-x snap-mandatory px-5 sm:px-8 py-3 overscroll-x-contain">${cards}
        </ul>
      </div>
    </section>`;
  }).join('');

  const process = PROCESS_STEPS;

  const how = HOW_ITEMS;


  // Shared horizontal-scroller pieces (native overflow + scroll-snap; script only adds arrows, edge hints, progress).
  const hCtl = (id, label) => [-1, 1].map((d) => `<button type="button" data-dir="${d}" class="w-11 h-11 rounded-full border-2 border-[#12213F] bg-white text-[#12213F] items-center justify-center hover:bg-[#12213F] hover:text-[#C9A227] disabled:opacity-35 disabled:pointer-events-none transition-colors focus-visible:ring-4 focus-visible:ring-[#C9A227]/50" aria-label="${d < 0 ? 'Previous' : 'Next'} ${label}" aria-controls="${id}">${icon(d < 0 ? 'arrow-left' : 'arrow-right', 'w-5 h-5')}</button>`).join('');
  const PANEL = [
    'bg-[#12213F] text-white border-[#C9A227]',
    'bg-white text-navy-900 border-[#12213F]',
    'bg-[#F6EED8] text-navy-900 border-[#C9A227]',
  ];
  const howPanels = how.map((h, i) => {
    const dark = i % 3 === 0;
    return `<li class="pg-card snap-start shrink-0 flex basis-[calc(100vw_-_4rem)] max-w-[22rem] sm:max-w-none sm:basis-[calc((100%_-_1rem)/2.2)] lg:basis-[calc((100%_-_2rem)/3)]">
        <div class="relative overflow-hidden w-full p-6 sm:p-7 rounded-2xl border-2 shadow-sm ${PANEL[i % 3]} flex flex-col gap-4 min-h-[15rem]">
          <span class="absolute -right-1 -top-3 font-heading text-7xl font-bold ${dark ? 'text-white/10' : 'text-[#12213F]/10'}" aria-hidden="true">0${i + 1}</span>
          <span class="w-11 h-11 rounded-xl ${dark ? 'bg-[#C9A227] text-[#12213F]' : 'bg-[#12213F] text-[#C9A227]'} flex items-center justify-center relative">${icon(h[0], 'w-5 h-5')}</span>
          <h3 class="font-heading font-bold text-xl relative">${esc(h[1])}</h3>
          <p class="text-sm leading-relaxed relative ${dark ? 'text-slate-200' : 'text-charcoal-700'}">${esc(h[2])}</p>
        </div>
      </li>`;
  }).join('');
  const stepItems = process.map((p, i) => `<li class="pg-card snap-start shrink-0 basis-[calc(100vw_-_5rem)] max-w-[18rem] sm:max-w-none sm:basis-[calc((100%_-_1rem)/2.3)] lg:basis-[calc((100%_-_2rem)/3.3)] xl:basis-[calc((100%_-_3rem)/4.3)]">
        <div class="flex items-center gap-3 mb-4"><span class="w-11 h-11 rounded-full bg-[#C9A227] text-[#12213F] flex items-center justify-center font-bold shrink-0">${i + 1}</span><span class="h-0.5 flex-1 bg-[#C9A227]/40" aria-hidden="true"></span></div>
        <div class="bg-navy-950/80 p-5 sm:p-6 rounded-2xl border-2 border-[#C9A227]/40 hover:border-[#C9A227] transition-colors h-[calc(100%_-_3.75rem)]"><span class="text-xs font-bold text-gold-300 uppercase tracking-wider">Step ${i + 1}</span><h3 class="font-heading text-lg font-bold mt-1 mb-2">${esc(p[0])}</h3><p class="text-sm text-slate-200 leading-relaxed">${esc(p[1])}</p></div>
      </li>`).join('');
  const postItems = POSTS.map((p) => `<li class="pg-card snap-start shrink-0 flex basis-[calc(100vw_-_5rem)] max-w-[22rem] sm:max-w-none sm:basis-[calc((100%_-_1rem)/2.1)] lg:basis-[calc((100%_-_2rem)/2.5)] [&>article]:w-full [&>article]:border-2 [&>article]:border-t-4 [&>article]:border-[#12213F] [&>article]:border-t-[#C9A227] [&>article]:rounded-2xl">${postCard(p)}</li>`).join('');

  const body = `
<section class="relative bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white overflow-hidden py-16 sm:py-24">
  <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#c9a227_1px,transparent_1px)] [background-size:24px_24px]" aria-hidden="true"></div>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-7 space-y-6 text-center lg:text-left">
        <p class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-300 text-xs font-semibold tracking-wider uppercase">${icon('map-pin', 'w-3.5 h-3.5')} ${SITE.locality}, ${SITE.city}</p>
        <h1 class="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">Advocates in Chennai for Family, Criminal, <span class="gold-text">Civil &amp; Bail Matters</span></h1>
        <p class="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto lg:mx-0 leading-relaxed">${SITE.name} appears before the Madras High Court and the courts in Chennai. Practice areas include anticipatory bail, mutual divorce, Section 138 NI Act cases, money recovery and arbitration.</p>
        <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
          <a href="/contact-us/#appointment" class="btn-gold w-full sm:w-auto px-8 py-3.5">${icon('calendar', 'w-4 h-4')} Request a consultation</a>
          <a href="${TEL}" class="btn-ghost w-full sm:w-auto px-8 py-3.5">${icon('phone', 'w-4 h-4 text-gold-400')} Call ${SITE.phoneDisplay}</a>
        </div>
      </div>
      <div class="lg:col-span-5">
        <div class="rounded-2xl bg-navy-900 border border-gold-500/40 p-8 shadow-2xl space-y-5">
          <div class="text-center">
            <span class="w-20 h-20 mx-auto rounded-full bg-navy-950 border-2 border-gold-500 flex items-center justify-center">${icon('scale', 'w-10 h-10 text-gold-400')}</span>
            <p class="mt-4 font-heading text-2xl font-bold">${SITE.name}</p>
            <p class="text-gold-300 text-sm font-medium mt-1">${SITE.locality}, ${SITE.city}</p>
          </div>
          <ul class="border-y border-navy-700 py-4 space-y-3 text-sm text-slate-200">
            <li class="flex gap-2.5">${icon('check', 'w-4 h-4 text-gold-400 mt-0.5 shrink-0')} High Court of Madras</li>
            <li class="flex gap-2.5">${icon('check', 'w-4 h-4 text-gold-400 mt-0.5 shrink-0')} Sessions, Family and Magistrate Courts, Chennai</li>
            <li class="flex gap-2.5">${icon('check', 'w-4 h-4 text-gold-400 mt-0.5 shrink-0')} Civil and Commercial Courts, arbitral tribunals</li>
          </ul>
          <p class="text-center text-sm text-slate-300">Consultations by prior appointment</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section id="about" class="py-16 sm:py-20 bg-white border-b border-ivory-200">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
    <div class="lg:col-span-7 space-y-5 order-2 lg:order-1">
      <p class="text-gold-700 text-xs font-bold uppercase tracking-widest">About the firm</p>
      <h2 class="font-heading text-3xl sm:text-4xl font-bold text-navy-900 leading-tight">A law practice based in West Mambalam, Chennai</h2>
      <p class="text-charcoal-700 leading-relaxed">${SITE.name} acts for individuals, families, businesses and professionals in court proceedings, statutory notices and contractual disputes. The practice covers criminal law, cheque dishonour, matrimonial and family law, civil recovery and commercial matters.</p>
      <p class="text-charcoal-700 leading-relaxed">We begin by reviewing the documents and the applicable law, then explain the options, the court procedure and the risks, so that you can decide how to proceed.</p>
      <div class="flex flex-wrap items-center gap-x-6 gap-y-2"><a href="/contact-us/#appointment" class="inline-flex items-center gap-2 text-sm font-semibold text-gold-700 hover:text-navy-900">Request a consultation ${icon('arrow-right', 'w-4 h-4')}</a><a href="/about-us/" class="inline-flex items-center gap-2 text-sm font-semibold text-gold-700 hover:text-navy-900">About Shasti Law Firm ${icon('arrow-right', 'w-4 h-4')}</a></div>
    </div>
    <div class="lg:col-span-5 order-1 lg:order-2">
      <dl class="p-8 bg-navy-900 rounded-2xl text-white border-b-4 border-gold-500 shadow-xl text-sm space-y-3">
        <div class="flex justify-between gap-4 py-2 border-b border-navy-700"><dt class="text-slate-300">Firm</dt><dd class="font-medium">${SITE.name}</dd></div>
        <div class="flex justify-between gap-4 py-2 border-b border-navy-700"><dt class="text-slate-300">Office</dt><dd class="font-medium text-right">${SITE.locality}, ${SITE.city}</dd></div>
        <div class="flex justify-between gap-4 py-2 border-b border-navy-700"><dt class="text-slate-300">Practice</dt><dd class="font-medium text-right">Criminal, Family, NI Act, Civil, Commercial</dd></div>
        <div class="flex justify-between gap-4 py-2"><dt class="text-slate-300">Phone</dt><dd><a href="${TEL}" class="font-bold text-gold-300 hover:underline">${SITE.phoneDisplay}</a></dd></div>
      </dl>
    </div>
  </div>
</section>

<section id="practice-areas" class="py-16 sm:py-20 bg-ivory-100 border-b border-ivory-200">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center max-w-3xl mx-auto mb-12 space-y-3">
      <p class="text-gold-700 text-xs font-bold uppercase tracking-widest">Practice areas</p>
      <h2 class="font-heading text-3xl sm:text-4xl font-bold text-navy-900">Explore Our Legal Services</h2>
      <p class="text-charcoal-700">Matters are handled across trial courts, tribunals and the Madras High Court. Select a service for the legal framework, the documents usually needed and the procedure.</p>
    </div>
    <div class="space-y-6">${groupCards}</div>
    <p class="mt-10 text-center"><a href="/practice-areas/" class="btn-gold">View all practice areas ${icon('arrow-right', 'w-4 h-4')}</a></p>
  </div>
</section>

<section class="py-12 bg-white border-b border-ivory-200">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
    <div class="max-w-2xl"><p class="text-gold-700 text-xs font-bold uppercase tracking-widest">Court information</p><h2 class="font-heading text-2xl sm:text-3xl font-bold text-navy-900 mt-1">Which court, which district?</h2><p class="text-charcoal-700 mt-2">Chennai City Courts and the Chengalpattu district courts at Alandur and Tambaram are separate judiciaries. Our court guides set out what the official listings show and what must be confirmed for your case.</p></div>
    <a href="${courtUrl(HUB)}" class="btn-gold shrink-0">Read the courts guide ${icon('arrow-right', 'w-4 h-4')}</a>
  </div>
</section>

<section data-reveal aria-labelledby="how-h" class="pg-section py-16 sm:py-20 bg-[#EEF2F7] border-b border-ivory-200">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div class="max-w-3xl space-y-3">
        <p class="text-gold-700 text-xs font-bold uppercase tracking-widest">How we work</p>
        <h2 id="how-h" class="font-heading text-3xl sm:text-4xl font-bold text-navy-900">What to expect when you consult us</h2>
        <span class="block h-1 w-16 rounded bg-[#C9A227]" aria-hidden="true"></span>
      </div>
      <div class="flex items-center gap-4"><p class="text-xs font-semibold text-charcoal-600 md:hidden">Swipe to see all ${how.length} points</p><div class="pg-ctl" data-ctl>${hCtl('how-t', 'consultation points')}</div></div>
    </div>
    <div class="pg-wrap relative -mx-4 sm:-mx-6 lg:-mx-8" style="--fade:#EEF2F7">
      <ul id="how-t" role="list" aria-label="What to expect when you consult us" class="pg-track pg-edge flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 sm:px-6 lg:px-8 py-3 overscroll-x-contain">${howPanels}</ul>
    </div>
  </div>
</section>

<section id="process" data-reveal aria-labelledby="process-h" class="pg-section py-16 sm:py-20 bg-navy-900 text-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div class="max-w-3xl space-y-3">
        <p class="text-gold-300 text-xs font-bold uppercase tracking-widest">Consultation process</p>
        <h2 id="process-h" class="font-heading text-3xl sm:text-4xl font-bold">From first call to filing in five steps</h2>
        <span class="block h-1 w-16 rounded bg-[#C9A227]" aria-hidden="true"></span>
        <p><a href="/consultation-process/" class="inline-flex items-center gap-2 text-sm font-semibold text-gold-300 hover:text-white">Read the full consultation process ${icon('arrow-right', 'w-4 h-4')}</a></p>
      </div>
      <div class="flex items-center gap-4"><p class="text-xs font-semibold text-slate-200 md:hidden">Swipe through all ${process.length} steps</p><div class="pg-ctl" data-ctl>${hCtl('process-t', 'consultation steps')}</div></div>
    </div>
    <div class="h-1 rounded bg-white/15 mb-6 overflow-hidden" aria-hidden="true"><span class="pg-progress block h-full w-full bg-[#C9A227] origin-left" style="transform:scaleX(.3)"></span></div>
    <div class="pg-wrap relative -mx-4 sm:-mx-6 lg:-mx-8" style="--fade:#12213F">
      <ol id="process-t" aria-label="Consultation process steps" class="pg-track pg-edge flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 sm:px-6 lg:px-8 py-3 overscroll-x-contain">${stepItems}</ol>
    </div>
  </div>
</section>

<section id="insights" data-reveal class="pg-section py-16 sm:py-20 bg-ivory-100 border-b border-ivory-200">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
      <div><p class="text-gold-700 text-xs font-bold uppercase tracking-widest">Legal insights</p><h2 class="font-heading text-3xl sm:text-4xl font-bold text-navy-900 mt-1">Statutory overviews</h2><p class="text-charcoal-700 mt-2 max-w-xl">General information on procedure and rights under Indian law. It is not advice on any individual case.</p></div>
      <div class="flex items-center gap-4"><div class="pg-ctl" data-ctl>${hCtl('insights-t', 'insight articles')}</div><a href="/insights/" class="inline-flex items-center gap-1 text-sm font-semibold text-gold-700 hover:text-navy-900">All insights ${icon('arrow-right', 'w-4 h-4')}</a></div>
    </div>
    <div class="pg-wrap relative -mx-4 sm:-mx-6 lg:-mx-8" style="--fade:#F8F5EF">
      <ul id="insights-t" role="list" aria-label="Statutory overviews" class="pg-track pg-edge flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 sm:px-6 lg:px-8 py-3 overscroll-x-contain">${postItems}</ul>
    </div>
  </div>
</section>

<section id="faq" class="py-16 sm:py-20 bg-white border-b border-ivory-200">
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-10 space-y-3"><p class="text-gold-700 text-xs font-bold uppercase tracking-widest">Common questions</p><h2 class="font-heading text-3xl sm:text-4xl font-bold text-navy-900">Frequently asked questions</h2></div>
    <div class="space-y-3">${faqList(FAQS_HOME)}</div>
    <p class="mt-8 text-center"><a href="/faqs/" class="btn-gold">Browse all FAQs ${icon('arrow-right', 'w-4 h-4')}</a></p>
  </div>
</section>

<section id="appointment" class="py-16 sm:py-20 bg-ivory-100">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="rounded-2xl bg-navy-950 border border-gold-500/40 p-6 sm:p-12 shadow-2xl text-white">
      <div class="text-center max-w-2xl mx-auto mb-8 space-y-2">
        <p class="inline-flex items-center gap-1.5 text-gold-300 font-bold text-xs uppercase tracking-widest">${icon('calendar', 'w-4 h-4')} Prior appointment required</p>
        <h2 class="font-heading text-3xl sm:text-4xl font-bold">Request a consultation</h2>
        <p class="text-slate-300 text-sm">Fill in the form and your request opens in WhatsApp, ready to send to the firm. Please keep the note short and leave out sensitive details such as full case narratives, bank details or ID numbers; those can be shared at the consultation.</p>
      </div>
      ${consultationForm()}
      <p class="mt-6 text-center text-sm text-slate-300">Prefer to speak to someone? Call <a href="${TEL}" class="text-gold-300 font-bold hover:underline">${SITE.phoneDisplay}</a>, especially if you have an urgent court date.</p>
    </div>
  </div>
</section>

<section id="contact" class="py-16 sm:py-20 bg-white border-b border-ivory-200">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center max-w-2xl mx-auto mb-10 space-y-3"><p class="text-gold-700 text-xs font-bold uppercase tracking-widest">Office</p><h2 class="font-heading text-3xl sm:text-4xl font-bold text-navy-900">Contact ${SITE.name}</h2><p><a href="/contact-us/" class="inline-flex items-center gap-2 text-sm font-semibold text-gold-700 hover:text-navy-900">Open the Contact page ${icon('arrow-right', 'w-4 h-4')}</a></p></div>
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div class="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-ivory-50 border border-slate-200 space-y-6">
        <div class="flex items-start gap-3"><span class="p-2.5 rounded-lg bg-navy-900 text-gold-400 shrink-0">${icon('map-pin', 'w-4 h-4')}</span><div><div class="font-bold text-navy-900">Office</div><div class="text-charcoal-700 text-sm mt-0.5">${SITE.locality}, ${SITE.city}, ${SITE.region} ${SITE.postalCode}</div><div class="text-charcoal-600 text-sm">The full address is shared when your appointment is confirmed.</div></div></div>
        <div class="flex items-start gap-3"><span class="p-2.5 rounded-lg bg-navy-900 text-gold-400 shrink-0">${icon('phone', 'w-4 h-4')}</span><div><div class="font-bold text-navy-900">Phone</div><a href="${TEL}" class="text-gold-700 font-bold hover:underline">${SITE.phoneDisplay}</a></div></div>
        <div class="flex items-start gap-3"><span class="p-2.5 rounded-lg bg-navy-900 text-gold-400 shrink-0">${icon('message-circle', 'w-4 h-4')}</span><div><div class="font-bold text-navy-900">WhatsApp</div><a href="${WA}" target="_blank" rel="noopener noreferrer" class="text-emerald-800 font-semibold hover:underline">Message the firm</a></div></div>
        <div class="pt-4 border-t border-slate-200 flex gap-3">
          <a href="${TEL}" class="flex-1 btn-ghost !px-3 !py-2.5">${icon('phone', 'w-4 h-4 text-gold-400')} Call</a>
          <a href="${WA}" target="_blank" rel="noopener noreferrer" class="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#117A40] hover:bg-[#0E7A3F] text-white font-semibold text-sm">${icon('message-circle', 'w-4 h-4')} WhatsApp</a>
        </div>
      </div>
      <div class="lg:col-span-7 rounded-2xl border border-slate-200 overflow-hidden bg-white flex flex-col">
        <div class="p-4 bg-navy-950 text-white flex items-center justify-between text-sm"><span class="font-semibold">West Mambalam area map</span><span class="text-slate-300">Chennai ${SITE.postalCode}</span></div>
        <iframe title="Map of the West Mambalam area, Chennai" class="w-full h-80 border-0" loading="lazy" referrerpolicy="no-referrer" src="https://www.openstreetmap.org/export/embed.html?bbox=80.2070%2C13.0280%2C80.2320%2C13.0450&amp;layer=mapnik"></iframe>
        <p class="p-3 bg-slate-50 border-t border-slate-200 text-center text-sm text-charcoal-600">The map shows the general area only. The exact office address is shared on confirmation of your appointment.</p>
      </div>
    </div>
  </div>
</section>`;

  return page({
    title: 'Divorce, Family & Bail Advocates in Chennai | Shasti Law Firm',
    desc: 'Advocates in West Mambalam, Chennai: divorce, family court, bail, anticipatory bail, criminal defence, cheque bounce and civil matters. By appointment.',
    path: '/',
    schema: [firmSchema(), websiteSchema(), faqSchema(FAQS_HOME)],
  }, body);
}

function postCard(p) {
  return `<article class="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-shadow flex flex-col justify-between">
    <div class="p-6 space-y-3">
      <div class="flex items-center justify-between text-xs"><span class="px-2.5 py-1 rounded bg-gold-500/10 text-gold-700 font-bold uppercase tracking-wider">${esc(p.category)}</span><span class="text-charcoal-600">${p.minutes} min read</span></div>
      <h3 class="font-heading text-lg font-bold text-navy-900"><a href="${postUrl(p.slug)}" class="hover:text-gold-700">${esc(p.title)}</a></h3>
      <p class="text-sm text-charcoal-700 leading-relaxed">${esc(p.excerpt)}</p>
    </div>
    <div class="px-6 py-4 border-t border-slate-100"><a href="${postUrl(p.slug)}" class="text-sm font-semibold text-gold-700 hover:text-navy-900 inline-flex items-center gap-1">Read article ${icon('arrow-right', 'w-4 h-4')}</a></div>
  </article>`;
}

// ---------- SERVICE PAGES ----------
const LINK_CLS = 'font-semibold text-navy-900 underline underline-offset-2 hover:text-gold-700';
const linkify = (t) => esc(t).replace(/\[\[(c:)?([a-z0-9-]+)\|([^\]]+)\]\]/g, (m, isCourt, slug, label) => {
  if (isCourt) {
    if (!COURTS.find((x) => x.slug === slug)) throw new Error('linkify: unknown court guide ' + slug);
    return `<a href="${courtUrl(slug)}" class="${LINK_CLS}">${label}</a>`;
  }
  if (!SERVICES.find((x) => x.slug === slug)) throw new Error('linkify: unknown service ' + slug);
  return `<a href="${svcUrl(slug)}" class="${LINK_CLS}">${label}</a>`;
});

function servicePage(s) {
  const group = GROUPS.find((g) => g.id === s.group);
  const showCodes = s.group === 'A' || s.slug === 'family-court-advocate-chennai';
  const bodyParas = s.body.filter((t) => t !== NEW_CODES_NOTE);
  const pgOf = pageGroupOf(s.group);
  const trail = [['Home', '/'], ['Practice areas', '/practice-areas/'], [pgOf.name, groupPageUrl(pgOf.slug)], [s.short, svcUrl(s.slug)]];
  const related = s.related.map((r) => SERVICES.find((x) => x.slug === r)).filter(Boolean);
  const wide = !!s.sideForm; // location pages: two-column layout with a compact consultation form beside the article on desktop
  const maxW = wide ? 'max-w-6xl' : 'max-w-5xl';
  const sidePanel = wide ? `<aside aria-label="Request a consultation" class="mt-8 lg:mt-0 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto rounded-2xl">
    <div class="rounded-2xl bg-navy-950 text-white border border-navy-800 border-t-4 border-t-gold-500 p-4 shadow-lg">
      <h2 class="font-heading text-lg font-bold">Request a consultation</h2>
      <p class="text-xs text-slate-300 leading-relaxed mt-1 mb-3">By appointment at ${SITE.locality}, ${SITE.city}. This form opens WhatsApp with your details filled in. Nothing is sent to this website, or at all until you press send in WhatsApp.</p>
      ${consultationForm(true)}
    </div>
  </aside>` : '';

  const body = `
<section class="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white border-b-4 border-gold-500">
  <div class="${maxW} mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-4">
    <p class="inline-block px-3 py-1 rounded bg-gold-500/20 text-gold-300 text-xs font-bold uppercase tracking-wider">${esc(group.name)}</p>
    <h1 class="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold">${esc(s.h1)}</h1>
    <p class="text-slate-200 text-base sm:text-lg max-w-3xl leading-relaxed">${esc(s.subtitle)}</p>
    <p class="text-sm text-gold-300 font-medium">${esc(s.chip)}</p>
  </div>
</section>
<div class="${maxW} mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
  ${crumbs(trail)}
  ${wide ? '<div class="lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8 lg:items-start">' : ''}
  <article class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-10">
    <section class="space-y-4">
      <h2 class="font-heading text-2xl font-bold text-navy-900">Legal framework and scope</h2>
      <div class="space-y-4 text-charcoal-700 leading-relaxed">${bodyParas.map((t) => `<p>${linkify(t)}</p>`).join('')}</div>
      ${showCodes ? `<aside class="p-4 rounded-lg bg-gold-500/10 border border-gold-500/30 text-sm text-charcoal-800 leading-relaxed"><strong class="block text-gold-700 mb-1">Which code applies?</strong>${esc(NEW_CODES_NOTE)}</aside>` : ''}
    </section>

    ${(s.sections || []).map((x) => `<section class="space-y-4"><h2 class="font-heading text-2xl font-bold text-navy-900">${esc(x.h)}</h2><div class="space-y-4 text-charcoal-700 leading-relaxed">${(x.paras || []).map((t) => `<p>${linkify(t)}</p>`).join('')}${(x.subs || []).map((u) => `<div class="space-y-2"><h3 class="font-heading text-lg font-bold text-navy-900">${esc(u.h)}</h3><p>${linkify(u.p)}</p></div>`).join('')}${(x.items || []).length ? `<ul class="space-y-2">${x.items.map((t) => `<li class="flex items-start gap-2.5">${icon('check', 'w-4 h-4 text-gold-700 mt-1 shrink-0')}<span>${linkify(t)}</span></li>`).join('')}</ul>` : ''}${(x.after || []).map((t) => `<p>${linkify(t)}</p>`).join('')}</div></section>`).join('')}<section class="p-6 rounded-xl bg-gold-500/10 border border-gold-500/30 space-y-3">
      <h2 class="flex items-center gap-2 font-heading text-lg font-bold text-navy-900">${icon('file-text', 'w-5 h-5 text-gold-700')} Documents that may be needed</h2>
      <p class="text-sm text-charcoal-700">Requirements depend on the facts of your matter; we confirm the list at the consultation.</p>
      <ul class="space-y-2 text-sm text-charcoal-800">${s.docs.map((d) => `<li class="flex items-start gap-2.5">${icon('check', 'w-4 h-4 text-gold-700 mt-0.5 shrink-0')}<span>${esc(d)}</span></li>`).join('')}</ul>
    </section>

    <section class="space-y-4">
      <h2 class="font-heading text-2xl font-bold text-navy-900">General procedure</h2>
      <ol class="space-y-3 text-charcoal-800">${s.steps.map((t, i) => `<li class="flex items-start gap-3"><span class="w-7 h-7 rounded-full bg-navy-900 text-gold-300 text-sm font-bold flex items-center justify-center shrink-0">${i + 1}</span><span class="pt-0.5">${esc(t)}</span></li>`).join('')}</ol>
      <p class="text-sm text-charcoal-600">This is a general outline. The exact steps, forum and timing vary from case to case.</p>
    </section>

    <section id="faq" class="space-y-4 scroll-mt-24">
      <h2 class="font-heading text-2xl font-bold text-navy-900">Frequently asked questions</h2>
      <div class="space-y-3">${faqList(s.faqs)}</div>
    </section>

    ${related.length ? `<section class="space-y-3"><h2 class="font-heading text-xl font-bold text-navy-900">Related services</h2><ul class="grid sm:grid-cols-2 gap-3">${related.map((r) => `<li><a href="${svcUrl(r.slug)}" class="block p-4 rounded-lg bg-ivory-100 border border-ivory-200 hover:border-gold-500 text-navy-900 font-semibold">${esc(r.short)}<span class="block text-sm font-normal text-charcoal-600 mt-1">${esc(r.card)}</span></a></li>`).join('')}</ul></section>` : ''}

    ${(s.searches || []).length ? `<section class="space-y-2"><h2 class="font-heading text-xl font-bold text-navy-900">Related legal searches</h2><p class="text-sm text-charcoal-700 leading-relaxed">People looking for help with this kind of matter also search for: ${s.searches.map((q) => esc(q)).join("; ")}. This page and the pages linked from it cover those topics.</p></section>` : ''}

    ${(s.courts || []).length ? `<section class="space-y-3"><h2 class="font-heading text-xl font-bold text-navy-900">Court information</h2><p class="text-sm text-charcoal-600">General guides to the courts mentioned for this kind of matter. They are informational and do not say where your case will be heard.</p><ul class="grid sm:grid-cols-2 gap-3">${s.courts.map((cs) => COURTS.find((c) => c.slug === cs)).filter(Boolean).map((c) => `<li><a href="${courtUrl(c.slug)}" class="block p-4 rounded-lg bg-ivory-100 border border-ivory-200 hover:border-gold-500 text-navy-900 font-semibold">${esc(c.h1)}</a></li>`).join('')}</ul></section>` : ''}

    <section class="p-6 sm:p-8 rounded-xl bg-navy-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
      <div class="text-center sm:text-left"><h2 class="font-heading text-xl font-bold">Discuss this matter</h2><p class="text-sm text-slate-300 mt-1">Consultations at ${SITE.locality}, ${SITE.city} are by prior appointment.</p></div>
      <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"><a href="/contact-us/#appointment" class="btn-gold">Request a consultation</a><a href="${TEL}" class="btn-ghost">Call ${SITE.phoneDisplay}</a></div>
    </section>

    <p class="text-sm text-charcoal-600 leading-relaxed">This page gives general information on the law and is not legal advice on any individual matter. Law and court procedure change, so please take advice on your own facts before acting.</p>
  </article>
  ${sidePanel}
  ${wide ? '</div>' : ''}
</div>`;

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.h1,
    serviceType: s.short,
    description: s.metaDesc,
    provider: { '@id': SITE.url + '/#firm' },
    ...(s.noAreaServed ? {} : { areaServed: { '@type': 'City', name: SITE.city } }),
    url: abs(svcUrl(s.slug)),
  };

  return page({
    title: s.seoTitle || `${s.h1} | ${SITE.name}`,
    desc: s.metaDesc,
    path: svcUrl(s.slug),
    ogImage: s.ogImage || null,
    ogAlt: s.ogAlt || '',
    social: !!s.sideForm,
    schema: [breadcrumbSchema(trail), serviceSchema, ...(s.noFaqSchema ? [] : [faqSchema(s.faqs)])],
  }, body);
}


// ---------- COURT GUIDE PAGES ----------
function courtPage(c) {
  const isHub = c.slug === HUB;
  const trail = isHub ? [['Home', '/'], ['Court guides', courtUrl(HUB)]] : [['Home', '/'], ['Court guides', courtUrl(HUB)], [c.h1, courtUrl(c.slug)]];
  const related = c.related.map((r) => SERVICES.find((x) => x.slug === r)).filter(Boolean);
  const otherCourts = (c.courtLinks || []).map((cs) => COURTS.find((x) => x.slug === cs)).filter(Boolean);
  const h2 = 'font-heading text-2xl font-bold text-navy-900';
  const tag = (n, t) => `<p class="text-xs font-bold uppercase tracking-widest text-gold-700">Part ${n}</p><h2 class="${h2}">${esc(t)}</h2>`;
  const body = `
<section class="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white border-b-4 border-gold-500">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-4">
    <p class="inline-block px-3 py-1 rounded bg-gold-500/20 text-gold-300 text-xs font-bold uppercase tracking-wider">Court information · ${esc(c.district)}</p>
    <h1 class="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold">${esc(c.h1)}</h1>
    <p class="text-slate-200 text-base sm:text-lg max-w-3xl leading-relaxed">${esc(c.subtitle)}</p>
  </div>
</section>
<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
  ${crumbs(trail)}
  <div role="note" class="mb-8 p-4 rounded-lg bg-gold-500/10 border border-gold-500/40 text-sm text-charcoal-800 leading-relaxed flex gap-3">${icon('info', 'w-5 h-5 text-gold-700 shrink-0 mt-0.5')}<p><strong>Please read:</strong> ${esc(COURT_NOTICE)}</p></div>
  <article class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-10">
    <section class="space-y-4">
      ${tag(1, 'Official court-directory information')}
      <p class="text-sm text-charcoal-600">Taken from official court documents and pages reviewed on ${c.reviewed || '8 November 2026'}. Listings change, so check the current official directory. This page gives no address, map or directions.</p>
      ${c.official.map((g) => `<div class="space-y-2"><h3 class="font-heading text-lg font-semibold text-navy-900">${esc(g.h)}</h3><ul class="space-y-2 text-charcoal-800">${g.items.map((i) => `<li class="flex items-start gap-2.5">${icon('check', 'w-4 h-4 text-gold-700 mt-1 shrink-0')}<span>${esc(i)}</span></li>`).join('')}</ul></div>`).join('')}
      <p class="text-sm text-charcoal-700">Official sources: ${c.sources.flatMap((k) => COURT_SOURCES[k]).map(([n, u]) => `<a class="underline text-gold-700 hover:text-navy-900" href="${u}" target="_blank" rel="noopener noreferrer">${esc(n)}</a>`).join(' · ')}</p>
    </section>

    <section class="space-y-4">
      ${tag(2, 'General informational guidance')}
      <div class="space-y-4 text-charcoal-700 leading-relaxed">${c.general.map((t) => `<p>${esc(t)}</p>`).join('')}</div>
      <div class="overflow-x-auto"><table class="w-full text-sm text-left border border-slate-200 rounded-lg"><caption class="sr-only">What kinds of matters these courts generally handle</caption><thead class="bg-ivory-100 text-navy-900"><tr><th scope="col" class="p-3 font-semibold">Kind of matter</th><th scope="col" class="p-3 font-semibold">General position</th></tr></thead><tbody>${c.matters.map(([a, b]) => `<tr class="border-t border-slate-200 align-top"><th scope="row" class="p-3 font-medium text-navy-900">${esc(a)}</th><td class="p-3 text-charcoal-700">${esc(b)}</td></tr>`).join('')}</tbody></table></div>
    </section>

    <section class="space-y-4">
      ${tag(3, 'Case-specific jurisdiction and venue')}
      <div class="space-y-4 text-charcoal-700 leading-relaxed">${c.jurisdiction.map((t) => `<p>${esc(t)}</p>`).join('')}</div>
    </section>

    <section class="p-6 rounded-xl bg-gold-500/10 border border-gold-500/30 space-y-3">
      <h2 class="flex items-center gap-2 font-heading text-lg font-bold text-navy-900">${icon('file-text', 'w-5 h-5 text-gold-700')} <span><span class="block text-xs font-bold uppercase tracking-widest text-gold-700">Part 4</span>What this guide does not state</span></h2>
      <p class="text-sm text-charcoal-700">This guide does not state the following. They depend on the case or on current court records, so check them with the court or your advocate.</p>
      <ul class="space-y-2 text-sm text-charcoal-800">${c.confirm.map((i) => `<li class="flex items-start gap-2.5">${icon('circle-help', 'w-4 h-4 text-gold-700 mt-0.5 shrink-0')}<span>${esc(i)}</span></li>`).join('')}</ul>
    </section>

    ${related.length ? `<section class="space-y-3"><h2 class="font-heading text-xl font-bold text-navy-900">Related legal services</h2><ul class="grid sm:grid-cols-2 gap-3">${related.map((r) => `<li><a href="${svcUrl(r.slug)}" class="block p-4 rounded-lg bg-ivory-100 border border-ivory-200 hover:border-gold-500 text-navy-900 font-semibold">${esc(r.short)}<span class="block text-sm font-normal text-charcoal-600 mt-1">${esc(r.card)}</span></a></li>`).join('')}</ul></section>` : ''}

    ${otherCourts.length ? `<section class="space-y-3"><h2 class="font-heading text-xl font-bold text-navy-900">Other court guides</h2><ul class="flex flex-wrap gap-3">${otherCourts.map((o) => `<li><a href="${courtUrl(o.slug)}" class="inline-block px-4 py-2 rounded-lg border border-ivory-200 bg-ivory-100 hover:border-gold-500 text-navy-900 font-semibold text-sm">${esc(o.short)}</a></li>`).join('')}</ul></section>` : ''}

    <section class="p-6 sm:p-8 rounded-xl bg-navy-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
      <div class="text-center sm:text-left"><h2 class="font-heading text-xl font-bold">Discuss a matter</h2><p class="text-sm text-slate-300 mt-1">Consultations at ${SITE.locality}, ${SITE.city} are by prior appointment. Whether the firm can take up a matter before a particular court is confirmed at that stage.</p></div>
      <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"><a href="/contact-us/#appointment" class="btn-gold">Request a consultation</a><a href="${TEL}" class="btn-ghost">Call ${SITE.phoneDisplay}</a></div>
    </section>

    <p class="text-sm text-charcoal-600 leading-relaxed">This page gives general information and is not legal advice. It does not state that Shasti Law Firm practises before any court named here, and it does not guarantee any result. Please read the <a class="underline hover:text-gold-700" href="/disclaimer/">disclaimer</a>.</p>
  </article>
</div>`;
  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: c.h1,
    description: c.metaDesc,
    url: abs(courtUrl(c.slug)),
    isPartOf: { '@id': SITE.url + '/#website' },
    inLanguage: 'en-IN',
  };
  return page({ title: `${c.h1} | ${SITE.name}`, desc: c.metaDesc, path: courtUrl(c.slug), social: !!c.reviewed, schema: [breadcrumbSchema(trail), webPage] }, body);
}

// ---------- INSIGHTS ----------
function insightsIndex() {
  const trail = [['Home', '/'], ['Legal insights', '/insights/']];
  const body = `
<section class="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white border-b-4 border-gold-500">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16"><h1 class="font-heading text-3xl sm:text-4xl font-bold">Legal insights</h1><p class="mt-3 text-slate-200 max-w-2xl">General information on court procedure and statutory rights in India. These articles are not advice on any individual case.</p></div>
</section>
<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">${crumbs(trail)}<div class="grid grid-cols-1 md:grid-cols-2 gap-6">${POSTS.map(postCard).join('')}</div></div>`;
  return page({
    title: 'Legal Insights | Shasti Law Firm, Chennai',
    desc: 'General information on anticipatory bail, mutual consent divorce and cheque bounce procedure under Indian law, from Shasti Law Firm, Chennai.',
    path: '/insights/',
    schema: [breadcrumbSchema(trail)],
  }, body);
}

function postPage(p) {
  const trail = [['Home', '/'], ['Legal insights', '/insights/'], [p.title, postUrl(p.slug)]];
  const svc = SERVICES.find((s) => s.slug === p.related);
  const content = p.body.map(([t, v]) => {
    if (t === 'p') return `<p>${esc(v)}</p>`;
    if (t === 'h') return `<h2 class="font-heading text-xl font-bold text-navy-900 pt-2">${esc(v)}</h2>`;
    if (t === 'ul') return `<ul class="list-disc pl-6 space-y-1.5">${v.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
    return '';
  }).join('');
  const body = `
<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
  ${crumbs(trail)}
  <article class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10">
    <p class="text-xs font-bold uppercase tracking-wider text-gold-700">${esc(p.category)} · ${p.minutes} min read</p>
    <h1 class="mt-2 font-heading text-3xl sm:text-4xl font-bold text-navy-900 leading-tight">${esc(p.title)}</h1>
    <p class="mt-2 text-sm text-charcoal-600">By ${SITE.name}, ${SITE.city} · Updated ${SITE.lastmod}</p>
    <div class="mt-6 space-y-4 text-charcoal-800 leading-relaxed">${content}</div>
    <aside class="mt-8 p-5 rounded-lg bg-ivory-100 border border-ivory-200 text-sm text-charcoal-700">General information only, not legal advice. Please take advice on your own facts. Related: <a class="font-semibold text-gold-700 underline" href="${svcUrl(svc.slug)}">${esc(svc.short)}</a>.</aside>
    <div class="mt-6 flex flex-col sm:flex-row gap-3"><a href="/contact-us/#appointment" class="btn-gold">Request a consultation</a><a href="/insights/" class="inline-flex items-center gap-2 text-sm font-semibold text-navy-900 hover:text-gold-700">${icon('arrow-left', 'w-4 h-4')} All insights</a></div>
  </article>
</div>`;
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: p.title,
    description: p.metaDesc,
    dateModified: SITE.lastmod,
    mainEntityOfPage: abs(postUrl(p.slug)),
    author: { '@type': 'Organization', name: SITE.name, url: SITE.url + '/' },
    publisher: { '@id': SITE.url + '/#firm' },
  };
  return page({
    title: p.shortTitle + ' | ' + SITE.name,
    desc: p.metaDesc,
    path: postUrl(p.slug),
    ogType: 'article',
    schema: [breadcrumbSchema(trail), article],
  }, body);
}

// ---------- POLICY PAGES ----------
function policyPage({ slug, title, desc, paras }) {
  const trail = [['Home', '/'], [title, `/${slug}/`]];
  const body = `
<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
  ${crumbs(trail)}
  <article class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10">
    <h1 class="font-heading text-3xl font-bold text-navy-900">${esc(title)}</h1>
    <div class="mt-6 space-y-4 text-charcoal-800 leading-relaxed">${paras.map((p) => Array.isArray(p)
      ? `<ul class="list-disc pl-6 space-y-1.5">${p.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`
      : p.startsWith('## ') ? `<h2 class="font-heading text-xl font-bold text-navy-900 pt-2">${esc(p.slice(3))}</h2>` : `<p>${esc(p)}</p>`).join('')}</div>
    <p class="mt-8 text-sm text-charcoal-600">Last updated ${SITE.lastmod}.</p>
  </article>
</div>`;
  return page({ title: `${title} | ${SITE.name}`, desc, path: `/${slug}/`, schema: [breadcrumbSchema(trail)] }, body);
}

const POLICIES = [
  {
    slug: 'disclaimer',
    title: 'Disclaimer',
    desc: 'Disclaimer for the Shasti Law Firm website under the Bar Council of India Rules.',
    paras: [
      'The Bar Council of India Rules do not permit advocates to advertise or solicit work in any manner. This website is not an advertisement or solicitation. It is provided only to give information about Shasti Law Firm and about areas of Indian law, at the visitor’s own request.',
      'By using this website you acknowledge that:',
      [
        'There has been no advertisement, personal communication, solicitation or inducement by the firm or its advocates.',
        'You are seeking information about the firm of your own accord.',
        'The content of this website is general information, is not legal advice or a legal opinion, and should not be relied on as such.',
        'Using this website, sending a message or filling in the request form does not create an advocate-client relationship. That relationship begins only when the firm agrees to act and a Vakalatnama or engagement is signed.',
        'Past or described matters and statutory summaries do not predict or guarantee the result of any other matter.',
      ],
      'Laws change. References to statutes reflect our understanding at the date shown on each page; please take advice on current law and your own facts before acting. Since 1 July 2024 the BNSS, BNS and BSA apply to new criminal proceedings in place of the CrPC, IPC and Indian Evidence Act, and earlier matters may continue under the older codes.',
      'The firm is not responsible for the content of external websites linked from this site.',
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    desc: 'How Shasti Law Firm handles information shared through its website.',
    paras: [
      '## What this website collects',
      'This website does not use cookies, advertising trackers or analytics scripts, and it does not store what you type into the consultation form. Fonts are served from this site.',
      '## The consultation form',
      'When you submit the form, your browser opens WhatsApp with a message prefilled from what you entered. The message is sent only if you press send in WhatsApp. Once sent, it is handled under WhatsApp’s own terms and privacy policy. You can instead call the office on the number shown on this site.',
      'Please do not put sensitive details, such as full case narratives, bank details or identity numbers, in the form or in an initial message.',
      '## How information is used',
      'Details you send to the firm are used to respond to your enquiry and, if you engage the firm, to act for you. They are not sold or used for marketing. Communications between an advocate and client are protected by law (Section 132 of the Bharatiya Sakshya Adhiniyam, 2023, earlier Section 126 of the Indian Evidence Act), subject to its exceptions.',
      '## Third-party content',
      'The contact section shows a map from OpenStreetMap. Loading it may share your IP address with that service. Links to WhatsApp open a service operated by a third party.',
      '## Your choices',
      'To ask the firm to correct or delete details you have sent, contact the office by phone or WhatsApp.',
    ],
  },
  {
    slug: 'terms',
    title: 'Terms of Use',
    desc: 'Terms of use for the Shasti Law Firm website.',
    paras: [
      'The material on this website is general information about Indian law and court procedure in Chennai. It is not legal advice, and you should not act or refrain from acting on it without taking professional advice on your own facts.',
      'We try to keep information accurate and current but do not warrant that it is complete or up to date. The firm is not liable for loss arising from reliance on the content of this website.',
      'The content is the firm’s own. You may read it and share links to it, but may not copy it for commercial use or republish it without permission.',
      'These terms are governed by the laws of India. Courts at Chennai have jurisdiction over any dispute arising from use of this website.',
    ],
  },
];

function notFound() {
  const body = `<div class="max-w-2xl mx-auto px-4 py-24 text-center"><h1 class="font-heading text-4xl font-bold text-navy-900">Page not found</h1><p class="mt-4 text-charcoal-700">The page you are looking for does not exist or has moved.</p><div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center"><a href="/" class="btn-gold">Go to the home page</a><a href="/practice-areas/" class="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-navy-900 text-navy-900 font-semibold text-sm hover:bg-navy-900 hover:text-white">View practice areas</a></div></div>`;
  return page({ title: 'Page not found | ' + SITE.name, desc: 'Page not found.', path: '/404.html', noindex: true }, body);
}

// ---------- build ----------
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, 'assets/fonts'), { recursive: true });

const pages = require('./pages')({ SITE, GROUPS, SERVICES, COURTS, HUB, PAGE_GROUPS, NEW_CODES_NOTE, esc, icon, page, crumbs, breadcrumbSchema, firmSchema, faqList,
  svcUrl, courtUrl, svcByGroup, TEL, WA, abs, consultationForm, groupPageUrl, FAQS_HOME, PROCESS_STEPS, HOW_ITEMS });
const urls = [['/', '1.0']];
write('index.html', homePage());
write('practice-areas/index.html', pages.hubPage()); urls.push(['/practice-areas/', '0.9']);
PAGE_GROUPS.forEach((pg) => { write(`practice-areas/${pg.slug}/index.html`, pages.groupPage(pg)); urls.push([groupPageUrl(pg.slug), '0.8']); });
write('about-us/index.html', pages.aboutPage()); urls.push(['/about-us/', '0.6']);
write('contact-us/index.html', pages.contactPage()); urls.push(['/contact-us/', '0.7']);
write('faqs/index.html', pages.faqPage()); urls.push(['/faqs/', '0.7']);
write('consultation-process/index.html', pages.processPage()); urls.push(['/consultation-process/', '0.6']);
SERVICES.forEach((s) => { write(`services/${s.slug}/index.html`, servicePage(s)); urls.push([svcUrl(s.slug), '0.9']); });
COURTS.forEach((c) => { write(`courts/${c.slug}/index.html`, courtPage(c)); urls.push([courtUrl(c.slug), c.slug === HUB ? '0.8' : '0.6']); });
write('insights/index.html', insightsIndex()); urls.push(['/insights/', '0.7']);
POSTS.forEach((p) => { write(`insights/${p.slug}/index.html`, postPage(p)); urls.push([postUrl(p.slug), '0.7']); });
POLICIES.forEach((p) => { write(`${p.slug}/index.html`, policyPage(p)); urls.push([`/${p.slug}/`, '0.3']); });
write('404.html', notFound());

write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, pr]) => `  <url><loc>${abs(u)}</loc><lastmod>${SITE.lastmod}</lastmod><priority>${pr}</priority></url>`).join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
write('assets/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#101C35"/><g transform="translate(14 14) scale(1.5)" fill="none" stroke="#DFBA47" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></g></svg>`);
fs.copyFileSync(path.join(__dirname, 'src/site.js'), path.join(DIST, 'assets/site.js'));
if (fs.existsSync(path.join(__dirname, 'src/og'))) fs.cpSync(path.join(__dirname, 'src/og'), path.join(DIST, 'assets/og'), { recursive: true });

const fontSrc = [
  ['@fontsource/inter/files', ['inter-latin-400-normal.woff2', 'inter-latin-500-normal.woff2', 'inter-latin-600-normal.woff2', 'inter-latin-700-normal.woff2']],
  ['@fontsource/playfair-display/files', ['playfair-display-latin-600-normal.woff2', 'playfair-display-latin-700-normal.woff2']],
];
fontSrc.forEach(([dir, files]) => files.forEach((f) => fs.copyFileSync(path.join(__dirname, 'node_modules', dir, f), path.join(DIST, 'assets/fonts', f))));

console.log(`Built ${urls.length + 1} pages.`);
