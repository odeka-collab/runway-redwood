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
import useModal from 'src/hooks/UseModal'
import useRunway from 'src/hooks/UseRunway'
import { buildRenderData } from 'src/providers/RunwayProvider'

const VIEWS = {
  WELCOME: 'WELCOME',
  FORM: 'FORM',
  RUNWAY: 'RUNWAY',
}

export const STEPS = {
  WELCOME: {
    name: 'WELCOME',
    view: VIEWS.WELCOME,
    next: 'FUNDS',
  },
  FUNDS: {
    name: 'FUNDS',
    component: function Funds(props) {
      return (
        <>
          <RunwayForm.Funds
            {...props}
            headerText="How much cash do you have?"
            description="Check your couches and piggy banks."
          />
        </>
      )
    },
    submitComponent: NextLabel,
    prev: 'WELCOME',
    next: 'ONE_TIME_CREDITS',
  },
  ONE_TIME_CREDITS: {
    name: 'ONE_TIME_CREDITS',
    component: function OneTimeCredits(props) {
      return (
        <RunwayForm.OneTimeCredits
          {...props}
          headerText="Are you expecting any money?"
          description="Add anything you're pretty sure is coming in. We'll add less sure things later."
        />
      )
    },
    submitComponent: NextLabel,
    prev: 'FUNDS',
    next: 'MONTHLY_CREDITS',
  },
  MONTHLY_CREDITS: {
    name: 'MONTHLY_CREDITS',
    component: function MonthlyCredits(props) {
      return (
        <RunwayForm.MonthlyCredits
          {...props}
          headerText="Do you have any regular monthly earnings?"
          description="Add any income you are expecting each month."
        />
      )
    },
    submitComponent: NextLabel,
    prev: 'ONE_TIME_CREDITS',
    next: 'MONTHLY_DEBITS',
  },
  MONTHLY_DEBITS: {
    name: 'MONTHLY_DEBITS',
    component: function MonthlyDebits(props) {
      return (
        <>
          <RunwayForm.MonthlyDebits
            {...props}
            headerText="How much are you spending each month?"
            description=""
          />
        </>
      )
    },
    submitComponent: NextLabel,
    prev: 'MONTHLY_CREDITS',
    next: 'ONE_TIME_DEBITS',
  },
  ONE_TIME_DEBITS: {
    name: 'ONE_TIME_DEBITS',
    component: function OneTimeDebits(props) {
      return (
        <RunwayForm.OneTimeDebits
          {...props}
          headerText="Do you have any expenses coming up?"
        />
      )
    },
    prev: 'MONTHLY_DEBITS',
    next: 'VIEW_RUNWAY',
  },
  VIEW_RUNWAY: {
    view: VIEWS.RUNWAY,
    next: 'EDIT_RUNWAY',
  },
  EDIT_RUNWAY: {
    name: 'EDIT_RUNWAY',
    component: RunwayForm.AllFields,
    display: 'compact',
    enableScenarios: true,
    next: 'VIEW_RUNWAY',
  },
  SCENARIOS: {
    name: 'SCENARIOS',
    component: RunwayForm.Scenarios,
    display: 'compact',
    prev: 'EDIT_RUNWAY',
    next: 'VIEW_RUNWAY',
  },
}

const DEFAULT_STEP = STEPS.WELCOME

function RunwayWizard() {
  const [step, setStep] = React.useState(DEFAULT_STEP)
  const { open, toggle } = useModal()
  const { data, update } = useRunway()

  async function onClickOnboarding(presetFormData) {
    await update(presetFormData)
    onNext()
  }

  async function onSubmit(formData, options = {}) {
    await update(formData)

    if (options?.save) {
      toggle()
    } else {
      setStep(STEPS[step.next] || step)
    }
  }

  function onBack() {
    setStep(STEPS[step.prev] || step)
  }

  function onNext() {
    setStep(STEPS?.[step.next] || step)
  }

  function onClickScenarios() {
    setStep(STEPS.SCENARIOS)
  }

  async function onCancelImport() {
    toggle()
  }

  async function onImport({ data }) {
    await update(data)
    setStep(STEPS.EDIT_RUNWAY)
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
      <div className="grid grid-flow-col content-stretch">
        <button onClick={() => onClickOnboarding(PRESET_BUSINESS)}>
          I am starting a business
        </button>
        <button onClick={() => onClickOnboarding(PRESET_LAID_OFF)}>
          I was just laid off
        </button>
      </div>
    </>
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

function NextLabel() {
  return (
    <span className="flex items-center justify-center gap-2 rounded-lg border-4 border-double border-black px-4 py-2 uppercase">
      Next
      <ArrowFatRight className="h-4 w-auto" />
    </span>
  )
}

export default RunwayWizard
