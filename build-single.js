// Bundles dist/ into ONE self-contained HTML file (hash-routed). Run after `npm run build`.
const fs = require('fs');
const path = require('path');
const DIST = path.join(__dirname, 'dist');
const { SERVICES, POSTS, COURTS: ALLC } = require('./data');
const COURTS = ALLC.filter((c) => !c.hold);

const read = (p) => fs.readFileSync(path.join(DIST, p), 'utf8');
const title = (h) => h.match(/<title>([\s\S]*?)<\/title>/)[1];
const mainOf = (h) => h.slice(h.indexOf('<main id="main">') + 16, h.indexOf('</main>'));

const routes = [['home', 'index.html']];
SERVICES.forEach((s) => routes.push([`services/${s.slug}`, `services/${s.slug}/index.html`]));
COURTS.forEach((c) => routes.push([`courts/${c.slug}`, `courts/${c.slug}/index.html`]));
routes.push(['practice-areas', 'practice-areas/index.html']);
['matrimonial-family-law', 'criminal-law', 'civil-litigation-recovery', 'corporate-commercial-law'].forEach((g) => routes.push([`practice-areas/${g}`, `practice-areas/${g}/index.html`]));
routes.push(['about-us', 'about-us/index.html'], ['contact-us', 'contact-us/index.html']);
routes.push(['faqs', 'faqs/index.html'], ['consultation-process', 'consultation-process/index.html']);
routes.push(['insights', 'insights/index.html']);
POSTS.forEach((p) => routes.push([`insights/${p.slug}`, `insights/${p.slug}/index.html`]));
['disclaimer', 'privacy', 'terms'].forEach((x) => routes.push([x, `${x}/index.html`]));
routes.push(['404', '404.html']);

const rewrite = (html) => html
  .replace(/href="\/#([\w-]+)"/g, 'href="#/home/$1"')
  .replace(/href="#(?!main")([\w-]+)"/g, 'href="#/home/$1"')
  .replace(/href="\/(practice-areas\/[\w-]+|practice-areas|about-us|contact-us|faqs|consultation-process)\/(?:#([\w-]+))?"/g, (m, r, a) => `href="#/${r}${a ? '/' + a : ''}"`)
  .replace(/href="\/"/g, 'href="#/home"')
  .replace(/href="\/(services|insights|courts)\/([\w-]+)\/(?:#([\w-]+))?"/g, (m, k, s, a) => `href="#/${k}/${s}${a ? '/' + a : ''}"`)
  .replace(/href="\/(insights|privacy|disclaimer|terms)\/"/g, 'href="#/$1"')
  .replace(/href="\/404\.html"/g, 'href="#/home"');

const home = read('index.html');
const bodyStart = home.indexOf('<body');
const headerHtml = home.slice(bodyStart, home.indexOf('<main id="main">') + 16);
const footerHtml = home.slice(home.indexOf('</main>'), home.indexOf('<script src="/assets/site.js"'));

const views = routes.map(([r, f]) => {
  const h = read(f);
  return `<section data-view="${r}" data-title="${title(h).replace(/"/g, '&quot;')}" hidden>${mainOf(h)}</section>`;
}).join('\n');

// inline fonts + css
let css = read('assets/styles.css');
css = css.replace(/url\(\/assets\/fonts\/([\w.-]+)\)/g, (_, f) => `url(data:font/woff2;base64,${fs.readFileSync(path.join(DIST, 'assets/fonts', f)).toString('base64')})`);
css = css.replace(/url\('\/assets\/fonts\/([\w.-]+)'\)/g, (_, f) => `url(data:font/woff2;base64,${fs.readFileSync(path.join(DIST, 'assets/fonts', f)).toString('base64')})`);

const ld = (home.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/) || [''])[0];
// Homepage head metadata is taken from the built homepage (dist/index.html), which build.js generates from the one
// authoritative configuration. Nothing is hard-coded here, so the standalone file cannot drift from the deployed site.
const homeHead = home.slice(0, home.indexOf('</head>'));
const homeTitle = homeHead.match(/<title>([\s\S]*?)<\/title>/)[1];
const homeMeta = [
  /<meta name="description"[^>]*>/, /<link rel="canonical"[^>]*>/, /<meta name="robots"[^>]*>/,
  /<meta property="og:[^>]*>/g, /<meta name="twitter:[^>]*>/g,
].map((re) => homeHead.match(re) || []).reduce((a, b) => a.concat(b), []).join('\n');
const favicon = 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(DIST, 'assets/favicon.svg')).toString('base64');

const router = `
(function(){
  var views=[].slice.call(document.querySelectorAll('[data-view]'));
  function show(){
    var h=location.hash;
    if(h && h.indexOf('#/')!==0) return;           // plain anchors such as #main
    var p=h.replace(/^#\\/?/,'')||'home', anchor='', best=null;
    views.forEach(function(x){var n=x.getAttribute('data-view'); if((p===n||p.indexOf(n+'/')===0)&&(!best||n.length>best.getAttribute('data-view').length)) best=x;});
    if(best){ var bn=best.getAttribute('data-view'); anchor=p.slice(bn.length+1); p=bn; }
    var v=best || views.filter(function(x){return x.getAttribute('data-view')==='404';})[0];
    views.forEach(function(x){x.hidden=(x!==v);});
    document.title=v.getAttribute('data-title');
    var d=document.getElementById('drawer'); if(d&&!d.hidden){d.hidden=true;document.body.style.overflow='';}
    var el=anchor&&v.querySelector('[id="'+anchor+'"]');
    if(el) el.scrollIntoView(); else window.scrollTo(0,0);
  }
  window.addEventListener('hashchange',show); show();
})();`;

const out = `<!DOCTYPE html>
<html lang="en-IN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${homeTitle}</title>
${homeMeta}
<meta name="theme-color" content="#101C35">
<link rel="icon" href="${favicon}">
<style>${css}</style>
${ld}
</head>
${rewrite(headerHtml)}
${rewrite(views)}
${rewrite(footerHtml)}
<script>${fs.readFileSync(path.join(__dirname, 'src/site.js'), 'utf8')}</script>
<script>${router}</script>
</body>
</html>
`;
fs.writeFileSync(path.join(__dirname, 'shasti-law-firm-website.html'), out);
console.log('single file', (out.length / 1024).toFixed(0) + ' KB,', routes.length, 'views');
