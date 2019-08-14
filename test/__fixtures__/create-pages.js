export default [
  {
    id: 'home-about',
    routes: [
      { name: 'home', path: '/', page: { path: 'pages/home.md' } },
      { name: 'about', path: '/about', page: { path: 'pages/about.md' } },
      { name: 'aboutme', path: '/aboutme', page: { path: 'pages/about.md' } }
    ],
    pages: [
      {
        id: 'home-id',
        path: 'pages/home.md',
        template: 'index',
        helper: null,
        routes: [
          { name: 'home', path: '/' }
        ]
      },
      {
        id: 'about-id',
        path: 'pages/about.md',
        template: 'page',
        helper: null,
        routes: [
          { name: 'about', path: '/about' },
          { name: 'aboutme', path: '/aboutme' },
        ]
      },
    ],
    files: {
      templates: [ 'index', 'page' ]
    }
  },
  {
    id: 'duplicated-routes',
    throws: true,
    routes: [
      { name: 'about', path: '/about', page: { path: 'pages/about.md' } },
      { name: 'about', path: '/aboutdup', page: { path: 'pages/about2.md' } }
    ],
    pages: [
      {
        id: 'about-id',
        path: 'pages/about.md',
        template: 'page',
        helper: null,
        routes: [
          { name: 'about', path: '/about' }
        ]
      },
      {
        id: 'about2-id',
        path: 'pages/about2.md',
        template: 'page',
        helper: null,
        routes: [
          { name: 'about', path: '/aboutdup' },
        ]
      },
    ],
    files: {
      templates: [ 'page' ]
    }
  },
  {
    id: 'invalid-template',
    throws: true,
    routes: [
      { name: 'about', path: '/about', page: { path: 'pages/about.md' } },
    ],
    pages: [
      {
        id: 'about-id',
        path: 'pages/about.md',
        template: 'page',
        helper: null,
        routes: [
          { name: 'about', path: '/about' }
        ]
      }
    ]
  },
  {
    id: 'invalid-helper',
    throws: true,
    routes: [
      { name: 'about', path: '/about', page: { path: 'pages/about.md' } },
    ],
    pages: [
      {
        id: 'about-id',
        path: 'pages/about.md',
        template: 'page',
        helper: 'whatever',
        routes: [
          { name: 'about', path: '/about' }
        ]
      }
    ],
    files: {
      templates: [ 'page' ]
    }
  },
  {
    id: 'blog-paginated-auto-route',
    routes: [
      { name: 'blog', path: '/blog', page: { path: 'pages/blog.md' } }
    ],
    pages: [
      {
        id: 'blog-id',
        path: 'pages/blog.md',
        template: 'blog',
        helper: 'blog',
        routes: [
          { name: 'blog', path: '/blog' }
        ]
      }
    ],
    files: {
      templates: [ 'blog' ],
      helpers: {
        blog: function ({ createAdvancedPage }) {
          createAdvancedPage({
            route: 'blog',
            pagination: {
              count: 25
            }
          })
        }
      }
    }
  },
  {
    id: 'blog-paginated-manual-route',
    routes: [
      { name: 'blog', path: '/blog', page: { path: 'pages/blog.md' } },
      { name: 'blog.paginated', path: '/blog/what/:page', page: { path: 'pages/blog.md' } }
    ],
    pages: [
      {
        id: 'blog-id',
        path: 'pages/blog.md',
        template: 'blog',
        helper: 'blog',
        routes: [
          { name: 'blog', path: '/blog' },
          { name: 'blog.paginated', path: '/blog/what/:page' },
        ]
      }
    ],
    files: {
      templates: [ 'blog' ],
      helpers: {
        blog: function ({ createAdvancedPage }) {
          createAdvancedPage({
            route: 'blog',
            pagination: {
              route: 'blog.paginated',
              count: 25
            }
          })
        }
      }
    }
  },
  {
    id: 'dynamic-page',
    routes: [
      { name: 'page', path: '/pages/:page', page: { path: 'pages/page.md' } }
    ],
    pages: [
      {
        id: 'page-id',
        path: 'pages/page.md',
        template: 'page',
        helper: 'page',
        routes: [
          { name: 'page', path: '/pages/:page' },
        ]
      }
    ],
    files: {
      templates: [ 'page' ],
      helpers: {
        page: function ({ createAdvancedPage }) {
          for (const slug of ['hello', 'world']) {
            createAdvancedPage({
              route: 'page',
              params: {
                page: slug
              }
            })
          }
        }
      }
    }
  }
]
