import React from 'react'
import { shape, number, string, object, bool, element, oneOf, oneOfType } from 'prop-types'
import classNames from 'classnames'
import Link from './Link'

export default class Pagination extends React.Component {
  static propTypes = {
    route: string.isRequired,
    params: object,
    ui: oneOf(['mini', 'simple', 'full']),
    range: number,
    className: string,
    pageInfo: shape({
      itemCount: number.isRequired,
      perPage: number.isRequired,
      pageCount: number.isRequired,
      currentPage: number.isRequired,
      hasNextPage: bool.isRequired,
      hasPreviousPage: bool.isRequired
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
      disabled: string
    }),
    renderDisabled: bool
  };

  static defaultProps = {
    ui: 'full',
    range: 6,
    labels: {
      first: '« First',
      prev: '← Previous',
      next: 'Next →',
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
      disabled: 'disabled'
    },
    renderDisabled: true
  }

  render () {
    const {
      ui,
      pageInfo: {
        pageCount,
        currentPage,
        hasNextPage,
        hasPreviousPage
      }
    } = this.props

    const labels = Object.assign({}, Pagination.defaultProps.labels, this.props.labels)
    const theme = Object.assign({}, Pagination.defaultProps.theme, this.props.theme)
    const pages = []

    if (ui === 'full') {
      pages.push({
        key: 'first',
        number: 1,
        type: 'first',
        label: labels.first,
        disabled: !hasPreviousPage
      })
    }

    pages.push({
      key: 'prev',
      number: currentPage - 1,
      type: 'prev',
      label: labels.prev,
      disabled: !hasPreviousPage
    })

    if (ui !== 'mini') {
      const [fp, lp] = this.calcRange()
      for (let i = fp; i <= lp; i++) {
        pages.push({
          key: i,
          number: i,
          type: 'page',
          label: i.toString(),
          active: i === currentPage
        })
      }
    }

    pages.push({
      key: 'next',
      number: currentPage + 1,
      type: 'next',
      label: labels.next,
      disabled: !hasNextPage
    })

    if (ui === 'full') {
      pages.push({
        key: 'last',
        number: pageCount,
        type: 'last',
        label: labels.last,
        disabled: !hasNextPage
      })
    }

    return (
      <nav className={this.props.className} role='navigation' aria-label='Pagination Navigation'>
        <ul className={theme.inner}>
          {pages.map((page) => {
            if (page.disabled && !this.props.renderDisabled) {
              return null
            }

            const classes = [theme.item]
            const typeClass = theme['item.' + page.type]
            if (typeClass) {
              classes.push(typeClass)
            }

            classes.push({
              [theme.active]: page.active,
              [theme.disabled]: page.disabled
            })

            if (page.disabled) {
              return (
                <li key={page.key} className={classNames(classes)}>
                  <a className={theme.link}>{page.label}</a>
                </li>
              )
            }

            // Use non-paginated route for first page
            const [params, scope] = page.number === 1
              ? [this.props.params, null]
              : [{ ...this.props.params, page: page.number }, 'pagination']

            return (
              <li key={page.key} className={classNames(classes)}>
                <Link to={this.props.route} params={params} scope={scope} className={theme.link}>
                  {page.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    )
  }

  calcRange () {
    const { range, pageInfo: { currentPage, pageCount } } = this.props

    let fp = Math.max(1, currentPage - Math.floor(range / 2))
    let lp = Math.min(pageCount, currentPage + Math.floor(range / 2))

    if (lp - fp + 1 < range) {
      if (currentPage < pageCount / 2) {
        lp = Math.min(
          pageCount,
          lp + (range - (lp - fp))
        )
      } else {
        fp = Math.max(1, fp - (range - (lp - fp)))
      }
    }

    if (lp - fp + 1 > range) {
      if (currentPage > pageCount / 2) {
        fp = fp + 1
      } else {
        lp = lp - 1
      }
    }

    return [fp, lp]
  }
}
