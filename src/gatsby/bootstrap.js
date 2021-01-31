import { initializeOptions } from './util'
import { optionsSchema } from './schema'

// Validates user-defined options against schema
// runs before onPreBootstrap
export function pluginOptionsSchema ({ Joi }) {
  return optionsSchema(Joi)
}

export function onPreBootstrap ({ store }, pluginOptions) {
  // Initializes and validates options
  // Only runs once at bootstrap
  initializeOptions({ store, pluginOptions })
}
