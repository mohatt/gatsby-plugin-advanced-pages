import { createSchemaCustomization } from '../plugin'
import { mountOptions } from '../../../test/node-utils'

describe('createSchemaCustomization', () => {
  const createTypes = jest.fn()
  const actions = { createTypes }
  const schema = { buildObjectType: (obj) => obj }

  it('correctly creates schema definitions', () => {
    mountOptions()

    let error = null
    try {
      createSchemaCustomization({
        actions,
        schema
      })
    } catch (e) {
      error = e
    }

    expect(error).toBeNull()
    expect(createTypes.mock.calls).toMatchSnapshot()
  })
})
