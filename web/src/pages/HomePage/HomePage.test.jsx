import { render } from '@redwoodjs/testing/web'

import HomePage from 'src/pages/HomePage'
import Providers from 'src/providers'

//   Improve this test with help from the Redwood Testing Doc:
//   https://redwoodjs.com/docs/testing#testing-pages-layouts

describe('HomePage', () => {
  it('renders successfully', () => {
    expect(() => {
      render(
        <Providers>
          <HomePage />
        </Providers>
      )
    }).not.toThrow()
  })

  it('renders the onboarding form', () => {
    expect(
      render(
        <Providers>
          <HomePage />
        </Providers>
      )
    ).toMatchSnapshot()
  })
})
