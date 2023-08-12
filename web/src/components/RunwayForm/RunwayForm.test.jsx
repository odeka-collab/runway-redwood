import { render } from '@redwoodjs/testing/web'

import RunwayForm from './RunwayForm'

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('RunwayForm', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<RunwayForm />)
    }).not.toThrow()
  })
})
