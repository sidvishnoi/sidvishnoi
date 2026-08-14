import * as path from 'node:path';
import type { Dirent } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { escapeRegExp, matchesPattern, pMap, toPosix } from './utils.ts';
import type {
	CollectionLinkConfig,
	EntryInfo,
	Frontmatter,
	FrontmatterLoader,
	UrlFormatter,
} from './types.ts';

const WALK_CONCURRENCY = 8;

export interface ContentLinkMapResult {
	map: Map<string, string>;
	counts: Record<string, number>;
	failures: string[];
	/** Absolute path to the Astro project root. */
	root: string;
	/** Absolute paths of every configured collection's `directory`. */
	collectionDirectories: string[];
}

export class ContentLinkRegistry {
	#collections: Record<string, CollectionLinkConfig>;
	#root: string;
	#resolvedResult: ContentLinkMapResult | undefined;
	#resultPromise: Promise<ContentLinkMapResult> | undefined;
	#linkFailures: string[] = [];

	constructor(collections: Record<string, CollectionLinkConfig>, root: string) {
		this.#collections = collections;
		this.#root = root;
	}

	buildMap(): Promise<ContentLinkMapResult> {
		this.#resultPromise ??= buildContentLinkMap(
			this.#collections,
			this.#root,
		).then((result) => {
			this.#resolvedResult = result;
			return result;
		});
		return this.#resultPromise;
	}

	get(): ContentLinkMapResult | undefined {
		return this.#resolvedResult;
	}

	rebuild(): Promise<ContentLinkMapResult> {
		this.#resultPromise = undefined;
		return this.buildMap();
	}

	recordLinkFailure(message: string): void {
		this.#linkFailures.push(message);
	}

	getLinkFailures(): readonly string[] {
		return this.#linkFailures;
	}
}

async function buildContentLinkMap(
	collections: Record<string, CollectionLinkConfig>,
	root: string,
): Promise<ContentLinkMapResult> {
	const map = new Map<string, string>();
	const counts: Record<string, number> = {};
	const collectionDirectories: string[] = [];
	const failures: string[] = [];

	const onError = (entryPath: string, error: unknown): void => {
		failures.push(failureMessage(entryPath, error, root));
	};

	await Promise.all(
		Object.entries(collections).map(async ([name, config]) => {
			const directory = path.resolve(root, config.directory);
			collectionDirectories.push(directory);

			const collectionMap = new Map<string, string>();
			const onFile = async (
				entryPath: string,
				relativePath: string,
			): Promise<void> => {
				if (!matchesPattern(relativePath, config.pattern)) return;

				const entry = createEntryInfo(entryPath, relativePath);
				const url = await config.getUrl(
					entry,
					createFrontmatterLoader(entryPath),
					formatUrl,
				);
				if (!url) return;

				collectionMap.set(entryPath, url);
			};

			await walk(directory, directory, onFile, onError);
			counts[name] = collectionMap.size;
			for (const [entryPath, url] of collectionMap) map.set(entryPath, url);
		}),
	);

	return { map, counts, failures, root, collectionDirectories };
}

async function walk(
	dir: string,
	baseDir: string,
	onFile: (entryPath: string, relativePath: string) => Promise<void>,
	onError: (entryPath: string, error: unknown) => void,
): Promise<void> {
	let entries: Dirent[];
	try {
		entries = await readdir(dir, { withFileTypes: true });
	} catch (error) {
		onError(dir, error);
		return;
	}

	await pMap(entries, WALK_CONCURRENCY, async (dirent): Promise<void> => {
		const name = dirent.name;
		if (name.startsWith('.') || name.startsWith('_')) return;

		const entryPath = path.join(dir, name);
		try {
			if (dirent.isDirectory()) {
				await walk(entryPath, baseDir, onFile, onError);
				return;
			}
			if (!/\.mdx?$/.test(name)) return;

			const relativePath = toPosix(path.relative(baseDir, entryPath));
			await onFile(entryPath, relativePath);
		} catch (error) {
			onError(entryPath, error);
		}
	});
}

function createEntryInfo(filePath: string, relativePath: string): EntryInfo {
	return {
		path: filePath,
		relativePath,
		get basename() {
			return path.basename(relativePath, path.extname(relativePath));
		},
	};
}

function createFrontmatterLoader(filePath: string): FrontmatterLoader {
	let promise: Promise<Frontmatter> | undefined;
	return () => {
		promise ??= readFile(filePath, 'utf-8').then(createFrontmatter);
		return promise;
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

const formatUrl: UrlFormatter = (...segments) => {
	return `/${segments.join('/').split('/').filter(Boolean).join('/')}/`;
};

function failureMessage(
	entryPath: string,
	error: unknown,
	root: string,
): string {
	const reason = error instanceof Error ? error.message : String(error);
	return `${path.relative(root, entryPath)}: ${reason}`;
}
