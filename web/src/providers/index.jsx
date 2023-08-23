import ModalProvider from 'src/providers/ModalProvider'
import RunwayProvider from 'src/providers/RunwayProvider'

export default function Providers({ children }) {
  return (
    <ModalProvider>
      <RunwayProvider>{children}</RunwayProvider>
    </ModalProvider>
  )
}
