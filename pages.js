// Dedicated pages: Practice Areas hub, four practice-group pages, About Us, Contact Us.
// Built from the same data registry and helpers as build.js; no copy here makes a claim that is not already on the site.
module.exports = function makePages(ctx) {
  const { SITE, GROUPS, SERVICES, COURTS, HUB, PAGE_GROUPS, NEW_CODES_NOTE, esc, icon, page, crumbs, breadcrumbSchema, firmSchema, faqList,
    svcUrl, courtUrl, svcByGroup, TEL, WA, abs, consultationForm, groupPageUrl, FAQS_HOME, PROCESS_STEPS, HOW_ITEMS } = ctx;

  const APPT = '/contact-us/#appointment';
  const svc = (slug) => SERVICES.find((s) => s.slug === slug);
  const groupServices = (pg) => pg.ids.flatMap((id) => svcByGroup(id));
  const gById = (id) => GROUPS.find((g) => g.id === id);
  const lcFirst = (t) => t.charAt(0).toLowerCase() + t.slice(1);
  const nameList = (arr) => arr.length < 2 ? arr.join('') : arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1];

  // ---------- shared blocks ----------
  const hero = ({ eyebrow, h1, lead, note }) => `
<section class="relative overflow-hidden bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white border-b-4 border-gold-500">
  <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#c9a227_1px,transparent_1px)] [background-size:24px_24px]" aria-hidden="true"></div>
  <div class="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-4">
    <p class="inline-block px-3 py-1 rounded bg-gold-500/20 text-gold-300 text-xs font-bold uppercase tracking-wider">${esc(eyebrow)}</p>
    <h1 class="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">${esc(h1)}</h1>
    <p class="text-slate-200 text-base sm:text-lg max-w-3xl leading-relaxed">${esc(lead)}</p>
    ${note ? `<p class="text-sm text-gold-300 font-medium">${esc(note)}</p>` : ''}
    <div class="flex flex-col sm:flex-row gap-3 pt-2"><a href="${APPT}" class="btn-gold">${icon('calendar', 'w-4 h-4')} Request a consultation</a><a href="${TEL}" class="btn-ghost">${icon('phone', 'w-4 h-4 text-gold-400')} Call ${SITE.phoneDisplay}</a></div>
  </div>
</section>`;

  const h2 = (t, sub) => `<div class="max-w-3xl space-y-2"><h2 class="font-heading text-2xl sm:text-3xl font-bold text-navy-900">${esc(t)}</h2>${sub ? `<p class="text-charcoal-700 leading-relaxed">${esc(sub)}</p>` : ''}</div>`;

  const ctaBand = (title, text) => `
<section class="py-12 sm:py-16 bg-ivory-100">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="p-6 sm:p-10 rounded-2xl bg-navy-950 text-white border border-gold-500/40 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="text-center md:text-left max-w-xl"><h2 class="font-heading text-2xl font-bold">${esc(title)}</h2><p class="text-sm text-slate-300 mt-2 leading-relaxed">${esc(text)}</p></div>
      <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0"><a href="${APPT}" class="btn-gold">${icon('calendar', 'w-4 h-4')} Request a consultation</a><a href="${TEL}" class="btn-ghost">${icon('phone', 'w-4 h-4 text-gold-400')} ${SITE.phoneDisplay}</a></div>
    </div>
  </div>
</section>`;

  const faqLinked = (items) => items.map((f) => `
  <details class="faq bg-white rounded-xl border border-slate-200 shadow-sm">
    <summary class="cursor-pointer px-5 py-4 flex items-center justify-between gap-4 font-heading font-semibold text-navy-900 text-base">
      <span>${esc(f.q)}</span>${icon('plus', 'faq-icon w-5 h-5 text-gold-700 shrink-0 transition-transform')}
    </summary>
    <div class="px-5 pb-5 pt-1 text-sm text-charcoal-700 leading-relaxed">${esc(f.a)}${f.link ? ` <a href="${f.link[1]}" class="font-semibold text-gold-700 underline hover:text-navy-900">${esc(f.link[0])}</a>` : ''}</div>
  </details>`).join('');

  const faqSection = (items, title = 'Frequently asked questions') => `
<section class="py-12 sm:py-16 bg-white border-t border-ivory-200">
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
    <h2 class="font-heading text-2xl sm:text-3xl font-bold text-navy-900 text-center">${esc(title)}</h2>
    <div class="space-y-3">${faqLinked(items)}</div>
  </div>
</section>`;

  const chips = (list) => `<ul class="flex flex-wrap gap-2.5">${list.map(([label, url]) => `<li><a href="${url}" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-navy-900/20 text-sm font-medium text-navy-900 hover:border-gold-500 hover:text-gold-700 transition-colors">${icon('search', 'w-3.5 h-3.5 text-gold-700')}${esc(label)}</a></li>`).join('')}</ul>`;

  const relatedSection = (list) => `
<section class="py-12 sm:py-14 bg-ivory-100 border-t border-ivory-200">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
    <h2 class="font-heading text-xl sm:text-2xl font-bold text-navy-900">Related searches</h2>
    <p class="text-sm text-charcoal-700 max-w-2xl">Other pages on this site that people reading about these matters often look for.</p>
    ${chips(list)}
  </div>
</section>`;

  // Nearby areas: only places the site already supports (office locality, Chennai, and the existing Tambaram and Saidapet pages).
  // Other localities were removed because nothing on the site confirms them; they are listed for owner approval in the QA report.
  const nearbySection = (extra = []) => `
<section class="py-12 sm:py-14 bg-white border-t border-ivory-200">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
    <h2 class="font-heading text-xl sm:text-2xl font-bold text-navy-900">Where we are and who we see</h2>
    <p class="text-charcoal-700 leading-relaxed max-w-3xl">The firm’s only office is in ${SITE.locality}, ${SITE.city}. Clients from other parts of ${SITE.city} and from nearby areas can request a consultation, which is held by prior appointment at that office. The exact address is shared when an appointment is confirmed.</p>
    ${extra.length ? `<p class="text-sm text-charcoal-700 pt-1">Guides for clients from nearby areas: ${extra.map(([l, u]) => `<a href="${u}" class="font-semibold text-gold-700 underline hover:text-navy-900">${esc(l)}</a>`).join(' · ')}</p>` : ''}
  </div>
</section>`;

  const shell = (inner) => `<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">${inner}</div>`;

  // LegalService node for the page; the firm itself is defined once with the same @id on every page.
  const legalService = (extra = {}) => ({ ...firmSchema(), ...extra });
  const webPage = (type, name, desc, p, extra = {}) => ({
    '@context': 'https://schema.org', '@type': type, '@id': abs(p) + '#webpage', url: abs(p), name, description: desc, inLanguage: 'en-IN',
    isPartOf: { '@id': SITE.url + '/#website' }, about: { '@id': SITE.url + '/#firm' }, ...extra,
  });

  const stdFaqs = {
    appt: { q: 'Do I need an appointment?', a: `Yes. Consultations at ${SITE.locality}, ${SITE.city} are by prior appointment. Call ${SITE.phoneDisplay}, message the office on WhatsApp or use the request form on the Contact page.`, link: ['Contact page', '/contact-us/'] },
    promise: { q: 'Can the firm promise how a case will end?', a: 'No. Outcomes depend on the facts, the evidence and the court’s discretion, and the Bar Council of India Rules do not permit advocates to promise results. At a consultation the options, risks and likely steps are explained.' },
  };

  // ---------- practice-group page copy ----------
  const COPY = {
    'matrimonial-family-law': {
      eyebrow: 'Practice group 1',
      title: 'Matrimonial & Family Law in Chennai | Shasti Law Firm',
      desc: 'Divorce, maintenance, child custody, domestic violence and Family Court matters at Shasti Law Firm, West Mambalam, Chennai. By appointment.',
      h1: 'Matrimonial & Family Law Advocates in Chennai',
      lead: 'Mutual consent and contested divorce, maintenance, child custody, domestic violence matters and Family Court procedure, with consultations at our West Mambalam office by appointment.',
      intro: [
        'Matrimonial disputes involve family, money, children and, often, urgent dates. This practice group brings together the proceedings that arise when a marriage ends or is in dispute, so that each question can be taken up in the right forum and in a sensible order.',
        'Select a service below for the legal framework, the documents usually needed and the general procedure. If you are not sure which one applies, the office can help you place the matter at a consultation.',
      ],
      approach: [
        ['file-text', 'Facts and documents first', 'We begin with the marriage records, any notices or orders already received, and the dates that matter, so advice rests on the record.'],
        ['users', 'Agreed or contested', 'Where both spouses agree, the joint route and its settlement terms are explained. Where they do not, the contested remedies and their risks are explained.'],
        ['lock', 'Sensitive details stay confidential', 'Family matters are personal. Communications between an advocate and client are protected by law, subject to its exceptions.'],
        ['shield', 'Honest expectations', 'Timelines and results depend on the facts, the evidence and the court. None can be guaranteed.'],
      ],
      extraLinks: [['Family Court Lawyer Saidapet', svcUrl('family-court-lawyer-saidapet')], ['Family Court Lawyer Tambaram', svcUrl('family-court-lawyer-tambaram')], ['Divorce Lawyer Tambaram', svcUrl('divorce-lawyer-tambaram')], ['Divorce Lawyer Alandur', svcUrl('divorce-lawyer-alandur')], ['Domestic Violence Lawyer Tambaram', svcUrl('domestic-violence-lawyer-tambaram')], ['Family Court Lawyer Chengalpattu', svcUrl('family-court-lawyer-chengalpattu')]],
    },
    'criminal-law': {
      extraLinks: [['Criminal Lawyer Tambaram', svcUrl('criminal-lawyer-tambaram')], ['Criminal Lawyer Alandur', svcUrl('criminal-lawyer-alandur')], ['Criminal Lawyer Egmore', svcUrl('criminal-lawyer-egmore')], ['Bail Lawyer Egmore', svcUrl('bail-lawyer-egmore')], ['Criminal Lawyer Saidapet', svcUrl('criminal-lawyer-saidapet')], ['Criminal Lawyer Chengalpattu', svcUrl('criminal-lawyer-chengalpattu')], ['Anticipatory Bail Lawyer Chengalpattu', svcUrl('anticipatory-bail-lawyer-chengalpattu')]],
      eyebrow: 'Practice group 2',
      title: 'Criminal Law and Bail in Chennai | Shasti Law Firm',
      desc: 'Anticipatory bail, regular bail, criminal defence and High Court criminal matters at Shasti Law Firm, West Mambalam, Chennai. By appointment.',
      h1: 'Criminal Law Advocates in Chennai',
      lead: 'Anticipatory bail, regular bail, criminal defence and High Court criminal matters, with advice on the BNSS, BNS and BSA that now govern new criminal proceedings.',
      intro: [
        'A notice, a summons, an FIR or an arrest each calls for a different step, so the first task in any criminal matter is to understand exactly where it stands and which dates are running.',
        'The services below separate protection before arrest, bail after arrest, defence at trial and petitions before the High Court. Each page sets out the framework, the documents usually needed and the general procedure.',
      ],
      approach: [
        ['clock', 'Understand the stage', 'We first establish whether the matter is at the notice, FIR, arrest, bail, trial or appeal stage, and what dates are pending.'],
        ['file-text', 'Read the record', 'The FIR, notices, remand or bail orders and any earlier court papers are reviewed before options are discussed.'],
        ['message-circle', 'Options and risks, plainly', 'The remedies available, the forum, the risks and the likely next steps are explained in plain language.'],
        ['shield', 'No promises', 'Bail and trial outcomes depend on the facts and the court’s discretion. We do not guarantee results.'],
      ],
      note: true,
    },
    'civil-litigation-recovery': {
      eyebrow: 'Practice group 3',
      title: 'Civil Litigation & Recovery in Chennai | Shasti Law Firm',
      desc: 'Legal notices, money recovery, civil suits and cheque bounce (Section 138 NI Act) matters at Shasti Law Firm in Chennai. By appointment.',
      h1: 'Civil Litigation & Recovery Advocates in Chennai',
      lead: 'Legal notices, money recovery, civil litigation and cheque dishonour cases under Section 138 of the Negotiable Instruments Act, from first notice to filing and execution.',
      intro: [
        'Disputes over money and property turn on documents and dates: the agreement, the cheque and bank return memo, the notice sent and the reply received. This practice group covers the steps from a first legal notice through to filing and, where a decree is obtained, execution.',
        'Cheque dishonour is an offence under Section 138 of the Negotiable Instruments Act and is pursued as a complaint before a Magistrate court, with strict statutory timelines. It is grouped here with recovery work because it usually concerns an unpaid debt, and it is set out separately below. Each service page explains the framework, the documents usually needed and the general procedure.',
      ],
      approach: [
        ['file-check', 'Documents and dates', 'Agreements, cheques, bank memos, ledgers and notices are reviewed together with the limitation and statutory time limits that apply.'],
        ['send', 'Notice first, where appropriate', 'A demand notice, or a reply to one, is drafted where the matter calls for it, with attention to the time limits that apply.'],
        ['landmark', 'The right forum', 'The remedy, the forum and the cost of proceeding are discussed so you can decide whether and how to go ahead.'],
        ['shield', 'No promises', 'Recovery depends on the evidence, the defences raised and the court’s decision. We do not guarantee results.'],
      ],
    },
    'corporate-commercial-law': {
      eyebrow: 'Practice group 4',
      title: 'Corporate & Commercial Law in Chennai | Shasti Law Firm',
      desc: 'Arbitration and commercial dispute work at Shasti Law Firm, West Mambalam, Chennai. Consultations by appointment.',
      h1: 'Corporate & Commercial Law Advocates in Chennai',
      lead: 'Arbitration, pre-institution mediation and commercial dispute work for businesses and professionals, under the Arbitration and Conciliation Act, 1996 and the Commercial Courts Act, 2015.',
      intro: [
        'Commercial disputes usually begin with a contract. The first questions are what the contract says about resolving disputes, what notice has been given and which time limits apply, and these shape the choice between arbitration and a commercial suit.',
        'This practice group is deliberately focused: it covers arbitration and commercial litigation, including the pre-institution mediation step that applies to many commercial suits. The two service pages explain the framework and the general procedure.',
      ],
      approach: [
        ['file-text', 'Start with the contract', 'The agreement, its dispute clause, correspondence and the notices exchanged are reviewed before any forum is chosen.'],
        ['scale', 'Arbitration or court', 'Where an arbitration clause exists, we explain how it operates; where it does not, the commercial court route and its steps are explained.'],
        ['clock', 'Time limits matter', 'Limitation and procedural time limits are identified at the outset so that rights are not lost by delay.'],
        ['shield', 'No promises', 'Commercial results depend on the contract, the evidence and the tribunal or court. We do not guarantee outcomes.'],
      ],
    },
  };

  // ---------- Practice Areas hub ----------
  function hubPage() {
    const p = '/practice-areas/';
    const title = 'Legal Practice Areas in Chennai | Shasti Law Firm';
    const desc = 'Browse the practice areas of Shasti Law Firm in West Mambalam, Chennai: family, criminal, civil and recovery, and commercial law. Consultations by appointment.';
    const trail = [['Home', '/'], ['Practice areas', p]];
    const BOX = [
      { box: 'bg-[#F8F5EF] border-[#D9C27A]', edge: 'hover:border-[#C9A227]' },
      { box: 'bg-[#EEF2F7] border-[#12213F]', edge: 'hover:border-[#C9A227]' },
      { box: 'bg-white border-[#243B64]', edge: 'hover:border-[#C9A227]' },
      { box: 'bg-[#F4F6F9] border-[#12213F]', edge: 'hover:border-[#C9A227]' },
    ];
    const groupBlocks = PAGE_GROUPS.map((pg, i) => {
      const list = groupServices(pg);
      const blurb = pg.ids.map((id) => gById(id).blurb).join(' ');
      return `
      <article class="flex flex-col rounded-2xl border-2 ${BOX[i].box} p-6 sm:p-8 shadow-sm">
        <div class="flex items-center gap-4">
          <span class="w-12 h-12 rounded-xl bg-[#12213F] text-[#C9A227] flex items-center justify-center shrink-0">${icon(pg.icon, 'w-6 h-6')}</span>
          <div><div class="text-xs font-bold uppercase tracking-widest text-gold-700">Practice group ${i + 1}</div><h3 class="font-heading text-2xl font-bold text-navy-900"><a href="${groupPageUrl(pg.slug)}" class="hover:text-gold-700">${esc(pg.name)}</a></h3></div>
        </div>
        <p class="mt-4 text-sm text-charcoal-700 leading-relaxed">${esc(blurb)}</p>
        <ul class="mt-5 space-y-1.5 text-sm flex-1">${list.map((s) => `<li class="flex items-start gap-2">${icon('check', 'w-4 h-4 text-gold-700 mt-0.5 shrink-0')}<a href="${svcUrl(s.slug)}" class="text-navy-900 font-medium hover:text-gold-700 hover:underline">${esc(s.short)}</a></li>`).join('')}</ul>
        <a href="${groupPageUrl(pg.slug)}" class="mt-6 inline-flex items-center justify-between gap-3 px-5 py-3 rounded-lg bg-[#12213F] text-white text-sm font-semibold hover:bg-navy-800 border-2 border-transparent ${BOX[i].edge} transition-colors">Explore ${esc(pg.name)} <span class="text-gold-300">${list.length} services</span>${icon('arrow-right', 'w-4 h-4 text-gold-300')}</a>
      </article>`;
    }).join('');

    const finder = [
      ['I fear arrest in a case', 'anticipatory-bail-advocate-chennai'],
      ['I have been arrested', 'regular-bail-lawyer-chennai'],
      ['A cheque has bounced', 'cheque-bounce-advocate-chennai'],
      ['We both want a divorce', 'mutual-divorce-lawyer-chennai'],
      ['The divorce is contested', 'contested-divorce-lawyer-chennai'],
      ['I need to send or reply to a legal notice', 'legal-notice-advocate-chennai'],
      ['I am owed money', 'money-recovery-advocate-chennai'],
      ['A contract has an arbitration clause', 'arbitration-lawyer-chennai'],
    ];
    const faqs = [
      { q: 'How are the practice areas organised?', a: 'The firm’s work is organised into four groups: Matrimonial & Family Law, Criminal Law, Civil Litigation & Recovery, and Corporate & Commercial Law. Each group has its own page, which links to a page for every service within it.' },
      { q: 'Where do cheque bounce cases fit?', a: 'Cheque dishonour matters under Section 138 of the Negotiable Instruments Act are shown within Civil Litigation & Recovery because they usually concern an unpaid debt. Legally they are complaints before a Magistrate court with a strict statutory notice process.', link: ['See Civil Litigation & Recovery', groupPageUrl('civil-litigation-recovery') + '#cheque-bounce-section-138'] },
      { q: 'I am not sure which practice area applies. What should I do?', a: 'Use the quick guide above, or contact the office. Many matters touch more than one area, and the consultation is where the right forum and order of steps are worked out.' },
      stdFaqs.appt,
      stdFaqs.promise,
    ];
    const related = [
      ...finder.map(([, slug]) => [svc(slug).short, svcUrl(slug)]),
      ['Family Court Advocate Chennai', svcUrl('family-court-advocate-chennai')],
      ['Domestic Violence Lawyer Chennai', svcUrl('domestic-violence-lawyer-chennai')],
      ['Chennai courts guide', courtUrl(HUB)],
    ];
    const body = `${hero({ eyebrow: 'Practice areas', h1: 'Legal Practice Areas of Shasti Law Firm in Chennai', lead: 'Matrimonial and family law, criminal defence, civil litigation and recovery, and corporate and commercial law. Each group below links to its own page and to a page for every service.' })}
<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">${crumbs(trail)}</div>
<section class="pb-12 sm:pb-16 bg-white">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
    ${h2('How the firm’s work is organised')}
    <p class="text-charcoal-700 leading-relaxed max-w-3xl">${SITE.name} is based in ${SITE.locality}, ${SITE.city}. Its work falls into four practice groups. Open a group for an overview of what it covers, the documents usually needed and the questions people ask, or go straight to a service.</p>
    <div class="grid md:grid-cols-2 gap-6 pt-4">${groupBlocks}</div>
  </div>
</section>
<section class="py-12 sm:py-16 bg-ivory-100 border-y border-ivory-200">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
    ${h2('Which service might apply to me?', 'A quick guide to where to start reading. It is general orientation, not advice on your facts.')}
    <ul class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">${finder.map(([q, slug]) => `<li><a href="${svcUrl(slug)}" class="group block h-full p-4 rounded-xl bg-white border-2 border-navy-900/15 hover:border-gold-500 transition-colors"><span class="block text-sm text-charcoal-700">${esc(q)}</span><span class="mt-2 flex items-center justify-between gap-2 font-heading font-bold text-navy-900 group-hover:text-gold-700">${esc(svc(slug).short)}${icon('arrow-right', 'w-4 h-4 text-gold-700 shrink-0')}</span></a></li>`).join('')}</ul>
  </div>
</section>
${faqSection(faqs)}
${relatedSection(related)}
${nearbySection()}
${ctaBand('Discuss your matter', `Consultations at ${SITE.locality}, ${SITE.city} are by prior appointment. Send a request or call the office.`)}`;
    return page({ title, desc, path: p, social: true, schema: [
      breadcrumbSchema(trail),
      webPage('CollectionPage', 'Legal Practice Areas of Shasti Law Firm in Chennai', desc, p, { mainEntity: { '@type': 'ItemList', itemListElement: PAGE_GROUPS.map((pg, i) => ({ '@type': 'ListItem', position: i + 1, name: pg.name, url: abs(groupPageUrl(pg.slug)) })) } }),
      legalService({ hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Practice areas', itemListElement: PAGE_GROUPS.map((pg) => ({ '@type': 'OfferCatalog', name: pg.name, url: abs(groupPageUrl(pg.slug)) })) } }),
    ] }, body);
  }

  // ---------- practice-group pages ----------
  function groupPage(pg) {
    const c = COPY[pg.slug];
    const p = groupPageUrl(pg.slug);
    const trail = [['Home', '/'], ['Practice areas', '/practice-areas/'], [pg.name, p]];
    const list = groupServices(pg);
    const docs = [];
    list.forEach((s) => s.docs.forEach((d) => { if (!docs.some((x) => x.toLowerCase() === d.toLowerCase())) docs.push(d); }));
    const topDocs = docs.slice(0, 8);
    const chipsList = [...new Set(list.map((s) => s.chip))];

    const card = (s, i) => `<li><a href="${svcUrl(s.slug)}" class="group relative flex flex-col justify-between h-full p-5 sm:p-6 rounded-2xl bg-white border-2 border-t-4 border-[#12213F] border-t-[#C9A227] shadow-sm hover:shadow-lg hover:-translate-y-1 motion-reduce:transform-none transition duration-200 focus-visible:ring-4 focus-visible:ring-[#C9A227]/50">
        <div><h3 class="font-heading text-xl font-bold text-navy-900 group-hover:text-gold-700">${esc(s.short)}</h3><p class="mt-3 text-sm text-charcoal-700 leading-relaxed">${esc(s.card)}</p></div>
        <div class="mt-5 pt-3 border-t border-black/10 flex items-center justify-between gap-3 text-sm"><span class="font-semibold text-navy-900 group-hover:text-gold-700 flex items-center gap-1.5 whitespace-nowrap shrink-0">Read more <span class="w-6 h-6 rounded-full bg-[#12213F] text-[#C9A227] flex items-center justify-center">${icon('arrow-right', 'w-3.5 h-3.5')}</span></span><span class="text-xs text-charcoal-600 text-right">${esc(s.chip)}</span></div>
      </a></li>`;

    // The cheque-bounce sub-block keeps its own heading inside the Civil group page.
    const servicesHtml = pg.ids.map((id, bi) => {
      const items = svcByGroup(id);
      const g = gById(id);
      const sub = pg.ids.length > 1;
      return `<div ${id === 'B' ? 'id="cheque-bounce-section-138" class="scroll-mt-24 space-y-4"' : 'class="space-y-4"'}>${sub ? `<div><h3 class="font-heading text-xl font-bold text-navy-900">${esc(id === 'B' ? 'Cheque bounce & Section 138 NI Act' : 'Civil litigation & money recovery')}</h3><p class="text-sm text-charcoal-700 mt-1 max-w-3xl">${esc(g.blurb)}</p></div>` : ''}<ul class="grid sm:grid-cols-2 ${items.length > 3 ? 'lg:grid-cols-3' : ''} gap-4">${items.map(card).join('')}</ul></div>`;
    }).join('');

    const serviceFaqs = [];
    list.forEach((s) => { if (serviceFaqs.length < 2 && s.faqs[0]) serviceFaqs.push({ q: s.faqs[0].q, a: s.faqs[0].a, link: [`Read the ${s.short} page`, svcUrl(s.slug)] }); });
    const faqs = [
      { q: `Which matters does the ${pg.name} practice cover?`, a: `This group covers ${nameList(list.map((s) => s.short))}. Each has its own page with the legal framework, documents and general procedure.` },
      { q: 'What should I bring to a first consultation?', a: `It depends on the matter, and the list is confirmed at the consultation. Commonly asked for: ${nameList(topDocs.slice(0, 4).map(lcFirst))}. Please keep the first message short and leave out sensitive details.` },
      ...serviceFaqs,
    ];

    // Related searches: services in other groups that this group's own pages point to, plus the courts guide.
    const own = new Set(list.map((s) => s.slug));
    const rel = [];
    list.forEach((s) => s.related.forEach((r) => { const x = svc(r); if (x && !own.has(r) && !rel.some((y) => y[1] === svcUrl(r))) rel.push([x.short, svcUrl(r)]); }));
    rel.push(['Chennai courts guide', courtUrl(HUB)]);
    pg.slug !== 'criminal-law' && rel.push(['Criminal Law', groupPageUrl('criminal-law')]);
    pg.slug !== 'matrimonial-family-law' && rel.push(['Matrimonial & Family Law', groupPageUrl('matrimonial-family-law')]);
    const others = PAGE_GROUPS.filter((x) => x.slug !== pg.slug);

    const body = `${hero({ eyebrow: `${c.eyebrow} · ${pg.name}`, h1: c.h1, lead: c.lead, note: chipsList.slice(0, 3).join(' · ') })}
<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">${crumbs(trail)}</div>
<section class="pb-10 sm:pb-14 bg-white">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-8 items-start">
    <div class="lg:col-span-8 space-y-4">
      ${h2(`About our ${pg.name} practice`)}
      ${c.intro.map((t) => `<p class="text-charcoal-700 leading-relaxed">${esc(t)}</p>`).join('')}
      ${c.note ? `<aside class="p-4 rounded-lg bg-gold-500/10 border border-gold-500/30 text-sm text-charcoal-800 leading-relaxed"><strong class="block text-gold-700 mb-1">Which code applies?</strong>${esc(NEW_CODES_NOTE)}</aside>` : ''}
    </div>
    <aside class="lg:col-span-4 p-6 rounded-2xl bg-navy-900 text-white border-b-4 border-gold-500 shadow-xl text-sm space-y-3" aria-label="At a glance">
      <h2 class="font-heading text-lg font-bold">At a glance</h2>
      <div class="flex justify-between gap-4 py-2 border-b border-navy-700"><span class="text-slate-300">Services</span><span class="font-semibold">${list.length}</span></div>
      <div class="py-2 border-b border-navy-700"><span class="block text-slate-300 mb-1">Frameworks</span><span class="font-medium leading-relaxed">${esc(chipsList.join('; '))}</span></div>
      <div class="flex justify-between gap-4 py-2"><span class="text-slate-300">Consultation</span><span class="font-medium text-right">By appointment</span></div>
    </aside>
  </div>
</section>
<section class="py-12 sm:py-16 bg-ivory-100 border-y border-ivory-200">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
    ${h2(`${pg.name} services`, 'Open a service for the legal framework, the documents that may be needed and the general procedure.')}
    ${servicesHtml}
  </div>
</section>
<section class="py-12 sm:py-16 bg-white">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
    ${h2('How we approach these matters')}
    <ul class="grid sm:grid-cols-2 gap-5">${c.approach.map((a) => `<li class="flex gap-4 p-5 rounded-xl bg-ivory-50 border border-slate-200"><span class="w-11 h-11 rounded-xl bg-[#12213F] text-[#C9A227] flex items-center justify-center shrink-0">${icon(a[0], 'w-5 h-5')}</span><div><h3 class="font-heading font-bold text-lg text-navy-900">${esc(a[1])}</h3><p class="mt-1 text-sm text-charcoal-700 leading-relaxed">${esc(a[2])}</p></div></li>`).join('')}</ul>
    <div class="p-6 rounded-xl bg-gold-500/10 border border-gold-500/30 space-y-3">
      <h3 class="flex items-center gap-2 font-heading text-lg font-bold text-navy-900">${icon('file-text', 'w-5 h-5 text-gold-700')} Documents commonly asked for</h3>
      <p class="text-sm text-charcoal-700">Requirements depend on the facts of your matter; we confirm the list at the consultation.</p>
      <ul class="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-charcoal-800">${topDocs.map((d) => `<li class="flex items-start gap-2.5">${icon('check', 'w-4 h-4 text-gold-700 mt-0.5 shrink-0')}<span>${esc(d)}</span></li>`).join('')}</ul>
    </div>
  </div>
</section>
${faqSection(faqs)}
<p class="pb-10 bg-white text-center text-sm"><a href="/faqs/#faq-${pg.slug}" class="font-semibold text-gold-700 underline hover:text-navy-900">See every ${esc(pg.name)} question on the FAQs page</a></p>
${relatedSection(rel)}
<section class="py-12 sm:py-14 bg-white border-t border-ivory-200">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
    <h2 class="font-heading text-xl sm:text-2xl font-bold text-navy-900">Other practice areas</h2>
    <ul class="grid sm:grid-cols-3 gap-3">${others.map((o) => `<li><a href="${groupPageUrl(o.slug)}" class="flex items-center justify-between gap-3 p-4 rounded-lg bg-ivory-100 border border-ivory-200 hover:border-gold-500 text-navy-900 font-semibold">${esc(o.name)}${icon('arrow-right', 'w-4 h-4 text-gold-700 shrink-0')}</a></li>`).join('')}</ul>
    <p class="text-sm"><a href="/practice-areas/" class="font-semibold text-gold-700 underline hover:text-navy-900">View all practice areas</a></p>
  </div>
</section>
${nearbySection(c.extraLinks || [])}
${ctaBand(`Discuss a ${pg.name.toLowerCase()} matter`, `Consultations at ${SITE.locality}, ${SITE.city} are by prior appointment. This page is general information and not legal advice on any individual matter.`)}`;
    return page({ title: c.title, desc: c.desc, path: p, social: true, schema: [
      breadcrumbSchema(trail),
      webPage('WebPage', c.h1, c.desc, p, { breadcrumb: { '@id': abs(p) + '#breadcrumb' }, mainEntity: { '@type': 'ItemList', itemListElement: list.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s.short, url: abs(svcUrl(s.slug)) })) } }),
      legalService({ hasOfferCatalog: { '@type': 'OfferCatalog', name: pg.name, itemListElement: list.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.short, url: abs(svcUrl(s.slug)) } })) } }),
    ] }, body);
  }

  // ---------- About Us ----------
  function aboutPage() {
    const p = '/about-us/';
    const title = 'About Shasti Law Firm | Advocates in Chennai';
    const desc = 'About Shasti Law Firm in West Mambalam, Chennai: its practice areas, how it works with clients and how to arrange a consultation by appointment.';
    const trail = [['Home', '/'], ['About us', p]];
    const phil = [
      ['file-text', 'The record comes first', 'Advice should rest on documents, dates and the applicable law, not on assumptions or on how other matters are said to have ended.'],
      ['message-circle', 'Plain explanations', 'Procedure, deadlines and risks are explained without needless jargon, so that you can decide how to proceed.'],
      ['shield', 'Honest about outcomes', 'Results depend on facts, evidence and the court’s discretion. We do not guarantee them.'],
      ['lock', 'Confidential', 'Communications between an advocate and client are protected by law (Section 132 BSA, earlier Section 126 of the Evidence Act), subject to its exceptions.'],
    ];
    const values = [['Integrity', 'We tell you where your position is strong and where it is not.'], ['Clarity', 'You should leave a consultation knowing the options, the steps and the risks.'], ['Care', 'Notices, petitions and affidavits are drafted with attention to limitation periods and court requirements.'], ['Discretion', 'Your matter and your details are treated as confidential.']];
    const steps = [
      ['Request', 'Send a request through the Contact page or call the office to arrange an appointment.'],
      ['Briefing', 'A short briefing identifies urgent dates, notices received or the key facts of the dispute.'],
      ['Document review', 'Cheques and bank memos, marriage records, agreements, police notices or earlier court papers are reviewed.'],
      ['Options and advice', 'The available remedies, forum, risks and next steps are explained. No result can be guaranteed.'],
      ['If you proceed', 'A Vakalatnama is signed and papers are drafted, verified and filed before the right court or forum.'],
    ];
    const faqs = [
      { q: 'Which areas of law does the firm practise?', a: 'Matrimonial and family law, criminal law, civil litigation and recovery (including cheque dishonour under Section 138 of the NI Act), and corporate and commercial law.', link: ['See the practice areas', '/practice-areas/'] },
      { q: 'Does this website advertise or solicit work?', a: 'No. The Bar Council of India Rules do not permit advocates to advertise or solicit work. This website only gives information about the firm and about the law, at the visitor’s own request.', link: ['Read the disclaimer', '/disclaimer/'] },
      { q: 'Is the information on this website legal advice?', a: 'No. It is general information. Advice depends on your own facts and documents, and an advocate-client relationship begins only when the firm accepts the engagement and a Vakalatnama is signed.' },
    ];
    const rel = [['Matrimonial & Family Law', groupPageUrl('matrimonial-family-law')], ['Criminal Law', groupPageUrl('criminal-law')], ['Civil Litigation & Recovery', groupPageUrl('civil-litigation-recovery')], ['Corporate & Commercial Law', groupPageUrl('corporate-commercial-law')], ['Chennai courts guide', courtUrl(HUB)], ['Legal insights', '/insights/'], ['Contact Shasti Law Firm', '/contact-us/']];
    const body = `${hero({ eyebrow: 'About the firm', h1: 'About Shasti Law Firm in Chennai', lead: `${SITE.name} is a law practice based in ${SITE.locality}, ${SITE.city}, acting for individuals, families, businesses and professionals in court proceedings, statutory notices and contractual disputes.` })}
<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">${crumbs(trail)}</div>
<section class="pb-12 sm:pb-16 bg-white">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-10 items-start">
    <div class="lg:col-span-7 space-y-4">
      ${h2('Who we are')}
      <p class="text-charcoal-700 leading-relaxed">The firm’s work is organised into four practice groups: matrimonial and family law, criminal law, civil litigation and recovery, and corporate and commercial law. Each group has its own page, with a page for every service within it.</p>
      <p class="text-charcoal-700 leading-relaxed">The office is in ${SITE.locality}, ${SITE.city}. Consultations are held by prior appointment so that time can be set aside to read your documents properly before advice is given.</p>
      <p><a href="/practice-areas/" class="inline-flex items-center gap-2 text-sm font-semibold text-gold-700 hover:text-navy-900">Explore our practice areas ${icon('arrow-right', 'w-4 h-4')}</a></p>
    </div>
    <dl class="lg:col-span-5 p-8 bg-navy-900 rounded-2xl text-white border-b-4 border-gold-500 shadow-xl text-sm space-y-3">
      <div class="flex justify-between gap-4 py-2 border-b border-navy-700"><dt class="text-slate-300">Firm</dt><dd class="font-medium">${SITE.name}</dd></div>
      <div class="flex justify-between gap-4 py-2 border-b border-navy-700"><dt class="text-slate-300">Office</dt><dd class="font-medium text-right">${SITE.locality}, ${SITE.city}</dd></div>
      <div class="flex justify-between gap-4 py-2 border-b border-navy-700"><dt class="text-slate-300">Practice groups</dt><dd class="font-medium text-right">Family, Criminal, Civil &amp; Recovery, Commercial</dd></div>
      <div class="flex justify-between gap-4 py-2"><dt class="text-slate-300">Phone</dt><dd><a href="${TEL}" class="font-bold text-gold-300 hover:underline">${SITE.phoneDisplay}</a></dd></div>
    </dl>
  </div>
</section>
<section class="py-12 sm:py-16 bg-ivory-100 border-y border-ivory-200">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
    ${h2('Our philosophy', 'A few principles shape how every matter is handled.')}
    <ul class="grid sm:grid-cols-2 gap-5">${phil.map((a, i) => `<li class="flex gap-4 p-5 sm:p-6 rounded-2xl bg-white border-2 border-t-4 border-[#12213F] border-t-[#C9A227] shadow-sm"><span class="w-11 h-11 rounded-xl bg-[#12213F] text-[#C9A227] flex items-center justify-center shrink-0">${icon(a[0], 'w-5 h-5')}</span><div><h3 class="font-heading font-bold text-lg text-navy-900">${esc(a[1])}</h3><p class="mt-1 text-sm text-charcoal-700 leading-relaxed">${esc(a[2])}</p></div></li>`).join('')}</ul>
  </div>
</section>
<section class="py-12 sm:py-16 bg-white">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10">
    <div class="space-y-4">
      ${h2('A client-focused approach')}
      <p class="text-charcoal-700 leading-relaxed">Legal problems usually arrive with deadlines and worry attached. The aim of the first consultation is to give you a clear picture of where you stand.</p>
      <ul class="space-y-2.5 text-charcoal-800">${['Urgent dates, such as hearings, notice periods and limitation, are identified first.', 'The options are explained together with what each involves and the risks.', 'You decide how to proceed, with the information you need to decide.', 'Please keep the first message short; sensitive details are shared at the consultation.'].map((t) => `<li class="flex items-start gap-2.5">${icon('check', 'w-4 h-4 text-gold-700 mt-1 shrink-0')}<span>${esc(t)}</span></li>`).join('')}</ul>
    </div>
    <div class="space-y-4">
      ${h2('Our values')}
      <dl class="space-y-4">${values.map((v) => `<div class="pl-4 border-l-4 border-[#C9A227]"><dt class="font-heading font-bold text-navy-900">${esc(v[0])}</dt><dd class="text-sm text-charcoal-700 leading-relaxed mt-0.5">${esc(v[1])}</dd></div>`).join('')}</dl>
    </div>
  </div>
</section>
<section class="py-12 sm:py-16 bg-navy-900 text-white">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
    <div class="max-w-3xl space-y-2"><h2 class="font-heading text-2xl sm:text-3xl font-bold">How a consultation works</h2><p class="text-slate-200 leading-relaxed">Five steps from the first request to filing, if you decide to go ahead.</p></div>
    <ol class="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">${steps.map((s, i) => `<li class="p-5 rounded-2xl bg-navy-950/80 border-2 border-[#C9A227]/40"><span class="w-9 h-9 rounded-full bg-[#C9A227] text-[#12213F] flex items-center justify-center font-bold">${i + 1}</span><h3 class="font-heading text-lg font-bold mt-3">${esc(s[0])}</h3><p class="text-sm text-slate-200 leading-relaxed mt-1">${esc(s[1])}</p></li>`).join('')}</ol>
  </div>
</section>
<section class="py-12 sm:py-16 bg-white">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
    ${h2('Our practice areas')}
    <ul class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">${PAGE_GROUPS.map((pg) => `<li><a href="${groupPageUrl(pg.slug)}" class="group flex flex-col h-full p-5 rounded-2xl bg-ivory-50 border-2 border-navy-900/15 hover:border-gold-500 transition-colors"><span class="w-10 h-10 rounded-lg bg-[#12213F] text-[#C9A227] flex items-center justify-center">${icon(pg.icon, 'w-5 h-5')}</span><h3 class="mt-3 font-heading font-bold text-lg text-navy-900 group-hover:text-gold-700">${esc(pg.name)}</h3><p class="mt-1 text-sm text-charcoal-700 leading-relaxed flex-1">${esc(nameList(groupServices(pg).slice(0, 3).map((s) => s.short)))}${groupServices(pg).length > 3 ? ' and more' : ''}</p></a></li>`).join('')}</ul>
    <div class="p-5 rounded-lg bg-gold-500/10 border border-gold-500/30 text-sm text-charcoal-800 leading-relaxed"><strong class="text-gold-700">Professional rules.</strong> The Bar Council of India Rules do not permit advocates to advertise or solicit work. This website gives information only, at the visitor’s own request. <a href="/disclaimer/" class="underline font-semibold hover:text-gold-700">Read the full disclaimer</a>.</div>
  </div>
</section>
${faqSection(faqs)}
${relatedSection(rel)}
${nearbySection()}
${ctaBand('Arrange a consultation', `Consultations at ${SITE.locality}, ${SITE.city} are by prior appointment.`)}`;
    return page({ title, desc, path: p, social: true, schema: [
      breadcrumbSchema(trail),
      webPage('AboutPage', 'About Shasti Law Firm in Chennai', desc, p, { mainEntity: { '@id': SITE.url + '/#firm' } }),
      legalService(),
    ] }, body);
  }

  // ---------- Contact Us ----------
  function contactPage() {
    const p = '/contact-us/';
    const title = 'Contact Shasti Law Firm | Advocates in Chennai';
    const desc = 'Call, message on WhatsApp or request a consultation with Shasti Law Firm in West Mambalam, Chennai, for family, criminal, civil and commercial matters.';
    const trail = [['Home', '/'], ['Contact us', p]];
    const inputInfo = (ic, label, inner) => `<div class="flex items-start gap-3"><span class="p-2.5 rounded-lg bg-navy-900 text-gold-400 shrink-0">${icon(ic, 'w-4 h-4')}</span><div><div class="font-bold text-navy-900">${label}</div>${inner}</div></div>`;
    const faqs = [
      stdFaqs.appt,
      { q: 'What happens when I submit the request form?', a: 'Your browser opens WhatsApp with your details already written into a message to the firm. Nothing is sent until you press send in WhatsApp. This website does not store what you type and does not send it by email.' },
      { q: 'Where is the office?', a: `The office is in ${SITE.locality}, ${SITE.city}, Tamil Nadu ${SITE.postalCode}. The exact address is shared when your appointment is confirmed.` },
      { q: 'What should I keep ready?', a: 'Any notice, summons, FIR, cheque and bank memo, agreement or court order you have received, and a short list of the dates involved. Please leave sensitive details out of the first message.' },
      stdFaqs.promise,
    ];
    const rel = [['Matrimonial & Family Law', groupPageUrl('matrimonial-family-law')], ['Criminal Law', groupPageUrl('criminal-law')], ['Civil Litigation & Recovery', groupPageUrl('civil-litigation-recovery')], ['Corporate & Commercial Law', groupPageUrl('corporate-commercial-law')], ['All practice areas', '/practice-areas/'], ['About Shasti Law Firm', '/about-us/'], ['Chennai courts guide', courtUrl(HUB)]];
    const body = `${hero({ eyebrow: 'Contact', h1: 'Contact Shasti Law Firm in Chennai', lead: `To enquire about a legal matter, call the office, message on WhatsApp or send a consultation request. Consultations at ${SITE.locality}, ${SITE.city} are by prior appointment.` })}
<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">${crumbs(trail)}</div>
<section class="pb-12 sm:pb-16 bg-white">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-8">
    <div class="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-ivory-50 border border-slate-200 space-y-6 self-start">
      <h2 class="font-heading text-2xl font-bold text-navy-900">Reach the office</h2>
      ${inputInfo('map-pin', 'Office', `<div class="text-charcoal-700 text-sm mt-0.5">${SITE.locality}, ${SITE.city}, ${SITE.region} ${SITE.postalCode}</div><div class="text-charcoal-600 text-sm">The full address is shared when your appointment is confirmed.</div>`)}
      ${inputInfo('phone', 'Phone', `<a href="${TEL}" class="text-gold-700 font-bold hover:underline">${SITE.phoneDisplay}</a>`)}
      ${inputInfo('message-circle', 'WhatsApp', `<a href="${WA}" target="_blank" rel="noopener noreferrer" class="text-emerald-800 font-semibold hover:underline">Message the firm</a>`)}
      ${inputInfo('calendar', 'Appointments', '<div class="text-charcoal-700 text-sm mt-0.5">Consultations are by prior appointment. Office hours are shared when you book.</div>')}
      <div class="pt-4 border-t border-slate-200 flex gap-3">
        <a href="${TEL}" class="flex-1 btn-ghost !px-3 !py-2.5">${icon('phone', 'w-4 h-4 text-gold-400')} Call</a>
        <a href="${WA}" target="_blank" rel="noopener noreferrer" class="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#117A40] hover:bg-[#0E7A3F] text-white font-semibold text-sm">${icon('message-circle', 'w-4 h-4')} WhatsApp</a>
      </div>
    </div>
    <div id="appointment" class="lg:col-span-7 scroll-mt-24 rounded-2xl bg-navy-950 border border-gold-500/40 p-6 sm:p-8 shadow-2xl text-white">
      <div class="mb-6 space-y-2">
        <p class="inline-flex items-center gap-1.5 text-gold-300 font-bold text-xs uppercase tracking-widest">${icon('calendar', 'w-4 h-4')} Prior appointment required</p>
        <h2 class="font-heading text-2xl sm:text-3xl font-bold">Request a consultation</h2>
        <p class="text-slate-300 text-sm leading-relaxed">Fill in the form and your request opens in WhatsApp, ready to send to the firm. It is sent only when you press send there. Please keep the note short and leave out sensitive details such as full case narratives, bank details or ID numbers.</p>
      </div>
      ${consultationForm()}
      <p class="mt-6 text-center text-sm text-slate-300">Prefer to speak to someone? Call <a href="${TEL}" class="text-gold-300 font-bold hover:underline">${SITE.phoneDisplay}</a>, especially if you have an urgent court date.</p>
    </div>
  </div>
</section>
<section class="py-12 sm:py-16 bg-ivory-100 border-y border-ivory-200">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
    ${h2('Find the office area')}
    <div class="rounded-2xl border border-slate-200 overflow-hidden bg-white flex flex-col">
      <div class="p-4 bg-navy-950 text-white flex items-center justify-between text-sm"><span class="font-semibold">${SITE.locality} area map</span><span class="text-slate-300">${SITE.city} ${SITE.postalCode}</span></div>
      <iframe title="Map of the ${SITE.locality} area, ${SITE.city}" class="w-full h-80 border-0" loading="lazy" referrerpolicy="no-referrer" src="https://www.openstreetmap.org/export/embed.html?bbox=80.2070%2C13.0280%2C80.2320%2C13.0450&amp;layer=mapnik"></iframe>
      <p class="p-3 bg-slate-50 border-t border-slate-200 text-center text-sm text-charcoal-600">The map shows the general area only. The exact office address is shared on confirmation of your appointment.</p>
    </div>
  </div>
</section>
<section class="py-12 sm:py-16 bg-white">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
    ${h2('Before you get in touch', 'Having these to hand makes the first conversation more useful. Open the practice area that fits your matter for the documents usually asked for.')}
    <ul class="grid sm:grid-cols-2 gap-4">${PAGE_GROUPS.map((pg) => `<li><a href="${groupPageUrl(pg.slug)}" class="group flex items-start gap-3 h-full p-5 rounded-xl bg-ivory-50 border-2 border-navy-900/15 hover:border-gold-500 transition-colors"><span class="w-10 h-10 rounded-lg bg-[#12213F] text-[#C9A227] flex items-center justify-center shrink-0">${icon(pg.icon, 'w-5 h-5')}</span><span><span class="block font-heading font-bold text-navy-900 group-hover:text-gold-700">${esc(pg.name)}</span><span class="block text-sm text-charcoal-700 mt-0.5">${esc(nameList(groupServices(pg).slice(0, 3).map((s) => s.short)))}${groupServices(pg).length > 3 ? ' and more' : ''}</span></span></a></li>`).join('')}</ul>
  </div>
</section>
${faqSection(faqs)}
${relatedSection(rel)}
${nearbySection()}`;
    return page({ title, desc, path: p, social: true, schema: [
      breadcrumbSchema(trail),
      webPage('ContactPage', 'Contact Shasti Law Firm in Chennai', desc, p, { mainEntity: { '@id': SITE.url + '/#firm' } }),
      legalService(),
    ] }, body);
  }

  // ---------- FAQs ----------
  // General questions are the existing homepage FAQs in full. Service questions are listed as links to the service page's own FAQ section, so no answer text is duplicated.
  function faqPage() {
    const p = '/faqs/';
    const title = 'Frequently Asked Questions | Shasti Law Firm, Chennai';
    const desc = 'Common questions about divorce, bail, cheque bounce, recovery and commercial disputes, with links to the questions answered on each Shasti Law Firm service page.';
    const trail = [['Home', '/'], ['FAQs', p]];
    const sections = PAGE_GROUPS.map((pg) => {
      const list = groupServices(pg);
      const n = list.reduce((a, s) => a + s.faqs.length, 0);
      return `<section id="faq-${pg.slug}" class="scroll-mt-24 space-y-5">
        <div class="flex flex-wrap items-end justify-between gap-3 border-b-2 border-[#C9A227] pb-3"><h2 class="font-heading text-2xl font-bold text-navy-900">${esc(pg.name)}</h2><a href="${groupPageUrl(pg.slug)}" class="text-sm font-semibold text-gold-700 hover:text-navy-900 underline">About this practice area</a></div>
        <p class="text-sm text-charcoal-700">${n} questions across ${list.length} services. Each question opens the answer on its service page.</p>
        <div class="grid md:grid-cols-2 gap-6">${list.map((s) => `<div class="p-5 rounded-xl bg-ivory-50 border border-slate-200"><h3 class="font-heading font-bold text-navy-900 mb-3"><a href="${svcUrl(s.slug)}" class="hover:text-gold-700">${esc(s.short)}</a></h3><ul class="space-y-2 text-sm">${s.faqs.map((f) => `<li class="flex items-start gap-2">${icon('chevron-right', 'w-4 h-4 text-gold-700 mt-0.5 shrink-0')}<a href="${svcUrl(s.slug)}#faq" class="text-charcoal-800 hover:text-gold-700 hover:underline">${esc(f.q)}</a></li>`).join('')}</ul></div>`).join('')}</div>
      </section>`;
    }).join('');
    const jump = [['General', '#faq-general'], ...PAGE_GROUPS.map((pg) => [pg.name, '#faq-' + pg.slug])];
    const body = `${hero({ eyebrow: 'FAQs', h1: 'Frequently Asked Questions', lead: 'Questions people commonly ask about family, criminal, civil and commercial matters, and about booking a consultation. This is general information, not advice on your own facts.' })}
<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">${crumbs(trail)}</div>
<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 space-y-12">
  <nav aria-label="FAQ categories"><ul class="flex flex-wrap gap-2.5">${jump.map(([l, h]) => `<li><a href="${h}" class="inline-flex px-4 py-2 rounded-full bg-white border border-navy-900/20 text-sm font-medium text-navy-900 hover:border-gold-500 hover:text-gold-700">${esc(l)}</a></li>`).join('')}</ul></nav>
  <section id="faq-general" class="scroll-mt-24 space-y-5 max-w-3xl">
    <div class="border-b-2 border-[#C9A227] pb-3"><h2 class="font-heading text-2xl font-bold text-navy-900">General questions</h2></div>
    <div class="space-y-3">${faqList(FAQS_HOME)}</div>
  </section>
  ${sections}
</div>
${ctaBand('Have a question that is not here?', `Call or send a request. Consultations at ${SITE.locality}, ${SITE.city} are by prior appointment.`)}
<section class="py-10 bg-white border-t border-ivory-200"><div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3"><h2 class="font-heading text-xl font-bold text-navy-900">More on this site</h2>${chips([['All practice areas', '/practice-areas/'], ['Consultation process', '/consultation-process/'], ['About Shasti Law Firm', '/about-us/'], ['Contact', '/contact-us/'], ['Chennai courts guide', courtUrl(HUB)], ['Legal insights', '/insights/']])}</div></section>`;
    return page({ title, desc, path: p, social: true, schema: [
      breadcrumbSchema(trail),
      webPage('WebPage', 'Frequently Asked Questions', desc, p, { breadcrumb: { '@id': abs(p) + '#breadcrumb' } }),
      legalService(),
    ] }, body);
  }

  // ---------- Consultation process ----------
  // Uses only the process steps and expectations already published on the homepage. No fees, durations, response times or availability are stated.
  function processPage() {
    const p = '/consultation-process/';
    const title = 'Consultation Process | Shasti Law Firm, Chennai';
    const desc = 'How a consultation with Shasti Law Firm works, from the first request and document review to advice and filing. Consultations at West Mambalam are by appointment.';
    const trail = [['Home', '/'], ['Consultation process', p]];
    const expect = HOW_ITEMS.filter((h) => h[0] !== 'map-pin');
    const body = `${hero({ eyebrow: 'Consultation process', h1: 'Consultation Process at Shasti Law Firm', lead: `Five steps from the first request to filing, if you decide to go ahead. Consultations at ${SITE.locality}, ${SITE.city} are by prior appointment.` })}
<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">${crumbs(trail)}</div>
<section class="pb-12 sm:pb-16 bg-white">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
    ${h2('From first call to filing in five steps', 'The steps below are a general outline. The exact steps, forum and timing vary from case to case.')}
    <ol class="space-y-4">${PROCESS_STEPS.map((s, i) => `<li class="flex gap-4 p-5 sm:p-6 rounded-2xl bg-ivory-50 border-2 border-t-4 border-[#12213F] border-t-[#C9A227] shadow-sm"><span class="w-10 h-10 rounded-full bg-[#12213F] text-[#C9A227] flex items-center justify-center font-bold shrink-0">${i + 1}</span><div><h3 class="font-heading text-xl font-bold text-navy-900">${esc(s[0])}</h3><p class="mt-1 text-charcoal-700 leading-relaxed">${esc(s[1])}</p></div></li>`).join('')}</ol>
    <div class="p-5 rounded-lg bg-gold-500/10 border border-gold-500/30 text-sm text-charcoal-800 leading-relaxed">Questions about fees, timing or availability can be raised with the office when you get in touch. This page does not state them.</div>
  </div>
</section>
<section class="py-12 sm:py-16 bg-ivory-100 border-y border-ivory-200">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
    ${h2('What to expect')}
    <ul class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">${expect.map((a) => `<li class="flex gap-4 p-5 rounded-2xl bg-white border-2 border-[#12213F]/20"><span class="w-11 h-11 rounded-xl bg-[#12213F] text-[#C9A227] flex items-center justify-center shrink-0">${icon(a[0], 'w-5 h-5')}</span><div><h3 class="font-heading font-bold text-lg text-navy-900">${esc(a[1])}</h3><p class="mt-1 text-sm text-charcoal-700 leading-relaxed">${esc(a[2])}</p></div></li>`).join('')}</ul>
  </div>
</section>
<section class="py-12 sm:py-16 bg-white">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
    ${h2('Get ready for your consultation', 'Each practice area page lists the documents commonly asked for.')}
    <ul class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">${PAGE_GROUPS.map((pg) => `<li><a href="${groupPageUrl(pg.slug)}" class="group flex items-center justify-between gap-3 h-full p-4 rounded-xl bg-ivory-50 border-2 border-navy-900/15 hover:border-gold-500 transition-colors"><span class="font-heading font-bold text-navy-900 group-hover:text-gold-700">${esc(pg.name)}</span>${icon('arrow-right', 'w-4 h-4 text-gold-700 shrink-0')}</a></li>`).join('')}</ul>
    <p class="text-sm text-charcoal-700 max-w-3xl">${esc(FAQS_HOME[3].q)} ${esc(FAQS_HOME[3].a)}</p>
  </div>
</section>
${ctaBand('Request a consultation', `Consultations at ${SITE.locality}, ${SITE.city} are by prior appointment. Send a request or call the office.`)}
<section class="py-10 bg-white border-t border-ivory-200"><div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3"><h2 class="font-heading text-xl font-bold text-navy-900">Related pages</h2>${chips([['Frequently asked questions', '/faqs/'], ['All practice areas', '/practice-areas/'], ['About Shasti Law Firm', '/about-us/'], ['Contact', '/contact-us/']])}</div></section>`;
    return page({ title, desc, path: p, social: true, schema: [
      breadcrumbSchema(trail),
      webPage('WebPage', 'Consultation Process at Shasti Law Firm', desc, p, { breadcrumb: { '@id': abs(p) + '#breadcrumb' } }),
      legalService(),
    ] }, body);
  }

  return { hubPage, groupPage, aboutPage, contactPage, faqPage, processPage };
};
