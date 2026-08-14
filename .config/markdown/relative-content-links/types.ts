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
 * YAML parse).
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
