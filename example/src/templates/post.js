import React from 'react'
import { graphql } from 'gatsby'
import Layout from '../components/layout'
import { Link } from 'gatsby-plugin-advanced-pages'

const PostTemplate = ({ data: { post } }) => (
  <Layout title={post.frontmatter.title}>
    <div className='mb-4 text-muted'>
      <p>Posted on August 24, 2014 at 9:00 PM</p>
      <p>
        {post.frontmatter.tags.map((tag) => (
          <Link key={tag} to='blog.tag' params={{ tag }}>
            <span className='badge badge-pill badge-primary'>{tag}</span>{' '}
          </Link>
        ))}
      </p>
    </div>
    <div dangerouslySetInnerHTML={{ __html: post.html }} />
  </Layout>
)

export const query = graphql`
  query Post($id: String!, $post: String!) {
    page(id: { eq: $id }) {
      title
    }
    post: markdownRemark(frontmatter: { slug: { eq: $post } }) {
      html
      frontmatter {
        title
        slug
        tags
      }
    }
  }
`

export default PostTemplate
