import {
  ColorField,
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
              ?.filter(_dirty(ONE_TIME_CREDITS_DEFAULT_VALUE))
              // Convert dates to YYYY-MM-DD for <DateField> required format
              ?.map(_normalizeDate)
          : formValues.oneTimeCredits?.map(_normalizeDate),
      oneTimeDebits:
        formValues.oneTimeDebits?.length > 1
          ? formValues.oneTimeDebits
              ?.filter(_dirty(ONE_TIME_DEBITS_DEFAULT_VALUE))
              ?.map(_normalizeDate)
          : formValues.oneTimeDebits?.map(_normalizeDate),
    }
  }

  function _dirty(defaultValues) {
    // -eslint-disable-next-line no-unused-vars
    return (values) => JSON.stringify(values) !== JSON.stringify(defaultValues)
  }

  /**
   * Normalizes the date value returned by <DateField>.
   * Converts date values to "YYYY-MM-DD" or null for the Unix epoch.
   * @param {string} options.date
   * @returns
   */
  function _normalizeDate({ date, ...rest }) {
    return {
      ...rest,
      date:
        !(date instanceof Date) ||
        date.toISOString() === '1970-01-01T00:00:00.000Z'
          ? null
          : date?.toISOString()?.replace(/T.*$/, ''),
    }
  }

  return (
    <Form
      formMethods={formMethods}
      onSubmit={handleSubmit}
      className="flex flex-col gap-2"
    >
      {children({ ...formMethods })}
      <div className="flex gap-2">
        {onBack && (
          <button
            onClick={(e) => {
              e.preventDefault()
              onBack()
            }}
          >
            Back
          </button>
        )}
        <Submit>Build Runway</Submit>
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
      {headerText && <h2>{headerText}</h2>}
      <FieldArray
        name="funds"
        defaultAppendValue={{ ...FUNDS_DEFAULT_VALUE }}
        render={({ index }) => (
          <>
            <Label name={`funds.${index}.name`} className="flex flex-col gap-2">
              Name
              <TextField name={`funds.${index}.name`} />
              <FieldError name={`funds.${index}.name`} />
            </Label>
            <Label
              name={`funds.${index}.amount`}
              className="flex flex-col gap-2"
            >
              Amount
              <NumberField name={`funds.${index}.amount`} min={0} />
              <FieldError name={`funds.${index}.amount`} />
            </Label>
          </>
        )}
      />
    </>
  )
}

export function MonthlyDebits({ headerText = 'Monthly expenses' }) {
  return (
    <>
      {headerText && <h2>{headerText}</h2>}
      <FieldArray
        name="monthlyDebits"
        defaultAppendValue={{ ...MONTHLY_DEBITS_DEFAULT_VALUE }}
        render={({ index }) => (
          <>
            <ColorField
              name={`monthlyDebits.${index}.color`}
              rules={{ required: 'Required' }}
            />
            <Label
              name={`monthlyDebits.${index}.name`}
              className="flex flex-col gap-2"
            >
              Name
              <TextField name={`monthlyDebits.${index}.name`} />
              <FieldError name={`monthlyDebits.${index}.name`} />
            </Label>
            <Label
              name={`monthlyDebits.${index}.amount`}
              className="flex flex-col gap-2"
            >
              Amount
              <NumberField name={`monthlyDebits.${index}.amount`} min={0} />
              <FieldError name={`monthlyDebits.${index}.amount`} />
            </Label>
          </>
        )}
      />
    </>
  )
}

export function MonthlyCredits({ headerText = 'Monthly income' }) {
  return (
    <>
      {headerText && <h2>{headerText}</h2>}
      <FieldArray
        name="monthlyCredits"
        defaultAppendValue={{ ...MONTHLY_CREDITS_DEFAULT_VALUE }}
        render={({ index }) => (
          <>
            <ColorField
              name={`monthlyCredits.${index}.color`}
              rules={{ required: 'Required' }}
            />
            <Label
              name={`monthlyCredits.${index}.name`}
              className="flex flex-col gap-2"
            >
              Name
              <TextField name={`monthlyCredits.${index}.name`} />
              <FieldError name={`monthlyCredits.${index}.name`} />
            </Label>
            <Label
              name={`monthlyCredits.${index}.amount`}
              className="flex flex-col gap-2"
            >
              Amount
              <NumberField name={`monthlyCredits.${index}.amount`} min={0} />
              <FieldError name={`monthlyCredits.${index}.amount`} />
            </Label>
          </>
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
      {headerText && <h2>{headerText}</h2>}
      <FieldArray
        name="oneTimeCredits"
        defaultAppendValue={{ ...ONE_TIME_CREDITS_DEFAULT_VALUE }}
        render={({ index }) => (
          <>
            <ColorField name={`oneTimeCredits.${index}.color`} />
            <Label
              name={`oneTimeCredits.${index}.name`}
              className="flex flex-col gap-2"
            >
              Name
              <TextField name={`oneTimeCredits.${index}.name`} />
              <FieldError name={`oneTimeCredits.${index}.name`} />
            </Label>
            <Label
              name={`oneTimeCredits.${index}.amount`}
              className="flex flex-col gap-2"
            >
              Amount
              <NumberField name={`oneTimeCredits.${index}.amount`} min={0} />
              <FieldError name={`oneTimeCredits.${index}.amount`} />
            </Label>
            <Label
              name={`oneTimeCredits.${index}.date`}
              className="flex flex-col gap-2"
            >
              Date
              <DateField
                name={`oneTimeCredits.${index}.date`}
                min={start}
                max={end}
                validation={{
                  validate: {
                    requiredIfAmountFieldPositive(value) {
                      return watch(`oneTimeCredits.${index}.amount`) > 0 &&
                        // given a null value, returns unix epoch
                        value?.toISOString() === '1970-01-01T00:00:00.000Z'
                        ? 'Required'
                        : undefined
                    },
                  },
                }}
              />
              <FieldError name={`oneTimeCredits.${index}.date`} />
            </Label>
          </>
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
      {headerText && <h2>{headerText}</h2>}
      <FieldArray
        name="oneTimeDebits"
        defaultAppendValue={{ ...ONE_TIME_DEBITS_DEFAULT_VALUE }}
        render={({ index }) => (
          <>
            <ColorField name={`oneTimeDebits.${index}.color`} />
            <Label
              name={`oneTimeDebits.${index}.name`}
              className="flex flex-col gap-2"
            >
              Name
              <TextField name={`oneTimeDebits.${index}.name`} />
              <FieldError name={`oneTimeDebits.${index}.name`} />
            </Label>
            <Label
              name={`oneTimeDebits.${index}.amount`}
              className="flex flex-col gap-2"
            >
              Amount
              <NumberField name={`oneTimeDebits.${index}.amount`} min={0} />
              <FieldError name={`oneTimeDebits.${index}.amount`} />
            </Label>
            <Label
              name={`oneTimeDebits.${index}.date`}
              className="flex flex-col gap-2"
            >
              Date
              <DateField
                name={`oneTimeDebits.${index}.date`}
                min={start}
                max={end}
                validation={{
                  validate: {
                    requiredIfAmountFieldPositive(value) {
                      return watch(`oneTimeDebits.${index}.amount`) > 0 &&
                        // given a null value, returns unix epoch
                        value?.toISOString() === '1970-01-01T00:00:00.000Z'
                        ? 'Required'
                        : undefined
                    },
                  },
                }}
              />
              <FieldError name={`oneTimeDebits.${index}.date`} />
            </Label>
          </>
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
    <>
      <ul className="flex flex-col gap-2">
        {fields.map((item, index) => (
          <li key={item.id} className="flex gap-2">
            {children({ item, index })}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                remove(index)
                if (fields.length === 1) {
                  append({ ...defaultAppendValue })
                }
              }}
            >
              {fields.length === 1 ? 'Reset' : 'Delete'}
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          append({ ...defaultAppendValue })
        }}
      >
        add row
      </button>
    </>
  )
}
