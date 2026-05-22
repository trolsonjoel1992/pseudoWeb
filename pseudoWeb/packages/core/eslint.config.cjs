const tsParser = require('@typescript-eslint/parser')
const tsPlugin = require('@typescript-eslint/eslint-plugin')

module.exports = [
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
  },
  {
    files: ['src/parser/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: "ThrowStatement > NewExpression[callee.name='Error']",
          message: 'Usar state.parserError() en lugar de throw new Error() dentro del parser',
        },
        {
          selector: "NewExpression[callee.name=/^(LexerError|ParserError|InterpreterError|RuntimeError)$/][arguments.0.type='Literal']",
          message: 'Prohibido instanciar errores con un string literal. Usar el objeto StructuredError con `code`.',
        },
      ],
    },
  },
]