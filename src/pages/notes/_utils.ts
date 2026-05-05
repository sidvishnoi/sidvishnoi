import type { CollectionEntry } from 'astro:content';

export function getDateFromFilePath(filepath: string) {
	const [_, yyyy, mm, dd] = filepath.match(/(\d{4})\/(\d{2})-(\d{2})/)!;
	const date = new Date(`${yyyy}-${mm}-${dd}`);
	return date;
}

export function extendEntry(entry: CollectionEntry<'notes'>) {
	if (!entry.data.date) {
		entry.data.date = getDateFromFilePath(entry.filePath!);
	}
	return entry;
}
