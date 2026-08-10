import type { Dirent } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import {
	basename,
	extname,
	join,
	matchesGlob,
	relative,
	resolve,
	sep,
} from 'node:path';

const WALK_CONCURRENCY = 8;

export interface EntryInfo {
	/** Absolute path to the markdown file. */
	readonly path: string;
	/** Posix-style path relative to this collection's `directory`. */
	readonly relativePath: string;
	/** File name without its extension, e.g. `05-05-foo` for `.../05-05-foo.md`. */
	readonly basename: string;
}

/**
 * Scalar frontmatter fields, extracted with a regex line-scan (not a full
 * YAML parse). Reading a field re-scans the (already in-memory) frontmatter
 * block only on first access for that field, so a `getUrl` that never
 * touches frontmatter never pays for the scan at all.
 */
export type Frontmatter = Record<string, string | undefined>;

/** Reads and parses the file's frontmatter on first call - never touches disk if never called. */
export type FrontmatterLoader = () => Promise<Frontmatter>;

/** Joins URL segments with single slashes, even if a segment has leading/trailing/internal slashes of its own. */
export type UrlFormatter = (...segments: string[]) => string;

export interface CollectionLinkConfig {
	/** Directory for this collection, relative to the Astro project root (e.g. `'./articles'`). */
	directory: string;
	/**
	 * Glob pattern(s) matched against each file's `relativePath`, to select
	 * which files are included in this collection. Prefix a pattern with `!`
	 * to exclude matches (e.g. `['**\/*.md', '!_legacy/**']`). Defaults to
	 * including every markdown file found under `directory`.
	 */
	pattern?: string | string[];
	/**
	 * Returns the final published URL for a markdown file in this collection,
	 * or `undefined` to skip it (e.g. a non-content markdown file alongside
	 * the real one). `format` joins URL segments without producing duplicate
	 * slashes, e.g. `format('articles', slug)`. Call `frontmatter()` (async)
	 * only if the URL actually depends on it - the file is never read otherwise.
	 */
	getUrl(
		entry: EntryInfo,
		frontmatter: FrontmatterLoader,
		format: UrlFormatter,
	): string | undefined | Promise<string | undefined>;
}

export interface ContentLinkMapResult {
	map: Map<string, string>;
	counts: Record<string, number>;
	failures: string[];
	/** Absolute path to the Astro project root. */
	root: string;
	/** Absolute paths of every configured collection's `directory`. */
	collectionDirectories: string[];
}

/**
 * Runs `mapper` over `items` with at most `concurrency` in flight at once,
 * preserving result order (a minimal, inlined `p-map`).
 */
async function pMap<T, R>(
	items: readonly T[],
	concurrency: number,
	mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
	const results: R[] = new Array(items.length);
	let nextIndex = 0;

	async function worker(): Promise<void> {
		for (;;) {
			const index = nextIndex++;
			if (index >= items.length) return;
			results[index] = await mapper(items[index], index);
		}
	}

	await Promise.all(
		Array.from({ length: Math.min(concurrency, items.length) }, worker),
	);
	return results;
}

function toPosix(path: string): string {
	return sep === '/' ? path : path.split(sep).join('/');
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const formatUrl: UrlFormatter = (...segments) => {
	return `/${segments.join('/').split('/').filter(Boolean).join('/')}/`;
};

function matchesPattern(
	relativePath: string,
	pattern: string | string[] | undefined,
): boolean {
	if (!pattern) return true;
	const patterns = Array.isArray(pattern) ? pattern : [pattern];
	const include = patterns.filter((p) => !p.startsWith('!'));
	const exclude = patterns
		.filter((p) => p.startsWith('!'))
		.map((p) => p.slice(1));

	if (include.length > 0 && !include.some((p) => matchesGlob(relativePath, p)))
		return false;
	return !exclude.some((p) => matchesGlob(relativePath, p));
}

function failureMessage(
	entryPath: string,
	error: unknown,
	root: string,
): string {
	const reason = error instanceof Error ? error.message : String(error);
	return `${relative(root, entryPath)}: ${reason}`;
}

function createEntryInfo(path: string, relativePath: string): EntryInfo {
	return {
		path,
		relativePath,
		get basename() {
			return basename(relativePath, extname(relativePath));
		},
	};
}

function createFrontmatter(content: string): Frontmatter {
	let block: string | undefined;
	const cache = new Map<string, string | undefined>();

	return new Proxy({} as Frontmatter, {
		get(_target, key) {
			if (typeof key !== 'string') return undefined;
			if (cache.has(key)) return cache.get(key);

			block ??= content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
			const pattern = new RegExp(
				`^${escapeRegExp(key)}:[ \\t]*['"]?([^'"\\r\\n]+)['"]?[ \\t]*$`,
				'm',
			);
			const value = block.match(pattern)?.[1]?.trim();
			cache.set(key, value);
			return value;
		},
	});
}

function createFrontmatterLoader(filePath: string): FrontmatterLoader {
	let promise: Promise<Frontmatter> | undefined;
	return () => {
		promise ??= readFile(filePath, 'utf-8').then(createFrontmatter);
		return promise;
	};
}

async function walk(
	dir: string,
	baseDir: string,
	root: string,
	config: CollectionLinkConfig,
	map: Map<string, string>,
	failures: string[],
): Promise<number> {
	let entries: Dirent[];
	try {
		entries = await readdir(dir, { withFileTypes: true });
	} catch (error) {
		failures.push(failureMessage(dir, error, root));
		return 0;
	}

	const counts = await pMap(
		entries,
		WALK_CONCURRENCY,
		async (dirent): Promise<number> => {
			const name = dirent.name;
			if (name.startsWith('.')) return 0;

			const entryPath = join(dir, name);
			try {
				if (dirent.isDirectory()) {
					return walk(entryPath, baseDir, root, config, map, failures);
				}
				if (!/\.mdx?$/.test(name)) return 0;

				const relativePath = toPosix(relative(baseDir, entryPath));
				if (!matchesPattern(relativePath, config.pattern)) return 0;

				const entry = createEntryInfo(entryPath, relativePath);
				const url = await config.getUrl(
					entry,
					createFrontmatterLoader(entryPath),
					formatUrl,
				);
				if (!url) return 0;

				map.set(entryPath, url);
				return 1;
			} catch (error) {
				failures.push(failureMessage(entryPath, error, root));
				return 0;
			}
		},
	);
	return counts.reduce((sum, n) => sum + n, 0);
}

async function buildContentLinkMap(
	collections: Record<string, CollectionLinkConfig>,
	root: string,
): Promise<ContentLinkMapResult> {
	const map = new Map<string, string>();
	const failures: string[] = [];
	const counts: Record<string, number> = {};
	const collectionDirectories: string[] = [];
	for (const name of Object.keys(collections)) counts[name] = 0;

	await Promise.all(
		Object.entries(collections).map(async ([name, config]) => {
			const directory = resolve(root, config.directory);
			collectionDirectories.push(directory);
			counts[name] = await walk(
				directory,
				directory,
				root,
				config,
				map,
				failures,
			);
		}),
	);

	return { map, counts, failures, root, collectionDirectories };
}

let pendingConfig:
	| { collections: Record<string, CollectionLinkConfig>; root: string }
	| undefined;
let resolvedResult: ContentLinkMapResult | undefined;
let resultPromise: Promise<ContentLinkMapResult> | undefined;

/** Registers the collections config. Must run before `ensureContentLinkMap()`. */
export function configureContentLinks(
	collections: Record<string, CollectionLinkConfig>,
	root: string,
): void {
	pendingConfig = { collections, root };
}

/**
 * Kicks off (or reuses) the async build. Called eagerly from the
 * `relativeContentLinks` Astro integration during `astro:config:setup`, so
 * the map is already resolved by the time any markdown file compiles.
 */
export function ensureContentLinkMap(): Promise<ContentLinkMapResult> {
	resultPromise ??= (async () => {
		if (!pendingConfig) {
			throw new Error(
				'relative-content-links: configureContentLinks() must run before the map is built - is the relativeContentLinks() integration registered in astro.config?',
			);
		}
		const result = await buildContentLinkMap(
			pendingConfig.collections,
			pendingConfig.root,
		);
		resolvedResult = result;
		return result;
	})();
	return resultPromise;
}

/** Synchronous read of whatever's cached so far, or `undefined` if the build hasn't resolved yet. */
export function getContentLinks(): ContentLinkMapResult | undefined {
	return resolvedResult;
}
