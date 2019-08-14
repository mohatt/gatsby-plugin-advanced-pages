# Gatsby Advanced Pages
[![][npm-img]][npm-url] [![][travis-img]][travis-url] [![][codecov-img]][codecov-url]

Gatsby Advanced Pages is a wrapper around Gatsby's [createPage](https://www.gatsbyjs.org/docs/actions/#createPage) API that allows easy creation of pages with dynamic features like pagination and custom routing.

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Demo](#demo)
- [Usage](#usage)
  - [Creating pages](#creating-pages)
    - [Simple pages](#simple-pages)
    - [Page helpers](#page-helpers)
    - [Passing data to templates](#passing-data-to-templates)
  - [Generating paths](#generating-paths)
- [Configuration](#configuration)
- [API](#api)
  - [Components](#components)
    - [Link component](#link-component)
    - [Pagination component](#pagination-component)
  - [Functions](#functions)
- [License](#license)


## Prerequisites
Before getting started, you need to ensure that you have a Markdown transformer plugin installed and configured. Currently, the following plugins are supported:
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


## Demo
See [example](https://github.com/mohatt/gatsby-plugin-advanced-pages/tree/master/example) directory. Check out [Live example](http://mohatt.github.io/gatsby-plugin-advanced-pages)


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

Create a template component under `src/templates` to be used to render the page 

`src/templates/page.js`
```javascript
import React from "react"
import { graphql } from "gatsby"

const PageTemplate = ({ data }) => (
  <div>
    <h1>{data.page.title}</h1>
    <div dangerouslySetInnerHTML={{ __html: data.page.body }} />
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

#### Page helpers
In order to create more advanced pages, you need to define a page helper in your markdown metadata. Page helpers are javascript files that export a function to be run by the plugin during Gatsby's [createPage](https://www.gatsbyjs.org/docs/actions/#createPage) lifecycle. Here is an example page helper that creates a blog index page with pagination functionality:

`content/pages/blog.md`
```markdown
---
title: Blog
routes:
  blog: /blog
template: blog-template
helper: blog-helper
---
Here you can write some content to be displayed on the blog page 
before listing blog posts, or you can leave it empty
```

Next, create the page helper file under `gatsby/pages`

`gatsby/pages/blog-helper.js`
```javascript
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
    filter: {
      frontmatter: {
        type: { eq: "post" }
      }
    }
  })
}
```

Lastly, create a template component under `src/templates` to be used to render the blog page

`src/templates/blog-template.js`
```javascript
import React from 'react'
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
    <Pagination route="blog" pageInfo={data.allMarkdownRemark.pageInfo} ui="simple" />
  </div>
)

export const query = graphql`
  query Blog($id: String!, $limit: Int!, $offset: Int!, $filter: MarkdownRemarkFilterInput!) {
    page(id: { eq: $id }) {
      title
      body
    }
    allMarkdownRemark(limit: $limit, skip: $offset, filter: $filter){
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
Now assuming you have 12 blog posts, the plugin will create the following pages:
 - /blog
 - blog/page/2
 - blog/page/3
 - blog/page/4

if you want to customize the paginated paths, you can include a `route` in your pagination object thats being passed to `createAdvancedPage()`. See below:

`content/pages/blog.md`
```markdown
---
title: Blog
routes:
  blog: /blog
  blog.paginated: /blog/what/ever/:page
template: blog-template
helper: blog-helper
---
```

`gatsby/pages/blog-helper.js`
```javascript
...
...
createAdvancedPage({
  route: 'blog',
  pagination: {
    route: 'blog.paginated',
    count: result.data.allMarkdownRemark.totalCount,
    limit: 3,
  },
  filter: {
    frontmatter: {
      type: { eq: "post" }
    }
  }
})
```
Now the plugin will create the following pages:
 - /blog
 - /blog/what/ever/2
 - /blog/what/ever/3
 - /blog/what/ever/4

#### Passing data to templates
You can pass structured data from your page to your template component by setting the `data` field in your page markdown. See below

`content/pages/skills.md`
```markdown
---
title: My skills
template: skills
routes:
  skills: /skills
data:
  skills:
    - skill: HTML
      level: Excellent
    - skill: Javascript
      level: Intermediate
---
Some intro text
```

Then, you can use that data in your template

`src/templates/skills.js`
```javascript
import React from "react"
import { graphql } from "gatsby"

const SkillsTemplate = ({ data: { page } }) => (
  <div>
    <h1>{page.title}</h1>
    <div dangerouslySetInnerHTML={{ __html: page.body }} />
    <h2>Current Skills</h2>
    <ul>
    {page.data.sills.map(({ skill, level }) => {
      <li key={skill}>
        <label>{skill}:</label><span>{level}</span>
      </li>
    })}
    </ul>
  </div>
)

export const query = graphql`
  query PageQuery($id: String!) {
    page(id: { eq: $id }) {
      title
      data
      body
    }
  }
`

export default SkillsTemplate
```

#### More Examples...
Check out [example](https://github.com/mohatt/gatsby-plugin-advanced-pages/tree/master/example) directory for more examples on how to use the plugin


### Generating paths
You can generate paths for the routes defined in your pages metadata using two methods:

#### Link Component (recommended)
The Link component is a wrapper around Gatsby's [Link component](https://www.gatsbyjs.org/docs/gatsby-link/) that allows passing route names and params instead of link urls. Below is an example of how to use it:

Assuming you have a route named `blog.post` with a value of `/blog/posts/:post`, you can render a link to a specific blog post using the following:

```javascript
import { Link } from 'gatsby-plugin-advanced-pages'

// inside your component JSX
<Link to="blog.post" params={{ post: "some-post-slug" }} />
```

#### generatePath() function
Alternatively, you can use `generatePath()` function to generate paths. see below:

```javascript
import { generatePath } from 'gatsby-plugin-advanced-pages'

// Returns: /blog/posts/some-post-slug
const postUrl = generatePath('blog.post', { post: "some-post-slug" })
```


## API
The plugin exposes a set of components and functions that allow building advanced pages with minimal code. 

### Components
These are the React components exposed by the plugin.

#### Link component
Wrapper around Gatsby's [core Link component](https://www.gatsbyjs.org/docs/gatsby-link/) that allows passing route names and params instead of link urls.

##### Props
| Name | Type | Description |
| --- | --- | --- |
| to | `String` | **Required.** The name of the route to link to |
| params | `Object` | Route paramaters |
| scope | `String` | Route scope. *Available scopes:* `pagination` |
| ... | `[...]` | All props supported by [Gatsby Link component](https://www.gatsbyjs.org/docs/gatsby-link/) |

##### Usage
```javascript
import { Link } from 'gatsby-plugin-advanced-pages'

// Route: about = /about-me
// Output: <GatsbyLink to="/about-me" />
<Link to="about" />

// Route: blog.post = /blog/:post
// Output: <GatsbyLink to="/blog/some-post-slug" />
<Link to="blog.post" params={{ post: "some-post-slug" }} />

// Route: blog = /blog
// Output: <GatsbyLink to="/blog/page/4" />
<Link to="blog" scope="pagination" params={{ page: 4 }} />

// You can pass any prop supported by GatsbyLink
// Output: <GatsbyLink to="/about-me" activeClassName="active" partiallyActive={true} />
<Link to="about" activeClassName="active" partiallyActive={true} />
```

#### Pagination component
Renders a pagination UI to paginate a set of results fetched using a GraphQL query

##### Props
| Name | Type | Description |
| --- | --- | --- |
| route | `String` | **Required.** The name of the route to paginate |
| params | `Object` | Route paramaters |
| pageInfo | `Object` | **Required.** `pageInfo` object fetched from GraphQL using `Pagination` fragment |
| range | `Number` | Maximum number of pages displayed (Defaults to 6) |
| className | `String` | Class name applied to the pagination container |
| labels | `Object` | Navigation items labels. *Available keys:* `prev`, `next`, `first`, `last` |
| theme | `Object` | Elements class names (Defaults to [Bootstrap 4 classes](https://getbootstrap.com/docs/4.3/components/pagination/#overview)). *Available keys:* `inner`, `item`, `item.next`, `item.prev`, `item.first`, `item.last`, `link`, `active`, `disabled` |
| renderDisabled | `bool` | Render disabled navigation items (Defaults to `true`) |

##### Usage
```javascript
import { Pagination } from 'gatsby-plugin-advanced-pages'

const BlogTemplate = ({ data }) => {
  ...
  <Pagination ui="simple" route="blog" pageInfo={data.allMarkdownRemark.pageInfo} />
  ...
}

export const query = graphql`
  query Blog($limit: Int!, $offset: Int!) {
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
Check out [example](https://github.com/mohatt/gatsby-plugin-advanced-pages/tree/master/example) directory for more examples

### Functions
These are the functions exposed by the plugin.

#### createAdvancedPage
> `createAdvancedPage({ route: string, params?: object, pagination?: object, filter?: object }): void`

Creates page(s) based on given input paramaters. *Note: This function can only be called within [Page helpers](#page-helpers).*

#### generatePath
> `generatePath(route: string, params?: object, scope?: string, ignorePrefix?: boolean): string`

Generates a path for a specific route based on the given parameters.

#### getPathGenerator
> `getPathGenerator(route: string, scope?: string, ignorePrefix?: boolean): Function`

Returns a function to be used to generate paths for a specific route.

#### navigate
> `navigate(to: string, params?: object, scope?: string, options?: object): void`

Extends Gatsby's [navigate](https://www.gatsbyjs.org/docs/gatsby-link/#how-to-use-the-navigate-helper-function) to allow passing route names and params.

#### getActivatedRoute
> `getActivatedRoute(): ActivatedRoute`

Gets the current active route based on `@reach/router` location history.

#### getMatchingRoute
> `getMatchingRoute(path: string): ActivatedRoute`

Gets the route that matches a given path. *Note: The provided path should be prefixed with `pathPrefix` if any.*

#### isActivatedRoute
> `isActivatedRoute(route: string): boolean`

Checks whether a given route is currently active.

#### getRoutes
> `getRoutes(): Array`

Gets an array of all routes.

#### getRoute
> `getRoute(route: string): Route`

Gets a specific route.


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

### Directory locations

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
[MIT](./LICENSE)

[npm-url]: https://www.npmjs.com/package/gatsby-plugin-advanced-pages
[npm-img]: https://img.shields.io/npm/v/gatsby-plugin-advanced-pages.svg
[travis-url]: https://travis-ci.org/mohatt/gatsby-plugin-advanced-pages
[travis-img]: https://travis-ci.org/mohatt/gatsby-plugin-advanced-pages.svg?branch=master
[codecov-url]: https://codecov.io/github/mohatt/gatsby-plugin-advanced-pages
[codecov-img]: https://img.shields.io/codecov/c/github/mohatt/gatsby-plugin-advanced-pages.svg
