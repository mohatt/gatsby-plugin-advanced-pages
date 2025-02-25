module.exports = {
  presets: [
    ['babel-preset-gatsby-package', {
      browser: false,
      nodeVersion: '18.0.0',
      esm: !!process.env.BUILD_ESM,
    }]
  ]
}
