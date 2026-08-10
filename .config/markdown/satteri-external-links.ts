import { defineHastPlugin } from 'satteri';

export interface ExternalLinkAttributesOptions {
	/**
	 * Hostnames considered part of this site - links to them are left
	 * untouched. Everything else with an `http:`/`https:` URL counts as
	 * external (relative links, `#anchors`, `mailto:`, `tel:`, etc. are
	 * always left alone).
	 */
	ownHosts?: string[];
	/**
	 * Called with the parsed URL of each external link - mutate it in place
	 * (e.g. `url.searchParams.set('ref', 'sidvishnoi.com')`) to rewrite the
	 * link. The (possibly mutated) `URL` is used as the new `href`; return a
	 * different `URL` instead to replace it outright.
	 */
	rewriteUrl?: (url: URL) => URL | void;
	/**
	 * hast properties merged onto each external `<a>` element, e.g.
	 * `{ target: '_blank', rel: ['noopener', 'noreferrer'] }`.
	 */
	attributes?: Record<string, string | string[]>;
}

function isExternalHref(href: string, ownHosts: string[]): boolean {
	let url: URL;
	try {
		url = new URL(href);
	} catch {
		return false;
	}
	if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
	return !ownHosts.includes(url.hostname);
}

/**
 * Adds configurable attributes (e.g. `target="_blank"`) and lets the caller
 * rewrite the URL (e.g. append `?ref=...`) of every external link, so
 * external-ness only needs to be decided once per document instead of by
 * every markdown author by hand.
 */
export function satteriExternalLinks(options: ExternalLinkAttributesOptions = {}) {
	const { ownHosts = [], rewriteUrl, attributes = {} } = options;

	return defineHastPlugin({
		name: 'satteri-external-links',
		element: {
			filter: ['a'],
			visit(node, ctx) {
				const href = node.properties?.href;
				if (typeof href !== 'string' || !isExternalHref(href, ownHosts)) return;

				if (rewriteUrl) {
					const url = new URL(href);
					const rewritten = rewriteUrl(url) ?? url;
					ctx.setProperty(node, 'href', rewritten.toString());
				}

				for (const [key, value] of Object.entries(attributes)) {
					ctx.setProperty(node, key, value);
				}
			},
		},
	});
}
