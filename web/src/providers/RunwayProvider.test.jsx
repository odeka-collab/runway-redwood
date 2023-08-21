import { buildRenderData } from './RunwayProvider'

beforeAll(() => {
  jest.useFakeTimers()
  jest.setSystemTime(new Date('2024-04-24'))
})

describe('RunwayProvider', () => {
  describe.each([
    [null],
    {},
    { funds: [{ name: '', amount: 10 }] },
    {
      funds: [{ name: '', amount: 10 }],
      monthlyDebits: [
        { name: '', amount: 1 },
        { name: '', amount: 3 },
      ],
    },
    {
      funds: [{ name: '', amount: 10 }],
      monthlyDebits: [{ name: '', amount: 4 }],
      monthlyCredits: [
        { name: '', amount: 1 },
        { name: '', amount: 1 },
      ],
    },
    {
      funds: [{ name: '', amount: 10 }],
      monthlyDebits: [{ name: '', amount: 4 }],
      monthlyCredits: [{ name: '', amount: 2 }],
      oneTimeDebits: [
        { name: '', amount: 1 },
        { name: '', amount: 1 },
        { name: '', amount: 1 },
      ],
    },
    {
      funds: [{ name: '', amount: 10 }],
      monthlyDebits: [{ name: '', amount: 4 }],
      monthlyCredits: [{ name: '', amount: 2 }],
      oneTimeDebits: [{ name: '', amount: 3 }],
      oneTimeCredits: [
        { name: '', amount: 1 },
        { name: '', amount: 1 },
        { name: '', amount: 1 },
        { name: '', amount: 1 },
      ],
    },
    {
      funds: [{ name: '', amount: 10 }],
      monthlyDebits: [{ name: '', amount: 4 }],
      monthlyCredits: [{ name: '', amount: 2 }],
      oneTimeDebits: [
        { name: '', amount: 1, date: '2025-01-21' },
        { name: '', amount: 3 },
        { name: '', amount: 1, date: '2024-08-21' },
      ],
      oneTimeCredits: [{ name: '', amount: 4 }],
    },
    {
      funds: [{ name: '', amount: 10 }],
      monthlyDebits: [{ name: '', amount: 4 }],
      monthlyCredits: [{ name: '', amount: 2 }],
      oneTimeDebits: [
        { name: '', amount: 1, date: '2025-01-21' },
        { name: '', amount: 3 },
        { name: '', amount: 1, date: '2024-08-21' },
      ],
      oneTimeCredits: [
        { name: '', amount: 1, date: '2025-01-21' },
        { name: '', amount: 4 },
        { name: '', amount: 1, date: '2024-08-21' },
      ],
    },
    {
      funds: [{ name: '', amount: 10 }],
      monthlyDebits: [{ name: '', amount: 4 }],
      monthlyCredits: [{ name: '', amount: 2 }],
      oneTimeDebits: [
        { name: '', amount: 1, date: '2025-01-21' },
        { name: '', amount: 3 },
        { name: '', amount: 1, date: '2024-08-21' },
        { name: '', amount: 1, date: '2025-05-01' },
        { name: '', amount: 1, date: '2025-04-25' },
      ],
      oneTimeCredits: [
        { name: '', amount: 1, date: '2025-01-21' },
        { name: '', amount: 4 },
        { name: '', amount: 1, date: '2024-08-21' },
        { name: '', amount: 1, date: '2025-05-01' },
        { name: '', amount: 1, date: '2025-04-25' },
      ],
    },
  ])('buildRenderData()', (given) => {
    it('transforms form data to visualizer schema', () => {
      expect({
        given: { ...given },
        returns: buildRenderData(given),
      }).toMatchSnapshot()
    })
  })
})
