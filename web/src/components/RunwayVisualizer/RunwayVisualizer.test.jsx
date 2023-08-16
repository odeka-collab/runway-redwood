import { render } from '@redwoodjs/testing/web'

import RunwayVisualizer from './RunwayVisualizer'

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('RunwayVisualizer', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<RunwayVisualizer />)
    }).not.toThrow()
  })
})
