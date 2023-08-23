import {
  AirplaneTakeoff,
  ArrowCounterClockwise,
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

const RunwayForm = ({ children, render, defaultValues, onSubmit, onBack }) => {
  children = render || children || AllFields

  const formMethods = useForm({
    defaultValues: { ...(defaultValues ? defaultValues : DEFAULT_VALUE.data) },
  })

  const handleSubmit = (formValues) => {
    onSubmit(_parseFormValues(formValues))
  }

  /**
   * Apply adjustments to handle form data clean-up & idiosyncracies
   * @param {*} formValues
   * @returns parsed form values
   */
  function _parseFormValues(formValues) {
    return {
      funds:
        // Maintain at least 1 row for each <ArrayField>
        formValues.funds?.length > 1
          ? // Remove any pristine rows
            formValues.funds?.filter(_dirty(FUNDS_DEFAULT_VALUE))
          : formValues.funds,
      monthlyDebits:
        formValues.monthlyDebits?.length > 1
          ? formValues.monthlyDebits?.filter(
              _dirty(MONTHLY_DEBITS_DEFAULT_VALUE)
            )
          : formValues.monthlyDebits,
      monthlyCredits:
        formValues.monthlyCredits?.length > 1
          ? formValues.monthlyCredits?.filter(
              _dirty(MONTHLY_CREDITS_DEFAULT_VALUE)
            )
          : formValues.monthlyCredits,
      oneTimeCredits:
        formValues.oneTimeCredits?.length > 1
          ? formValues.oneTimeCredits
              // Convert dates to YYYY-MM-DD for <DateField> required format
              ?.map(_normalizeDate)
              ?.filter(_dirty(ONE_TIME_CREDITS_DEFAULT_VALUE))
          : formValues.oneTimeCredits?.map(_normalizeDate),
      oneTimeDebits:
        formValues.oneTimeDebits?.length > 1
          ? formValues.oneTimeDebits
              ?.map(_normalizeDate)
              ?.filter(_dirty(ONE_TIME_DEBITS_DEFAULT_VALUE))
          : formValues.oneTimeDebits?.map(_normalizeDate),
    }
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
   * @param {string} options.date
   * @returns
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
      className="flex flex-col gap-8"
    >
      {children({ ...formMethods })}
      <div className="grid grid-flow-col space-x-2">
        {onBack && (
          <button
            className="place-self-start rounded-lg border-4 border-double border-black px-4 py-2 uppercase"
            onClick={(e) => {
              e.preventDefault()
              onBack()
            }}
          >
            Back
          </button>
        )}
        <Submit className="flex items-center gap-2 place-self-end rounded-lg border-4 border-double border-black px-4 py-2 uppercase">
          Build Runway
          <AirplaneTakeoff className="h-4 w-auto" />
        </Submit>
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

export function Funds({ headerText = 'Current Funds' }) {
  return (
    <>
      {headerText && <Header>{headerText}</Header>}
      <FieldArray
        name="funds"
        defaultAppendValue={{ ...FUNDS_DEFAULT_VALUE }}
        render={({ index }) => (
          <Row>
            <NameFieldSet name={`funds.${index}.name`} />
            <AmountFieldSet name={`funds.${index}.amount`} />
          </Row>
        )}
      />
    </>
  )
}

export function MonthlyDebits({ headerText = 'Monthly expenses' }) {
  return (
    <>
      {headerText && <Header>{headerText}</Header>}
      <FieldArray
        name="monthlyDebits"
        defaultAppendValue={{ ...MONTHLY_DEBITS_DEFAULT_VALUE }}
        render={({ index }) => (
          <Row>
            <NameFieldSet name={`monthlyDebits.${index}.name`} />
            <AmountFieldSet name={`monthlyDebits.${index}.amount`} />
          </Row>
        )}
      />
    </>
  )
}

export function MonthlyCredits({ headerText = 'Monthly income' }) {
  return (
    <>
      {headerText && <Header>{headerText}</Header>}
      <FieldArray
        name="monthlyCredits"
        defaultAppendValue={{ ...MONTHLY_CREDITS_DEFAULT_VALUE }}
        render={({ index }) => (
          <Row>
            <NameFieldSet name={`monthlyCredits.${index}.name`} />
            <AmountFieldSet name={`monthlyCredits.${index}.amount`} />
          </Row>
        )}
      />
    </>
  )
}

export function OneTimeCredits({
  headerText = 'Other income',
  date: { start, end } = {},
  watch,
}) {
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

  return (
    <>
      {headerText && <Header>{headerText}</Header>}
      <FieldArray
        name="oneTimeCredits"
        defaultAppendValue={{ ...ONE_TIME_CREDITS_DEFAULT_VALUE }}
        render={({ index }) => (
          <Row>
            <NameFieldSet name={`oneTimeCredits.${index}.name`} />
            <AmountFieldSet name={`oneTimeCredits.${index}.amount`} />
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
  date: { start, end } = {},
  watch,
}) {
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

  return (
    <>
      {headerText && <Header>{headerText}</Header>}
      <FieldArray
        name="oneTimeDebits"
        defaultAppendValue={{ ...ONE_TIME_DEBITS_DEFAULT_VALUE }}
        render={({ index }) => (
          <Row>
            <NameFieldSet name={`oneTimeDebits.${index}.name`} />
            <AmountFieldSet name={`oneTimeDebits.${index}.amount`} />
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
  defaultAppendValue = {},
}) {
  children = render || children

  const { fields, append, remove } = useFieldArray({ name })

  return (
    <div className="flex flex-col items-center gap-10">
      <ul className="flex w-full flex-col gap-8">
        {fields.map((item, index) => (
          <li key={item.id || index} className="flex flex-wrap items-end gap-2">
            <div className="flex flex-grow flex-wrap gap-2">
              {children({ item, index })}
            </div>
            <button
              type="button"
              className="ml-auto flex-shrink rounded-lg border-4 border-double border-black p-2"
              onClick={(e) => {
                e.preventDefault()
                remove(index)
                if (fields.length === 1) {
                  append({ ...defaultAppendValue })
                }
              }}
            >
              {fields.length === 1 ? (
                <ArrowCounterClockwise
                  className="h-4 w-auto"
                  aria-label="reset row"
                />
              ) : (
                <Trash className="h-4 w-auto" aria-label="delete row" />
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
          Add Row
          <Plus className="h-4 w-auto" />
        </span>
      </Button>
    </div>
  )
}

function Header({ children }) {
  return <h2 className="p-8 text-center text-2xl">{children}</h2>
}

function Row({ children }) {
  return <div className="flex flex-grow flex-wrap gap-2">{children}</div>
}

function NameFieldSet({ name }) {
  return (
    <Label
      name={name}
      className="flex flex-grow flex-col flex-wrap gap-2 text-sm uppercase"
    >
      Name
      <TextField name={name} className="rounded-lg border border-black p-2" />
    </Label>
  )
}

function AmountFieldSet({ name }) {
  return (
    <Label
      name={name}
      className="flex flex-grow flex-col flex-wrap gap-2 text-sm uppercase"
    >
      <span className="flex justify-between">
        Amount
        <FieldError name={name} className="font-semibold text-red-700" />
      </span>
      <div className="relative flex">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-gray-500">$</span>
        </div>
        <NumberField
          name={name}
          min={0}
          className="flex-grow rounded-lg border border-black p-2 pl-6"
          errorClassName="border-red-700"
        />
      </div>
    </Label>
  )
}

function DateFieldSet({ name, min, max, validation }) {
  return (
    <Label
      name={name}
      className="flex flex-grow flex-col flex-wrap gap-2 text-sm uppercase"
    >
      <span className="flex justify-between">
        Date
        <FieldError name={name} className="font-semibold text-red-700" />
      </span>
      <DateField
        name={name}
        min={min}
        max={max}
        validation={validation}
        className="flex-grow rounded-lg border border-black p-1.5"
        errorClassName="flex-grow rounded-lg border border-red-700 p-1.5"
      />
    </Label>
  )
}
