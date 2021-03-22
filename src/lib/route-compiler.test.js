import { compile, pick } from './route-compiler'

describe('Route Compiler', () => {
  it('picks the correct route', () => {
    const routes = [
      {
        name: 'home',
        realpath: '/'
      },
      {
        name: 'blog',
        realpath: '/blog/'
      },
      {
        name: 'post',
        realpath: '/blog/:post'
      }
    ]

    expect(pick(routes, '/')).toHaveProperty('name', 'home')
    expect(pick(routes, '/blog')).toHaveProperty('name', 'blog')
    expect(pick(routes, '/blog/hello')).toHaveProperty('name', 'post')
    expect(pick(routes, '/blog/hello?var=test')).toHaveProperty('name', 'post')
    expect(pick(routes, '/blog/hello/')).toHaveProperty('name', 'post')
  })

  it('compiles routes correctly', () => {
    expect(compile('/blog/:post')({ post: 'hello' })).toBe('/blog/hello')
    expect(compile('/blog/:post/')({ post: 'hello' })).toBe('/blog/hello')
    expect(compile('/encode/:post', true)({ post: 'hello world' })).toBe('/encode/hello%20world')
    expect(compile('/no-encode/:post', false)({ post: 'hello world' })).toBe('/no-encode/hello world')
    expect(() => compile('/blog/:post')()).toThrow()
  })
})
