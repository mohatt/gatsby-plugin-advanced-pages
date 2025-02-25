export interface PageDefinition {
  title: string;
  template?: string;
  helper?: string;
  data?: Record<string, any>;
  routes: Record<string, string>;
}

export interface PageNode {
  id: string;
  title: string;
  template?: string;
  templateName?: string;
  helper?: string;
  data?: Record<string, any>;
  routes: Array<{ name: string, path: string }>;
}

export interface PluginOptions {
  basePath: string;
  pages: PageDefinition[];
  template?: string;
  directories: {
    templates: string;
    helpers: string;
  };
  pagination: {
    limit: number;
    suffix: string;
  };
  typeNames: {
    page: string;
  };
}

export type RouteScope = 'pagination'

export interface SerializedRoute {
  name: string
  path: string
  scopes: {
    [key in RouteScope]?: string
  }
}
