import { ArrowFatRight, PencilSimple } from '@phosphor-icons/react'
import { v4 as uuidv4 } from 'uuid'

import Button from 'src/components/Button/Button'
import RunwayForm from 'src/components/RunwayForm/RunwayForm'
import RunwayImport from 'src/components/RunwayImport/RunwayImport'
import RunwayVisualizer from 'src/components/RunwayVisualizer/RunwayVisualizer'
import {
  PRESET_BUSINESS,
  PRESET_LAID_OFF,
} from 'src/components/RunwayWizard/presets'
import {
  DEFAULT_WORKFLOW,
  LAID_OFF_WORKFLOW,
  VIEWS,
} from 'src/components/RunwayWizard/workflows'
import useModal from 'src/hooks/UseModal'
import useRunway from 'src/hooks/UseRunway'
import { buildRenderData } from 'src/providers/RunwayProvider'

const DEFAULT_STEP = DEFAULT_WORKFLOW.WELCOME

function RunwayWizard() {
  const [workflow, setWorkflow] = React.useState(DEFAULT_WORKFLOW)
  const [step, setStep] = React.useState(DEFAULT_STEP)
  const { open, toggle } = useModal()
  const { data, update } = useRunway()

  async function onClickOnboarding(
    presetFormData,
    updatedWorkflow = DEFAULT_WORKFLOW
  ) {
    await update(presetFormData)
    setWorkflow(updatedWorkflow)
    setStep(updatedWorkflow[updatedWorkflow[step.name].next] || step)
  }

  async function onSubmit(formData, options = {}) {
    await update(formData)

    if (options?.save) {
      toggle()
    } else {
      setStep(workflow[step.next] || step)
    }
  }

  function onBack() {
    setStep(workflow[step.prev] || step)
  }

  function onNext() {
    setStep(workflow[step.next] || step)
  }

  function onClickScenarios() {
    setStep(workflow.SCENARIOS)
  }

  async function onCancelImport() {
    toggle()
  }

  async function onImport({ data }) {
    await update(data)
    setStep(workflow.EDIT_RUNWAY || step)
    toggle()
  }

  return (
    <>
      <RunwayWizardView
        key={uuidv4()} // always re-render to sync with <RunwayProvider> data
        data={data}
        step={step}
        onBack={onBack}
        onClickOnboarding={onClickOnboarding}
        onClickScenarios={onClickScenarios}
        onNext={onNext}
        onSubmit={onSubmit}
      />
      {open && <RunwayImport onCancel={onCancelImport} onSubmit={onImport} />}
    </>
  )
}

function RunwayWizardView({
  data,
  step,
  onBack,
  onClickOnboarding,
  onClickScenarios,
  onNext,
  onSubmit,
}) {
  console.log('<RunwayWizardStateMachine>', step)

  switch (step.view) {
    case VIEWS.WELCOME:
      return <Welcome onClickOnboarding={onClickOnboarding} />
    case VIEWS.RUNWAY:
      return (
        <>
          <RunwayView
            {...{
              data: buildRenderData(data),
              onBack,
              onNext,
            }}
          />
          <Details datas={[data, buildRenderData(data)]} />
        </>
      )
    case VIEWS.FORM:
    default:
      return (
        <>
          <FormView
            {...{
              step,
              data,
              onSubmit,
              onBack,
              onClickScenarios,
            }}
          />
          <Details datas={[data]} />
        </>
      )
  }
}

function Welcome({ onClickOnboarding }) {
  return (
    <>
      <h2 className="py-4 text-center text-2xl sm:py-8">Welcome text</h2>
      <p className="text-md pb-4 text-center sm:pb-8">
        Lorem ipsum dolor sit amet
      </p>
      <div className="grid content-stretch gap-4 sm:grid-cols-2">
        <Card onClick={() => onClickOnboarding(PRESET_BUSINESS)}>
          I am starting a business
        </Card>
        <Card
          onClick={() => onClickOnboarding(PRESET_LAID_OFF, LAID_OFF_WORKFLOW)}
        >
          I was just laid off
        </Card>
      </div>
    </>
  )
}

function Card({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="h-64 rounded-3xl border-4 border-double border-black text-xl sm:h-80"
    >
      {children}
    </button>
  )
}

function RunwayView({ data, onNext }) {
  return (
    <>
      <RunwayVisualizer data={data} />
      <div className="flex justify-end">
        <Button onClick={onNext}>
          <span className="flex items-center gap-2">
            <PencilSimple className="h-4 w-auto" />
            Edit Runway
          </span>
        </Button>
      </div>
    </>
  )
}

function FormView({ step, data, onSubmit, onBack, onClickScenarios }) {
  const CurrentStep = step?.component

  return (
    <RunwayForm
      defaultValues={data}
      {...(step.prev && { onBack })}
      {...(step.enableScenarios && { onClickScenarios })}
      {...(step.submitComponent && { submitComponent: step.submitComponent })}
      onSubmit={onSubmit}
      render={CurrentStep}
      display={step.display}
    />
  )
}

function Details({ datas }) {
  return (
    <details className="mt-24 border-2 border-stone-200 p-1.5 text-stone-400">
      <summary>DEVELOPER</summary>
      {datas?.length > 0 && (
        <div className={`grid grid-cols-${datas.length}`}>
          {datas.map((data, i) => (
            <pre
              key={i}
              className="my-2 overflow-x-auto border-2 border-double border-slate-400 bg-slate-800 p-1 text-stone-200"
            >
              {JSON.stringify(data, null, 2)}
            </pre>
          ))}
        </div>
      )}
    </details>
  )
}

export function NextLabel() {
  return (
    <span className="flex items-center justify-center gap-2 rounded-lg border-4 border-double border-black px-4 py-2 uppercase">
      Next
      <ArrowFatRight className="h-4 w-auto" />
    </span>
  )
}

export default RunwayWizard
