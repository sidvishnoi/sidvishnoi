import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegrationLogger } from 'astro';
import {
	defineMdastPlugin,
	type MdastNode,
	type MdastVisitorContext,
} from 'satteri';
import type { ContentLinkMapResult, ContentLinkRegistry } from './map.ts';
import { escapeHtml, getFrontmatterLineOffset, isWithin } from './utils.ts';

// Saterri plugin to rewrite markdown links that point at other
// content-collection source files into their final published URL, so content
// can cross-link by relative file path instead of guessing the eventual slug.
//
// Only links starting with `./` or `../` are treated as content links -
// everything else (absolute paths, external URLs, bare filenames) is left
// untouched.
export function createSatteriRelativeContentLinks(
	registry: ContentLinkRegistry,
	logger: AstroIntegrationLogger,
) {
	const reportBrokenLink = createBrokenLinkReporter(registry, logger);

	return defineMdastPlugin({
		name: 'satteri-relative-content-links',
		async link(node, ctx) {
			const url = node.url;
			if (!url) return;
			if (!url.startsWith('./') && !url.startsWith('../')) return;

			if (!ctx.fileURL) return;
			const currentFilePath = fileURLToPath(ctx.fileURL);

			const hashIndex = url.indexOf('#');
			const pathname = hashIndex === -1 ? url : url.slice(0, hashIndex);
			const hash = hashIndex === -1 ? '' : url.slice(hashIndex);
			const targetPath = path.resolve(
				path.dirname(currentFilePath),
				decodeURI(pathname),
			);

			const contentMap = registry.get() ?? (await registry.buildMap());
			const { map, root, collectionDirectories } = contentMap;

			if (!isWithin(root, targetPath)) {
				await reportBrokenLink('escapes the project root', { ctx, node, root });
				return;
			}
			if (!collectionDirectories.some((dir) => isWithin(dir, targetPath))) {
				await reportBrokenLink('outside any collection', { ctx, node, root });
				return;
			}

			const targetUrl = resolveTargetUrl(targetPath, map);
			if (!targetUrl) {
				await reportBrokenLink('no matching target found', { ctx, node, root });
				return;
			}

			ctx.setProperty(node, 'url', targetUrl + hash);
		},
	});
}

function resolveTargetUrl(
	targetPath: string,
	map: ContentLinkMapResult['map'],
): string | undefined {
	if (/\.mdx?$/.test(targetPath)) return map.get(targetPath);
	return (
		map.get(path.join(targetPath, 'README.md')) ??
		map.get(path.join(targetPath, 'README.mdx'))
	);
}

function createBrokenLinkReporter(
	registry: ContentLinkRegistry,
	logger: AstroIntegrationLogger,
) {
	type LinkNode = Readonly<Extract<MdastNode, { type: 'link' }>>;
	type Deps = {
		ctx: MdastVisitorContext;
		node: LinkNode;
		root: string;
	};

	const html = String.raw; // for syntax highlighting

	return async function reportBrokenLink(
		reason: string,
		{ ctx, node, root }: Deps,
	): Promise<void> {
		const currentFilePath = fileURLToPath(ctx.fileURL!);
		const location = await getErrorLocation(node, root, currentFilePath);
		const message = `Broken link "${node.url}" in ${location} (${reason})`;
		logger.error(message);
		registry.recordLinkFailure(message);
		ctx.report({ message, node, severity: 'error' });

		const brokenLinks = (ctx.data.relativeContentBrokenLinks ??= []);
		const id = `broken-relative-content-link-${brokenLinks.length + 1}`;
		brokenLinks.push({ id, url: node.url, location });

		ctx.replaceNode(node, {
			type: 'html',
			value: html`<mark
				id="${id}"
				style="background:#c00; color:#fff; padding:0 3px; border-radius:2px"
				>broken link: ${escapeHtml(node.url)}</mark
			>`,
		});

		createOrUpdateBrokenLinksBanner(node, brokenLinks, ctx);
	};

	async function getErrorLocation(
		node: LinkNode,
		rootDir: string,
		currentFilePath: string,
	): Promise<string> {
		const relativeFilePath = path.relative(rootDir, currentFilePath);

		let line = node.position?.start.line;
		if (typeof line === 'undefined') {
			return relativeFilePath;
		}

		line += await getFrontmatterLineOffset(currentFilePath);
		const col = `:${node.position!.start.column}`;

		return `${relativeFilePath}:${line}${col}`;
	}

	function createOrUpdateBrokenLinksBanner(
		node: Readonly<MdastNode>,
		brokenLinks: readonly BrokenLinkEntry[],
		ctx: MdastVisitorContext,
	): void {
		let docRoot: Readonly<MdastNode> = node;
		let parent: Readonly<MdastNode> | undefined = ctx.parent(docRoot);
		while (parent) {
			docRoot = parent;
			parent = ctx.parent(docRoot);
		}
		if (docRoot.type !== 'root') {
			throw new Error('expected root node');
		}

		const priorChildren = ctx.data.relativeContentLinksBrokenLinksBannerInserted
			? docRoot.children.slice(1)
			: docRoot.children;
		ctx.data.relativeContentLinksBrokenLinksBannerInserted = true;
		ctx.setProperty(docRoot, 'children', [
			{ type: 'html', value: buildBannerHtml(brokenLinks) },
			...priorChildren,
		]);
	}

	// One banner per file, listing every broken link found in it so far, each
	// linking to its `<mark>` below.
	function buildBannerHtml(entries: readonly BrokenLinkEntry[]): string {
		const items = entries.map((e) => {
			const text = escapeHtml(e.location);
			return html`<li>
				<a href="#${e.id}" style="color:#fff; text-decoration:underline"
					>${text}</a
				>
			</li>`;
		});
		return html`<div
			role="alert"
			style="background:#c00; color:#fff; padding:8px 12px; border-radius:4px; margin-bottom:1em"
		>
			<strong>⚠ ${entries.length} broken content link(s) found</strong>
			<ul style="margin:4px 0 0; padding-left:1.2em">
				${items.join('\n')}
			</ul>
		</div>`;
	}
}

interface BrokenLinkEntry {
	id: string;
	url: string;
	location: string;
}

declare module 'satteri' {
	interface DataMap {
		relativeContentBrokenLinks: BrokenLinkEntry[];
		relativeContentLinksBrokenLinksBannerInserted: boolean;
	}
}
