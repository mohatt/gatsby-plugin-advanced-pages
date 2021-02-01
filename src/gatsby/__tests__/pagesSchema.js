import { testPluginOptionsSchema } from 'gatsby-plugin-utils'
import { pagesSchema } from '../schema'
import testCases from '../../../test/__fixtures__/pagesSchema'

describe('pluginOptionsSchema', () => {
  for (const { title, pages } of testCases) {
    it(title, async () => {
      const { isValid, errors } = await testPluginOptionsSchema(
        ({ Joi }) => pagesSchema(Joi), pages
      )

      expect(isValid).toMatchSnapshot()
      expect(errors).toMatchSnapshot()
    })
  }
})
