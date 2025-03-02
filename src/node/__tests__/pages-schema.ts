import { testPluginOptionsSchema } from 'gatsby-plugin-utils'
import testCases from './__fixtures__/pages-schema'
import { getPagesSchema } from '../schema'

describe('pagesSchema', () => {
  it.each(testCases)('$title', async ({ pages }) => {
    const { isValid, errors } = await testPluginOptionsSchema(
      ({ Joi }) => Joi.object({ pages: getPagesSchema(Joi) }),
      { pages },
    )

    expect(isValid).toMatchSnapshot()
    expect(errors).toMatchSnapshot()
  })
})
