import type { CollectionEntry, RenderResult } from 'astro:content';

export function getDateFromFilePath(filepath: string) {
	const [_, yyyy, mm, dd] = filepath.match(/(\d{4})\/(\d{2})-(\d{2})/)!;
	const date = new Date(`${yyyy}-${mm}-${dd}`);
	return date;
}

export function extendEntry(
	entry: CollectionEntry<'notes'>,
	rendered: Pick<RenderResult, 'remarkPluginFrontmatter'>,
) {
	return {
		...entry,
		data: {
			...entry.data,
			heading: rendered.remarkPluginFrontmatter.heading as string,
			title: rendered.remarkPluginFrontmatter.heading as string,
			date: getDateFromFilePath(entry.filePath!),
		},
	};
}
