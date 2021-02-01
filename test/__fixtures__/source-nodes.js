export default [
  {
    title: 'correctly creates Page nodes from a pages.config.js',
    throws: false,
    files: [
      './src/templates/test.js',
      {
        path: './pages.config.js',
        data: [
          {
            title: 'foo',
            template: './src/templates/test.js',
            routes: {
              foo: '/foo'
            }
          }
        ]
      }
    ],
  },
  {
    title: 'correctly creates Page nodes from a pages.config.json',
    throws: false,
    files: [
      './src/templates/test.js',
      {
        path: './pages.config.json',
        data: [
          {
            title: 'foo',
            template: './src/templates/test.js',
            routes: {
              foo: '/foo'
            }
          }
        ]
      }
    ],
  },
  {
    title: 'correctly creates Page nodes from a pages.config.yaml',
    throws: false,
    files: [
      './src/templates/test.js',
      {
        path: './pages.config.yaml',
        data: `
- title: foo
  template: ./src/templates/test.js
  routes:
    foo: /foo
`
      }
    ],
  },
  {
    title: 'correctly creates multiple Page nodes with various configurations',
    throws: false,
    files: [
      './src/templates/default.js',
      './src/templates/test.js',
      './src/custom/template.js',
      './gatsby/pages/helper.js',
      './gatsby/custom/helper.js',
      {
        path: './pages.config.yaml',
        data: `
- title: foo
  template: default.js
  helper: helper.js
  routes:
    foo: /foo
    foo.bar: /foo/bar
- title: lorem
  template: test.js
  routes:
    lorem: /lorem
- title: ipsum
  template: ./src/custom/template.js
  helper: ./gatsby/custom/helper.js
  data: 
    name: john
    title: don
  routes:
    ipsum: /ipsum
    dolor: /dolor
    sit: /sit/amet
`
      }
    ],
  },
  {
    title: 'throws and error for non existing pages config file',
    throws: true,
    files: [],
  },
  {
    title: 'throws and error for invalid pages config file',
    throws: true,
    files: [
      {
        path: './pages.config.yaml',
        data: `
- title: foo
  routes:
    foo: foo/bar
`
      }
    ],
  },
  {
    title: 'throws and error when pages don not have a valid template',
    throws: true,
    files: [
      {
        path: './pages.config.yaml',
        data: `
- title: foo
  template: ./no/template.js
  routes:
    foo: /foo
`
      }
    ],
  },
  {
    title: 'throws and error when pages don not have a template',
    throws: true,
    files: [
      {
        path: './pages.config.yaml',
        data: `
- title: foo
  routes:
    foo: /foo
`
      }
    ],
  },
]
