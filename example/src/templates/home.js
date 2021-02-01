import React from 'react'
import { graphql } from 'gatsby'
import Layout from '../components/layout'

const HomeTemplate = ({ data }) => (
  <Layout title={data.page.title}>
    <div>
      This is a simple blog site built with <a href="https://www.gatsbyjs.org">Gatsby</a> and <a href="https://github.com/mohatt/gatsby-plugin-advanced-pages">Gatsby Advanced Pages</a> plugin.
    </div>
  </Layout>
)

export const query = graphql`
  query Page($id: String!) {
    page(id: { eq: $id }) {
      title
    }
  }
`

export default HomeTemplate