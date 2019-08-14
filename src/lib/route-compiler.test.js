import { compile, pick } from './route-compiler'

describe(`Route Compiler`, () => {
  it(`picks the correct route`, () => {
    const routes = [
      {
        name: 'home',
        path: '/'
      },
      {
        name: 'blog',
        path: '/blog/'
      },
      {
        name: 'post',
        path: '/blog/:post'
      }
    ]

    expect(pick(routes, '/')).toHaveProperty('name', 'home')
    expect(pick(routes, '/blog')).toHaveProperty('name', 'blog')
    expect(pick(routes, '/blog/hello')).toHaveProperty('name', 'post')
    expect(pick(routes, '/blog/hello?var=test')).toHaveProperty('name', 'post')
    expect(pick(routes, '/blog/hello/')).toHaveProperty('name', 'post')
  })

  it(`compiles routes correctly`, () => {
    expect(compile('/blog/:post')({ post: 'hello' })).toBe('/blog/hello')
    expect(compile('/blog/:post/')({ post: 'hello' })).toBe('/blog/hello')
    expect(() => compile('/blog/:post/')()).toThrow()
  })
})