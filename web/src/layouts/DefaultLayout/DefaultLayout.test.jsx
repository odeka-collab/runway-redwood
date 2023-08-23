import { render } from '@redwoodjs/testing/web'

import DefaultLayout from 'src/layouts/DefaultLayout'
import Providers from 'src/providers'

//   Improve this test with help from the Redwood Testing Doc:
//   https://redwoodjs.com/docs/testing#testing-pages-layouts

describe('DefaultLayout', () => {
  it('renders successfully', () => {
    expect(() => {
      render(
        <Providers>
          <DefaultLayout />
        </Providers>
      )
    }).not.toThrow()
  })
})
