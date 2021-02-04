const helper = '/path/to/helper.js'
export default [
  {
    id: 'home-about',
    pages: [
      {
        id: 'home-id',
        template: '/path/to/index.js',
        helper: null,
        routes: [
          { name: 'home', path: '/' }
        ]
      },
      {
        id: 'about-id',
        template: '/path/to/page.js',
        helper: null,
        routes: [
          { name: 'about', path: '/about' },
          { name: 'aboutme', path: '/aboutme' }
        ]
      }
    ]
  },
  {
    id: 'duplicated-routes',
    throws: true,
    pages: [
      {
        id: 'about-id',
        template: '/path/to/page.js',
        helper: null,
        routes: [
          { name: 'about', path: '/about' }
        ]
      },
      {
        id: 'about2-id',
        template: '/path/to/page.js',
        helper: null,
        routes: [
          { name: 'about', path: '/aboutdup' }
        ]
      }
    ]
  },
  {
    id: 'invalid-helper',
    throws: true,
    pages: [
      {
        id: 'about-id',
        helper: '/path/to/whatever.js',
        routes: [
          { name: 'about', path: '/about' }
        ]
      }
    ]
  },
  {
    id: 'bad-helper-js-error',
    throws: true,
    pages: [
      {
        id: 'about-id',
        helper: helper,
        routes: [
          { name: 'about', path: '/about' }
        ]
      }
    ],
    helper: () => { throw new Error('some error') }
  },
  {
    id: 'bad-helper-empty-call',
    throws: true,
    pages: [
      {
        id: 'about-id',
        helper: helper,
        routes: [
          { name: 'about', path: '/about' }
        ]
      }
    ],
    helper: ({ createAdvancedPage }) => createAdvancedPage()
  },
  {
    id: 'bad-helper-undefined-route',
    throws: true,
    pages: [
      {
        id: 'about-id',
        helper: helper,
        routes: [
          { name: 'about', path: '/about' }
        ]
      }
    ],
    helper: ({ createAdvancedPage }) => createAdvancedPage({ route: 'blog' })
  },
  {
    id: 'bad-helper-invalid-route-params',
    throws: true,
    pages: [
      {
        id: 'about-id',
        helper: helper,
        routes: [
          { name: 'about', path: '/about/:name' }
        ]
      }
    ],
    helper: ({ createAdvancedPage }) => createAdvancedPage({ route: 'about' })
  },
  {
    id: 'bad-helper-empty-pagination',
    throws: true,
    pages: [
      {
        id: 'about-id',
        helper: helper,
        routes: [
          { name: 'about', path: '/about' }
        ]
      }
    ],
    helper: ({ createAdvancedPage }) => {
      createAdvancedPage({
        route: 'about',
        pagination: {}
      })
    }
  },
  {
    id: 'bad-helper-invalid-pagination-count',
    throws: true,
    pages: [
      {
        id: 'about-id',
        helper: helper,
        routes: [
          { name: 'about', path: '/about' }
        ]
      }
    ],
    helper: ({ createAdvancedPage }) => {
      createAdvancedPage({
        route: 'about',
        pagination: {
          count: -15
        }
      })
    }
  },
  {
    id: 'bad-helper-invalid-pagination-limit',
    throws: true,
    pages: [
      {
        id: 'about-id',
        helper: helper,
        routes: [
          { name: 'about', path: '/about' }
        ]
      }
    ],
    helper: ({ createAdvancedPage }) => {
      createAdvancedPage({
        route: 'about',
        pagination: {
          count: 10,
          limit: -10
        }
      })
    }
  },
  {
    id: 'bad-helper-invalid-pagination-route',
    throws: true,
    pages: [
      {
        id: 'about-id',
        helper: helper,
        routes: [
          { name: 'about', path: '/about' }
        ]
      }
    ],
    helper: ({ createAdvancedPage }) => {
      createAdvancedPage({
        route: 'about',
        pagination: {
          count: 10,
          route: 'foo'
        }
      })
    }
  },
  {
    id: 'blog-paginated-auto-route',
    pages: [
      {
        id: 'blog-id',
        template: '/path/to/blog.js',
        helper: helper,
        routes: [
          { name: 'blog', path: '/blog' }
        ]
      }
    ],
    helper: ({ createAdvancedPage }) => {
      createAdvancedPage({
        route: 'blog',
        pagination: {
          count: 25
        }
      })
    }
  },
  {
    id: 'blog-paginated-manual-route',
    pages: [
      {
        id: 'blog-id',
        template: '/path/to/blog.js',
        helper: helper,
        routes: [
          { name: 'blog', path: '/blog' },
          { name: 'blog.paginated', path: '/blog/what/:page' }
        ]
      }
    ],
    helper: ({ createAdvancedPage }) => {
      createAdvancedPage({
        route: 'blog',
        pagination: {
          route: 'blog.paginated',
          count: 25
        }
      })
    }
  },
  {
    id: 'blog-paginated-custom-limit',
    pages: [
      {
        id: 'blog-id',
        template: '/path/to/blog.js',
        helper: helper,
        routes: [
          { name: 'blog', path: '/blog' }
        ]
      }
    ],
    helper: ({ createAdvancedPage }) => {
      createAdvancedPage({
        route: 'blog',
        pagination: {
          count: 25,
          limit: 8
        }
      })
    }
  },
  {
    id: 'dynamic-page',
    pages: [
      {
        id: 'page-id',
        template: '/path/to/page.js',
        helper: helper,
        routes: [
          { name: 'page', path: '/pages/:page' }
        ]
      }
    ],
    helper: ({ createAdvancedPage }) => {
      for (const slug of ['hello', 'world']) {
        createAdvancedPage({
          route: 'page',
          params: {
            page: slug
          }
        })
      }
    }
  },
  {
    id: 'page-context',
    pages: [
      {
        id: 'about-id',
        template: '/path/to/page.js',
        helper: helper,
        routes: [
          { name: 'about', path: '/about/:name' }
        ]
      }
    ],
    helper: ({ createAdvancedPage }) => {
      createAdvancedPage({
        route: 'about',
        params: {
          name: 'adam'
        },
        profile: {
          gender: 'male',
          age: 25
        }
      })
      createAdvancedPage({
        route: 'about',
        params: {
          name: 'sara'
        },
        profile: {
          gender: 'female',
          age: 28
        }
      })
    }
  }
]
