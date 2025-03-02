/**
 * @type {import('semantic-release').GlobalConfig}
 */
const config = {
  plugins: ['@semantic-release/changelog', '@semantic-release/npm', '@semantic-release/git'],
}

export default config
