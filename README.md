# Gatsby Advanced Pages

Wrapper around [`createPage`](https://www.gatsbyjs.org/docs/actions/#createPage) action for easy creation of pages with advanced features like pagination and custom routing.

> **Note:** The following documentation is incomplete and will be updated at a later time.

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
  - [Defaults](#defaults)
  - [Base Path](#basepath)
  - [Default Template](#template)
  - [Directory Locations](#directories)
  - [Pagination](#pagination)
  - [GraphQL Types](#typenames)
- [License](#license)


## Prerequisites
This plugin needs [gatsby-plugin-mdx](https://www.gatsbyjs.org/packages/gatsby-plugin-mdx/) to be installed in order to transform Markdown files into pages.
[Read more about Gatsby MDX plugin and how to install it](https://www.gatsbyjs.org/docs/mdx/)


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

First, add the plugin to your `gatsby-config.js` file in order to activate it

```javascript
// gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-advanced-pages`,
    options: {
      // options goes here
    }
  }
]
```


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

### template
> Type: `String` Default: `null`

Default template to be used for pages with no `template` metadata defined

### Directories

File System directories need for the plugin to work

#### directories.pages
> Type: `String` Default: `content/pages`

Location of Markdown files to  be treated as pages

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

### Type Names

Type names for the GraphQL Schema

#### typeNames.page
> Type: `String` Default: `Page`

Name of the page node type

#### typeNames.route
> Type: `String` Default: `Route`

Name of the route node type


## License
[MIT](https://github.com/mohatt/gatsby-plugin-advanced-pages/blob/master/license)