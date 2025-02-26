import { testPluginOptionsSchema } from 'gatsby-plugin-utils'
import { getPagesSchema } from '../schema'
import testCases from './__fixtures__/pages-schema'

describe('pagesSchema', () => {
  for (const { title, pages } of testCases) {
    it(title, async () => {
      const { isValid, errors } = await testPluginOptionsSchema(
        ({ Joi }) => Joi.object({ pages: getPagesSchema(Joi) }), { pages }
      )

      expect(isValid).toMatchSnapshot()
      expect(errors).toMatchSnapshot()
    })
  }
})
