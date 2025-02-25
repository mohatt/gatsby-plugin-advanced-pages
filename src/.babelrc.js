module.exports = {
  presets: [
    ['babel-preset-gatsby-package', {
      browser: true,
      esm: !!process.env.BUILD_ESM,
    }]
  ]
}
