import {
  AirplaneTakeoff,
  ArrowCounterClockwise,
  ArrowFatLeft,
  FloppyDiskBack,
  Plus,
  Trash,
} from '@phosphor-icons/react'

import {
  DateField,
  FieldError,
  Form,
  Label,
  NumberField,
  Submit,
  TextField,
  useFieldArray,
  useForm,
} from '@redwoodjs/forms'

import Button from 'src/components/Button/Button'
import { DEFAULT_VALUE } from 'src/providers/RunwayProvider'

const FUNDS_DEFAULT_VALUE = DEFAULT_VALUE.data.funds[0]
const MONTHLY_CREDITS_DEFAULT_VALUE = DEFAULT_VALUE.data.monthlyCredits[0]
const MONTHLY_DEBITS_DEFAULT_VALUE = DEFAULT_VALUE.data.monthlyDebits[0]
const ONE_TIME_CREDITS_DEFAULT_VALUE = DEFAULT_VALUE.data.oneTimeCredits[0]
const ONE_TIME_DEBITS_DEFAULT_VALUE = DEFAULT_VALUE.data.oneTimeDebits[0]

const RunwayForm = ({
  children,
  render,
  defaultValues,
  display,
  onSubmit,
  onBack,
}) => {
  children = render || children || AllFields

  const formMethods = useForm({
    defaultValues: { ...(defaultValues ? defaultValues : DEFAULT_VALUE.data) },
  })

  function handleSave(e) {
    e.preventDefault()
    onSubmit(_parseFormValues(formMethods.getValues()), { save: true })
  }

  function handleSubmit(formValues) {
    onSubmit(_parseFormValues(formValues))
  }

  /**
   * Apply adjustments to handle form data clean-up & idiosyncracies
   * @param {*} formValues
   * @returns parsed form values
   */
  function _parseFormValues(formValues) {
    return {
      funds: _cleanUpDefaults(FUNDS_DEFAULT_VALUE, formValues.funds),
      monthlyDebits: _cleanUpDefaults(
        MONTHLY_DEBITS_DEFAULT_VALUE,
        formValues.monthlyDebits
      ),
      monthlyCredits: _cleanUpDefaults(
        MONTHLY_CREDITS_DEFAULT_VALUE,
        formValues.monthlyCredits
      ),
      oneTimeCredits: _cleanUpDefaults(
        ONE_TIME_CREDITS_DEFAULT_VALUE,
        // Convert dates to YYYY-MM-DD for <DateField> required format
        formValues.oneTimeCredits?.map(_normalizeDate)
      ),
      oneTimeDebits: _cleanUpDefaults(
        ONE_TIME_DEBITS_DEFAULT_VALUE,
        formValues.oneTimeDebits?.map(_normalizeDate)
      ),
    }
  }

  function _cleanUpDefaults(defaultValues, row) {
    // Keep edited rows
    row = row?.filter(_dirty(defaultValues))

    // Maintain at least 1 pristine row
    if (!row?.length) {
      return [defaultValues]
    }

    return row
  }

  function _dirty(defaultValues) {
    // -eslint-disable-next-line no-unused-vars
    return (values) => JSON.stringify(values) !== JSON.stringify(defaultValues)
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
  function _normalizeDate({ date, ...rest }) {
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
      {children({ ...formMethods, display })}
      <div
        className={`flex flex-col-reverse gap-2 border-t-4 border-double border-black pt-4 sm:flex-row sm:justify-between ${
          display === 'compact' ? 'sm:pt-2' : 'sm:pt-8'
        }`}
      >
        {onBack && (
          <button
            className="flex items-center justify-center gap-2 rounded-lg border-4 border-double border-black px-4 py-2 uppercase"
            onClick={(e) => {
              e.preventDefault()
              onBack()
            }}
          >
            <ArrowFatLeft className="h-4 w-auto" />
            Back
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
          <Submit className="flex items-center justify-center gap-2 rounded-lg border-4 border-double border-black px-4 py-2 uppercase">
            Build Runway
            <AirplaneTakeoff className="h-4 w-auto" />
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

export function Funds({ headerText = 'Current Funds', display }) {
  return (
    <>
      {headerText && <Header display={display}>{headerText}</Header>}
      <FieldArray
        name="funds"
        appendLabel="Add funds"
        defaultAppendValue={{ ...FUNDS_DEFAULT_VALUE }}
        display={display}
        render={({ index }) => (
          <Row>
            <TextFieldSet name={`funds.${index}.name`} />
            <CurrencyFieldSet name={`funds.${index}.amount`} />
          </Row>
        )}
      />
    </>
  )
}

export function MonthlyDebits({ headerText = 'Monthly expenses', display }) {
  return (
    <>
      {headerText && <Header display={display}>{headerText}</Header>}
      <FieldArray
        name="monthlyDebits"
        appendLabel="Add expense"
        defaultAppendValue={{ ...MONTHLY_DEBITS_DEFAULT_VALUE }}
        display={display}
        render={({ index }) => (
          <Row>
            <TextFieldSet name={`monthlyDebits.${index}.name`} />
            <CurrencyFieldSet name={`monthlyDebits.${index}.amount`} />
          </Row>
        )}
      />
    </>
  )
}

export function MonthlyCredits({ headerText = 'Monthly income', display }) {
  return (
    <>
      {headerText && <Header display={display}>{headerText}</Header>}
      <FieldArray
        name="monthlyCredits"
        appendLabel="Add income"
        defaultAppendValue={{ ...MONTHLY_CREDITS_DEFAULT_VALUE }}
        display={display}
        render={({ index }) => (
          <Row>
            <TextFieldSet name={`monthlyCredits.${index}.name`} />
            <CurrencyFieldSet name={`monthlyCredits.${index}.amount`} />
          </Row>
        )}
      />
    </>
  )
}

export function OneTimeCredits({
  headerText = 'Other income',
  dateRange,
  display,
  watch,
}) {
  const { start, end } = initDateRange(dateRange)

  return (
    <>
      {headerText && <Header display={display}>{headerText}</Header>}
      <FieldArray
        name="oneTimeCredits"
        appendLabel="Add income"
        defaultAppendValue={{ ...ONE_TIME_CREDITS_DEFAULT_VALUE }}
        display={display}
        render={({ index }) => (
          <Row>
            <TextFieldSet name={`oneTimeCredits.${index}.name`} />
            <CurrencyFieldSet name={`oneTimeCredits.${index}.amount`} />
            <DateFieldSet
              name={`oneTimeCredits.${index}.date`}
              min={start}
              max={end}
              validation={{
                validate: {
                  requiredIfAmountFieldPositive(value) {
                    return watch(`oneTimeCredits.${index}.amount`) > 0 &&
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
  dateRange,
  display,
  watch,
}) {
  const { start, end } = initDateRange(dateRange)

  return (
    <>
      {headerText && <Header display={display}>{headerText}</Header>}
      <FieldArray
        name="oneTimeDebits"
        appendLabel="Add expense"
        defaultAppendValue={{ ...ONE_TIME_DEBITS_DEFAULT_VALUE }}
        display={display}
        render={({ index }) => (
          <Row>
            <TextFieldSet name={`oneTimeDebits.${index}.name`} />
            <CurrencyFieldSet name={`oneTimeDebits.${index}.amount`} />
            <DateFieldSet
              name={`oneTimeDebits.${index}.date`}
              min={start}
              max={end}
              validation={{
                validate: {
                  requiredIfAmountFieldPositive(value) {
                    return watch(`oneTimeDebits.${index}.amount`) > 0 &&
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

export function FieldArray({
  children,
  render,
  name,
  display,
  appendLabel = 'Add Row',
  defaultAppendValue = {},
}) {
  children = render || children

  const { fields, append, remove } = useFieldArray({ name })

  return (
    <div
      className={`flex flex-col items-stretch sm:items-end ${
        display === 'compact' ? 'gap-4' : 'gap-4 sm:gap-6'
      }`}
    >
      <ul className={`flex w-full flex-col gap-4 sm:gap-2`}>
        {fields.map((item, index) => (
          <li
            key={item.id || index}
            className="group/label flex flex-wrap gap-2 sm:items-end"
          >
            <div className="flex w-full flex-grow flex-wrap gap-2 xs:w-auto">
              {children({ item, index })}
            </div>
            <button
              type="button"
              className="ml-auto mt-0 flex-grow rounded-lg border-4 border-double border-black p-2 xs:mt-6 xs:flex-shrink xs:flex-grow-0 sm:mt-0"
              onClick={(e) => {
                e.preventDefault()
                remove(index)
                if (fields.length === 1) {
                  append({ ...defaultAppendValue })
                }
              }}
            >
              {fields.length === 1 ? (
                <span className="flex items-center justify-evenly">
                  <span className="flex items-center gap-2 text-xs uppercase ">
                    <ArrowCounterClockwise className="h-4 w-auto" aria-hidden />
                    <span className="xs:hidden">Reset</span>
                  </span>
                </span>
              ) : (
                <span className="flex items-center justify-evenly">
                  <span className="flex items-center gap-2 text-xs uppercase ">
                    <Trash className="h-4 w-auto" aria-hidden />
                    <span className="xs:hidden">Delete</span>
                  </span>
                </span>
              )}
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

function Row({ children }) {
  return (
    <div className="flex flex-grow flex-col flex-wrap gap-2 sm:flex-row">
      {children}
    </div>
  )
}

function TextFieldSet({ name, label = 'Name' }) {
  return (
    <div className="flex flex-grow flex-col flex-wrap gap-2">
      <Label
        name={name}
        className="text-xs uppercase group-first-of-type/label:inline sm:hidden sm:text-sm"
      >
        {label}
      </Label>
      <TextField name={name} className="rounded-lg border border-black p-2" />
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
