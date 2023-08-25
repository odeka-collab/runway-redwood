export const RunwayContext = React.createContext()

export const DEFAULT_VALUE = {
  data: {
    funds: [{ name: '', amount: 0 }],
    monthlyDebits: [{ name: '', amount: 0 }],
    monthlyCredits: [{ name: '', amount: 0 }],
    oneTimeDebits: [{ name: '', amount: 0, date: null }],
    oneTimeCredits: [{ name: '', amount: 0, date: null }],
    scenarios: [
      {
        name: '',
        funds: [],
        monthlyDebits: [],
        monthlyCredits: [],
        oneTimeDebits: [],
        oneTimeCredits: [],
      },
    ],
  },
}

export default function RunwayProvider({ children }) {
  const [state, dispatch] = React.useReducer(runwayReducer, DEFAULT_VALUE)

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
  if (!data) data = {}

  const months = []
  const _currentDate = new Date()
  const _endDate = new Date()
  _endDate.setMonth(_currentDate.getMonth() + 1)
  _endDate.setFullYear(_currentDate.getFullYear() + 1)

  // Ignore credits outside of date range
  data.oneTimeCredits = data.oneTimeCredits?.filter(({ date }) => {
    // Keep undated credits
    if (!date) return true
    date = convertStringToDate(date)
    return date < _endDate && !equalsYearAndMonth(date, _endDate)
  })

  // Ignore debits outside of date range
  data.oneTimeCredits = data.oneTimeCredits?.filter(({ date }) => {
    // Keep undated debits
    if (!date) return true
    date = convertStringToDate(date)
    return date < _endDate && !equalsYearAndMonth(date, _endDate)
  })

  const total = {
    funds: sumAmount(data?.funds) || 0,
    monthly: {
      debit: sumAmount(data?.monthlyDebits) || 0,
      credit: sumAmount(data?.monthlyCredits) || 0,
    },
    oneTime: {
      debit: sumAmount(data?.oneTimeDebits) || 0,
      credit: sumAmount(data?.oneTimeCredits) || 0,
    },
  }

  let _remainingFunds = total.funds

  // Add past months & undated to initial balance
  _remainingFunds += sumAmount(
    data?.oneTimeCredits?.filter(({ date }) => {
      if (!date) return true
      date = convertStringToDate(date)
      return date < _currentDate && !equalsYearAndMonth(date, _currentDate)
    })
  )

  // Subtract past months & undated from initial balance
  _remainingFunds -= sumAmount(
    data?.oneTimeDebits?.filter(({ date }) => {
      if (!date) return true
      date = convertStringToDate(date)
      return date < _currentDate && !equalsYearAndMonth(date, _currentDate)
    })
  )

  let _remainingOneTimeCredits

  do {
    _currentDate.setMonth(_currentDate.getMonth() + 1)

    const _currentMonthOneTimeCredits = sumAmount(
      data?.oneTimeCredits?.filter(({ date }) => {
        if (!date) return false
        date = convertStringToDate(date)
        return equalsYearAndMonth(date, _currentDate)
      })
    )

    const _currentMonthOneTimeDebits = sumAmount(
      data?.oneTimeDebits?.filter(({ date }) => {
        if (!date) return false
        date = convertStringToDate(date)
        return equalsYearAndMonth(date, _currentDate)
      })
    )

    const _currentMonth = {
      credit: total.monthly.credit + _currentMonthOneTimeCredits,
      debit: total.monthly.debit + _currentMonthOneTimeDebits,
    }

    _currentMonth.balance = {
      start: _remainingFunds,
      end: _remainingFunds + _currentMonth.credit - _currentMonth.debit,
    }

    const _month = {
      label: _currentDate.toLocaleDateString('en-us', {
        year: '2-digit',
        month: 'short',
      }),
      ..._currentMonth,
    }

    months.push(_month)

    _remainingFunds = _month.balance.end

    _remainingOneTimeCredits = sumAmount(
      data?.oneTimeCredits?.filter(({ date }) => {
        if (!date) return false
        date = convertStringToDate(date)
        return date >= _currentDate && !equalsYearAndMonth(date, _currentDate)
      })
    )
  } while (
    _currentDate < _endDate &&
    (_remainingFunds > 0 || _remainingOneTimeCredits > 0)
  )

  return { months, total }
}

export function convertStringToDate(yyyymmdd) {
  if (!yyyymmdd) return
  const [yyyy, mm, dd] = yyyymmdd.split('-')
  return new Date(yyyy, parseInt(mm, 10) - 1, dd)
}

export function equalsYearAndMonth(date1, date2) {
  return (
    date1 &&
    date2 &&
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  )
}

export function sumAmount(data) {
  return data?.reduce((acc, { amount }) => acc + (amount || 0), 0) || 0
}
