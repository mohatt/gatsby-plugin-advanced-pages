import type { PageOptions, PluginOptions } from '@/node'

export default <
  Array<{
    title: string
    throws?: boolean
    files: Array<string | { path: string; data: string | PageOptions[] }>
    options?: PluginOptions
  }>
>[
  {
    title: 'correctly creates page nodes from inline pages config',
    throws: false,
    files: ['./src/templates/test.js', './gatsby/custom/helper.js'],
    options: {
      pages: [
        {
          title: 'foo',
          template: './src/templates/test.js',
          routes: {
            foo: '/foo',
          },
        },
        {
          title: 'bar-file',
          template: './src/templates/test.js',
          helper: './gatsby/custom/helper.js',
          routes: {
            bar1: '/bar-file',
          },
        },
        {
          title: 'bar-inline',
          template: './src/templates/test.js',
          helper: () => {},
          routes: {
            bar2: '/bar-inline',
          },
        },
      ],
    },
  },
  {
    title: 'correctly creates page nodes from pages.config.js',
    throws: false,
    files: [
      './src/templates/test.js',
      './gatsby/pages/test.js',
      {
        path: './pages.config.js',
        data: [
          {
            title: 'foo',
            template: './src/templates/test.js',
            routes: {
              foo: '/foo',
            },
          },
          {
            title: 'bar',
            template: './src/templates/test.js',
            helper: 'test.js',
            routes: {
              bar: '/bar',
            },
          },
          {
            title: 'bar-inline',
            template: './src/templates/test.js',
            helper: () => {},
            routes: {
              bar2: '/bar-inline',
            },
          },
        ],
      },
    ],
  },
  {
    title: 'correctly creates page nodes from pages.config.json',
    throws: false,
    files: [
      './src/templates/test.js',
      {
        path: './pages.config.json',
        data: JSON.stringify(
          <PageOptions[]>[
            {
              title: 'foo',
              template: './src/templates/test.js',
              routes: {
                foo: '/foo',
              },
            },
          ],
          null,
          2,
        ),
      },
    ],
  },
  {
    title: 'correctly creates page nodes from pages.config.yaml',
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
`,
      },
    ],
  },
  {
    title: 'correctly ignores pages config file in favor of inline pages config',
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
              foo: '/foo',
            },
          },
        ],
      },
    ],
    options: {
      pages: [
        {
          title: 'foo-inline',
          template: './src/templates/test.js',
          routes: {
            foo: '/foo-inline',
          },
        },
        {
          title: 'bar-inline',
          template: './src/templates/test.js',
          helper: () => {},
          routes: {
            bar: '/bar-inline',
          },
        },
      ],
    },
  },
  {
    title: 'correctly creates multiple page nodes with various configurations',
    throws: false,
    files: [
      './src/templates/default.js',
      './src/templates/test.js',
      './src/custom/template.js',
      './gatsby/pages/helper.js',
      './gatsby/custom/helper.js',
      {
        path: './pages.config.yml',
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
`,
      },
    ],
  },
  {
    title: 'shows a warning for non existing pages config file',
    throws: true,
    files: [],
  },
  {
    title: 'throws for invalid JSON syntax in pages.config.json',
    throws: true,
    files: [
      {
        path: './pages.config.json',
        data: JSON.stringify(
          <PageOptions[]>[
            {
              title: 'foo',
              template: './src/templates/test.js',
              routes: {
                foo: '/foo',
              },
            },
          ],
          null,
          2,
        ).slice(0, -1),
      },
    ],
  },
  {
    title: 'throws for invalid YAML syntax in pages.config.yaml',
    throws: true,
    files: [
      {
        path: './pages.config.yaml',
        data: `
- title: foo
  template: ./src/templates/test.js
  routes:
    foo: /foo
    bar: /bar
  invalid_yaml_entry
`,
      },
    ],
  },
  {
    title: 'throws for invalid pages config file schema',
    throws: true,
    files: [
      {
        path: './pages.config.yaml',
        data: `
- title: foo
  routes:
    foo: foo/bar
`,
      },
    ],
  },
  {
    title: 'throws for pages with invalid template',
    throws: true,
    files: [
      {
        path: './pages.config.yaml',
        data: `
- title: foo
  template: ./no/template.js
  routes:
    foo: /foo
`,
      },
    ],
  },
  {
    title: 'throws for pages with no template',
    throws: true,
    files: [
      {
        path: './pages.config.yaml',
        data: `
- title: foo
  routes:
    foo: /foo
`,
      },
    ],
  },
  {
    title: 'does not throw for an empty pages config file',
    throws: false,
    files: [
      {
        path: './pages.config.json',
        data: JSON.stringify([], null, 2),
      },
    ],
  },
]
