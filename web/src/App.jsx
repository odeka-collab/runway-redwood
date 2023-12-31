import { FatalErrorBoundary, RedwoodProvider } from '@redwoodjs/web'
import { RedwoodApolloProvider } from '@redwoodjs/web/apollo'

import FatalErrorPage from 'src/pages/FatalErrorPage'
import ModalProvider from 'src/providers/ModalProvider'
import RunwayProvider from 'src/providers/RunwayProvider'
import Routes from 'src/Routes'

import 'src/index.css'

const App = () => (
  <FatalErrorBoundary page={FatalErrorPage}>
    <RedwoodProvider titleTemplate="%PageTitle | %AppTitle">
      <RedwoodApolloProvider>
        <ModalProvider>
          <RunwayProvider>
            <Routes />
          </RunwayProvider>
        </ModalProvider>
      </RedwoodApolloProvider>
    </RedwoodProvider>
  </FatalErrorBoundary>
)

export default App
