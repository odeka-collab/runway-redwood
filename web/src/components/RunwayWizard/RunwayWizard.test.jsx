import { render } from '@redwoodjs/testing/web'

import RunwayWizard from 'src/components/RunwayWizard'
import Providers from 'src/providers'

describe('RunwayWizard', () => {
  it('renders successfully', () => {
    expect(() => {
      render(
        <Providers>
          <RunwayWizard />
        </Providers>
      )
    }).not.toThrow()
  })
})
