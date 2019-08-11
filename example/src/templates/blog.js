import React from 'react'
import { graphql } from 'gatsby'
import Layout from '../components/layout'
import { Link, Pagination } from 'gatsby-plugin-advanced-pages'

const BlogTemplate = ({ data, pageContext }) => {
  const { page, feed, tags } = data
  const { tag } = pageContext

  let title = page.title
  let route = 'blog'
  let params = {}
  if (tag) {
    route = 'blog.tag'
    params = { tag }
    title += ` / ${tag}`
  }

  if (feed.pageInfo.currentPage > 1) {
    title += ` (Page ${feed.pageInfo.currentPage})`
  }

  return (
  	<Layout title={title}>
      <div dangerouslySetInnerHTML={{ __html: page.body }} />
      <div class="row">
        <div className="col-md-9">
        {feed.edges.map(({ node }) => (
          <div key={node.frontmatter.slug} className="card mb-4">
            <div className="card-body">
              <h2 className="card-title">{node.frontmatter.title}</h2>
              <p className="card-text">{node.excerpt}</p>
              <Link to="blog.post" params={{post: node.frontmatter.slug}}>Read More →</Link>
            </div>
            <div className="card-footer text-muted">Posted on January 1, 2017</div>
          </div> 
        ))}
        </div>
        <div className="col-md-3">
          <div className="card mb-4">
            <h5 className="card-header">Tags</h5>
            <div className="card-body">
              <ul className="list-unstyled mb-0">
                {tags.group.map(({ fieldValue, totalCount }) => (
                  <li key={fieldValue}>
                    <Link to="blog.tag" params={{tag: fieldValue}}>
                      {fieldValue} <label className="badge-pill badge-primary">{totalCount}</label>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div> 
      </div>
      <Pagination route={route} params={params} pageInfo={feed.pageInfo} ui="simple" />
  	</Layout>
)}

export const query = graphql`
  query Blog($id: String!, $limit: Int!, $offset: Int!, $filter: MarkdownRemarkFilterInput!) {
    page(id: { eq: $id }) {
      title
      body
    }
    feed: allMarkdownRemark(limit: $limit, skip: $offset, filter: $filter){
      edges {
        node {
          excerpt(pruneLength: 200)
          frontmatter {
            title
            slug
            tags
          }
        }
      }
      pageInfo {
        ...Pagination
      }
    }
    tags: allMarkdownRemark {
      group(field: frontmatter___tags) {
        fieldValue
        totalCount
      }
    }
  }
`

export default BlogTemplate