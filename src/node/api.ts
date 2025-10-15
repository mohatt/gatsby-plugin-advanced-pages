import type { CreatePagesArgs, Page } from 'gatsby'
import type { RouteParams } from '@/lib/route-compiler'
import type { DeepPartial } from '@/types'

/**
 * Represents the configuration options for defining a page in the plugin.
 */
export interface PageOptions {
  title: string
  template?: string
  helper?: string | PageHelperFunction
  data?: Record<string, any>
  routes: Record<string, string>
}

/**
 * Represents the complete set of configuration options available to the plugin.
 */
export interface DefaultPluginOptions {
  /**
   * The base path where pages should be created.
   * Defaults to `/` if not specified.
   */
  basePath: string

  /**
   * An array of pages to be created with their respective configurations.
   */
  pages: PageOptions[]

  /**
   * The default template file to use for pages if no specific template is provided.
   */
  template?: string

  /**
   * Defines directories used by the plugin.
   */
  directories: {
    /**
     * The directory containing page templates.
     */
    templates: string

    /**
     * The directory containing helper scripts for pages.
     */
    helpers: string
  }

  /**
   * Pagination settings for dynamically generated pages.
   */
  pagination: {
    /**
     * The default number of items per page when paginating.
     */
    limit: number

    /**
     * The suffix appended to paginated routes (e.g., `/page/2`).
     */
    suffix: string
  }

  /**
   * Defines the type names used for GraphQL queries and Gatsby node creation.
   */
  typeNames: {
    /**
     * The GraphQL type name for a page.
     */
    page: string

    /**
     * The GraphQL type name for a page route.
     */
    pageRoute: string
  }
}

/**
 * Represents the user-facing plugin options.
 * This type allows partial definitions, meaning users can specify only the options they need.
 */
export type PluginOptions = DeepPartial<DefaultPluginOptions>

/**
 * The main plugin error representation in Gatsby's error map.
 */
export interface PluginErrorMeta {
  id: '1500'
  context: {
    message: string
  }
  error: Error
}

/**
 * Represents a single page route node.
 * Used to define individual routes associated with a page.
 */
export interface PageRouteNode {
  name: string
  path: string
}

/**
 * Represents a structured page node.
 * This structure is used internally to manage pages and their properties.
 */
export interface PageNode {
  id: string
  title: string
  template?: string
  templateName?: string
  helper?: string
  data?: Record<string, any>
  routes: PageRouteNode[]
}

/**
 * Defines the available route scope types.
 */
export type RouteScope = 'pagination'

/**
 * Represents a serialized route used for defining advanced page routing.
 */
export interface SerializedRoute {
  name: string
  path: string
  scopes: {
    [key in RouteScope]?: string
  }
}

/**
 * Represents properties required to create an advanced page in Gatsby.
 */
export interface CreateAdvancedPageProps extends Pick<Page, 'slices'> {
  /**
   * The base route for the page.
   */
  route: string

  /**
   * Optional route parameters that can be passed to dynamically generate pages.
   */
  params?: RouteParams

  /**
   * Additional arguments to be passed to the page template.
   */
  templateArgs?: {
    [k: string]: string | number
  }

  /**
   * Optional pagination settings for paginated pages.
   */
  pagination?: {
    /**
     * The total number of items available for pagination.
     */
    count: number

    /**
     * The number of items per page (overrides the global pagination limit).
     */
    limit?: number

    /**
     * The route format used for paginated pages.
     */
    route?: string
  }

  /**
   * When set to true, Gatsby will exclude the page from the build step and instead generate it during the first HTTP request.
   * Can be a function that returns a boolean to conditionally defer the page generation.
   */
  defer?: boolean | ((page: number) => boolean)

  /**
   * Other unknown page context props.
   */
  [key: string]: any
}

/**
 * Represents the properties passed to a page helper function.
 */
export interface PageHelperProps {
  /**
   * The GraphQL function provided by Gatsby for querying data.
   */
  graphql: CreatePagesArgs['graphql']

  /**
   * The page node associated with the helper.
   */
  page: PageNode

  /**
   * A function used to create an advanced page dynamically.
   */
  createAdvancedPage: (props: CreateAdvancedPageProps) => void
}

/**
 * Defines the signature for a page helper function.
 * A helper function can be either synchronous or asynchronous.
 */
export type PageHelperFunction = (props: PageHelperProps) => void | Promise<void>
