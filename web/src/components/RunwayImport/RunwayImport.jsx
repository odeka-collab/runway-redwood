import { CopySimple, UploadSimple } from '@phosphor-icons/react'

import {
  FieldError,
  Form,
  Label,
  Submit,
  TextAreaField,
} from '@redwoodjs/forms'

import Button from 'src/components/Button/Button'
import useRunway from 'src/hooks/UseRunway'

const COPIED_MESSAGE_TIMEOUT_MSEC = 5000

function RunwayImport({ onCancel, onSubmit }) {
  const ref = React.useRef()

  const [state, setState] = React.useState({
    copyStatus: null,
  })

  const { data } = useRunway()

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

    // Scroll to this module when it renders
    ref.current?.scrollIntoView()
  }, [state, ref])

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
    <div ref={ref} className="absolute left-0 top-0 h-full w-full bg-white">
      <Form
        onSubmit={onSubmit}
        className="flex flex-col gap-4"
        config={{
          defaultValues: { data: JSON.stringify(data, null, 2) },
        }}
      >
        <h2 className="flex items-center gap-2 text-2xl">Save / Load</h2>
        <p>Copy your Runway data to the clipboard, or paste data to load.</p>
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
        <div className="flex flex-col-reverse justify-between gap-2 xs:flex-row">
          <Button
            onClick={(e) => {
              e.preventDefault()
              onCancel()
            }}
          >
            Cancel
          </Button>
          <div className="flex flex-col gap-2 xs:flex-row">
            {state?.copyStatus && <span className="">{state.copyStatus}</span>}
            <Button
              onClick={(e) => {
                e.preventDefault()
                onCopy()
              }}
            >
              <span className="flex items-center justify-center gap-2">
                <CopySimple className="h-4 w-auto" />
                Copy
              </span>
            </Button>
            <Submit className="flex items-center justify-center gap-2 rounded-lg border-4 border-double border-black px-4 py-2 uppercase">
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
