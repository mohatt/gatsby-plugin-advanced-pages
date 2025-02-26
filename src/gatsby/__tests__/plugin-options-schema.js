import { testPluginOptionsSchema } from 'gatsby-plugin-utils'
import { pluginOptionsSchema } from '../plugin'
import testCases from './__fixtures__/plugin-options-schema'

describe('pluginOptionsSchema', () => {
  for (const { title, options } of testCases) {
    it(title, async () => {
      const { isValid, errors } = await testPluginOptionsSchema(pluginOptionsSchema, options)

      expect(isValid).toMatchSnapshot()
      expect(errors).toMatchSnapshot()
    })
  }
})
