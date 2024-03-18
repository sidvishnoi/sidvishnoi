/** @type {import('prettier').Config} */
export default {
	tabWidth: 2,
	semi: true,
	useTabs: true,
	singleQuote: true,
	trailingComma: 'all',
	arrowParens: 'always',
	plugins: ['prettier-plugin-astro'],
	overrides: [
		{
			files: '*.astro',
			options: {
				parser: 'astro',
			},
		},
	],
};
