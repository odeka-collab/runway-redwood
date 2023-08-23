import { render } from '@redwoodjs/testing/web'

import RunwayImport from './RunwayImport'

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('RunwayImport', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<RunwayImport />)
    }).not.toThrow()
  })
})
