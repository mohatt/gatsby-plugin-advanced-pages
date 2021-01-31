import { initializeOptions } from './util'
import { optionsSchema } from './schema'

export function onPreBootstrap ({ store }, pluginOptions) {
  // Initializes and validates options
  // Only runs once at bootstrap
  initializeOptions({ store, pluginOptions })
}

export function pluginOptionsSchema ({ Joi }) {
 return optionsSchema(Joi)
}