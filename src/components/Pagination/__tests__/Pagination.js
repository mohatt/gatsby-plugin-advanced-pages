import React from "react"
import TestRenderer from 'react-test-renderer';
import Pagination from "../Pagination"

const setup = (props = {}) => {
  return TestRenderer.create(
    <Pagination {...props} />
  ).toJSON()
}

describe(`<Pagination />`, () => {
  it(`should render correctly`, () => {
    const result = setup({
      route: 'blog',
      pageInfo: {
        perPage: 10,
        itemCount: 80,
        currentPage: 3,
      }
    })
    expect(result).toMatchSnapshot()
  })
})
