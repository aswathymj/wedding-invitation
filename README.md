# Arjun & Aswathy — Wedding Invitation

## Run locally

Requires Node.js 18 or newer. No packages or install step are needed.

```powershell
npm start
```

`npm start` builds and serves the static site. Open <http://localhost:4173>. To create or refresh the deployable static copy, run `npm run build`; the complete site is written to `dist/`. Preview that copy with `npm run preview`.

## Edit wedding content

Edit [src/data/wedding.js](src/data/wedding.js). This contains names, date and times, Asia/Kolkata time zone, venue, map URL, invitation copy, post-wedding message, music, photos, and sharing configuration. The Google Maps URL is intentionally blank until a verified link is supplied. Set `venue.mapsUrl` to enable its button. Set `share.publicUrl` to the final HTTPS page URL before deployment if you want to share a canonical address.

## Included assets

- All 13 supplied photographs are preserved in the project root. Responsive-ready WebP copies are in `public/images/` and used by the page.
- Supplied WhatsApp audio is preserved in the root and copied to `public/audio/wedding-instrumental.mpeg` for the optional music control.
- The photo gallery, date scratch reveal, live IST countdown, calendar download, music, share action, and photo lightbox work without a backend.

## Deploy

Deploy the repository as a static site with the project root as the build context, `npm run build` as the build command, and `dist` as the publish directory. For Vercel or Netlify, use those same settings. For GitHub Pages, publish the contents of `dist/` (for example with the Pages deployment workflow) and configure the site's base path if deploying under a repository subpath; this invitation currently uses root-relative asset paths, so a custom domain or root-level Pages site is easiest.

Before sharing publicly, update `share.publicUrl` and `venue.mapsUrl` in the configuration. The Open Graph image is `public/og/invitation-preview.jpg`; replace its `og:image` path in `index.html` with an absolute HTTPS URL on the deployed host. Social previews can be cached by WhatsApp and may need to be refreshed after deployment or when metadata changes.

## Sharing preview

The page includes title, description, theme color, and a designed preview image for link cards. Social crawlers need the site and image to be publicly reachable over HTTPS, and typically require absolute image URLs. After deployment, check the preview with WhatsApp's link preview or a social sharing debugger. If an old image persists, update the image URL or request a cache refresh from the relevant platform.

## Missing external details

- Verified Google Maps URL: not supplied; map action remains disabled until configured.
- Public deployment URL: not supplied; configure `share.publicUrl` and the absolute Open Graph image URL after deployment.
