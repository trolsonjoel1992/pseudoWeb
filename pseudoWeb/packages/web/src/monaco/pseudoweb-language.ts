import { KEYWORDS } from '@pseudoweb/core'
import type * as MonacoEditor from 'monaco-editor'

export const PSEUDOWEB_LANGUAGE_ID = 'pseudoweb'

const LITERAL_WORDS = ['verdadero', 'falso']
const KEYWORD_WORDS = Object.keys(KEYWORDS).filter(
  (word) => !LITERAL_WORDS.includes(word) && !['y', 'o', 'no'].includes(word)
)
const TYPE_KEYWORDS = ['entero', 'real', 'caracter', 'alfanumerico', 'logico']
const OPERATOR_WORDS = ['div', 'mod', 'y', 'o', 'no']

let isLanguageRegistered = false

export function registerPseudoWebLanguage(monaco: typeof MonacoEditor): void {
  if (isLanguageRegistered) return

  monaco.languages.register({ id: PSEUDOWEB_LANGUAGE_ID })

  monaco.languages.setLanguageConfiguration(PSEUDOWEB_LANGUAGE_ID, {
    comments: {
      lineComment: '//',
      blockComment: ['/*', '*/'],
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"', notIn: ['string', 'comment'] },
      { open: "'", close: "'", notIn: ['string', 'comment'] },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
  })

  monaco.languages.setMonarchTokensProvider(PSEUDOWEB_LANGUAGE_ID, {
    defaultToken: '',
    tokenPostfix: '.pseudoweb',
    ignoreCase: true,
    keywords: KEYWORD_WORDS,
    literals: LITERAL_WORDS,
    typeKeywords: TYPE_KEYWORDS,
    operatorWords: OPERATOR_WORDS,
    symbols: /[=><!~?:&|+\-*/%^]+/,
    tokenizer: {
      root: [
        { include: '@whitespace' },
        [/\/\/.*/, 'comment'],
        [/\/\*/, { token: 'comment', next: '@blockComment' }],
        [/"/, { token: 'string.quote', next: '@doubleString' }],
        [/'/, { token: 'string.quote', next: '@singleString' }],
        [/\d+\.\d+/, 'number.float'],
        [/\d+/, 'number'],
        [/[a-zA-ZáéíóúÁÉÍÓÚñÑ_][\wáéíóúÁÉÍÓÚñÑ_]*/, {
          cases: {
            '@typeKeywords': 'type',
            '@literals': 'constant.language',
            '@operatorWords': 'operator',
            '@keywords': 'keyword',
            '@default': 'identifier',
          },
        }],
        [/@symbols/, 'operator'],
        [/[{}()[\]]/, '@brackets'],
        [/[,.;:]/, 'delimiter'],
        [/[^\s]/, 'invalid'],
      ],
      whitespace: [
        [/\s+/, 'white'],
      ],
      doubleString: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape'],
        [/"/, { token: 'string.quote', next: '@pop' }],
        [/\n/, { token: 'invalid', next: '@pop' }],
      ],
      singleString: [
        [/[^\\']+/, 'string'],
        [/\\./, 'string.escape'],
        [/'/, { token: 'string.quote', next: '@pop' }],
        [/\n/, { token: 'invalid', next: '@pop' }],
      ],
      blockComment: [
        [/[^*]+/, 'comment'],
        [/\*\//, { token: 'comment', next: '@pop' }],
        [/\*/, 'comment'],
      ],
    },
  })

  isLanguageRegistered = true
}