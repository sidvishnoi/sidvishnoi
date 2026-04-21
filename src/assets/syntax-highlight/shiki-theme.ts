type ThemeRegistration =
	import('../../../node_modules/shiki/dist/types.d.mts').ThemeRegistration;

export default {
	colors: {
		'editor.foreground': 'var(--shiki-foreground)',
		'editor.background': 'var(--shiki-background)',
	},
	tokenColors: [
		{
			scope: ['comment', 'punctuation.definition.comment'],
			settings: {
				foreground: 'var(--shiki-comment)',
				fontStyle: 'italic',
			},
		},
		{
			scope: ['storage.type', 'storage.modifier'],
			settings: { foreground: 'var(--shiki-storage)' },
		},
		{
			scope: [
				'punctuation',
				'keyword.operator',
				'meta.brace',
				'punctuation.separator',
				'punctuation.terminator',
				'punctuation.accessor',
				'punctuation.section.embedded',
			],
			settings: { foreground: 'var(--shiki-punctuation)' },
		},
		{
			scope: [
				'string',
				'punctuation.definition.string',
				'punctuation.definition.template-expression',
				'constant.numeric',
				'constant.character',
				'keyword.other.unit',
				'storage.type.numeric.bigint',
			],
			settings: { foreground: 'var(--shiki-data)' },
		},
		{
			scope: [
				'keyword.control',
				'keyword.other.import',
				'keyword.other.export',
			],
			settings: { foreground: 'var(--shiki-keyword)' },
		},
		{
			scope: [
				'variable.function',
				'meta.function-call',
				'support.function',
				'entity.name.function',
				'keyword.operator.new',
			],
			settings: { foreground: 'var(--shiki-accent)' },
		},
		{
			scope: [
				'meta.object-literal.key',
				'support.type.property-name',
				'support.type.property-name.json',
			],
			settings: { foreground: 'var(--shiki-object-key)' },
		},
		{
			scope: [
				'variable',
				'variable.other',
				'variable.other.readwrite',
				'variable.other.property',
				'variable.other.object.property',
				'variable.language.this',
				'variable.language.super',
				'variable.language.self',
				'variable.parameter',
			],
			settings: { foreground: 'var(--shiki-foreground)' },
		},
	],
} satisfies ThemeRegistration;
