// @vitest-environment jsdom
import React from 'react'
import ReactTest from '@testing-library/react'
import _ from 'lodash'
import { graphql } from 'gatsby'
import { expect, Mock } from 'vitest'
import type { DeepPartial } from '@/types'
import defaultTestCase, { testCases } from './__fixtures__/pagination'
import { Pagination, PaginationProps } from '../Pagination'
import { Pagination as PaginationFragment } from '../Pagination.fragment'

vi.mock('../Link', () => ({
  Link: (props: any) => <a>{JSON.stringify(props)}</a>,
}))

describe('<Pagination />', () => {
  const render = (props?: DeepPartial<PaginationProps>) => {
    const fullProps = _.merge({}, defaultTestCase, props)
    return ReactTest.render(<Pagination {...fullProps} />).container.firstChild
  }

  it('renders correctly with defaults', () => {
    expect(render()).toMatchSnapshot()
  })

  it('renders correctly with custom theme', () => {
    expect(
      render({
        theme: _.mapValues(Pagination.defaultProps.theme, (v) => v + '-custom'),
      }),
    ).toMatchSnapshot()
  })

  it('renders correctly with custom labels', () => {
    expect(
      render({
        labels: _.mapValues(Pagination.defaultProps.labels, (v) => v + ' custom'),
      }),
    ).toMatchSnapshot()
  })

  it('renders correctly with mini ui', () => {
    expect(render({ ui: 'mini' })).toMatchSnapshot()
  })

  it('renders correctly with simple ui', () => {
    expect(render({ ui: 'simple' })).toMatchSnapshot()
  })

  it('renders correctly with full ui', () => {
    expect(render({ ui: 'full' })).toMatchSnapshot()
  })

  it('renders correctly with custom range', () => {
    expect(render({ range: 1 })).toMatchSnapshot()
    expect(render({ range: 3 })).toMatchSnapshot()
    expect(render({ range: 7 })).toMatchSnapshot()
    expect(render({ range: 9 })).toMatchSnapshot()
  })

  it("shouldn't render disabled nav items when renderDisabled is false", () => {
    expect(
      render({
        pageInfo: { currentPage: 1, hasPreviousPage: false },
        renderDisabled: false,
      }),
    ).toMatchSnapshot()
    expect(
      render({
        pageInfo: { currentPage: defaultTestCase.pageInfo.pageCount, hasNextPage: false },
        renderDisabled: false,
      }),
    ).toMatchSnapshot()
    expect(
      render({
        pageInfo: {
          itemCount: 1,
          perPage: 10,
          pageCount: 1,
          currentPage: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        renderDisabled: false,
      }),
    ).toMatchSnapshot()
  })

  it.each(testCases)('correctly handles pageInfo options ($id)', ({ props }) => {
    expect(render(props)).toMatchSnapshot()
  })

  it('correctly defines pagination fragment', () => {
    expect(PaginationFragment).toBeUndefined()
    expect((graphql as Mock).mock.calls).toMatchSnapshot()
  })
})
