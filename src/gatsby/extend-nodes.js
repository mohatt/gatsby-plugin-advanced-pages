const { getOption } = require('./util')

// Extend frontmatter type definition
module.exports = ({ type }) => {
  if (type.name === getOption('engine.typeName')) {
    return {
      'frontmatter.title': 'String',
      'frontmatter.routes': 'JSON',
      'frontmatter.template': 'String',
      'frontmatter.helper': 'String',
      'frontmatter.data': 'JSON',
    }
  }

  return {}
}
