import type { PageHelperFunction, PageNode } from '@/node'

const helper = '/path/to/helper.js'

export default <
  Array<{
    title: string
    throws?: boolean
    helper?: PageHelperFunction
    pages: PageNode[]
  }>
>[
  {
    title: 'correctly creates pages (home-about)',
    pages: [
      {
        id: 'home-id',
        template: '/path/to/index.js',
        helper: null,
        routes: [{ name: 'home', path: '/' }],
      },
      {
        id: 'about-id',
        template: '/path/to/page.js',
        helper: null,
        routes: [
          { name: 'about', path: '/about' },
          { name: 'aboutme', path: '/aboutme' },
        ],
      },
    ],
  },
  {
    title: 'correctly creates no pages',
    pages: [],
  },
  {
    title: 'throws error for (duplicated-routes)',
    throws: true,
    pages: [
      {
        id: 'about-id',
        template: '/path/to/page.js',
        helper: null,
        routes: [{ name: 'about', path: '/about' }],
      },
      {
        id: 'about2-id',
        template: '/path/to/page.js',
        helper: null,
        routes: [{ name: 'about', path: '/aboutdup' }],
      },
    ],
  },
  {
    title: 'throws error for (invalid-helper)',
    throws: true,
    pages: [
      {
        id: 'about-id',
        helper: '/path/to/whatever.js',
        routes: [{ name: 'about', path: '/about' }],
      },
    ],
  },
  {
    title: 'throws error for (bad-helper-js-error)',
    throws: true,
    pages: [
      {
        id: 'about-id',
        helper,
        routes: [{ name: 'about', path: '/about' }],
      },
    ],
    helper: () => {
      throw new Error('some error')
    },
  },
  {
    title: 'throws error for (bad-helper-empty)',
    throws: true,
    pages: [
      {
        id: 'about-id',
        helper,
        routes: [{ name: 'about', path: '/about' }],
      },
    ],
    helper: null,
  },
  {
    title: 'throws error for (bad-helper-invalid-type)',
    throws: true,
    pages: [
      {
        id: 'about-id',
        helper,
        routes: [{ name: 'about', path: '/about' }],
      },
    ],
    helper: 'invalid-helper-function',
  },
  {
    title: 'throws error for (bad-helper-empty-call)',
    throws: true,
    pages: [
      {
        id: 'about-id',
        helper,
        routes: [{ name: 'about', path: '/about' }],
      },
    ],
    helper: ({ createAdvancedPage }) => (<any>createAdvancedPage)(),
  },
  {
    title: 'throws error for (bad-helper-undefined-route)',
    throws: true,
    pages: [
      {
        id: 'about-id',
        helper,
        routes: [{ name: 'about', path: '/about' }],
      },
    ],
    helper: ({ createAdvancedPage }) => createAdvancedPage({ route: 'blog' }),
  },
  {
    title: 'throws error for (bad-helper-invalid-route-params)',
    throws: true,
    pages: [
      {
        id: 'about-id',
        helper,
        routes: [{ name: 'about', path: '/about/:name' }],
      },
    ],
    helper: ({ createAdvancedPage }) => createAdvancedPage({ route: 'about' }),
  },
  {
    title: 'throws error for (bad-helper-empty-pagination)',
    throws: true,
    pages: [
      {
        id: 'about-id',
        helper,
        routes: [{ name: 'about', path: '/about' }],
      },
    ],
    helper: ({ createAdvancedPage }) => {
      createAdvancedPage({
        route: 'about',
        pagination: <any>{},
      })
    },
  },
  {
    title: 'throws error for (bad-helper-invalid-pagination-count)',
    throws: true,
    pages: [
      {
        id: 'about-id',
        helper,
        routes: [{ name: 'about', path: '/about' }],
      },
    ],
    helper: ({ createAdvancedPage }) => {
      createAdvancedPage({
        route: 'about',
        pagination: {
          count: -15,
        },
      })
    },
  },
  {
    title: 'throws error for (bad-helper-invalid-pagination-limit)',
    throws: true,
    pages: [
      {
        id: 'about-id',
        helper,
        routes: [{ name: 'about', path: '/about' }],
      },
    ],
    helper: ({ createAdvancedPage }) => {
      createAdvancedPage({
        route: 'about',
        pagination: {
          count: 10,
          limit: -10,
        },
      })
    },
  },
  {
    title: 'throws error for (bad-helper-invalid-pagination-route)',
    throws: true,
    pages: [
      {
        id: 'about-id',
        helper,
        routes: [{ name: 'about', path: '/about' }],
      },
    ],
    helper: ({ createAdvancedPage }) => {
      createAdvancedPage({
        route: 'about',
        pagination: {
          count: 10,
          route: 'foo',
        },
      })
    },
  },
  {
    title: 'correctly creates pages (blog-paginated-auto-route)',
    pages: [
      {
        id: 'blog-id',
        template: '/path/to/blog.js',
        helper,
        routes: [{ name: 'blog', path: '/blog' }],
      },
    ],
    helper: ({ createAdvancedPage }) => {
      createAdvancedPage({
        route: 'blog',
        pagination: {
          count: 25,
        },
      })
    },
  },
  {
    title: 'correctly creates pages (blog-paginated-manual-route)',
    pages: [
      {
        id: 'blog-id',
        template: '/path/to/blog.js',
        helper,
        routes: [
          { name: 'blog', path: '/blog' },
          { name: 'blog.paginated', path: '/blog/what/:page' },
        ],
      },
    ],
    helper: ({ createAdvancedPage }) => {
      createAdvancedPage({
        route: 'blog',
        pagination: {
          route: 'blog.paginated',
          count: 25,
        },
      })
    },
  },
  {
    title: 'correctly creates pages (blog-paginated-custom-limit)',
    pages: [
      {
        id: 'blog-id',
        template: '/path/to/blog.js',
        helper,
        routes: [{ name: 'blog', path: '/blog' }],
      },
    ],
    helper: ({ createAdvancedPage }) => {
      createAdvancedPage({
        route: 'blog',
        pagination: {
          count: 25,
          limit: 8,
        },
      })
    },
  },
  {
    title: 'correctly creates pages (dynamic-page)',
    pages: [
      {
        id: 'page-id',
        template: '/path/to/page.js',
        helper,
        routes: [{ name: 'page', path: '/pages/:page' }],
      },
    ],
    helper: ({ createAdvancedPage }) => {
      for (const slug of ['hello', 'world']) {
        createAdvancedPage({
          route: 'page',
          params: {
            page: slug,
          },
        })
      }
    },
  },
  {
    title: 'correctly creates pages (page-context)',
    pages: [
      {
        id: 'about-id',
        template: '/path/to/page.js',
        helper,
        routes: [{ name: 'about', path: '/about/:name' }],
      },
    ],
    helper: ({ createAdvancedPage }) => {
      createAdvancedPage({
        route: 'about',
        params: {
          name: 'adam',
        },
        profile: {
          gender: 'male',
          age: 25,
        },
      })
      createAdvancedPage({
        route: 'about',
        params: {
          name: 'sara',
        },
        profile: {
          gender: 'female',
          age: 28,
        },
      })
    },
  },
]
