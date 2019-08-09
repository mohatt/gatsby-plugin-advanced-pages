export default [
  {
      title: 'testCase1',
      node: {
        id: `whatever`,
        frontmatter: {
          title: 'whatever',
          template: 'whatever',
          helper: 'whatever',
          data: 'whatever',
          routes: {
            whatever: '/whatever/path'
          }
        },
        parent: 'whatever',
        internal: {
          type: 'MarkdownRemark'
        },
      },
      parent: {
        dir: '/virtual/project/content/pages',
        relativePath: 'pages/home.md'
      }
  }
]
