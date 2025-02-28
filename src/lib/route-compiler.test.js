import { RouteCompiler } from './route-compiler'

describe('RouteCompiler', () => {
  it('picks the correct route', () => {
    const routes = [
      {
        name: 'home',
        realpath: '/',
      },
      {
        name: 'blog',
        realpath: '/blog/',
      },
      {
        name: 'post',
        realpath: '/blog/:post',
      },
    ]

    expect(RouteCompiler.pick(routes, '/')).toHaveProperty('name', 'home')
    expect(RouteCompiler.pick(routes, '/blog')).toHaveProperty('name', 'blog')
    expect(RouteCompiler.pick(routes, '/blog/hello')).toHaveProperty('name', 'post')
    expect(RouteCompiler.pick(routes, '/blog/hello?var=test')).toHaveProperty('name', 'post')
    expect(RouteCompiler.pick(routes, '/blog/hello/')).toHaveProperty('name', 'post')
  })

  it('compiles routes correctly', () => {
    expect(RouteCompiler.compile('/blog/:post')({ post: 'hello' })).toBe('/blog/hello')
    expect(RouteCompiler.compile('/blog/:post/')({ post: 'hello' })).toBe('/blog/hello')
    expect(RouteCompiler.compile('/encode/:post', true)({ post: 'hello world' })).toBe(
      '/encode/hello%20world',
    )
    expect(RouteCompiler.compile('/no-encode/:post', false)({ post: 'hello world' })).toBe(
      '/no-encode/hello world',
    )
    expect(() => RouteCompiler.compile('/blog/:post')()).toThrow()
  })
})
