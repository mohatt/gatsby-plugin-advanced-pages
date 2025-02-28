import { graphql } from 'gatsby'

export const Pagination = graphql`
  fragment Pagination on PageInfo {
    perPage
    pageCount
    itemCount
    currentPage
    hasNextPage
    hasPreviousPage
  }
`
