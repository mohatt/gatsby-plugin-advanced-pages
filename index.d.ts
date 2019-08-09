import * as React from 'react';

export interface Route {
  path: string;
  scopes: {
    [index: string]: string;
  }
}

export interface RouteMap {
  [index: string]: Route;
}

export interface RouteParams {
  [index: string]: string;
}

export interface PaginationInfo {
  itemCount: number;
  currentPage: number;
  perPage: number;
}

export interface PaginationProps {
  route: string;
  params?: RouteParams;
  ui?: string;
  range?: number;
  className?: string;
  renderDisabled?: boolean;
  pageInfo: PaginationInfo;
  labels?: {
    [index: string]: string | React.ReactNode
  };
  theme?: {
    [index: string]: string
  };
}

export interface LinkProps {
  to: string;
  params?: RouteParams;
  scope?: string
}

export const Pagination: React.ComponentType<PaginationProps>;
export const Link: React.ComponentType<LinkProps>;

export function getRouteMap(): RouteMap;
export function getRoute(routeName: string): Route;
export function getPathGenerator(
  routeName: number,
  scope?: string
): (args?: RouteParams) => string;
export function generatePath(
  routeName: number,
  args?: RouteParams,
  scope?: string
): string;
