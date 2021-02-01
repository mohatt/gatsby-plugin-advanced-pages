export default [
  {
    title: 'should invalidate empty fields',
    pages: [
      {
        title: '',
        template: '',
        helper: '',
        routes: {},
        data: {}
      }
    ]
  },
  {
    title: 'should invalidate required fields with missing values',
    pages: [
      {
        template: 'foo'
      }
    ]
  },
  {
    title: 'should invalidate fields with incorrect data types',
    pages: [
      {
        title: 15,
        template: {},
        helper: false,
        routes: [],
        data: 'foo'
      }
    ]
  },
  {
    title: 'should invalidate unknown fields ',
    pages: [
      {
        title: 'foo',
        routes: {
          foo: '/bar'
        },
        foo: true,
        data: {
          valid: 'foo'
        }
      }
    ]
  },
  {
    title: 'should invalidate routes with invalid values',
    pages: [
      {
        title: 'foo',
        routes: {
          foo: 'foo/bar'
        }
      },
      {
        title: 'bar',
        routes: {
          bar: ''
        }
      },
      {
        title: 'third',
        routes: {
          third: 15
        }
      }
    ]
  },
  {
    title: 'should validate correct fields',
    pages: [
      {
        title: 'foo',
        template: 'foo',
        helper: 'foo',
        routes: {
          foo: '/bar'
        },
        data: {
          foo: 'bar'
        }
      }
    ]
  }
]
