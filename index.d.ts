import * as React from 'react';
import { PathFunction as PathGeneratorFunction } from 'path-to-regexp'

export interface Route {
  name: string;
  path: string;
  scopes: {
    [index: string]: string;
  }
}

export interface ActivatedRoute {
  name: string;
  path: string;
  scope: string;
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

export function getRoutes(): [Route];
export function getRoute(route: string): Route;
export function getActivatedRoute(): ActivatedRoute;
export function isActivatedRoute(route: string): boolean;
export function getMatchingRoute(path: string): ActivatedRoute;
export function getPathGenerator(
  route: string,
  scope?: string,
  ignorePrefix?: boolean
): PathGeneratorFunction<RouteParams>;
export function generatePath(
  route: string,
  params?: RouteParams,
  scope?: string,
  ignorePrefix?: boolean
): string;
export function navigate(
  to: string,
  params?: RouteParams,
  scope?: string,
  options?: {}
): void;
