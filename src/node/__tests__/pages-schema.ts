import { testPluginOptionsSchema } from 'gatsby-plugin-utils'
import testCases from './__fixtures__/pages-schema'
import { getPagesSchema } from '../schema'

describe('pagesSchema', () => {
  for (const { title, pages } of testCases) {
    it(title, async () => {
      const { isValid, errors } = await testPluginOptionsSchema(
        ({ Joi }) => Joi.object({ pages: getPagesSchema(Joi) }),
        { pages },
      )

      expect(isValid).toMatchSnapshot()
      expect(errors).toMatchSnapshot()
    })
  }
})
