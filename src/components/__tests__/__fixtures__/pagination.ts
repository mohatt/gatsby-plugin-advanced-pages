import type { PaginationProps } from '../../Pagination'

export default <PaginationProps>{
  route: 'whatever',
  pageInfo: {
    itemCount: 10,
    perPage: 10,
    pageCount: 9,
    currentPage: 4,
    hasNextPage: true,
    hasPreviousPage: true,
  },
}

export const testCases: Array<{ id: string; props: PaginationProps }> = [
  {
    id: '1-page-first',
    props: {
      route: 'whatever',
      pageInfo: {
        itemCount: 1,
        perPage: 5,
        pageCount: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    },
  },
  {
    id: '3-page-last',
    props: {
      route: 'whatever',
      pageInfo: {
        itemCount: 2,
        perPage: 10,
        pageCount: 3,
        currentPage: 3,
        hasNextPage: false,
        hasPreviousPage: true,
      },
    },
  },
  {
    id: '12-page-8th',
    props: {
      route: 'whatever',
      pageInfo: {
        itemCount: 50,
        perPage: 50,
        pageCount: 12,
        currentPage: 8,
        hasNextPage: true,
        hasPreviousPage: true,
      },
    },
  },
]
