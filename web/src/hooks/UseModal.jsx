import { ModalContext } from 'src/providers/ModalProvider'

export default function useModal() {
  const { dispatch, ...state } = React.useContext(ModalContext)

  function toggle() {
    dispatch({ type: 'patch', payload: { open: !state.open } })
  }

  return {
    ...state,
    toggle,
  }
}
