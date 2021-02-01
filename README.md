# Gatsby Advanced Pages
[![][npm-img]][npm-url] [![][ci-img]][ci-url] [![][codecov-img]][codecov-url] [![][demo-img]][demo-url] [![][gatsby-img]][gatsby-url] [![][license-img]][license-url]

Gatsby Advanced Pages is a wrapper around Gatsby's [createPage](https://www.gatsbyjs.org/docs/actions/#createPage) API that allows easy creation of pages with dynamic features like pagination and custom routing.

- [Installation](#installation)
- [Demo](#demo)
- [Usage](#usage)
  - [Creating pages](#creating-pages)
  - [Page helpers](#page-helpers)
  - [Passing data to templates](#passing-data-to-templates)
  - [Generating paths](#generating-paths)
- [Components](#components)
  - [Link component](#link-component)
  - [Pagination component](#pagination-component)
- [Functions](#functions)
- [Configuration](#configuration)
	- [Pages Config File](#pages-config-file)
	- [Plugin Options](#plugin-options)
- [License](#license)


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

In order to create your first page, create a new `pages.config.yaml` file under your project’s directory

`pages.config.yaml`

```yaml
- title: Hello, World
  template: hello.js
  routes:
    hello: /hello
```

Create a template component under `src/templates` to be used to render the page 

`src/templates/hello.js`

```javascript
import React from "react"
import { graphql } from "gatsby"

const PageTemplate = ({ data }) => (
  <div>
    <h1>{data.page.title}</h1>
    <div>This is a demo page for `gatsby-plugin-advanced-pages`</div>
  </div>
)

export const query = graphql`
  query PageQuery($id: String!) {
    page(id: { eq: $id }) {
      title
    }
  }
`

export default PageTemplate
```

Run `gatsby develop` and open http://localhost/hello to see your new page.

### Page helpers
In order to create more advanced pages, you need to define a page helper in your markdown metadata. Page helpers are JavaScript files that export a function to be run by the plugin during Gatsby's [createPage](https://www.gatsbyjs.org/docs/actions/#createPage) lifecycle. Here is an example page helper that creates a blog index page with pagination functionality:

*Note: You will need [gatsby-transformer-remark](https://www.gatsbyjs.org/packages/gatsby-transformer-remark/)  plugin installed for this example to work*

`pages.config.yaml`

```yaml
- title: Blog
  routes:
    blog: /blog
  template: blog-template.js
  helper: blog-helper.js
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
  query Blog($id: String!, $limit: Int!, $offset: Int!) {
    page(id: { eq: $id }) {
      title
    }
    allMarkdownRemark(limit: $limit, skip: $offset, filter: { frontmatter: { type: { eq: "post" } } }){
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

if you want to customize the paginated paths, you can include a `route` in your pagination object thats being passed to `createAdvancedPage()`. See below:

`pages.config.yaml`

```yaml
- title: Blog
  routes:
    blog: /blog
    blog.paginated: /blog/what/ever/:page
  template: blog-template.js
  helper: blog-helper.js
```

`gatsby/pages/blog-helper.js`

```javascript
[...]
createAdvancedPage({
  route: 'blog',
  pagination: {
    route: 'blog.paginated',
    count: result.data.allMarkdownRemark.totalCount,
    limit: 3,
  }
})
```
Now the plugin will create the following pages:
 - /blog
 - /blog/what/ever/2
 - /blog/what/ever/3
 - /blog/what/ever/4

### Passing data to templates
You can pass structured data from your `pages.config.yaml` to your template component by setting the `data` field. See below

`content/pages/skills.md`

```yaml
- title: My skills
  template: skills.js
  routes:
    skills: /skills
  data:
    skills:
      - skill: HTML
        level: Excellent
      - skill: Javascript
        level: Intermediate
```

Then, you can use that data in your template

`src/templates/skills.js`
```javascript
import React from "react"
import { graphql } from "gatsby"

const SkillsTemplate = ({ data: { page } }) => (
  <div>
    <h1>{page.title}</h1>
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
    }
  }
`

export default SkillsTemplate
```

#### More examples...
Check out [example](https://github.com/mohatt/gatsby-plugin-advanced-pages/tree/master/example) directory for more examples on how to use the plugin


### Generating paths
You can generate paths for the routes defined in your `pages.config.yaml` using two methods:

#### Link component (recommended)
The Link component is a wrapper around Gatsby's [Link component](https://www.gatsbyjs.org/docs/gatsby-link/) that allows passing route names and params in addition to regular paths. Below is an example of how to use it:

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


## Components
The plugin exposes a set of components and functions that allow building advanced pages with minimal code. These are the React components exposed by the plugin.

### Link component
Wrapper around Gatsby's [core Link component](https://www.gatsbyjs.org/docs/gatsby-link/) that allows passing route names and params in addition to regular paths.

#### Props
| Name | Type | Description |
| --- | --- | --- |
| to | `String` | **Required.** The name of the route to link to or a regular path |
| params | `Object` | Route paramaters |
| scope | `String` | Route scope. *Available scopes:* `pagination` |
| ... | `[...]` | All props supported by [Gatsby Link component](https://www.gatsbyjs.org/docs/gatsby-link/) |

#### Usage
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

// If no valid route is supplied, a regular link will be rendered
// Output: <GatsbyLink to="/some/path" />
<Link to="some/path" />
```

### Pagination component
Renders a pagination UI to paginate a set of results fetched using a GraphQL query

#### Props
| Name | Type | Description |
| --- | --- | --- |
| route | `String` | **Required.** The name of the route to paginate |
| params | `Object` | Route paramaters |
| pageInfo | `Object` | **Required.** `pageInfo` object fetched from GraphQL using `Pagination` fragment |
| ui | `String` | UI mode (Defaults to `full`). *Available keys:* `mini`, `simple`, `full` |
| range | `Number` | Maximum number of pages displayed (Defaults to 6) |
| className | `String` | Class name applied to the pagination container |
| labels | `Object` | Navigation items labels. *Available keys:* `prev`, `next`, `first`, `last` |
| theme | `Object` | Elements class names (Defaults to [Bootstrap 4 classes](https://getbootstrap.com/docs/4.3/components/pagination/#overview)). *Available keys:* `inner`, `item`, `item.next`, `item.prev`, `item.first`, `item.last`, `link`, `active`, `disabled` |
| renderDisabled | `bool` | Render disabled navigation items (Defaults to `true`) |

#### Usage
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

## Functions
These are the functions exposed by the plugin.

### createAdvancedPage
> `createAdvancedPage({ route: string, params?: object, pagination?: object, ...context }): void`

Creates page(s) based on given input paramaters. *Note: This function can only be called within [Page helpers](#page-helpers).*

### generatePath
> `generatePath(route: string, params?: object, scope?: string, ignorePrefix?: boolean): string`

Generates a path for a specific route based on the given parameters.

### getPathGenerator
> `getPathGenerator(route: string, scope?: string, ignorePrefix?: boolean): Function`

Returns a function to be used to generate paths for a specific route.

### navigate
> `navigate(to: string, params?: object, scope?: string, options?: object): void`

Extends Gatsby's [navigate](https://www.gatsbyjs.org/docs/gatsby-link/#how-to-use-the-navigate-helper-function) to allow passing route names and params.

### getActivatedRoute
> `getActivatedRoute(): ActivatedRoute`

Gets the current active route based on `@reach/router` location history.

### getMatchingRoute
> `getMatchingRoute(path: string): ActivatedRoute`

Gets the route that matches a given path. *Note: The provided path should be prefixed with `pathPrefix` if any.*

### isActivatedRoute
> `isActivatedRoute(route: string): boolean`

Checks whether a given route is currently active.

### getRoutes
> `getRoutes(): Array`

Gets an array of all routes.

### routeExists
> `routeExists(route: string): boolean`

Checks if there is a route defined with the given name.

### getRoute
> `getRoute(route: string): Route`

Gets a specific route.


## Configuration

### Pages Config File
The pages configuration file defines your site’s pages and routes. This file should be in the root of your Gatsby site and could be defined in one of 3 formats:

#### YAML
`pages.config.yaml`

```yaml
- title: Hello, World
  template: hello.js
  routes:
    hello: /hello
```

#### JSON
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

#### JavaScript
`pages.config.js`

```js
module.exports = [
  {
    title: "Hello, World",
    template: "hello.js",
    routes: {
      hello: "/hello"
    }
  }
]
```


### Plugin Options

#### Defaults
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
        templates: 'src/templates',
        helpers: 'gatsby/pages',
      },
      pagination: {
        limit: 10,
        suffix: '/page/:page'
      },
      typeNames: {
        page: 'Page'
      }
    }
  }
]
```

#### basePath
> Type: `String` Default: `/`

Root url for all pages created through the plugin

#### template
> Type: `String` Default: `null`

Default template to be used for pages with no `template` metadata defined. It could be a file name located under [`{directories.templates}`](#directoriestemplates) or a path relative to your project's directory.

#### directories.templates
> Type: `String` Default: `src/templates`

Location of template components used to render pages. The path could either be relative to your project's directory or an absolute path

#### directories.helpers
> Type: `String` Default: `gatsby/pages`

Location of page helpers. The path could either be relative to your project's directory or an absolute path

#### pagination.limit
> Type: `Number` Default: `10`

Default page size to be used when no `limit` parameter is passed to `createAdvancedPage()`

#### pagination.suffix
> Type: `String` Default: `/page/:page`

Suffix to be added to the original route to generate a paginated route. This is only used when no paginated route is passed to `createAdvancedPage()`

#### typeNames.page
> Type: `String` Default: `Page`

Name of the page object type


## License
[MIT][license-url]

[npm-url]: https://www.npmjs.com/package/gatsby-plugin-advanced-pages
[npm-img]: https://img.shields.io/npm/v/gatsby-plugin-advanced-pages.svg
[ci-url]: https://github.com/mohatt/gatsby-plugin-advanced-pages/actions
[ci-img]: https://img.shields.io/github/workflow/status/mohatt/gatsby-plugin-advanced-pages/CI/master
[codecov-url]: https://codecov.io/github/mohatt/gatsby-plugin-advanced-pages
[codecov-img]: https://img.shields.io/codecov/c/github/mohatt/gatsby-plugin-advanced-pages.svg
[gatsby-url]: https://www.gatsbyjs.org/packages/gatsby-plugin-advanced-pages
[gatsby-img]: https://img.shields.io/badge/gatsby-v2.25+-blueviolet.svg
[demo-url]: http://mohatt.github.io/gatsby-plugin-advanced-pages
[demo-img]: https://img.shields.io/website/http/mohatt.github.io/gatsby-plugin-advanced-pages.svg?label=demo
[license-url]: https://github.com/mohatt/gatsby-plugin-advanced-pages/blob/master/LICENSE
[license-img]: https://img.shields.io/github/license/mohatt/gatsby-plugin-advanced-pages.svg
