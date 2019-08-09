export default {
  home: {
    path: '/',
    scopes: {}
  },
  about: {
    path: '/about',
    scopes: {}
  },
  blog: {
    path: '/blog',
    scopes: {
      pagination: '/blog/page/:page'
    }
  },
  'blog.author': {
    path: '/blog/author/:author',
    scopes: {
      pagination: '/blog/author/:author/page/:page'
    }
  },
  'blog.tag': {
    path: '/blog/tag/:tag',
    scopes: {
      pagination: '/blog/tag/:tag/page/:page'
    }
  },
  'blog.post': {
    path: '/blog/post/:post',
    scopes: {}
  }
}
