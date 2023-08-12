import {
  Controller,
  Form,
  Submit,
  useFieldArray,
  useForm,
} from '@redwoodjs/forms'

import { DEFAULT_VALUE } from 'src/providers/RunwayProvider'

const APPEND_FUNDS_DEFAULT_VALUE = DEFAULT_VALUE.data.funds[0]
const APPEND_MONTHLY_DEBITS_DEFAULT_VALUE = DEFAULT_VALUE.data.monthlyDebits[0]

const RunwayForm = ({ children, defaultValues, onSubmit }) => {
  children = children || AllFields
  const { control, handleSubmit } = useForm({
    defaultValues: { ...(defaultValues ? defaultValues : DEFAULT_VALUE.data) },
  })

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
      {children({ control })}
      <Submit>Build Runway</Submit>
    </Form>
  )
}

RunwayForm.AllFields = AllFields
RunwayForm.Funds = Funds
RunwayForm.MonthlyDebits = MonthlyDebits
RunwayForm.FieldArray = FieldArray
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
    </>
  )
}

export function Funds({ control, headerText = 'How much cash do you have?' }) {
  return (
    <>
      <h1>{headerText}</h1>
      <FieldArray
        name="funds"
        control={control}
        defaultAppendValue={{ ...APPEND_FUNDS_DEFAULT_VALUE }}
      >
        {({ item, index }) => (
          <>
            <Controller
              control={control}
              name={`funds.${index}.name`}
              rules={{ required: 'Required' }}
              defaultValue={item.name}
              render={({ field, fieldState }) => (
                <label className="flex flex-col gap-2">
                  Name
                  <input type="text" {...field} />
                  {fieldState?.error?.message && (
                    <span>{fieldState.error.message}</span>
                  )}
                </label>
              )}
            />
            <Controller
              control={control}
              name={`funds.${index}.amount`}
              rules={{
                required: 'Required',
                min: {
                  value: 0,
                  message: 'Invalid',
                },
              }}
              defaultValue={item.amount}
              render={({ field, fieldState }) => (
                <label className="flex flex-col gap-2">
                  Amount
                  <input type="number" min={0} {...field} />
                  {fieldState?.error?.message && (
                    <span>{fieldState.error.message}</span>
                  )}
                </label>
              )}
            />
          </>
        )}
      </FieldArray>
    </>
  )
}

export function MonthlyDebits({
  control,
  headerText = 'How much are you spending each month?',
}) {
  return (
    <>
      <h1>{headerText}</h1>
      <FieldArray
        name="monthlyDebits"
        control={control}
        defaultAppendValue={{ ...APPEND_MONTHLY_DEBITS_DEFAULT_VALUE }}
      >
        {({ item, index }) => (
          <>
            <Controller
              control={control}
              name={`monthlyDebits.${index}.color`}
              rules={{ required: 'Required' }}
              defaultValue={item.color}
              render={({ field }) => (
                <label className="flex flex-col gap-2">
                  <input type="color" {...field} />
                </label>
              )}
            />
            <Controller
              control={control}
              name={`monthlyDebits.${index}.name`}
              rules={{ required: 'Required' }}
              defaultValue={item.name}
              render={({ field, fieldState }) => (
                <label className="flex flex-col gap-2">
                  Name
                  <input type="text" {...field} />
                  {fieldState?.error?.message && (
                    <span>{fieldState.error.message}</span>
                  )}
                </label>
              )}
            />
            <Controller
              control={control}
              name={`monthlyDebits.${index}.amount`}
              rules={{
                required: 'Required',
                min: {
                  value: 0,
                  message: 'Invalid',
                },
              }}
              defaultValue={item.amount}
              render={({ field, fieldState }) => (
                <label className="flex flex-col gap-2">
                  Amount
                  <input type="number" min={0} {...field} />
                  {fieldState?.error?.message && (
                    <span>{fieldState.error.message}</span>
                  )}
                </label>
              )}
            />
          </>
        )}
      </FieldArray>
    </>
  )
}

export function FieldArray({
  children,
  name,
  control,
  defaultAppendValue = {},
}) {
  const { fields, append, remove } = useFieldArray({
    name,
    control,
  })

  return (
    <>
      <ul className="flex flex-col gap-2">
        {fields.map((item, index) => (
          <li key={item.id} className="flex gap-2">
            {children({ item, index })}
            {(index > 0 || (index === 0 && fields.length > 1)) && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  remove(index)
                }}
              >
                delete row
              </button>
            )}
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
