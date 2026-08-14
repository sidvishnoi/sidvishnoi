import path from 'node:path';
import { readFile } from 'node:fs/promises';

// Promise.all with a concurrency option (minimal, inlined `p-map`)
export async function pMap<T, R>(
	items: readonly T[],
	concurrency: number,
	mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
	const results: R[] = new Array(items.length);

	let nextIndex = 0;
	async function worker(): Promise<void> {
		while (true) {
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

export function toPosix(inputPath: string): string {
	return path.sep === '/' ? inputPath : inputPath.split(path.sep).join('/');
}

export function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function matchesPattern(
	relativePath: string,
	pattern: string | string[] | undefined,
): boolean {
	if (!pattern) return true;
	const patterns = Array.isArray(pattern) ? pattern : [pattern];
	const include = patterns.filter((p) => !p.startsWith('!'));
	const exclude = patterns
		.filter((p) => p.startsWith('!'))
		.map((p) => p.slice(1));

	if (
		include.length > 0 &&
		!include.some((p) => path.matchesGlob(relativePath, p))
	)
		return false;
	return !exclude.some((p) => path.matchesGlob(relativePath, p));
}

export function isWithin(parentDir: string, targetPath: string): boolean {
	const rel = path.relative(parentDir, targetPath);
	return (
		rel === '' || (rel.split(path.sep)[0] !== '..' && !path.isAbsolute(rel))
	);
}

export function debounce<Args extends unknown[]>(
	fn: (...args: Args) => void,
	delayMs: number,
): (...args: Args) => void {
	let timeout: ReturnType<typeof setTimeout> | undefined;
	return (...args: Args) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => fn(...args), delayMs);
	};
}

// `parseFrontmatter(..., { frontmatter: 'empty-with-spaces' })`, then trim body
export async function getFrontmatterLineOffset(
	filePath: string,
): Promise<number> {
	try {
		const content = await readFile(filePath, 'utf-8');
		const match = content.match(/^---\r?\n[\s\S]*?\r?\n---/);
		const blanked = match
			? match[0].replace(/[^\r\n]/g, ' ') + content.slice(match[0].length)
			: content;

		let offset = 0;
		for (const line of blanked.split(/\r\n|\r|\n/)) {
			if (line.trim() !== '') break;
			offset++;
		}
		return offset;
	} catch {
		return 0;
	}
}

export function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}
