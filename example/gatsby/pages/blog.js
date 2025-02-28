async function createFeedPages({ graphql, page, createAdvancedPage }) {
  const result = await graphql(`
    {
      allMarkdownRemark(filter: { fileAbsolutePath: { regex: "/(blog)/.*.md$/" } }) {
        totalCount
        group(field: { frontmatter: { tags: SELECT } }) {
          fieldValue
          totalCount
        }
      }
    }
  `)

  if (result.errors) {
    throw result.errors
  }

  // blog index feed pages
  createAdvancedPage({
    route: 'blog',
    pagination: {
      count: result.data.allMarkdownRemark.totalCount,
      limit: 3,
    },
    filter: {
      fileAbsolutePath: {
        regex: '/(blog)/.*\\.md$/',
      },
    },
  })

  // tag feed pages
  for (const tag of result.data.allMarkdownRemark.group) {
    createAdvancedPage({
      route: 'blog.tag',
      params: {
        tag: tag.fieldValue,
      },
      pagination: {
        count: tag.totalCount,
        limit: 3,
      },
      filter: {
        fileAbsolutePath: {
          regex: '/(blog)/.*\\.md$/',
        },
        frontmatter: {
          tags: { in: tag.fieldValue },
        },
      },
    })
  }
}

async function createPostPages({ graphql, page, createAdvancedPage }) {
  const result = await graphql(`
    {
      allMarkdownRemark(filter: { fileAbsolutePath: { regex: "/(blog)/.*.md$/" } }) {
        nodes {
          frontmatter {
            slug
          }
        }
      }
    }
  `)

  if (result.errors) {
    throw result.errors
  }

  // blog posts pages
  for (const post of result.data.allMarkdownRemark.nodes) {
    createAdvancedPage({
      route: 'blog.post',
      params: { post: post.frontmatter.slug },
    })
  }
}

module.exports = async (args) => {
  switch (args.page.templateName) {
    case 'blog.js':
      await createFeedPages(args)
      break
    case 'post.js':
      await createPostPages(args)
      break
  }
}
