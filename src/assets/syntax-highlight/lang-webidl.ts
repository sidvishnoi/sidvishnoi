type LanguageRegistration =
	import('../../../node_modules/shiki/dist/types.d.mts').LanguageRegistration;

export default {
	name: 'webidl',
	scopeName: 'source.webidl',
	fileTypes: ['webidl'],
	patterns: [
		{ include: '#comments' },
		{ include: '#extended-attributes' },
		{ include: '#keywords' },
		{ include: '#storage-types' },
		{ include: '#strings' },
		{ include: '#numbers' },
	],
	repository: {
		comments: {
			patterns: [
				{
					match: '//.*$',
					name: 'comment.line.double-slash.webidl',
					captures: {
						'0': { name: 'punctuation.definition.comment.webidl' },
					},
				},
				{
					begin: '/\\*',
					end: '\\*/',
					name: 'comment.block.webidl',
					captures: {
						'0': { name: 'punctuation.definition.comment.webidl' },
					},
				},
			],
		},
		'extended-attributes': {
			begin: '\\[',
			end: '\\]',
			name: 'meta.extended-attribute.webidl',
			patterns: [
				{
					match: '\\b[a-zA-Z_][a-zA-Z0-9_]*\\b',
					name: 'entity.other.attribute-name.webidl',
				},
				{ match: '=', name: 'keyword.operator.assignment.webidl' },
				{ include: '#strings' },
			],
		},
		keywords: {
			patterns: [
				{
					match:
						'\\b(interface|dictionary|enum|callback|typedef|partial|namespace|mixin|const|attribute|readonly|setter|getter|creator|deleter|legacycaller|stringifier|inherit|static|optional|required|iterable|maplike|setlike|async)\\b',
					name: 'storage.type.webidl',
				},
				{
					match: '\\b(implements|includes)\\b',
					name: 'keyword.control.webidl',
				},
			],
		},
		'storage-types': {
			patterns: [
				{
					match:
						'\\b(unsigned|long|short|float|double|boolean|byte|octet|any|void|object|unrestricted)\\b',
					name: 'storage.type.primitive.webidl',
				},
				{
					match:
						'\\b(DOMString|USVString|ByteString|sequence|record|Promise|FrozenArray|ObservableArray)\\b',
					name: 'support.class.webidl',
				},
			],
		},
		strings: {
			begin: '"',
			end: '"',
			name: 'string.quoted.double.webidl',
			patterns: [{ match: '\\\\.', name: 'constant.character.escape.webidl' }],
		},
		numbers: {
			match: '\\b[0-9]+(\\.[0-9]+)?\\b',
			name: 'constant.numeric.webidl',
		},
	},
} satisfies LanguageRegistration;
