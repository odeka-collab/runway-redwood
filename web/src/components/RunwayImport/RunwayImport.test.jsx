import { render } from '@redwoodjs/testing/web'

import RunwayImport from 'src/components/RunwayImport'
import Providers from 'src/providers'

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('RunwayImport', () => {
  it('renders successfully', () => {
    expect(() => {
      render(
        <Providers>
          <RunwayImport />
        </Providers>
      )
    }).not.toThrow()
  })
})
