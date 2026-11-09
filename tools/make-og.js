// Renders 1200x630 Open Graph images into src/og/ in the site's navy/gold style.
// Usage: npm run build (so dist/assets/fonts exists), then: node tools/make-og.js [slug ...]
// Requires playwright (pre-installed in the build environment). Fonts are the site's own self-hosted woff2 files.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const FONTS = path.join(__dirname, '..', 'dist', 'assets', 'fonts');
const OUT = path.join(__dirname, '..', 'src', 'og');
const font = (f) => 'file://' + path.join(FONTS, f);

// slug, category pill, title text before the gold word(s), gold word(s)
const PAGES = [
  ['criminal-lawyer-tambaram', 'Criminal law', 'Criminal Lawyer in', 'Tambaram'],
  ['criminal-lawyer-alandur', 'Criminal law', 'Criminal Lawyer in', 'Alandur'],
  ['divorce-lawyer-alandur', 'Divorce law', 'Divorce Lawyer in', 'Alandur'],
  ['domestic-violence-lawyer-tambaram', 'Domestic Violence Act', 'Domestic Violence Lawyer in', 'Tambaram'],
  ['bail-lawyer-egmore', 'Bail', 'Bail Lawyer in', 'Egmore'],
  ['anticipatory-bail-lawyer-chengalpattu', 'Anticipatory bail', 'Anticipatory Bail Lawyer in', 'Chengalpattu'],
  ['criminal-lawyer-egmore', 'Criminal law', 'Criminal Lawyer in', 'Egmore'],
  ['criminal-lawyer-saidapet', 'Criminal law', 'Criminal Lawyer in', 'Saidapet'],
  ['criminal-lawyer-chengalpattu', 'Criminal law', 'Criminal Lawyer in', 'Chengalpattu'],
  ['family-court-lawyer-chengalpattu', 'Family law', 'Family Court Lawyer in', 'Chengalpattu'],
  ['criminal-lawyer-poonamallee', 'Criminal law', 'Criminal Lawyer in', 'Poonamallee'],
  ['bail-lawyer-poonamallee', 'Bail', 'Bail Lawyer in', 'Poonamallee'],
  ['anticipatory-bail-lawyer-poonamallee', 'Anticipatory bail', 'Anticipatory Bail Lawyer in', 'Poonamallee'],
  ['divorce-lawyer-poonamallee', 'Divorce law', 'Divorce Lawyer in', 'Poonamallee'],
  ['domestic-violence-lawyer-poonamallee', 'Domestic Violence Act', 'Domestic Violence Lawyer in', 'Poonamallee'],
  ['criminal-lawyer-pallavaram', 'Criminal law', 'Criminal Lawyer in', 'Pallavaram'],
  ['divorce-lawyer-pallavaram', 'Divorce law', 'Divorce Lawyer in', 'Pallavaram'],
  ['domestic-violence-lawyer-pallavaram', 'Domestic Violence Act', 'Domestic Violence Lawyer in', 'Pallavaram'],
  ['criminal-lawyer-kanchipuram', 'Criminal law', 'Criminal Lawyer in', 'Kanchipuram'],
  ['bail-lawyer-kanchipuram', 'Bail', 'Bail Lawyer in', 'Kanchipuram'],
  ['anticipatory-bail-lawyer-kanchipuram', 'Anticipatory bail', 'Anticipatory Bail Lawyer in', 'Kanchipuram'],
  ['divorce-lawyer-kanchipuram', 'Divorce law', 'Divorce Lawyer in', 'Kanchipuram'],
  ['domestic-violence-lawyer-kanchipuram', 'Domestic Violence Act', 'Domestic Violence Lawyer in', 'Kanchipuram'],
  ['high-court-bail-lawyer-chennai', 'Bail', 'Bail Lawyer,', 'Madras High Court'],
  ['family-court-appeal-lawyer-madras-high-court', 'Family law', 'Family Court Appeals,', 'Madras High Court'],
  ['divorce-appeal-lawyer-madras-high-court', 'Divorce law', 'Divorce Appeals,', 'Madras High Court'],
  ['civil-appeal-lawyer-madras-high-court', 'Civil law', 'Civil Appeals,', 'Madras High Court'],
  ['corporate-commercial-lawyer-madras-high-court', 'Commercial law', 'Commercial Disputes,', 'Madras High Court'],
];

const html = ([, pill, a, b]) => `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:PF;font-weight:700;src:url(${font('playfair-display-latin-700-normal.woff2')})}
@font-face{font-family:PF;font-weight:600;src:url(${font('playfair-display-latin-600-normal.woff2')})}
@font-face{font-family:IN;font-weight:500;src:url(${font('inter-latin-500-normal.woff2')})}
@font-face{font-family:IN;font-weight:600;src:url(${font('inter-latin-600-normal.woff2')})}
@font-face{font-family:IN;font-weight:700;src:url(${font('inter-latin-700-normal.woff2')})}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;position:relative;overflow:hidden;font-family:IN;color:#fff;
background:radial-gradient(circle at 85% 100%,#18284d 0,transparent 55%),linear-gradient(135deg,#0d1730,#12213F 60%,#16254a)}
.dots{position:absolute;inset:0;background-image:radial-gradient(rgba(201,162,39,.16) 1px,transparent 1px);background-size:24px 24px;opacity:.45}
.logo{position:absolute;left:80px;top:64px;display:flex;align-items:center;gap:22px}
.ring{width:76px;height:76px;border-radius:50%;border:2px solid rgba(201,162,39,.7);display:flex;align-items:center;justify-content:center}
.brand{font-family:PF;font-weight:600;font-size:38px;line-height:1.1}
.sub{font-weight:700;font-size:15px;letter-spacing:.2em;color:#d9b743;margin-top:6px}
.pill{position:absolute;left:80px;top:260px;padding:10px 18px;border-radius:999px;border:1px solid rgba(201,162,39,.5);background:rgba(201,162,39,.14);color:#e2c15a;font-weight:700;font-size:17px;letter-spacing:.14em;text-transform:uppercase}
h1{position:absolute;left:80px;right:80px;top:330px;font-family:PF;font-weight:700;font-size:70px;line-height:1.12}
h1 span{color:#d9b743}
.rule{position:absolute;left:80px;right:80px;top:516px;height:2px;background:#C9A227}
.foot{position:absolute;left:80px;right:80px;top:538px;display:flex;justify-content:space-between;font-size:22px;color:#cbd5e1;font-weight:500}
</style><body><div class="dots"></div>
<div class="logo"><div class="ring"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#d9b743" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M5 21h14M7 7h10M5 7l-3 7a4 4 0 0 0 6 0L5 7zm14 0l-3 7a4 4 0 0 0 6 0l-3-7z"/></svg></div><div><div class="brand">Shasti Law Firm</div><div class="sub">ADVOCATES · CHENNAI</div></div></div>
<div class="pill">${pill}</div>
<h1>${a} <span>${b}</span></h1>
<div class="rule"></div>
<div class="foot"><span>Consultations at West Mambalam, Chennai</span><span>By appointment</span></div></body>`;

(async () => {
  const want = process.argv.slice(2);
  const list = PAGES.filter((p) => !want.length || want.includes(p[0]));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const p of list) {
    const page = await ctx.newPage();
    const tmp = path.join(OUT, `.tmp-${p[0]}.html`);
    fs.writeFileSync(tmp, html(p));
    await page.goto('file://' + tmp);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(OUT, `${p[0]}.png`) });
    fs.unlinkSync(tmp);
    await page.close();
    console.log('og', p[0]);
  }
  await browser.close();
})();
