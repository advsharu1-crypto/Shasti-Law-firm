# Shasti Law Firm website

Static site. No framework, no tracking, no runtime dependencies.

## Deploy
Upload the contents of `dist/` to the root of shastilawfirm.com (any static host: Netlify, Cloudflare Pages, cPanel).
All links are root-relative (`/services/...`), so it must be served from the domain root.

## Edit content
- Text, statutes, FAQs, insights: `data.js`
- Layout and design: `build.js`
- Then: `npm install` (once) and `npm run build`; preview with `npm run preview`.

## Before going live (see also the notes in the chat)
- Add the full chamber address (street, pincode) to the LegalService schema in `build.js` and to the contact section.
- Submit `https://shastilawfirm.com/sitemap.xml` in Google Search Console and create a Google Business Profile.
- Have an advocate of the firm review every statutory reference and the disclaimer wording.
