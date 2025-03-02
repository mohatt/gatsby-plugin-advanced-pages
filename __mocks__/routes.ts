import type { SerializedRoute } from '@/node'

export default <SerializedRoute[]>[
  {
    name: 'home',
    path: '/',
    scopes: {},
  },
  {
    name: 'about',
    path: '/about',
    scopes: {},
  },
  {
    name: 'blog',
    path: '/blog',
    scopes: {
      pagination: '/blog/page/:page',
    },
  },
  {
    name: 'blog.author',
    path: '/blog/author/:author',
    scopes: {
      pagination: '/blog/author/:author/page/:page',
    },
  },
  {
    name: 'blog.tag',
    path: '/blog/tag/:tag',
    scopes: {
      pagination: '/blog/tag/:tag/page/:page',
    },
  },
  {
    name: 'blog.post',
    path: '/blog/post/:post',
    scopes: {},
  },
]
