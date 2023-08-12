export const RunwayContext = React.createContext()

export const DEFAULT_VALUE = {
  data: {
    funds: [{ name: '', amount: 0 }],
    monthlyDebits: [{ color: '#f00000', name: '', amount: 0 }],
  },
}

export default function RunwayProvider({ children }) {
  const [state, dispatch] = React.useReducer(runwayReducer, {
    ...DEFAULT_VALUE,
  })

  return (
    <RunwayContext.Provider value={{ ...state, dispatch }}>
      {children}
    </RunwayContext.Provider>
  )
}

export function runwayReducer(state, { type, payload }) {
  switch (type) {
    case 'patch':
      return { ...state, ...payload }
    default:
      return { ...state }
  }
}
