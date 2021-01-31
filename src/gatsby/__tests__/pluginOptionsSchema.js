import { testPluginOptionsSchema } from "gatsby-plugin-utils"
import { pluginOptionsSchema } from '../'
import testCases from '../../../test/__fixtures__/pluginOptionsSchema'

describe('pluginOptionsSchema', () => {
  for (const { title, options } of testCases) {
    it(title, async () => {
      const { isValid, errors } = await testPluginOptionsSchema(
        pluginOptionsSchema,
        options
      )

      expect(isValid).toMatchSnapshot()
      expect(errors).toMatchSnapshot()
    })
  }
})
