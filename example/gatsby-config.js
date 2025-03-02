module.exports = {
  pathPrefix: `/gatsby-plugin-advanced-pages`,
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content`,
        name: `content`,
      },
    },
    `gatsby-transformer-remark`,
    `gatsby-plugin-advanced-pages`,
  ],
}
