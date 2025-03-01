import { withPrefix } from '../gatsby'

export const useLocation = vi.fn().mockReturnValue({
  pathname: withPrefix('/blog/page/5'),
})
