# Gatsby Advanced Pages ![npm](https://img.shields.io/npm/v/gatsby-plugin-advanced-pages)

Gatsby Advanced Pages is a wrapper around [`createPage`](https://www.gatsbyjs.org/docs/actions/#createPage) action that allows easy creation of pages with dynamic features like pagination and custom routing.

> **Note:** The following documentation is incomplete and will be updated at a later time.

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
  - [Creating pages](#creating-pages)
    - [Simple pages](#simple-pages)
    - Page helpers
    - Custom routing
    - Adding pagination
    - Frontmatter metadata
    - `createAdvancedPage()`
  - Generating paths
    - Link component
- Example project
- [Configuration](#configuration)
  - [Defaults](#defaults)
  - [Base Path](#basepath)
  - [Default Template](#template)
  - [Directory Locations](#directories)
  - [Pagination](#pagination)
  - [GraphQL Types](#graphql-types)
- [License](#license)


## Prerequisites
You need to have a Markdown transformer plugin installed and configured before starting using this plugin. Currently, the following plugins are supported:
 - [gatsby-plugin-mdx](https://www.gatsbyjs.org/packages/gatsby-plugin-mdx/) — Supports using React components from within Markdown ([Official guide](https://www.gatsbyjs.org/docs/mdx/))
 - [gatsby-transformer-remark](https://www.gatsbyjs.org/packages/gatsby-transformer-remark/)

## Installation
Install with [npm](https://www.npmjs.com/)
```sh
$ npm install --save gatsby-plugin-advanced-pages
```
or [yarn](https://yarnpkg.com/)
```sh
$ yarn add gatsby-plugin-advanced-pages
```

## Usage

Add the plugin to your `gatsby-config.js` file in order to activate it

`gatsby-config.js`
```javascript
plugins: [
  {
    resolve: `gatsby-plugin-advanced-pages`,
    options: {
      // plugin options goes here
    }
  }
]
```

### Creating pages

#### Simple pages
In order to create your first page, create a new Markdown file for the new page under `content/pages`

`content/pages/hello.md`
```markdown
---
title: Hello, Wordld
template: page
routes:
  hello: /hello
---
## Hello, world!
This is a demo page for `gatsby-plugin-advanced-pages`.
Delete me, and get writing!
```

Create a template under `src/templates` to be used to render the page 

`src/templates/page.js`
```javascript
import React from "react"
import { graphql } from "gatsby"

const PageTemplate = ({ data }) => (
  <div>
    <h1>{data.page.title}</h1>
    <div>{data.page.body}</div>
  </div>
)

export const query = graphql`
  query PageQuery($id: String!) {
    page(id: { eq: $id }) {
      title
      body
    }
  }
`

export default PageTemplate
```

Run `gatsby develop` and open http://localhost/hello to see your new page.


## Configuration

### Defaults
Here is a full list of options with their default values that you can use to configure the plugin behaviour.

```javascript
// gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-advanced-pages`,
    options: {
      basePath: '/',
      engine: 'remark',
      template: null,
      directories: {
        pages: 'content/pages',
        templates: 'src/templates',
        helpers: 'gatsby/pages',
      },
      pagination: {
        limit: 10,
        suffix: '/page/:page'
      },
      typeNames: {
        page: 'Page',
        route: 'Route'
      }
    }
  }
]
```

### basePath
> Type: `String` Default: `/`

Root url for all pages created through the plugin

### engine
> Type: `String` Options: `mdx` | `remark` Default: `remark`

Specifies which Markdown transformer the plugin should use to transform markdown nodes into pages.

### template
> Type: `String` Default: `null`

Default template to be used for pages with no `template` metadata defined

### Directories

File System directories needed for the plugin to work

#### directories.pages
> Type: `String` Default: `content/pages`

Location of Markdown files that should be transformed into pages, any files outside this directory will be ignored

#### directories.templates
> Type: `String` Default: `src/templates`

Location of template components used to render pages

#### directories.helpers
> Type: `String` Default: `gatsby/pages`

Location of page helpers

### Pagination

Options for pagination functionality 

#### pagination.limit
> Type: `Number` Default: `10`

Default page size to be used when no `limit` parameter is passed to `createAdvancedPage()`

#### pagination.suffix
> Type: `String` Default: `/page/:page`

Suffix to be added to the original route to generate a paginated route. This is only used when no paginated route is passed to `createAdvancedPage()`

### GraphQL Types

Type names for the GraphQL Schema

#### typeNames.page
> Type: `String` Default: `Page`

Name of the page object type

#### typeNames.route
> Type: `String` Default: `Route`

Name of the route object type


## License
[MIT](https://github.com/mohatt/gatsby-plugin-advanced-pages/blob/master/license)