/**
 * Runway Form Data
 * @typedef {Object} RunwayFormData
 * @property {string=} id
 * @property {string=} name
 * @property {Object[]=} funds
 * @property {Object[]=} monthlyDebits
 * @property {Object[]=} monthlyDebitsFixed
 * @property {Object[]=} monthlyDebitsFlexible
 * @property {Object[]=} monthlyCredits
 * @property {Object[]=} oneTimeDebits
 * @property {Object[]=} oneTimeCredits
 * @property {RunwayFormData[]=} scenarios
 */

/**
 * Runway Render Data
 * @typedef {Object} RunwayRenderData
 * @property {string=} id
 * @property {string=} name
 * @property {Object[]} months
 * @property {string} months.label
 * @property {number} months.credit
 * @property {number} months.debit
 * @property {Object} months.balance
 * @property {number} months.balance.start
 * @property {number} months.balance.end
 * @property {Object} total
 * @property {number} total.start
 * @property {number} total.end
 * @property {number} total.monthly.credit
 * @property {number} total.monthly.debit
 * @property {RunwayRenderData[]=} scenarios
 */

export const RunwayContext = React.createContext()

export const DEFAULT_VALUE = {
  data: {
    funds: [
      {
        name: '',
        amount: 0,
        type: null,
        recurring: null,
        date: null,
        category: null,
      },
    ],
    monthlyCredits: [
      {
        name: '',
        amount: 0,
        type: 'credit',
        recurring: 'monthly',
        date: null,
        category: null,
      },
    ],
    oneTimeCredits: [
      {
        name: '',
        amount: 0,
        type: 'credit',
        recurring: 'one_time',
        date: null,
        category: null,
      },
    ],
    monthlyDebits: [
      {
        name: '',
        amount: 0,
        type: 'debit',
        recurring: 'monthly',
        date: null,
        category: null,
      },
    ],
    oneTimeDebits: [
      {
        name: '',
        amount: 0,
        type: 'debit',
        recurring: 'one_time',
        date: null,
        category: null,
      },
    ],
    scenarios: [],
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

/**
 * Builds the runway visualization data.
 * Note: this function is called recursively to build nested runway scenarios.
 * @param {RunwayFormData=} data
 * @returns {RunwayRenderData}
 */
export function buildRenderData(data) {
  if (!data) data = {}

  const { currentDate, endDate } = getDateRange()

  const { scenarios: _scenarios, ...baseData } = data

  const renderData = buildRunway({
    data: baseData,
    currentDate,
    endDate,
  })

  const scenarios = _scenarios
    ?.filter((scenario) => scenario?.name)
    ?.map(buildRenderData)

  return { ...renderData, ...(scenarios && { scenarios }) }
}

export function buildRunway({ data, currentDate, endDate }) {
  const months = []

  const total = getTotal(data)

  let remainingFunds = total.funds

  // Add past months & undated credits to initial balance
  remainingFunds += sumAmount(
    data?.oneTimeCredits?.filter(filterBeforeDate(currentDate))
  )

  // Subtract past months & undated debits from initial balance
  remainingFunds -= sumAmount(
    data?.oneTimeDebits?.filter(filterBeforeDate(currentDate))
  )

  let remainingOneTimeCredits

  do {
    currentDate.setMonth(currentDate.getMonth() + 1)

    const currentMonthOneTimeCredits = sumAmount(
      data?.oneTimeCredits?.filter(filterCurrentMonth(currentDate))
    )

    const currentMonthOneTimeDebits = sumAmount(
      data?.oneTimeDebits?.filter(filterCurrentMonth(currentDate))
    )

    const currentMonth = {
      credit: total.monthly.credit + currentMonthOneTimeCredits,
      debit: total.monthly.debit + currentMonthOneTimeDebits,
    }

    currentMonth.balance = {
      start: remainingFunds,
      end: remainingFunds + currentMonth.credit - currentMonth.debit,
    }

    const month = {
      label: currentDate.toLocaleDateString('en-us', {
        year: '2-digit',
        month: 'short',
      }),
      ...currentMonth,
    }

    months.push(month)

    remainingFunds = month.balance.end

    remainingOneTimeCredits = sumAmount(
      data?.oneTimeCredits?.filter(filterAfterDate(currentDate))
    )
  } while (
    currentDate < endDate &&
    (remainingFunds > 0 || remainingOneTimeCredits > 0)
  )

  const { id, name } = data

  return { months, total, ...(id && { id }), ...(name && { name }) }
}

export function getDateRange() {
  const currentDate = new Date()
  const endDate = new Date()
  endDate.setMonth(currentDate.getMonth() + 1)
  endDate.setFullYear(currentDate.getFullYear() + 1)

  return { currentDate, endDate }
}

export function filterBeforeDate(endDate) {
  return ({ date }) => {
    // Keep undated items
    if (!date) return true
    date = convertStringToDate(date)
    return date < endDate && !equalsYearAndMonth(date, endDate)
  }
}

export function filterCurrentMonth(currentDate) {
  return ({ date }) => {
    if (!date) return false
    date = convertStringToDate(date)
    return equalsYearAndMonth(date, currentDate)
  }
}

export function filterAfterDate(currentDate) {
  return ({ date }) => {
    if (!date) return false
    date = convertStringToDate(date)
    return date >= currentDate && !equalsYearAndMonth(date, currentDate)
  }
}

export function getTotal(data) {
  return {
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
