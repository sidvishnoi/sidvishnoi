export function withParams(
	url: string | URL,
	params: Record<string, string> = {},
) {
	url = new URL(url);
	for (const [key, val] of Object.entries(params)) {
		url.searchParams.set(key, val);
	}
	return url;
}

export function mdBackticksToHTML(str: string) {
	return str.replace(/`([^`]+)`/g, '<code>$1</code>');
}
