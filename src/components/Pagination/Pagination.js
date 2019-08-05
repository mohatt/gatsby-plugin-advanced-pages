import React from 'react'
import { shape, number, string, object, bool, element, oneOf, oneOfType } from 'prop-types'
import classNames from 'classnames'
import Link from '../Link'
import { getPageInfo } from 'paging-algorithm'

export default class Pagination extends React.Component {
  static propTypes = {
    route: string.isRequired,
    params: object,
    ui: oneOf(['mini', 'simple', 'full']),
    range: number,
    className: string,
    pageInfo: shape({
      itemCount: number.isRequired,
      currentPage: number.isRequired,
      perPage: number.isRequired
    }).isRequired,
    labels: shape({
      prev: oneOfType([string, element]),
      next: oneOfType([string, element]),
      first: oneOfType([string, element]),
      last: oneOfType([string, element])
    }),
    theme: shape({
      inner: string,
      item: string,
      'item.next': string,
      'item.prev': string,
      'item.first': string,
      'item.last': string,
      link: string,
      active: string,
      disabld: string
    }),
    renderDisabled: bool
  };

  static defaultProps = {
    ui: 'full',
    range: 6,
    labels: {
      first: '« First',
      prev: '⟨ Previous',
      next: 'Next ⟩',
      last: 'Last »'
    },
    theme: {
      inner: 'pagination',
      item: 'page-item',
      'item.next': 'page-item__next',
      'item.prev': 'page-item__prev',
      'item.first': 'page-item__first',
      'item.last': 'page-item__last',
      link: 'page-link',
      active: 'active',
      disabld: 'disabled'
    },
    renderDisabled: true
  }

  constructor(props) {
    super(props)

    this.state = getPageInfo({
      limit: props.pageInfo.perPage,
      pageCount: props.range,
      total: props.pageInfo.itemCount,
      page: props.pageInfo.currentPage
    })
  }

  shallRenderPrev() {
    return this.props.renderDisabled && !this.state.hasPreviousPage
      ? false
      : true
  }

  shallRenderNext() {
    return this.props.renderDisabled && !this.state.hasNextPage
      ? false
      : true
  }

  shallRenderFirst() {
    return this.props.ui !== 'full' || !this.shallRenderPrev()
      ? false
      : true
  }

  shallRenderLast() {
    return this.props.ui !== 'full' || !this.shallRenderNext()
      ? false
      : true
  }

  render() {
    const {
      totalPages,
      hasPreviousPage,
      hasNextPage,
      previousPage,
      nextPage,
      firstPage,
      lastPage,
      currentPage
    } = this.state
    const labels = Object.assign(Pagination.defaultProps.labels, this.props.labels)
    const theme = Object.assign(Pagination.defaultProps.theme, this.props.theme)
    const pages = []

    if(this.shallRenderFirst()) {
      pages.push({
        key: 'first',
        number: 1,
        type: 'first',
        label: labels.first,
        disabld: !hasPreviousPage
      })
    }

    if(this.shallRenderPrev()) {
      pages.push({
        key: 'prev',
        number: previousPage,
        type: 'prev',
        label: labels.prev,
        disabld: !hasPreviousPage
      })
    }

    if(this.props.ui !== 'mini') {
      for (let i = firstPage; i <= lastPage; i++) {
        pages.push({
          key: i,
          number: i,
          type: 'page',
          label: i.toString(),
          active: i === currentPage
        })
      }
    }

    if(this.shallRenderNext()) {
      pages.push({
        key: 'next',
        number: nextPage,
        type: 'next',
        label: labels.next,
        disabld: !hasNextPage
      })
    }

    if(this.shallRenderLast()) {
      pages.push({
        key: 'last',
        number: totalPages,
        type: 'last',
        label: labels.last,
        disabld: !hasNextPage
      })
    }

    return (
      <nav className={this.props.className} role="navigation" aria-label="Pagination Navigation">
        <ul className={theme.inner}>
        {pages.map((page) => {
          const classes = [theme.item]
          const typeClass = theme['item.' + page.type]
          if(typeClass){
            classes.push(typeClass)
          }

          classes.push({
            [theme.active]: page.active,
            [theme.disabled]: page.disabled
          })

          return (
            <li key={page.key} className={classNames(classes)}>
              <Link
                to={this.props.route}
                params={{...this.props.params, page: page.number}}
                scope="pagination"
                className={theme.link}
                children={page.label}
              />
            </li>
          )
        })}
        </ul>
      </nav>
    )
  }
}
