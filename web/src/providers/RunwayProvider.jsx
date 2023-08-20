export const RunwayContext = React.createContext()

export const DEFAULT_VALUE = {
  data: {
    funds: [{ name: '', amount: 0 }],
    monthlyDebits: [{ color: '#f00000', name: '', amount: 0 }],
    monthlyCredits: [{ color: '#f00000', name: '', amount: 0 }],
    oneTimeCredits: [{ color: '#f00000', name: '', amount: 0, date: null }],
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
  const _currentDate = new Date()
  const _endDate = new Date()
  _endDate.setFullYear(_currentDate.getFullYear() + 1)

  // Add to the balance:
  // - past months credits
  // - undated, one-time credits
  total.funds += sumAmount(
    data?.oneTimeCredits?.filter(({ date }) => {
      if (!date) return false
      const _d = new Date(date)
      return _d < _currentDate && _d?.getMonth() !== _currentDate.getMonth()
    })
  )

  let _remainingFunds = total.funds

  do {
    const _currentMonthOneTimeCredits = sumAmount(
      data?.oneTimeCredits?.filter(({ date }) =>
        equalsYearAndMonth(date, _currentDate)
      )
    )

    const _currentMonth = {
      credit: total.monthly.credit + _currentMonthOneTimeCredits,
      debit: total.monthly.debit,
    }

    const _month = {
      label: _currentDate.toLocaleDateString('en-us', {
        year: '2-digit',
        month: 'short',
      }),
      ..._currentMonth,
      balance: {
        start: _remainingFunds,
        end: _remainingFunds + _currentMonth.credit - _currentMonth.debit,
      },
    }

    months.push(_month)

    _remainingFunds = _month.balance.end
    _currentDate.setMonth(_currentDate.getMonth() + 1)
  } while (
    _currentDate < _endDate &&
    total.monthly.debit > total.monthly.credit &&
    _remainingFunds > 0
  )

  return { months, total }
}

export function equalsYearAndMonth(date1, date2) {
  return (
    date1 &&
    date2 &&
    new Date(date1).getFullYear() === new Date(date2).getFullYear() &&
    new Date(date1).getMonth() === new Date(date2).getMonth()
  )
}

export function sumAmount(data) {
  return data?.reduce((acc, { amount }) => acc + (amount || 0), 0)
}
