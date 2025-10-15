# Gatsby Advanced Pages

[![][npm-img]][npm-url] [![][ci-img]][ci-url] [![][codecov-img]][codecov-url] [![][demo-img]][demo-url] [![][gatsby-img]][gatsby-url] [![][license-img]][license-url]

**Gatsby Advanced Pages** is a wrapper around Gatsby's [createPage](https://www.gatsbyjs.org/docs/actions/#createPage) API, making it easier to create pages with advanced features like pagination and custom routing.

- [Installation](#installation)
- [Demo](#demo)
- [Usage](#usage)
  - [TypeScript](#typescript)
  - [Creating pages](#creating-pages)
  - [Page helpers](#page-helpers)
  - [Passing data to templates](#passing-data-to-templates)
  - [Generating paths](#generating-paths)
- [Components](#components)
  - [Link component](#link-component)
  - [Pagination component](#pagination-component)
- [Hooks](#hooks)
- [Functions](#functions)
- [Configuration](#configuration)
  - [Pages](#pages)
  - [Plugin options](#plugin-options)
- [License](#license)

## Installation

Install using [npm](https://www.npmjs.com/):

```sh
npm install gatsby-plugin-advanced-pages
```

Or with [Yarn](https://yarnpkg.com/):

```sh
yarn add gatsby-plugin-advanced-pages
```

## Demo

Check out the [example directory](https://github.com/mohatt/gatsby-plugin-advanced-pages/tree/master/example) for sample implementations.

A **live demo** is available at: [mohatt.github.io/gatsby-plugin-advanced-pages](http://mohatt.github.io/gatsby-plugin-advanced-pages).

## Usage

To enable the plugin, add it to your `gatsby-config.js`:

```javascript
plugins: [
  {
    resolve: 'gatsby-plugin-advanced-pages',
    options: {
      // Plugin options goes here
    },
  },
]
```

### TypeScript

The plugin is fully **type-safe** and provides comprehensive TypeScript typings for all its exports.

if you’re using Typescript, add it to your `gatsby-config.ts` like this:

```typescript
import type { PluginOptions as AdvancedPagesOptions } from 'gatsby-plugin-advanced-pages/node'

plugins: [
  {
    resolve: 'gatsby-plugin-advanced-pages',
    options: {
      // Plugin options goes here
    } as AdvancedPagesOptions,
  },
]
```

### Creating pages

To create a new page, define your routes in `pages.config.yaml` (or JSON/JS) at the root of your project:

```yaml
# pages.config.yaml
- title: Hello, World
  template: hello.js
  routes:
    hello: /hello
```

Next, create the corresponding template file under `src/templates`:

```javascript
// src/templates/hello.js
import * as React from 'react'
import { graphql } from 'gatsby'

const HelloPage = ({ data }) => (
  <div>
    <h1>{data.page.title}</h1>
    <p>Welcome to Gatsby Advanced Pages!</p>
  </div>
)

export const query = graphql`
  query HelloPageQuery($id: String!) {
    page(id: { eq: $id }) {
      title
    }
  }
`

export default WelcomePage
```

Run `gatsby develop`, then visit `http://localhost/hello` to see your new page.

### Page helpers

For more advanced pages, define a **page helper** function that runs in Gatsby’s [createPage](https://www.gatsbyjs.org/docs/actions/#createPage) lifecycle.

For example, to create a **blog index page with pagination**, first update `pages.config.yaml`:

> **Note:** You will need [gatsby-transformer-remark](https://www.gatsbyjs.org/packages/gatsby-transformer-remark/) plugin installed for this example to work

```yaml
# pages.config.yaml
- title: Blog
  routes:
    blog: /blog
  template: blog-template.js
  helper: blog-helper.js
```

Next, create the page helper under `gatsby/pages`

```javascript
// gatsby/pages/blog-helper.js
module.exports = async function ({ graphql, page, createAdvancedPage }) {
  const result = await graphql(`
    {
      allMarkdownRemark(filter: { frontmatter: { type: { eq: "post" } } }) {
        totalCount
      }
    }
  `)

  if (result.errors) {
    throw result.errors
  }

  createAdvancedPage({
    route: 'blog',
    pagination: {
      count: result.data.allMarkdownRemark.totalCount,
      limit: 3,
    },
  })
}
```

> **Note:** Page helpers can also be defined as **inline functions** using `pages.config.js` or as [inline plugin options](#configuration) in `gatsby-config.js`.

Finally, create the template file under `src/templates`:

```javascript
// src/templates/blog-template.js
import * as React from 'react'
import { graphql } from 'gatsby'
import { Pagination } from 'gatsby-plugin-advanced-pages'

const BlogTemplate = ({ data }) => (
  <div>
    <h1>{data.page.title}</h1>
    <div>
      {data.allMarkdownRemark.edges.map(({ node }) => (
        <div key={node.frontmatter.slug}>
          <h2>{node.frontmatter.title}</h2>
          <p>{node.excerpt}</p>
        </div>
      ))}
    </div>
    <Pagination route='blog' pageInfo={data.allMarkdownRemark.pageInfo} ui='simple' />
  </div>
)

export const query = graphql`
  query BlogQuery($id: String!, $limit: Int!, $offset: Int!) {
    page(id: { eq: $id }) {
      title
    }
    allMarkdownRemark(
      limit: $limit
      skip: $offset
      filter: { frontmatter: { type: { eq: "post" } } }
    ) {
      edges {
        node {
          frontmatter {
            title
            slug
          }
          excerpt(pruneLength: 200)
        }
      }
      pageInfo {
        ...Pagination
      }
    }
  }
`

export default BlogTemplate
```

Now assuming you have 12 blog posts (stored as Markdown files), the plugin will create the following pages:

- /blog
- blog/page/2
- blog/page/3
- blog/page/4

if you want to customize the paginated paths, you can include a `route` in your pagination object that's being passed to `createAdvancedPage()`. See below:

```yaml
# pages.config.yaml
- title: Blog
  routes:
    blog: /blog
    blog.paginated: /blog/what/ever/:page
  template: blog-template.js
  helper: blog-helper.js
```

```javascript
// gatsby/pages/blog-helper.js
// [...]
createAdvancedPage({
  route: 'blog',
  pagination: {
    route: 'blog.paginated',
    count: result.data.allMarkdownRemark.totalCount,
    limit: 3,
  },
})
```

Now the plugin will create the following pages:

- /blog
- /blog/what/ever/2
- /blog/what/ever/3
- /blog/what/ever/4

#### Deferring page generation

You can opt into Gatsby's Deferred Static Generation (DSG) by passing a `defer` flag or function to `createAdvancedPage()`. When a function is provided it receives the current page number, so you can defer only specific paginated results.

```javascript
createAdvancedPage({
  route: 'blog',
  pagination: {
    count: result.data.allMarkdownRemark.totalCount,
    limit: 3,
  },
  defer: (page) => page > 1,
})
```

The example above keeps the first page in the initial build while deferring the rest.

#### Using Gatsby slices

Attach Gatsby slices to the generated page by supplying a `slices` object. Each property name becomes the slice placeholder and the value points to the slice template.

```javascript
createAdvancedPage({
  route: 'blog',
  slices: {
    hero: 'content/hero',
    sidebar: 'content/sidebar',
  },
})
```

### Passing data to templates

You can pass structured data from your `pages.config.yaml` to your template component by setting the `data` field. See below

```yaml
# content/pages/skills.md
- title: My skills
  template: skills.js
  routes:
    skills: /skills
  data:
    skills:
      - name: HTML
        level: Excellent
      - name: Javascript
        level: Intermediate
```

Then, you can use that data in your template

```javascript
// src/templates/skills.js
import * as React from 'react'
import { graphql } from 'gatsby'

const SkillsTemplate = ({ data: { page } }) => (
  <div>
    <h1>{page.title}</h1>
    <ul>
      {page.data.sills.map(({ name, level }) => (
        <li key={name}>
          <strong>{name}:</strong> {level}
        </li>
      ))}
    </ul>
  </div>
)

export const query = graphql`
  query SkillsQuery($id: String!) {
    page(id: { eq: $id }) {
      title
      data
    }
  }
`

export default SkillsTemplate
```

### Generating paths

You can generate paths for the routes defined in your `pages.config.yaml` using two methods:

#### Link component (recommended)

The Link component is a wrapper around Gatsby's [Link component](https://www.gatsbyjs.org/docs/gatsby-link/) that allows passing route names and params in addition to regular paths.

Assuming you have a route named `blog.post` with a value of `/blog/posts/:post`, you can render a link to a specific blog post using the following:

```javascript
import { Link } from 'gatsby-plugin-advanced-pages'

// inside your component JSX
;<Link to='blog.post' params={{ post: 'some-post-slug' }} />
```

#### generatePath() function

Alternatively, you can use `generatePath()` function to generate paths. see below:

```javascript
import { generatePath } from 'gatsby-plugin-advanced-pages'

// Returns: /blog/posts/some-post-slug
const postUrl = generatePath('blog.post', { post: 'some-post-slug' })
```

## Components

The plugin exposes a set of components and functions that allow building advanced pages with minimal code.

### Link component

Wrapper around Gatsby's [core Link component](https://www.gatsbyjs.org/docs/gatsby-link/) that allows passing route names and params in addition to regular paths.

#### Props

| Name   | Type     | Description                                                                                |
| ------ | -------- | ------------------------------------------------------------------------------------------ |
| to     | `String` | **Required.** The name of the route to link to or a regular path                           |
| params | `Object` | Route parameters                                                                           |
| scope  | `String` | Route scope. _Available scopes:_ `pagination`                                              |
| ...    | `[...]`  | All props supported by [Gatsby Link component](https://www.gatsbyjs.org/docs/gatsby-link/) |

#### Usage

```javascript
import { Link } from 'gatsby-plugin-advanced-pages'

// Route: about = /about-me
// Output: <GatsbyLink to="/about-me" />
;<Link to='about' />

// Route: blog.post = /blog/:post
// Output: <GatsbyLink to="/blog/some-post-slug" />
;<Link to='blog.post' params={{ post: 'some-post-slug' }} />

// Route: blog = /blog
// Output: <GatsbyLink to="/blog/page/4" />
;<Link to='blog' scope='pagination' params={{ page: 4 }} />

// You can pass any prop supported by GatsbyLink
// Output: <GatsbyLink to="/about-me" activeClassName="active" partiallyActive={true} />
;<Link to='about' activeClassName='active' partiallyActive={true} />

// If no valid route is supplied, a regular link will be rendered
// Output: <GatsbyLink to="/some/path" />
;<Link to='some/path' />
```

### Pagination component

Renders a pagination UI to paginate a set of results fetched using a GraphQL query.

#### Props

| Name           | Type      | Description                                                                                                                                                                                                                                       |
| -------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| route          | `String`  | **Required.** The name of the route to paginate                                                                                                                                                                                                   |
| params         | `Object`  | Route parameters                                                                                                                                                                                                                                  |
| pageInfo       | `Object`  | **Required.** `pageInfo` object fetched from GraphQL using `Pagination` fragment                                                                                                                                                                  |
| ui             | `String`  | UI mode (Defaults to `full`). _Available options:_ `mini`, `simple`, `full`                                                                                                                                                                       |
| range          | `Number`  | Maximum number of pages displayed (Defaults to 6)                                                                                                                                                                                                 |
| className      | `String`  | Class name applied to the pagination container                                                                                                                                                                                                    |
| labels         | `Object`  | Navigation items labels. _Available keys:_ `prev`, `next`, `first`, `last`                                                                                                                                                                        |
| theme          | `Object`  | Elements class names (Defaults to [Bootstrap 4 classes](https://getbootstrap.com/docs/4.3/components/pagination/#overview)). _Available keys:_ `inner`, `item`, `item.next`, `item.prev`, `item.first`, `item.last`, `link`, `active`, `disabled` |
| renderDisabled | `boolean` | Render disabled navigation items (Defaults to `true`)                                                                                                                                                                                             |

#### Usage

```javascript
import { Pagination } from 'gatsby-plugin-advanced-pages'

const BlogTemplate = ({ data }) => {
  // ...
  ;<Pagination ui='simple' route='blog' pageInfo={data.allMarkdownRemark.pageInfo} />
  // ...
}

export const query = graphql`
  query BlogQuery($limit: Int!, $offset: Int!) {
    allMarkdownRemark(limit: $limit, skip: $offset){
      edges {
        node {
          ...
        }
      }
      pageInfo {
        ...Pagination
      }
    }
  }
`

export default BlogTemplate
```

## Hooks

The plugin exposes two hooks for getting and checking for the currently activated route.

### useRoute

> `(): Route`

Gets the current active route based on `@reach/router` location history.

### useIsRoute

> `(route: string): boolean`

Checks whether a given route is currently active.

## Functions

These are the functions exposed by the plugin.

### createAdvancedPage

> `({ route: string, params?: object, templateArgs?: object, pagination?: object, slices?: Record<string, string>, defer?: boolean | ((page: number) => boolean), ...context: any[] }): void`

Creates page(s) based on given input parameters. _Note: This function can only be called within [Page helpers](#page-helpers)._

### generatePath

> `(route: string, params?: object, scope?: string, ignorePrefix?: boolean): string`

Generates a path for a specific route based on the given parameters.

### getPathGenerator

> `(route: string, scope?: string, ignorePrefix?: boolean): Function`

Returns a function to be used to generate paths for a specific route.

### navigate

> `(to: string, params?: object, scope?: string, options?: object): void`

Extends Gatsby's [navigate](https://www.gatsbyjs.org/docs/gatsby-link/#how-to-use-the-navigate-helper-function) to allow passing route names and params.

### getMatchingRoute

> `(path: string, ignorePrefix?: boolean): Route`

Gets the route that matches a given path.

### getRoutes

> `(parent?: string): Route[]`

Gets an array of all routes or routes nested under a given parent route.

### getRoute

> `(route: string): Route`

Gets the Route object of a given route name.

### routeExists

> `(route: string): boolean`

Checks if a route is defined with the given name.

## Configuration

### Pages

Pages configuration defines your site’s pages and routes. It should be defined in one of two ways:

#### Inline definition

You can define it alongside other plugin options in your `gatsby.config.js` file like this:

```javascript
plugins: [
  {
    resolve: 'gatsby-plugin-advanced-pages',
    options: {
      // plugin options goes here
      pages: [
        {
          title: 'Hello, World',
          template: 'hello.js',
          routes: {
            hello: '/hello',
          },
        },
      ],
    },
  },
]
```

#### Separate config file

This file should be in the root of your Gatsby site and should be in one of these formats:

##### YAML

`pages.config.yaml` or `pages.config.yml`

```yaml
- title: Hello, World
  template: hello.js
  routes:
    hello: /hello
```

##### JSON

`pages.config.json`

```json
[
  {
    "title": "Hello, World",
    "template": "hello.js",
    "routes": {
      "hello": "/hello"
    }
  }
]
```

##### JavaScript (ESM is supported)

`pages.config.js`, `pages.config.cjs` or `pages.config.mjs`

```js
// CJS Syntax
module.exports = [
  {
    title: 'Hello, World',
    template: 'hello.js',
    routes: {
      hello: '/hello',
    },
  },
]
```

```js
// ESM Syntax
export default [
  {
    title: 'Hello, World',
    template: 'hello.js',
    routes: {
      hello: '/hello',
    },
  },
]
```

### Plugin options

#### Defaults

Here is the full list of options with their default values.

```javascript
// gatsby-config.js
plugins: [
  {
    resolve: 'gatsby-plugin-advanced-pages',
    options: {
      basePath: '/',
      pages: [],
      template: null,
      directories: {
        templates: 'src/templates',
        helpers: 'gatsby/pages',
      },
      pagination: {
        limit: 10,
        suffix: '/page/:page',
      },
      typeNames: {
        page: 'Page',
      },
    },
  },
]
```

#### basePath

> Type: `String` Default: `"/"`

Root url for all pages created through the plugin

#### pages

> Type: `Array` Default: `[]`

Inline pages configuration to use instead of a separate pages.config.js file

#### template

> Type: `String` Default: `null`

Default template to be used for pages with no `template` metadata defined. It could be a file name located under `{directories.templates}` or a path relative to your project's root directory.

#### directories.templates

> Type: `String` Default: `"src/templates"`

Location of template components used to render pages. The path could either be relative to your project's root directory or an absolute path

#### directories.helpers

> Type: `String` Default: `"gatsby/pages"`

Location of page helpers. The path could either be relative to your project's root directory or an absolute path

#### pagination.limit

> Type: `Number` Default: `10`

Default page size to be used when no `limit` parameter is passed to `createAdvancedPage()`

#### pagination.suffix

> Type: `String` Default: `"/page/:page"`

Suffix to be added to the original route to generate a paginated route. This is only used when no paginated route is passed to `createAdvancedPage()`

#### typeNames.page

> Type: `String` Default: `"Page"`

Name of the page object type

## License

[MIT][license-url]

[npm-url]: https://www.npmjs.com/package/gatsby-plugin-advanced-pages
[npm-img]: https://img.shields.io/npm/v/gatsby-plugin-advanced-pages.svg?logo=npm
[ci-url]: https://github.com/mohatt/gatsby-plugin-advanced-pages/actions/workflows/ci.yml
[ci-img]: https://img.shields.io/github/actions/workflow/status/mohatt/gatsby-plugin-advanced-pages/ci.yml?branch=master&logo=github
[codecov-url]: https://codecov.io/github/mohatt/gatsby-plugin-advanced-pages
[codecov-img]: https://img.shields.io/codecov/c/github/mohatt/gatsby-plugin-advanced-pages.svg?logo=codecov&logoColor=white
[gatsby-url]: https://www.gatsbyjs.org/packages/gatsby-plugin-advanced-pages
[gatsby-img]: https://img.shields.io/badge/gatsby->=5.10-blueviolet.svg?logo=gatsby
[demo-url]: http://mohatt.github.io/gatsby-plugin-advanced-pages
[demo-img]: https://img.shields.io/website/http/mohatt.github.io/gatsby-plugin-advanced-pages.svg?label=demo&logo=statuspal
[license-url]: https://github.com/mohatt/gatsby-plugin-advanced-pages/blob/master/LICENSE
[license-img]: https://img.shields.io/github/license/mohatt/gatsby-plugin-advanced-pages.svg?logo=open%20source%20initiative&logoColor=white
