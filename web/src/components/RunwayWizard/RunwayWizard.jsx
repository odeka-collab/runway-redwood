import {
  ArrowFatLeft,
  ArrowFatRight,
  PencilSimple,
} from '@phosphor-icons/react'
import { v4 as uuidv4 } from 'uuid'

import Button from 'src/components/Button/Button'
import RunwayForm from 'src/components/RunwayForm/RunwayForm'
import RunwayImport from 'src/components/RunwayImport/RunwayImport'
import RunwayVisualizer from 'src/components/RunwayVisualizer/RunwayVisualizer'
import useModal from 'src/hooks/UseModal'
import useRunway from 'src/hooks/UseRunway'
import { buildRenderData } from 'src/providers/RunwayProvider'

const VIEWS = {
  FORM: 'FORM',
  RUNWAY: 'RUNWAY',
}

const STEPS = {
  FUNDS_AND_MONTHLY_DEBITS: {
    name: 'FUNDS_AND_MONTHLY_DEBITS',
    component: function FundsAndMonthlyDebits(props) {
      return (
        <>
          <RunwayForm.Funds
            {...props}
            headerText="How much cash do you have?"
          />
          <RunwayForm.MonthlyDebits
            {...props}
            headerText="How much are you spending each month?"
          />
        </>
      )
    },
    next: 'MONTHLY_CREDITS',
  },
  MONTHLY_CREDITS: {
    name: 'MONTHLY_CREDITS',
    component: function MonthlyCredits(props) {
      return (
        <RunwayForm.MonthlyCredits
          {...props}
          headerText="How much are you earning each month?"
        />
      )
    },
    prev: 'FUNDS_AND_MONTHLY_DEBITS',
    next: 'ONE_TIME_CREDITS',
  },
  ONE_TIME_CREDITS: {
    name: 'ONE_TIME_CREDITS',
    component: function OneTimeCredits(props) {
      return (
        <RunwayForm.OneTimeCredits
          {...props}
          headerText="Are you expecting any money?"
        />
      )
    },
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
    prev: 'ONE_TIME_CREDITS',
    next: 'EDIT_RUNWAY',
  },
  EDIT_RUNWAY: {
    name: 'EDIT_RUNWAY',
    component: RunwayForm.AllFields,
    display: 'compact',
    enableScenarios: true,
  },
  SCENARIOS: {
    name: 'SCENARIOS',
    component: RunwayForm.Scenarios,
    display: 'compact',
    prev: 'EDIT_RUNWAY',
    next: 'EDIT_RUNWAY',
  },
}

const DEFAULT_STEP = STEPS.FUNDS_AND_MONTHLY_DEBITS

function RunwayWizard() {
  const { open } = useModal()

  return (
    <>
      <RunwayWizardStateMachine
        // always re-render to sync with <RunwayProvider> data
        key={uuidv4()}
      />
      {open && <RunwayImport />}
    </>
  )
}

function RunwayWizardStateMachine() {
  const { toggle } = useModal()

  const { update, data } = useRunway()

  const [state, setState] = React.useState({
    view: 'FORM',
    step: getInitialStepBasedOnData(data),
  })

  async function onSubmit(formData, options = {}) {
    await update(formData)

    if (options?.save) {
      toggle()
    } else {
      setState({ ...state, view: VIEWS.RUNWAY })
    }
  }

  function onBack() {
    setState({
      ...state,
      view: VIEWS.FORM,
      step:
        state.view === VIEWS.RUNWAY
          ? state.step
          : STEPS[state.step.prev] || state.step,
    })
  }

  function onNext() {
    setState({
      ...state,
      view: VIEWS.FORM,
      step: STEPS[state.step.next] || state.step,
    })
  }

  function onClickScenarios() {
    setState({
      ...state,
      view: VIEWS.FORM,
      step: STEPS.SCENARIOS,
    })
  }

  switch (state.view) {
    case VIEWS.RUNWAY:
      return (
        <>
          <RunwayView
            {...{
              data: buildRenderData(data),
              onBack,
              onNext,
              stepName: state.step.name,
            }}
          />
          <Details datas={[data, buildRenderData(data)]} />
        </>
      )
    case VIEWS.FORM:
      return (
        <>
          <FormView
            {...{
              step: state.step,
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

function RunwayView({ stepName, data, onBack, onNext }) {
  return (
    <>
      <RunwayVisualizer data={data} />
      {stepName === 'EDIT_RUNWAY' ? (
        <div className="flex justify-end">
          <Button onClick={onBack}>
            <span className="flex items-center gap-2">
              <PencilSimple className="h-4 w-auto" />
              Edit
            </span>
          </Button>
        </div>
      ) : (
        <div className="flex justify-between gap-2">
          <Button onClick={onBack}>
            <span className="flex items-center gap-2">
              <ArrowFatLeft className="h-4 w-auto" />
              Back
            </span>
          </Button>
          <Button onClick={onNext}>
            <span className="flex items-center gap-2">
              Next
              <ArrowFatRight className="h-4 w-auto" />
            </span>
          </Button>
        </div>
      )}
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

function getInitialStepBasedOnData(data) {
  switch (true) {
    case data?.funds?.[0]?.amount > 0:
    case data?.monthlyDebits?.[0]?.amount > 0:
    case data?.monthlyCredits?.[0]?.amount > 0:
    case data?.oneTimeCredits?.[0]?.amount > 0:
    case data?.oneTimeDebits?.[0]?.amount > 0:
      return STEPS.EDIT_RUNWAY
    default:
      return DEFAULT_STEP
  }
}

export default RunwayWizard
