export const RunwayContext = React.createContext()

export const STEPS = {
  FUNDS_AND_MONTHLY_DEBITS: 'FUNDS_AND_MONTHLY_DEBITS',
  RENDER_RUNWAY: 'FUNDS_AND_MONTHLY_DEBITS',
  INCOME: 'INCOME',
}

export const DEFAULT_VALUE = {
  currentStep: STEPS.FUNDS_AND_MONTHLY_DEBITS,
  data: {
    funds: [{ name: '', amount: 0 }],
    monthlyDebits: [{ color: '#f00000', name: '', amount: 0 }],
  },
}

export default function RunwayProvider({ children, initialState }) {
  const [state, dispatch] = React.useReducer(runwayReducer, {
    ...(initialState || DEFAULT_VALUE),
  })

  state.renderData = buildRenderData(state?.data)

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

export function buildRenderData(data) {
  const fundsTotal = sumAmount(data?.funds) || 0
  const monthlyDebitsTotal = sumAmount(data?.monthlyDebits) || 0

  let remainingFunds = fundsTotal
  const date = new Date()
  const months = []
  do {
    months.push({
      label: date.toLocaleDateString('en-us', {
        year: '2-digit',
        month: 'short',
      }),
      debit: monthlyDebitsTotal,
      funded: Math.min(monthlyDebitsTotal, remainingFunds),
    })
    date.setMonth(date.getMonth() + 1)
    remainingFunds = remainingFunds - monthlyDebitsTotal
  } while (monthlyDebitsTotal > 0 && remainingFunds > 0)
  const renderData = { months }

  return renderData
}

export function sumAmount(data) {
  return data?.reduce((acc, { amount }) => acc + (amount || 0), 0)
}
