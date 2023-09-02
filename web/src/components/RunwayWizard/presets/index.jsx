export const PRESET_BUSINESS = {
  funds: [{ name: '', amount: 0 }],
  monthlyDebits: [{ name: '', amount: 0 }],
  monthlyCredits: [{ name: '', amount: 0 }],
  oneTimeDebits: [{ name: '', amount: 0, date: null }],
  oneTimeCredits: [{ name: '', amount: 0, date: null }],
  scenarios: [],
}

export const PRESET_LAID_OFF = {
  funds: [{ name: 'Checking & Savings', amount: 20000 }],
  monthlyDebits: [{ name: 'Mortgage', amount: 2180 }],
  monthlyCredits: [{ name: 'Side project', amount: 1600 }],
  oneTimeDebits: [
    { name: 'Fix well', amount: 550, date: getFutureDate(0, 1, 3) },
  ],
  oneTimeCredits: [
    { name: 'Sell some stuff', amount: 200, date: getFutureDate(0, 2, 13) },
  ],
  scenarios: [],
}

function getFutureDate(years, months, days) {
  const date = new Date()
  date.setFullYear(date.getFullYear() + years)
  date.setMonth(date.getMonth() + months)
  date.setDate(date.getDate() + days)
  return date
}
