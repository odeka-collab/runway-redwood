export const PRESET_BUSINESS = {
  funds: [
    {
      name: 'Main Business Account',
      amount: 22000,
      type: null,
      recurring: null,
      date: null,
      category: null,
    },
    {
      name: 'Other accounts',
      amount: 9000,
      type: null,
      recurring: null,
      date: null,
      category: null,
    },
  ],
  monthlyDebitsFixed: [
    {
      name: 'Full Support (5)',
      amount: 4200,
      type: 'debit',
      recurring: 'monthly',
      date: null,
      category: 'fixed',
    },
    {
      name: 'Partial Assist (2)',
      amount: 2000,
      type: 'debit',
      recurring: 'monthly',
      date: null,
      category: 'fixed',
    },
    {
      name: 'Moonlighters (4)',
      amount: 200,
      type: 'debit',
      recurring: 'monthly',
      date: null,
      category: 'fixed',
    },
  ],
  monthlyDebitsFlexible: [
    {
      name: 'Productivity SaaS',
      amount: 500,
      type: 'debit',
      recurring: 'monthly',
      date: null,
      category: 'flexible',
    },
    {
      name: 'Cloud Hosts (non-client)',
      amount: 350,
      type: 'debit',
      recurring: 'monthly',
      date: null,
      category: 'flexible',
    },
    {
      name: 'The "Good" Coffee Bulk Order',
      amount: 120,
      type: 'debit',
      recurring: 'monthly',
      date: null,
      category: 'flexible',
    },
    {
      name: 'Discord Boosts',
      amount: 74,
      type: 'debit',
      recurring: 'monthly',
      date: null,
      category: 'flexible',
    },
  ],
  oneTimeDebits: [
    {
      name: 'New dev tower for X',
      amount: 1300,
      type: 'debit',
      recurring: 'one_time',
      date: getFutureDate(0, 0, 15),
      category: null,
    },
    {
      name: 'Redwood Conf',
      amount: 2500,
      type: 'debit',
      recurring: 'one_time',
      date: getFutureDate(0, 1, 3),
      category: null,
    },
    {
      name: 'Yearly docusub re-up',
      amount: 400,
      type: 'debit',
      recurring: 'one_time',
      date: getFutureDate(0, 2, 3),
      category: null,
    },
    {
      name: 'Consultant - Accounting',
      amount: 900,
      type: 'debit',
      recurring: 'one_time',
      date: getFutureDate(0, 0, 30),
      category: null,
    },
  ],
  monthlyCredits: [
    {
      name: 'SaaS Subs',
      amount: 1250,
      type: 'credit',
      recurring: 'monthly',
      date: null,
      category: null,
    },
    {
      name: 'Visual Novel Patreon',
      amount: 240,
      type: 'credit',
      recurring: 'monthly',
      date: null,
      category: null,
    },
    {
      name: '"Big Boiz Inc" of Delaware',
      amount: 6000,
      type: 'credit',
      recurring: 'monthly',
      date: null,
      category: null,
    },
    {
      name: 'Support Retainers',
      amount: 3000,
      type: 'credit',
      recurring: 'monthly',
      date: null,
      category: null,
    },
  ],
  oneTimeCredits: [
    {
      name: 'Hollywood LLP - PoC  #2',
      amount: 12500,
      type: 'credit',
      recurring: 'one_time',
      date: getFutureDate(0, 0, 10),
      category: null,
    },
    {
      name: 'Pay by Check inc. #26',
      amount: 9500,
      type: 'credit',
      recurring: 'one_time',
      date: getFutureDate(0, 0, 17),
      category: null,
    },
    {
      name: 'DataProc LLC - Deploy #1',
      amount: 11000,
      type: 'credit',
      recurring: 'one_time',
      date: getFutureDate(0, 1, 14),
      category: null,
    },
    {
      name: 'DataProc LLC - SaaS #2',
      amount: 19000,
      type: 'credit',
      recurring: 'one_time',
      date: getFutureDate(0, 1, 4),
      category: null,
    },
  ],
  scenarios: [],
}

export const PRESET_LAID_OFF = {
  funds: [
    {
      name: 'Checking & Savings',
      amount: 20000,
      type: null,
      recurring: null,
      date: null,
      category: null,
    },
  ],
  monthlyDebitsFixed: [
    {
      name: 'Mortgage',
      amount: 2180,
      type: 'debit',
      recurring: 'monthly',
      date: null,
      category: 'fixed',
    },
    {
      name: 'Communications',
      amount: 450,
      type: 'debit',
      recurring: 'monthly',
      date: null,
      category: 'fixed',
    },
  ],
  monthlyDebitsFlexible: [
    {
      name: 'Groceries',
      amount: 1500,
      type: 'debit',
      recurring: 'monthly',
      date: null,
      category: 'flexible',
    },
  ],
  oneTimeDebits: [
    {
      name: 'Fix well',
      amount: 550,
      type: 'debit',
      recurring: 'one_time',
      date: getFutureDate(0, 1, 3),
      category: null,
    },
  ],
  monthlyCredits: [
    {
      name: 'Side project',
      amount: 1600,
      type: 'credit',
      recurring: 'monthly',
      date: null,
      category: null,
    },
  ],
  oneTimeCredits: [
    {
      name: 'Sell some stuff',
      amount: 200,
      type: 'credit',
      recurring: 'one_time',
      date: getFutureDate(0, 0, 13),
      category: null,
    },
  ],
  scenarios: [],
}

function getFutureDate(yearsInFuture, monthsInFuture, daysInFuture) {
  const date = new Date()
  date.setFullYear(date.getFullYear() + yearsInFuture)
  date.setMonth(date.getMonth() + monthsInFuture)
  date.setDate(date.getDate() + daysInFuture)
  return date?.toISOString()?.replace(/T.*$/, '')
}
