import { render } from '@redwoodjs/testing/web'

import RunwayVisualizer from 'src/components/RunwayVisualizer'
import { ScenarioContext } from 'src/components/RunwayWizard'

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('RunwayVisualizer', () => {
  it('renders successfully', () => {
    expect(() => {
      render(
        <ScenarioContext.Provider value={{ setScenario: () => {} }}>
          <RunwayVisualizer />
        </ScenarioContext.Provider>
      )
    }).not.toThrow()
  })
})
