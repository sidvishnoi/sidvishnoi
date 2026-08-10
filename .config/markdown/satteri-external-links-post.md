---
title: Adding a configurable external-links plugin to my Sätteri markdown pipeline
description: A small hast plugin that opens external links in a new tab and rewrites their URLs, built for the Sätteri markdown processor
date: 2026-08-07
tags:
  - '#Astro'
  - '#Markdown'
---

# Adding a configurable external-links plugin to my Sätteri markdown pipeline

I recently switched this site's markdown pipeline from `remark`/`rehype` to [Sätteri](https://www.npmjs.com/package/satteri), Astro's newer markdown processor. Sätteri plugins split into two phases: `mdastPlugins`, which operate on the markdown AST, and `hastPlugins`, which operate on the resulting HTML AST. I'd already ported a couple of small `mdastPlugins` (hard line breaks, stripping the duplicate `<h1>`), but I hadn't needed a `hastPlugins` entry until now.

The trigger was wanting every external link in an article or note to open in a new tab, and to carry a `?ref=sidvishnoi.com` query param so I can tell referred traffic apart in analytics. Both of those are properties of the rendered `<a>` element, not of the markdown `link` node, so a hast plugin is the right layer, it sees the anchor after both `[text](url)` links and bare `<https://...>` autolinks have already become the same kind of element.

## Deciding what counts as "external"

The plugin takes a list of `ownHosts` and treats any absolute `http:`/`https:` link whose hostname isn't in that list as external. Relative paths, `#anchors`, `mailto:`, and `tel:` links fail `new URL()` without a base and are left alone automatically, which conveniently also means links produced by my other content-linking plugin (which resolves `../some-article/README.md` references to site-relative URLs) are never touched.

## From a fixed `queryParams` option to a `rewriteUrl` hook

My first pass took a `queryParams: Record<string, string>` option and merged it into the link's search params, skipping any key already present. It worked, but it could only ever add params, and only ever with "leave existing values alone" semantics. That's a policy decision I'd baked into the plugin instead of leaving to the caller.

I replaced it with a single `rewriteUrl(url: URL) => URL | void` hook instead. The plugin hands the caller a parsed `URL` for every external link; the caller mutates it (or returns a different one) however it wants:

```ts
satteriExternalLinks({
	ownHosts: ['sidvishnoi.com'],
	rewriteUrl(url) {
		if (!url.searchParams.has('ref')) url.searchParams.set('ref', 'sidvishnoi.com');
	},
	attributes: { target: '_blank', rel: ['noopener', 'noreferrer'] },
});
```

This covers my `?ref=` use case as a one-liner, but it also leaves room for anything else I might want later (stripping tracking params, rewriting to a redirect proxy, host-specific rules) without touching the plugin itself.

## Attributes, and why `rel` comes along with `target="_blank"`

The `attributes` option is a plain object merged onto the anchor's hast properties. Alongside `target: '_blank'` I set `rel: ['noopener', 'noreferrer']`, a page opened via `target="_blank"` without `rel="noopener"` gets a live `window.opener` reference back to the original page, which the opened page can use to redirect it. It's a well-known, easy-to-forget footgun, so the plugin's example configuration includes it by default rather than leaving it as a trap for later.

The whole thing is about forty lines. Small plugin, but it's a nice confirmation that Sätteri's plugin split (mdast for content-shape changes, hast for element-attribute changes) maps cleanly onto real needs as they come up.
