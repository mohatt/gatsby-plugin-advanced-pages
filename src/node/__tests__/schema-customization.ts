import { setupPlugin } from '@test/util'
import { createSchemaCustomization } from '../plugin'

describe('createSchemaCustomization', () => {
  const createTypes = vi.fn()
  const actions = { createTypes }
  const schema = { buildObjectType: (obj) => obj }

  it('correctly creates schema definitions', () => {
    setupPlugin()

    let error = null
    try {
      createSchemaCustomization(<any>{ actions, schema })
    } catch (e) {
      error = e
    }

    expect(error).toBeNull()
    expect(createTypes.mock.calls).toMatchSnapshot()
  })
})
