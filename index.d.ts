import * as React from 'react';
import { PathFunction as PathGeneratorFunction } from 'path-to-regexp'

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
  perPage: number;
  pageCount: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
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
): PathGeneratorFunction<RouteParams>;
export function generatePath(
  routeName: number,
  args?: RouteParams,
  scope?: string
): string;
export function compilePath(path: string): PathGeneratorFunction;
