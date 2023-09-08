import {
  AirplaneTakeoff,
  ArrowCounterClockwise,
  ArrowFatLeft,
  ArrowFatRight,
  FloppyDiskBack,
  Plus,
  ProjectorScreenChart,
  Question,
  Trash,
} from '@phosphor-icons/react'
import _get from 'lodash.get'
import _isEqual from 'lodash.isequal'
import _set from 'lodash.set'
import { v4 as uuidv4 } from 'uuid'

import {
  DateField,
  FieldError,
  Form,
  HiddenField,
  Label,
  NumberField,
  Submit,
  TextField,
  useFieldArray,
  useForm,
} from '@redwoodjs/forms'

import Button from 'src/components/Button/Button'
import { DEFAULT_VALUE, RUNWAY_MONTHS_MAX } from 'src/providers/RunwayProvider'

const FUNDS_DEFAULT_APPEND_VALUE = DEFAULT_VALUE.data.funds[0]
const MONTHLY_CREDITS_DEFAULT_APPEND_VALUE =
  DEFAULT_VALUE.data.monthlyCredits[0]
const MONTHLY_DEBITS_DEFAULT_APPEND_VALUE = DEFAULT_VALUE.data.monthlyDebits[0]
const MONTHLY_DEBITS_FIXED_DEFAULT_APPEND_VALUE = [
  {
    name: '',
    amount: 0,
    type: 'debit',
    recurring: 'monthly',
    date: null,
    category: 'fixed',
  },
]
const MONTHLY_DEBITS_FLEXIBLE_DEFAULT_APPEND_VALUE = [
  {
    name: '',
    amount: 0,
    type: 'debit',
    recurring: 'monthly',
    date: null,
    category: 'flexible',
  },
]
const ONE_TIME_CREDITS_DEFAULT_APPEND_VALUE =
  DEFAULT_VALUE.data.oneTimeCredits[0]
const ONE_TIME_DEBITS_DEFAULT_APPEND_VALUE = DEFAULT_VALUE.data.oneTimeDebits[0]

const RunwayForm = ({
  backLabel = 'Back',
  children,
  defaultValues,
  display,
  enableScenarios,
  onSubmit,
  onBack,
  render,
  submitComponent: SubmitComponent,
}) => {
  children = render || children || AllFields

  const formMethods = useForm({ defaultValues })

  function handleBack(e) {
    e.preventDefault()
    formMethods.reset()
    onBack()
  }

  function handleClickScenarios(e) {
    e.preventDefault()
    formMethods.handleSubmit(submitter({ goto: 'scenario' }))()
  }

  function handleSave(e) {
    e.preventDefault()
    // bypass validation
    onSubmit(sanitize(formMethods.getValues()), { goto: 'save' })
  }

  function submitter(options) {
    return (formValues) => {
      onSubmit(sanitize(formValues), options)
    }
  }

  /**
   * Form data clean-up:
   * - remove excess fields with default values
   * - format dates
   * @param {*} formValues
   * @returns sanitized form values
   */
  function sanitize(formValues) {
    return {
      ...formValues,
      id: formValues.id || uuidv4(), // id used by visualizer
      ...reduceFormValues(formValues),
      ...(formValues.scenarios?.length > 0 && {
        scenarios: formValues.scenarios.map((scenario) => ({
          ...scenario,
          id: scenario.id || uuidv4(), // id used by visualizater
          ...reduceFormValues(scenario),
        })),
      }),
    }
  }

  function reduceFormValues(
    formValues,
    config = [
      {
        key: 'funds',
        defaultAppendValue: FUNDS_DEFAULT_APPEND_VALUE,
        minRows: 1,
      },
      {
        key: 'monthlyCredits',
        defaultAppendValue: MONTHLY_CREDITS_DEFAULT_APPEND_VALUE,
        minRows: 1,
      },
      {
        key: 'oneTimeCredits',
        defaultAppendValue: ONE_TIME_CREDITS_DEFAULT_APPEND_VALUE,
        minRows: 1,
      },
      {
        key: 'monthlyDebits',
        defaultAppendValue: MONTHLY_DEBITS_DEFAULT_APPEND_VALUE,
        minRows: 1,
      },
      {
        key: 'monthlyDebitsFixed',
        defaultAppendValue: MONTHLY_DEBITS_FIXED_DEFAULT_APPEND_VALUE,
        minRows: 1,
      },
      {
        key: 'monthlyDebitsFlexible',
        defaultAppendValue: MONTHLY_DEBITS_FLEXIBLE_DEFAULT_APPEND_VALUE,
        minRows: 1,
      },
      {
        key: 'oneTimeDebits',
        defaultAppendValue: ONE_TIME_DEBITS_DEFAULT_APPEND_VALUE,
        minRows: 1,
      },
    ]
  ) {
    return config?.reduce((acc, { key, defaultAppendValue, minRows }) => {
      if (_get(formValues, key)?.length > 0) {
        _set(
          acc,
          key,
          _get(formValues, key, [])?.map(normalizeDate)?.reduce(
            reduceDefaultAppendValue({
              formValues,
              key,
              defaultAppendValue,
              minRows,
            }),
            []
          )
        )
      }

      return acc
    }, {})
  }

  function reduceDefaultAppendValue({
    formValues,
    key,
    defaultAppendValue,
    minRows = 1,
  }) {
    return (acc, row, i, arr) => {
      // Keep rows with updated values
      if (
        isDirty({ value: _get(formValues, `${key}.${i}`), defaultAppendValue })
      ) {
        acc = [...acc, row]
      }

      // Maintain at pristine row min
      while (i === arr.length - 1 && minRows && acc.length < minRows) {
        acc = [...acc, defaultAppendValue]
      }

      return acc
    }
  }

  function isDirty({ value, defaultAppendValue }) {
    const { id: _, ...formValue } = normalizeDate(value)
    return !_isEqual(formValue, defaultAppendValue)
  }

  /**
   * Normalizes the date value submitted by <DateField>.
   * Converts to "YYYY-MM-DD" of the selected date, or null for the Unix epoch.
   * The <DateField> submitted value will be one of:
   *   - "YYYY-MM-DD" if the value was supplied when the <DateField> was created
   *   - a Date object if a date was selected
   *   - a Date object with the unix epoch value if `null` was supplied when the <DateField> was created
   * @param {string} options.date The <DateField> submitted value
   * @returns {string} YYYY-MM-DD
   */
  function normalizeDate({ date, ...rest }) {
    return {
      ...rest,
      date:
        typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)
          ? date
          : !(date instanceof Date) ||
            date.toISOString() === '1970-01-01T00:00:00.000Z'
          ? null
          : date?.toISOString()?.replace(/T.*$/, ''),
    }
  }

  return (
    <Form
      formMethods={formMethods}
      onSubmit={submitter()}
      className={
        display === 'compact'
          ? 'flex flex-col gap-2'
          : 'flex flex-col gap-4 sm:gap-8'
      }
    >
      {display === 'compact' && (
        <div className="mb-4 flex flex-col items-stretch gap-2 border-b border-double border-black py-8 sm:flex-row sm:justify-between">
          {enableScenarios && (
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-lg border-4 border-double border-black px-4 py-2 uppercase"
              onClick={handleClickScenarios}
            >
              <Question className="h-4 w-auto sm:hidden" />
              What if&hellip;
              <Question className="hidden h-4 w-auto sm:inline" />
            </button>
          )}
          {onBack && !enableScenarios && (
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-lg border-4 border-double border-black px-4 py-2 uppercase"
              onClick={handleBack}
            >
              <ArrowFatLeft className="h-4 w-auto" />
              {backLabel}
            </button>
          )}
          <div className="flex flex-col-reverse items-stretch gap-2 sm:ml-auto sm:flex-row">
            <Button
              type="button"
              className="flex items-center justify-center gap-2 rounded-lg border-4 border-double border-black px-4 py-2 uppercase sm:p-3"
              onClick={handleSave}
            >
              <FloppyDiskBack className="h-4 w-auto" />
              <span className="inline sm:hidden">Save / Load</span>
            </Button>
            <Submit>
              {SubmitComponent ? (
                <SubmitComponent formMethods={formMethods} />
              ) : (
                <NextLabel />
              )}
            </Submit>
          </div>
        </div>
      )}
      <HiddenField name="id" />
      {children({ ...formMethods, display })}
      <div
        className={`flex flex-col-reverse gap-2 border-t-4 border-double border-black pt-4 sm:flex-row sm:justify-between ${
          display === 'compact' ? 'sm:pt-2' : 'sm:pt-8'
        }`}
      >
        {onBack && (
          <button
            className="flex items-center justify-center gap-2 rounded-lg border-4 border-double border-black px-4 py-2 uppercase"
            onClick={handleBack}
          >
            <ArrowFatLeft className="h-4 w-auto" />
            {backLabel}
          </button>
        )}
        <div className="flex flex-col-reverse items-stretch gap-2 sm:ml-auto sm:flex-row">
          <Button
            className="flex items-center justify-center gap-2 rounded-lg border-4 border-double border-black px-4 py-2 uppercase sm:p-3"
            onClick={handleSave}
          >
            <FloppyDiskBack className="h-4 w-auto" />
            <span className="inline sm:hidden">Save / Load</span>
          </Button>
          <Submit>
            {SubmitComponent ? (
              <SubmitComponent formMethods={formMethods} />
            ) : (
              <NextLabel />
            )}
          </Submit>
        </div>
      </div>
    </Form>
  )
}

RunwayForm.AllFields = AllFields
RunwayForm.Transactions = Transactions
RunwayForm.Funds = Funds
RunwayForm.MonthlyCredits = MonthlyCredits
RunwayForm.MonthlyDebits = MonthlyDebits
RunwayForm.MonthlyDebitsFixed = MonthlyDebitsFixed
RunwayForm.MonthlyDebitsFlexible = MonthlyDebitsFlexible
RunwayForm.OneTimeCredits = OneTimeCredits
RunwayForm.OneTimeDebits = OneTimeDebits
RunwayForm.Scenarios = Scenarios
RunwayForm.FieldArray = FieldArray
RunwayForm.NextLabel = NextLabel
RunwayForm.BuildRunwayLabel = BuildRunwayLabel
RunwayForm.BuildScenarioLabel = BuildScenarioLabel
export default RunwayForm

function AllFields({
  // eslint-disable-next-line no-unused-vars
  children,
  ...props
}) {
  return (
    <>
      <Funds {...props} />
      <MonthlyDebits {...props} />
      <OneTimeDebits {...props} />
      <MonthlyCredits {...props} />
      <OneTimeCredits {...props} />
    </>
  )
}

export function Transactions({
  appendLabel = 'Add row',
  dateRange = {},
  defaultAppendValue = { name: '', amount: 0 },
  description,
  display,
  headerText = 'Transactions',
  minRows = 1,
  name,
  watch,
}) {
  const { start, end } = initDateRange(dateRange)

  return (
    name && (
      <>
        {headerText && <Header display={display}>{headerText}</Header>}
        {description && <Description>{description}</Description>}
        <FieldArray
          name={name}
          appendLabel={appendLabel}
          defaultAppendValue={defaultAppendValue}
          minRows={minRows}
          display={display}
        >
          {({ field, index }) => (
            <Row>
              <HiddenField name={`${name}.${index}.type`} emptyAs={null} />
              <HiddenField name={`${name}.${index}.recurring`} emptyAs={null} />
              <HiddenField name={`${name}.${index}.category`} emptyAs={null} />
              <TextFieldSet name={`${name}.${index}.name`} />
              <CurrencyFieldSet name={`${name}.${index}.amount`} />
              {field.recurring === 'one_time' && (
                <DateFieldSet
                  name={`${name}.${index}.date`}
                  min={start}
                  max={end}
                  validation={{
                    validate: {
                      requiredIfAmountFieldPositive(value) {
                        return watch(`${name}.${index}.amount`) > 0 &&
                          // <DateField> given a null value, returns unix epoch
                          (!value ||
                            value.toISOString() === '1970-01-01T00:00:00.000Z')
                          ? 'Required'
                          : undefined
                      },
                    },
                  }}
                />
              )}
            </Row>
          )}
        </FieldArray>
      </>
    )
  )
}

export function Funds({
  appendLabel = 'Add funds',
  defaultAppendValue = { ...FUNDS_DEFAULT_APPEND_VALUE },
  headerText = 'Current Funds',
  name = 'funds',
  ...props
}) {
  return (
    <Transactions
      {...{
        ...props,
        appendLabel,
        defaultAppendValue,
        headerText,
        name,
      }}
    />
  )
}

export function MonthlyDebits({
  appendLabel = 'Add expense',
  defaultAppendValue = { ...MONTHLY_DEBITS_DEFAULT_APPEND_VALUE },
  headerText = 'Monthly expenses',
  name = 'monthlyDebits',
  ...props
}) {
  return (
    <Transactions
      {...{
        ...props,
        appendLabel,
        defaultAppendValue,
        headerText,
        name,
      }}
    />
  )
}

export function MonthlyDebitsFixed({
  appendLabel = 'Add expense',
  defaultAppendValue = { ...MONTHLY_DEBITS_FIXED_DEFAULT_APPEND_VALUE },
  headerText = 'Fixed monthly expenses',
  name = 'monthlyDebitsFixed',
  ...props
}) {
  return (
    <Transactions
      {...{
        ...props,
        appendLabel,
        defaultAppendValue,
        headerText,
        name,
      }}
    />
  )
}

export function MonthlyDebitsFlexible({
  appendLabel = 'Add expense',
  headerText = 'Flexible monthly expenses',
  name = 'monthlyDebitsFlexible',
  defaultAppendValue = { ...MONTHLY_DEBITS_FLEXIBLE_DEFAULT_APPEND_VALUE },
  ...props
}) {
  return (
    <Transactions
      {...{
        ...props,
        appendLabel,
        defaultAppendValue,
        headerText,
        name,
      }}
    />
  )
}

export function MonthlyCredits({
  appendLabel = 'Add income',
  defaultAppendValue = { ...MONTHLY_CREDITS_DEFAULT_APPEND_VALUE },
  headerText = 'Monthly income',
  name = 'monthlyCredits',
  ...props
}) {
  return (
    <Transactions
      {...{
        ...props,
        appendLabel,
        defaultAppendValue,
        headerText,
        name,
      }}
    />
  )
}

export function OneTimeCredits({
  appendLabel = 'Add income',
  defaultAppendValue = { ...ONE_TIME_CREDITS_DEFAULT_APPEND_VALUE },
  headerText = 'Other income',
  name = 'oneTimeCredits',
  ...props
}) {
  return (
    <Transactions
      {...{
        ...props,
        appendLabel,
        defaultAppendValue,
        headerText,
        name,
      }}
    />
  )
}

export function OneTimeDebits({
  appendLabel = 'Add expense',
  defaultAppendValue = { ...ONE_TIME_DEBITS_DEFAULT_APPEND_VALUE },
  headerText = 'Other expenses',
  name = 'oneTimeDebits',
  ...props
}) {
  return (
    <Transactions
      {...{
        ...props,
        appendLabel,
        defaultAppendValue,
        headerText,
        name,
      }}
    />
  )
}

export function Scenarios({
  appendLabel = 'Add scenario',
  description,
  display,
  getValues,
  headerText = 'Scenarios',
  watch,
}) {
  // eslint-disable-next-line no-unused-vars
  const { id, name, scenarios, ...defaultAppendValue } = getValues()

  return (
    <>
      {headerText && <Header>{headerText}</Header>}
      {description && <Description>{description}</Description>}
      <ScenarioArray
        appendLabel={appendLabel}
        defaultAppendValue={{ ...defaultAppendValue, name: '' }}
        display={display}
        deleteLabel="Delete Scenario"
        name="scenarios"
        resetLabel="Reset Scenario"
      >
        {({ index }) => <Scenario {...{ index, display, watch }} />}
      </ScenarioArray>
    </>
  )
}

function Scenario({ index, display, watch }) {
  return (
    <div className="flex flex-grow flex-col gap-8">
      <HiddenField name={`scenarios.${index}.id`} />
      <div className="flex items-end gap-4">
        <h3 className="text-xl font-semibold">What if&hellip;</h3>
        <TextFieldSet
          {...{
            name: `scenarios.${index}.name`,
            // validation: { required: 'A scenario name is required' },
          }}
        />
      </div>
      <div className="flex flex-col gap-6">
        <Funds
          {...{ name: `scenarios.${index}.funds`, minRows: 0, display, watch }}
        />
        <MonthlyDebits
          {...{
            name: `scenarios.${index}.monthlyDebits`,
            minRows: 0,
            display,
            watch,
          }}
        />
        <OneTimeDebits
          {...{
            name: `scenarios.${index}.oneTimeDebits`,
            minRows: 0,
            display,
            watch,
          }}
        />
        <MonthlyCredits
          {...{
            name: `scenarios.${index}.monthlyCredits`,
            minRows: 0,
            display,
            watch,
          }}
        />
        <OneTimeCredits
          {...{
            name: `scenarios.${index}.oneTimeCredits`,
            minRows: 0,
            display,
            watch,
          }}
        />
      </div>
    </div>
  )
}

export function FieldArray({
  appendLabel = 'Add Row',
  children,
  defaultAppendValue = {},
  deleteLabel = 'Delete',
  display,
  minRows = 1,
  name,
  render,
  resetLabel = 'Reset',
}) {
  children = render || children

  const { fields, append, remove } = useFieldArray({ name })

  return (
    <div
      className={`flex flex-col items-stretch gap-2 sm:items-end ${
        display === 'compact' ? '' : 'sm:gap-4'
      }`}
    >
      <ul className={`flex w-full flex-col gap-4 sm:gap-2`}>
        {fields.map((field, index) => (
          <li
            key={field.id}
            className="group/label flex flex-wrap gap-2 sm:items-end"
          >
            <div className="flex w-full flex-grow flex-wrap gap-2 xs:w-auto">
              {children({ field, index })}
            </div>
            <button
              type="button"
              className="ml-auto mt-0 flex-grow rounded-lg border-4 border-double border-black p-2 xs:mt-6 xs:flex-shrink xs:flex-grow-0 sm:mt-0"
              onClick={(e) => {
                e.preventDefault()
                remove(index)
                if (minRows > 0 && fields.length <= minRows) {
                  append(defaultAppendValue)
                }
              }}
            >
              <span className="flex items-center justify-evenly">
                <span className="flex items-center gap-2 text-xs uppercase ">
                  {fields.length === minRows ? (
                    <>
                      <span className="xs:hidden">{resetLabel}</span>
                      <ArrowCounterClockwise
                        className="h-4 w-auto"
                        aria-hidden
                      />
                    </>
                  ) : (
                    <>
                      <span className="xs:hidden">{deleteLabel}</span>
                      <Trash className="h-4 w-auto" aria-hidden />
                    </>
                  )}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <Button
        onClick={(e) => {
          e.preventDefault()
          append({ ...defaultAppendValue })
        }}
      >
        <span className="flex items-center justify-center gap-1 text-xs uppercase tracking-wide">
          {appendLabel}
          <Plus className="h-4 w-auto" />
        </span>
      </Button>
    </div>
  )
}

export function ScenarioArray({
  appendLabel = 'Add Row',
  children,
  defaultAppendValue = {},
  deleteLabel = 'Delete',
  display,
  minRows = 1,
  name,
  render,
  resetLabel = 'Reset',
}) {
  children = render || children

  const { fields, append, remove } = useFieldArray({ name })

  React.useEffect(() => {
    if (fields?.length < minRows) {
      append({ ...defaultAppendValue, name: '' })
    }
  }, [defaultAppendValue, fields, append, minRows])

  function handleRemove(index) {
    remove(index)
    if (minRows > 0 && fields.length <= minRows) {
      append({ ...defaultAppendValue })
    }
  }

  return (
    <div
      className={`flex flex-col items-stretch gap-2 ${
        display === 'compact' ? '' : 'sm:gap-4'
      }`}
    >
      <ul className={`flex w-full flex-col gap-4 sm:gap-16`}>
        {fields.map((item, index) => (
          <li key={item.id || index} className="flex flex-col gap-2">
            <div className="flex w-full flex-grow flex-wrap gap-2 xs:w-auto">
              {children({ item, index })}
            </div>
            <button
              className="mt-0 flex-grow rounded-lg border-4 border-double border-black p-2 xs:mt-2 xs:flex-shrink xs:flex-grow-0 sm:mt-0"
              onClick={(e) => {
                e.preventDefault()
                handleRemove(index)
              }}
            >
              <span className="flex items-center justify-evenly">
                <span className="flex items-center gap-2 text-xs uppercase">
                  {fields.length === minRows ? (
                    <>
                      <span>{resetLabel}</span>
                      <ArrowCounterClockwise
                        className="h-4 w-auto"
                        aria-hidden
                      />
                    </>
                  ) : (
                    <>
                      {deleteLabel}
                      <Trash className="h-4 w-auto" aria-hidden />
                    </>
                  )}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          append({ ...defaultAppendValue })
        }}
      >
        <span className="flex items-center justify-center gap-1 text-xs uppercase tracking-wide">
          {appendLabel}
          <Plus className="h-4 w-auto" />
        </span>
      </Button>
    </div>
  )
}

function NextLabel() {
  return (
    <span className="flex items-center justify-center gap-2 rounded-lg border-4 border-double border-black px-4 py-2 uppercase">
      Next
      <ArrowFatRight className="h-4 w-auto" />
    </span>
  )
}

function BuildRunwayLabel() {
  return (
    <span className="flex items-center justify-center gap-2 rounded-lg border-4 border-double border-black px-4 py-2 uppercase">
      <AirplaneTakeoff className="h-4 w-auto sm:hidden" />
      Build Runway
      <AirplaneTakeoff className="hidden h-4 w-auto sm:inline" />
    </span>
  )
}

function BuildScenarioLabel({ formMethods }) {
  const { getValues } = formMethods

  const label =
    getValues('scenarios')?.length > 1
      ? 'Calculate Scenarios'
      : 'Calculate Scenario'

  return (
    <span className="flex items-center justify-center gap-2 rounded-lg border-4 border-double border-black px-4 py-2 uppercase">
      <ProjectorScreenChart className="h-4 w-auto sm:hidden" />
      {label}
      <ProjectorScreenChart className="hidden h-4 w-auto sm:inline" />
    </span>
  )
}

function Header({ children, display }) {
  const className = display === 'compact' ? 'text-xl' : 'text-center text-2xl'

  return <h2 className={className}>{children}</h2>
}

function Description({ children }) {
  return <p className="text-md text-center">{children}</p>
}

function Row({ children }) {
  return (
    <div className="flex flex-grow flex-col flex-wrap gap-2 sm:flex-row">
      {children}
    </div>
  )
}

function TextFieldSet({ label = 'Name', name, validation }) {
  return (
    <div className="flex flex-grow flex-col flex-wrap gap-2">
      <Label
        name={name}
        className="text-xs uppercase group-first-of-type/label:inline sm:hidden sm:text-sm"
      >
        {label}
      </Label>
      <FieldError name={name} className="font-semibold text-red-700" />
      <TextField
        name={name}
        validation={validation}
        className="rounded-lg border border-black p-2"
      />
    </div>
  )
}

function CurrencyFieldSet({ label = 'Amount', min = 0, name }) {
  return (
    <div className="flex flex-grow flex-col flex-wrap gap-2">
      <Label
        name={name}
        className="text-xs uppercase group-first-of-type/label:inline sm:hidden sm:text-sm"
      >
        {label}
      </Label>
      <div className="relative flex">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-gray-500">$</span>
        </div>
        <NumberField
          name={name}
          min={min}
          className="flex-grow rounded-lg border border-black p-2 pl-6"
          errorClassName="border-red-700"
        />
      </div>
    </div>
  )
}

function DateFieldSet({ label = 'Date', max, min, name, validation }) {
  return (
    <div className="flex flex-grow flex-col flex-wrap gap-2">
      <Label
        name={name}
        className="text-xs uppercase group-first-of-type/label:inline sm:hidden sm:text-sm"
      >
        <span className="flex justify-between">
          {label}
          <FieldError name={name} className="font-semibold text-red-700" />
        </span>
      </Label>
      <DateField
        name={name}
        min={min}
        max={max}
        validation={validation}
        className="w-full flex-grow rounded-lg border border-black p-1.5"
        errorClassName="flex-grow rounded-lg border border-red-700 p-1.5"
      />
    </div>
  )
}

function initDateRange(dateRange) {
  let { start, end } = dateRange || {}

  // default start next month
  const defaultStart = new Date()
  defaultStart.setMonth(defaultStart.getMonth() + 1)

  const defaultEnd = new Date()
  defaultEnd.setMonth(defaultStart.getMonth() + RUNWAY_MONTHS_MAX)

  start =
    start ||
    [
      defaultStart.getFullYear(),
      String(defaultStart.getMonth()).padStart(2, '0'),
      String(defaultStart.getDate()).padStart(2, '0'),
    ].join('-')
  end =
    end ||
    [
      defaultEnd.getFullYear(),
      String(defaultEnd.getMonth()).padStart(2, '0'),
      String(defaultEnd.getDate()).padStart(2, '0'),
    ].join('-')

  return { start, end }
}
