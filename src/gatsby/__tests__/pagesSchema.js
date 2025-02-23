import { testPluginOptionsSchema } from 'gatsby-plugin-utils'
import { pagesSchema } from '../schema'
import testCases from './__fixtures__/pagesSchema'

describe('pagesSchema', () => {
  for (const { title, pages } of testCases) {
    it(title, async () => {
      const { isValid, errors } = await testPluginOptionsSchema(
        ({ Joi }) => Joi.object({ pages: pagesSchema(Joi) }), { pages }
      )

      expect(isValid).toMatchSnapshot()
      expect(errors).toMatchSnapshot()
    })
  }
})
