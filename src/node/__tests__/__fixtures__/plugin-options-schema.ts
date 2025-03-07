import type { PluginOptions } from '@/node'

export default <Array<{ title: string; options: PluginOptions }>>[
  {
    title: 'should invalidate empty options',
    options: {
      basePath: '',
      pagination: {
        limit: 0,
        suffix: '',
      },
    },
  },
  {
    title: 'should invalidate options with incorrect data types',
    options: {
      basePath: 15,
      template: [],
      directories: '',
      pagination: {
        limit: '',
        suffix: null,
      },
      typeNames: false,
    },
  },
  {
    title: 'should invalidate options with incorrect values',
    options: {
      pagination: {
        limit: -15,
        suffix: '/some/path',
      },
    },
  },
  {
    title: 'should validate correct options',
    options: {
      basePath: 'foobar',
      template: 'foobar',
      directories: {
        templates: 'foobar',
        helpers: 'foobar',
      },
      pagination: {
        limit: 5,
        suffix: '/foobar/:page',
      },
      typeNames: {
        page: 'Foo',
        pageRoute: 'FooRoute',
      },
    },
  },
]
