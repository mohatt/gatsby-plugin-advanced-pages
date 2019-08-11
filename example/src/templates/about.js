import React from 'react'
import { graphql } from 'gatsby'
import Layout from '../components/layout'

const AboutTemplate = ({ data: { page } }) => (
	<Layout title={page.title}>
    <div className="row">
    	<div className="col-md-3">
    	<img className="card-img" src="http://placehold.it/100x200" alt="" />
    	</div>
    	<div className="col-md-9">
    		<div dangerouslySetInnerHTML={{ __html: page.body }} />
    		<h3 className="mt-4">Skills</h3>
    		{page.data.skills.map(skill =>(
    			<label key={skill} className="badge-pill badge-primary mr-2">{skill}</label>
    		))}
    	</div>
    </div>
	</Layout>
)

export const query = graphql`
  query About($id: String!) {
    page(id: { eq: $id }) {
      title
      body
      data
    }
  }
`

export default AboutTemplate