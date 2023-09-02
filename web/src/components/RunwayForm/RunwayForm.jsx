import {
  AirplaneTakeoff,
  ArrowCounterClockwise,
  ArrowFatLeft,
  FloppyDiskBack,
  Plus,
  Question,
  Trash,
} from '@phosphor-icons/react'
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
import { DEFAULT_VALUE } from 'src/providers/RunwayProvider'

const FUNDS_DEFAULT_APPEND_VALUE = DEFAULT_VALUE.data.funds[0]
const MONTHLY_CREDITS_DEFAULT_APPEND_VALUE =
  DEFAULT_VALUE.data.monthlyCredits[0]
const MONTHLY_DEBITS_DEFAULT_APPEND_VALUE = DEFAULT_VALUE.data.monthlyDebits[0]
const ONE_TIME_CREDITS_DEFAULT_APPEND_VALUE =
  DEFAULT_VALUE.data.oneTimeCredits[0]
const ONE_TIME_DEBITS_DEFAULT_APPEND_VALUE = DEFAULT_VALUE.data.oneTimeDebits[0]

const RunwayForm = ({
  children,
  render,
  defaultValues,
  display,
  submitComponent: SubmitComponent,
  onSubmit,
  onBack,
  onClickScenarios,
}) => {
  children = render || children || AllFields

  const formMethods = useForm({ defaultValues })

  function handleBack(e) {
    e.preventDefault()
    formMethods.reset()
    onBack()
  }

  function handleSave(e) {
    e.preventDefault()
    onSubmit(sanitize(formMethods.getValues()), { save: true })
  }

  function handleSubmit(formValues) {
    onSubmit(sanitize(formValues))
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
      id: formValues.id || uuidv4(), // id used by visualizater
      ...(formValues.funds?.length > 0 && {
        funds: formValues.funds.reduce(
          reduceDefaultAppendValue({
            key: 'funds',
            defaultAppendValue: FUNDS_DEFAULT_APPEND_VALUE,
          }),
          []
        ),
      }),
      ...(formValues.monthlyDebits?.length > 0 && {
        monthlyDebits: formValues.monthlyDebits.reduce(
          reduceDefaultAppendValue({
            key: 'monthlyDebits',
            defaultAppendValue: MONTHLY_DEBITS_DEFAULT_APPEND_VALUE,
          }),
          []
        ),
      }),
      ...(formValues.monthlyCredits?.length > 0 && {
        monthlyCredits: formValues.monthlyCredits.reduce(
          reduceDefaultAppendValue({
            key: 'monthlyCredits',
            defaultAppendValue: MONTHLY_CREDITS_DEFAULT_APPEND_VALUE,
          }),
          []
        ),
      }),
      ...(formValues.oneTimeCredits?.length > 0 && {
        oneTimeCredits: formValues.oneTimeCredits.map(normalizeDate).reduce(
          reduceDefaultAppendValue({
            key: 'oneTimeCredits',
            defaultAppendValue: ONE_TIME_CREDITS_DEFAULT_APPEND_VALUE,
          }),
          []
        ),
      }),
      ...(formValues.oneTimeDebits?.length > 0 && {
        oneTimeDebits: formValues.oneTimeDebits.map(normalizeDate).reduce(
          reduceDefaultAppendValue({
            key: 'oneTimeDebits',
            defaultAppendValue: ONE_TIME_DEBITS_DEFAULT_APPEND_VALUE,
          }),
          []
        ),
      }),
      ...(formValues.scenarios?.length > 0 && {
        scenarios: formValues.scenarios
          .reduce(
            reduceDefaultAppendValue({
              key: 'scenarios',
              defaultAppendValue: {
                funds: formMethods.getValues('funds'),
                monthlyDebits: formMethods.getValues('monthlyDebits'),
                monthlyCredits: formMethods.getValues('monthlyCredits'),
                oneTimeCredits: formMethods.getValues('oneTimeCredits'),
                oneTimeDebits: formMethods.getValues('oneTimeDebits'),
              },
            }),
            []
          )
          .map((scenario, i) => ({
            ...scenario,
            id: scenario.id || uuidv4(), // id used by visualizater
            ...(scenario.funds?.length > 0 && {
              funds: scenario.funds.reduce(
                reduceDefaultAppendValue({
                  key: `scenarios.${i}.funds`,
                  defaultAppendValue: FUNDS_DEFAULT_APPEND_VALUE,
                }),
                []
              ),
            }),
            ...(scenario.monthlyDebits?.length > 0 && {
              monthlyDebits: scenario.monthlyDebits.reduce(
                reduceDefaultAppendValue({
                  key: `scenarios.${i}.monthlyDebits`,
                  defaultAppendValue: MONTHLY_DEBITS_DEFAULT_APPEND_VALUE,
                }),
                []
              ),
            }),
            ...(scenario.monthlyCredits?.length > 0 && {
              monthlyCredits: scenario.monthlyCredits.reduce(
                reduceDefaultAppendValue({
                  key: `scenarios.${i}.monthlyCredits`,
                  defaultAppendValue: MONTHLY_CREDITS_DEFAULT_APPEND_VALUE,
                }),
                []
              ),
            }),
            ...(scenario.oneTimeCredits?.length > 0 && {
              oneTimeCredits: scenario.oneTimeCredits.map(normalizeDate).reduce(
                reduceDefaultAppendValue({
                  key: `scenarios.${i}.oneTimeCredits`,
                  defaultAppendValue: ONE_TIME_CREDITS_DEFAULT_APPEND_VALUE,
                }),
                []
              ),
            }),
            ...(scenario.oneTimeDebits?.length > 0 && {
              oneTimeDebits: scenario.oneTimeDebits.map(normalizeDate).reduce(
                reduceDefaultAppendValue({
                  key: `scenarios.${i}.oneTimeDebits`,
                  defaultAppendValue: ONE_TIME_DEBITS_DEFAULT_APPEND_VALUE,
                }),
                []
              ),
            }),
          })),
      }),
    }
  }

  function reduceDefaultAppendValue({
    key,
    defaultAppendValue,
    minRows = true,
  }) {
    return (acc, row, i) => {
      // Keep rows with values
      if (isValued({ name: `${key}.${i}`, defaultAppendValue })) {
        acc = [...acc, row]
      }

      // Maintain at least 1 pristine row
      if (minRows && !acc.length) {
        acc = [defaultAppendValue]
      }

      return acc
    }
  }

  function isValued({ name, defaultAppendValue }) {
    const { id: _, ...formValues } = formMethods.getValues(name)
    return JSON.stringify(formValues) !== JSON.stringify(defaultAppendValue)
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
      onSubmit={handleSubmit}
      className={
        display === 'compact'
          ? 'flex flex-col gap-2'
          : 'flex flex-col gap-4 sm:gap-8'
      }
    >
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
            Back
          </button>
        )}
        {onClickScenarios && (
          <button
            className="flex items-center justify-center gap-2 rounded-lg border-4 border-double border-black px-4 py-2 uppercase"
            onClick={(e) => {
              e.preventDefault()
              onClickScenarios()
            }}
          >
            What if...
            <Question className="h-4 w-auto" />
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
              <SubmitComponent />
            ) : (
              <span className="flex items-center justify-center gap-2 rounded-lg border-4 border-double border-black px-4 py-2 uppercase">
                Build Runway
                <AirplaneTakeoff className="h-4 w-auto" />
              </span>
            )}
          </Submit>
        </div>
      </div>
    </Form>
  )
}

RunwayForm.AllFields = AllFields
RunwayForm.FieldArray = FieldArray
RunwayForm.Funds = Funds
RunwayForm.MonthlyCredits = MonthlyCredits
RunwayForm.MonthlyDebits = MonthlyDebits
RunwayForm.OneTimeCredits = OneTimeCredits
RunwayForm.OneTimeDebits = OneTimeDebits
RunwayForm.Scenarios = Scenarios
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

export function Funds({
  headerText = 'Current Funds',
  name = 'funds',
  description,
  minRows,
  display,
}) {
  return (
    <>
      {headerText && <Header display={display}>{headerText}</Header>}
      {description && <Description>{description}</Description>}
      <FieldArray
        name={name}
        appendLabel="Add funds"
        defaultAppendValue={{ ...FUNDS_DEFAULT_APPEND_VALUE }}
        display={display}
        minRows={minRows}
        render={({ index }) => (
          <Row>
            <TextFieldSet name={`${name}.${index}.name`} />
            <CurrencyFieldSet name={`${name}.${index}.amount`} />
          </Row>
        )}
      />
    </>
  )
}

export function MonthlyDebits({
  headerText = 'Monthly expenses',
  name = 'monthlyDebits',
  description,
  minRows,
  display,
}) {
  return (
    <>
      {headerText && <Header display={display}>{headerText}</Header>}
      {description && <Description>{description}</Description>}
      <FieldArray
        name={name}
        appendLabel="Add expense"
        defaultAppendValue={{ ...MONTHLY_DEBITS_DEFAULT_APPEND_VALUE }}
        display={display}
        minRows={minRows}
        render={({ index }) => (
          <Row>
            <TextFieldSet name={`${name}.${index}.name`} />
            <CurrencyFieldSet name={`${name}.${index}.amount`} />
          </Row>
        )}
      />
    </>
  )
}

export function MonthlyCredits({
  headerText = 'Monthly income',
  name = 'monthlyCredits',
  description,
  minRows,
  display,
}) {
  return (
    <>
      {headerText && <Header display={display}>{headerText}</Header>}
      {description && <Description>{description}</Description>}
      <FieldArray
        name={name}
        appendLabel="Add income"
        defaultAppendValue={{ ...MONTHLY_CREDITS_DEFAULT_APPEND_VALUE }}
        display={display}
        minRows={minRows}
        render={({ index }) => (
          <Row>
            <TextFieldSet name={`${name}.${index}.name`} />
            <CurrencyFieldSet name={`${name}.${index}.amount`} />
          </Row>
        )}
      />
    </>
  )
}

export function OneTimeCredits({
  headerText = 'Other income',
  name = 'oneTimeCredits',
  description,
  dateRange,
  minRows,
  display,
  watch,
}) {
  const { start, end } = initDateRange(dateRange)

  return (
    <>
      {headerText && <Header display={display}>{headerText}</Header>}
      {description && <Description>{description}</Description>}
      <FieldArray
        name={name}
        appendLabel="Add income"
        defaultAppendValue={{ ...ONE_TIME_CREDITS_DEFAULT_APPEND_VALUE }}
        display={display}
        minRows={minRows}
        render={({ index }) => (
          <Row>
            <TextFieldSet name={`${name}.${index}.name`} />
            <CurrencyFieldSet name={`${name}.${index}.amount`} />
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
          </Row>
        )}
      />
    </>
  )
}

export function OneTimeDebits({
  headerText = 'Other expenses',
  name = 'oneTimeDebits',
  description,
  dateRange,
  minRows,
  display,
  watch,
}) {
  const { start, end } = initDateRange(dateRange)

  return (
    <>
      {headerText && <Header display={display}>{headerText}</Header>}
      {description && <Description>{description}</Description>}
      <FieldArray
        name={name}
        appendLabel="Add expense"
        defaultAppendValue={{ ...ONE_TIME_DEBITS_DEFAULT_APPEND_VALUE }}
        display={display}
        minRows={minRows}
        render={({ index }) => (
          <Row>
            <TextFieldSet name={`${name}.${index}.name`} />
            <CurrencyFieldSet name={`${name}.${index}.amount`} />
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
          </Row>
        )}
      />
    </>
  )
}

export function Scenarios({
  headerText = 'Scenarios',
  description,
  display,
  watch,
  getValues,
}) {
  // eslint-disable-next-line no-unused-vars
  const { id, name, scenarios, ...defaultAppendValue } = getValues()

  return (
    <>
      {headerText && <Header>{headerText}</Header>}
      {description && <Description>{description}</Description>}
      <ScenarioArray
        name="scenarios"
        appendLabel="Add scenario"
        defaultAppendValue={defaultAppendValue}
        display={display}
        deleteLabel="Delete Scenario"
        resetLabel="Reset Scenario"
        render={({ index }) => <Scenario {...{ index, display, watch }} />}
      />
    </>
  )
}

function Scenario({ index, display, watch }) {
  return (
    <div className="flex flex-grow flex-col gap-2">
      <HiddenField name={`scenarios.${index}.id`} />
      <div className="flex items-end gap-4">
        <h3 className="text-xl font-semibold">What if&hellip;</h3>
        <TextFieldSet
          {...{
            name: `scenarios.${index}.name`,
            validation: { required: 'A scenario name is required' },
          }}
        />
      </div>
      <div>
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
  children,
  render,
  name,
  display,
  appendLabel = 'Add Row',
  deleteLabel = 'Delete',
  resetLabel = 'Reset',
  defaultAppendValue = {},
  minRows = 1,
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
                  append({ ...defaultAppendValue })
                }
              }}
            >
              <span className="flex items-center justify-evenly">
                <span className="flex items-center gap-2 text-xs uppercase ">
                  {fields.length === minRows ? (
                    <>
                      <ArrowCounterClockwise
                        className="h-4 w-auto"
                        aria-hidden
                      />
                      <span className="xs:hidden">{resetLabel}</span>
                    </>
                  ) : (
                    <>
                      <Trash className="h-4 w-auto" aria-hidden />
                      <span className="xs:hidden">{deleteLabel}</span>
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

export function ScenarioArray({
  children,
  render,
  name,
  display,
  appendLabel = 'Add Row',
  deleteLabel = 'Delete',
  resetLabel = 'Reset',
  defaultAppendValue = {},
  minRows = 1,
}) {
  children = render || children

  const { fields, append, remove } = useFieldArray({ name })

  React.useEffect(() => {
    if (!fields?.length) {
      append({ ...defaultAppendValue })
    }
  }, [defaultAppendValue, fields, append])

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
              type="button"
              className="mt-0 flex-grow rounded-lg border-4 border-double border-black p-2 xs:mt-6 xs:flex-shrink xs:flex-grow-0 sm:mt-0"
              onClick={(e) => {
                e.preventDefault()
                remove(index)
                if (minRows > 0 && fields.length <= minRows) {
                  append({ ...defaultAppendValue })
                }
              }}
            >
              <span className="flex items-center justify-evenly">
                <span className="flex items-center gap-2 text-xs uppercase ">
                  {fields.length === minRows ? (
                    <>
                      <ArrowCounterClockwise
                        className="h-4 w-auto"
                        aria-hidden
                      />
                      <span>{resetLabel}</span>
                    </>
                  ) : (
                    <>
                      <Trash className="h-4 w-auto" aria-hidden />
                      <span>{deleteLabel}</span>
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

function Header({ children, display }) {
  const className =
    display === 'compact' ? 'text-xl' : 'py-4 sm:py-8 text-center text-2xl'

  return <h2 className={className}>{children}</h2>
}

function Description({ children }) {
  return <p className="text-md">{children}</p>
}

function Row({ children }) {
  return (
    <div className="flex flex-grow flex-col flex-wrap gap-2 sm:flex-row">
      {children}
    </div>
  )
}

function TextFieldSet({ name, label = 'Name', validation }) {
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

function CurrencyFieldSet({ label = 'Amount', name, min = 0 }) {
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

function DateFieldSet({ label = 'Date', name, min, max, validation }) {
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
  const today = new Date()
  const nextYear = new Date()
  nextYear.setFullYear(today.getFullYear() + 1)
  start =
    start ||
    [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-')
  end =
    end ||
    [
      nextYear.getFullYear(),
      String(nextYear.getMonth() + 1).padStart(2, '0'),
      String(nextYear.getDate()).padStart(2, '0'),
    ].join('-')

  return { start, end }
}
