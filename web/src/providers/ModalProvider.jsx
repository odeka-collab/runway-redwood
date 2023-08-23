export const ModalContext = React.createContext()

export default function ModalProvider({ children }) {
  const [state, dispatch] = React.useReducer(runwayImportReducer, {
    open: false,
  })

  return (
    <ModalContext.Provider value={{ ...state, dispatch }}>
      {children}
    </ModalContext.Provider>
  )
}

export function runwayImportReducer(state, { type, payload }) {
  switch (type) {
    case 'patch':
      return { ...state, ...payload }
    default:
      return { ...state }
  }
}
