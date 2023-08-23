import { render } from '@redwoodjs/testing/web'

import Header from 'src/components/Header'
import Providers from 'src/providers'

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('Header', () => {
  it('renders successfully', () => {
    expect(() => {
      render(
        <Providers>
          <Header />
        </Providers>
      )
    }).not.toThrow()
  })
})
