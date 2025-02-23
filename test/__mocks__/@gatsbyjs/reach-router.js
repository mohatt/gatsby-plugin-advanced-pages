const { withPrefix } = require('../gatsby')
module.exports = {
  useLocation: jest.fn().mockReturnValue({
    pathname: withPrefix('/blog/page/5')
  })
}
