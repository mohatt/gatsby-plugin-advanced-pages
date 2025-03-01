import path from 'path'

export const graphql = vi.fn()
export const withPrefix = vi
  .fn()
  .mockImplementation((pathname: string) => path.join('/site', pathname))
export const navigate = vi.fn()
export const Link = vi
  .fn()
  .mockImplementation(
    ({ activeClassName, activeStyle, getProps, innerRef, ref, replace, to, ...rest }) => (
      <a href={(to && withPrefix(to)) || '?!'} {...rest} />
    ),
  )
