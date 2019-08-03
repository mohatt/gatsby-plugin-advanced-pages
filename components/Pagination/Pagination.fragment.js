import { graphql } from "gatsby"

export const pagination = graphql`
  fragment Pagination on PageInfo {
    perPage
    pageCount
    itemCount
    hasPreviousPage
    hasNextPage
    currentPage
  }
`
