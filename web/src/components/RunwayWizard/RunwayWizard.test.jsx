import { render } from '@redwoodjs/testing/web'

import RunwayWizard from './RunwayWizard'

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('RunwayWizard', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<RunwayWizard />)
    }).not.toThrow()
  })
})
