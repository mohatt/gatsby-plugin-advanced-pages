import React from "react"
import TestRenderer from 'react-test-renderer';
import Pagination from "../Pagination"

describe(`<Pagination />`, () => {
  const render = (props = {}) => {
    return TestRenderer.create(<Pagination {...props} />)
  }

  it(`should render correctly`, () => {
    const tree = render({
      route: 'blog',
      pageInfo: {
        perPage: 10,
        itemCount: 80,
        currentPage: 3,
      }
    })
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
