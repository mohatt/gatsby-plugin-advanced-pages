import React from 'react'
import { graphql } from 'gatsby'
import Layout from '../components/layout'

const PageTemplate = ({ data }) => (
  <Layout title={data.page.title}>
    <div dangerouslySetInnerHTML={{ __html: data.page.body }} />
  </Layout>
)

export const query = graphql`
  query Page($id: String!) {
    page(id: { eq: $id }) {
      title
      body
    }
  }
`

export default PageTemplate