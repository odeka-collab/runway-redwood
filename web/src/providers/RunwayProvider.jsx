export const RunwayContext = React.createContext()

export const DEFAULT_VALUE = {
  data: {
    funds: [{ name: '', amount: 0 }],
    monthlyDebits: [{ color: '#f00000', name: '', amount: 0 }],
    monthlyCredits: [{ color: '#f00000', name: '', amount: 0 }],
  },
}

export default function RunwayProvider({ children, initialState }) {
  const [state, dispatch] = React.useReducer(runwayReducer, {
    ...(initialState || DEFAULT_VALUE),
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

export function buildRenderData(data) {
  const total = {
    funds: sumAmount(data?.funds) || 0,
    monthly: {
      debit: sumAmount(data?.monthlyDebits) || 0,
      credit: sumAmount(data?.monthlyCredits) || 0,
    },
  }

  const months = []
  const _date = new Date()
  let _remainingFunds = total.funds
  do {
    _date.setMonth(_date.getMonth() + 1)

    const _month = {
      label: _date.toLocaleDateString('en-us', {
        year: '2-digit',
        month: 'short',
      }),
      debit: total.monthly.debit,
      credit: total.monthly.credit,
      balance: {
        start: _remainingFunds,
        end: _remainingFunds + total.monthly.credit - total.monthly.debit,
      },
    }

    months.push(_month)

    _remainingFunds = _month.balance.end
  } while (
    total.monthly.debit > 0 &&
    total.monthly.debit > total.monthly.credit &&
    _remainingFunds > 0
  )

  return { months, total }
}

export function sumAmount(data) {
  return data?.reduce((acc, { amount }) => acc + (amount || 0), 0)
}
