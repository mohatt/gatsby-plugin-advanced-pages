/**
 * @type {import('prettier').Config}
 */
const config = {
  singleQuote: true,
  jsxSingleQuote: true,
  arrowParens: 'always',
  trailingComma: 'all',
  semi: false,
  printWidth: 100,
  plugins: ['prettier-plugin-packagejson'],
}

export default config
