export default {
  routes: [
    { name: 'home', path: '/', page: { path: 'pages/home.md' } },
    { name: 'blog', path: '/blog', page: { path: 'pages/blog.md' } },
    { name: 'post', path: '/blog/:post', page: { path: 'pages/post.md' } },
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
      id: 'blog-id',
      path: 'pages/blog.md',
      template: 'blog',
      helper: 'blog',
      routes: [
        { name: 'blog', path: '/blog' }
      ]
    },
    {
      id: 'post-id',
      path: 'pages/post.md',
      template: 'blog-post',
      helper: 'blog-post',
      routes: [
        { name: 'post', path: '/blog/:post' }
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
    templates: [ 'index', 'blog', 'blog-post', 'page' ],
    helpers: {
      blog: function ({ createAdvancedPage }) {
        createAdvancedPage({
          route: 'blog',
          pagination: {
            count: 25
          }
        })
      },
      'blog-post': function ({ createAdvancedPage }) {
        for (const slug of ['hello-world', 'how-to-write-post']) {
          createAdvancedPage({
            route: 'post',
            params: {
              post: slug
            }
          })
        }
      }
    }
  }
}
