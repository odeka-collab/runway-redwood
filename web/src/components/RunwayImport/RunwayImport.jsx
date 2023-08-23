import { CopySimple, UploadSimple } from '@phosphor-icons/react'

import {
  FieldError,
  Form,
  Label,
  Submit,
  TextAreaField,
} from '@redwoodjs/forms'

import Button from 'src/components/Button/Button'
import useModal from 'src/hooks/UseModal'
import useRunway from 'src/hooks/UseRunway'

const COPIED_MESSAGE_TIMEOUT_MSEC = 5000

const RunwayImport = () => {
  const [state, setState] = React.useState({
    copyStatus: null,
  })

  const { toggle } = useModal()
  const { data, update } = useRunway()

  // Hide the message after some delay
  React.useEffect(() => {
    if (state?.copyStatus) {
      const id = setInterval(() => {
        setState({ ...state, copyStatus: null })
      }, COPIED_MESSAGE_TIMEOUT_MSEC)

      return () => {
        clearInterval(id)
      }
    }
  }, [state])

  async function onSubmit({ data }) {
    await update(data)
    toggle()
  }

  function onCancel() {
    toggle()
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      setState({ ...state, copyStatus: 'Copied to clipboard' })
    } catch (error) {
      console.error('Error copying to clipboard')
      setState({ ...state, copyStatus: 'Error copying' })
    }
  }

  return (
    <div className="absolute left-0 top-0 h-full w-full bg-white">
      <Form
        onSubmit={onSubmit}
        className="flex flex-col gap-4"
        config={{
          defaultValues: { data: JSON.stringify(data, null, 2) },
        }}
      >
        <h2 className="flex items-center gap-2 text-2xl">Save / Load</h2>
        <Label name="data" className="text-sm uppercase">
          Runway data
        </Label>
        <TextAreaField
          name="data"
          validation={{
            required: 'Please enter valid JSON',
            valueAsJSON: true,
          }}
          className="h-96 rounded border border-black bg-stone-200 p-2"
        />
        <FieldError name="data" />
        <div className="flex justify-between gap-2">
          <Button
            onClick={(e) => {
              e.preventDefault()
              onCancel()
            }}
          >
            Cancel
          </Button>
          <div className="flex gap-2">
            {state?.copyStatus && <span className="">{state.copyStatus}</span>}
            <Button
              onClick={(e) => {
                e.preventDefault()
                onCopy()
              }}
            >
              <span className="flex items-center gap-2">
                <CopySimple className="h-4 w-auto" />
                Copy
              </span>
            </Button>
            <Submit className="flex items-center gap-2 rounded-lg border-4 border-double border-black px-4 py-2 uppercase">
              Load
              <UploadSimple className="h-4 w-auto" />
            </Submit>
          </div>
        </div>
      </Form>
    </div>
  )
}

export default RunwayImport
