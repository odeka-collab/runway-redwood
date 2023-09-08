import { ArrowFatRight, PersonSimpleRun } from '@phosphor-icons/react'
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
  BASE_WORKFLOW,
  WIZARD_WORKFLOW,
  BUSINESS_WORKFLOW,
  LAID_OFF_WORKFLOW,
  VIEWS,
} from 'src/components/RunwayWizard/workflows'
import useModal from 'src/hooks/UseModal'
import useRunway from 'src/hooks/UseRunway'
import { DEFAULT_VALUE, buildRenderData } from 'src/providers/RunwayProvider'

const DEFAULT_STEP = WIZARD_WORKFLOW.WELCOME

function RunwayWizard() {
  const [workflow, setWorkflow] = React.useState(WIZARD_WORKFLOW)
  const [step, setStep] = React.useState(DEFAULT_STEP)
  const { open, toggle } = useModal()
  const { data, update } = useRunway()

  async function onClickOnboarding(
    presetFormData = DEFAULT_VALUE.data,
    updatedWorkflow = WIZARD_WORKFLOW
  ) {
    await update(presetFormData)
    setWorkflow(updatedWorkflow)
    setStep(updatedWorkflow[updatedWorkflow[step.name].next] || step)
  }

  async function onSubmit(formData, options = {}) {
    await update(
      step.next === 'EDIT_RUNWAY' ? aggregateFields(formData) : formData
    )

    if (options?.save) {
      toggle()
    } else {
      setStep(workflow[step.next] || step)
    }
  }

  // WARNING: overwrites monthlyDebits with aggregate rows from monthlyDebits*
  function aggregateFields(formData) {
    if (
      formData.monthlyDebitsFixed?.length > 0 ||
      formData.monthlyDebitsFlexible?.length > 0
    ) {
      formData.monthlyDebits = [
        'monthlyDebitsFixed',
        'monthlyDebitsFlexible',
      ].reduce((acc, field, i, arr) => {
        const rows = formData[field] || []
        delete formData[field]
        // Maintain one pristine row
        return i === arr.length - 1 && !acc.length
          ? [DEFAULT_VALUE.data.monthlyDebits[0]]
          : [...acc, ...rows]
      }, [])
    }
    return { ...formData }
  }

  function onBack() {
    setStep(workflow[step.prev] || step)
  }

  function onClickScenarios() {
    setStep(workflow.SCENARIOS)
  }

  async function onCancelImport() {
    toggle()
  }

  async function onImport({ data }) {
    await update(aggregateFields(data))
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
  onSubmit,
}) {
  switch (step.view) {
    case VIEWS.WELCOME:
      return <Welcome onClickOnboarding={onClickOnboarding} />
    case VIEWS.RUNWAY:
      return (
        <>
          <RunwayVisualizer data={buildRenderData(data)} />
          <FormView
            {...{
              step,
              data,
              onSubmit,
              onBack,
              onClickScenarios,
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
    <div className="flex flex-col gap-4 sm:gap-8">
      <h2 className="text-center text-2xl">Howdy!</h2>
      <p className="text-md text-center">
        Check out a sample financial runway or try it for yourself!
      </p>
      <p className="text-center text-lg">
        Sh*t just got real. No one&apos;s financial future is certain.
        <br />
        <span className="text-sm">
          Look at a few scenarios we&apos;ve already been through.
        </span>
      </p>
      <div className="grid content-stretch gap-4 xs:grid-cols-2 xs:py-8">
        <Card
          onClick={() => onClickOnboarding(PRESET_BUSINESS, BUSINESS_WORKFLOW)}
        >
          Living off the Business with Friends
        </Card>
        <Card
          onClick={() => onClickOnboarding(PRESET_LAID_OFF, LAID_OFF_WORKFLOW)}
        >
          I was just laid off
        </Card>
      </div>
      <div className="flex flex-col-reverse justify-between gap-4 pt-4 sm:flex-row sm:pt-8">
        <Button onClick={() => onClickOnboarding()}>
          <span className="flex items-center justify-center gap-2">
            Try it myself
            <ArrowFatRight />
          </span>
        </Button>
        <Button
          onClick={() => onClickOnboarding(DEFAULT_VALUE.data, BASE_WORKFLOW)}
        >
          <span className="flex items-center justify-center gap-2">
            I know what I&apos;m doing
            <PersonSimpleRun className="h-6 w-auto" />
          </span>
        </Button>
      </div>
    </div>
  )
}

function Card({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="h-48 rounded-3xl border-4 border-double border-black p-1 text-xl sm:h-60"
    >
      {children}
    </button>
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
      {...(step.backLabel && { backLabel: step.backLabel })}
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

export default RunwayWizard
